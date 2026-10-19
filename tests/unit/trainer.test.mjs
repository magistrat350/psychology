import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "module";
const T = createRequire(import.meta.url)("../../js/trainer.js");

test("mindestens 20 Aufgabentypen für D1, D2 und E1", () => {
  assert.ok(T.generators.length >= 20);
  for (const mod of ["D1", "D2", "E1"]) assert.ok(T.generators.some((g) => g.modules.includes(mod)), mod);
});

for (const g of T.generators) {
  test(`Generator ${g.id}: reproduzierbar, endliche Lösungen, korrekte Bewertung`, () => {
    for (let seed = 1; seed <= 150; seed++) {
      const t = T.make(g.id, seed);
      assert.deepEqual(T.make(g.id, seed), t, "gleicher Seed → gleiche Aufgabe");
      assert.ok(t.intro && t.steps.length >= 1 && t.answers.length >= 1);
      const right = {}, wrong = {};
      for (const a of t.answers) {
        if (a.type === "choice") { assert.ok(a.options.includes(a.value)); right[a.key] = a.value; wrong[a.key] = a.options.find((o) => o !== a.value); continue; }
        assert.ok(Number.isFinite(a.value), `${a.key} endlich (Seed ${seed})`);
        right[a.key] = T.display(a);
        wrong[a.key] = String(a.value + Math.max(1, a.tol * 10 + Math.abs(a.value) * 0.5));
      }
      assert.ok(T.check(t, right).every(Boolean), `angezeigte Lösung wird akzeptiert (Seed ${seed})`);
      assert.ok(T.check(t, wrong).every((x) => !x), `falsche Werte werden abgelehnt (Seed ${seed})`);
    }
  });
}

// ---------- gezielte Tests der Generatoren mit bekannten bzw. unabhängig berechneten Werten ----------
const S = createRequire(import.meta.url)("../../js/stats.js");
const SEEDS = Array.from({ length: 150 }, (_, i) => i + 1);
const nums = (s) => String(s).split("; ").map(Number);
const ans = (t, key) => t.answers.find((a) => a.key === key);
const accepts = (t, key, raw) => T.check({ answers: [ans(t, key)] }, { [key]: String(raw) })[0];

test("mann_whitney: keine Bindungen, U aus Paarvergleichen, Entscheidung = exakter Test = Tabellenwert", () => {
  for (const seed of SEEDS) {
    const t = T.make("mann_whitney", seed), x = nums(t.table.rows[0][2]), y = nums(t.table.rows[1][2]), n1 = x.length, n2 = y.length;
    assert.ok(n1 >= 5 && n1 <= 8 && n2 >= 5 && n2 <= 8, "n₁, n₂ zwischen 5 und 8");
    assert.equal(new Set(x.concat(y)).size, n1 + n2, `keine Bindungen (Seed ${seed})`);
    const all = x.concat(y).sort((a, b) => a - b), R1 = x.reduce((s, v) => s + all.indexOf(v) + 1, 0);
    let pairs = 0; for (const a of x) for (const b of y) if (a < b) pairs++; // U₁ = #(x < y)
    const U = Math.min(pairs, n1 * n2 - pairs), mu = n1 * n2 / 2, sigma = Math.sqrt(n1 * n2 * (n1 + n2 + 1) / 12);
    assert.equal(ans(t, "r1").value, R1); assert.equal(ans(t, "u").value, U);
    assert.equal(n1 * n2 + n1 * (n1 + 1) / 2 - R1, pairs, "U₁-Formel = Anzahl Paare mit x < y");
    assert.ok(Math.abs(ans(t, "z").value - (U - mu) / sigma) < 1e-9, "z ohne Stetigkeitskorrektur");
    const crit = Number(t.intro.match(/U_krit\(\d, \d\) = (\d+)/)[1]), sig = S.mannWhitneyP(U, n1, n2) <= 0.05;
    assert.equal(crit, S.mannWhitneyCrit(n1, n2));
    assert.equal(sig, U <= crit, "exakter p-Wert und Tabellenwert entscheiden gleich");
    assert.equal(ans(t, "dec").value, sig ? T.SIG : T.NSIG);
    assert.ok(t.steps.some((s) => /exakte/.test(s) && /Normalapproximation/.test(s)), "Hinweis auf exakte Tabelle");
  }
});

test("wilcoxon: keine Nulldifferenzen, verschiedene |d|, W₊/W₋/T aus Rangvergleichen, exakte Entscheidung", () => {
  for (const seed of SEEDS) {
    const t = T.make("wilcoxon", seed), d = t.table.rows.map((r) => r[1] - r[2]), n = d.length;
    assert.ok(n >= 6 && n <= 10); assert.deepEqual(d, t.table.rows.map((r) => r[3]));
    assert.ok(d.every((v) => v !== 0), "keine Nulldifferenzen");
    assert.equal(new Set(d.map(Math.abs)).size, n, `keine gleichen |d| (Seed ${seed})`);
    const rank = (v) => d.filter((w) => Math.abs(w) <= Math.abs(v)).length;
    const Wp = d.filter((v) => v > 0).reduce((s, v) => s + rank(v), 0), Wm = d.filter((v) => v < 0).reduce((s, v) => s + rank(v), 0);
    assert.equal(ans(t, "wp").value, Wp); assert.equal(ans(t, "wm").value, Wm); assert.equal(ans(t, "t").value, Math.min(Wp, Wm));
    assert.equal(Wp + Wm, n * (n + 1) / 2);
    const crit = Number(t.intro.match(/T_krit\(n = \d+\) = (\d+)/)[1]), sig = Math.min(Wp, Wm) <= crit;
    assert.equal(sig, S.wilcoxonP(Math.min(Wp, Wm), n) <= 0.05);
    assert.equal(ans(t, "dec").value, sig ? T.SIG : T.NSIG);
    assert.ok(t.steps.some((s) => s.startsWith("z-Näherung")), "z-Näherung im Lösungsweg");
  }
});

test("teststaerke: 1 − β ≈ Φ(d · √(n/2) − 1,96) in %, Toleranz 1,5 Prozentpunkte", () => {
  for (const seed of SEEDS) {
    const t = T.make("teststaerke", seed), n = Number(t.intro.match(/je n = (\d+)/)[1]), d = S.parseNum(t.intro.match(/d = ([\d,]+)/)[1]);
    const pw = 100 * S.normCdf(d * Math.sqrt(n / 2) - S.normInv(0.975)), a = ans(t, "pw");
    assert.ok(Math.abs(a.value - pw) < 1e-9 && pw >= 15 && pw <= 97);
    assert.ok(accepts(t, "pw", (pw + 1.4).toFixed(1)) && !accepts(t, "pw", (pw + 2).toFixed(1)));
    assert.ok(t.steps.some((s) => s.includes("G*Power")));
  }
  // bekannter Wert: d = 0,5, n = 64 → ca. 80 % (Normalapproximation 80,7 %)
  const t = SEEDS.map((s) => T.make("teststaerke", s)).find((x) => /je n = 64 /.test(x.intro) && /d = 0,5\./.test(x.intro));
  assert.ok(t, "Aufgabe mit d = 0,5 und n = 64 kommt vor");
  assert.ok(Math.abs(ans(t, "pw").value - 80.74) < 0.01 && accepts(t, "pw", "80") && accepts(t, "pw", "80,7"));
});

test("stichprobenplanung: n je Gruppe und N (Normalapproximation; G*Power-Werte werden toleriert)", () => {
  const exp = { "0,2": { ".80": 393, ".90": 526 }, "0,3": { ".80": 175, ".90": 234 }, "0,5": { ".80": 63, ".90": 85 }, "0,8": { ".80": 25, ".90": 33 } };
  const seen = new Set();
  for (const seed of SEEDS) {
    const t = T.make("stichprobenplanung", seed), d = t.intro.match(/d = ([\d,]+)/)[1], pw = t.intro.match(/Teststärke von (\.\d+)/)[1], n = exp[d][pw];
    seen.add(d + pw);
    assert.equal(ans(t, "n").value, n); assert.equal(ans(t, "N").value, 2 * n);
    assert.equal(T.display(ans(t, "n")), String(n), "ganzzahlige Anzeige");
    assert.ok(accepts(t, "n", n + 1) && accepts(t, "N", 2 * n + 2), "G*Power-Werte (t-Korrektur) akzeptiert");
    assert.ok(!accepts(t, "n", n + 3) && !accepts(t, "N", 2 * n + 4));
  }
  assert.equal(seen.size, 8, "alle Kombinationen aus d und Teststärke kommen vor");
  const t = SEEDS.map((s) => T.make("stichprobenplanung", s)).find((x) => /d = 0,5\./.test(x.intro) && /von \.80/.test(x.intro));
  assert.equal(ans(t, "n").value, 63); assert.ok(accepts(t, "n", 64));
});

test("ki_korrelation: Fisher-z, SE = 1/√(n − 3), Rücktransformation mit tanh", () => {
  for (const seed of SEEDS) {
    const t = T.make("ki_korrelation", seed), n = Number(t.intro.match(/n = (\d+)/)[1]), r = S.parseNum(t.intro.match(/r = (-?[\d,]+)/)[1]);
    const z = Math.atanh(r), se = 1 / Math.sqrt(n - 3);
    assert.ok(Math.abs(ans(t, "z").value - z) < 1e-9);
    assert.ok(Math.abs(ans(t, "lo").value - Math.tanh(z - 1.96 * se)) < 1e-9 && Math.abs(ans(t, "hi").value - Math.tanh(z + 1.96 * se)) < 1e-9);
    assert.ok(ans(t, "lo").value < r && r < ans(t, "hi").value);
    assert.ok(accepts(t, "lo", ans(t, "lo").value + 0.009) && !accepts(t, "lo", ans(t, "lo").value + 0.03));
  }
});

test("ausgabe_lesen: alle vier Ausgabetypen, gültige Tabellen, Antworten passen zur Ausgabe", () => {
  const kinds = new Set(), P = /^(< \.001|\.\d{3}|1\.000)$/;
  const cell = (o, row, col) => o.rows[row][o.head.indexOf(col)];
  for (const seed of SEEDS) {
    const t = T.make("ausgabe_lesen", seed);
    assert.ok(Array.isArray(t.output) && t.output.length >= 1);
    for (const o of t.output) {
      assert.ok(typeof o.title === "string" && o.title && o.head.length >= 2 && o.rows.length >= 1, "Tabelle mit Titel, Kopf und Zeilen");
      for (const r of o.rows) assert.equal(r.length, o.head.length, `gleich viele Spalten in Kopf und Zeile (${o.title}, Seed ${seed})`);
      for (const c of o.head.concat(...o.rows)) assert.equal(typeof c, "string", "Zellen sind formatierte Strings");
      if (o.note != null) assert.equal(typeof o.note, "string");
    }
    const titles = t.output.map((o) => o.title).join(" | "), num = (s) => parseFloat(s);
    if (titles.includes("t-Test für unabhängige Stichproben")) {
      kinds.add("t");
      const [desc, lev, tt] = t.output;
      assert.ok(P.test(cell(tt, 0, "p")) && P.test(cell(lev, 0, "p")));
      assert.ok(accepts(t, "d", cell(tt, 0, "Cohens d")), "Cohens d aus der Ausgabe");
      const hi = num(cell(desc, 0, "Mittelwert")) > num(cell(desc, 1, "Mittelwert")) ? desc.rows[0][0] : desc.rows[1][0];
      assert.equal(ans(t, "hi").value, hi);
      assert.equal(ans(t, "dec").value === T.SIG, num(cell(tt, 0, "p").replace("< ", "")) < 0.05);
      assert.equal(ans(t, "lev").value.startsWith("ja"), num(cell(lev, 0, "p").replace("< ", "")) < 0.05);
    } else if (titles.includes("ANOVA")) {
      kinds.add("anova");
      const a = t.output.find((o) => o.title.includes("ANOVA"));
      assert.deepEqual(a.head, ["Quelle", "Quadratsumme", "df", "Mittlere Quadrate", "F", "p", "η²"]);
      assert.ok(P.test(a.rows[0][5]) && accepts(t, "eta", a.rows[0][6]) && accepts(t, "df2", cell(a, 1, "df")));
      const eta = num(a.rows[0][6]), cls = eta >= 0.14 ? "groß" : eta >= 0.06 ? "mittler" : "klein";
      assert.ok(ans(t, "eff").value.startsWith(cls), `Einordnung η² = ${eta}`);
      assert.equal(ans(t, "dec").value === T.SIG, num(a.rows[0][5].replace("< ", "")) < 0.05);
    } else if (titles.includes("Korrelationsmatrix")) {
      kinds.add("korrelation");
      const m = t.output[0], v = m.head.slice(2), r = { "0,1": num(m.rows[2][2]), "0,2": num(m.rows[4][2]), "1,2": num(m.rows[4][3]) };
      const best = Object.entries(r).sort((p, q) => Math.abs(q[1]) - Math.abs(p[1]))[0][0].split(",").map(Number);
      assert.equal(ans(t, "max").value, `${v[best[0]]} und ${v[best[1]]}`);
      assert.ok(P.test(m.rows[5][2]) && ans(t, "sig").value === (num(m.rows[5][2].replace("< ", "")) < 0.05 ? T.SIG : T.NSIG));
      assert.ok(Object.values(r).some((x) => accepts(t, "r", String(x))), "r aus der Matrix ablesbar");
    } else if (titles.includes("Modellkoeffizienten")) {
      kinds.add("regression");
      const [fit, co] = t.output;
      assert.ok(accepts(t, "r2", cell(fit, 0, "R²")));
      const sig = co.rows.slice(1).filter((row) => num(row[4].replace("< ", "")) < 0.05);
      assert.equal(sig.length, 1, "genau ein Prädiktor signifikant"); assert.equal(ans(t, "sig").value, sig[0][0]);
      const [, v1, v2] = ans(t, "yh").label.match(/= (\d+) und .* = (\d+)$/).map(Number);
      const yh = num(co.rows[0][1]) + num(co.rows[1][1]) * v1 + num(co.rows[2][1]) * v2;
      assert.ok(accepts(t, "yh", yh.toFixed(2)), "ŷ aus den ausgegebenen Schätzern");
    } else assert.fail("unbekannter Ausgabetyp: " + titles);
  }
  assert.deepEqual([...kinds].sort(), ["anova", "korrelation", "regression", "t"], "alle vier Typen kommen über die Seeds vor");
});
