import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "module";
import { loadData } from "../../tools/lib/load-data.mjs";
const A = createRequire(import.meta.url)("../../js/anki.js");

test("Anki-Datei: Kopfzeilen, vier Spalten, keine Tabulatoren/Zeilenumbrüche in Feldern", () => {
  const PP = loadData();
  const txt = A.build(PP.modules);
  const lines = txt.trimEnd().split("\n");
  assert.deepEqual(lines.slice(0, 4), ["#separator:tab", "#html:true", "#deck column:3", "#tags column:4"]);
  const rows = lines.slice(4);
  const expected = PP.modules.reduce((s, m) => s + m.glossary.length + m.quiz.length + m.exam.length, 0);
  assert.equal(rows.length, expected);
  for (const r of rows) {
    const f = r.split("\t");
    assert.equal(f.length, 4, r.slice(0, 80));
    assert.ok(f[2].startsWith("PsychoPfad Wien::"));
    assert.ok(!/"/.test(f[0] + f[1]), "Anführungszeichen sind als &quot; maskiert");
  }
});

test("Auswahl nach Art und HTML-Maskierung", () => {
  const mods = [{ id: "X1", title: "Test", glossary: [["a<b", "c & d"]], quiz: [{ q: "Q?", o: ["eins", "zwei", "drei"], a: 1, e: "weil" }], exam: [{ q: "Offen?", p: 2, s: "- Punkt **eins**\n- Punkt zwei" }] }];
  const rows = A.rows(mods, { kinds: ["card"] });
  assert.equal(rows.length, 1); assert.equal(rows[0][0], "<b>a&lt;b</b>"); assert.equal(rows[0][1], "c &amp; d");
  const quiz = A.rows(mods, { kinds: ["quiz"] })[0];
  assert.match(quiz[1], /^<b>B\) zwei<\/b><br>weil$/);
  const ex = A.rows(mods, { kinds: ["exam"] })[0];
  assert.equal(ex[1], "<ul><li>Punkt <b>eins</b></li><li>Punkt zwei</li></ul>");
});
