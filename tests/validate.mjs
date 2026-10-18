// Prüft die Datenintegrität aller Module. Aufruf: node tests/validate.mjs
import fs from "fs";
import vm from "vm";
import path from "path";

const html = fs.readFileSync("index.html", "utf8");
const scripts = [...html.matchAll(/<script src="(data\/[^"]+)"/g)].map((m) => m[1]);
const ctx = { window: {} };
vm.createContext(ctx);
for (const s of scripts) vm.runInContext(fs.readFileSync(s, "utf8").replace(/^window\.PP =/m, "PP =").replace(/^const PP|^let PP/m, "PP"), ctx, { filename: s });
const PP = ctx.PP || ctx.window.PP;
const errors = [];
const err = (m) => errors.push(m);
const ids = new Set();
const groups = new Set(PP.groups.map((g) => g.id));
let q = 0, t = 0, b = 0, r = 0, g = 0, e = 0;
const isUrl = (u) => /^https:\/\/[^\s]+$/.test(u);
for (const m of PP.modules) {
  if (ids.has(m.id)) err(`Doppelte Modul-ID ${m.id}`);
  ids.add(m.id);
  if (!groups.has(m.group)) err(`${m.id}: unbekannte Gruppe ${m.group}`);
  for (const k of ["title", "summary", "goals", "competencies", "topics", "materials", "lectures", "literature", "quiz", "exam", "glossary"]) if (!m[k] || (Array.isArray(m[k]) && !m[k].length)) err(`${m.id}: Feld ${k} fehlt/leer`);
  (m.quiz || []).forEach((x, i) => {
    q++;
    if (!x.q || !Array.isArray(x.o) || x.o.length < 3) err(`${m.id} Quiz ${i}: zu wenige Optionen`);
    if (!(Number.isInteger(x.a) && x.a >= 0 && x.a < x.o.length)) err(`${m.id} Quiz ${i}: Antwortindex ungültig`);
    if (new Set(x.o).size !== x.o.length) err(`${m.id} Quiz ${i}: doppelte Optionen`);
    if (!x.e) err(`${m.id} Quiz ${i}: Erklärung fehlt`);
  });
  (m.exam || []).forEach((x, i) => { e++; if (!x.q || !x.s || !(x.p > 0)) err(`${m.id} Prüfung ${i}: unvollständig`); });
  (m.topics || []).forEach((x, i) => { t++; if (!x.title || !x.text || x.text.length < 200) err(`${m.id} Thema ${i}: Text zu kurz`); });
  (m.materials || []).concat(m.lectures || []).forEach((x) => { r++; if (!x.title || !isUrl(x.url)) err(`${m.id}: ungültige URL bei „${x.title}“: ${x.url}`); });
  (m.literature || []).forEach((x) => { b++; if (!x.authors || !x.title || !x.year) err(`${m.id}: unvollständige Literatur „${x.title}“`); });
  (m.glossary || []).forEach((x) => { g++; if (!Array.isArray(x) || x.length !== 2 || !x[0] || !x[1]) err(`${m.id}: Glossareintrag fehlerhaft`); });
}
for (const s of PP.semesterPlan) for (const id of s.modules) if (id !== "W" && !ids.has(id)) err(`Semesterplan: unbekanntes Modul ${id}`);
const ectsPflicht = PP.modules.reduce((s, m) => s + (m.ects || 0), 0);
if (ectsPflicht !== PP.meta.ects) err(`ECTS-Summe der Module ${ectsPflicht} ≠ ${PP.meta.ects}`);
for (const grp of PP.groups) { const sum = PP.modules.filter((m) => m.group === grp.id).reduce((s, m) => s + (m.ects || 0), 0); if (sum !== grp.ects) err(`Gruppe ${grp.id}: Modul-ECTS ${sum} ≠ ${grp.ects}`); }
for (const l of PP.libraries) { if (!isUrl(l.home)) err(`Bibliothek ${l.id}: home-URL`); if (l.template && !l.template.includes("{q}")) err(`Bibliothek ${l.id}: Template ohne {q}`); }
console.log(`${PP.modules.length} Module · ${t} Themen · ${r} Materialien/Vorlesungen · ${b} Bücher · ${q} Quizfragen · ${e} Prüfungsfragen · ${g} Glossarbegriffe · ${ectsPflicht} ECTS`);
if (errors.length) { console.error("FEHLER:\n" + errors.join("\n")); process.exit(1); }
console.log("OK – Daten valide.");
