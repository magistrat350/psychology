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
