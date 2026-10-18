import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "module";
const R = createRequire(import.meta.url)("../../js/srs.js");

test("Datum und Abstände", () => {
  assert.equal(R.addDays("2026-01-31", 1), "2026-02-01");
  assert.equal(R.addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(R.addDays("2028-02-28", 1), "2028-02-29");
});

test("Wiederholung: gewusst steigert, falsch setzt zurück", () => {
  const d = "2026-10-18";
  let c = R.review(undefined, true, d);
  assert.equal(c.box, 1); assert.equal(c.due, "2026-10-19");
  c = R.review(c, true, "2026-10-19"); assert.equal(c.box, 2); assert.equal(c.due, "2026-10-22");
  c = R.review(c, false, "2026-10-22"); assert.equal(c.box, 1); assert.equal(c.due, "2026-10-22"); assert.equal(c.lapses, 1);
  for (let i = 0; i < 20; i++) c = R.review(c, true, d);
  assert.equal(c.box, R.MAX_BOX);
  assert.ok(R.isDue({ due: "2026-10-01" }, d)); assert.ok(!R.isDue({ due: "2026-11-01" }, d)); assert.ok(!R.isDue(undefined, d));
});

test("Warteschlange: fällige zuerst, Tageslimit für neue, Modulfilter, Verzahnung", () => {
  const mods = [{ id: "A", glossary: [["a1", "x"], ["a2", "x"], ["a3", "x"]], quiz: [] }, { id: "B", glossary: [["b1", "x"], ["b2", "x"]], quiz: [{ q: "Frage?", o: ["1", "2", "3"], a: 0 }] }];
  const items = R.collect(mods);
  assert.equal(items.length, 6);
  const day = "2026-10-18", srs = { [R.cardId("B", "b2")]: { box: 2, due: "2026-10-10" } };
  const q = R.buildQueue(items, srs, day, { newLimit: 2 });
  assert.equal(q.due.length, 1); assert.equal(q.fresh.length, 2);
  assert.equal(R.buildQueue(items, srs, day, { newLimit: 2, introducedToday: 2 }).fresh.length, 0);
  assert.ok(R.buildQueue(items, srs, day, { newLimit: 10, newModules: ["A"] }).fresh.every((i) => i.mod === "A"));
  assert.deepEqual(R.buildQueue(items, srs, day, { newLimit: 10, kinds: ["quiz"] }).fresh.map((i) => i.kind), ["quiz"]);
  const mixed = R.interleave(items);
  assert.notEqual(mixed[0].mod, mixed[1].mod, "Module werden abwechselnd gemischt");
});

test("IDs sind stabil und unabhängig von der Position", () => {
  const q = { q: "Was ist Reliabilität?", o: [], a: 0 };
  assert.equal(R.quizId("D2", q), R.quizId("D2", Object.assign({}, q, { o: ["neu"] })));
  assert.notEqual(R.quizId("D2", q), R.quizId("D1", q));
});

test("Übernahme alter Karteikarten-Boxen", () => {
  const mods = [{ id: "A", glossary: [["Begriff", "Def"]] }];
  const srs = R.migrateCards({ A: { 0: 3 } }, mods, {}, "2026-10-18");
  assert.equal(srs[R.cardId("A", "Begriff")].box, 4);
});
