// Prüft alle in der App verlinkten URLs: `npm run check-links`
// Optionen:
//   --no-search        Suchlinks (YouTube-/Google-/Katalogsuche) überspringen
//   --only=<text>      nur URLs prüfen, die <text> enthalten
//   --timeout=<ms>     Zeitlimit pro Anfrage (Standard 15000)
//   --concurrency=<n>  parallele Anfragen (Standard 6, höchstens 2 pro Host)
//   --strict           Exitcode 1, wenn defekte Links gefunden werden (z. B. für CI)
//   --no-write         nur Konsolenausgabe, keine Dateien schreiben
// Ergebnisse: reports/link-report.md, reports/link-report.json und data/link-status.js (zeigt Befunde in der App).
import fs from "fs";
import path from "path";
import { ROOT, loadData, collectLinks, isSearchUrl } from "./lib/load-data.mjs";

const UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 PsychoPfad-Linkcheck";

/** Bewertet ein Prüfergebnis: ok | defekt | unklar */
export function classify(r) {
  if (r.error) {
    if (/ENOTFOUND|EAI_AGAIN|ECONNREFUSED|CERT|certificate|ERR_TLS/i.test(r.error)) return { status: "defekt", detail: r.error };
    return { status: "unklar", detail: r.error };
  }
  const c = r.code;
  if (c >= 200 && c < 300) {
    if (r.homeRedirect) return { status: "unklar", detail: `weitergeleitet auf Startseite (${r.finalUrl})` };
    return { status: "ok", detail: r.finalUrl !== r.url ? `→ ${r.finalUrl}` : "" };
  }
  if (c === 404 || c === 410) return { status: "defekt", detail: `HTTP ${c}` };
  if (c === 401 || c === 403 || c === 429 || c === 999 || c >= 500) return { status: "unklar", detail: `HTTP ${c} (Seite blockiert automatische Abfragen oder ist überlastet – im Browser prüfen)` };
  return { status: "unklar", detail: `HTTP ${c}` };
}

async function request(url, method, timeout) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);
  try {
    const res = await fetch(url, { method, redirect: "follow", signal: ctrl.signal, headers: { "User-Agent": UA, "Accept": "text/html,application/xhtml+xml,application/pdf;q=0.9,*/*;q=0.8", "Accept-Language": "de-AT,de;q=0.9,en;q=0.8" } });
    if (method === "GET" && res.body) { try { await res.body.cancel(); } catch (e) { /* egal */ } }
    return { code: res.status, finalUrl: res.url || url };
  } finally { clearTimeout(timer); }
}

/** Prüft eine URL (HEAD, bei Ablehnung GET). */
export async function checkUrl(url, { timeout = 15000 } = {}) {
  const out = { url };
  try {
    let r = await request(url, "HEAD", timeout);
    if ([403, 404, 405, 429, 500, 501, 503].includes(r.code)) r = await request(url, "GET", timeout);
    out.code = r.code; out.finalUrl = r.finalUrl;
    const a = new URL(url), b = new URL(r.finalUrl);
    out.homeRedirect = a.pathname.length > 1 && (b.pathname === "/" || b.pathname === "") && a.host.replace(/^www\./, "") === b.host.replace(/^www\./, "");
  } catch (e) {
    out.error = e.name === "AbortError" ? `Zeitüberschreitung nach ${timeout} ms` : (e.cause && (e.cause.code || e.cause.message)) || e.message;
  }
  return Object.assign(out, classify(out));
}

/** Prüft viele URLs parallel, höchstens `perHost` gleichzeitig pro Host. */
export async function checkAll(urls, { concurrency = 6, perHost = 2, timeout = 15000, onResult } = {}) {
  const queue = urls.slice(), active = new Map(), results = [];
  async function worker() {
    while (queue.length) {
      const i = queue.findIndex((u) => (active.get(new URL(u).host) || 0) < perHost);
      if (i < 0) { await new Promise((r) => setTimeout(r, 50)); continue; }
      const url = queue.splice(i, 1)[0], host = new URL(url).host;
      active.set(host, (active.get(host) || 0) + 1);
      const r = await checkUrl(url, { timeout });
      active.set(host, active.get(host) - 1);
      results.push(r); if (onResult) onResult(r, results.length);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, urls.length) }, worker));
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  const opt = (n, d) => { const a = args.find((x) => x.startsWith(`--${n}=`)); return a ? a.split("=").slice(1).join("=") : d; };
  const flag = (n) => args.includes(`--${n}`);
  const PP = loadData();
  let links = collectLinks(PP);
  if (flag("no-search")) links = links.filter((l) => !isSearchUrl(l.url));
  if (opt("only")) links = links.filter((l) => l.url.includes(opt("only")));
  const byUrl = new Map();
  links.forEach((l) => { const e = byUrl.get(l.url) || { title: l.title, where: [] }; e.where.push(l.where); byUrl.set(l.url, e); });
  const urls = [...byUrl.keys()];
  if (typeof fetch !== "function") { console.error("Node.js 18 oder neuer wird benötigt."); process.exit(2); }
  console.log(`Prüfe ${urls.length} verschiedene URLs (${links.length} Fundstellen) …`);
  const results = await checkAll(urls, {
    concurrency: +opt("concurrency", 6), timeout: +opt("timeout", 15000),
    onResult: (r, n) => { if (r.status !== "ok") console.log(`[${n}/${urls.length}] ${r.status.toUpperCase().padEnd(6)} ${r.url}  ${r.detail}`); else if (n % 25 === 0) console.log(`[${n}/${urls.length}] …`); }
  });
  const summary = { total: results.length, ok: 0, defekt: 0, unklar: 0 };
  results.forEach((r) => { summary[r.status]++; });
  const checkedAt = new Date().toISOString();
  const resMap = {};
  results.sort((a, b) => a.url.localeCompare(b.url)).forEach((r) => { const e = byUrl.get(r.url); resMap[r.url] = { status: r.status, code: r.code || null, detail: r.detail, title: e.title, where: e.where, search: isSearchUrl(r.url) }; });
  console.log(`\nErgebnis: ${summary.ok} erreichbar · ${summary.defekt} defekt · ${summary.unklar} unklar`);
  if (!flag("no-write")) {
    fs.mkdirSync(path.join(ROOT, "reports"), { recursive: true });
    fs.writeFileSync(path.join(ROOT, "reports/link-report.json"), JSON.stringify({ checkedAt, summary, results: resMap }, null, 2));
    const rows = (st) => Object.entries(resMap).filter(([, v]) => v.status === st).map(([u, v]) => `| [${v.title.replace(/\|/g, "/")}](${u}) | ${v.where.join("; ")} | ${v.detail || ""} |`).join("\n");
    const md = `# Linkprüfung PsychoPfad Wien\n\nGeprüft am ${checkedAt.slice(0, 16).replace("T", " ")} – ${summary.total} URLs: **${summary.ok} erreichbar**, **${summary.defekt} defekt**, **${summary.unklar} unklar**.\n\n` +
      `## Defekt\n\n| Link | Fundort | Befund |\n|---|---|---|\n${rows("defekt") || "| – | | |"}\n\n## Manuell prüfen\n\n| Link | Fundort | Befund |\n|---|---|---|\n${rows("unklar") || "| – | | |"}\n`;
    fs.writeFileSync(path.join(ROOT, "reports/link-report.md"), md);
    fs.writeFileSync(path.join(ROOT, "data/link-status.js"), `/* Ergebnisse der Linkprüfung – erzeugt von tools/check-links.mjs am ${checkedAt}. */\nPP.linkStatus = ${JSON.stringify({ checkedAt, summary, results: resMap })};\n`);
    console.log("Geschrieben: reports/link-report.md, reports/link-report.json, data/link-status.js");
  }
  if (flag("strict") && summary.defekt > 0) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
