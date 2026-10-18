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
  const num = (key, label, value, tol, unit) => ({ key, label, value, tol, unit, type: "num" });
  const list = (a, d = 0) => a.map((x) => f(x, d)).join("; ");
  const ints = (rng, n, lo, hi) => Array.from({ length: n }, () => rng.int(lo, hi));
  const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
  const notConst = (a) => new Set(a).size > 1;

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
  const display = (a) => (a.type === "choice" ? a.value : f(a.value, a.tol === 0 ? 0 : a.tol >= 0.5 ? 1 : a.tol >= 0.05 ? 2 : a.tol >= 0.005 ? 3 : 4));
  return { generators: G.map(({ id, modules, topic, title }) => ({ id, modules, topic, title })), make, check, display, SIG, NSIG };
});
