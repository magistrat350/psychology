/* PPAnki – erzeugt eine Anki-Importdatei (Text, tabulatorgetrennt, HTML erlaubt).
 * Spalten: Vorderseite, Rückseite, Stapel, Schlagwörter. Browser (window.PPAnki) und Node (require). */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PPAnki = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const DECK = "PsychoPfad Wien";
  const LETTERS = "ABCDEFGH";
  const escHtml = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  // Minimal-Markup der App (**fett**, Listen mit „- “, Absätze) → HTML ohne Tabulatoren/Zeilenumbrüche
  function richHtml(s) {
    return escHtml(s).split(/\n\s*\n/).map((b) => {
      const lines = b.split("\n");
      const inl = (x) => x.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, "<i>$1</i>");
      if (lines.every((l) => /^\s*- /.test(l))) return "<ul>" + lines.map((l) => "<li>" + inl(l.replace(/^\s*- /, "")) + "</li>").join("") + "</ul>";
      return "<p>" + inl(lines.join("<br>")) + "</p>";
    }).join("");
  }
  const field = (s) => String(s).replace(/[\t\r\n]+/g, " ");
  const tag = (s) => String(s).replace(/[^A-Za-z0-9ÄÖÜäöüß_-]+/g, "_");
  const deckName = (m) => `${DECK}::${m.id} ${m.short || m.title}`.replace(/:{3,}/g, "::").replace(/\t/g, " ");

  function rows(modules, opts = {}) {
    const kinds = new Set(opts.kinds || ["card", "quiz", "exam"]);
    const out = [];
    modules.forEach((m) => {
      const deck = deckName(m), base = `PsychoPfad Modul_${tag(m.id)}`;
      if (kinds.has("card")) (m.glossary || []).forEach(([t, d]) => out.push([`<b>${escHtml(t)}</b>`, escHtml(d), deck, `${base} Begriff`]));
      if (kinds.has("quiz")) (m.quiz || []).forEach((q) => {
        const front = `${escHtml(q.q)}<ol type=A>${q.o.map((o) => `<li>${escHtml(o)}</li>`).join("")}</ol>`;
        const back = `<b>${LETTERS[q.a]}) ${escHtml(q.o[q.a])}</b>${q.e ? `<br>${escHtml(q.e)}` : ""}`;
        out.push([front, back, deck, `${base} Quiz`]);
      });
      if (kinds.has("exam")) (m.exam || []).forEach((q) => out.push([`${escHtml(q.q)} <i>(${q.p} P.)</i>`, richHtml(q.s), deck, `${base} Pruefungsfrage`]));
    });
    return out;
  }
  function build(modules, opts = {}) {
    const header = ["#separator:tab", "#html:true", "#deck column:3", "#tags column:4"];
    return header.concat(rows(modules, opts).map((r) => r.map(field).join("\t"))).join("\n") + "\n";
  }
  return { build, rows, richHtml, DECK };
});
