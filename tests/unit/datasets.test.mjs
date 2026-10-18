import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "module";
import { loadData } from "../../tools/lib/load-data.mjs";
const S = createRequire(import.meta.url)("../../js/stats.js");
const PP = loadData();
const parse = (csv) => { const [h, ...rows] = csv.trim().split("\n").map((l) => l.split(",")); return rows.map((r) => Object.fromEntries(h.map((k, i) => [k, isNaN(+r[i]) ? r[i] : +r[i]]))); };
const result = (ds, ti, label) => PP.datasets.find((d) => d.id === ds).tasks[ti].results.find((r) => r.label === label).value;
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);

test("Referenzergebnisse lassen sich aus den CSV-Daten unabhängig nachrechnen", () => {
  const ls = parse(PP.datasets.find((d) => d.id === "lernstudie").csv);
  near(S.mean(ls.map((r) => r.punkte)), result("lernstudie", 0, "M"));
  near(S.pearson(ls.map((r) => r.lernzeit), ls.map((r) => r.punkte)), result("lernstudie", 1, "r"));
  const g = (m) => ls.filter((r) => r.methode === m).map((r) => r.punkte);
  near(S.tTestInd(g("abruf"), g("lesen")).t, result("lernstudie", 2, "t"));

  const th = parse(PP.datasets.find((d) => d.id === "therapie").csv);
  const groups = ["kvt", "ipt", "warteliste"].map((b) => th.filter((r) => r.bedingung === b).map((r) => r.bdi_post));
  near(S.anovaOneWay(groups).F, result("therapie", 1, "F"));

  const fb = parse(PP.datasets.find((d) => d.id === "fragebogen").csv);
  const items = [1, 2, 3, 4, 5, 6].map((j) => fb.map((r) => ([3, 5].includes(j) ? 6 - r["i" + j] : r["i" + j])));
  near(S.cronbachAlpha(items).alpha, result("fragebogen", 0, "Cronbachs α"));
});

test("Jeder Datensatz hat Variablenbeschreibung, Aufgaben mit Hinweis und Ergebnis", () => {
  assert.ok(PP.datasets.length >= 5);
  for (const d of PP.datasets) {
    assert.ok(d.variables.length >= 3 && d.tasks.length >= 2, d.id);
    for (const t of d.tasks) assert.ok(t.q && t.hint && t.results.length, `${d.id}: ${t.q}`);
  }
});
