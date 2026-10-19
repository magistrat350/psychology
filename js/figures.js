/* PPFigures – schematische Abbildungen (inline-SVG) zu den Lernthemen.
 * Farben ausschließlich über CSS-Klassen aus css/figures.css (Hell- und Dunkelmodus).
 * Browser: window.PPFigures, Node: require("./js/figures.js").
 * API: list() → [{ id, title, caption, alt }], render(id) → SVG-String, html(id) → <figure> mit Bildunterschrift. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PPFigures = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ---------- SVG-Bausteine ----------
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const n = (v) => { const r = Math.round(v * 10) / 10; return String(r === 0 ? 0 : r); };
  function el(tag, a, inner) {
    let s = "<" + tag;
    for (const k in a) { const v = a[k]; if (v == null || v === false) continue; s += ` ${k}="${typeof v === "number" ? n(v) : esc(v)}"`; }
    return inner == null ? s + "/>" : s + ">" + inner + "</" + tag + ">";
  }
  const line = (x1, y1, x2, y2, cls = "fig-line") => el("line", { x1, y1, x2, y2, class: cls });
  const lead = (x1, y1, x2, y2) => line(x1, y1, x2, y2, "fig-lead");
  const rect = (x, y, w, h, cls = "fig-line", rx) => el("rect", { x, y, width: w, height: h, rx, class: cls });
  const circ = (cx, cy, r, cls = "fig-line") => el("circle", { cx, cy, r, class: cls });
  const ell = (cx, cy, rx, ry, cls = "fig-line") => el("ellipse", { cx, cy, rx, ry, class: cls });
  const path = (d, cls = "fig-line") => el("path", { d, class: cls });
  const pts = (p) => p.map(([x, y]) => n(x) + "," + n(y)).join(" ");
  const poly = (p, cls) => el("polygon", { points: pts(p), class: cls });
  const pl = (p, cls = "fig-line") => el("polyline", { points: pts(p), class: cls });
  const dPts = (p) => p.map(([x, y], i) => (i ? "L" : "M") + n(x) + "," + n(y)).join("");

  /** Text; s = String oder Array (mehrere Zeilen). o.a: "start" | "middle" | "end", o.c: Zusatzklassen, o.lh: Zeilenabstand */
  function T(x, y, s, o = {}) {
    const small = /fig-small/.test(o.c || "");
    const cls = "fig-label" + (o.c ? " " + o.c : "");
    const lines = Array.isArray(s) ? s : [s];
    const lh = o.lh || (small ? 13 : 15);
    const inner = lines.length === 1 ? esc(lines[0])
      : lines.map((l, i) => `<tspan x="${n(x)}" dy="${i ? n(lh) : 0}">${esc(l)}</tspan>`).join("");
    const a = o.a || "middle";
    return el("text", { x, y, class: cls, "text-anchor": a === "start" ? null : a, transform: o.rot ? `rotate(${o.rot} ${n(x)} ${n(y)})` : null }, inner);
  }
  const S = (x, y, s, o = {}) => T(x, y, s, Object.assign({}, o, { c: "fig-small" + (o.c ? " " + o.c : "") }));

  function head(tx, ty, ux, uy, h, tone) {
    const w = h * 0.55;
    return poly([[tx, ty], [tx - ux * h - uy * w, ty - uy * h + ux * w], [tx - ux * h + uy * w, ty - uy * h - ux * w]], "fig-head" + tone);
  }
  /** Pfeil mit gefüllter Spitze. o.tone: accent | muted | ok, o.both: Spitzen an beiden Enden, o.cls: Zusatzklassen der Linie */
  function arrow(x1, y1, x2, y2, o = {}) {
    const h = o.head || 7, dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
    const tone = o.tone ? " fig-" + o.tone : "";
    let sx = x1, sy = y1, out = "";
    if (o.both) { out += head(x1, y1, -ux, -uy, h, tone); sx += ux * h * 0.8; sy += uy * h * 0.8; }
    return line(sx, sy, x2 - ux * h * 0.8, y2 - uy * h * 0.8, "fig-line" + tone + (o.cls ? " " + o.cls : "")) + out + head(x2, y2, ux, uy, h, tone);
  }
  /** gebogener Pfeil: Pfad d endet an (tx, ty), Richtung der Spitze (vx, vy) */
  function carrow(d, tx, ty, vx, vy, o = {}) {
    const L = Math.hypot(vx, vy) || 1, tone = o.tone ? " fig-" + o.tone : "";
    return path(d, "fig-line" + tone + (o.cls ? " " + o.cls : "")) + head(tx, ty, vx / L, vy / L, o.head || 7, tone);
  }
  /** Kasten mit zentrierten Zeilen: lines = [[Text, Zusatzklassen], …] */
  function box(x, y, w, h, lines, cls = "fig-line fig-soft", rx = 6) {
    const lh = lines.map(([, c]) => (/fig-small/.test(c || "") ? 13 : 15));
    const total = lh.slice(1).reduce((a, b) => a + b, 0);
    let yy = y + h / 2 - total / 2 + 4.5, s = rect(x, y, w, h, cls, rx);
    lines.forEach(([t, c], i) => { if (i) yy += lh[i]; s += T(x + w / 2, yy, t, { c }); });
    return s;
  }
  /** Schraffur einer Fläche (über clipPath, keine Farbattribute) */
  function hatch(id, d, x0, y0, x1, y1, gap = 6) {
    let s = "";
    for (let k = x0 - (y1 - y0); k < x1; k += gap) s += line(k, y1, k + (y1 - y0), y0, "fig-hatch");
    return `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">${s}</g>`;
  }
  const npdf = (x, m = 0, s = 1) => Math.exp(-0.5 * ((x - m) / s) ** 2) / (s * Math.sqrt(2 * Math.PI));
  function fnPath(fn, a, b, X, Y, steps = 100) {
    const p = [];
    for (let i = 0; i <= steps; i++) { const x = a + (b - a) * i / steps; p.push([X(x), Y(fn(x))]); }
    return dPts(p);
  }
  const areaPath = (fn, a, b, X, Y, y0, steps = 70) => fnPath(fn, a, b, X, Y, steps) + `L${n(X(b))},${n(y0)}L${n(X(a))},${n(y0)}Z`;
  /** glatte Kurve durch Punkte (Catmull-Rom → kubische Bézier) */
  function smooth(p) {
    let d = `M${n(p[0][0])},${n(p[0][1])}`;
    for (let i = 0; i < p.length - 1; i++) {
      const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2;
      d += `C${n(p1[0] + (p2[0] - p0[0]) / 6)},${n(p1[1] + (p2[1] - p0[1]) / 6)} ${n(p2[0] - (p3[0] - p1[0]) / 6)},${n(p2[1] - (p3[1] - p1[1]) / 6)} ${n(p2[0])},${n(p2[1])}`;
    }
    return d;
  }
  const fmt = (v) => String(v).replace("-", "−").replace(".", ",");

  const FIGS = [];
  const def = (f) => FIGS.push(f);

  // ---------- Biologische Psychologie ----------
  def({
    id: "neuron", title: "Aufbau eines Neurons", w: 440, h: 218,
    caption: "Dendriten nehmen Signale auf, am Axonhügel entsteht das Aktionspotenzial; entlang des myelinisierten Axons springt die Erregung von Schnürring zu Schnürring (saltatorisch) bis zu den Endknöpfchen.",
    alt: "Schema eines Neurons von links nach rechts: verzweigte Dendriten, Zellkörper (Soma) mit Zellkern, kegelförmiger Axonhügel, Axon mit vier Myelinscheiden-Abschnitten und Ranvier-Schnürringen in den Lücken, am Ende verzweigte Axonterminale mit Endknöpfchen. Ein Pfeil zeigt die Erregungsleitung von den Dendriten zu den Endknöpfchen.",
    draw() {
      let s = "";
      [["M62,92 L40,70", "M40,70 L22,62 M40,70 L34,46"], ["M56,112 L28,114", "M28,114 L12,102 M28,114 L12,128"],
        ["M64,133 L42,156", "M42,156 L24,162 M42,156 L38,180"], ["M80,86 L76,58", "M76,58 L62,44 M76,58 L90,42"],
        ["M88,138 L86,170", "M86,170 L72,186 M86,170 L100,184"]].forEach(([a, b]) => { s += path(a, "fig-line fig-thick") + path(b); });
      s += circ(82, 112, 28, "fig-line fig-soft");
      s += poly([[100, 99], [134, 108], [134, 116], [100, 125]], "fig-soft") + line(106.8, 99, 134, 108) + line(106.8, 125, 134, 116);
      s += circ(78, 110, 10, "fig-line fig-accent-soft") + circ(80, 108, 2.5, "fig-ink");
      s += rect(134, 108, 218, 8, "fig-soft") + line(134, 108, 352, 108) + line(134, 116, 352, 116);
      [140, 192, 244, 296].forEach((x) => { s += rect(x, 101, 44, 22, "fig-line fig-accent-soft", 9); });
      s += path("M352,112 C368,112 372,84 391,80 M352,112 L391,112 M352,112 C368,112 372,140 391,144");
      [80, 112, 144].forEach((y) => { s += circ(398, y, 7, "fig-line fig-accent-soft"); });
      s += arrow(160, 34, 350, 34, { tone: "accent" }) + T(255, 25, "Richtung der Erregungsleitung", { c: "fig-small" });
      s += T(8, 20, "Dendriten", { a: "start" }) + lead(30, 25, 33, 42);
      s += T(110, 20, "Zellkern") + lead(104, 25, 82, 100);
      s += T(140, 76, "Axonhügel") + lead(132, 80, 122, 103);
      s += T(246, 76, "Ranvier-Schnürring") + lead(240, 80, 240, 106);
      s += T(436, 62, "Endknöpfchen", { a: "end" }) + lead(408, 66, 402, 73);
      s += T(214, 148, "Myelinscheide") + lead(214, 137, 214, 124);
      s += T(330, 148, "Axon") + lead(334, 137, 346, 118);
      s += T(124, 208, "Zellkörper (Soma)") + lead(114, 196, 101, 133);
      return s;
    },
  });

  def({
    id: "synapse", title: "Chemische Synapse", w: 440, h: 262,
    caption: "Ein ankommendes Aktionspotenzial führt zur Ausschüttung von Neurotransmittern aus Vesikeln (Exozytose); sie binden an Rezeptoren der postsynaptischen Membran und werden u. a. durch Wiederaufnahme wieder entfernt.",
    alt: "Schema einer chemischen Synapse: oben die präsynaptische Endigung mit Vesikeln voller Neurotransmitter, ein Vesikel verschmilzt mit der Membran und setzt Transmitter in den synaptischen Spalt frei. Unten die postsynaptische Membran mit Rezeptoren, an die Transmitter binden. Links ein Transporter in der präsynaptischen Membran, durch den Transmitter wieder aufgenommen werden (Pfeil nach oben).",
    draw() {
      let s = "";
      s += path("M200,0 L200,22 C200,50 150,52 150,92 L150,126 Q150,140 164,140 L296,140 Q310,140 310,126 L310,92 C310,52 260,50 260,22 L260,0 Z", "fig-soft");
      s += path("M200,0 L200,22 C200,50 150,52 150,92 L150,126 Q150,140 164,140 L252,140");
      s += path("M272,140 L296,140 Q310,140 310,126 L310,92 C310,52 260,50 260,22 L260,0");
      s += path("M252,140 C250,124 274,124 272,140");
      [[192, 82], [226, 70], [260, 86], [198, 112], [232, 104], [288, 108]].forEach(([x, y]) => {
        s += circ(x, y, 9, "fig-line fig-bg");
        [[-3, -2], [3, -2], [0, 3]].forEach(([dx, dy]) => { s += circ(x + dx, y + dy, 1.8, "fig-accent fig-noline"); });
      });
      [[258, 147], [266, 152], [255, 155], [240, 158], [226, 150], [212, 157], [248, 163], [202, 152]].forEach(([x, y]) => { s += circ(x, y, 2.2, "fig-accent fig-noline"); });
      s += path("M130,262 L130,182 Q130,170 142,170 L318,170 Q330,170 330,182 L330,262 Z", "fig-soft");
      s += path("M130,262 L130,182 Q130,170 142,170 L318,170 Q330,170 330,182 L330,262");
      [190, 218, 246, 274].forEach((x, i) => {
        s += path(`M${x - 7},170 L${x - 7},160 L${x - 3},160 L${x - 3},165 L${x + 3},165 L${x + 3},160 L${x + 7},160 L${x + 7},170 Z`, "fig-line fig-tint-ok");
        if (i === 1 || i === 2) s += circ(x, 162.5, 2, "fig-accent fig-noline");
      });
      s += rect(162, 135, 12, 10, "fig-line fig-tint-muted", 2);
      s += circ(190, 159, 2.2, "fig-accent fig-noline");
      s += carrow("M184,159 C174,159 168,153 168,146 L168,123", 168, 118, 0, -1, { tone: "accent" });
      s += arrow(230, 4, 230, 40, { tone: "accent" }) + T(268, 20, "Aktionspotenzial", { a: "start" });
      s += T(128, 56, ["präsynaptische", "Endigung"], { a: "end" }) + lead(132, 62, 160, 72);
      s += T(128, 98, ["Vesikel mit", "Neurotransmitter"], { a: "end" }) + lead(132, 104, 187, 110);
      s += T(128, 139, "Wiederaufnahme", { a: "end" }) + lead(132, 136, 160, 139);
      s += T(120, 162, ["synaptischer", "Spalt"], { a: "end" }) + lead(124, 158, 156, 155);
      s += T(120, 208, ["postsynaptische", "Membran"], { a: "end" }) + lead(124, 204, 146, 172);
      s += T(322, 120, "Exozytose", { a: "start" }) + lead(320, 124, 274, 136);
      s += T(342, 200, "Rezeptoren", { a: "start" }) + lead(340, 196, 282, 166);
      s += S(230, 222, ["postsynaptisches Potenzial", "(EPSP oder IPSP)"]);
      return s;
    },
  });

  def({
    id: "aktionspotenzial", title: "Verlauf eines Aktionspotenzials", w: 440, h: 282,
    caption: "Überschreitet die Depolarisation die Schwelle (ca. −55 mV), öffnen spannungsabhängige Na⁺-Kanäle und das Potenzial steigt steil bis über 0 mV; durch K⁺-Ausstrom repolarisiert die Membran und sinkt kurz unter das Ruhepotenzial (Hyperpolarisation).",
    alt: "Liniendiagramm: Membranpotenzial in Millivolt über die Zeit in Millisekunden. Die Kurve liegt zunächst beim Ruhepotenzial von etwa −70 mV, steigt nach einem Reiz bis zur Schwelle von etwa −55 mV, dann steil an (Depolarisation, Na⁺ strömt ein) bis zum Overshoot bei etwa +35 mV, fällt wieder ab (Repolarisation, K⁺ strömt aus), unterschreitet kurz das Ruhepotenzial bis etwa −80 mV (Hyperpolarisation) und kehrt zum Ruhepotenzial zurück.",
    draw() {
      const X = (t) => 56 + t * 72.8, Y = (v) => 20 + (40 - v) * 220 / 140;
      let s = line(56, 20, 56, 240) + line(56, 240, 420, 240);
      [40, 0, -40, -80].forEach((v) => { s += line(52, Y(v), 56, Y(v)) + S(48, Y(v) + 4, (v > 0 ? "+" : "") + fmt(v), { a: "end" }); });
      [0, 1, 2, 3, 4, 5].forEach((t) => { s += line(X(t), 240, X(t), 244) + S(X(t), 256, String(t)); });
      s += line(56, Y(0), 420, Y(0), "fig-line fig-thin fig-dot fig-s-muted");
      s += line(56, Y(-55), 420, Y(-55), "fig-line fig-thin fig-dash fig-s-muted") + line(56, Y(-70), 420, Y(-70), "fig-line fig-thin fig-dash fig-s-muted");
      s += S(420, Y(-55) - 5, "Schwelle ≈ −55 mV", { a: "end" }) + S(420, Y(-70) - 5, "Ruhepotenzial ≈ −70 mV", { a: "end" });
      const P = [[0, -70], [0.8, -70], [1.05, -66], [1.25, -60], [1.38, -55], [1.5, -35], [1.6, 0], [1.7, 28], [1.8, 35], [1.92, 25], [2.1, -5],
        [2.35, -45], [2.55, -68], [2.75, -78], [3.0, -81], [3.4, -78], [3.9, -73], [4.5, -70.5], [5, -70]];
      s += path(smooth(P.map(([t, v]) => [X(t), Y(v)])), "fig-line fig-thick fig-accent");
      s += arrow(X(0.8), 226, X(0.8), Y(-70) + 6, { head: 6 }) + S(X(0.8) - 6, 230, "Reiz", { a: "end" });
      s += T(150, 98, "Depolarisation", { a: "end" }) + S(150, 113, "Na⁺ strömt ein", { a: "end" });
      s += T(205, 32, "Overshoot", { a: "start" });
      s += T(230, 98, "Repolarisation", { a: "start" }) + S(230, 113, "K⁺ strömt aus", { a: "start" });
      s += T(X(3.0), 230, "Hyperpolarisation");
      s += S(16, 130, "Membranpotenzial (mV)", { rot: -90 }) + S(420, 274, "Zeit (ms)", { a: "end" });
      return s;
    },
  });

  // Gehirn seitlich: gemeinsame Umrisslinie
  const BRAIN = "M128,196 C92,204 50,194 34,160 C20,110 60,56 160,46 C260,36 370,62 398,132 C410,170 392,210 352,214 C316,218 292,232 250,240 C200,250 140,248 126,226 C118,212 116,202 128,196 Z";
  def({
    id: "gehirn-lappen", title: "Großhirnlappen (linke Hemisphäre, seitlich)", w: 440, h: 330,
    caption: "Seitenansicht der linken Hemisphäre (Stirn links): Die Zentralfurche trennt Frontal- und Parietallappen, die Sylvische Furche (Sulcus lateralis) grenzt den Temporallappen ab; davor bzw. dahinter liegen der primäre motorische und der primäre somatosensorische Kortex.",
    alt: "Seitliche Ansicht des Großhirns, Stirn links. Beschriftet sind Frontallappen vorne, Parietallappen oben hinten, Temporallappen unten seitlich und Okzipitallappen hinten. Die Zentralfurche verläuft von oben schräg nach vorne unten, davor ein Streifen für den motorischen Kortex, dahinter ein Streifen für den somatosensorischen Kortex. Die Sylvische Furche (Sulcus lateralis) trennt den Temporallappen ab. Über ihrem vorderen Ende ist das Broca-Areal markiert, unter ihrem hinteren Ende das Wernicke-Areal. Unter dem Hinterhauptslappen liegt das Kleinhirn, darunter führt der Hirnstamm nach unten.",
    draw(P) {
      let s = "";
      s += path("M252,236 C250,262 256,286 262,308 L284,308 C284,286 288,262 298,232 Z", "fig-line fig-soft");
      s += `<clipPath id="${P}-cb">${ell(338, 246, 58, 30)}</clipPath>`;
      s += ell(338, 246, 58, 30, "fig-line fig-soft");
      s += `<g clip-path="url(#${P}-cb)">` + ["M276,236 Q336,222 398,240", "M280,250 Q336,238 396,254", "M288,264 Q336,254 390,268", "M300,226 Q340,214 384,226"].map((d) => path(d, "fig-line fig-thin")).join("") + "</g>";
      s += path(BRAIN, "fig-line fig-soft");
      const cs = [[238, 30], [228, 72], [216, 110], [207, 146], [199, 176]];
      const shift = (dx) => cs.map(([x, y]) => [x + dx, y]);
      s += `<clipPath id="${P}-clip"><path d="${BRAIN}"/></clipPath><g clip-path="url(#${P}-clip)">`;
      s += poly(cs.concat(shift(-20).reverse()), "fig-tint-strong");
      s += poly(cs.concat(shift(20).reverse()), "fig-tint-ok");
      s += path(smooth(cs), "fig-line fig-thick");
      s += path("M352,56 C344,110 338,170 332,218", "fig-line fig-thin fig-dash fig-s-muted") + path("M288,150 C306,148 324,149 341,152", "fig-line fig-thin fig-dash fig-s-muted");
      s += "</g>";
      s += path("M128,196 C176,184 236,176 280,162 L294,148", "fig-line fig-thick");
      s += ell(150, 176, 17, 9, "fig-line fig-thin fig-dash") + S(150, 160, "Broca");
      s += ell(290, 182, 20, 9, "fig-line fig-thin fig-dash") + S(290, 205, "Wernicke");
      s += T(104, 120, "Frontallappen", { c: "fig-bold" }) + T(298, 104, "Parietallappen", { c: "fig-bold" });
      s += T(200, 224, "Temporallappen", { c: "fig-bold" }) + T(374, 150, ["Okzipital-", "lappen"], { c: "fig-bold", lh: 14 });
      s += rect(8, 8, 14, 10, "fig-tint-strong", 2) + S(28, 17, "motorischer Kortex", { a: "start" });
      s += rect(8, 26, 14, 10, "fig-tint-ok", 2) + S(28, 35, "somatosensorischer Kortex", { a: "start" });
      s += T(300, 22, "Zentralfurche", { a: "start" }) + lead(296, 20, 241, 42);
      s += T(8, 280, ["Sylvische Furche", "(Sulcus lateralis)"], { a: "start" }) + lead(70, 266, 140, 194);
      s += T(436, 300, "Kleinhirn", { a: "end" }) + lead(404, 288, 382, 266);
      s += T(296, 322, "Hirnstamm", { a: "start" }) + lead(294, 316, 280, 300);
      return s;
    },
  });

  def({
    id: "gehirn-limbisch", title: "Medianschnitt: subkortikale Strukturen", w: 440, h: 342,
    caption: "Schematischer Medianschnitt (Stirn links) mit Balken, Thalamus, Hypothalamus und Hypophyse, Hirnstamm und Kleinhirn; Hippocampus und Amygdala liegen tiefer im Temporallappen und sind nur in ihrer ungefähren Lage gestrichelt eingezeichnet.",
    alt: "Längsschnitt durch die Mitte des Gehirns, Stirn links. Über der Mitte wölbt sich der Balken (Corpus callosum). Darunter liegt der Thalamus, davor und darunter der Hypothalamus, an dem über einen Stiel die Hypophyse hängt. Nach unten folgt der Hirnstamm mit Mittelhirn, Brücke (Pons) und verlängertem Mark (Medulla oblongata), dahinter das Kleinhirn. Gestrichelt und als schematische Lage: Amygdala vorne unten und der nach hinten oben gebogene Hippocampus; beide liegen nicht in der Mittelebene, sondern im Temporallappen.",
    draw() {
      let s = "";
      s += path("M176,200 C150,208 124,210 100,200 C72,188 58,170 60,146 C62,96 112,52 190,50 C268,48 318,90 320,146 C322,176 306,194 284,196 C266,198 250,190 238,186 C220,190 200,196 176,200 Z", "fig-line fig-soft");
      s += ell(290, 234, 34, 26, "fig-line fig-soft");
      s += path("M266,236 L300,214 M266,236 L314,226 M266,236 L316,242 M266,236 L300,256 M290,229 L300,220 M292,243 L304,252", "fig-line fig-thin");
      s += path("M214,166 L244,162 C246,176 246,186 248,194 C254,210 252,224 246,234 C242,252 240,276 238,316 L220,316 C220,286 218,262 216,244 C200,240 192,226 194,214 C196,202 206,198 210,194 C210,186 210,176 214,166 Z", "fig-line fig-soft");
      s += line(209, 196, 249, 196, "fig-line fig-thin") + line(215, 240, 246, 238, "fig-line fig-thin");
      s += path("M120,140 C112,110 150,96 190,96 C232,96 268,104 272,128 C274,142 264,150 254,144 C248,124 222,112 190,112 C156,112 134,122 134,140 C134,150 128,156 122,154 C118,152 119,146 120,140 Z", "fig-line fig-accent-soft");
      s += ell(214, 148, 24, 14, "fig-line fig-tint-ok");
      s += ell(180, 174, 16, 11, "fig-line fig-tint-strong");
      s += line(176, 185, 168, 203) + ell(165, 210, 9, 6, "fig-line fig-accent-soft");
      s += ell(196, 222, 11, 8, "fig-line fig-dash fig-tint-muted");
      s += path("M206,213 C222,208 238,198 246,186 Q252,180 256,188 C248,204 230,220 209,226 Q202,220 206,213 Z", "fig-line fig-dash fig-tint-muted");
      s += T(190, 82, "Balken (Corpus callosum)") + lead(190, 86, 190, 96);
      s += T(244, 152, "Thalamus", { a: "start" });
      s += T(112, 178, "Hypothalamus", { a: "middle" }) + lead(154, 175, 164, 175);
      s += T(332, 180, "Mittelhirn", { a: "start" }) + lead(328, 176, 247, 182);
      s += T(332, 236, "Kleinhirn", { a: "start" }) + lead(328, 232, 323, 232);
      s += T(332, 290, ["Medulla", "oblongata"], { a: "start" }) + lead(328, 290, 241, 290);
      s += T(140, 232, "Hypophyse", { a: "end" }) + lead(144, 228, 156, 214);
      s += T(140, 256, "Amygdala*", { a: "end" }) + lead(144, 252, 188, 226);
      s += T(140, 280, "Hippocampus*", { a: "end" }) + lead(144, 276, 224, 218);
      s += T(140, 304, "Pons (Brücke)", { a: "end" }) + lead(144, 300, 200, 230);
      s += S(8, 326, "* schematisch: liegen nicht in der Mittelebene, sondern im Temporallappen", { a: "start" });
      return s;
    },
  });

  // ---------- Allgemeine Psychologie ----------
  def({
    id: "mehrspeichermodell", title: "Mehrspeichermodell (Atkinson & Shiffrin, 1968)", w: 440, h: 252,
    caption: "Information gelangt über das sensorische Register ins Kurzzeitgedächtnis, wenn sie beachtet wird; durch Wiederholung bleibt sie dort und kann ins Langzeitgedächtnis übertragen und später wieder abgerufen werden.",
    alt: "Flussdiagramm: Umweltreize gelangen ins sensorische Register (ikonisch, echoisch). Durch Aufmerksamkeit gelangt Information ins Kurzzeitgedächtnis (ca. 7 ± 2 Einheiten, ca. 15–30 Sekunden); eine Schleife zeigt Wiederholung. Ein Pfeil führt durch Enkodieren ins Langzeitgedächtnis, ein Gegenpfeil zeigt den Abruf zurück ins Kurzzeitgedächtnis. Gestrichelte Pfeile zeigen Vergessen: im sensorischen Register durch Zerfall, im Kurzzeitgedächtnis durch Verdrängung und Zerfall, im Langzeitgedächtnis durch Interferenz und Abrufversagen.",
    draw() {
      let s = "";
      s += T(74, 16, "Umweltreize") + arrow(74, 22, 74, 46);
      s += box(14, 48, 120, 70, [["Sensorisches", "fig-bold"], ["Register", "fig-bold"], ["ikonisch, echoisch", "fig-small"]]);
      s += arrow(136, 83, 266, 83) + T(201, 76, "Aufmerksamkeit");
      s += box(270, 48, 156, 70, [["Kurzzeitgedächtnis", "fig-bold"], ["ca. 7 ± 2 Einheiten", "fig-small"], ["ca. 15–30 s", "fig-small"]]);
      s += carrow("M318,47 C318,12 382,12 382,40", 382, 47, 0, 1) + T(310, 24, "Wiederholung", { a: "end" });
      s += arrow(318, 120, 318, 184) + T(310, 156, "Enkodieren", { a: "end" });
      s += arrow(378, 184, 378, 120) + T(386, 156, "Abruf", { a: "start" });
      s += box(270, 186, 156, 52, [["Langzeitgedächtnis", "fig-bold"], ["nahezu unbegrenzt", "fig-small"]]);
      s += arrow(74, 120, 74, 152, { tone: "muted", cls: "fig-dash" }) + S(74, 168, ["vergessen", "(Zerfall)"], { c: "fig-muted" });
      s += arrow(270, 110, 214, 146, { tone: "muted", cls: "fig-dash" }) + S(196, 164, ["vergessen", "(Verdrängung, Zerfall)"], { c: "fig-muted" });
      s += arrow(270, 226, 226, 226, { tone: "muted", cls: "fig-dash" }) + S(220, 214, ["vergessen", "(Interferenz,", "Abrufversagen)"], { a: "end", c: "fig-muted" });
      return s;
    },
  });

  def({
    id: "arbeitsgedaechtnis", title: "Arbeitsgedächtnismodell (Baddeley, 2000)", w: 440, h: 272,
    caption: "Die zentrale Exekutive steuert drei Hilfssysteme; der episodische Puffer (2000 ergänzt) verbindet Informationen zu Episoden. Die Teilsysteme stehen mit dem Langzeitgedächtnis in Verbindung.",
    alt: "Oben die zentrale Exekutive (Aufmerksamkeitssteuerung). Darunter nebeneinander der visuell-räumliche Notizblock, der episodische Puffer und die phonologische Schleife, jeweils mit Doppelpfeilen zur zentralen Exekutive verbunden. Unten ein Band für das Langzeitgedächtnis (kristalline Systeme) mit visueller Semantik, episodischem Langzeitgedächtnis und Sprache, jeweils mit Doppelpfeilen zum darüberliegenden Teilsystem.",
    draw() {
      let s = "";
      s += box(120, 10, 200, 50, [["Zentrale Exekutive", "fig-bold"], ["steuert die Aufmerksamkeit", "fig-small"]], "fig-line fig-accent-soft");
      s += S(4, 92, "fluide Systeme", { a: "start", c: "fig-muted" });
      s += box(4, 104, 132, 60, [["visuell-räumlicher", "fig-bold"], ["Notizblock", "fig-bold"], ["Bilder, Orte", "fig-small"]]);
      s += box(154, 104, 132, 60, [["episodischer", "fig-bold"], ["Puffer", "fig-bold"], ["integriert Episoden", "fig-small"]]);
      s += box(304, 104, 132, 60, [["phonologische", "fig-bold"], ["Schleife", "fig-bold"], ["Sprache, Klang", "fig-small"]]);
      s += arrow(160, 60, 90, 104, { both: true, head: 6 }) + arrow(220, 60, 220, 104, { both: true, head: 6 }) + arrow(280, 60, 350, 104, { both: true, head: 6 });
      s += rect(4, 202, 432, 64, "fig-line fig-tint-muted", 6);
      s += T(70, 228, "visuelle Semantik") + T(220, 228, "episodisches LZG") + T(370, 228, "Sprache");
      s += S(220, 254, "Langzeitgedächtnis (kristalline Systeme)", { c: "fig-muted" });
      [70, 220, 370].forEach((x) => { s += arrow(x, 166, x, 212, { both: true, head: 6 }); });
      return s;
    },
  });

  function ccRow(y, stim, resp, cls, rcls) {
    return box(12, y, 190, 38, [[stim[0], "fig-bold"], [stim[1], "fig-small"]], cls, 6) + arrow(204, y + 19, 244, y + 19) +
      box(248, y, 180, 38, [[resp[0], "fig-bold"], [resp[1], "fig-small"]], rcls || cls, 6);
  }
  def({
    id: "klassische-konditionierung", title: "Klassisches Konditionieren (Pawlow)", w: 440, h: 306,
    caption: "Durch wiederholte Paarung mit dem unkonditionierten Reiz (UCS, auch US) wird ein zunächst neutraler Reiz zum konditionierten Reiz (CS), der allein die konditionierte Reaktion (CR) auslöst.",
    alt: "Drei Phasen untereinander. Vor der Konditionierung: Futter (UCS) löst Speichelfluss (UCR) aus; der Glockenton (NS) löst keine Speichelreaktion aus. Während der Konditionierung: Glockenton und kurz darauf Futter (NS + UCS) lösen Speichelfluss (UCR) aus. Nach der Konditionierung: der Glockenton allein (CS) löst Speichelfluss (CR) aus.",
    draw() {
      let s = "";
      s += T(12, 16, "1. Vor der Konditionierung", { a: "start", c: "fig-bold" });
      s += ccRow(24, ["UCS", "Futter"], ["UCR", "Speichelfluss"]);
      s += ccRow(70, ["NS", "Glockenton"], ["keine Speichelreaktion", "(höchstens Orientierung)"], "fig-line fig-soft", "fig-line fig-dash fig-s-muted fig-bg");
      s += T(12, 134, "2. Während: wiederholte Paarung", { a: "start", c: "fig-bold" });
      s += ccRow(142, ["NS + UCS", "Glocke, kurz darauf Futter"], ["UCR", "Speichelfluss"]);
      s += T(12, 206, "3. Nach der Konditionierung", { a: "start", c: "fig-bold" });
      s += ccRow(214, ["CS", "Glockenton allein"], ["CR", "Speichelfluss"], "fig-line fig-accent-soft fig-s-accent");
      s += S(12, 272, ["UCS / UCR: unkonditionierter Reiz / unkonditionierte Reaktion", "NS: neutraler Reiz", "CS / CR: konditionierter Reiz / konditionierte Reaktion"], { a: "start", c: "fig-muted" });
      return s;
    },
  });

  def({
    id: "operante-konditionierung", title: "Verstärkung und Bestrafung", w: 440, h: 306,
    caption: "„Positiv“ und „negativ“ bedeuten Hinzufügen bzw. Entfernen eines Reizes; Verstärkung macht das vorausgehende Verhalten häufiger, Bestrafung seltener.",
    alt: "Vierfeldertafel. Spalten: Reiz wird hinzugefügt bzw. entfernt. Zeilen: angenehmer bzw. unangenehmer Reiz. Angenehmer Reiz hinzugefügt: positive Verstärkung, Verhalten nimmt zu (z. B. Lob). Angenehmer Reiz entfernt: negative Bestrafung, Verhalten nimmt ab (z. B. Handyverbot). Unangenehmer Reiz hinzugefügt: positive Bestrafung, Verhalten nimmt ab (z. B. Tadel). Unangenehmer Reiz entfernt: negative Verstärkung, Verhalten nimmt zu (z. B. Warnton endet beim Anschnallen).",
    draw() {
      let s = "";
      const cols = [108, 274], rows = [56, 162], W = 162, H = 102;
      s += T(189, 26, "Reiz wird", { c: "fig-bold" }) + T(189, 42, "hinzugefügt (+)", { c: "fig-bold" });
      s += T(355, 26, "Reiz wird", { c: "fig-bold" }) + T(355, 42, "entfernt (−)", { c: "fig-bold" });
      s += T(54, 102, ["angenehmer", "Reiz"], { c: "fig-bold" }) + T(54, 208, ["unangenehmer", "Reiz"], { c: "fig-bold" });
      const cells = [
        [0, 0, ["Positive", "Verstärkung"], "Verhalten ↑", "z. B. Lob nach Mitarbeit", true],
        [1, 0, ["Negative", "Bestrafung"], "Verhalten ↓", "z. B. Handyverbot", false],
        [0, 1, ["Positive", "Bestrafung"], "Verhalten ↓", "z. B. Tadel nach Störung", false],
        [1, 1, ["Negative", "Verstärkung"], "Verhalten ↑", "z. B. Gurt an → Warnton aus", true],
      ];
      cells.forEach(([c, r, title, eff, ex, plus]) => {
        const x = cols[c], y = rows[r];
        s += rect(x, y, W, H, "fig-line " + (plus ? "fig-tint-ok" : "fig-tint-accent"), 6);
        s += T(x + W / 2, y + 26, title, { c: "fig-bold" }) + T(x + W / 2, y + 70, eff) + S(x + W / 2, y + 90, ex);
      });
      s += S(220, 286, ["positiv/negativ = Reiz hinzufügen/entfernen", "Verstärkung/Bestrafung = Verhalten wird häufiger/seltener"], { c: "fig-muted" });
      return s;
    },
  });

  def({
    id: "signalentdeckung", title: "Signalentdeckungstheorie", w: 440, h: 270,
    caption: "Rausch- und Signal-plus-Rausch-Verteilung überlappen; die Sensitivität d′ ist der Abstand ihrer Mittelwerte, das Kriterium legt fest, ab wann „ja“ geantwortet wird – und damit das Verhältnis von Treffern zu falschen Alarmen.",
    alt: "Zwei gleich breite Glockenkurven: links die Verteilung für reines Rauschen, rechts für Signal plus Rauschen. Der Abstand der Gipfel ist mit d′ beschriftet. Eine senkrechte Linie markiert das Kriterium: links davon wird „nein“, rechts „ja“ geantwortet. Fläche der Signalkurve rechts vom Kriterium: Treffer; links davon: Verpasser. Fläche der Rauschkurve rechts vom Kriterium: falscher Alarm; links davon: korrekte Zurückweisung.",
    draw(P) {
      const X = (x) => 10 + (x + 3.5) * 420 / 9, Y = (d) => 210 - d / 0.3989 * 140, c = 1;
      const N = (x) => npdf(x), SN = (x) => npdf(x, 2);
      let s = "";
      s += path(areaPath(N, -3.5, c, X, Y, 210), "fig-tint-muted");
      s += path(areaPath(SN, c, 5.5, X, Y, 210), "fig-tint-ok");
      s += hatch(P + "-miss", areaPath(SN, -1.5, c, X, Y, 210), X(-1.5), 120, X(c), 210);
      s += path(areaPath(N, c, 3.5, X, Y, 210), "fig-tint-strong");
      s += line(10, 210, 430, 210);
      s += path(fnPath(N, -3.5, 3.5, X, Y), "fig-line fig-thick fig-dash") + path(fnPath(SN, -1.5, 5.5, X, Y), "fig-line fig-thick fig-accent");
      s += line(X(c), 62, X(c), 220, "fig-line fig-thick");
      s += line(X(0), 48, X(0), 66, "fig-line fig-thin fig-dot fig-s-muted") + line(X(2), 48, X(2), 66, "fig-line fig-thin fig-dot fig-s-muted");
      s += arrow(X(0), 48, X(2), 48, { both: true, head: 6 }) + T(X(1), 40, "d′", { c: "fig-bold" });
      s += T(244, 76, "Kriterium", { a: "start" });
      s += T(140, 84, "Rauschen (N)", { a: "end" }) + T(312, 84, ["Signal +", "Rauschen (S+N)"], { a: "start" });
      s += T(300, 162, "Treffer", { c: "fig-bold" });
      s += T(116, 108, ["korrekte", "Zurückweisung"], { a: "end" }) + lead(118, 118, 160, 168);
      s += arrow(196, 230, 146, 230, { head: 6 }) + S(140, 234, "Antwort „nein“", { a: "end" });
      s += arrow(244, 230, 294, 230, { head: 6 }) + S(300, 234, "Antwort „ja“", { a: "start" });
      s += T(200, 260, "Verpasser", { a: "end" }) + lead(204, 250, 208, 204);
      s += T(240, 260, "falscher Alarm", { a: "start" }) + lead(236, 250, 232, 204);
      return s;
    },
  });

  def({
    id: "yerkes-dodson", title: "Yerkes-Dodson-Gesetz", w: 440, h: 266,
    caption: "Leistung hängt umgekehrt U-förmig von der Erregung ab; bei schwierigen Aufgaben liegt das Optimum bei niedrigerer Erregung als bei einfachen.",
    alt: "Liniendiagramm: Erregung (niedrig bis hoch) auf der x-Achse, Leistung auf der y-Achse. Zwei umgekehrt U-förmige Kurven: Die Kurve für die schwierige Aufgabe erreicht ihr Maximum bei geringerer Erregung, die Kurve für die einfache Aufgabe bei höherer Erregung. Beide Optima sind mit gestrichelten Linien markiert.",
    draw() {
      const X = (u) => 50 + u * 370, Y = (p) => 210 - p * 180;
      const easy = (u) => 0.1 + 0.8 * Math.exp(-((u - 0.62) ** 2) / (2 * 0.26 ** 2));
      const hard = (u) => 0.1 + 0.65 * Math.exp(-((u - 0.36) ** 2) / (2 * 0.19 ** 2));
      let s = line(50, 30, 50, 210) + line(50, 210, 420, 210);
      s += line(X(0.36), Y(0.75), X(0.36), 210, "fig-line fig-thin fig-dash fig-s-muted") + line(X(0.62), Y(0.9), X(0.62), 210, "fig-line fig-thin fig-dash fig-s-muted");
      s += path(fnPath(hard, 0, 1, X, Y), "fig-line fig-thick fig-accent") + path(fnPath(easy, 0, 1, X, Y), "fig-line fig-thick fig-dash");
      s += circ(X(0.36), Y(0.75), 4, "fig-accent fig-noline") + circ(X(0.62), Y(0.9), 4, "fig-ink");
      s += T(150, 64, ["schwierige", "Aufgabe"], { a: "end" }) + T(300, 40, "einfache Aufgabe", { a: "start" });
      s += S(X(0.36), 226, ["Optimum", "schwierig"]) + S(X(0.62), 226, ["Optimum", "einfach"]);
      s += S(50, 226, "niedrig", { a: "start" }) + S(420, 226, "hoch", { a: "end" });
      s += T(235, 258, "Erregung (Aktivierung)") + T(24, 120, "Leistung", { rot: -90 });
      return s;
    },
  });

  // ---------- Methoden und Statistik ----------
  def({
    id: "normalverteilung", title: "Normalverteilung und Standardwerte", w: 440, h: 312,
    caption: "Bei einer Normalverteilung liegen 68,3 % der Werte innerhalb von ±1, 95,4 % innerhalb von ±2 und 99,7 % innerhalb von ±3 Standardabweichungen um den Mittelwert; darunter dieselben Grenzen als z-, T- und IQ-Werte.",
    alt: "Glockenkurve mit senkrechten Linien bei −3 bis +3 Standardabweichungen. Flächenanteile: je 34,1 % zwischen Mittelwert und ±1 SD, je 13,6 % zwischen 1 und 2 SD, je 2,1 % zwischen 2 und 3 SD, je 0,1 % jenseits von 3 SD. Darunter drei Skalen: z-Werte von −3 bis 3, T-Werte von 20 bis 80 (Mittelwert 50, SD 10) und IQ-Werte von 55 bis 145 (Mittelwert 100, SD 15). Klammern zeigen: ±1 SD umfasst 68,3 %, ±2 SD 95,4 %, ±3 SD 99,7 %.",
    draw() {
      const X = (z) => 30 + (z + 3.5) * 380 / 7, Y = (d) => 190 - d / 0.3989 * 150;
      let s = "";
      [[-3, -2, 3], [-2, -1, 2], [-1, 1, 1], [1, 2, 2], [2, 3, 3]].forEach(([a, b, k]) => { s += path(areaPath(npdf, a, b, X, Y, 190, 40), "fig-nd" + k); });
      [-3, -2, -1, 0, 1, 2, 3].forEach((z) => { s += line(X(z), 190, X(z), Y(npdf(z)), "fig-line fig-thin"); });
      s += line(30, 190, 410, 190) + path(fnPath(npdf, -3.5, 3.5, X, Y), "fig-line fig-thick");
      [-0.5, 0.5].forEach((z) => { s += T(X(z), 150, "34,1 %", { c: "fig-small fig-bold" }); });
      [-1.5, 1.5].forEach((z) => { s += S(X(z), 180, "13,6 %"); });
      [-2.5, 2.5].forEach((z) => { s += S(X(z), 168, "2,1 %"); });
      [-3.3, 3.3].forEach((z) => { s += S(X(z), 180, "0,1 %", { c: "fig-muted" }); });
      const rowsY = [208, 226, 244];
      s += S(8, rowsY[0], "z", { a: "start", c: "fig-bold" }) + S(8, rowsY[1], "T", { a: "start", c: "fig-bold" }) + S(8, rowsY[2], "IQ", { a: "start", c: "fig-bold" });
      [-3, -2, -1, 0, 1, 2, 3].forEach((z) => {
        s += line(X(z), 190, X(z), 195);
        s += S(X(z), rowsY[0], fmt(z)) + S(X(z), rowsY[1], String(50 + 10 * z)) + S(X(z), rowsY[2], String(100 + 15 * z));
      });
      [[1, "68,3 %", 262], [2, "95,4 %", 280], [3, "99,7 %", 298]].forEach(([k, lab, y]) => {
        s += pl([[X(-k), y - 5], [X(-k), y], [X(k), y], [X(k), y - 5]], "fig-line fig-thin") + T(X(0), y + 4, lab, { c: "fig-small fig-bold fig-halo" });
      });
      return s;
    },
  });

  function skewPanel(y0, kind) {
    const X = (x) => 40 + x * 380 / 7, yb = y0 + 112, yp = y0 + 36;
    let f, lines, title;
    const g = (x) => (x > 0 ? x * Math.exp(-x) / Math.exp(-1) : 0);
    if (kind === "right") { f = g; lines = [[1, "Modus"], [1.6783, "Median"], [2, "Mittelwert"]]; title = ["rechtsschief (linkssteil)", "positive Schiefe"]; }
    else if (kind === "left") { f = (x) => g(7 - x); lines = [[6, "Modus"], [7 - 1.6783, "Median"], [5, "Mittelwert"]]; title = ["linksschief (rechtssteil)", "negative Schiefe"]; }
    else { f = (x) => Math.exp(-0.5 * (x - 3.5) ** 2); lines = [[3.5, ""]]; title = ["symmetrisch", "Schiefe = 0"]; }
    const Y = (v) => yb - v * 76;
    let s = path(areaPath(f, 0, 7, X, Y, yb, 90), "fig-tint-muted") + path(fnPath(f, 0, 7, X, Y, 90), "fig-line fig-thick") + line(30, yb, 430, yb);
    const styles = ["fig-line fig-accent", "fig-line fig-dash", "fig-line fig-dot fig-thick"];
    lines.forEach(([x, lab], i) => {
      const top = Y(f(x));
      s += line(X(x), yb, X(x), top, styles[i]);
      if (kind === "right") s += lead(X(x) + 3, top, 198, yp + 16 * i) + S(202, yp + 16 * i + 4, lab, { a: "start" });
      if (kind === "left") s += lead(X(x) - 3, top, 262, yp + 16 * i) + S(258, yp + 16 * i + 4, lab, { a: "end" });
    });
    if (kind === "sym") s += S(X(3.5), yp - 8, "Modus = Median = Mittelwert");
    const tx = kind === "right" ? 430 : 10, a = kind === "right" ? "end" : "start";
    s += T(tx, y0 + 16, title[0], { a, c: "fig-bold" }) + S(tx, y0 + 30, title[1], { a, c: "fig-muted" });
    return s;
  }
  def({
    id: "schiefe", title: "Schiefe: Lage von Modus, Median und Mittelwert", w: 440, h: 374,
    caption: "Der Mittelwert wird vom langen Ausläufer am stärksten mitgezogen: Bei rechtsschiefen Verteilungen gilt Modus < Median < Mittelwert, bei linksschiefen umgekehrt, bei symmetrischen fallen alle drei zusammen.",
    alt: "Drei Verteilungen untereinander. Oben linksschief (rechtssteil, negative Schiefe): Gipfel rechts, langer Ausläufer nach links; von links nach rechts liegen Mittelwert, Median, Modus. In der Mitte symmetrisch: Modus, Median und Mittelwert fallen zusammen. Unten rechtsschief (linkssteil, positive Schiefe): Gipfel links, langer Ausläufer nach rechts; von links nach rechts liegen Modus, Median, Mittelwert.",
    draw() {
      return skewPanel(0, "left") + skewPanel(124, "sym") + skewPanel(248, "right") +
        line(10, 122, 430, 122, "fig-line fig-thin fig-s-border") + line(10, 246, 430, 246, "fig-line fig-thin fig-s-border");
    },
  });

  def({
    id: "alpha-beta", title: "α-Fehler, β-Fehler und Teststärke", w: 440, h: 266,
    caption: "Liegt die Teststatistik rechts vom kritischen Wert, wird H₀ verworfen: Unter H₀ ist das der α-Fehler, unter H₁ die Teststärke 1 − β; der β-Fehler ist der Teil der H₁-Verteilung, bei dem H₀ beibehalten wird.",
    alt: "Zwei Glockenkurven: links die Stichprobenverteilung unter H₀, rechts unter H₁. Eine senkrechte Linie markiert den kritischen Wert eines einseitigen Tests; links davon wird H₀ beibehalten, rechts verworfen. Die Fläche der H₀-Kurve rechts vom kritischen Wert ist der α-Fehler (Fehler 1. Art, hier 5 %). Die Fläche der H₁-Kurve links vom kritischen Wert ist der β-Fehler (Fehler 2. Art), die Fläche rechts davon die Teststärke 1 − β (hier etwa 80 %).",
    draw(P) {
      const X = (z) => 20 + (z + 3.2) * 400 / 9, Y = (d) => 200 - d / 0.3989 * 140, cr = 1.645, d = 2.5;
      const H0 = (x) => npdf(x), H1 = (x) => npdf(x, d);
      let s = "";
      s += path(areaPath(H1, cr, 5.8, X, Y, 200), "fig-tint-ok");
      s += path(areaPath(H1, d - 3.2, cr, X, Y, 200), "fig-tint-muted") + hatch(P + "-beta", areaPath(H1, d - 3.2, cr, X, Y, 200), X(d - 3.2), 60, X(cr), 200);
      s += path(areaPath(H0, cr, 3.5, X, Y, 200), "fig-tint-strong");
      s += line(20, 200, 420, 200);
      s += path(fnPath(H0, -3.2, 3.5, X, Y), "fig-line fig-thick fig-dash") + path(fnPath(H1, d - 3.2, 5.8, X, Y), "fig-line fig-thick fig-accent");
      s += line(X(cr), 40, X(cr), 206, "fig-line fig-thick");
      s += T(X(cr), 16, "kritischer Wert");
      s += arrow(X(cr) - 6, 32, X(cr) - 60, 32, { head: 6 }) + S(X(cr) - 66, 36, "H₀ beibehalten", { a: "end" });
      s += arrow(X(cr) + 6, 32, X(cr) + 60, 32, { head: 6 }) + S(X(cr) + 66, 36, "H₀ verwerfen", { a: "start" });
      s += T(X(0), 54, "H₀", { c: "fig-bold" }) + T(X(d), 54, "H₁", { c: "fig-bold" });
      s += T(296, 150, ["1 − β", "(Teststärke)"], { c: "fig-small fig-bold", lh: 14 });
      s += T(200, 230, "β: Fehler 2. Art", { a: "end" }) + lead(196, 220, 212, 190);
      s += T(270, 230, "α: Fehler 1. Art", { a: "start" }) + lead(266, 220, 246, 194);
      s += S(220, 256, "einseitiger Test, α = 5 %; hier Teststärke ≈ 80 %", { c: "fig-muted" });
      return s;
    },
  });

  // deterministische Punktwolke mit exakt vorgegebener Stichprobenkorrelation r
  function corrPoints(r, nPts, seed) {
    let a = seed >>> 0;
    const rnd = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const gauss = () => Math.sqrt(-2 * Math.log(1 - rnd())) * Math.cos(2 * Math.PI * rnd());
    const xs = [], es = [];
    for (let i = 0; i < nPts; i++) { xs.push(gauss()); es.push(gauss()); }
    const mean = (v) => v.reduce((p, q) => p + q, 0) / v.length;
    const center = (v) => { const m = mean(v); return v.map((q) => q - m); };
    const x = center(xs); let e = center(es);
    const dot = (u, v) => u.reduce((p, q, i) => p + q * v[i], 0);
    const k = dot(x, e) / dot(x, x); e = e.map((q, i) => q - k * x[i]);
    const sx = Math.sqrt(dot(x, x)), se = Math.sqrt(dot(e, e));
    return x.map((q, i) => [q / sx, r * q / sx + Math.sqrt(1 - r * r) * e[i] / se]);
  }
  def({
    id: "streudiagramme", title: "Streudiagramme und Korrelation r", w: 440, h: 364,
    caption: "Je enger die Punkte um eine gedachte Gerade liegen, desto größer |r|; das Vorzeichen zeigt die Richtung des linearen Zusammenhangs, r ≈ 0 bedeutet keinen linearen Zusammenhang.",
    alt: "Vier Streudiagramme mit je 40 Punkten. Bei r = −0,8 fallen die Punkte deutlich von links oben nach rechts unten. Bei r = 0 bilden sie eine runde Wolke ohne Richtung. Bei r = +0,5 steigen sie locker von links unten nach rechts oben. Bei r = +0,9 liegen sie eng an einer steigenden Geraden.",
    draw() {
      let s = "";
      [[-0.8, 12, 8, 11], [0, 226, 8, 23], [0.5, 12, 188, 37], [0.9, 226, 188, 52]].forEach(([r, x0, y0, seed]) => {
        const p = corrPoints(r, 40, seed);
        const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
        const mnx = Math.min(...xs), mxx = Math.max(...xs), mny = Math.min(...ys), mxy = Math.max(...ys);
        const X = (v) => x0 + 22 + (v - mnx) / (mxx - mnx) * 170, Y = (v) => y0 + 158 - (v - mny) / (mxy - mny) * 122;
        s += `<g data-r="${r}">`;
        s += pl([[x0 + 12, y0 + 28], [x0 + 12, y0 + 168], [x0 + 200, y0 + 168]], "fig-line fig-thin");
        s += T(x0 + 22, y0 + 18, "r = " + (r > 0 ? "+" : "") + fmt(r), { a: "start", c: "fig-bold" });
        p.forEach(([a, b]) => { s += circ(X(a), Y(b), 3.6, "fig-pt"); });
        s += "</g>";
      });
      return s;
    },
  });

  function interPanel(y0, b1, b2, title, lines) {
    const Y = (v) => y0 + 98 - v * 9, xa = 86, xb = 166;
    let s = pl([[56, y0 + 4], [56, y0 + 98], [200, y0 + 98]], "fig-line fig-thin");
    s += S(52, y0 + 12, "AV", { a: "end", c: "fig-muted" }) + S(xa, y0 + 112, "A1") + S(xb, y0 + 112, "A2");
    s += line(xa, Y(b1[0]), xb, Y(b1[1]), "fig-line fig-thick fig-accent") + circ(xa, Y(b1[0]), 4, "fig-accent fig-noline") + circ(xb, Y(b1[1]), 4, "fig-accent fig-noline");
    s += line(xa, Y(b2[0]), xb, Y(b2[1]), "fig-line fig-thick fig-dash") + rect(xa - 3.5, Y(b2[0]) - 3.5, 7, 7, "fig-ink fig-noline") + rect(xb - 3.5, Y(b2[1]) - 3.5, 7, 7, "fig-ink fig-noline");
    if (b1[1] === b2[1]) s += S(174, Y(b1[1]) + 4, "B1 = B2", { a: "start" });
    else s += S(174, Y(b1[1]) + 4, "B1", { a: "start" }) + S(174, Y(b2[1]) + 4, "B2", { a: "start" });
    s += T(222, y0 + 26, title, { a: "start", c: "fig-bold" }) + S(222, y0 + 46, lines, { a: "start", lh: 14 });
    return s;
  }
  def({
    id: "interaktion-2x2", title: "Haupteffekte und Interaktion im 2×2-Design", w: 440, h: 396,
    caption: "Parallele Linien bedeuten keine Interaktion; kreuzen sich die Linien (disordinale Interaktion), kehrt sich die Wirkung von Faktor A je nach Stufe von Faktor B um.",
    alt: "Drei Liniendiagramme mit den Stufen A1 und A2 auf der x-Achse und je einer Linie für B1 und B2. Erstens: Beide Linien liegen übereinander und steigen von A1 zu A2 – nur ein Haupteffekt A. Zweitens: Beide Linien steigen parallel, B2 liegt durchgehend höher – Haupteffekte A und B ohne Interaktion. Drittens: B1 steigt, B2 fällt, die Linien kreuzen sich – disordinale Interaktion ohne Haupteffekte.",
    draw() {
      let s = "";
      s += interPanel(6, [3, 7], [3, 7], "Nur Haupteffekt A", ["Anstieg von A1 zu A2: Effekt A", "B1 = B2: kein Effekt von B", "keine Interaktion"]);
      s += interPanel(130, [2, 6], [4.5, 8.5], "Haupteffekte A und B", ["B2 überall höher: Effekt B", "Linien parallel:", "keine Interaktion"]);
      s += interPanel(254, [2, 8], [8, 2], "Disordinale Interaktion", ["Linien kreuzen sich: Wirkung", "von A kehrt sich je nach B um", "(hier keine Haupteffekte)"]);
      s += line(60, 386, 84, 386, "fig-line fig-thick fig-accent") + S(90, 390, "B1 (Stufe 1 von Faktor B)", { a: "start" });
      s += line(250, 386, 274, 386, "fig-line fig-thick fig-dash") + S(280, 390, "B2 (Stufe 2)", { a: "start" });
      return s;
    },
  });

  def({
    id: "versuchsplaene", title: "Versuchspläne", w: 440, h: 332,
    caption: "Im Zwischen-Personen-Plan erlebt jede Person nur eine Bedingung, im Innerhalb-Personen-Plan alle (Reihenfolge ausbalanciert); der Prä-Post-Kontrollgruppenplan ist in Campbell-Notation dargestellt.",
    alt: "Links: Zwischen-Personen-Plan – sechs Personen werden zufällig (R) auf zwei Gruppen aufgeteilt, eine Gruppe erhält Bedingung A, die andere Bedingung B. Rechts: Innerhalb-Personen-Plan – alle Personen durchlaufen beide Bedingungen, die Hälfte in der Reihenfolge A dann B, die andere Hälfte B dann A. Unten: Prä-Post-Kontrollgruppenplan in Campbell-Notation. Experimentalgruppe: R, O₁, X, O₂. Kontrollgruppe: R, O₃, O₄. R steht für Randomisierung, O für eine Messung, X für das Treatment.",
    draw() {
      let s = "";
      s += T(106, 18, "Zwischen Personen", { c: "fig-bold" }) + S(106, 33, "(between-subjects)", { c: "fig-muted" });
      [56, 76, 96, 116, 136, 156].forEach((x) => { s += circ(x, 54, 5, "fig-muted fig-noline"); });
      s += arrow(96, 62, 62, 92, { head: 6 }) + arrow(116, 62, 150, 92, { head: 6 }) + T(106, 88, "R", { c: "fig-bold" });
      [40, 56, 72, 140, 156, 172].forEach((x) => { s += circ(x, 104, 5, "fig-muted fig-noline"); });
      s += box(16, 118, 80, 28, [["Bed. A", ""]]) + box(116, 118, 80, 28, [["Bed. B", ""]]);
      s += S(106, 168, ["jede Person:", "eine Bedingung"]);
      s += line(220, 8, 220, 184, "fig-line fig-thin fig-s-border");
      s += T(334, 18, "Innerhalb Personen", { c: "fig-bold" }) + S(334, 33, "(within-subjects)", { c: "fig-muted" });
      [284, 304, 324, 344, 364, 384].forEach((x) => { s += circ(x, 54, 5, "fig-muted fig-noline"); });
      s += box(262, 76, 52, 26, [["A", "fig-bold"]]) + arrow(316, 89, 346, 89, { head: 6 }) + box(350, 76, 52, 26, [["B", "fig-bold"]]);
      s += box(262, 112, 52, 26, [["B", "fig-bold"]]) + arrow(316, 125, 346, 125, { head: 6 }) + box(350, 112, 52, 26, [["A", "fig-bold"]]);
      s += S(334, 160, ["alle Bedingungen, Reihenfolge", "ausbalanciert (AB / BA)"]);
      s += line(8, 194, 432, 194, "fig-line fig-thin fig-s-border");
      s += T(220, 214, "Prä-Post-Kontrollgruppenplan (Campbell-Notation)", { c: "fig-bold" });
      const cx = [186, 240, 294, 348];
      s += S(cx[1], 234, "Vortest", { c: "fig-muted" }) + S(cx[2], 234, "Treatment", { c: "fig-muted" }) + S(cx[3], 234, "Nachtest", { c: "fig-muted" });
      s += T(10, 256, "Experimentalgruppe", { a: "start" }) + T(10, 284, "Kontrollgruppe", { a: "start" });
      ["R", "O₁", "X", "O₂"].forEach((t, i) => { s += T(cx[i], 257, t, { c: "fig-big fig-bold" }); });
      ["R", "O₃", "", "O₄"].forEach((t, i) => { if (t) s += T(cx[i], 285, t, { c: "fig-big fig-bold" }); });
      s += arrow(176, 300, 380, 300, { head: 6 }) + S(386, 304, "Zeit", { a: "start" });
      s += S(220, 324, "R = randomisierte Zuweisung · O = Messung · X = Treatment", { c: "fig-muted" });
      return s;
    },
  });

  def({
    id: "reliabilitaet-validitaet", title: "Reliabilität und Validität", w: 440, h: 216,
    caption: "Reliabilität entspricht der Streuung der Treffer (Messgenauigkeit), Validität ihrer Lage zum Zentrum (misst der Test, was er messen soll?); ohne Reliabilität ist keine hohe Validität möglich.",
    alt: "Drei Zielscheiben mit je sieben Treffern. Links: Treffer eng beieinander im Zentrum – reliabel und valide. Mitte: Treffer eng beieinander, aber oben rechts neben dem Zentrum – reliabel, aber nicht valide. Rechts: Treffer weit verstreut und im Mittel neben dem Zentrum – weder reliabel noch valide.",
    draw() {
      let s = "";
      const tight = [[-3, -2], [2, 3], [4, -3], [-2, 4], [1, -5], [-5, 1], [5, 1]];
      const shots = [tight, tight.map(([x, y]) => [x + 24, y - 22]), [[-22, -14], [34, -28], [44, 26], [4, 44], [-28, 22], [20, 6], [38, 4]]];
      const labels = [["reliabel", "und valide"], ["reliabel, aber", "nicht valide"], ["weder reliabel", "noch valide"]];
      [76, 220, 364].forEach((cx, i) => {
        s += circ(cx, 84, 56, "fig-line fig-thin fig-soft") + circ(cx, 84, 40, "fig-line fig-thin fig-bg") + circ(cx, 84, 24, "fig-line fig-thin fig-soft") + circ(cx, 84, 8, "fig-line fig-thin fig-accent-soft");
        shots[i].forEach(([x, y]) => { s += circ(cx + x, 84 + y, 4, "fig-pt"); });
        s += T(cx, 162, labels[i]);
      });
      s += S(220, 206, "Reliabilität ist notwendig, aber nicht hinreichend für Validität.", { c: "fig-muted" });
      return s;
    },
  });

  // ---------- Entwicklung, Klinik, Gesundheit ----------
  def({
    id: "erziehungsstile", title: "Erziehungsstile (Maccoby & Martin, 1983)", w: 440, h: 284,
    caption: "Die zwei Dimensionen Wärme/Responsivität und Kontrolle/Forderung ergeben vier Erziehungsstile; der autoritative Stil geht im Mittel mit den günstigsten Entwicklungsergebnissen einher.",
    alt: "Vierfeldertafel: x-Achse Wärme bzw. Responsivität (niedrig, hoch), y-Achse Kontrolle bzw. Forderung (niedrig, hoch). Hohe Kontrolle und hohe Wärme: autoritativ (warm, klare und erklärte Regeln). Hohe Kontrolle und geringe Wärme: autoritär (streng, Gehorsam ohne Erklärung). Geringe Kontrolle und hohe Wärme: permissiv bzw. nachgiebig (warm, kaum Regeln). Geringe Kontrolle und geringe Wärme: vernachlässigend (wenig Zuwendung und Aufsicht).",
    draw() {
      let s = "";
      const cols = [96, 266], rows = [16, 130], W = 166, H = 110;
      const cells = [
        [0, 0, "autoritär", ["streng, wenig Wärme,", "Gehorsam ohne Erklärung"], "fig-line fig-soft"],
        [1, 0, "autoritativ", ["warm und klare Regeln,", "Regeln werden erklärt"], "fig-line fig-accent-soft fig-s-accent"],
        [0, 1, "vernachlässigend", ["wenig Zuwendung,", "wenig Regeln und Aufsicht"], "fig-line fig-soft"],
        [1, 1, "permissiv (nachgiebig)", ["warm, aber kaum", "Regeln und Grenzen"], "fig-line fig-soft"],
      ];
      cells.forEach(([c, r, t, d, cls]) => {
        const x = cols[c], y = rows[r];
        s += rect(x, y, W, H, cls, 6) + T(x + W / 2, y + 44, t, { c: "fig-bold" }) + S(x + W / 2, y + 66, d, { lh: 14 });
      });
      s += S(179, 258, "niedrig") + S(349, 258, "hoch") + T(264, 278, "Wärme / Responsivität →", { c: "fig-bold" });
      s += S(88, 75, "hoch", { a: "end" }) + S(88, 189, "niedrig", { a: "end" }) + T(30, 128, "Kontrolle / Forderung →", { rot: -90, c: "fig-bold" });
      return s;
    },
  });

  def({
    id: "transaktionales-stressmodell", title: "Transaktionales Stressmodell (Lazarus)", w: 440, h: 372,
    caption: "Stress entsteht aus der Bewertung einer Situation und der eigenen Ressourcen; Bewältigung kann problem- oder emotionsorientiert sein und wird neu bewertet. Die Bewertungen laufen nicht streng nacheinander ab, sondern beeinflussen sich wechselseitig.",
    alt: "Flussdiagramm von oben nach unten: Stressor bzw. Anforderung, dann primäre Bewertung (irrelevant, positiv oder stressbezogen: Schaden/Verlust, Bedrohung, Herausforderung), bei stressbezogener Bewertung sekundäre Bewertung (Reichen meine Ressourcen?), dann Bewältigung mit zwei Formen: problemorientiert (Situation ändern) und emotionsorientiert (Gefühle regulieren), schließlich Neubewertung. Ein Rückkopplungspfeil führt von der Neubewertung zurück zur primären Bewertung.",
    draw() {
      let s = "";
      s += box(110, 8, 200, 34, [["Stressor / Anforderung", "fig-bold"]]);
      s += arrow(210, 42, 210, 60);
      s += box(50, 62, 320, 70, [["Primäre Bewertung", "fig-bold"], ["Ist die Situation für mich relevant?", "fig-small"], ["irrelevant · positiv · stressbezogen", "fig-small"], ["(Schaden/Verlust, Bedrohung, Herausforderung)", "fig-small"]], "fig-line fig-accent-soft");
      s += arrow(210, 132, 210, 150) + S(218, 145, "wenn stressbezogen", { a: "start", c: "fig-muted" });
      s += box(50, 152, 320, 46, [["Sekundäre Bewertung", "fig-bold"], ["Reichen meine Ressourcen zur Bewältigung?", "fig-small"]], "fig-line fig-accent-soft");
      s += arrow(210, 198, 210, 218);
      s += rect(50, 220, 320, 78, "fig-line fig-soft", 6) + T(210, 238, "Bewältigung (Coping)", { c: "fig-bold" });
      s += box(62, 248, 140, 40, [["problemorientiert", "fig-bold"], ["Situation ändern", "fig-small"]], "fig-line fig-bg");
      s += box(218, 248, 140, 40, [["emotionsorientiert", "fig-bold"], ["Gefühle regulieren", "fig-small"]], "fig-line fig-bg");
      s += arrow(210, 298, 210, 316);
      s += box(80, 318, 260, 44, [["Neubewertung", "fig-bold"], ["Hat die Bewältigung gewirkt?", "fig-small"]]);
      s += carrow("M340,340 L398,340 L398,97 L378,97", 372, 97, -1, 0);
      s += S(414, 220, "Rückkopplung", { rot: -90, c: "fig-muted" });
      return s;
    },
  });

  def({
    id: "biopsychosozial", title: "Biopsychosoziales Modell (Engel, 1977)", w: 440, h: 336,
    caption: "Gesundheit und Krankheit entstehen aus dem Zusammenwirken biologischer, psychologischer und sozialer Faktoren; die Überschneidungen stehen für ihre Wechselwirkungen.",
    alt: "Drei sich überlappende Kreise. Biologisch: Gene, Hormone, Neurotransmitter, Erkrankungen. Psychologisch: Gedanken, Gefühle, Bewältigung, Verhalten. Sozial: Beziehungen, Familie, Arbeit, Kultur, sozialer Status. In der gemeinsamen Mitte: Gesundheit bzw. Krankheit.",
    draw() {
      let s = "";
      s += circ(160, 124, 104, "fig-line fig-tint-accent fig-s-accent") + circ(280, 124, 104, "fig-line fig-tint-ok fig-s-ok") + circ(220, 224, 104, "fig-line fig-tint-muted fig-s-muted");
      s += T(116, 70, "biologisch", { c: "fig-bold" }) + S(116, 88, ["Gene, Hormone,", "Neurotransmitter,", "Erkrankungen"], { lh: 14 });
      s += T(324, 70, "psychologisch", { c: "fig-bold" }) + S(324, 88, ["Gedanken, Gefühle,", "Bewältigung,", "Verhalten"], { lh: 14 });
      s += T(220, 264, "sozial", { c: "fig-bold" }) + S(220, 282, ["Beziehungen, Familie,", "Arbeit, Kultur,", "sozialer Status"], { lh: 14 });
      s += T(220, 152, ["Gesundheit /", "Krankheit"], { c: "fig-small fig-bold", lh: 13 });
      return s;
    },
  });

  // ---------- API ----------
  function render(id) {
    const f = FIGS.find((x) => x.id === id);
    if (!f) return "";
    const P = "fig-" + f.id;
    return `<svg class="fig" viewBox="0 0 ${f.w} ${f.h}" role="img" aria-labelledby="${P}-t ${P}-d" xmlns="http://www.w3.org/2000/svg">` +
      `<title id="${P}-t">${esc(f.title)}</title><desc id="${P}-d">${esc(f.alt)}</desc>${f.draw(P)}</svg>`;
  }
  function html(id) {
    const f = FIGS.find((x) => x.id === id);
    return f ? `<figure class="fig-wrap">${render(id)}<figcaption>${esc(f.caption)}</figcaption></figure>` : "";
  }
  const list = () => FIGS.map(({ id, title, caption, alt }) => ({ id, title, caption, alt }));
  return { list, render, html };
});
