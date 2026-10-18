import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "module";
const T = createRequire(import.meta.url)("../../js/trainer.js");

test("mindestens 20 Aufgabentypen für D1, D2 und E1", () => {
  assert.ok(T.generators.length >= 20);
  for (const mod of ["D1", "D2", "E1"]) assert.ok(T.generators.some((g) => g.modules.includes(mod)), mod);
});

for (const g of T.generators) {
  test(`Generator ${g.id}: reproduzierbar, endliche Lösungen, korrekte Bewertung`, () => {
    for (let seed = 1; seed <= 150; seed++) {
      const t = T.make(g.id, seed);
      assert.deepEqual(T.make(g.id, seed), t, "gleicher Seed → gleiche Aufgabe");
      assert.ok(t.intro && t.steps.length >= 1 && t.answers.length >= 1);
      const right = {}, wrong = {};
      for (const a of t.answers) {
        if (a.type === "choice") { assert.ok(a.options.includes(a.value)); right[a.key] = a.value; wrong[a.key] = a.options.find((o) => o !== a.value); continue; }
        assert.ok(Number.isFinite(a.value), `${a.key} endlich (Seed ${seed})`);
        right[a.key] = T.display(a);
        wrong[a.key] = String(a.value + Math.max(1, a.tol * 10 + Math.abs(a.value) * 0.5));
      }
      assert.ok(T.check(t, right).every(Boolean), `angezeigte Lösung wird akzeptiert (Seed ${seed})`);
      assert.ok(T.check(t, wrong).every((x) => !x), `falsche Werte werden abgelehnt (Seed ${seed})`);
    }
  });
}
