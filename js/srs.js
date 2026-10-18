/* PPSrs – modulübergreifende Wiederholung mit wachsenden Abständen (Leitner-Boxen mit Fälligkeitsdatum).
 * Reine Funktionen: Browser (window.PPSrs) und Node (require). */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PPSrs = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  // Box → Abstand in Tagen bis zur nächsten Wiederholung
  const INTERVALS = [0, 1, 3, 7, 16, 35, 80];
  const MAX_BOX = INTERVALS.length - 1;

  function hash(str) { // FNV-1a, 32 Bit → base36; stabile IDs unabhängig von der Reihenfolge im Datenbestand
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(36);
  }
  const pad = (n) => String(n).padStart(2, "0");
  function today(d = new Date()) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
  function addDays(day, n) { const [y, m, dd] = day.split("-").map(Number); const d = new Date(y, m - 1, dd + n); return today(d); }

  function quizId(modId, q) { return `q:${modId}:${hash(q.q)}`; }
  function cardId(modId, term) { return `g:${modId}:${hash(term)}`; }

  /** Alle wiederholbaren Elemente aus den Moduldaten. */
  function collect(modules) {
    const items = [];
    modules.forEach((m, mi) => {
      (m.glossary || []).forEach(([term, def], i) => items.push({ id: cardId(m.id, term), kind: "card", mod: m.id, order: mi * 1000 + i, term, def }));
      (m.quiz || []).forEach((q, i) => items.push({ id: quizId(m.id, q), kind: "quiz", mod: m.id, order: mi * 1000 + 500 + i, q }));
    });
    return items;
  }

  /** Neue Karte bzw. Ergebnis einer Wiederholung. */
  function review(card, correct, day) {
    const c = Object.assign({ box: 0, reps: 0, lapses: 0 }, card || {});
    c.reps += 1; c.last = day;
    if (correct) { c.box = Math.min(MAX_BOX, c.box + 1); c.due = addDays(day, INTERVALS[c.box]); }
    else { c.box = 1; c.lapses += 1; c.due = day; }
    return c;
  }
  /** Falsch beantwortete Quizfrage außerhalb der Wiederholung: heute fällig, ohne bestehenden Fortschritt zu verbessern. */
  function markWrong(card, day) {
    const c = Object.assign({ box: 0, reps: 0, lapses: 0 }, card || {});
    c.box = 1; c.lapses += 1; c.due = day; c.last = day;
    return c;
  }
  const isDue = (card, day) => !!card && !!card.due && card.due <= day;

  /**
   * Warteschlange für heute: alle fälligen Elemente (älteste zuerst) plus bis zu
   * `newLimit − bereits heute eingeführte` neue Elemente aus `newModules` in Curriculumsreihenfolge.
   */
  function buildQueue(items, srs, day, opts = {}) {
    const newLimit = opts.newLimit == null ? 15 : opts.newLimit;
    const introduced = opts.introducedToday || 0;
    const mods = opts.newModules ? new Set(opts.newModules) : null;
    const kinds = opts.kinds ? new Set(opts.kinds) : null;
    const due = items.filter((it) => (!kinds || kinds.has(it.kind)) && isDue(srs[it.id], day))
      .sort((a, b) => srs[a.id].due.localeCompare(srs[b.id].due) || srs[a.id].box - srs[b.id].box);
    const fresh = items.filter((it) => (!kinds || kinds.has(it.kind)) && !srs[it.id] && (!mods || mods.has(it.mod)))
      .sort((a, b) => a.order - b.order)
      .slice(0, Math.max(0, newLimit - introduced));
    return { due, fresh, all: interleave(due.concat(fresh)) };
  }
  /** Verzahnt Elemente verschiedener Module (Interleaving), Reihenfolge innerhalb eines Moduls bleibt erhalten. */
  function interleave(items) {
    const byMod = new Map();
    items.forEach((it) => { if (!byMod.has(it.mod)) byMod.set(it.mod, []); byMod.get(it.mod).push(it); });
    const lists = [...byMod.values()], out = [];
    for (let i = 0; out.length < items.length; i++) lists.forEach((l) => { if (l[i]) out.push(l[i]); });
    return out;
  }
  function stats(items, srs, day) {
    const s = { total: items.length, learned: 0, due: 0, mature: 0, byBox: new Array(MAX_BOX + 1).fill(0) };
    items.forEach((it) => { const c = srs[it.id]; if (!c) return; s.learned++; s.byBox[c.box]++; if (isDue(c, day)) s.due++; if (c.box >= 4) s.mature++; });
    return s;
  }
  /** Übernahme der alten modulweisen Leitner-Boxen (state.cards[mod][index] = 0–4). */
  function migrateCards(oldCards, modules, srs, day) {
    Object.entries(oldCards || {}).forEach(([mod, boxes]) => {
      const m = modules.find((x) => x.id === mod); if (!m) return;
      Object.entries(boxes).forEach(([i, box]) => {
        const g = (m.glossary || [])[+i]; if (!g) return;
        const id = cardId(mod, g[0]); if (srs[id]) return;
        srs[id] = { box: Math.min(MAX_BOX, +box + 1), reps: 1, lapses: 0, due: day, last: day };
      });
    });
    return srs;
  }
  return { INTERVALS, MAX_BOX, hash, today, addDays, quizId, cardId, collect, review, markWrong, isDue, buildQueue, interleave, stats, migrateCards };
});
