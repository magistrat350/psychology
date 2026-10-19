/* PPTrainer – Aufgabengeneratoren für den Statistik-Rechentrainer (D1, D2, E1).
 * Jede Aufgabe ist über ihren Seed reproduzierbar. Benötigt PPStats. */
(function (root, factory) {
  const S = typeof module === "object" && module.exports ? require("./stats.js") : root.PPStats;
  const api = factory(S);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PPTrainer = api;
})(typeof self !== "undefined" ? self : this, function (S) {
  "use strict";
  const f = S.fmt;
  const SIG = "signifikant (H₀ verwerfen)", NSIG = "nicht signifikant (H₀ beibehalten)";
  const decision = (sig) => ({ key: "dec", label: "Entscheidung (α = .05, zweiseitig)", type: "choice", options: [SIG, NSIG], value: sig ? SIG : NSIG });
  // dec (optional): Nachkommastellen der angezeigten Lösung, z. B. 0 für Personenzahlen trotz Toleranz 1
  const num = (key, label, value, tol, unit, dec) => Object.assign({ key, label, value, tol, unit, type: "num" }, dec != null ? { dec } : {});
  const choice = (key, label, options, value) => ({ key, label, type: "choice", options, value });
  const list = (a, d = 0) => a.map((x) => f(x, d)).join("; ");
  const ints = (rng, n, lo, hi) => Array.from({ length: n }, () => rng.int(lo, hi));
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const notConst = (a) => new Set(a).size > 1;
  function shuffle(rng, a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  function distinctScores(rng, latent, start, maxStep) { // streng monotone ganze Zahlen in der Rangfolge der latenten Werte → keine Bindungen
    const out = new Array(latent.length); let v = start;
    latent.map((x, i) => [x, i]).sort((p, q) => p[0] - q[0]).forEach(([, i]) => { v += rng.int(1, maxStep); out[i] = v; });
    return out;
  }
  const pTxt = (p) => (p < 0.001 ? "p < 0,001" : `p = ${f(p, 3)}`);
  const signed = (x, d = 3) => (x < 0 ? `− ${f(-x, d)}` : `+ ${f(x, d)}`);

  const G = [];
  const def = (g) => G.push(g);

  // ===================== D1 – Deskriptive Statistik =====================
  def({ id: "lage", modules: ["D1"], topic: "Deskriptive Statistik", title: "Lagemaße: Mittelwert, Median, Modus",
    gen(rng) {
      let x;
      do {
        const n = rng.int(7, 9);
        x = ints(rng, n - 1, 1, 20); x.push(rng.pick(x));
      } while (S.modes(x).length !== 1);
      const n = x.length, m = S.mean(x), md = S.median(x), mo = S.modes(x)[0], sorted = x.slice().sort((a, b) => a - b);
      return {
        intro: `Gegeben sind die Punktwerte von ${n} Personen in einem Konzentrationstest: ${list(x)}. Berechne Mittelwert, Median und Modus.`,
        answers: [num("m", "Mittelwert x̄", m, 0.011), num("md", "Median", md, 0.011), num("mo", "Modus", mo, 0)],
        steps: [
          `Summe: Σx = ${x.join(" + ")} = ${S.sum(x)}`,
          `Mittelwert: x̄ = Σx / n = ${S.sum(x)} / ${n} = ${f(m)}`,
          `Sortiert: ${list(sorted)}`,
          n % 2 ? `n = ${n} ist ungerade → Median ist der Wert an Position (n + 1)/2 = ${(n + 1) / 2}: Md = ${f(md, 1)}` : `n = ${n} ist gerade → Mittel der Werte an Position ${n / 2} und ${n / 2 + 1}: Md = (${sorted[n / 2 - 1]} + ${sorted[n / 2]}) / 2 = ${f(md, 1)}`,
          `Modus = häufigster Wert: ${mo} (kommt ${x.filter((v) => v === mo).length}-mal vor)`
        ]
      };
    } });

  def({ id: "streuung", modules: ["D1"], topic: "Deskriptive Statistik", title: "Streuung: Varianz, Standardabweichung, Spannweite",
    gen(rng) {
      let x; do { x = ints(rng, rng.int(5, 7), 1, 15); } while (!notConst(x));
      const m = S.mean(x), dev = x.map((v) => (v - m) ** 2), q = S.sum(dev), v = q / (x.length - 1);
      return {
        intro: `Werte: ${list(x)}. Berechne die Stichprobenvarianz (Nenner n − 1), die Standardabweichung und die Spannweite.`,
        answers: [num("v", "Varianz s²", v, 0.02), num("s", "Standardabweichung s", Math.sqrt(v), 0.02), num("r", "Spannweite", Math.max(...x) - Math.min(...x), 0)],
        steps: [
          `x̄ = ${S.sum(x)} / ${x.length} = ${f(m, 3)}`,
          `Abweichungsquadrate (x − x̄)²: ${dev.map((d) => f(d, 3)).join("; ")}`,
          `Quadratsumme QS = ${f(q, 3)}`,
          `s² = QS / (n − 1) = ${f(q, 3)} / ${x.length - 1} = ${f(v, 3)}`,
          `s = √s² = ${f(Math.sqrt(v), 3)}`,
          `Spannweite = Maximum − Minimum = ${Math.max(...x)} − ${Math.min(...x)} = ${Math.max(...x) - Math.min(...x)}`
        ]
      };
    } });

  def({ id: "zwerte", modules: ["D1", "D2"], topic: "Normwerte", title: "z-Werte, T-Werte, IQ-Skala und Prozentrang",
    gen(rng) {
      const [M, SD] = rng.pick([[50, 10], [100, 15], [20, 4], [30, 5], [60, 8]]);
      const z = rng.int(-25, 25) / 10, x = S.round(M + z * SD, 1);
      const zz = (x - M) / SD, pr = S.normCdf(zz) * 100;
      return {
        intro: `Ein Test hat in der Normstichprobe den Mittelwert M = ${M} und die Standardabweichung SD = ${SD}. Eine Person erzielt den Rohwert x = ${f(x, 1)}. Bestimme z-Wert, T-Wert, IQ-äquivalenten Wert und Prozentrang (Normalverteilung angenommen).`,
        answers: [num("z", "z-Wert", zz, 0.011), num("t", "T-Wert", 50 + 10 * zz, 0.15), num("iq", "IQ-Skala", 100 + 15 * zz, 0.2), num("pr", "Prozentrang", pr, 1.5, "%")],
        steps: [
          `z = (x − M) / SD = (${f(x, 1)} − ${M}) / ${SD} = ${f(zz)}`,
          `T = 50 + 10 · z = 50 + 10 · ${f(zz)} = ${f(50 + 10 * zz, 1)}`,
          `IQ = 100 + 15 · z = ${f(100 + 15 * zz, 1)}`,
          `Prozentrang = Φ(z) · 100 = Φ(${f(zz)}) · 100 ≈ ${f(pr, 1)} % (aus der Tabelle der Standardnormalverteilung)`
        ]
      };
    } });

  def({ id: "normal", modules: ["D1"], topic: "Wahrscheinlichkeit", title: "Flächen unter der Normalverteilung",
    gen(rng) {
      const [mu, sig, unit] = rng.pick([[100, 15, "IQ-Punkte"], [170, 8, "cm"], [500, 100, "PISA-Punkte"], [400, 60, "ms Reaktionszeit"], [50, 10, "T-Punkte"]]);
      if (rng() < 0.5) {
        const z = rng.int(-22, 22) / 10, x = mu + z * sig, p = S.normCdf(z) * 100;
        return {
          intro: `Ein Merkmal ist normalverteilt mit μ = ${mu} und σ = ${sig} (${unit}). Wie viel Prozent der Population haben einen Wert ≤ ${f(x, 1)}?`,
          answers: [num("z", "z-Wert", z, 0.011), num("p", "Anteil", p, 1, "%")],
          steps: [`z = (${f(x, 1)} − ${mu}) / ${sig} = ${f(z)}`, `P(X ≤ ${f(x, 1)}) = Φ(${f(z)}) ≈ ${f(p, 1)} %`]
        };
      }
      let z1 = rng.int(-20, 5) / 10, z2 = z1 + rng.int(5, 25) / 10;
      const x1 = mu + z1 * sig, x2 = mu + z2 * sig, p = (S.normCdf(z2) - S.normCdf(z1)) * 100;
      return {
        intro: `Ein Merkmal ist normalverteilt mit μ = ${mu} und σ = ${sig} (${unit}). Wie viel Prozent liegen zwischen ${f(x1, 1)} und ${f(x2, 1)}?`,
        answers: [num("z1", "z-Wert der Untergrenze", z1, 0.011), num("z2", "z-Wert der Obergrenze", z2, 0.011), num("p", "Anteil dazwischen", p, 1, "%")],
        steps: [`z₁ = (${f(x1, 1)} − ${mu}) / ${sig} = ${f(z1)}`, `z₂ = (${f(x2, 1)} − ${mu}) / ${sig} = ${f(z2)}`,
          `P = Φ(z₂) − Φ(z₁) = ${f(S.normCdf(z2), 4)} − ${f(S.normCdf(z1), 4)} = ${f(p / 100, 4)} ≈ ${f(p, 1)} %`]
      };
    } });

  // ===================== D1 – Zusammenhang =====================
  function pairs(rng, n, lo, hi, minR) {
    let x, y, r;
    do {
      x = ints(rng, n, lo, hi);
      const b = (rng() < 0.5 ? -1 : 1) * (0.4 + rng() * 1.2), a = rng.int(2, 10);
      y = x.map((v) => Math.round(a + b * v + rng.normal(0, 2.5)));
      r = notConst(x) && notConst(y) ? S.pearson(x, y) : 0;
    } while (Math.abs(r) < minR || Math.abs(r) > 0.98);
    return { x, y, r };
  }
  function spSteps(x, y) {
    const mx = S.mean(x), my = S.mean(y);
    const sp = S.sum(x.map((v, i) => (v - mx) * (y[i] - my))), qx = S.sum(x.map((v) => (v - mx) ** 2)), qy = S.sum(y.map((v) => (v - my) ** 2));
    return { mx, my, sp, qx, qy };
  }
  def({ id: "korrelation", modules: ["D1"], topic: "Zusammenhang", title: "Pearson-Korrelation",
    gen(rng) {
      const { x, y } = pairs(rng, 6, 1, 12, 0.3);
      const { mx, my, sp, qx, qy } = spSteps(x, y), r = sp / Math.sqrt(qx * qy);
      return {
        intro: `Sechs Studierende wurden zu Lernstunden pro Woche (x) und Punkten im Zwischentest (y) befragt. Berechne die Pearson-Korrelation r und den Determinationskoeffizienten r².`,
        table: { head: ["Person", "x", "y"], rows: x.map((v, i) => [i + 1, v, y[i]]) },
        answers: [num("r", "r", r, 0.011), num("r2", "r²", r * r, 0.011)],
        steps: [
          `x̄ = ${f(mx, 3)}, ȳ = ${f(my, 3)}`,
          `Summe der Abweichungsprodukte SP = Σ(x − x̄)(y − ȳ) = ${f(sp, 3)}`,
          `QSx = Σ(x − x̄)² = ${f(qx, 3)}; QSy = Σ(y − ȳ)² = ${f(qy, 3)}`,
          `r = SP / √(QSx · QSy) = ${f(sp, 3)} / √(${f(qx, 3)} · ${f(qy, 3)}) = ${f(r, 3)}`,
          `r² = ${f(r * r, 3)} → ${f(r * r * 100, 1)} % gemeinsame Varianz`
        ]
      };
    } });

  def({ id: "regression", modules: ["D1"], topic: "Zusammenhang", title: "Einfache lineare Regression",
    gen(rng) {
      const { x, y } = pairs(rng, rng.int(5, 6), 1, 10, 0.5);
      const { mx, my, sp, qx } = spSteps(x, y), b = sp / qx, a = my - b * mx, x0 = rng.int(1, 12);
      return {
        intro: `Vorhersage der Prüfungsangst (y) aus der Anzahl bisheriger Prüfungsversuche (x). Berechne Steigung b, Achsenabschnitt a und den vorhergesagten Wert ŷ für x = ${x0}.`,
        table: { head: ["Person", "x", "y"], rows: x.map((v, i) => [i + 1, v, y[i]]) },
        answers: [num("b", "Steigung b", b, 0.02), num("a", "Achsenabschnitt a", a, 0.06), num("yh", `ŷ für x = ${x0}`, a + b * x0, 0.12)],
        steps: [
          `x̄ = ${f(mx, 3)}, ȳ = ${f(my, 3)}`,
          `SP = Σ(x − x̄)(y − ȳ) = ${f(sp, 3)}; QSx = ${f(qx, 3)}`,
          `b = SP / QSx = ${f(b, 3)}`,
          `a = ȳ − b · x̄ = ${f(my, 3)} − ${f(b, 3)} · ${f(mx, 3)} = ${f(a, 3)}`,
          `ŷ = a + b · ${x0} = ${f(a + b * x0, 3)}`
        ]
      };
    } });

  def({ id: "ki_korrelation", modules: ["D1"], topic: "Zusammenhang", title: "Konfidenzintervall für r (Fisher-z-Transformation)",
    gen(rng) {
      const [a, b] = rng.pick([["Prüfungsangst", "Schlafqualität"], ["Lernzeit", "Prüfungsleistung"], ["Extraversion", "Anzahl enger Freundschaften"], ["Bildschirmzeit", "Wohlbefinden"]]);
      const r = (rng() < 0.35 ? -1 : 1) * rng.int(10, 80) / 100, n = rng.pick([20, 25, 30, 40, 50, 60, 80, 100, 150, 200]);
      const ci = S.corrCI(r, n), hw = 1.96 * ci.se, sig = ci.lo > 0 || ci.hi < 0;
      return {
        intro: `In einer Stichprobe von n = ${n} Personen korrelieren ${a} und ${b} zu r = ${f(r)}. Berechne mit der Fisher-z-Transformation z′ und das 95 %-Konfidenzintervall für die Populationskorrelation ρ (z = 1,96).`,
        answers: [num("z", "Fisher-z′", ci.z, 0.01), num("lo", "Untergrenze des KI (r-Skala)", ci.lo, 0.01), num("hi", "Obergrenze des KI (r-Skala)", ci.hi, 0.01)],
        steps: [
          `z′ = artanh(r) = ½ · ln((1 + r) / (1 − r)) = ½ · ln(${f(1 + r)} / ${f(1 - r)}) = ${f(ci.z, 4)}`,
          `Standardfehler von z′: SE = 1 / √(n − 3) = 1 / √${n - 3} = ${f(ci.se, 4)}`,
          `KI auf der z′-Skala: z′ ± 1,96 · SE = ${f(ci.z, 4)} ± ${f(hw, 4)} → [${f(ci.zLo, 4)}; ${f(ci.zHi, 4)}]`,
          `Rücktransformation r = tanh(z) = (e²ᶻ − 1) / (e²ᶻ + 1): untere Grenze tanh(${f(ci.zLo, 4)}) = ${f(ci.lo, 3)}; obere Grenze tanh(${f(ci.zHi, 4)}) = ${f(ci.hi, 3)}`,
          `95 %-KI für ρ: [${f(ci.lo, 3)}; ${f(ci.hi, 3)}] – ${sig ? "0 liegt nicht im Intervall → die Korrelation ist auf dem 5 %-Niveau signifikant." : "0 liegt im Intervall → die Korrelation ist nicht signifikant (α = .05)."}`,
          `Das Intervall liegt nicht symmetrisch um r = ${f(r)}, weil r auf [−1; 1] begrenzt ist; erst auf der z′-Skala ist die Stichprobenverteilung annähernd normal.`
        ]
      };
    } });

  // ===================== D1 – Wahrscheinlichkeit =====================
  def({ id: "bayes", modules: ["D1", "E1"], topic: "Wahrscheinlichkeit", title: "Bayes mit natürlichen Häufigkeiten (positiver prädiktiver Wert)",
    gen(rng) {
      const prev = rng.pick([1, 2, 5, 10, 20]), sens = rng.pick([80, 85, 90, 95]), spec = rng.pick([80, 85, 90, 95, 98]), N = 10000;
      const krank = N * prev / 100, rp = krank * sens / 100, ges = N - krank, fp = ges * (100 - spec) / 100, ppv = rp / (rp + fp) * 100;
      return {
        intro: `Ein Screening auf Depression hat eine Sensitivität von ${sens} % und eine Spezifität von ${spec} %. Die Prävalenz in der untersuchten Gruppe beträgt ${prev} %. Stelle dir ${N.toLocaleString("de-AT")} Personen vor: Wie viele sind richtig positiv, wie viele falsch positiv, und wie hoch ist der positive prädiktive Wert?`,
        answers: [num("rp", "richtig Positive", rp, 0.5), num("fp", "falsch Positive", fp, 0.5), num("ppv", "positiver prädiktiver Wert", ppv, 0.6, "%")],
        steps: [
          `Erkrankte: ${N} · ${prev} % = ${f(krank, 0)}; Gesunde: ${f(ges, 0)}`,
          `Richtig positiv: ${f(krank, 0)} · ${sens} % = ${f(rp, 1)}`,
          `Falsch positiv: ${f(ges, 0)} · (100 − ${spec}) % = ${f(fp, 1)}`,
          `PPV = RP / (RP + FP) = ${f(rp, 1)} / ${f(rp + fp, 1)} = ${f(ppv, 1)} %`,
          `Merke: Je kleiner die Basisrate, desto kleiner der PPV – auch bei guten Tests.`
        ]
      };
    } });

  def({ id: "binomial", modules: ["D1"], topic: "Wahrscheinlichkeit", title: "Binomialverteilung",
    gen(rng) {
      const n = rng.int(5, 10), p = rng.pick([0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]), k = rng.int(0, n);
      const P = S.binomPmf(k, n, p), c = S.choose(n, k);
      return {
        intro: `In einer Multiple-Choice-Prüfung mit ${n} Fragen rät eine Person bei jeder Frage; die Trefferwahrscheinlichkeit pro Frage ist p = ${f(p)}. Wie groß ist die Wahrscheinlichkeit für genau ${k} Treffer? Gib außerdem Erwartungswert und Varianz der Trefferzahl an.`,
        answers: [num("p", `P(X = ${k})`, P, 0.002), num("e", "Erwartungswert E(X)", n * p, 0.011), num("v", "Varianz Var(X)", n * p * (1 - p), 0.011)],
        steps: [
          `P(X = k) = (n über k) · pᵏ · (1 − p)ⁿ⁻ᵏ`,
          `(${n} über ${k}) = ${c}`,
          `P = ${c} · ${f(p)}^${k} · ${f(1 - p)}^${n - k} = ${f(P, 4)}`,
          `E(X) = n · p = ${n} · ${f(p)} = ${f(n * p)}`,
          `Var(X) = n · p · (1 − p) = ${f(n * p * (1 - p), 3)}`
        ]
      };
    } });

  def({ id: "se_ki", modules: ["D1"], topic: "Inferenzstatistik", title: "Standardfehler und Konfidenzintervall",
    gen(rng) {
      const n = rng.pick([9, 16, 25, 36, 49, 64, 100]), M = rng.int(40, 120), s = rng.int(6, 24);
      const se = s / Math.sqrt(n), tc = S.tCrit(0.05, n - 1);
      return {
        intro: `Eine Stichprobe von n = ${n} Personen hat einen mittleren Stresswert von x̄ = ${M} bei s = ${s}. Berechne den Standardfehler und das 95 %-Konfidenzintervall für μ. Kritischer Wert: t(${n - 1}; .975) = ${f(tc, 3)}.`,
        answers: [num("se", "Standardfehler SE", se, 0.011), num("lo", "Untergrenze", M - tc * se, 0.06), num("hi", "Obergrenze", M + tc * se, 0.06)],
        steps: [
          `SE = s / √n = ${s} / √${n} = ${s} / ${Math.sqrt(n)} = ${f(se, 3)}`,
          `Halbbreite = t · SE = ${f(tc, 3)} · ${f(se, 3)} = ${f(tc * se, 3)}`,
          `95 %-KI = [${M} − ${f(tc * se, 3)}; ${M} + ${f(tc * se, 3)}] = [${f(M - tc * se)}; ${f(M + tc * se)}]`,
          `Hinweis: Bei großem n nähert sich t dem Wert 1,96 der Standardnormalverteilung.`
        ]
      };
    } });

  // ===================== D1 – Tests =====================
  function farFrom(stat, crit, gap) { return Math.abs(Math.abs(stat) - crit) >= gap; }

  def({ id: "ttest_one", modules: ["D1"], topic: "t-Tests", title: "Einstichproben-t-Test",
    gen(rng) {
      let x, r, mu0, tc;
      do {
        mu0 = rng.pick([20, 50, 100]);
        const eff = rng.pick([-1, 0, 1]) * rng.int(0, 8);
        x = Array.from({ length: 8 }, () => Math.round(mu0 + eff + rng.normal(0, 6)));
        r = S.tTestOne(x, mu0); tc = S.tCrit(0.05, r.df);
      } while (!notConst(x) || !farFrom(r.t, tc, 0.08));
      return {
        intro: `Ein Fragebogen hat laut Manual den Populationsmittelwert μ₀ = ${mu0}. In einer Klinikstichprobe (n = 8) ergaben sich die Werte ${list(x)}. Unterscheidet sich die Stichprobe vom Normwert? Kritischer Wert: t(7; .975) = ${f(tc, 3)}.`,
        answers: [num("m", "x̄", r.m, 0.011), num("s", "s", r.s, 0.02), num("t", "t-Wert", r.t, 0.04), num("df", "Freiheitsgrade", r.df, 0), decision(Math.abs(r.t) > tc)],
        steps: [
          `x̄ = ${f(r.m, 3)}; s = ${f(r.s, 3)}`,
          `SE = s / √n = ${f(r.s, 3)} / √8 = ${f(r.se, 3)}`,
          `t = (x̄ − μ₀) / SE = (${f(r.m, 3)} − ${mu0}) / ${f(r.se, 3)} = ${f(r.t, 3)}`,
          `df = n − 1 = 7`,
          `|t| = ${f(Math.abs(r.t), 3)} ${Math.abs(r.t) > tc ? ">" : "≤"} ${f(tc, 3)} → ${Math.abs(r.t) > tc ? SIG : NSIG} (exakt: p = ${f(r.p, 3)})`
        ]
      };
    } });

  def({ id: "ttest_ind", modules: ["D1"], topic: "t-Tests", title: "t-Test für unabhängige Stichproben und Cohens d",
    gen(rng) {
      let x, y, r, tc;
      do {
        const base = rng.int(15, 40), eff = rng.int(0, 9);
        x = Array.from({ length: 6 }, () => Math.round(base + eff + rng.normal(0, 4)));
        y = Array.from({ length: 6 }, () => Math.round(base + rng.normal(0, 4)));
        r = S.tTestInd(x, y); tc = S.tCrit(0.05, r.df);
      } while (!notConst(x) || !notConst(y) || !farFrom(r.t, tc, 0.08));
      return {
        intro: `Gruppe A (Abruflernen) und Gruppe B (Wiederlesen) erzielten folgende Testpunkte. Prüfe mit dem t-Test für unabhängige Stichproben (Varianzhomogenität angenommen) und berechne Cohens d. Kritischer Wert: t(10; .975) = ${f(tc, 3)}.`,
        table: { head: ["", "Werte", "x̄", "s"], rows: [["A", list(x), f(r.m1, 2), f(S.sd(x), 2)], ["B", list(y), f(r.m2, 2), f(S.sd(y), 2)]] },
        answers: [num("sp", "gepoolte SD", r.sp, 0.02), num("t", "t-Wert", r.t, 0.04), num("df", "Freiheitsgrade", r.df, 0), num("d", "Cohens d", r.d, 0.03), decision(Math.abs(r.t) > tc)],
        steps: [
          `x̄_A = ${f(r.m1, 3)}, x̄_B = ${f(r.m2, 3)}; s²_A = ${f(S.variance(x), 3)}, s²_B = ${f(S.variance(y), 3)}`,
          `gepoolte Varianz s²p = ((n₁ − 1)s²_A + (n₂ − 1)s²_B) / (n₁ + n₂ − 2) = ${f(r.sp ** 2, 3)} → s_p = ${f(r.sp, 3)}`,
          `SE = s_p · √(1/n₁ + 1/n₂) = ${f(r.sp, 3)} · √(1/6 + 1/6) = ${f(r.se, 3)}`,
          `t = (x̄_A − x̄_B) / SE = ${f(r.m1 - r.m2, 3)} / ${f(r.se, 3)} = ${f(r.t, 3)}; df = 6 + 6 − 2 = 10`,
          `d = (x̄_A − x̄_B) / s_p = ${f(r.d, 3)}`,
          `|t| ${Math.abs(r.t) > tc ? ">" : "≤"} ${f(tc, 3)} → ${Math.abs(r.t) > tc ? SIG : NSIG} (exakt: p = ${f(r.p, 3)})`
        ]
      };
    } });

  def({ id: "ttest_dep", modules: ["D1"], topic: "t-Tests", title: "t-Test für abhängige Stichproben (Prä-Post)",
    gen(rng) {
      let pre, post, r, tc;
      do {
        const eff = rng.int(0, 6);
        pre = Array.from({ length: 7 }, () => rng.int(18, 35));
        post = pre.map((v) => Math.round(v - eff + rng.normal(0, 3)));
        r = S.tTestPaired(pre, post); tc = S.tCrit(0.05, r.df);
      } while (!notConst(r.diffs) || !farFrom(r.t, tc, 0.08));
      return {
        intro: `Sieben Teilnehmende eines Stressbewältigungstrainings gaben vor und nach dem Training ihren Stresswert an. Prüfe, ob sich der Stress verändert hat. Kritischer Wert: t(6; .975) = ${f(tc, 3)}.`,
        table: { head: ["Person", "Prä", "Post", "Differenz (Prä − Post)"], rows: pre.map((v, i) => [i + 1, v, post[i], r.diffs[i]]) },
        answers: [num("md", "mittlere Differenz", r.md, 0.011), num("sd", "s der Differenzen", r.sd_d, 0.02), num("t", "t-Wert", r.t, 0.04), num("df", "Freiheitsgrade", r.df, 0), decision(Math.abs(r.t) > tc)],
        steps: [
          `Differenzen d = Prä − Post: ${list(r.diffs)}`,
          `d̄ = ${f(r.md, 3)}; s_d = ${f(r.sd_d, 3)}`,
          `SE = s_d / √n = ${f(r.sd_d, 3)} / √7 = ${f(r.se, 3)}`,
          `t = d̄ / SE = ${f(r.t, 3)}; df = 6`,
          `|t| ${Math.abs(r.t) > tc ? ">" : "≤"} ${f(tc, 3)} → ${Math.abs(r.t) > tc ? SIG : NSIG} (exakt: p = ${f(r.p, 3)}; d_z = ${f(r.dz, 2)})`
        ]
      };
    } });

  def({ id: "anova", modules: ["D1"], topic: "Varianzanalyse", title: "Einfaktorielle Varianzanalyse",
    gen(rng) {
      let gs, r, fc;
      do {
        const base = rng.int(10, 30);
        gs = [0, 1, 2].map(() => { const e = rng.int(-4, 4); return Array.from({ length: 4 }, () => Math.round(base + e + rng.normal(0, 3))); });
        r = S.anovaOneWay(gs); fc = S.fCrit(0.05, r.df1, r.df2);
      } while (!gs.every(notConst) || !farFrom(r.F, fc, 0.15));
      return {
        intro: `Drei Gruppen (je n = 4) erhielten unterschiedliche Lerninstruktionen. Berechne die Quadratsummen, den F-Wert und die Freiheitsgrade. Kritischer Wert: F(2, 9; .95) = ${f(fc, 2)}.`,
        table: { head: ["Gruppe", "Werte", "x̄"], rows: gs.map((g, i) => [["A", "B", "C"][i], list(g), f(S.mean(g), 2)]) },
        answers: [num("qsb", "QS zwischen", r.ssb, 0.15), num("qsw", "QS innerhalb", r.ssw, 0.15), num("df1", "df zwischen", r.df1, 0), num("df2", "df innerhalb", r.df2, 0), num("F", "F-Wert", r.F, 0.04), decision(r.F > fc)],
        steps: [
          `Gesamtmittelwert x̄ = ${f(r.grand, 3)}; Gruppenmittel ${r.means.map((m) => f(m, 3)).join("; ")}`,
          `QS zwischen = Σ nⱼ (x̄ⱼ − x̄)² = ${f(r.ssb, 3)}`,
          `QS innerhalb = Σ Σ (x − x̄ⱼ)² = ${f(r.ssw, 3)}`,
          `df zwischen = k − 1 = 2; df innerhalb = N − k = 12 − 3 = 9`,
          `MS zwischen = ${f(r.ssb, 3)} / 2 = ${f(r.msb, 3)}; MS innerhalb = ${f(r.ssw, 3)} / 9 = ${f(r.msw, 3)}`,
          `F = MS zwischen / MS innerhalb = ${f(r.F, 3)} ${r.F > fc ? ">" : "≤"} ${f(fc, 2)} → ${r.F > fc ? SIG : NSIG} (p = ${f(r.p, 3)}, η² = ${f(r.eta2, 2)})`
        ]
      };
    } });

  def({ id: "chi2", modules: ["D1"], topic: "Nonparametrisch", title: "χ²-Unabhängigkeitstest (Vierfeldertafel)",
    gen(rng) {
      let t, r, cc;
      do { t = [[rng.int(8, 60), rng.int(8, 60)], [rng.int(8, 60), rng.int(8, 60)]]; r = S.chi2Table(t); cc = S.chi2Crit(0.05, 1); } while (!farFrom(r.chi2, cc, 0.2));
      return {
        intro: `Hängen Studienrichtung und Teilnahme an einem Mentoringprogramm zusammen? Berechne die erwartete Häufigkeit für Zelle „Psychologie/teilgenommen“, den χ²-Wert und die Freiheitsgrade. Kritischer Wert: χ²(1; .95) = 3,84.`,
        table: { head: ["", "teilgenommen", "nicht teilgenommen"], rows: [["Psychologie", t[0][0], t[0][1]], ["Pädagogik", t[1][0], t[1][1]]] },
        answers: [num("e", "erwartete Häufigkeit (Zelle oben links)", r.exp[0][0], 0.06), num("chi", "χ²", r.chi2, 0.06), num("df", "Freiheitsgrade", r.df, 0), decision(r.chi2 > cc)],
        steps: [
          `N = ${r.N}; Zeilensummen ${t.map(S.sum).join(", ")}; Spaltensummen ${t[0][0] + t[1][0]}, ${t[0][1] + t[1][1]}`,
          `erwartete Häufigkeiten e = Zeilensumme · Spaltensumme / N: ${r.exp.flat().map((v) => f(v, 2)).join("; ")}`,
          `χ² = Σ (b − e)² / e = ${f(r.chi2, 3)}`,
          `df = (2 − 1)(2 − 1) = 1`,
          `χ² ${r.chi2 > cc ? ">" : "≤"} 3,84 → ${r.chi2 > cc ? SIG : NSIG} (p = ${f(r.p, 3)})`
        ]
      };
    } });

  const SMALL_N = "Hinweis: Bei so kleinen Stichproben ist die Normalapproximation nur eine grobe Näherung. Entschieden wird mit der Tabelle der exakten kritischen Werte bzw. dem exakten p-Wert (R z. B. berechnet ihn bei kleinen Stichproben ohne Bindungen automatisch).";
  const pExactTxt = (pOne) => (2 * pOne >= 1 ? `zweiseitig p = min(1; 2 · ${f(pOne, 4)}) = 1` : `zweiseitig p = 2 · ${f(pOne, 4)} = ${f(2 * pOne, 4)}`);

  def({ id: "mann_whitney", modules: ["D1"], topic: "Nonparametrisch", title: "Mann-Whitney-U-Test (zwei unabhängige Gruppen)",
    gen(rng) {
      const c = rng.pick([
        { a: "Achtsamkeitsgruppe", b: "Kontrollgruppe", av: "Grübelneigung (Punkte)" },
        { a: "mit Lernpausen", b: "ohne Lernpausen", av: "Behaltensleistung (Punkte)" },
        { a: "Schichtarbeit", b: "Tagarbeit", av: "Einschlafdauer (Minuten)" },
        { a: "Online-Seminar", b: "Präsenzseminar", av: "Zufriedenheit (Punkte)" }
      ]);
      const n1 = rng.int(5, 8), n2 = rng.int(5, 8), N = n1 + n2, eff = rng.pick([0, 0.7, 1.4, 2]) * (rng() < 0.5 ? -1 : 1);
      const latent = Array.from({ length: n1 }, () => rng.normal(eff, 1)).concat(Array.from({ length: n2 }, () => rng.normal(0, 1)));
      const vals = distinctScores(rng, latent, rng.int(2, 20), 4), x = vals.slice(0, n1), y = vals.slice(n1);
      const r = S.mannWhitney(x, y), crit = S.mannWhitneyCrit(n1, n2), dist = S.mannWhitneyDist(n1, n2), total = S.choose(N, n1);
      const cnt = S.sum(dist.slice(0, r.U + 1)), sig = r.p <= 0.05;
      const order = vals.map((v, i) => [v, i < n1 ? "A" : "B"]).sort((p, q) => p[0] - q[0]);
      return {
        intro: `${c.av} in zwei unabhängigen Gruppen: A = ${c.a} (n₁ = ${n1}), B = ${c.b} (n₂ = ${n2}). Da keine Normalverteilung angenommen werden kann, rechnest du den Mann-Whitney-U-Test (zweiseitig, α = .05). Berechne die Rangsumme R₁ der Gruppe A, U = min(U₁, U₂) und den z-Wert der Normalapproximation (ohne Stetigkeitskorrektur). Kritischer Wert aus der exakten Tabelle: U_krit(${n1}, ${n2}) = ${crit} (signifikant, wenn U ≤ U_krit).`,
        table: { head: ["Gruppe", "n", "Werte"], rows: [[`A: ${c.a}`, n1, list(x)], [`B: ${c.b}`, n2, list(y)]] },
        answers: [num("r1", "Rangsumme R₁ (Gruppe A)", r.R1, 0), num("u", "U = min(U₁, U₂)", r.U, 0), num("z", "z-Wert (Normalapproximation, aus U)", r.z, 0.02), decision(sig)],
        steps: [
          `Alle N = ${N} Werte gemeinsam aufsteigend ordnen (Rang 1 = kleinster Wert; keine Bindungen): ${order.map(([v, g], i) => `${v} (${g}) → ${i + 1}`).join("; ")}`,
          `Ränge Gruppe A: ${list(r.ranks1)} → R₁ = ${f(r.R1, 0)}; Ränge Gruppe B: ${list(r.ranks2)} → R₂ = ${f(r.R2, 0)} (Kontrolle: R₁ + R₂ = N(N + 1)/2 = ${N * (N + 1) / 2})`,
          `U₁ = n₁n₂ + n₁(n₁ + 1)/2 − R₁ = ${n1 * n2} + ${n1 * (n1 + 1) / 2} − ${f(r.R1, 0)} = ${f(r.U1, 0)}`,
          `U₂ = n₁n₂ + n₂(n₂ + 1)/2 − R₂ = ${n1 * n2} + ${n2 * (n2 + 1) / 2} − ${f(r.R2, 0)} = ${f(r.U2, 0)} (Kontrolle: U₁ + U₂ = n₁n₂ = ${n1 * n2}) → U = min(U₁, U₂) = ${f(r.U, 0)}`,
          `Normalapproximation: μ_U = n₁n₂/2 = ${f(r.mu, 1)}; σ_U = √(n₁n₂(N + 1)/12) = √(${n1 * n2} · ${N + 1} / 12) = ${f(r.sigma, 3)}; z = (U − μ_U) / σ_U = (${f(r.U, 0)} − ${f(r.mu, 1)}) / ${f(r.sigma, 3)} = ${f(r.z, 3)} (Näherung: p ≈ ${f(r.pNormal, 3)})`,
          `Exakter p-Wert: Unter H₀ sind alle (${N} über ${n1}) = ${total} Aufteilungen der Ränge auf die Gruppen gleich wahrscheinlich. Davon haben ${cnt} ein U ≤ ${f(r.U, 0)} → P(U ≤ ${f(r.U, 0)}) = ${cnt} / ${total} = ${f(cnt / total, 4)}; ${pExactTxt(cnt / total)}`,
          `Entscheidung: U = ${f(r.U, 0)} ${r.U <= crit ? "≤" : ">"} U_krit = ${crit} bzw. exakt p = ${f(r.p, 4)} ${sig ? "≤" : ">"} .05 → ${sig ? SIG : NSIG}`,
          SMALL_N
        ]
      };
    } });

  def({ id: "wilcoxon", modules: ["D1"], topic: "Nonparametrisch", title: "Wilcoxon-Vorzeichen-Rang-Test (abhängige Stichproben)",
    gen(rng) {
      const c = rng.pick([
        { who: "Teilnehmende einer Expositionstherapie", av: "ihren Angstwert", when: "vor und nach der vierten Sitzung" },
        { who: "Studierende eines Schlaftrainings", av: "das Ausmaß ihrer Schlafprobleme", when: "vor und nach dem Training" },
        { who: "Teilnehmende eines Achtsamkeitskurses", av: "ihren Stresswert", when: "vor und nach dem Kurs" }
      ]);
      const n = rng.int(6, 10), pPos = rng.pick([0.5, 0.65, 0.8, 0.95]), flip = rng() < 0.5;
      const mags = shuffle(rng, Array.from({ length: n + 6 }, (_, i) => i + 1)).slice(0, n); // verschiedene |d| > 0
      const d = mags.map((m) => ((rng() < pPos) !== flip ? m : -m));
      const pre = d.map(() => rng.int(20, 40)), post = pre.map((v, i) => v - d[i]);
      const r = S.wilcoxonSignedRank(pre, post), crit = S.wilcoxonCrit(n), dist = S.wilcoxonDist(n), total = Math.pow(2, n), sig = r.p <= 0.05;
      const cnt = S.sum(dist.slice(0, r.T + 1)), max = n * (n + 1) / 2;
      const byAbs = d.map((v, i) => [v, i]).sort((p, q) => Math.abs(p[0]) - Math.abs(q[0]));
      const pos = r.signedRanks.filter((s) => s > 0), neg = r.signedRanks.filter((s) => s < 0).map((s) => -s);
      return {
        intro: `${n} ${c.who} gaben ${c.when} ${c.av} an. Da für die Differenzen keine Normalverteilung angenommen werden kann, rechnest du den Wilcoxon-Vorzeichen-Rang-Test (zweiseitig, α = .05). Berechne W₊, W₋ und T = min(W₊, W₋). Kritischer Wert aus der exakten Tabelle: T_krit(n = ${n}) = ${crit} (signifikant, wenn T ≤ T_krit).`,
        table: { head: ["Person", "Prä", "Post", "d = Prä − Post"], rows: pre.map((v, i) => [i + 1, v, post[i], d[i]]) },
        answers: [num("wp", "W₊ (Rangsumme der positiven Differenzen)", r.Wplus, 0), num("wm", "W₋ (Rangsumme der negativen Differenzen)", r.Wminus, 0), num("t", "T = min(W₊, W₋)", r.T, 0), decision(sig)],
        steps: [
          `Differenzen d = Prä − Post: ${list(d)} (keine Nulldifferenzen, alle Beträge verschieden)`,
          `Beträge |d| aufsteigend ordnen und Ränge vergeben, Vorzeichen merken: ${byAbs.map(([v, i], k) => `|d| = ${Math.abs(v)} (Person ${i + 1}, ${v > 0 ? "+" : "−"}) → ${k + 1}`).join("; ")}`,
          `W₊ = Summe der Ränge mit positivem d = ${pos.length ? pos.join(" + ") : "0"} = ${r.Wplus}`,
          `W₋ = Summe der Ränge mit negativem d = ${neg.length ? neg.join(" + ") : "0"} = ${r.Wminus} (Kontrolle: W₊ + W₋ = n(n + 1)/2 = ${max})`,
          `T = min(W₊, W₋) = ${r.T}`,
          `z-Näherung: μ_T = n(n + 1)/4 = ${f(r.mu, 1)}; σ_T = √(n(n + 1)(2n + 1)/24) = √(${n} · ${n + 1} · ${2 * n + 1} / 24) = ${f(r.sigma, 3)}; z = (T − μ_T) / σ_T = ${f(r.z, 3)} (Näherung: p ≈ ${f(r.pNormal, 3)})`,
          `Exakter p-Wert: Unter H₀ sind alle 2^${n} = ${total} Vorzeichenkombinationen der Ränge gleich wahrscheinlich. Davon haben ${cnt} ein W₊ ≤ ${r.T} (wegen der Symmetrie gilt dasselbe für W₋) → P(W ≤ ${r.T}) = ${cnt} / ${total} = ${f(cnt / total, 4)}; ${pExactTxt(cnt / total)}`,
          `Entscheidung: T = ${r.T} ${r.T <= crit ? "≤" : ">"} T_krit = ${crit} bzw. exakt p = ${f(r.p, 4)} ${sig ? "≤" : ">"} .05 → ${sig ? SIG : NSIG}`,
          SMALL_N
        ]
      };
    } });

  def({ id: "effekt", modules: ["D1"], topic: "Effektgrößen", title: "Cohens d aus Mittelwerten und Umrechnung in r",
    gen(rng) {
      const m1 = rng.int(20, 60), m2 = m1 - rng.int(1, 12), s1 = rng.int(5, 15), s2 = rng.int(5, 15);
      const sp = Math.sqrt((s1 * s1 + s2 * s2) / 2), d = (m1 - m2) / sp, r = d / Math.sqrt(d * d + 4);
      return {
        intro: `Zwei gleich große Gruppen: Interventionsgruppe x̄₁ = ${m1}, s₁ = ${s1}; Kontrollgruppe x̄₂ = ${m2}, s₂ = ${s2}. Berechne die gepoolte SD, Cohens d und die äquivalente Korrelation r.`,
        answers: [num("sp", "gepoolte SD", sp, 0.02), num("d", "Cohens d", d, 0.02), num("r", "r", r, 0.011)],
        steps: [
          `Bei gleich großen Gruppen: s_p = √((s₁² + s₂²) / 2) = √((${s1 * s1} + ${s2 * s2}) / 2) = ${f(sp, 3)}`,
          `d = (x̄₁ − x̄₂) / s_p = ${m1 - m2} / ${f(sp, 3)} = ${f(d, 3)} (${Math.abs(d) >= 0.8 ? "groß" : Math.abs(d) >= 0.5 ? "mittel" : Math.abs(d) >= 0.2 ? "klein" : "sehr klein"} nach Cohen)`,
          `r = d / √(d² + 4) = ${f(r, 3)}`
        ]
      };
    } });

  const GPOWER = "G*Power rechnet nicht mit der Normalverteilung, sondern exakt mit der nonzentralen t-Verteilung (df = 2n − 2); die Ergebnisse weichen deshalb leicht ab";

  def({ id: "teststaerke", modules: ["D1"], topic: "Teststärke und Stichprobenplanung", title: "Teststärke des t-Tests für unabhängige Stichproben",
    gen(rng) {
      let d, n, pw;
      do {
        d = rng.pick([0.2, 0.3, 0.4, 0.5, 0.6, 0.8, 1]); n = rng.pick([10, 15, 20, 25, 30, 40, 50, 64, 80, 100, 150, 200]);
        pw = S.powerTInd(d, n);
      } while (pw < 0.15 || pw > 0.97);
      const zc = S.normInv(0.975), delta = d * Math.sqrt(n / 2);
      return {
        intro: `Eine Studie vergleicht zwei unabhängige Gruppen mit je n = ${n} Personen (t-Test, α = .05, zweiseitig). Angenommen wird ein wahrer Effekt von d = ${f(d, 1)}. Wie groß ist die Teststärke 1 − β? Verwende die Normalapproximation 1 − β ≈ Φ(d · √(n/2) − z(.975)) mit z(.975) = 1,96.`,
        answers: [num("pw", "Teststärke 1 − β", pw * 100, 1.5, "%")],
        steps: [
          `Kritischer z-Wert für α = .05, zweiseitig: z(.975) = ${f(zc, 3)}`,
          `Erwartete Lage der Teststatistik unter H₁: δ = d · √(n/2) = ${f(d, 1)} · √(${n}/2) = ${f(d, 1)} · ${f(Math.sqrt(n / 2), 3)} = ${f(delta, 3)}`,
          `1 − β ≈ Φ(δ − z(.975)) = Φ(${f(delta, 3)} − ${f(zc, 3)}) = Φ(${f(delta - zc, 3)}) = ${f(pw, 4)} → ${f(pw * 100, 1)} %`,
          `β ≈ ${f(100 - pw * 100, 1)} %: So wahrscheinlich wird der Effekt übersehen. ${pw >= 0.8 ? "Die übliche Mindestanforderung von 80 % ist erfüllt." : "Die übliche Mindestanforderung von 80 % wird nicht erreicht."}`,
          `Die Wahrscheinlichkeit, auf der „falschen“ Seite signifikant zu werden (Φ(−δ − 1,96)), ist hier vernachlässigbar klein.`,
          `Hinweis: ${GPOWER} – meist ist die Teststärke dort etwas kleiner, vor allem bei kleinen Stichproben (z. B. d = 0,5, n = 64: Normalapproximation 80,7 %, G*Power ≈ 80 %).`
        ]
      };
    } });

  def({ id: "stichprobenplanung", modules: ["D1"], topic: "Teststärke und Stichprobenplanung", title: "Stichprobenplanung für den t-Test (A-priori-Power-Analyse)",
    gen(rng) {
      const d = rng.pick([0.2, 0.3, 0.5, 0.8]), pw = rng.pick([0.8, 0.9]);
      const pwT = pw === 0.8 ? ".80" : ".90", za = S.normInv(0.975), zb = S.normInv(pw), raw = 2 * (za + zb) ** 2 / (d * d), n = S.sampleSizeTInd(d, pw);
      return {
        intro: `Du planst eine Studie mit zwei unabhängigen Gruppen (t-Test, α = .05, zweiseitig) und erwartest einen Effekt von d = ${f(d, 1)}. Wie viele Personen brauchst du je Gruppe und insgesamt für eine Teststärke von ${pwT}? Verwende n = 2 · (z(1 − α/2) + z(1 − β))² / d² mit z(.975) = 1,960 und z(${pwT}) = ${f(zb, 3)}.`,
        answers: [num("n", "n je Gruppe", n, 1, undefined, 0), num("N", "N gesamt", 2 * n, 2, undefined, 0)],
        steps: [
          `z(1 − α/2) = z(.975) = ${f(za, 3)}; z(1 − β) = z(${pwT}) = ${f(zb, 3)}`,
          `n = 2 · (${f(za, 3)} + ${f(zb, 3)})² / ${f(d, 1)}² = 2 · ${f((za + zb) ** 2, 3)} / ${f(d * d, 2)} = ${f(raw, 2)}`,
          `Stichprobengrößen immer aufrunden: n = ${n} je Gruppe → N = 2 · ${n} = ${2 * n}`,
          `Hinweis: ${GPOWER}. Durch die t-Korrektur braucht man dort meist etwa eine Person mehr je Gruppe (z. B. d = 0,5, Teststärke .80: 64 statt 63).`,
          `Merke: n wächst mit 1/d² – halbiert sich der erwartete Effekt, braucht man etwa viermal so viele Personen.`
        ]
      };
    } });

  def({ id: "alphafehler", modules: ["D1"], topic: "Inferenzstatistik", title: "Multiples Testen: α-Kumulierung und Bonferroni",
    gen(rng) {
      const k = rng.int(2, 20), a = rng.pick([0.05, 0.01, 0.1]);
      const fw = (1 - Math.pow(1 - a, k)) * 100;
      return {
        intro: `Eine Studie führt ${k} unabhängige Signifikanztests mit jeweils α = ${f(a)} durch. Wie groß ist die Wahrscheinlichkeit für mindestens einen α-Fehler, wenn alle Nullhypothesen gelten? Welches α pro Test ergibt die Bonferroni-Korrektur?`,
        answers: [num("fw", "familienweise Fehlerrate", fw, 0.6, "%"), num("bon", "Bonferroni-α pro Test", a / k, 0.0006)],
        steps: [`P(mind. ein Fehler) = 1 − (1 − α)ᵏ = 1 − ${f(1 - a)}^${k} = ${f(fw / 100, 4)} → ${f(fw, 1)} %`, `α_Bonferroni = α / k = ${f(a)} / ${k} = ${f(a / k, 4)}`]
      };
    } });

  // ===================== D1 – Software-Ausgaben lesen =====================
  // Tabellen im Stil von jamovi/SPSS, alle Zahlen aus simulierten Daten mit PPStats berechnet.
  // Zahlen in der Ausgabe mit Dezimalpunkt (wie in Statistikprogrammen), p-Werte als „.032“ bzw. „< .001“.
  const oNum = (x, d = 3) => { const s = S.round(x, d).toFixed(d); return /^-0\.0*$/.test(s) ? s.slice(1) : s; };
  const oP = (p) => (p < 0.001 ? "< .001" : oNum(p, 3).replace(/^0\./, "."));
  const near05 = (p) => p >= 0.04 && p <= 0.06;
  const OUT_INTRO = "Die Ausgabe ist im Stil von jamovi/SPSS nachgebildet (simulierte Daten); wie in Statistikprogrammen steht dort ein Dezimalpunkt, „< .001“ bedeutet p < 0,001. Beantworte die Fragen anhand der Ausgabe.";
  const dClass = (d) => (Math.abs(d) >= 0.8 ? "großer" : Math.abs(d) >= 0.5 ? "mittlerer" : Math.abs(d) >= 0.2 ? "kleiner" : "sehr kleiner");

  function outTTest(rng) {
    const c = rng.pick([
      { av: "Stresswert", g: ["Training", "Warteliste"], dir: -1, txt: "Studierende nahmen an einem Stressbewältigungstraining teil oder standen auf der Warteliste; danach wurde ihr Stresswert erhoben." },
      { av: "Behaltensleistung", g: ["Abruflernen", "Wiederlesen"], dir: 1, txt: "Zwei Lerngruppen lernten einen Text mit Abruflernen bzw. durch Wiederlesen; eine Woche später wurde die Behaltensleistung getestet." },
      { av: "Lebenszufriedenheit", g: ["Stadt", "Land"], dir: 0, txt: "Personen aus städtischen und ländlichen Wohnorten bewerteten ihre Lebenszufriedenheit." }
    ]);
    let x, y, r, lev;
    do {
      const n1 = rng.int(12, 30), n2 = rng.int(12, 30), mu = rng.int(20, 60), sd = rng.int(5, 12);
      const eff = rng.pick([0, 0.3, 0.6, 1]) * (c.dir || (rng() < 0.5 ? -1 : 1)), ratio = rng.pick([1, 1, 1.3, 2, 2.5]);
      x = Array.from({ length: n1 }, () => Math.round(mu + eff * sd + rng.normal(0, sd)));
      y = Array.from({ length: n2 }, () => Math.round(mu + rng.normal(0, sd * ratio)));
      r = S.tTestInd(x, y); lev = S.levene([x, y]);
    } while (!notConst(x) || !notConst(y) || near05(r.p) || near05(lev.p) || Math.abs(r.m1 - r.m2) < 0.05);
    const n1 = x.length, n2 = y.length, s1 = S.sd(x), s2 = S.sd(y), sig = r.p <= 0.05, levSig = lev.p < 0.05, hi = r.m1 > r.m2 ? c.g[0] : c.g[1];
    const LEV = ["ja – Varianzhomogenität verletzt", "nein – Varianzhomogenität kann angenommen werden"];
    return {
      intro: `${c.txt} Ausgewertet wurde mit dem t-Test für unabhängige Stichproben. ${OUT_INTRO}`,
      output: [
        { title: "Gruppendeskriptive", head: ["Gruppe", "N", "Mittelwert", "SD", "SE"],
          rows: [[c.g[0], String(n1), oNum(r.m1, 2), oNum(s1, 2), oNum(s1 / Math.sqrt(n1), 2)], [c.g[1], String(n2), oNum(r.m2, 2), oNum(s2, 2), oNum(s2 / Math.sqrt(n2), 2)]] },
        { title: "Levene-Test auf Varianzhomogenität", head: ["F", "df1", "df2", "p"], rows: [[oNum(lev.F), String(lev.df1), String(lev.df2), oP(lev.p)]] },
        { title: "t-Test für unabhängige Stichproben", head: ["Abhängige Variable", "Test", "t", "df", "p", "Mittelwertsdifferenz", "SE der Differenz", "Cohens d"],
          rows: [[c.av, "Student-t", oNum(r.t), String(r.df), oP(r.p), oNum(r.m1 - r.m2), oNum(r.se), oNum(r.d)]],
          note: `H₁: μ(${c.g[0]}) ≠ μ(${c.g[1]}); Mittelwertsdifferenz = ${c.g[0]} − ${c.g[1]}.` }
      ],
      answers: [decision(sig), choice("hi", "Welche Gruppe hat den höheren Mittelwert?", c.g.slice(), hi),
        num("d", "Cohens d (mit Vorzeichen, wie ausgegeben)", r.d, 0.006), choice("lev", "Ist die Varianzhomogenität verletzt (Levene-Test)?", LEV, levSig ? LEV[0] : LEV[1])],
      steps: [
        `Signifikanz: Zeile „Student-t“: t(${r.df}) = ${f(r.t, 2)}, ${pTxt(r.p)} ${sig ? "≤" : ">"} .05 → ${sig ? SIG : NSIG}`,
        `Höherer Mittelwert: ${c.g[0]} M = ${f(r.m1, 2)}, ${c.g[1]} M = ${f(r.m2, 2)} → ${hi}. Das Vorzeichen der Mittelwertsdifferenz (${c.g[0]} − ${c.g[1]} = ${f(r.m1 - r.m2, 2)}) und von t zeigt dasselbe.`,
        `Cohens d = Mittelwertsdifferenz / gepoolte SD = ${f(r.d, 3)} → ${dClass(r.d)} Effekt nach Cohen (|d| ab 0,2 klein, ab 0,5 mittel, ab 0,8 groß)`,
        `Levene-Test: F(${lev.df1}, ${lev.df2}) = ${f(lev.F, 2)}, ${pTxt(lev.p)} → ${levSig ? "p < .05: Varianzhomogenität verletzt; berichtet würde dann der Welch-Test (ohne Annahme gleicher Varianzen)." : "p ≥ .05: kein Hinweis auf ungleiche Varianzen; der Student-t-Test ist angemessen."}`,
        `Zusammenhang der Werte: SE der Differenz = s_p · √(1/n₁ + 1/n₂) = ${f(r.se, 3)}; t = ${f(r.m1 - r.m2, 3)} / ${f(r.se, 3)} = ${f(r.t, 3)}; df = n₁ + n₂ − 2 = ${r.df}`
      ]
    };
  }

  function outAnova(rng) {
    const c = rng.pick([
      { factor: "Lernmethode", levels: ["Karteikarten", "Zusammenfassen", "Abruftests", "Mindmaps"], av: "Prüfungspunkte" },
      { factor: "Musikbedingung", levels: ["Stille", "Klassik", "Pop", "Naturgeräusche"], av: "Konzentrationsleistung" },
      { factor: "Altersgruppe", levels: ["18–29", "30–49", "50–64", "65+"], av: "Lebenszufriedenheit" }
    ]);
    let gs, a;
    do {
      const k = rng.pick([3, 3, 4]), n = rng.int(8, 20), mu = rng.int(20, 60), sd = rng.int(5, 12), spread = rng.pick([0, 0.25, 0.5, 0.8]);
      gs = Array.from({ length: k }, () => { const e = rng.normal(0, spread * sd); return Array.from({ length: n }, () => Math.round(mu + e + rng.normal(0, sd))); });
      a = gs.every(notConst) ? S.anovaOneWay(gs) : null;
    } while (!a || near05(a.p) || a.eta2 < 0.015 || Math.abs(a.eta2 - 0.06) < 0.005 || Math.abs(a.eta2 - 0.14) < 0.005);
    const k = gs.length, N = k * gs[0].length, sig = a.p <= 0.05;
    const EFF = ["kleiner Effekt", "mittlerer Effekt", "großer Effekt"], eff = a.eta2 >= 0.14 ? EFF[2] : a.eta2 >= 0.06 ? EFF[1] : EFF[0];
    return {
      intro: `Verglichen wurden ${k} Gruppen (je n = ${gs[0].length}) des Faktors „${c.factor}“; abhängige Variable: ${c.av}. Ausgewertet wurde mit einer einfaktoriellen Varianzanalyse. ${OUT_INTRO}`,
      output: [
        { title: "Deskriptive Statistiken", head: ["Gruppe", "N", "Mittelwert", "SD"], rows: gs.map((g, i) => [c.levels[i], String(g.length), oNum(S.mean(g), 2), oNum(S.sd(g), 2)]) },
        { title: `Einfaktorielle ANOVA – ${c.av}`, head: ["Quelle", "Quadratsumme", "df", "Mittlere Quadrate", "F", "p", "η²"],
          rows: [[c.factor, oNum(a.ssb, 2), String(a.df1), oNum(a.msb, 2), oNum(a.F), oP(a.p), oNum(a.eta2)],
            ["Residuen", oNum(a.ssw, 2), String(a.df2), oNum(a.msw, 2), "", "", ""],
            ["Gesamt", oNum(a.sst, 2), String(N - 1), "", "", "", ""]] }
      ],
      answers: [decision(sig), num("eta", "η² (ablesen)", a.eta2, 0.006), choice("eff", "Einordnung von η² nach Cohen", EFF, eff), num("df2", "df Fehler (Residuen)", a.df2, 0)],
      steps: [
        `Signifikanz: Zeile „${c.factor}“: F(${a.df1}, ${a.df2}) = ${f(a.F, 2)}, ${pTxt(a.p)} ${sig ? "≤" : ">"} .05 → ${sig ? SIG : NSIG}${sig ? ". Die ANOVA zeigt nur, dass sich mindestens zwei Gruppen unterscheiden – welche, klären Post-hoc-Tests." : ""}`,
        `η² = QS ${c.factor} / QS Gesamt = ${f(a.ssb, 2)} / ${f(a.sst, 2)} = ${f(a.eta2, 3)} → ${f(a.eta2 * 100, 1)} % der Varianz gehen auf den Faktor zurück`,
        `Einordnung nach Cohen: η² ab .01 klein, ab .06 mittel, ab .14 groß → ${eff}`,
        `df Fehler = N − k = ${N} − ${k} = ${a.df2} (Zeile „Residuen“); df ${c.factor} = k − 1 = ${a.df1}; df Gesamt = N − 1 = ${N - 1}`,
        `Kontrolle: MQ = QS / df; F = MQ ${c.factor} / MQ Residuen = ${f(a.msb, 2)} / ${f(a.msw, 2)} = ${f(a.F, 3)}`
      ]
    };
  }

  function outCorr(rng) {
    const { v, sg } = rng.pick([ // sg: Vorzeichen der simulierten Pfade X→Y, X→Z, Y→Z
      { v: ["Stress", "Schlafdauer", "Lebenszufriedenheit"], sg: [-1, -1, 1] },
      { v: ["Lernzeit", "Prüfungsangst", "Prüfungspunkte"], sg: [-1, 1, -1] },
      { v: ["Extraversion", "Neurotizismus", "Wohlbefinden"], sg: [-1, 1, -1] }
    ]);
    let n, tests;
    do {
      n = rng.int(30, 120);
      const a = sg[0] * rng() * 0.9, b = sg[1] * rng() * 0.9, cc = sg[2] * rng() * 0.7;
      const lx = Array.from({ length: n }, () => rng.normal()), ly = lx.map((x) => a * x + rng.normal()), lz = lx.map((x, i) => b * x + cc * ly[i] + rng.normal());
      const X = lx.map((x) => Math.round(50 + 10 * x)), Y = ly.map((y) => Math.round(30 + 6 * y)), Z = lz.map((z) => Math.round(40 + 8 * z));
      tests = [[X, Y], [X, Z], [Y, Z]].map(([p, q]) => (notConst(p) && notConst(q) ? S.corTest(p, q) : null));
    } while (tests.some((t) => !t) || (() => { const s = tests.map((t) => Math.abs(t.r)).sort((p, q) => q - p); return s[0] - s[1] < 0.05 || s[0] > 0.9; })() || near05(tests[1].p));
    const PAIRS = [[0, 1], [0, 2], [1, 2]], label = ([i, j]) => `${v[i]} und ${v[j]}`;
    const strongest = tests.reduce((m, t, i) => (Math.abs(t.r) > Math.abs(tests[m].r) ? i : m), 0), ask = rng.int(0, 2);
    const [rXY, rXZ, rYZ] = tests, sigXZ = rXZ.p <= 0.05;
    return {
      intro: `Bei N = ${n} Personen wurden ${v[0]}, ${v[1]} und ${v[2]} erhoben und paarweise korreliert (Pearson). ${OUT_INTRO}`,
      output: [
        { title: "Korrelationsmatrix", head: ["", "", v[0], v[1], v[2]],
          rows: [[v[0], "Pearson r", "—", "", ""], ["", "p", "—", "", ""],
            [v[1], "Pearson r", oNum(rXY.r), "—", ""], ["", "p", oP(rXY.p), "—", ""],
            [v[2], "Pearson r", oNum(rXZ.r), oNum(rYZ.r), "—"], ["", "p", oP(rXZ.p), oP(rYZ.p), "—"]],
          note: `N = ${n}; zweiseitige Tests (H₀: ρ = 0).` }
      ],
      answers: [choice("max", "Welches Variablenpaar hängt am stärksten zusammen?", PAIRS.map(label), label(PAIRS[strongest])),
        choice("sig", `Ist die Korrelation zwischen ${v[0]} und ${v[2]} signifikant (α = .05, zweiseitig)?`, [SIG, NSIG], sigXZ ? SIG : NSIG),
        num("r", `Korrelation r zwischen ${label(PAIRS[ask])} (ablesen)`, tests[ask].r, 0.006)],
      steps: [
        `Stärke des Zusammenhangs = Betrag |r| (das Vorzeichen zeigt nur die Richtung): ${PAIRS.map((p, i) => `|r(${v[p[0]]}, ${v[p[1]]})| = ${f(Math.abs(tests[i].r), 3)}`).join("; ")} → am stärksten: ${label(PAIRS[strongest])} (r = ${f(tests[strongest].r, 3)})`,
        `${v[0]} und ${v[2]}: r = ${f(rXZ.r, 3)}, ${pTxt(rXZ.p)} ${sigXZ ? "≤" : ">"} .05 → ${sigXZ ? SIG : NSIG}`,
        `r(${v[PAIRS[ask][0]]}, ${v[PAIRS[ask][1]]}) = ${f(tests[ask].r, 3)} (Zeile ${v[PAIRS[ask][1]]}, Spalte ${v[PAIRS[ask][0]]}); r² = ${f(tests[ask].r ** 2, 3)} → ${f(tests[ask].r ** 2 * 100, 1)} % gemeinsame Varianz`,
        `Die Matrix ist symmetrisch, deshalb steht jeder Koeffizient nur einmal (unterhalb der Diagonale); auf der Diagonale stünde r = 1.`,
        `Der p-Wert beruht auf t = r · √(N − 2) / √(1 − r²) mit df = N − 2 = ${n - 2}.`
      ]
    };
  }

  function outReg(rng) {
    const c = rng.pick([
      { y: "Prüfungspunkte", x: ["Lernzeit", "Prüfungsangst"], unit: ["Stunden pro Woche", "Punkte"], sg: [1, -1], m: [[10, 4], [25, 6]], my: [60, 12] },
      { y: "Wohlbefinden", x: ["Soziale Unterstützung", "Bildschirmzeit"], unit: ["Punkte", "Stunden pro Tag"], sg: [1, -1], m: [[30, 6], [5, 2]], my: [40, 8] },
      { y: "Arbeitszufriedenheit", x: ["Autonomie", "Pendelzeit"], unit: ["Punkte", "Minuten"], sg: [1, -1], m: [[20, 5], [35, 15]], my: [50, 10] }
    ]);
    let n, x1, x2, reg, which;
    do {
      n = rng.int(40, 120); which = rng.int(0, 1);
      const bet = [0, 0], rho = rng.pick([0, 0.2, -0.2]);
      bet[which] = rng.pick([0.3, 0.4, 0.5]) * c.sg[which]; bet[1 - which] = rng.pick([0, 0.05, -0.05]);
      const z1 = Array.from({ length: n }, () => rng.normal()), z2 = z1.map((z) => rho * z + Math.sqrt(1 - rho * rho) * rng.normal());
      x1 = z1.map((z) => Math.max(0, Math.round(c.m[0][0] + c.m[0][1] * z)));
      x2 = z2.map((z) => Math.max(0, Math.round(c.m[1][0] + c.m[1][1] * z)));
      const y = z1.map((z, i) => Math.round(c.my[0] + c.my[1] * (bet[0] * z + bet[1] * z2[i] + rng.normal(0, 0.85))));
      reg = notConst(x1) && notConst(x2) && notConst(y) ? S.multipleRegression(y, [x1, x2]) : null;
    } while (!reg || !((reg.p[1] < 0.04 && reg.p[2] > 0.06) || (reg.p[2] < 0.04 && reg.p[1] > 0.06)));
    const sigName = reg.p[1] < 0.05 ? c.x[0] : c.x[1];
    const bR = reg.b.map((b) => S.round(b, 3)); // so wie in der Ausgabe angezeigt
    const v1 = Math.max(0, Math.round(c.m[0][0] + c.m[0][1] * (rng.int(-15, 15) / 10))), v2 = Math.max(0, Math.round(c.m[1][0] + c.m[1][1] * (rng.int(-15, 15) / 10)));
    const yh = bR[0] + bR[1] * v1 + bR[2] * v2;
    const coefRow = (name, j) => [name, oNum(reg.b[j]), oNum(reg.se[j]), oNum(reg.t[j]), oP(reg.p[j]), j === 0 ? "" : oNum(reg.beta[j - 1])];
    return {
      intro: `Bei N = ${n} Personen wurde eine multiple lineare Regression gerechnet: Kriterium ${c.y}, Prädiktoren ${c.x[0]} (${c.unit[0]}) und ${c.x[1]} (${c.unit[1]}). ${OUT_INTRO}`,
      output: [
        { title: "Modellanpassung", head: ["Modell", "R", "R²", "F", "df1", "df2", "p"], rows: [["1", oNum(reg.R), oNum(reg.r2), oNum(reg.F, 2), String(reg.df1), String(reg.df2), oP(reg.pF)]] },
        { title: `Modellkoeffizienten – ${c.y}`, head: ["Prädiktor", "Schätzer", "SE", "t", "p", "Stand. Schätzer"],
          rows: [coefRow("Konstante", 0), coefRow(c.x[0], 1), coefRow(c.x[1], 2)], note: "Schätzer = unstandardisierter Regressionskoeffizient b; Stand. Schätzer = β." }
      ],
      answers: [num("r2", "R²", reg.r2, 0.006), choice("sig", "Welcher Prädiktor ist signifikant (α = .05)?", [c.x[0], c.x[1], "beide", "keiner"], sigName),
        num("yh", `vorhergesagter Wert ŷ für ${c.x[0]} = ${v1} und ${c.x[1]} = ${v2}`, yh, 0.05)],
      steps: [
        `R² = ${f(reg.r2, 3)} (Tabelle „Modellanpassung“): Beide Prädiktoren zusammen erklären ${f(reg.r2 * 100, 1)} % der Varianz des Kriteriums (${c.y}); Modelltest F(${reg.df1}, ${reg.df2}) = ${f(reg.F, 2)}, ${pTxt(reg.pF)}`,
        `Koeffizienten: ${c.x[0]}: t = ${f(reg.t[1], 2)}, ${pTxt(reg.p[1])}; ${c.x[1]}: t = ${f(reg.t[2], 2)}, ${pTxt(reg.p[2])} → nur ${sigName} ist signifikant (p ≤ .05)`,
        `Vorhersage mit den unstandardisierten Schätzern: ŷ = ${f(bR[0], 3)} ${signed(bR[1])} · ${v1} ${signed(bR[2])} · ${v2} = ${f(yh, 2)}`,
        `Die standardisierten Schätzer (β = ${f(reg.beta[0], 3)} bzw. ${f(reg.beta[1], 3)}) machen die Prädiktoren trotz unterschiedlicher Einheiten vergleichbar; t = Schätzer / SE, df = N − k − 1 = ${reg.df2}.`
      ]
    };
  }

  def({ id: "ausgabe_lesen", modules: ["D1"], topic: "Software-Ausgaben", title: "Software-Ausgaben interpretieren (t-Test, ANOVA, Korrelation, Regression)",
    gen(rng) { return [outTTest, outAnova, outCorr, outReg][rng.int(0, 3)](rng); } });

  // ===================== D2 – Testtheorie =====================
  def({ id: "sem", modules: ["D2", "E1"], topic: "Klassische Testtheorie", title: "Standardmessfehler und Konfidenzintervall",
    gen(rng) {
      const [M, SD] = rng.pick([[100, 15], [50, 10], [100, 10]]), rel = rng.pick([0.75, 0.8, 0.84, 0.85, 0.88, 0.9, 0.91, 0.95]), x = M + rng.int(-25, 25);
      const sem = SD * Math.sqrt(1 - rel);
      return {
        intro: `Ein Test (M = ${M}, SD = ${SD}) hat eine Reliabilität von ${f(rel)}. Eine Person erzielt ${x}. Berechne den Standardmessfehler und das 95 %-Konfidenzintervall (vereinfacht um den beobachteten Wert, z = 1,96).`,
        answers: [num("sem", "Standardmessfehler", sem, 0.02), num("lo", "Untergrenze", x - 1.96 * sem, 0.1), num("hi", "Obergrenze", x + 1.96 * sem, 0.1)],
        steps: [`SEM = SD · √(1 − Rel) = ${SD} · √(1 − ${f(rel)}) = ${SD} · ${f(Math.sqrt(1 - rel), 4)} = ${f(sem, 3)}`, `KI = ${x} ± 1,96 · ${f(sem, 3)} = ${x} ± ${f(1.96 * sem, 2)} → [${f(x - 1.96 * sem)}; ${f(x + 1.96 * sem)}]`]
      };
    } });

  def({ id: "spearman_brown", modules: ["D2"], topic: "Klassische Testtheorie", title: "Spearman-Brown-Formel",
    gen(rng) {
      const r = rng.pick([0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8]);
      if (rng() < 0.5) {
        const k = rng.pick([2, 3, 0.5, 1.5]), rn = k * r / (1 + (k - 1) * r);
        return {
          intro: `Ein Test mit ${k >= 1 ? "" : "zu langer Bearbeitungszeit und "}Reliabilität ${f(r)} wird um den Faktor k = ${f(k, 1)} ${k >= 1 ? "verlängert" : "verkürzt"} (mit gleichwertigen Items). Wie hoch ist die erwartete Reliabilität?`,
          answers: [num("rn", "neue Reliabilität", rn, 0.011)],
          steps: [`Rel_neu = k · Rel / (1 + (k − 1) · Rel) = ${f(k, 1)} · ${f(r)} / (1 + ${f(k - 1, 1)} · ${f(r)}) = ${f(rn, 3)}`]
        };
      }
      const target = rng.pick([0.8, 0.85, 0.9, 0.95].filter((t) => t > r));
      const k = target * (1 - r) / (r * (1 - target));
      return {
        intro: `Ein Test mit 10 Items hat die Reliabilität ${f(r)}. Um welchen Faktor k muss er verlängert werden, um eine Reliabilität von ${f(target)} zu erreichen? Wie viele Items sind das (aufgerundet)?`,
        answers: [num("k", "Faktor k", k, 0.03), num("items", "Itemanzahl (aufgerundet)", Math.ceil(10 * k - 1e-9), 0)],
        steps: [`Umgeformt: k = Rel_Ziel · (1 − Rel) / (Rel · (1 − Rel_Ziel)) = ${f(target)} · ${f(1 - r)} / (${f(r)} · ${f(1 - target)}) = ${f(k, 3)}`, `Items = 10 · ${f(k, 3)} = ${f(10 * k, 2)} → ${Math.ceil(10 * k - 1e-9)} Items`]
      };
    } });

  def({ id: "minderung", modules: ["D2"], topic: "Klassische Testtheorie", title: "Minderungskorrektur",
    gen(rng) {
      const rxy = rng.int(15, 50) / 100, rx = rng.int(60, 95) / 100, ry = rng.int(60, 95) / 100, rc = rxy / Math.sqrt(rx * ry);
      return {
        intro: `Ein Persönlichkeitsfragebogen (Rel = ${f(rx)}) korreliert mit der Arbeitsleistung (Rel = ${f(ry)}) zu r = ${f(rxy)}. Wie hoch wäre die Korrelation der wahren Werte? Wie hoch kann die beobachtete Korrelation maximal sein?`,
        answers: [num("rc", "minderungskorrigierte Korrelation", rc, 0.011), num("max", "maximal mögliche beobachtete Korrelation", Math.sqrt(rx * ry), 0.011)],
        steps: [`r_c = r_xy / √(Rel_x · Rel_y) = ${f(rxy)} / √(${f(rx)} · ${f(ry)}) = ${f(rxy)} / ${f(Math.sqrt(rx * ry), 4)} = ${f(rc, 3)}`, `Maximal: r_max = √(Rel_x · Rel_y) = ${f(Math.sqrt(rx * ry), 3)} (Reliabilitäts-Validitäts-Dilemma)`]
      };
    } });

  def({ id: "itemanalyse", modules: ["D2"], topic: "Itemanalyse", title: "Itemschwierigkeit und Trennschärfe",
    gen(rng) {
      let items, j, rit;
      do {
        const n = 8, theta = Array.from({ length: n }, () => rng.normal()), beta = [0, 1, 2, 3].map(() => rng.normal(0, 0.8));
        items = beta.map((b) => theta.map((t) => (rng() < 1 / (1 + Math.exp(-(t - b) * 1.7)) ? 1 : 0)));
        j = rng.int(0, 3);
        const rest = theta.map((_, p) => S.sum(items.filter((_, i) => i !== j).map((it) => it[p])));
        rit = notConst(items[j]) && notConst(rest) ? S.itemTotal(items, j) : NaN;
      } while (!isFinite(rit));
      const P = S.mean(items[j]);
      const rest = items[0].map((_, p) => S.sum(items.filter((_, i) => i !== j).map((it) => it[p])));
      return {
        intro: `Acht Personen bearbeiteten vier Aufgaben (1 = gelöst). Berechne für Item ${j + 1} die Schwierigkeit P (Lösungsanteil) und die part-whole-korrigierte Trennschärfe (Korrelation des Items mit der Summe der übrigen Items).`,
        table: { head: ["Person", "Item 1", "Item 2", "Item 3", "Item 4"], rows: items[0].map((_, p) => [p + 1].concat(items.map((it) => it[p]))) },
        answers: [num("p", `Schwierigkeit P (Item ${j + 1})`, P, 0.006), num("rit", `Trennschärfe r_it (Item ${j + 1})`, rit, 0.02)],
        steps: [
          `P = gelöst / n = ${S.sum(items[j])} / 8 = ${f(P, 3)} (${P >= 0.8 ? "leicht" : P <= 0.2 ? "schwer" : "mittel"})`,
          `Restsumme ohne Item ${j + 1} je Person: ${list(rest)}`,
          `r_it = Korrelation(Item ${j + 1}, Restsumme) = ${f(rit, 3)} ${rit >= 0.3 ? "(gut, ≥ .30)" : "(gering, < .30 – überarbeiten)"}`
        ]
      };
    } });

  def({ id: "alpha", modules: ["D2"], topic: "Reliabilität", title: "Cronbachs α",
    gen(rng) {
      let items, r;
      do {
        const n = 5, theta = Array.from({ length: n }, () => rng.normal());
        items = [0, 1, 2, 3].map(() => theta.map((t) => clamp(Math.round(3 + 1.1 * t + rng.normal(0, 0.7)), 1, 5)));
        r = items.every(notConst) ? S.cronbachAlpha(items) : null;
      } while (!r || r.totVar === 0 || r.alpha < 0.3);
      return {
        intro: `Fünf Personen beantworteten vier Items einer Skala (1–5). Berechne die Summe der Itemvarianzen, die Varianz des Summenwerts und Cronbachs α (Varianzen mit n − 1).`,
        table: { head: ["Person", "Item 1", "Item 2", "Item 3", "Item 4", "Summe"], rows: items[0].map((_, p) => [p + 1].concat(items.map((it) => it[p]), [r.total[p]])) },
        answers: [num("sv", "Σ Itemvarianzen", r.sumVar, 0.06), num("tv", "Varianz des Summenwerts", r.totVar, 0.06), num("a", "Cronbachs α", r.alpha, 0.02)],
        steps: [
          `Itemvarianzen: ${items.map((it) => f(S.variance(it), 3)).join("; ")} → Σ = ${f(r.sumVar, 3)}`,
          `Summenwerte: ${list(r.total)} → Varianz = ${f(r.totVar, 3)}`,
          `α = k / (k − 1) · (1 − Σs²ᵢ / s²_X) = 4/3 · (1 − ${f(r.sumVar, 3)} / ${f(r.totVar, 3)}) = ${f(r.alpha, 3)}`
        ]
      };
    } });

  def({ id: "normwerte", modules: ["D2", "E1"], topic: "Normwerte", title: "Normwerte umrechnen (z, T, IQ, Stanine, Prozentrang)",
    gen(rng) {
      const z = rng.int(-24, 24) / 10, kind = rng.pick(["z", "T", "IQ"]);
      const T = 50 + 10 * z, IQ = 100 + 15 * z, st = clamp(Math.round(2 * z + 5), 1, 9), pr = S.normCdf(z) * 100;
      const given = { z: `z = ${f(z, 1)}`, T: `T = ${f(T, 0)}`, IQ: `IQ = ${f(IQ, 1)}` }[kind];
      const ans = [];
      if (kind !== "z") ans.push(num("z", "z-Wert", z, 0.011));
      if (kind !== "T") ans.push(num("t", "T-Wert", T, 0.15));
      if (kind !== "IQ") ans.push(num("iq", "IQ-Skala", IQ, 0.2));
      ans.push(num("st", "Stanine", st, 0), num("pr", "Prozentrang", pr, 1.5, "%"));
      return {
        intro: `Ein Testergebnis wird als ${given} berichtet (normalverteiltes Merkmal). Rechne in die übrigen Normskalen um.`,
        answers: ans,
        steps: [
          kind === "z" ? `z ist gegeben: ${f(z, 1)}` : kind === "T" ? `z = (T − 50) / 10 = ${f(z, 1)}` : `z = (IQ − 100) / 15 = ${f(z, 2)}`,
          `T = 50 + 10z = ${f(T, 1)}; IQ = 100 + 15z = ${f(IQ, 1)}`,
          `Stanine = 2z + 5, gerundet und auf 1–9 begrenzt = ${st}`,
          `Prozentrang = Φ(z) · 100 ≈ ${f(pr, 1)} %`
        ]
      };
    } });

  def({ id: "rasch", modules: ["D2"], topic: "Item-Response-Theorie", title: "Rasch-Modell: Lösungswahrscheinlichkeit",
    gen(rng) {
      const sig = rng.int(-20, 20) / 10;
      if (rng() < 0.6) {
        const th = rng.int(-25, 25) / 10, P = 1 / (1 + Math.exp(-(th - sig)));
        return {
          intro: `Im Rasch-Modell hat eine Person die Fähigkeit θ = ${f(th, 1)}, ein Item die Schwierigkeit σ = ${f(sig, 1)}. Wie groß ist die Lösungswahrscheinlichkeit?`,
          answers: [num("p", "P(X = 1)", P, 0.011)],
          steps: [`P = exp(θ − σ) / (1 + exp(θ − σ)); θ − σ = ${f(th - sig, 1)}`, `exp(${f(th - sig, 1)}) = ${f(Math.exp(th - sig), 4)}`, `P = ${f(Math.exp(th - sig), 4)} / ${f(1 + Math.exp(th - sig), 4)} = ${f(P, 3)}`]
        };
      }
      const P = rng.pick([0.2, 0.25, 0.75, 0.8, 0.9]), th = sig + Math.log(P / (1 - P));
      return {
        intro: `Ein Item hat im Rasch-Modell die Schwierigkeit σ = ${f(sig, 1)}. Welche Fähigkeit θ braucht eine Person, um es mit Wahrscheinlichkeit ${f(P)} zu lösen?`,
        answers: [num("th", "θ", th, 0.02)],
        steps: [`Aus P = exp(θ − σ) / (1 + exp(θ − σ)) folgt θ = σ + ln(P / (1 − P))`, `θ = ${f(sig, 1)} + ln(${f(P)} / ${f(1 - P)}) = ${f(sig, 1)} + ${f(Math.log(P / (1 - P)), 3)} = ${f(th, 3)}`]
      };
    } });

  def({ id: "kappa", modules: ["D2"], topic: "Beobachtung", title: "Cohens κ (Beurteilerübereinstimmung)",
    gen(rng) {
      let t, r;
      do { t = [[rng.int(10, 40), rng.int(1, 12)], [rng.int(1, 12), rng.int(10, 40)]]; r = S.kappa(t); } while (r.pe >= 0.99);
      return {
        intro: `Zwei Beobachterinnen kodierten ${r.N} Videosequenzen, ob prosoziales Verhalten vorkommt. Berechne beobachtete Übereinstimmung p₀, zufällig erwartete Übereinstimmung p_e und Cohens κ.`,
        table: { head: ["", "B: ja", "B: nein"], rows: [["A: ja", t[0][0], t[0][1]], ["A: nein", t[1][0], t[1][1]]] },
        answers: [num("po", "p₀", r.po, 0.006), num("pe", "p_e", r.pe, 0.006), num("k", "Cohens κ", r.kappa, 0.015)],
        steps: [
          `p₀ = (${t[0][0]} + ${t[1][1]}) / ${r.N} = ${f(r.po, 3)}`,
          `p_e = (Zeile ja · Spalte ja + Zeile nein · Spalte nein) / N² = (${t[0][0] + t[0][1]} · ${t[0][0] + t[1][0]} + ${t[1][0] + t[1][1]} · ${t[0][1] + t[1][1]}) / ${r.N}² = ${f(r.pe, 3)}`,
          `κ = (p₀ − p_e) / (1 − p_e) = ${f(r.kappa, 3)}`
        ]
      };
    } });

  // ===================== E1 – Diagnostik =====================
  def({ id: "diagnostik", modules: ["E1"], topic: "Diagnostische Kennwerte", title: "Sensitivität, Spezifität, PPV und NPV",
    gen(rng) {
      const tp = rng.int(15, 90), fn = rng.int(2, 30), fp = rng.int(5, 80), tn = rng.int(100, 600), d = S.diag2x2(tp, fn, fp, tn);
      return {
        intro: `Ein Screening wurde an ${tp + fn + fp + tn} Personen mit einem diagnostischen Interview als Referenz verglichen. Berechne Sensitivität, Spezifität, positiven und negativen prädiktiven Wert (in %).`,
        table: { head: ["", "Störung vorhanden", "keine Störung"], rows: [["Screening positiv", tp, fp], ["Screening negativ", fn, tn]] },
        answers: [num("se", "Sensitivität", d.sens * 100, 0.6, "%"), num("sp", "Spezifität", d.spec * 100, 0.6, "%"), num("ppv", "PPV", d.ppv * 100, 0.6, "%"), num("npv", "NPV", d.npv * 100, 0.6, "%")],
        steps: [`Sensitivität = RP / (RP + FN) = ${tp} / ${tp + fn} = ${f(d.sens * 100, 1)} %`, `Spezifität = RN / (RN + FP) = ${tn} / ${tn + fp} = ${f(d.spec * 100, 1)} %`, `PPV = RP / (RP + FP) = ${tp} / ${tp + fp} = ${f(d.ppv * 100, 1)} %`, `NPV = RN / (RN + FN) = ${tn} / ${tn + fn} = ${f(d.npv * 100, 1)} %`]
      };
    } });

  // ===================== API =====================
  function make(id, seed) {
    const g = G.find((x) => x.id === id);
    if (!g) throw new Error("Unbekannter Generator: " + id);
    const task = g.gen(S.makeRng(seed));
    return Object.assign({ id, seed, title: g.title, topic: g.topic, modules: g.modules }, task);
  }
  function check(task, inputs) {
    return task.answers.map((a) => {
      const raw = inputs[a.key];
      if (a.type === "choice") return raw === a.value;
      const v = S.parseNum(raw);
      return isFinite(v) && Math.abs(v - a.value) <= a.tol + 1e-9;
    });
  }
  const display = (a) => (a.type === "choice" ? a.value : f(a.value, a.dec != null ? a.dec : a.tol === 0 ? 0 : a.tol >= 0.5 ? 1 : a.tol >= 0.05 ? 2 : a.tol >= 0.005 ? 3 : 4));
  return { generators: G.map(({ id, modules, topic, title }) => ({ id, modules, topic, title })), make, check, display, SIG, NSIG };
});
