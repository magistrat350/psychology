// Testet die gebaute Artifact-Version mit simulierten Viewer-Schnittstellen (claude.use: db, downloads).
// Voraussetzung: npm run build. Aufruf: node tests/artifact.mjs
import fs from "fs";
import path from "path";
import { ROOT } from "../tools/lib/load-data.mjs";
import { loadPlaywright } from "../tools/lib/playwright.mjs";

const file = path.join(ROOT, "dist/artifact.html");
if (!fs.existsSync(file)) { console.error("dist/artifact.html fehlt – zuerst `npm run build`."); process.exit(2); }
const mock = `<script>
  window.__db = { docs: {}, writes: 0 }; window.__saves = [];
  const ref = (p) => ({ id: p.split("/").pop(), path: p,
    get: async () => ({ id: p.split("/").pop(), exists: p in __db.docs, data: () => __db.docs[p] }),
    set: async (d) => { __db.writes++; __db.docs[p] = JSON.parse(JSON.stringify(d)); },
    delete: async () => { delete __db.docs[p]; } });
  const col = (c) => ({ doc: (id) => ref(c + "/" + id),
    get: async () => { const docs = Object.keys(__db.docs).filter((k) => k.startsWith(c + "/") && k.split("/").length === 2).map((k) => ({ id: k.split("/")[1], exists: true, data: () => __db.docs[k] })); return { docs, size: docs.length, empty: !docs.length }; } });
  __db.docs["reports/r-alt"] = { id: "r-alt", created: "2026-10-01T10:00:00Z", kind: "Quizfrage", mod: "A1", text: "Meldung von einem anderen Gerät", category: "Tippfehler", comment: "alt", status: "offen" };
  window.claude = { use: async (n) => n === "db" ? { doc: ref, collection: col } : n === "downloads" ? { save: async (o) => { __saves.push(o.filename); return { status: "saved" }; } } : null };
</script>`;
const html = `<!doctype html><html><head><meta charset="utf-8"></head><body>${mock}${fs.readFileSync(file, "utf8")}</body></html>`;
const tmp = path.join(ROOT, "dist/artifact-test.html");
fs.writeFileSync(tmp, html);

const pw = loadPlaywright();
const browser = await pw.chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page.goto("file://" + tmp + "#/pruefmodus/meldungen");
await page.waitForTimeout(300);
if (!(await page.textContent("#app")).includes("Meldung von einem anderen Gerät")) errors.push("Meldungen aus der Datenbank werden nicht geladen");
await page.evaluate(() => { location.hash = "#/modul/A2/quiz"; });
await page.click(".report-btn");
await page.fill("#repComment", "Artifact-Test");
await page.click('[data-repsave="1"]');
await page.waitForTimeout(200);
const reports = await page.evaluate(() => Object.keys(__db.docs).filter((k) => k.startsWith("reports/")).length);
if (reports !== 2) errors.push(`Meldung nicht in Datenbank geschrieben (${reports})`);
await page.evaluate(() => { location.hash = "#/pruefmodus/curriculum"; });
await page.click('.verify-row [data-v="diff"]');
await page.waitForTimeout(1500);
const verify = await page.evaluate(() => __db.docs["verify/checklist"]);
if (!verify || !Object.values(verify.items).some((v) => v.s === "diff")) errors.push("Checkliste nicht in Datenbank geschrieben");
await page.evaluate(() => { location.hash = "#/pruefmodus/inhalte/B1"; });
await page.fill("#reviewer", "AB"); await page.waitForTimeout(450);
await page.click('[data-rset][data-r="ok"]');
await page.waitForTimeout(1500);
const marks = await page.evaluate(() => __db.docs["review/marks"]);
if (!marks || !Object.values(marks.items).some((v) => v.s === "ok" && v.by === "AB")) errors.push("Prüfvermerke nicht in Datenbank geschrieben");
await page.evaluate(() => { location.hash = "#/anki"; });
await page.click('[data-anki="save"]');
await page.evaluate(() => { location.hash = "#/datensaetze"; });
await page.click('[data-dssave="therapie"]');
await page.waitForTimeout(200);
const saves = await page.evaluate(() => __saves);
if (!saves.includes("psychopfad-wien-anki.txt") || !saves.includes("therapie.csv")) errors.push(`Downloads nicht über Viewer-Schnittstelle: ${saves}`);
if (await page.evaluate(() => navigator.serviceWorker && navigator.serviceWorker.controller)) errors.push("Service Worker darf in der Artifact-Version nicht laufen");
// Offline-Einzeldatei (dist/psychopfad-wien.html) ohne Viewer-Schnittstellen
const p2 = await browser.newPage();
p2.on("pageerror", (e) => errors.push("Einzeldatei: " + e.message));
await p2.goto("file://" + path.join(ROOT, "dist/psychopfad-wien.html") + "#/rechentrainer/anova/5");
if ((await p2.textContent("#app")).length < 200) errors.push("Einzeldatei rendert nicht");
await browser.close();
fs.unlinkSync(tmp);
if (errors.length) { console.error("FEHLER:\n" + errors.join("\n")); process.exit(1); }
console.log("  ✓ Datenbank-Sync (Meldungen, Checkliste, Prüfvermerke) und Downloads über Viewer-Schnittstelle\n  ✓ Offline-Einzeldatei rendert\nOK – Build-Ausgaben funktionieren.");
