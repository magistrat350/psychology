/* PPSrs – modulübergreifende Wiederholung mit FSRS (Free Spaced Repetition Scheduler, Version 6).
 * Jede Karte hat ein Gedächtnismodell aus Stabilität S (Tage, nach denen sie mit 90 % Wahrscheinlichkeit noch
 * gewusst wird) und Schwierigkeit D (1–10). Der nächste Termin richtet sich nach der gewünschten Behaltensquote
 * (Standard 90 %). Formeln und Standardparameter wie die Referenzimplementierung ts-fsrs 5.4 (FSRS-6; im
 * Test tests/unit/srs.test.mjs gegengeprüft), auf ganze Tage gerundet und ohne Lernschritte im Minutenbereich.
 * Bewertungen: 1 = nochmal, 2 = schwer, 3 = gut, 4 = leicht (true/false wird als 3/1 gelesen).
 * Reine Funktionen: Browser (window.PPSrs) und Node (require). */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PPSrs = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  // Frühere Leitner-Boxen → Abstand in Tagen (nur noch zur Übernahme alter Lernstände)
  const INTERVALS = [0, 1, 3, 7, 16, 35, 80];
  const MAX_BOX = INTERVALS.length - 1;

  // ---------- FSRS-6 ----------
  const W = [0.212, 1.2931, 2.3065, 8.2956, 6.4133, 0.8334, 3.0194, 0.001, 1.8722, 0.1666, 0.796, 1.4835, 0.0614, 0.2629, 1.6483, 0.6014, 1.8729, 0.5425, 0.0912, 0.0658, 0.1542];
  const S_MIN = 0.001, S_MAX = 36500, MAX_INTERVAL = 36500, RETENTION = 0.9, MATURE_DAYS = 21;
  const clamp = (x, lo, hi) => Math.min(Math.max(x, lo), hi);
  const roundTo = (x, n) => Math.round(x * 10 ** n) / 10 ** n;
  const DECAY = -W[20], FACTOR = roundTo(Math.exp(Math.log(0.9) / DECAY) - 1, 8);
  /** Abrufwahrscheinlichkeit nach t Tagen bei Stabilität s. */
  const retrievability = (t, s) => roundTo(Math.pow(1 + FACTOR * t / s, DECAY), 8);
  const intervalModifier = (r) => roundTo((Math.pow(r, 1 / DECAY) - 1) / FACTOR, 8);
  const initStability = (g) => Math.max(W[g - 1], 0.1);
  const initDifficulty = (g) => roundTo(W[4] - Math.exp((g - 1) * W[5]) + 1, 8);
  function nextDifficulty(d, g) {
    const next = d + roundTo(-W[6] * (g - 3) * (10 - d) / 9, 8);             // lineare Dämpfung
    return clamp(roundTo(W[7] * initDifficulty(4) + (1 - W[7]) * next, 8), 1, 10);   // Rückkehr zum Mittelwert
  }
  function nextState(mem, t, g) {
    if (!mem) return { d: clamp(initDifficulty(g), 1, 10), s: initStability(g) };
    const { d, s } = mem, r = retrievability(t, s);
    let ns;
    if (t === 0) {   // am selben Tag erneut: Kurzzeit-Stabilität
      const sinc = Math.pow(s, -W[19]) * Math.exp(W[17] * (g - 3 + W[18]));
      ns = roundTo(clamp(s * (g >= 2 ? Math.max(sinc, 1) : sinc), S_MIN, S_MAX), 8);
    } else if (g === 1) {   // vergessen
      const fail = roundTo(clamp(W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp((1 - r) * W[14]), S_MIN, S_MAX), 8);
      ns = clamp(roundTo(s / Math.exp(W[17] * W[18]), 8), S_MIN, fail);
    } else {   // gewusst: schwer / gut / leicht
      const hard = g === 2 ? W[15] : 1, easy = g === 4 ? W[16] : 1;
      ns = roundTo(clamp(s * (1 + Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp((1 - r) * W[10]) - 1) * hard * easy), S_MIN, S_MAX), 8);
    }
    return { d: nextDifficulty(d, g), s: ns };
  }
  /** Abstand in Tagen für Stabilität s und gewünschte Behaltensquote r. */
  const nextInterval = (s, r = RETENTION) => Math.min(Math.max(1, Math.round(s * intervalModifier(r))), MAX_INTERVAL);
  const daysBetween = (a, b) => { const [y1, m1, d1] = a.split("-").map(Number), [y2, m2, d2] = b.split("-").map(Number); return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 864e5); };
  const toGrade = (g) => (g === true ? 3 : g === false ? 1 : clamp(Math.round(+g) || 1, 1, 4));
  /** Gedächtnismodell einer Karte; ältere Leitner-Karten werden geschätzt (Stabilität ≈ bisheriger Abstand). */
  function memory(card) {
    if (!card) return null;
    if (card.s > 0 && card.d >= 1) return { d: card.d, s: card.s };
    if (card.box == null) return null;
    return { d: clamp(initDifficulty(3) + (card.lapses || 0) * 0.5, 1, 10), s: Math.max(W[2], INTERVALS[Math.min(card.box, MAX_BOX)] || 0) };
  }

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

  /** Neue Karte bzw. Ergebnis einer Wiederholung. grade: 1–4 (oder true/false); opts.retention: gewünschte Behaltensquote. */
  function review(card, grade, day, opts = {}) {
    const g = toGrade(grade), mem = memory(card);
    const t = mem && card.last ? Math.max(0, daysBetween(card.last, day)) : 0;
    const next = nextState(mem, t, g);
    const c = { s: next.s, d: next.d, reps: ((card && card.reps) || 0) + 1, lapses: ((card && card.lapses) || 0) + (g === 1 && mem ? 1 : 0), last: day };
    c.due = g === 1 ? day : addDays(day, nextInterval(c.s, opts.retention || RETENTION));
    return c;
  }
  /** Falsch beantwortete Quizfrage außerhalb der Wiederholung: zählt als „nochmal“, heute fällig. */
  const markWrong = (card, day, opts) => review(card, 1, day, opts);
  const isDue = (card, day) => !!card && !!card.due && card.due <= day;
  /** Abrufwahrscheinlichkeit einer Karte heute (null bei neuen Karten). */
  function cardRetrievability(card, day) {
    const mem = memory(card);
    return mem && card.last ? retrievability(Math.max(0, daysBetween(card.last, day)), mem.s) : null;
  }
  /** Vorschau der Abstände für die vier Bewertungen (Beschriftung der Knöpfe). */
  const preview = (card, day, opts = {}) => [1, 2, 3, 4].map((g) => { const c = review(card, g, day, opts); return g === 1 ? 0 : daysBetween(day, c.due); });

  /**
   * Warteschlange für heute: alle fälligen Elemente (älteste zuerst) plus bis zu
   * `newLimit − bereits heute eingeführte` neue Elemente aus `newModules` in Curriculumsreihenfolge.
   */
  function buildQueue(items, srs, day, opts = {}) {
    const newLimit = opts.newLimit == null ? 15 : opts.newLimit;
    const introduced = opts.introducedToday || 0;
    const mods = opts.newModules ? new Set(opts.newModules) : null;
    const kinds = opts.kinds ? new Set(opts.kinds) : null;
    // fällige Elemente: am stärksten „verblasste“ (niedrigste Abrufwahrscheinlichkeit) zuerst
    const rOf = (it) => { const r = cardRetrievability(srs[it.id], day); return r == null ? 0 : r; };
    const due = items.filter((it) => (!kinds || kinds.has(it.kind)) && isDue(srs[it.id], day))
      .sort((a, b) => rOf(a) - rOf(b) || srs[a.id].due.localeCompare(srs[b.id].due));
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
  /** Stabilitätsklassen für die Übersicht. */
  const SPANS = [{ max: 1, label: "< 1 Tag" }, { max: 7, label: "1–7 Tage" }, { max: 21, label: "1–3 Wochen" }, { max: 90, label: "3 Wochen – 3 Monate" }, { max: Infinity, label: "> 3 Monate" }];
  function stats(items, srs, day) {
    const s = { total: items.length, learned: 0, due: 0, mature: 0, bySpan: SPANS.map(() => 0), spans: SPANS.map((x) => x.label) };
    items.forEach((it) => {
      const c = srs[it.id], mem = memory(c); if (!mem) return;
      s.learned++; s.bySpan[SPANS.findIndex((x) => mem.s < x.max)]++;
      if (isDue(c, day)) s.due++;
      if (mem.s >= MATURE_DAYS) s.mature++;
    });
    return s;
  }
  /** Fällige Elemente je Tag der nächsten `days` Tage (ohne neue; Tag 0 = heute inkl. überfälliger). */
  function forecast(items, srs, day, days) {
    const out = new Array(days).fill(0), last = addDays(day, days - 1);
    items.forEach((it) => { const c = srs[it.id]; if (!c || !c.due || c.due > last) return; out[Math.max(0, daysBetween(day, c.due))]++; });
    return out;
  }
  /** Übernahme der alten modulweisen Leitner-Boxen (state.cards[mod][index] = 0–4). */
  function migrateCards(oldCards, modules, srs, day) {
    Object.entries(oldCards || {}).forEach(([mod, boxes]) => {
      const m = modules.find((x) => x.id === mod); if (!m) return;
      Object.entries(boxes).forEach(([i, box]) => {
        const g = (m.glossary || [])[+i]; if (!g) return;
        const id = cardId(mod, g[0]); if (srs[id]) return;
        const mem = memory({ box: Math.min(MAX_BOX, +box + 1), lapses: 0 });
        srs[id] = { s: mem.s, d: mem.d, reps: 1, lapses: 0, due: day, last: day };
      });
    });
    return srs;
  }
  return { W, RETENTION, MATURE_DAYS, hash, today, addDays, daysBetween, quizId, cardId, collect, review, markWrong, isDue, preview, retrievability, cardRetrievability,
    nextState, nextInterval, memory, buildQueue, interleave, stats, forecast, migrateCards };
});
