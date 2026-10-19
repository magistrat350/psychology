/* PPStats – kleine Statistik-Bibliothek für Rechentrainer, Übungsdatensätze und Tests.
 * Läuft im Browser (window.PPStats) und in Node (require). Keine Abhängigkeiten. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PPStats = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // ---------- Zufall (reproduzierbar) ----------
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function makeRng(seed) {
    const r = mulberry32(seed);
    const rng = () => r();
    rng.int = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
    rng.pick = (arr) => arr[Math.floor(r() * arr.length)];
    rng.normal = (mu = 0, sd = 1) => {
      let u = 0, v = 0;
      while (u === 0) u = r();
      while (v === 0) v = r();
      return mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };
    rng.round = (x, d = 0) => round(x, d);
    return rng;
  }

  // ---------- Grundlagen ----------
  const round = (x, d = 2) => { const f = Math.pow(10, d); return Math.round((x + Number.EPSILON * Math.sign(x)) * f) / f; };
  const sum = (a) => a.reduce((s, x) => s + x, 0);
  const mean = (a) => sum(a) / a.length;
  function median(a) {
    const s = a.slice().sort((x, y) => x - y), n = s.length;
    return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  }
  function modes(a) {
    const c = new Map(); a.forEach((x) => c.set(x, (c.get(x) || 0) + 1));
    const max = Math.max(...c.values());
    return [...c.entries()].filter(([, n]) => n === max).map(([x]) => x).sort((x, y) => x - y);
  }
  const ss = (a) => { const m = mean(a); return sum(a.map((x) => (x - m) ** 2)); };
  const variance = (a) => ss(a) / (a.length - 1);          // Stichprobenvarianz (n − 1)
  const sd = (a) => Math.sqrt(variance(a));
  const cov = (x, y) => { const mx = mean(x), my = mean(y); return sum(x.map((v, i) => (v - mx) * (y[i] - my))) / (x.length - 1); };
  const pearson = (x, y) => cov(x, y) / (sd(x) * sd(y));
  function regression(x, y) { const b = cov(x, y) / variance(x); return { b, a: mean(y) - b * mean(x), r: pearson(x, y) }; }
  function ranks(a) {
    const idx = a.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]);
    const r = new Array(a.length);
    for (let i = 0; i < idx.length;) {
      let j = i; while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
      const avg = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) r[idx[k][1]] = avg;
      i = j + 1;
    }
    return r;
  }

  // ---------- Spezielle Funktionen ----------
  function erf(x) {
    // Abramowitz & Stegun 7.1.26 (Fehler < 1.5e-7)
    const s = Math.sign(x); x = Math.abs(x);
    const t = 1 / (1 + 0.3275911 * x);
    const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
    return s * y;
  }
  const normCdf = (z) => 0.5 * (1 + erf(z / Math.SQRT2));
  function normInv(p) {
    // Acklam-Approximation, verfeinert mit einem Newton-Schritt
    if (p <= 0) return -Infinity; if (p >= 1) return Infinity;
    const a = [-3.969683028665376e1, 2.209460984245205e2, -2.759285104469687e2, 1.38357751867269e2, -3.066479806614716e1, 2.506628277459239];
    const b = [-5.447609879822406e1, 1.615858368580409e2, -1.556989798598866e2, 6.680131188771972e1, -1.328068155288572e1];
    const c = [-7.784894002430293e-3, -3.223964580411365e-1, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783];
    const d = [7.784695709041462e-3, 3.224671290700398e-1, 2.445134137142996, 3.754408661907416];
    const pl = 0.02425; let q, r, x;
    if (p < pl) { q = Math.sqrt(-2 * Math.log(p)); x = (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    else if (p <= 1 - pl) { q = p - 0.5; r = q * q; x = (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1); }
    else { q = Math.sqrt(-2 * Math.log(1 - p)); x = -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    const e = normCdf(x) - p; const u = e * Math.sqrt(2 * Math.PI) * Math.exp(x * x / 2);
    return x - u / (1 + x * u / 2);
  }
  function lgamma(x) {
    const g = 7, c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61503916999185, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (x < 0.5) return Math.log(Math.PI / Math.abs(Math.sin(Math.PI * x))) - lgamma(1 - x);
    x -= 1; let s = c[0];
    for (let i = 1; i < g + 2; i++) s += c[i] / (x + i);
    const t = x + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(s);
  }
  function betacf(a, b, x) {
    const MAXIT = 300, EPS = 3e-14, FPMIN = 1e-300;
    const qab = a + b, qap = a + 1, qam = a - 1;
    let c = 1, d = 1 - qab * x / qap; if (Math.abs(d) < FPMIN) d = FPMIN; d = 1 / d; let h = d;
    for (let m = 1; m <= MAXIT; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d; h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d; if (Math.abs(d) < FPMIN) d = FPMIN; c = 1 + aa / c; if (Math.abs(c) < FPMIN) c = FPMIN; d = 1 / d;
      const del = d * c; h *= del; if (Math.abs(del - 1) < EPS) break;
    }
    return h;
  }
  function ibeta(x, a, b) {
    // regularisierte unvollständige Betafunktion I_x(a, b)
    if (x <= 0) return 0; if (x >= 1) return 1;
    const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
    return x < (a + 1) / (a + b + 2) ? bt * betacf(a, b, x) / a : 1 - bt * betacf(b, a, 1 - x) / b;
  }
  function gammaP(a, x) {
    // regularisierte untere unvollständige Gammafunktion P(a, x)
    if (x <= 0) return 0;
    if (x < a + 1) {
      let ap = a, s = 1 / a, del = s;
      for (let n = 0; n < 500; n++) { ap++; del *= x / ap; s += del; if (Math.abs(del) < Math.abs(s) * 1e-15) break; }
      return s * Math.exp(-x + a * Math.log(x) - lgamma(a));
    }
    let b = x + 1 - a, c = 1e300, d = 1 / b, h = d;
    for (let i = 1; i < 500; i++) {
      const an = -i * (i - a); b += 2; d = an * d + b; if (Math.abs(d) < 1e-300) d = 1e-300; c = b + an / c; if (Math.abs(c) < 1e-300) c = 1e-300; d = 1 / d;
      const del = d * c; h *= del; if (Math.abs(del - 1) < 1e-15) break;
    }
    return 1 - Math.exp(-x + a * Math.log(x) - lgamma(a)) * h;
  }

  // ---------- Verteilungen ----------
  const tCdf = (t, df) => { const x = df / (df + t * t); const p = 0.5 * ibeta(x, df / 2, 0.5); return t >= 0 ? 1 - p : p; };
  const tTwoSided = (t, df) => ibeta(df / (df + t * t), df / 2, 0.5);
  const fUpper = (f, d1, d2) => (f <= 0 ? 1 : ibeta(d2 / (d2 + d1 * f), d2 / 2, d1 / 2));
  const chi2Upper = (x, df) => 1 - gammaP(df / 2, x / 2);
  function invert(fn, target, lo, hi) { // monoton steigende fn
    for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (fn(mid) < target) lo = mid; else hi = mid; }
    return (lo + hi) / 2;
  }
  const tCrit = (alpha, df, twoSided = true) => invert((t) => tCdf(t, df), 1 - (twoSided ? alpha / 2 : alpha), 0, 1000);
  const fCrit = (alpha, d1, d2) => invert((f) => 1 - fUpper(f, d1, d2), 1 - alpha, 0, 10000);
  const chi2Crit = (alpha, df) => invert((x) => 1 - chi2Upper(x, df), 1 - alpha, 0, 10000);
  function choose(n, k) { if (k < 0 || k > n) return 0; let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; }
  const binomPmf = (k, n, p) => choose(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);

  // ---------- Tests ----------
  function tTestOne(x, mu0) { const n = x.length, m = mean(x), s = sd(x), se = s / Math.sqrt(n), t = (m - mu0) / se, df = n - 1; return { m, s, se, t, df, p: tTwoSided(t, df), d: (m - mu0) / s }; }
  function tTestInd(x, y) {
    const n1 = x.length, n2 = y.length, df = n1 + n2 - 2;
    const sp2 = ((n1 - 1) * variance(x) + (n2 - 1) * variance(y)) / df, sp = Math.sqrt(sp2);
    const se = sp * Math.sqrt(1 / n1 + 1 / n2), t = (mean(x) - mean(y)) / se;
    return { m1: mean(x), m2: mean(y), sp, se, t, df, p: tTwoSided(t, df), d: (mean(x) - mean(y)) / sp };
  }
  function tTestPaired(x, y) { const dlt = x.map((v, i) => v - y[i]); const r = tTestOne(dlt, 0); return Object.assign(r, { diffs: dlt, md: r.m, sd_d: r.s, dz: r.d }); }
  function anovaOneWay(groups) {
    const all = [].concat(...groups), gm = mean(all), k = groups.length, N = all.length;
    const ssb = sum(groups.map((g) => g.length * (mean(g) - gm) ** 2));
    const ssw = sum(groups.map((g) => ss(g)));
    const df1 = k - 1, df2 = N - k, msb = ssb / df1, msw = ssw / df2, F = msb / msw;
    return { means: groups.map(mean), grand: gm, ssb, ssw, sst: ssb + ssw, df1, df2, msb, msw, F, p: fUpper(F, df1, df2), eta2: ssb / (ssb + ssw) };
  }
  function kruskal(groups) {
    const all = [].concat(...groups), r = ranks(all), N = all.length; let off = 0, H = 0;
    groups.forEach((g) => { const rs = sum(r.slice(off, off + g.length)); H += rs * rs / g.length; off += g.length; });
    H = 12 / (N * (N + 1)) * H - 3 * (N + 1);
    return { H, df: groups.length - 1, p: chi2Upper(H, groups.length - 1) };
  }
  function chi2Table(t) {
    const R = t.length, C = t[0].length, rs = t.map(sum), cs = t[0].map((_, j) => sum(t.map((r) => r[j]))), N = sum(rs);
    const exp = t.map((r, i) => r.map((_, j) => rs[i] * cs[j] / N));
    let chi2 = 0; t.forEach((r, i) => r.forEach((o, j) => { chi2 += (o - exp[i][j]) ** 2 / exp[i][j]; }));
    const df = (R - 1) * (C - 1);
    return { exp, chi2, df, p: chi2Upper(chi2, df), N };
  }
  function kappa(t) {
    const N = sum(t.map(sum)), k = t.length;
    const po = sum(t.map((r, i) => r[i])) / N;
    const pe = sum(t.map((r, i) => sum(r) * sum(t.map((row) => row[i])))) / (N * N);
    return { po, pe, kappa: (po - pe) / (1 - pe), N, k };
  }
  function cronbachAlpha(items) { // items: Array von Spalten (je Item ein Array über Personen)
    const k = items.length, n = items[0].length;
    const tot = Array.from({ length: n }, (_, p) => sum(items.map((it) => it[p])));
    const sumVar = sum(items.map(variance)), totVar = variance(tot);
    return { k, sumVar, totVar, alpha: k / (k - 1) * (1 - sumVar / totVar), total: tot };
  }
  function itemTotal(items, j) { // part-whole-korrigierte Trennschärfe
    const n = items[0].length;
    const rest = Array.from({ length: n }, (_, p) => sum(items.filter((_, i) => i !== j).map((it) => it[p])));
    return pearson(items[j], rest);
  }
  function solve(A, b) { // Gauß-Elimination mit Pivotsuche
    const n = b.length, M = A.map((r, i) => r.concat([b[i]]));
    for (let c = 0; c < n; c++) {
      let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
      [M[c], M[p]] = [M[p], M[c]];
      for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
    }
    return M.map((r, i) => r[n] / r[i]);
  }
  function multipleRegression(y, xs) { // xs: Array von Prädiktor-Spalten; Rückgabe b[0] = Achsenabschnitt
    const n = y.length, X = Array.from({ length: n }, (_, i) => [1].concat(xs.map((c) => c[i])));
    const p = X[0].length;
    const XtX = Array.from({ length: p }, (_, a) => Array.from({ length: p }, (_, b) => sum(X.map((r) => r[a] * r[b]))));
    const Xty = Array.from({ length: p }, (_, a) => sum(X.map((r, i) => r[a] * y[i])));
    const b = solve(XtX, Xty);
    const yhat = X.map((r) => sum(r.map((v, i) => v * b[i])));
    const ssRes = sum(y.map((v, i) => (v - yhat[i]) ** 2)), ssTot = ss(y);
    const r2 = 1 - ssRes / ssTot;
    const beta = b.slice(1).map((bi, i) => bi * sd(xs[i]) / sd(y));
    // Inferenz: SE(b_j) = √(MQ_Res · [(X'X)⁻¹]_jj), t = b / SE, df = n − p; Modelltest F = (QS_Reg / k) / MQ_Res
    const k = p - 1, df2 = n - p, mse = ssRes / df2;
    const inv = Array.from({ length: p }, (_, j) => solve(XtX, Array.from({ length: p }, (_, i) => (i === j ? 1 : 0))));
    const se = b.map((_, j) => Math.sqrt(mse * inv[j][j]));
    const t = b.map((bj, j) => bj / se[j]);
    const F = ((ssTot - ssRes) / k) / mse;
    return { b, beta, r2, adjR2: 1 - (1 - r2) * (n - 1) / (n - p), R: Math.sqrt(Math.max(0, r2)), yhat, ssRes, ssTot,
      se, t, p: t.map((tj) => tTwoSided(tj, df2)), F, df1: k, df2, pF: fUpper(F, k, df2) };
  }
  function corTest(x, y) { // Pearson-r mit t-Test (H₀: ρ = 0), df = n − 2
    const r = pearson(x, y), df = x.length - 2, t = r * Math.sqrt(df / (1 - r * r));
    return { r, t, df, p: tTwoSided(t, df) };
  }
  function levene(groups) { // Levene-Test: einfaktorielle ANOVA über |x − Gruppenmittelwert|
    const a = anovaOneWay(groups.map((g) => { const m = mean(g); return g.map((v) => Math.abs(v - m)); }));
    return { F: a.F, df1: a.df1, df2: a.df2, p: a.p };
  }

  // ---------- Exakte Verteilungen rangbasierter Tests (ohne Bindungen) ----------
  const mwuMemo = new Map();
  function mannWhitneyDist(n1, n2) {
    // Häufigkeiten von U = 0 … n1·n2 über alle C(n1 + n2, n1) gleich wahrscheinlichen Rangaufteilungen unter H₀.
    // Dynamische Programmierung über den größten Wert: gehört er zu Gruppe 1, ist er größer als alle n2 Werte
    // der Gruppe 2 (U + n2) → Rest (n1 − 1, n2); gehört er zu Gruppe 2, ändert sich U nicht → Rest (n1, n2 − 1).
    const key = n1 + "," + n2;
    if (!mwuMemo.has(key)) {
      let res = [1];
      if (n1 > 0 && n2 > 0) {
        const a = mannWhitneyDist(n1 - 1, n2), c = mannWhitneyDist(n1, n2 - 1);
        res = new Array(n1 * n2 + 1).fill(0);
        a.forEach((cnt, u) => { res[u + n2] += cnt; });
        c.forEach((cnt, u) => { res[u] += cnt; });
      }
      mwuMemo.set(key, res);
    }
    return mwuMemo.get(key).slice();
  }
  function wilcoxonDist(n) {
    // Häufigkeiten von W₊ = 0 … n(n + 1)/2 über alle 2ⁿ gleich wahrscheinlichen Vorzeichenkombinationen unter H₀
    // (Teilmengensummen der Ränge 1 … n, dynamische Programmierung).
    let c = [1];
    for (let k = 1; k <= n; k++) {
      const nx = new Array(c.length + k).fill(0);
      c.forEach((cnt, s) => { nx[s] += cnt; nx[s + k] += cnt; });
      c = nx;
    }
    return c;
  }
  function exactTwoSided(counts, stat) { // symmetrische Verteilung: p = min(1, 2 · P(S ≤ min(s, max − s)))
    const max = counts.length - 1, u = Math.floor(Math.min(stat, max - stat) + 1e-9), total = sum(counts);
    let c = 0; for (let k = 0; k <= u; k++) c += counts[k];
    return Math.min(1, 2 * c / total);
  }
  function exactCrit(counts, alpha) { // größter Wert mit zweiseitigem exaktem p ≤ α (−1, falls keiner)
    const total = sum(counts); let c = 0, crit = -1;
    for (let k = 0; k < counts.length; k++) { c += counts[k]; if (2 * c / total <= alpha + 1e-12) crit = k; else break; }
    return crit;
  }
  const mannWhitneyP = (U, n1, n2) => exactTwoSided(mannWhitneyDist(n1, n2), U);
  const mannWhitneyCrit = (n1, n2, alpha = 0.05) => exactCrit(mannWhitneyDist(n1, n2), alpha);
  const wilcoxonP = (T, n) => exactTwoSided(wilcoxonDist(n), T);
  const wilcoxonCrit = (n, alpha = 0.05) => exactCrit(wilcoxonDist(n), alpha);
  function mannWhitney(x, y) { // U-Test; exakter p-Wert nur ohne Bindungen (sonst NaN), z ohne Stetigkeitskorrektur
    const n1 = x.length, n2 = y.length, N = n1 + n2, all = x.concat(y), r = ranks(all);
    const ranks1 = r.slice(0, n1), ranks2 = r.slice(n1), R1 = sum(ranks1), R2 = sum(ranks2);
    const U1 = n1 * n2 + n1 * (n1 + 1) / 2 - R1, U2 = n1 * n2 + n2 * (n2 + 1) / 2 - R2, U = Math.min(U1, U2);
    const mu = n1 * n2 / 2, sigma = Math.sqrt(n1 * n2 * (N + 1) / 12), z = (U - mu) / sigma, ties = new Set(all).size < N;
    return { n1, n2, ranks1, ranks2, R1, R2, U1, U2, U, mu, sigma, z, pNormal: 2 * normCdf(-Math.abs(z)), ties, p: ties ? NaN : mannWhitneyP(U, n1, n2) };
  }
  function wilcoxonSignedRank(x, y) { // Vorzeichen-Rang-Test für d = x − y; Nulldifferenzen werden entfernt
    const diffs = x.map((v, i) => v - y[i]), nz = diffs.filter((d) => d !== 0), n = nz.length, r = ranks(nz.map(Math.abs));
    let j = 0; const signedRanks = diffs.map((d) => (d === 0 ? 0 : Math.sign(d) * r[j++]));
    const Wplus = sum(signedRanks.filter((s) => s > 0)), Wminus = sum(signedRanks.filter((s) => s < 0).map((s) => -s)), T = Math.min(Wplus, Wminus);
    const mu = n * (n + 1) / 4, sigma = Math.sqrt(n * (n + 1) * (2 * n + 1) / 24), z = (T - mu) / sigma, ties = new Set(nz.map(Math.abs)).size < n;
    return { diffs, n, zeros: diffs.length - n, signedRanks, Wplus, Wminus, T, mu, sigma, z, pNormal: 2 * normCdf(-Math.abs(z)), ties, p: ties ? NaN : wilcoxonP(T, n) };
  }

  // ---------- Teststärke, Stichprobenplanung, Fisher-z ----------
  // t-Test für unabhängige Stichproben, n je Gruppe, Normalapproximation: 1 − β ≈ Φ(|d| · √(n/2) − z(1 − α/2))
  const powerTInd = (d, n, alpha = 0.05) => normCdf(Math.abs(d) * Math.sqrt(n / 2) - normInv(1 - alpha / 2));
  function sampleSizeTInd(d, power = 0.8, alpha = 0.05) { // n je Gruppe = ⌈2 · (z(1 − α/2) + z(1 − β))² / d²⌉
    const z = normInv(1 - alpha / 2) + normInv(power);
    return Math.ceil(2 * z * z / (d * d) - 1e-9);
  }
  const fisherZ = (r) => 0.5 * Math.log((1 + r) / (1 - r));
  const fisherZInv = (z) => Math.tanh(z);
  function corrCI(r, n, zc = 1.96) { // Konfidenzintervall für ρ über Fisher-z: z′ ± zc / √(n − 3), Rücktransformation tanh
    const z = fisherZ(r), se = 1 / Math.sqrt(n - 3), zLo = z - zc * se, zHi = z + zc * se;
    return { z, se, zLo, zHi, lo: fisherZInv(zLo), hi: fisherZInv(zHi) };
  }
  function diag2x2(tp, fn, fp, tn) {
    return { sens: tp / (tp + fn), spec: tn / (tn + fp), ppv: tp / (tp + fp), npv: tn / (tn + fn), acc: (tp + tn) / (tp + fn + fp + tn) };
  }

  // ---------- Formatierung ----------
  function fmt(x, d = 2) {
    if (typeof x !== "number" || !isFinite(x)) return String(x);
    return round(x, d).toFixed(d).replace(".", ",").replace(/^-(0,0+)$/, "$1");
  }
  function parseNum(s) {
    if (typeof s === "number") return s;
    const t = String(s).trim().replace(/\s/g, "").replace("%", "").replace(",", ".");
    if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(t)) return NaN;
    return parseFloat(t);
  }

  return {
    mulberry32, makeRng, round, sum, mean, median, modes, ss, variance, sd, cov, pearson, regression, ranks,
    erf, normCdf, normInv, lgamma, ibeta, gammaP, tCdf, tTwoSided, fUpper, chi2Upper, tCrit, fCrit, chi2Crit, choose, binomPmf,
    tTestOne, tTestInd, tTestPaired, anovaOneWay, kruskal, chi2Table, kappa, cronbachAlpha, itemTotal, solve, multipleRegression, diag2x2,
    corTest, levene, mannWhitneyDist, mannWhitneyP, mannWhitneyCrit, mannWhitney, wilcoxonDist, wilcoxonP, wilcoxonCrit, wilcoxonSignedRank,
    powerTInd, sampleSizeTInd, fisherZ, fisherZInv, corrCI,
    fmt, parseNum
  };
});
