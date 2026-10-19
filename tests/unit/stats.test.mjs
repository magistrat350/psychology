import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "module";
const S = createRequire(import.meta.url)("../../js/stats.js");
const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: ${a} ≠ ${b} (±${tol})`);

test("Deskriptive Statistik", () => {
  assert.equal(S.mean([2, 4, 6, 8]), 5);
  assert.equal(S.median([3, 9, 4, 7, 12]), 7);
  assert.equal(S.median([1, 2, 3, 4]), 2.5);
  assert.deepEqual(S.modes([1, 2, 2, 3]), [2]);
  assert.equal(S.variance([2, 4, 6]), 4);
  near(S.pearson([1, 2, 3, 4, 5], [2, 4, 5, 4, 5]), 0.7746, 1e-4, "r");
  const reg = S.regression([1, 2, 3, 4, 5], [3, 5, 7, 9, 12]);
  near(reg.b, 2.2, 1e-9, "b"); near(reg.a, 0.6, 1e-9, "a");
});

test("Verteilungen stimmen mit Tabellenwerten überein", () => {
  near(S.normCdf(1.96), 0.975, 1e-4, "Φ(1,96)");
  near(S.normInv(0.975), 1.95996, 1e-4, "z(0,975)");
  near(S.tCrit(0.05, 10), 2.228, 1e-3, "t(10)");
  near(S.tCrit(0.05, 29), 2.045, 1e-3, "t(29)");
  near(S.tTwoSided(2.228, 10), 0.05, 5e-4, "p(t)");
  near(S.fCrit(0.05, 2, 27), 3.354, 2e-3, "F(2,27)");
  near(S.fCrit(0.05, 2, 9), 4.256, 2e-3, "F(2,9)");
  near(S.chi2Crit(0.05, 1), 3.841, 2e-3, "χ²(1)");
  near(S.chi2Crit(0.05, 3), 7.815, 2e-3, "χ²(3)");
  near(S.binomPmf(3, 10, 0.5), 0.1171875, 1e-9, "Binomial");
});

test("Tests und Kennwerte", () => {
  const one = S.tTestOne([5, 7, 6, 8, 9, 6], 5);
  near(one.t, 3.0509, 1e-3, "Einstichproben-t");
  const ind = S.tTestInd([10, 12, 14], [7, 8, 9]);
  near(ind.t, 3.0984, 1e-3, "t unabhängig"); assert.equal(ind.df, 4);
  const a = S.anovaOneWay([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  near(a.F, 27, 1e-9, "F"); near(a.eta2, 0.9, 1e-9, "η²");
  const c = S.chi2Table([[10, 20], [30, 40]]);
  near(c.chi2, 0.7937, 1e-3, "χ²");
  near(S.kappa([[20, 5], [10, 15]]).kappa, 0.4, 1e-9, "κ");
  near(S.cronbachAlpha([[1, 2, 3, 4, 5], [2, 2, 3, 5, 5], [1, 3, 3, 4, 4]]).alpha, 0.95376, 1e-4, "α");
  const mr = S.multipleRegression([3, 5, 7, 9, 12], [[1, 2, 3, 4, 5]]);
  near(mr.b[1], 2.2, 1e-9, "multiple Regression b");
  const k = S.kruskal([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
  near(k.H, 7.2, 1e-9, "Kruskal-Wallis H");
});

test("Zahlenformat und Eingabe", () => {
  assert.equal(S.fmt(3.14159, 2), "3,14");
  assert.equal(S.fmt(-0.0001, 2), "0,00");
  assert.equal(S.parseNum("3,5"), 3.5);
  assert.equal(S.parseNum(" 12 % "), 12);
  assert.ok(Number.isNaN(S.parseNum("abc")));
  assert.ok(Number.isNaN(S.parseNum("1,2,3")));
});

// ---------- Rangtests: exakte Verteilungen gegen vollständiges Abzählen ----------
function bruteU(n1, n2) { // alle Aufteilungen der Ränge 1 … N auf Gruppe 1 (Bitmaske), U = #Paare (Gruppe 1 > Gruppe 2)
  const N = n1 + n2, counts = new Array(n1 * n2 + 1).fill(0);
  for (let m = 0; m < 1 << N; m++) {
    let bits = 0; for (let i = 0; i < N; i++) if (m & (1 << i)) bits++;
    if (bits !== n1) continue;
    let u = 0, below = 0; // Ränge aufsteigend durchgehen: jedes Element von Gruppe 1 schlägt alle bisherigen von Gruppe 2
    for (let i = 0; i < N; i++) { if (m & (1 << i)) u += below; else below++; }
    counts[u]++;
  }
  return counts;
}
function bruteW(n) { // alle 2ⁿ Vorzeichenkombinationen der Ränge 1 … n, W₊ = Summe der positiven Ränge
  const counts = new Array(n * (n + 1) / 2 + 1).fill(0);
  for (let m = 0; m < 1 << n; m++) { let w = 0; for (let i = 0; i < n; i++) if (m & (1 << i)) w += i + 1; counts[w]++; }
  return counts;
}

test("Mann-Whitney-U: exakte Verteilung stimmt mit vollständigem Abzählen überein", () => {
  for (const [n1, n2] of [[1, 1], [2, 3], [5, 5], [5, 8], [6, 7], [7, 8], [8, 8]]) {
    const dp = S.mannWhitneyDist(n1, n2);
    assert.deepEqual(dp, bruteU(n1, n2), `n₁ = ${n1}, n₂ = ${n2}`);
    assert.equal(S.sum(dp), S.choose(n1 + n2, n1));
  }
  // n₁ = n₂ = 5: P(U ≤ 2) = (1 + 1 + 2) / 252 → zweiseitig 8/252 ≈ .032 (Tabellenwert)
  near(S.mannWhitneyP(2, 5, 5), 8 / 252, 1e-12, "p(U = 2; 5, 5)");
  near(S.mannWhitneyP(2, 5, 5), 0.032, 5e-4, "p ≈ .032");
  near(S.mannWhitneyP(23, 5, 5), 8 / 252, 1e-12, "Symmetrie: U₂ = 25 − 2");
  assert.equal(S.mannWhitneyP(12.5, 5, 5), 1);
  // kritische Werte der üblichen Tabelle (zweiseitig, α = .05)
  const tab = { "5,5": 2, "5,6": 3, "5,7": 5, "5,8": 6, "6,6": 5, "6,7": 6, "6,8": 8, "7,7": 8, "7,8": 10, "8,8": 13 };
  for (const [k, v] of Object.entries(tab)) { const [a, b] = k.split(",").map(Number); assert.equal(S.mannWhitneyCrit(a, b), v, `U_krit(${k})`); assert.equal(S.mannWhitneyCrit(b, a), v); }
});

test("Mann-Whitney-U: Rangsummen, U und z", () => {
  const r = S.mannWhitney([1, 4, 5, 9, 10], [2, 3, 6, 7, 8]);
  assert.equal(r.R1, 29); assert.equal(r.R2, 26); assert.equal(r.U1, 11); assert.equal(r.U2, 14); assert.equal(r.U, 11);
  near(r.z, (11 - 12.5) / Math.sqrt(25 * 11 / 12), 1e-12, "z ohne Stetigkeitskorrektur");
  assert.equal(r.ties, false); near(r.p, S.mannWhitneyP(11, 5, 5), 1e-12, "exakter p-Wert");
  const sep = S.mannWhitney([1, 2, 3, 4, 5], [6, 7, 8, 9, 10]); // vollständig getrennt: U = 0 → p = 2/252
  assert.equal(sep.U, 0); near(sep.p, 2 / 252, 1e-12, "p bei U = 0");
  assert.ok(Number.isNaN(S.mannWhitney([1, 2, 2], [3, 4, 5]).p), "bei Bindungen kein exakter p-Wert");
});

test("Wilcoxon-Vorzeichen-Rang-Test: exakte Verteilung, p-Werte und kritische Werte", () => {
  for (let n = 1; n <= 12; n++) { assert.deepEqual(S.wilcoxonDist(n), bruteW(n), `n = ${n}`); assert.equal(S.sum(S.wilcoxonDist(n)), 2 ** n); }
  assert.equal(S.wilcoxonP(0, 6), 2 / 64); // = .03125
  assert.equal(S.wilcoxonP(21, 6), 2 / 64);
  near(S.wilcoxonP(2, 6), 6 / 64, 1e-12, "P(W ≤ 2) = 3/64");
  const tab = { 6: 0, 7: 2, 8: 3, 9: 5, 10: 8 };
  for (const [n, v] of Object.entries(tab)) assert.equal(S.wilcoxonCrit(Number(n)), v, `T_krit(${n})`);
  assert.equal(S.wilcoxonCrit(5), -1, "n = 5: zweiseitig nie signifikant");
  const w = S.wilcoxonSignedRank([11, 8, 13, 14, 15, 16], [10, 10, 10, 10, 10, 10]); // d = 1, −2, 3, 4, 5, 6
  assert.deepEqual(w.signedRanks, [1, -2, 3, 4, 5, 6]);
  assert.equal(w.Wplus, 19); assert.equal(w.Wminus, 2); assert.equal(w.T, 2);
  near(w.p, 6 / 64, 1e-12, "exakter p-Wert");
  near(w.z, (2 - 10.5) / Math.sqrt(6 * 7 * 13 / 24), 1e-12, "z-Näherung");
  const z0 = S.wilcoxonSignedRank([5, 7, 9], [5, 6, 7]);
  assert.equal(z0.n, 2); assert.equal(z0.zeros, 1);
});

test("Teststärke, Stichprobenplanung und Fisher-z", () => {
  // d = 0,5, n = 64 je Gruppe: Φ(0,5 · √32 − 1,96) = Φ(0,868) ≈ 0,807 (G*Power, nonzentrales t: 0,80)
  near(S.powerTInd(0.5, 64), 0.8074, 5e-4, "Teststärke d = 0,5, n = 64");
  near(S.powerTInd(-0.5, 64), 0.8074, 5e-4, "Vorzeichen von d egal");
  near(S.powerTInd(0.8, 25), S.powerTInd(0.5, 64), 1e-12, "gleiches δ = 2,828");
  // n = ⌈2 (1,96 + z(1 − β))² / d²⌉ – Normalapproximation (G*Power jeweils ca. +1)
  const exp = { "0.2": [393, 526], "0.3": [175, 234], "0.5": [63, 85], "0.8": [25, 33] };
  for (const [d, [n80, n90]] of Object.entries(exp)) {
    assert.equal(S.sampleSizeTInd(Number(d), 0.8), n80, `d = ${d}, .80`);
    assert.equal(S.sampleSizeTInd(Number(d), 0.9), n90, `d = ${d}, .90`);
  }
  assert.ok(S.powerTInd(0.5, 63) >= 0.8 && S.powerTInd(0.5, 62) < 0.8, "n = 63 ist das kleinste n mit Teststärke ≥ .80");
  // r = .50, n = 30: z′ = 0,5493, SE = 1/√27 = 0,1925 → KI [0,170; 0,729]
  const ci = S.corrCI(0.5, 30);
  near(ci.z, 0.5493, 1e-4, "z′"); near(ci.se, 0.19245, 1e-5, "SE");
  near(ci.zLo, 0.17210, 1e-4, "z′ unten"); near(ci.zHi, 0.92651, 1e-4, "z′ oben");
  near(ci.lo, 0.1704, 1e-4, "Untergrenze"); near(ci.hi, 0.7290, 1e-4, "Obergrenze");
  near(S.fisherZInv(S.fisherZ(-0.37)), -0.37, 1e-12, "Rücktransformation");
});

test("Levene-Test, Korrelationstest und Inferenz der multiplen Regression", () => {
  // |x − x̄|: [2, 1, 0, 1, 2] und [4, 2, 0, 2, 4] → F = 3,6 / (14 / 8) = 2,0571
  const lev = S.levene([[1, 2, 3, 4, 5], [2, 4, 6, 8, 10]]);
  near(lev.F, 3.6 / 1.75, 1e-9, "Levene F"); assert.equal(lev.df1, 1); assert.equal(lev.df2, 8);
  const ct = S.corTest([1, 2, 3, 4, 5], [2, 4, 5, 4, 5]);
  near(ct.t, 2.1213, 1e-4, "t für r"); assert.equal(ct.df, 3); near(ct.p, S.tTwoSided(2.1213203, 3), 1e-6, "p für r");
  // einfache Regression: SQ_Res = 0,4, MQ_Res = 0,4/3, SE(b) = √(MQ_Res / QSx) = √(0,1333/10)
  const mr = S.multipleRegression([3, 5, 7, 9, 12], [[1, 2, 3, 4, 5]]);
  near(mr.ssRes, 0.4, 1e-9, "SQ Residuen"); near(mr.se[1], Math.sqrt(0.4 / 3 / 10), 1e-9, "SE(b)");
  near(mr.t[1], 19.0526, 1e-3, "t(b)"); near(mr.F, mr.t[1] ** 2, 1e-6, "F = t² bei einem Prädiktor");
  assert.equal(mr.df1, 1); assert.equal(mr.df2, 3); near(mr.pF, mr.p[1], 1e-9, "p(F) = p(t)");
  // zwei Prädiktoren: SE(b₁) = √(MQ_Res / (QS_x1 · (1 − r₁₂²))), F = (R²/k) / ((1 − R²)/(n − k − 1))
  const x1 = [2, 4, 3, 6, 5, 8, 7, 9], x2 = [1, 3, 2, 2, 5, 4, 6, 5], y = [5, 9, 6, 12, 11, 15, 14, 18];
  const m2 = S.multipleRegression(y, [x1, x2]), mse = m2.ssRes / (8 - 3), r12 = S.pearson(x1, x2);
  near(m2.se[1], Math.sqrt(mse / (S.ss(x1) * (1 - r12 * r12))), 1e-9, "SE(b₁)");
  near(m2.se[2], Math.sqrt(mse / (S.ss(x2) * (1 - r12 * r12))), 1e-9, "SE(b₂)");
  near(m2.F, (m2.r2 / 2) / ((1 - m2.r2) / 5), 1e-9, "F aus R²"); near(m2.R, Math.sqrt(m2.r2), 1e-12, "R");
});
