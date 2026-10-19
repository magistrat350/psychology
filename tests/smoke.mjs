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
const tabs = ["ueberblick", "wissen", "lernpfad", "materialien", "vorlesungen", "podcasts", "literatur", "karten", "quiz", "pruefung", "rechnen", "notizen"];
const routes = ["#/", "#/plan", "#/wiederholen", "#/verlauf", "#/podcasts", "#/mischquiz", "#/rechentrainer", "#/datensaetze", "#/anki", "#/pruefmodus/curriculum", "#/pruefmodus/inhalte", "#/pruefmodus/meldungen", "#/pruefmodus/links",
  "#/bibliothek", "#/ressourcen", "#/karriere", "#/glossar", "#/fortschritt", "#/einstellungen", "#/suche/Bindung", "#/suche/t-Test"];
for (const id of ids) for (const t of tabs) routes.push(`#/modul/${id}/${t}`);
for (const g of gens) routes.push(`#/rechentrainer/${g}/7`);
for (const id of ids) routes.push(`#/pruefmodus/inhalte/${id}`);
for (const r of routes) {
  await go(r);
  const len = await page.evaluate(() => document.getElementById("app").innerText.length);
  if (len < 50) errors.push(`Route ${r} fast leer`);
}
step(`${routes.length} Routen gerendert`);

// 1b) Podcasts je Modul mit Suchlink, Software-Ausgaben im Rechentrainer
for (const id of ids) {
  await go(`#/modul/${id}/podcasts`);
  const n = await page.$$eval("#app a[href^='https://duckduckgo.com/?q=']", (x) => x.length);
  if (!n) errors.push(`Modul ${id}: keine Podcast-Empfehlung mit Suchlink`);
}
await go("#/podcasts");
if ((await page.$$("#app li.resource")).length < 15) errors.push("Podcast-Übersicht unvollständig");
for (const seed of [1, 4, 7, 12]) {
  await go(`#/rechentrainer/ausgabe_lesen/${seed}`);
  if (!(await page.$(".sw-output .sw-table table td"))) errors.push(`Software-Ausgabe fehlt (Aufgabe ${seed})`);
}
let nFig = 0;
const expectedFig = await page.evaluate(() => Object.values(PP.topicFigures).reduce((n, m) => n + Object.values(m).reduce((k, l) => k + l.length, 0), 0));
for (const id of ids) { await go(`#/modul/${id}/lernpfad`); nFig += await page.$$eval("figure.fig-wrap svg.fig title", (x) => x.length); }
if (!expectedFig || nFig !== expectedFig) errors.push(`Abbildungen im Lernpfad: ${nFig} statt ${expectedFig}`);
step(`Podcasts in allen Modulen, Software-Ausgaben im Rechentrainer, ${nFig} Abbildungen im Lernpfad`);

// 2) Modul-Quiz komplett: falsche Antworten landen in der Wiederholung
await go(`#/modul/A1/quiz`);
for (;;) { const b = await page.$("button.opt:not([disabled])"); if (!b) break; await b.click(); }
if (!(await page.$(".score-big"))) errors.push("Quiz-Ergebnis fehlt");
let st = await state(), dl;
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

// 5b) Fachliche Prüfung: Vermerk nur mit Kürzel, ✓/✗, Beleg, Export, Anzeige im Lernpfad
await go("#/pruefmodus/inhalte");
if ((await page.$$eval("table tbody tr", (r) => r.length)) !== ids.length) errors.push("Prüfübersicht: nicht alle Module");
await go("#/pruefmodus/inhalte/A1");
await page.click('[data-rset][data-r="ok"]');
if (Object.keys((await state()).review).length) errors.push("Prüfvermerk ohne Kürzel gespeichert");
await page.fill("#reviewer", "TS"); await page.waitForTimeout(450);
await page.click('[data-rset][data-r="ok"]');
await page.fill("[data-rnote]", "Pinel & Pauli (2012), S. 12");
await page.waitForTimeout(600);
await page.click('.verify-row:nth-of-type(2) [data-rset][data-r="fehler"]');
if (!(await page.$("#overlay"))) errors.push("✗ Fehler öffnet keine Fehlermeldung");
await page.fill("#repComment", "Prüftest"); await page.click('[data-repsave="1"]');
st = await state();
const marks = Object.values(st.review);
if (marks.filter((v) => v.s === "ok" && v.by === "TS" && (v.note || "").includes("S. 12")).length !== 1 || marks.filter((v) => v.s === "fehler").length !== 1) errors.push("Prüfvermerke nicht korrekt gespeichert: " + JSON.stringify(marks));
[dl] = await Promise.all([page.waitForEvent("download"), page.click('[data-review="save"]')]);
const exp = JSON.parse((await import("fs")).readFileSync(await dl.path(), "utf8"));
if (exp.kind !== "review" || Object.keys(exp.items).length !== 2 || exp.reviewer !== "TS") errors.push("Export der Prüfvermerke unvollständig");
await go("#/modul/A1/lernpfad");
if (!(await page.textContent("#app")).includes("fachlich geprüft (von dir)")) errors.push("Prüfvermerk im Lernpfad nicht sichtbar");
if (!(await page.$(".sources li"))) errors.push("Quellen im Lernpfad fehlen");
step("Fachliche Prüfung: Vermerke, Beleg, Fehlermeldung, Export, Quellen im Lernpfad");

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
let checkedPreview = false;
for (let i = 0; i < 12; i++) {
  if (await page.$('[data-rev="flip"]')) {
    await page.click('[data-rev="flip"]');
    if (!checkedPreview) {
      // neue Karte: Nochmal heute, Schwer 1 Tag, Gut 2 Tage, Leicht 8 Tage (FSRS-6-Standardparameter)
      const labels = await page.$$eval("[data-revgrade]", (b) => b.map((x) => x.textContent));
      if (labels.length !== 4 || !labels[1].includes("1 Tag") || !labels[3].includes("8 Tage")) errors.push("Bewertungsknöpfe ohne richtige Vorschau: " + labels.join(" | "));
      checkedPreview = true;
    }
    await page.click(i % 3 ? '[data-revgrade="3"]' : '[data-revgrade="4"]');
  } else if (await page.$("button.opt:not([disabled])")) { await page.click("button.opt:not([disabled])"); await page.click("[data-revgrade]"); }
  else break;
}
const rv = await page.evaluate(() => window.PPApp.review);
if (!rv || rv.done < 5) errors.push(`Wiederholung: nur ${rv && rv.done} Elemente bearbeitet`);
st = await state();
if (st.srsCfg.introduced.count < 1) errors.push("Neue Karten werden nicht gezählt");
if (!Object.values(st.srs).some((c) => c.s > 0 && c.d >= 1 && c.due)) errors.push("FSRS-Zustand (Stabilität/Schwierigkeit) fehlt");
if (!Object.values(st.log).some((e) => e.rev >= 5)) errors.push("Lernverlauf zählt Wiederholungen nicht");
step(`Wiederholungsrunde: ${rv.done} Elemente bewertet`);

// 7b) Lernverlauf, Prüfungstermin mit Countdown und Tagesziel
await go("#/verlauf");
if ((await page.$$(".hm-cell[data-tip]")).length < 150) errors.push("Lernkalender unvollständig");
if (!(await page.$(".hm-cell.hm-today:not(.hm0)"))) errors.push("Heutiger Lerntag im Kalender nicht markiert");
if ((await page.$$(".ch-bar")).length !== 30) errors.push("Vorschau der fälligen Wiederholungen fehlt");
await page.hover(".ch-col"); if (!(await page.isVisible(".ch-tip"))) errors.push("Diagramm-Tooltip fehlt");
const examDay = await page.evaluate(() => PPSrs.addDays(PPSrs.today(), 10));
await page.selectOption("#exMod", "C3"); await page.fill("#exDate", examDay); await page.click('[data-examadd="1"]');
const examText = await page.textContent(".exam-card");
if (!/\b10\s*Tage/.test(examText) || !/heute:\s*\d+ neue/.test(examText)) errors.push("Prüfungstermin ohne Countdown/Tagesziel: " + examText.slice(0, 200));
await page.click("[data-exstudy]"); await page.waitForTimeout(30);
const prep = await page.evaluate(() => window.PPApp.review);
if (!page.url().endsWith("#/wiederholen") || !prep || prep.mod !== "C3" || !prep.queue.length || !prep.queue.every((id) => id.includes(":C3:"))) errors.push("Prüfungsvorbereitung startet nicht mit Modul C3");
await page.click('[data-rev="stop"]');
await go("#/");
if (!(await page.textContent(".card.today")).includes("in 10 Tagen")) errors.push("Startseite zeigt Prüfungs-Countdown nicht");
step("Lernverlauf: Kalender, Vorschau, Prüfungstermin mit Countdown und Tagesziel");

// 8) Karteikarten im Modul
await go("#/modul/C3/karten");
await page.click("#flash"); await page.click('[data-cardgrade="3"]');
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
[dl] = await Promise.all([page.waitForEvent("download"), page.click('[data-anki="save"]')]);
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
if (Object.keys((await state()).reports).length !== 2) errors.push("Import stellt Zustand nicht wieder her");
step("Fortschritt exportiert und importiert");

if (shotDir) {
  for (const [r, n] of [["#/", "home"], ["#/wiederholen", "wiederholen"], ["#/verlauf", "verlauf"], ["#/rechentrainer/ttest_ind/42", "trainer"], ["#/datensaetze", "datensaetze"], ["#/pruefmodus/curriculum", "pruefmodus"], ["#/anki", "anki"]]) {
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
