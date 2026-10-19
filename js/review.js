/* PPReview – fachliche Prüfung der Inhalte (Lernthemen, Quizfragen, Prüfungsfragen).
 * Ein Prüfvermerk { s: "ok" | "fehler", by, date, note } hängt an einer ID aus Modul und Hash des Textes:
 *   t:<Modul>:<Hash Titel>   q:<Modul>:<Hash Frage> (wie in der Wiederholung)   x:<Modul>:<Hash Frage>
 * Ändert sich der Text, ändert sich die ID – der Inhalt gilt dann wieder als ungeprüft.
 * Gemeinsame Vermerke stehen in data/review.js (PP.review), eigene im Lernstand der App.
 * Browser (window.PPReview, benötigt PPSrs) und Node (require). */
(function (root, factory) {
  const api = factory(typeof module === "object" && module.exports ? require("./srs.js") : root.PPSrs);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PPReview = api;
})(typeof self !== "undefined" ? self : this, function (R) {
  "use strict";
  const KINDS = { topic: "Lernthema", quiz: "Quizfrage", exam: "Prüfungsfrage" };
  const topicId = (mod, t) => `t:${mod}:${R.hash(t.title)}`;
  const quizId = (mod, q) => R.quizId(mod, q);
  const examId = (mod, q) => `x:${mod}:${R.hash(q.q)}`;

  /** Alle prüfbaren Inhalte, in Modulreihenfolge. */
  function collect(modules) {
    const out = [];
    modules.forEach((m) => {
      (m.topics || []).forEach((t, i) => out.push({ id: topicId(m.id, t), kind: "topic", mod: m.id, i, item: t }));
      (m.quiz || []).forEach((q, i) => out.push({ id: quizId(m.id, q), kind: "quiz", mod: m.id, i, item: q }));
      (m.exam || []).forEach((q, i) => out.push({ id: examId(m.id, q), kind: "exam", mod: m.id, i, item: q }));
    });
    return out;
  }
  /** Gültiger Vermerk: eigener (lokal) vor gemeinsamem (Repository). */
  function status(id, shared, local) {
    const l = local && local[id];
    if (l && l.s) return Object.assign({ local: true }, l);
    const s = shared && shared[id];
    return s && s.s ? s : null;
  }
  /** Zählung je Modul und Art: { [mod]: { topic: {total, ok, fehler}, quiz: …, exam: … } } und gesamt. */
  function stats(items, shared, local) {
    const per = {}, all = { total: 0, ok: 0, fehler: 0 };
    items.forEach((it) => {
      const m = per[it.mod] = per[it.mod] || { topic: { total: 0, ok: 0, fehler: 0 }, quiz: { total: 0, ok: 0, fehler: 0 }, exam: { total: 0, ok: 0, fehler: 0 } };
      const st = status(it.id, shared, local), k = m[it.kind];
      k.total++; all.total++;
      if (st && st.s === "ok") { k.ok++; all.ok++; }
      if (st && st.s === "fehler") { k.fehler++; all.fehler++; }
    });
    return { per, all };
  }
  /** Export der eigenen Vermerke (zum Einpflegen mit tools/merge-review.mjs). */
  function exportData(local, meta = {}) {
    const items = {};
    Object.keys(local || {}).sort().forEach((id) => { const v = local[id]; if (v && v.s) items[id] = { s: v.s, by: v.by || "", date: v.date || "", note: v.note || "" }; });
    return Object.assign({ app: "PsychoPfad Wien", kind: "review" }, meta, { items });
  }
  /** Vermerke zusammenführen; neuere (Datum) gewinnen, Einträge mit s: "" löschen. Unbekannte IDs werden gemeldet. */
  function merge(shared, incoming, knownIds) {
    const out = Object.assign({}, shared), unknown = [];
    Object.entries(incoming || {}).forEach(([id, v]) => {
      if (knownIds && !knownIds.has(id)) { unknown.push(id); return; }
      if (!v || !v.s) { delete out[id]; return; }
      if (!out[id] || String(v.date || "") >= String(out[id].date || "")) out[id] = { s: v.s, by: v.by || "", date: v.date || "", note: v.note || "" };
    });
    return { review: out, unknown };
  }
  return { KINDS, topicId, quizId, examId, collect, status, stats, exportData, merge };
});
