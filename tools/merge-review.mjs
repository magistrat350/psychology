// Pflegt exportierte Prüfvermerke (Prüfmodus → Inhalte prüfen → „Als Datei speichern“) in data/review.js ein.
//   node tools/merge-review.mjs psychopfad-pruefvermerke-2026-10-20.json [weitere.json …]
// Neuere Vermerke (Datum) ersetzen ältere; IDs, die es im aktuellen Datenbestand nicht (mehr) gibt, werden gemeldet und übersprungen.
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { ROOT, loadData } from "./lib/load-data.mjs";

const RV = createRequire(import.meta.url)("../js/review.js");
const files = process.argv.slice(2);
if (!files.length) { console.error("Aufruf: node tools/merge-review.mjs <export.json> [weitere …]"); process.exit(2); }

const PP = loadData();
const known = new Set(RV.collect(PP.modules).map((it) => it.id));
let review = PP.review || {}, added = 0;
for (const f of files) {
  const data = JSON.parse(fs.readFileSync(f, "utf8"));
  const items = data.items || data;
  const before = Object.keys(review).length;
  const res = RV.merge(review, items, known);
  review = res.review; added += Object.keys(review).length - before;
  console.log(`${f}: ${Object.keys(items).length} Vermerke${data.reviewer ? ` von ${data.reviewer}` : ""}${res.unknown.length ? `, ${res.unknown.length} unbekannte IDs übersprungen (Text inzwischen geändert?): ${res.unknown.slice(0, 5).join(", ")}${res.unknown.length > 5 ? " …" : ""}` : ""}`);
}
const file = path.join(ROOT, "data/review.js");
const head = fs.readFileSync(file, "utf8").split("PP.review =")[0];
const sorted = Object.fromEntries(Object.keys(review).sort().map((k) => [k, review[k]]));
fs.writeFileSync(file, `${head}PP.review = ${JSON.stringify(sorted, null, 2)};\n`);
const st = RV.stats(RV.collect(PP.modules), sorted, {}).all;
console.log(`data/review.js: ${Object.keys(sorted).length} Vermerke (${added >= 0 ? "+" : ""}${added}) – ${st.ok} geprüft, ${st.fehler} mit Fehler, von ${st.total} Inhalten.`);
