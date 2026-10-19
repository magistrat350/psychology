/* PPSources – löst die Quellenangaben der Lernthemen (PP.topicSources) in Zitat + Link auf.
 * Quellenarten:
 *   { lit: "Myers 2014", where: "…" }  Buch aus der Literaturliste des Moduls ("Nachname Jahr", bei Gleichstand + erstes Titelwort)
 *   { oer: "psych", sec: "6.2" }        OpenStax-Abschnitt bzw. { oer: "stats", ch: 9 } -Kapitel (PP.sourceCatalog.oer)
 *   { doi: "10.1037/…" }               Fachartikel aus PP.sourceCatalog.dois
 *   { mat: "<Titel>" }                 frei zugängliche Quelle aus den Materialien/Vorlesungen des Moduls
 * Browser (window.PPSources) und Node (require). */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PPSources = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const surname = (b) => String(b.authors || "").split(/[,&(]/)[0].trim().split(/\s+/)[0];
  /** Schlüssel je Buch der Literaturliste, eindeutig innerhalb des Moduls. */
  function litKeys(books) {
    const base = (books || []).map((b) => `${surname(b)} ${b.year}`);
    return base.map((k, i) => (base.indexOf(k) !== base.lastIndexOf(k) ? `${k} ${String(books[i].title).split(/[\s:]+/)[0]}` : k));
  }
  /** OpenStax-Adresse: Abschnitt "6.2" → 6-2-classical-conditioning, Kapitel 6 → 6-introduction. */
  function slug(s) {
    return String(s).toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/[\s-]+/g, "-");
  }
  function oerRef(book, src) {
    if (src.sec) {
      const title = book.sections[src.sec];
      if (!title) return null;
      return { text: `${book.title}, Abschnitt ${src.sec} „${title}“`, url: book.base + src.sec.replace(".", "-") + "-" + slug(title), free: true };
    }
    const title = book.chapters[src.ch];
    if (!title) return null;
    return { text: `${book.title}, Kapitel ${src.ch} „${title}“`, url: `${book.base}${src.ch}-introduction`, free: true };
  }
  /** Eine Quellenangabe auflösen → { text, url?, free, book? } oder null, wenn sie nicht passt. */
  function resolve(src, mod, catalog) {
    if (src.lit) {
      const keys = litKeys(mod.literature), i = keys.indexOf(src.lit);
      if (i < 0) return null;
      const b = mod.literature[i];
      return { text: `${b.authors} (${b.year}). ${b.title}${b.ed ? ` (${b.ed})` : ""}`, where: src.where || "", book: b, free: false };
    }
    if (src.oer) { const book = catalog.oer[src.oer]; return book ? oerRef(book, src) : null; }
    if (src.doi) { const c = catalog.dois[src.doi]; return c ? { text: c, url: "https://doi.org/" + src.doi, free: false } : null; }
    if (src.mat) {
      const r = (mod.materials || []).concat(mod.lectures || []).find((x) => x.title === src.mat);
      return r ? { text: r.title, url: r.url, free: true } : null;
    }
    return null;
  }
  /** Alle Links der Quellenangaben (für die Linkprüfung). */
  function urls(PP) {
    const out = [];
    PP.modules.forEach((m) => Object.entries((PP.topicSources || {})[m.id] || {}).forEach(([title, list]) => list.forEach((s) => {
      const r = resolve(s, m, PP.sourceCatalog);
      if (r && r.url && (s.oer || s.doi)) out.push({ url: r.url, title: r.text, where: `${m.id} · Quelle zu „${title}“` });
    })));
    return out;
  }
  return { litKeys, slug, resolve, urls };
});
