import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const R = require("../../js/srs.js");

test("Datum und Abstände", () => {
  assert.equal(R.addDays("2026-01-31", 1), "2026-02-01");
  assert.equal(R.addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(R.addDays("2028-02-28", 1), "2028-02-29");
});

test("FSRS: neue Karte, gewusst steigert die Stabilität, vergessen senkt sie", () => {
  const d = "2026-10-18";
  assert.deepEqual(R.preview(undefined, d), [0, 1, 2, 8], "neue Karte: nochmal heute, schwer 1, gut 2, leicht 8 Tage");
  let c = R.review(undefined, true, d);
  assert.equal(c.due, "2026-10-20"); assert.equal(c.reps, 1);
  const s1 = c.s;
  c = R.review(c, 3, c.due); assert.ok(c.s > s1 * 2, "pünktlich gewusst → Stabilität wächst deutlich");
  const s2 = c.s, d2 = c.d;
  c = R.review(c, false, c.due);
  assert.ok(c.s < s2, "vergessen → Stabilität sinkt"); assert.equal(c.due, c.last, "vergessen → heute erneut"); assert.equal(c.lapses, 1);
  assert.ok(c.d > d2, "vergessen → Karte gilt als schwieriger");
  const easy = R.review(R.review(undefined, 3, d), 4, "2026-10-20"), hard = R.review(R.review(undefined, 3, d), 2, "2026-10-20");
  assert.ok(easy.s > hard.s && easy.due > hard.due, "leicht → längerer Abstand als schwer");
  assert.ok(R.isDue({ due: "2026-10-01" }, d)); assert.ok(!R.isDue({ due: "2026-11-01" }, d)); assert.ok(!R.isDue(undefined, d));
});

test("FSRS: Abrufwahrscheinlichkeit 90 % nach S Tagen, höhere Behaltensquote → kürzere Abstände", () => {
  assert.ok(Math.abs(R.retrievability(10, 10) - 0.9) < 1e-6);
  assert.ok(R.retrievability(30, 10) < 0.9 && R.retrievability(1, 10) > 0.9);
  assert.equal(R.nextInterval(10, 0.9), 10);
  assert.ok(R.nextInterval(10, 0.95) < 10 && R.nextInterval(10, 0.8) > 10);
  const c = R.review(R.review(undefined, 3, "2026-10-01"), 3, "2026-10-03", { retention: 0.95 });
  const c2 = R.review(R.review(undefined, 3, "2026-10-01"), 3, "2026-10-03", { retention: 0.8 });
  assert.ok(c.due < c2.due);
});

test("FSRS: identisch mit der Referenzimplementierung ts-fsrs (FSRS-6)", () => {
  const { FSRSAlgorithm, generatorParameters } = require("ts-fsrs");
  const ref = new FSRSAlgorithm(generatorParameters({ enable_fuzz: false, enable_short_term: true }));
  assert.deepEqual(Array.from(ref.parameters.w), R.W, "gleiche Standardparameter");
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let run = 0; run < 300; run++) {
    let mine = null, theirs = null;
    for (let step = 0; step < 12; step++) {
      const g = 1 + Math.floor(rnd() * 4), t = mine ? [0, 1, 2, 5, 13, 40, 120][Math.floor(rnd() * 7)] : 0;
      const a = R.nextState(mine, t, g), b = ref.next_state(theirs, t, g);
      assert.ok(Math.abs(a.s - b.stability) < 1e-6 && Math.abs(a.d - b.difficulty) < 1e-6, `Lauf ${run}, Schritt ${step}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
      assert.equal(R.nextInterval(a.s), ref.next_interval(b.stability, t));
      mine = a; theirs = b;
    }
  }
});

test("Übernahme alter Leitner-Karten", () => {
  const old = { box: 4, due: "2026-11-01", last: "2026-10-16", reps: 4, lapses: 1 };
  const m = R.memory(old);
  assert.equal(m.s, 16, "Stabilität ≈ bisheriger Abstand"); assert.ok(m.d >= 1 && m.d <= 10);
  const c = R.review(old, 3, "2026-11-01");
  assert.ok(c.s > 16 && c.due > "2026-11-17", "Weiterlernen mit FSRS");
  assert.equal(R.stats([{ id: "x" }], { x: old }, "2026-10-18").learned, 1);
});

test("Statistik und Vorschau", () => {
  const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
  const srs = { a: { s: 30, d: 5, due: "2026-10-18", last: "2026-09-18" }, b: { s: 2, d: 5, due: "2026-10-20", last: "2026-10-18" } };
  const st = R.stats(items, srs, "2026-10-18");
  assert.equal(st.learned, 2); assert.equal(st.mature, 1); assert.equal(st.due, 1);
  assert.equal(st.bySpan.reduce((x, y) => x + y, 0), 2);
  assert.deepEqual(R.forecast(items, srs, "2026-10-18", 4), [1, 0, 1, 0]);
});

test("Warteschlange: fällige zuerst, Tageslimit für neue, Modulfilter, Verzahnung", () => {
  const mods = [{ id: "A", glossary: [["a1", "x"], ["a2", "x"], ["a3", "x"]], quiz: [] }, { id: "B", glossary: [["b1", "x"], ["b2", "x"]], quiz: [{ q: "Frage?", o: ["1", "2", "3"], a: 0 }] }];
  const items = R.collect(mods);
  assert.equal(items.length, 6);
  const day = "2026-10-18", srs = { [R.cardId("B", "b2")]: { s: 3, d: 5, due: "2026-10-10", last: "2026-10-07" } };
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
  assert.equal(srs[R.cardId("A", "Begriff")].s, 16);
});
