// Prüft die Datenintegrität aller Module und Zusatzdaten. Aufruf: npm run test:data
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { ROOT, loadData } from "../tools/lib/load-data.mjs";

const require = createRequire(import.meta.url);
const R = require("../js/srs.js");
const T = require("../js/trainer.js");
const PP = loadData();
const errors = [];
const err = (m) => errors.push(m);
const isUrl = (u) => /^https:\/\/[^\s]+$/.test(u);
const ids = new Set(), groups = new Set(PP.groups.map((g) => g.id));
let q = 0, t = 0, b = 0, r = 0, g = 0, e = 0;

for (const m of PP.modules) {
  if (ids.has(m.id)) err(`Doppelte Modul-ID ${m.id}`);
  ids.add(m.id);
  if (!groups.has(m.group)) err(`${m.id}: unbekannte Gruppe ${m.group}`);
  for (const k of ["title", "summary", "goals", "competencies", "topics", "materials", "lectures", "literature", "quiz", "exam", "glossary"]) if (!m[k] || (Array.isArray(m[k]) && !m[k].length)) err(`${m.id}: Feld ${k} fehlt/leer`);
  const qIds = new Set(), gIds = new Set();
  (m.quiz || []).forEach((x, i) => {
    q++;
    if (!x.q || !Array.isArray(x.o) || x.o.length < 3) err(`${m.id} Quiz ${i}: zu wenige Optionen`);
    if (!(Number.isInteger(x.a) && x.a >= 0 && x.a < x.o.length)) err(`${m.id} Quiz ${i}: Antwortindex ungültig`);
    if (new Set(x.o).size !== x.o.length) err(`${m.id} Quiz ${i}: doppelte Optionen`);
    if (!x.e) err(`${m.id} Quiz ${i}: Erklärung fehlt`);
    const id = R.quizId(m.id, x); if (qIds.has(id)) err(`${m.id} Quiz ${i}: doppelte Frage (Wiederholungs-ID ${id})`); qIds.add(id);
  });
  (m.exam || []).forEach((x, i) => { e++; if (!x.q || !x.s || !(x.p > 0)) err(`${m.id} Prüfung ${i}: unvollständig`); });
  (m.topics || []).forEach((x, i) => { t++; if (!x.title || !x.text || x.text.length < 200) err(`${m.id} Thema ${i}: Text zu kurz`); });
  (m.materials || []).concat(m.lectures || []).forEach((x) => { r++; if (!x.title || !isUrl(x.url)) err(`${m.id}: ungültige URL bei „${x.title}“: ${x.url}`); });
  (m.literature || []).forEach((x) => { b++; if (!x.authors || !x.title || !x.year) err(`${m.id}: unvollständige Literatur „${x.title}“`); });
  (m.glossary || []).forEach((x) => {
    g++; if (!Array.isArray(x) || x.length !== 2 || !x[0] || !x[1]) err(`${m.id}: Glossareintrag fehlerhaft`);
    const id = R.cardId(m.id, x[0]); if (gIds.has(id)) err(`${m.id}: doppelter Glossarbegriff „${x[0]}“`); gIds.add(id);
  });
}
for (const s of PP.semesterPlan) for (const id of s.modules) if (id !== "W" && !ids.has(id)) err(`Semesterplan: unbekanntes Modul ${id}`);
const ectsSum = PP.modules.reduce((s, m) => s + (m.ects || 0), 0);
if (ectsSum !== PP.meta.ects) err(`ECTS-Summe der Module ${ectsSum} ≠ ${PP.meta.ects}`);
for (const grp of PP.groups) { const sum = PP.modules.filter((m) => m.group === grp.id).reduce((s, m) => s + (m.ects || 0), 0); if (sum !== grp.ects) err(`Gruppe ${grp.id}: Modul-ECTS ${sum} ≠ ${grp.ects}`); }
for (const l of PP.libraries) { if (!isUrl(l.home)) err(`Bibliothek ${l.id}: home-URL`); if (l.template && !l.template.includes("{q}")) err(`Bibliothek ${l.id}: Template ohne {q}`); }

// Prüfmodus-Checkliste
const vIds = new Set();
for (const it of PP.verification.global) { if (vIds.has(it.id)) err(`Checkliste: doppelte ID ${it.id}`); vIds.add(it.id); }
for (const [mod, list] of Object.entries(PP.verification.modules)) {
  if (!ids.has(mod)) err(`Checkliste: unbekanntes Modul ${mod}`);
  list.forEach((it) => { if (vIds.has(it.id)) err(`Checkliste: doppelte ID ${it.id}`); vIds.add(it.id); if (!it.text) err(`Checkliste ${it.id}: Text fehlt`); });
}

// Rechentrainer & Datensätze
for (const gen of T.generators) for (const mod of gen.modules) if (!ids.has(mod)) err(`Generator ${gen.id}: unbekanntes Modul ${mod}`);
for (const d of PP.datasets || []) {
  for (const mod of d.modules) if (!ids.has(mod)) err(`Datensatz ${d.id}: unbekanntes Modul ${mod}`);
  const file = path.join(ROOT, d.file);
  if (!fs.existsSync(file)) err(`Datensatz ${d.id}: Datei ${d.file} fehlt`);
  else if (fs.readFileSync(file, "utf8") !== d.csv) err(`Datensatz ${d.id}: CSV-Datei und eingebettete Daten weichen ab – npm run datasets ausführen`);
  if (d.csv.trim().split("\n").length - 1 !== d.n) err(`Datensatz ${d.id}: Zeilenzahl stimmt nicht`);
  d.tasks.forEach((tk, i) => tk.results.forEach((res) => { if (!isFinite(res.value)) err(`Datensatz ${d.id} Aufgabe ${i}: Ergebnis „${res.label}“ ungültig`); }));
}
if (PP.linkStatus !== null && (!PP.linkStatus || !PP.linkStatus.results)) err("data/link-status.js: ungültiges Format");

console.log(`${PP.modules.length} Module · ${t} Themen · ${r} Materialien/Vorlesungen · ${b} Bücher · ${q} Quizfragen · ${e} Prüfungsfragen · ${g} Glossarbegriffe · ${ectsSum} ECTS`);
console.log(`${T.generators.length} Rechenaufgaben-Typen · ${(PP.datasets || []).length} Datensätze · ${vIds.size} Checklistenpunkte (+ automatische je Modul)`);
if (errors.length) { console.error("FEHLER:\n" + errors.join("\n")); process.exit(1); }
console.log("OK – Daten valide.");
