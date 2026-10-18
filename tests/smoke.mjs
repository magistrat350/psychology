// Rendert alle Routen in Chromium und meldet JS-Fehler. Aufruf: node tests/smoke.mjs [screenshot-dir]
import { createRequire } from "module";
import path from "path";
import { pathToFileURL } from "url";
const require = createRequire(import.meta.url);
let pw;
try { pw = require("playwright"); } catch { pw = require(path.join(process.execPath, "../../lib/node_modules/playwright")); }
const shotDir = process.argv[2];
const root = pathToFileURL(path.resolve("index.html")).href;
const browser = await pw.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
await page.goto(root);
const ids = await page.evaluate(() => PP.modules.map((m) => m.id));
const tabs = ["ueberblick", "wissen", "lernpfad", "materialien", "vorlesungen", "literatur", "karten", "quiz", "pruefung", "notizen"];
const routes = ["#/", "#/plan", "#/bibliothek", "#/ressourcen", "#/karriere", "#/glossar", "#/fortschritt", "#/einstellungen", "#/suche/Bindung"];
for (const id of ids) for (const t of tabs) routes.push(`#/modul/${id}/${t}`);
for (const r of routes) {
  await page.evaluate((h) => { location.hash = h; }, r);
  await page.waitForTimeout(15);
  const len = await page.evaluate(() => document.getElementById("app").innerText.length);
  if (len < 50) errors.push(`Route ${r} fast leer`);
}
// Quiz komplett durchklicken und Prüfung durchlaufen (erstes Modul mit Quiz)
await page.evaluate((h) => { location.hash = h; }, `#/modul/${ids[1]}/quiz`);
await page.waitForTimeout(30);
for (;;) { const b = await page.$("button.opt:not([disabled])"); if (!b) break; await b.click(); }
const quizRes = await page.evaluate(() => document.querySelector(".score-big")?.innerText);
if (!quizRes) errors.push("Quiz-Ergebnis fehlt");
await page.evaluate((h) => { location.hash = h; }, `#/modul/${ids[1]}/pruefung`);
await page.waitForTimeout(30);
await page.click('[data-exam="start"]');
page.on("dialog", (d) => d.accept());
await page.click('[data-exam="submit"]');
const exRes = await page.evaluate(() => document.querySelector(".score-big")?.innerText);
if (!exRes) errors.push("Prüfungsergebnis fehlt");
if (shotDir) {
  for (const [r, n] of [["#/", "home"], [`#/modul/${ids[1]}/lernpfad`, "lernpfad"], [`#/modul/${ids[1]}/literatur`, "literatur"], [`#/modul/${ids[1]}/quiz`, "quiz"]]) {
    await page.evaluate((h) => { location.hash = h; }, r); await page.waitForTimeout(50);
    await page.screenshot({ path: `${shotDir}/${n}.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => { location.hash = "#/"; }); await page.waitForTimeout(50);
  await page.screenshot({ path: `${shotDir}/mobile.png` });
}
await browser.close();
console.log(`${routes.length} Routen geprüft, Quiz: ${quizRes}, Prüfung: ${exRes}`);
if (errors.length) { console.error("FEHLER:\n" + [...new Set(errors)].join("\n")); process.exit(1); }
console.log("OK – keine JS-Fehler.");
