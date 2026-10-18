// Browser-Test: rendert alle Routen in Chromium, spielt die wichtigsten Abläufe durch und meldet JS-Fehler.
// Aufruf: npm run test:e2e   (optional: node tests/smoke.mjs <screenshot-ordner>)
import path from "path";
import { pathToFileURL } from "url";
import { ROOT } from "../tools/lib/load-data.mjs";
import { loadPlaywright } from "../tools/lib/playwright.mjs";

const pw = loadPlaywright();
const shotDir = process.argv[2];
const root = pathToFileURL(path.join(ROOT, "index.html")).href;
const browser = await pw.chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
const step = (msg) => console.log("  ✓ " + msg);
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
const go = async (h) => { await page.evaluate((x) => { location.hash = x; }, h); await page.waitForTimeout(15); };
const state = () => page.evaluate(() => JSON.parse(JSON.stringify(window.PPApp.state)));

await page.goto(root);
const { ids, gens } = await page.evaluate(() => ({ ids: PP.modules.map((m) => m.id), gens: PPTrainer.generators.map((g) => g.id) }));

// 1) Alle Routen
const tabs = ["ueberblick", "wissen", "lernpfad", "materialien", "vorlesungen", "literatur", "karten", "quiz", "pruefung", "rechnen", "notizen"];
const routes = ["#/", "#/plan", "#/wiederholen", "#/mischquiz", "#/rechentrainer", "#/datensaetze", "#/anki", "#/pruefmodus/curriculum", "#/pruefmodus/meldungen", "#/pruefmodus/links",
  "#/bibliothek", "#/ressourcen", "#/karriere", "#/glossar", "#/fortschritt", "#/einstellungen", "#/suche/Bindung", "#/suche/t-Test"];
for (const id of ids) for (const t of tabs) routes.push(`#/modul/${id}/${t}`);
for (const g of gens) routes.push(`#/rechentrainer/${g}/7`);
for (const r of routes) {
  await go(r);
  const len = await page.evaluate(() => document.getElementById("app").innerText.length);
  if (len < 50) errors.push(`Route ${r} fast leer`);
}
step(`${routes.length} Routen gerendert`);

// 2) Modul-Quiz komplett: falsche Antworten landen in der Wiederholung
await go(`#/modul/A1/quiz`);
for (;;) { const b = await page.$("button.opt:not([disabled])"); if (!b) break; await b.click(); }
if (!(await page.$(".score-big"))) errors.push("Quiz-Ergebnis fehlt");
let st = await state();
const wrongInSrs = Object.keys(st.srs).filter((k) => k.startsWith("q:A1:")).length;
if (!st.quiz.A1) errors.push("Quiz-Ergebnis nicht gespeichert");
step(`Modul-Quiz beendet, ${wrongInSrs} falsche Antworten in der Wiederholung`);

// 3) Prüfungssimulation mit Bestätigung im Seiteninhalt
await go(`#/modul/A2/pruefung`);
await page.click('[data-exam="start"]');
await page.click('[data-exam="submit"]'); await page.click('[data-exam="submit"]');
if (!(await page.$(".score-big"))) errors.push("Prüfungsergebnis fehlt");
step("Prüfungssimulation abgegeben");

// 4) Fehler melden
await go(`#/modul/B1/quiz`);
await page.click(".report-btn");
await page.fill("#repComment", "Testmeldung: Antwort C wäre laut Lehrbuch ebenfalls richtig.");
await page.click('[data-repsave="1"]');
st = await state();
if (Object.keys(st.reports).length !== 1) errors.push("Fehlermeldung nicht gespeichert");
await go("#/pruefmodus/meldungen");
if (!(await page.textContent("#app")).includes("Testmeldung")) errors.push("Meldung nicht im Prüfmodus sichtbar");
if (!(await page.$('a[href^="https://github.com/"]'))) errors.push("GitHub-Issue-Link fehlt");
step("Fehlermeldung gespeichert und im Prüfmodus sichtbar");

// 5) Curriculum-Checkliste
await go("#/pruefmodus/curriculum");
const nItems = await page.$$eval(".verify-row", (r) => r.length);
await page.click('.verify-row [data-v="ok"]');
await page.click('.verify-row:nth-of-type(2) [data-v="diff"]');
await page.fill('.verify-row:nth-of-type(2) input', "Laut Curriculum S. 3: 6 Semester");
await page.waitForTimeout(600);
st = await state();
const vals = Object.values(st.verify);
if (!vals.some((v) => v.s === "ok") || !vals.some((v) => v.s === "diff" && v.note.includes("S. 3"))) errors.push("Checkliste speichert nicht");
step(`Checkliste mit ${nItems} Punkten bedienbar`);

// 6) Rechentrainer: richtige Werte werden akzeptiert, falsche markiert, Lösungsweg sichtbar
for (const g of ["ttest_ind", "alpha", "bayes"]) {
  await go(`#/rechentrainer/${g}/42`);
  const answers = await page.evaluate(() => window.PPApp.trainer.task.answers.map((a) => ({ key: a.key, type: a.type, val: a.type === "choice" ? a.value : PPTrainer.display(a) })));
  for (const a of answers) { if (a.type === "choice") await page.selectOption(`#tr-${a.key}`, a.val); else await page.fill(`#tr-${a.key}`, a.val); }
  await page.click('#trainerForm button[type="submit"]');
  const ok = await page.$$eval(".answer.is-ok", (x) => x.length);
  if (ok !== answers.length) errors.push(`Rechentrainer ${g}: ${ok}/${answers.length} als richtig erkannt`);
}
await page.fill(`#tr-${(await page.evaluate(() => window.PPApp.trainer.task.answers[0].key))}`, "99999");
await page.click('#trainerForm button[type="submit"]');
if (!(await page.$(".answer.is-bad"))) errors.push("Rechentrainer markiert falsche Eingabe nicht");
await page.click('[data-trainer="solution"]');
if (!(await page.$(".solution ol li"))) errors.push("Lösungsweg fehlt");
await page.click('[data-trainer="new"]'); await page.waitForTimeout(30);
if (!/#\/rechentrainer\/bayes\/\d+/.test(page.url()) || page.url().endsWith("/42")) errors.push("Neue Aufgabe erzeugt keine neue Nummer");
step("Rechentrainer prüft Eingaben und zeigt Lösungsweg");

// 7) Wiederholungsrunde
await go("#/wiederholen");
await page.click('[data-rev="start"]');
for (let i = 0; i < 12; i++) {
  if (await page.$('[data-rev="flip"]')) { await page.click('[data-rev="flip"]'); await page.click('[data-rev="1"]'); }
  else if (await page.$("button.opt:not([disabled])")) { await page.click("button.opt:not([disabled])"); await page.click('[data-rev="next"]'); }
  else break;
}
const rv = await page.evaluate(() => window.PPApp.review);
if (!rv || rv.done < 5) errors.push(`Wiederholung: nur ${rv && rv.done} Elemente bearbeitet`);
st = await state();
if (st.srsCfg.introduced.count < 1) errors.push("Neue Karten werden nicht gezählt");
step(`Wiederholungsrunde: ${rv.done} Elemente bewertet`);

// 8) Karteikarten im Modul
await go("#/modul/C3/karten");
await page.click("#flash"); await page.click('[data-cardgrade="1"]');
if (!Object.keys((await state()).srs).some((k) => k.startsWith("g:C3:"))) errors.push("Karteikarte nicht in Wiederholung gespeichert");
step("Karteikarte bewertet");

// 9) Mischquiz
await go("#/mischquiz");
await page.click('[data-mixpreset="Methoden"]');
await page.selectOption("#mixN", "10");
await page.click('[data-mix="start"]');
for (;;) { const b = await page.$("button.opt:not([disabled])"); if (!b) break; await b.click(); }
const mixText = await page.textContent("#app");
if (!mixText.includes("Ergebnis") || !(await page.$$eval("[data-mixq]", (x) => x.length))) errors.push("Mischquiz-Ergebnis fehlt");
if (!(await state()).mix.length) errors.push("Mischquiz nicht gespeichert");
step("Mischquiz mit 10 Fragen aus D1/D2/E1/E2");

// 10) Downloads: Anki-Export und Datensatz
await go("#/anki");
let [dl] = await Promise.all([page.waitForEvent("download"), page.click('[data-anki="save"]')]);
const ankiPath = await dl.path();
const anki = (await import("fs")).readFileSync(ankiPath, "utf8");
if (!anki.startsWith("#separator:tab") || anki.split("\n").length < 500) errors.push("Anki-Export unvollständig");
await go("#/datensaetze");
[dl] = await Promise.all([page.waitForEvent("download"), page.click('[data-dssave="lernstudie"]')]);
if (dl.suggestedFilename() !== "lernstudie.csv") errors.push("CSV-Download falsch benannt");
step(`Anki-Export (${anki.split("\n").length - 5} Karten) und CSV-Download`);

// 11) Fortschritt exportieren und wieder importieren
await go("#/fortschritt");
[dl] = await Promise.all([page.waitForEvent("download"), page.click('[data-act="export"]')]);
const json = (await import("fs")).readFileSync(await dl.path(), "utf8");
await page.fill("#importText", json);
await page.click('[data-act="importText"]');
if (Object.keys((await state()).reports).length !== 1) errors.push("Import stellt Zustand nicht wieder her");
step("Fortschritt exportiert und importiert");

if (shotDir) {
  for (const [r, n] of [["#/", "home"], ["#/wiederholen", "wiederholen"], ["#/rechentrainer/ttest_ind/42", "trainer"], ["#/datensaetze", "datensaetze"], ["#/pruefmodus/curriculum", "pruefmodus"], ["#/anki", "anki"]]) {
    await go(r); await page.waitForTimeout(80);
    await page.screenshot({ path: `${shotDir}/${n}.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await go("#/rechentrainer/anova/3"); await page.waitForTimeout(300);
  await page.screenshot({ path: `${shotDir}/mobile-trainer.png` });
}
await browser.close();
if (errors.length) { console.error("FEHLER:\n" + [...new Set(errors)].join("\n")); process.exit(1); }
console.log("OK – Browser-Test ohne Fehler.");
