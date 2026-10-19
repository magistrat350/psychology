import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "module";
import { loadData } from "../../tools/lib/load-data.mjs";
const require = createRequire(import.meta.url);
const RV = require("../../js/review.js"), SRC = require("../../js/sources.js"), R = require("../../js/srs.js");

const mods = [{ id: "X1", topics: [{ title: "Thema A", text: "…" }], quiz: [{ q: "Frage?", o: ["a", "b"], a: 1, e: "" }], exam: [{ q: "Offen?", p: 2, s: "Lösung" }] }];

test("IDs hängen am Text: Quiz-IDs wie in der Wiederholung, Textänderung = neue ID", () => {
  const items = RV.collect(mods);
  assert.deepEqual(items.map((i) => i.kind), ["topic", "quiz", "exam"]);
  assert.equal(items[1].id, R.quizId("X1", mods[0].quiz[0]));
  assert.notEqual(RV.topicId("X1", { title: "Thema A" }), RV.topicId("X1", { title: "Thema A (neu)" }));
  assert.match(RV.examId("X1", mods[0].exam[0]), /^x:X1:/);
});

test("Eigene Vermerke vor gemeinsamen, Zählung je Modul", () => {
  const [t, q, x] = RV.collect(mods).map((i) => i.id);
  const shared = { [t]: { s: "ok", by: "AB", date: "2026-10-01" }, [q]: { s: "ok", by: "AB", date: "2026-10-01" } };
  const local = { [q]: { s: "fehler", by: "CD", date: "2026-10-19" }, [x]: { note: "nur Notiz" } };
  assert.equal(RV.status(t, shared, local).s, "ok");
  assert.equal(RV.status(q, shared, local).s, "fehler");
  assert.equal(RV.status(q, shared, local).local, true);
  assert.equal(RV.status(x, shared, local), null, "Notiz ohne Vermerk zählt nicht");
  const st = RV.stats(RV.collect(mods), shared, local);
  assert.deepEqual(st.all, { total: 3, ok: 1, fehler: 1 });
  assert.equal(st.per.X1.quiz.fehler, 1);
});

test("Export und Zusammenführen", () => {
  const [t, q] = RV.collect(mods).map((i) => i.id);
  const exp = RV.exportData({ [t]: { s: "ok", by: "AB", date: "2026-10-19", note: "Buch S. 3" }, [q]: { note: "offen" } }, { reviewer: "AB" });
  assert.deepEqual(Object.keys(exp.items), [t]);
  assert.equal(exp.reviewer, "AB");
  const known = new Set(RV.collect(mods).map((i) => i.id));
  const shared = { [q]: { s: "ok", by: "XY", date: "2026-10-20", note: "" } };
  const m1 = RV.merge(shared, { [t]: exp.items[t], [q]: { s: "fehler", by: "AB", date: "2026-10-01" }, "t:X1:alt": { s: "ok", date: "2026-10-19" } }, known);
  assert.equal(m1.review[t].note, "Buch S. 3");
  assert.equal(m1.review[q].by, "XY", "älterer Vermerk ersetzt keinen neueren");
  assert.deepEqual(m1.unknown, ["t:X1:alt"]);
  assert.equal(RV.merge(m1.review, { [t]: { s: "" } }, known).review[t], undefined, "leerer Status entfernt den Vermerk");
});

test("Quellen: Bücher über Nachname + Jahr, OpenStax-Adressen, DOIs, Materialien", () => {
  const books = [{ authors: "Kirchler, E. (Hrsg.)", year: 2011, title: "Arbeits- und Organisationspsychologie" }, { authors: "Kirchler, E.", year: 2011, title: "Wirtschaftspsychologie" }, { authors: "Myers, D. G. & DeWall, C. N.", year: 2023, title: "Psychologie" }];
  assert.deepEqual(SRC.litKeys(books), ["Kirchler 2011 Arbeits-", "Kirchler 2011 Wirtschaftspsychologie", "Myers 2023"]);
  const cat = { oer: { psych: { title: "OS", base: "https://openstax.org/books/psychology-2e/pages/", chapters: { 6: "Learning" }, sections: { "6.4": "Observational Learning (Modeling)" } } }, dois: { "10.1/x": "Zitat" } };
  const m = { literature: books, materials: [{ title: "Kurs", url: "https://example.org/kurs" }] };
  assert.equal(SRC.resolve({ oer: "psych", sec: "6.4" }, m, cat).url, "https://openstax.org/books/psychology-2e/pages/6-4-observational-learning-modeling");
  assert.equal(SRC.resolve({ oer: "psych", ch: 6 }, m, cat).url, "https://openstax.org/books/psychology-2e/pages/6-introduction");
  assert.equal(SRC.resolve({ doi: "10.1/x" }, m, cat).url, "https://doi.org/10.1/x");
  assert.equal(SRC.resolve({ lit: "Myers 2023", where: "Lernen" }, m, cat).book, books[2]);
  assert.equal(SRC.resolve({ mat: "Kurs" }, m, cat).url, "https://example.org/kurs");
  for (const bad of [{ lit: "Myers 2020" }, { oer: "psych", sec: "6.9" }, { doi: "10.9/none" }, { mat: "fehlt" }, { foo: 1 }]) assert.equal(SRC.resolve(bad, m, cat), null, JSON.stringify(bad));
});

test("Katalog: OpenStax-Abschnitte vollständig, DOIs wohlgeformt, Quellenlinks in der Linkprüfung", () => {
  const PP = loadData();
  const psych = PP.sourceCatalog.oer.psych;
  for (const sec of Object.keys(psych.sections)) assert.ok(psych.chapters[sec.split(".")[0]], sec);
  for (const doi of Object.keys(PP.sourceCatalog.dois)) assert.match(doi, /^10\.\d{4,9}\/\S+$/);
  const urls = SRC.urls(PP);
  assert.ok(urls.every((u) => /^https:\/\/(openstax\.org|doi\.org)\//.test(u.url)));
});
