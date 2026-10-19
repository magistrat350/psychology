// Prüft alle in der App verlinkten URLs: `npm run check-links`
// Optionen:
//   --no-search        Suchlinks (YouTube-/Google-/Katalogsuche) überspringen
//   --only=<text>      nur URLs prüfen, die <text> enthalten
//   --timeout=<ms>     Zeitlimit pro Anfrage (Standard 15000)
//   --concurrency=<n>  parallele Anfragen (Standard 6, höchstens 2 pro Host)
//   --strict           Exitcode 1, wenn defekte Links gefunden werden (z. B. für CI)
//   --no-write         nur Konsolenausgabe, keine Dateien schreiben
//   --keep-unchanged   data/link-status.js nur neu schreiben, wenn sich ein Befund geändert hat (für den wöchentlichen Lauf)
// Ergebnisse: reports/link-report.md, reports/link-report.json, reports/link-issue.md (Text für das GitHub-Issue)
// und data/link-status.js (zeigt Befunde in der App).
// DOI-Links werden über die DOI-Registrierung geprüft (doi.org/api/handles/…), nicht über die Verlagsseite,
// weil Verlage automatische Abfragen meist abweisen.
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

/** DOI-Links → Abfrage der DOI-Registrierung; sonst null. */
export function doiApiUrl(url) {
  const m = String(url).match(/^https:\/\/(?:dx\.)?doi\.org\/(10\.\d{4,9}\/\S+)$/i);
  return m ? "https://doi.org/api/handles/" + m[1] : null;
}

/** Prüft eine URL (HEAD, bei Ablehnung GET). */
export async function checkUrl(url, { timeout = 15000 } = {}) {
  const out = { url };
  const doiApi = doiApiUrl(url);
  if (doiApi) {
    try {
      const r = await request(doiApi, "GET", timeout);
      out.code = r.code; out.finalUrl = url;
      if (r.code === 200) return Object.assign(out, { status: "ok", detail: "DOI registriert" });
      if (r.code === 404) return Object.assign(out, { status: "defekt", detail: "DOI nicht registriert" });
    } catch (e) { out.error = e.name === "AbortError" ? `Zeitüberschreitung nach ${timeout} ms` : (e.cause && (e.cause.code || e.cause.message)) || e.message; }
    return Object.assign(out, classify(out));
  }
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

/** Gleiche URLs mit gleichem Befund? (Zeitstempel und Details zählen nicht) */
export function sameStatus(a, b) {
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every((u) => b[u] && b[u].status === a[u].status);
}

/** Text für das GitHub-Issue: defekte Links vollständig, unklare eingeklappt (GitHub erlaubt höchstens 65 536 Zeichen). */
export function issueMarkdown({ checkedAt, summary, results }, runUrl = process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : "") {
  const row = ([u, v]) => `| ${v.title.replace(/\|/g, "/").slice(0, 90)} | ${u} | ${v.where.join("; ").slice(0, 120)} | ${(v.detail || "").slice(0, 80)} |`;
  const list = (st, max) => { const e = Object.entries(results).filter(([, v]) => v.status === st); return { n: e.length, md: e.slice(0, max).map(row).join("\n") + (e.length > max ? `\n| … und ${e.length - max} weitere (siehe Bericht) | | | |` : "") }; };
  const bad = list("defekt", 200), unclear = list("unklar", 150);
  return `Automatische Linkprüfung vom ${checkedAt.slice(0, 10)}: ${summary.total} URLs – **${summary.ok} erreichbar**, **${summary.defekt} defekt**, ${summary.unklar} unklar.\n\n` +
    `## Defekte Links (${bad.n})\n\n| Titel | URL | Fundort | Befund |\n|---|---|---|---|\n${bad.md || "| – | | | |"}\n\n` +
    `<details><summary>Unklare Links (${unclear.n}) – Server blockiert automatische Abfragen o. Ä., im Browser prüfen</summary>\n\n| Titel | URL | Fundort | Befund |\n|---|---|---|---|\n${unclear.md || "| – | | | |"}\n\n</details>\n\n` +
    `Defekte Links in \`data/modules/*.js\` bzw. \`data/sources.js\` korrigieren. Dieses Issue wird bei jeder Prüfung aktualisiert und geschlossen, sobald keine defekten Links mehr gefunden werden.` +
    (runUrl ? `\n\nBericht und Rohdaten: ${runUrl}` : "") + "\n";
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
    fs.writeFileSync(path.join(ROOT, "reports/link-issue.md"), issueMarkdown({ checkedAt, summary, results: resMap }));
    const prev = PP.linkStatus && PP.linkStatus.results;
    const same = prev && sameStatus(prev, resMap);
    if (flag("keep-unchanged") && same) console.log("Befunde unverändert – data/link-status.js bleibt.");
    else fs.writeFileSync(path.join(ROOT, "data/link-status.js"), `/* Ergebnisse der Linkprüfung – erzeugt von tools/check-links.mjs am ${checkedAt}. */\nPP.linkStatus = ${JSON.stringify({ checkedAt, summary, results: resMap })};\n`);
    console.log("Geschrieben: reports/link-report.md, reports/link-report.json, reports/link-issue.md" + (flag("keep-unchanged") && same ? "" : ", data/link-status.js"));
  }
  if (flag("strict") && summary.defekt > 0) process.exit(1);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
