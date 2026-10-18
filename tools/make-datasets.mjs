// Erzeugt die Übungsdatensätze (CSV) und data/datasets.js mit Referenzergebnissen.
// Reproduzierbar über feste Seeds: `npm run datasets`
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { ROOT } from "./lib/load-data.mjs";

const require = createRequire(import.meta.url);
const S = require("../js/stats.js");
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const r1 = (x) => S.round(x, 1);

function toCsv(cols, rows) {
  return [cols.join(",")].concat(rows.map((r) => cols.map((c) => r[c]).join(","))).join("\n") + "\n";
}
const col = (rows, c) => rows.map((r) => r[c]);
const res = (label, value, d = 2) => ({ label, value, d });
const pRes = (value) => ({ label: "p", value, d: 3, p: true });

const datasets = [];

// ---------------------------------------------------------------- 1 Lernstudie
{
  const rng = S.makeRng(20260101);
  const rows = Array.from({ length: 80 }, (_, i) => {
    const methode = i < 40 ? "abruf" : "lesen";
    const lernzeit = r1(clamp(rng.normal(8, 3), 0.5, 20));
    const schlaf = r1(clamp(rng.normal(7, 0.9), 4, 10));
    const angst = r1(clamp(rng.normal(2.8, 0.8), 1, 5));
    const punkte = Math.round(clamp(30 + 2.6 * lernzeit + (methode === "abruf" ? 7 : 0) - 4.5 * angst + 2 * schlaf + rng.normal(0, 7), 0, 100));
    return { id: i + 1, methode, lernzeit, schlaf, angst, punkte };
  });
  const p = col(rows, "punkte"), lz = col(rows, "lernzeit"), an = col(rows, "angst"), sl = col(rows, "schlaf");
  const r = S.pearson(lz, p), n = rows.length, tr = r * Math.sqrt(n - 2) / Math.sqrt(1 - r * r);
  const tt = S.tTestInd(p.slice(0, 40), p.slice(40));
  const reg = S.regression(lz, p);
  const mr = S.multipleRegression(p, [lz, an, sl]);
  datasets.push({
    id: "lernstudie", title: "Lernstudie: Lernzeit, Methode und Prüfungsleistung", file: "data/datasets/lernstudie.csv", modules: ["D1", "B3", "H2"],
    description: "Fiktive Studie mit 80 Studierenden: Lernmethode (Abrufübung vs. Wiederlesen), Lernzeit pro Woche, Schlafdauer, Prüfungsangst und Punkte in der Klausur.",
    variables: [
      ["id", "Personennummer", "nominal"], ["methode", "Lernmethode: abruf / lesen", "nominal"], ["lernzeit", "Lernstunden pro Woche", "Verhältnis"],
      ["schlaf", "durchschnittliche Schlafdauer in Stunden", "Verhältnis"], ["angst", "Prüfungsangst, Skalenmittel 1–5", "Intervall"], ["punkte", "Klausurpunkte 0–100", "Intervall"]
    ],
    tasks: [
      { q: "Berechne Mittelwert und Standardabweichung der Klausurpunkte.", hint: "jamovi: Exploration → Deskriptive Statistik. R: mean(d$punkte); sd(d$punkte)", results: [res("M", S.mean(p)), res("SD", S.sd(p))] },
      { q: "Wie hängen Lernzeit und Klausurpunkte zusammen? (Pearson-Korrelation mit Signifikanztest)", hint: "jamovi: Regression → Korrelationsmatrix. R: cor.test(d$lernzeit, d$punkte)", results: [res("r", r, 3), res("t", tr), res("df", n - 2, 0), pRes(S.tTwoSided(tr, n - 2))] },
      { q: "Unterscheiden sich die Lernmethoden in den Klausurpunkten? (t-Test für unabhängige Stichproben, gleiche Varianzen angenommen; Differenz abruf − lesen)", hint: "jamovi: T-Tests → t-Test für unabhängige Stichproben, Effektgröße anhaken. R: t.test(punkte ~ methode, data = d, var.equal = TRUE)", results: [res("M abruf", tt.m1), res("M lesen", tt.m2), res("t", tt.t), res("df", tt.df, 0), pRes(tt.p), res("Cohens d", tt.d)] },
      { q: "Sage die Klausurpunkte aus der Lernzeit vorher (einfache lineare Regression).", hint: "jamovi: Regression → Lineare Regression. R: summary(lm(punkte ~ lernzeit, data = d))", results: [res("Achsenabschnitt a", reg.a), res("Steigung b", reg.b, 3), res("R²", reg.r * reg.r, 3)] },
      { q: "Multiple Regression: punkte ~ lernzeit + angst + schlaf. Gib die unstandardisierten Koeffizienten und R² an.", hint: "R: summary(lm(punkte ~ lernzeit + angst + schlaf, data = d))", results: [res("Achsenabschnitt", mr.b[0]), res("b lernzeit", mr.b[1], 3), res("b angst", mr.b[2], 3), res("b schlaf", mr.b[3], 3), res("R²", mr.r2, 3)] }
    ],
    rows
  });
}

// ---------------------------------------------------------------- 2 Achtsamkeit
{
  const rng = S.makeRng(20260202);
  const rows = Array.from({ length: 40 }, (_, i) => {
    const gruppe = i < 20 ? "training" : "warteliste";
    const prae = Math.round(clamp(rng.normal(27, 5), 10, 40));
    const post = Math.round(clamp(prae - (gruppe === "training" ? 5 : 1) + rng.normal(0, 4), 10, 40));
    return { id: i + 1, gruppe, stress_prae: prae, stress_post: post };
  });
  const tr = rows.slice(0, 20), wl = rows.slice(20);
  const dep = S.tTestPaired(col(tr, "stress_prae"), col(tr, "stress_post"));
  const diff = (g) => g.map((r) => r.stress_prae - r.stress_post);
  const ind = S.tTestInd(diff(tr), diff(wl));
  datasets.push({
    id: "achtsamkeit", title: "Achtsamkeitstraining: Prä-Post mit Wartekontrollgruppe", file: "data/datasets/achtsamkeit.csv", modules: ["D1", "F1"],
    description: "Fiktive Evaluationsstudie: 20 Personen nehmen an einem achtwöchigen Achtsamkeitstraining teil, 20 sind auf der Warteliste. Stress wurde vor und nach dem Zeitraum erhoben (Skala 10–40).",
    variables: [["id", "Personennummer", "nominal"], ["gruppe", "training / warteliste", "nominal"], ["stress_prae", "Stress vor dem Training", "Intervall"], ["stress_post", "Stress nach dem Training", "Intervall"]],
    tasks: [
      { q: "Hat sich der Stress in der Trainingsgruppe verändert? (t-Test für abhängige Stichproben, Differenz prä − post)", hint: "jamovi: T-Tests → t-Test für verbundene Stichproben (nur Trainingsgruppe filtern). R: with(subset(d, gruppe == 'training'), t.test(stress_prae, stress_post, paired = TRUE))", results: [res("M prä", S.mean(col(tr, "stress_prae"))), res("M post", S.mean(col(tr, "stress_post"))), res("t", dep.t), res("df", dep.df, 0), pRes(dep.p), res("d_z", dep.dz)] },
      { q: "Ist die Veränderung in der Trainingsgruppe größer als auf der Warteliste? (Differenzwerte prä − post bilden, t-Test für unabhängige Stichproben)", hint: "jamovi: Daten → neue berechnete Variable diff = stress_prae − stress_post. R: d$diff <- d$stress_prae - d$stress_post; t.test(diff ~ gruppe, data = d, var.equal = TRUE)", results: [res("M Differenz training", ind.m1), res("M Differenz warteliste", ind.m2), res("t", ind.t), res("df", ind.df, 0), pRes(ind.p), res("Cohens d", ind.d)] }
    ],
    rows
  });
}

// ---------------------------------------------------------------- 3 Therapie
{
  const rng = S.makeRng(20260303);
  const effects = { kvt: 11, ipt: 8, warteliste: 1 };
  const rows = Array.from({ length: 45 }, (_, i) => {
    const bedingung = ["kvt", "ipt", "warteliste"][Math.floor(i / 15)];
    const prae = Math.round(clamp(rng.normal(26, 5), 14, 45));
    const post = Math.round(clamp(prae - effects[bedingung] + rng.normal(0, 5), 0, 63));
    return { id: i + 1, bedingung, bdi_prae: prae, bdi_post: post };
  });
  const groups = ["kvt", "ipt", "warteliste"].map((b) => col(rows.filter((r) => r.bedingung === b), "bdi_post"));
  const a = S.anovaOneWay(groups), kw = S.kruskal(groups);
  datasets.push({
    id: "therapie", title: "Psychotherapiestudie: drei Bedingungen", file: "data/datasets/therapie.csv", modules: ["D1", "F1"],
    description: "Fiktive randomisierte Studie mit 45 Personen mit depressiver Symptomatik: kognitive Verhaltenstherapie (kvt), interpersonelle Therapie (ipt) oder Warteliste. Depressivität vor und nach 16 Wochen (BDI-II-ähnlicher Summenwert 0–63).",
    variables: [["id", "Personennummer", "nominal"], ["bedingung", "kvt / ipt / warteliste", "nominal"], ["bdi_prae", "Depressivität vorher", "Intervall"], ["bdi_post", "Depressivität nachher", "Intervall"]],
    tasks: [
      { q: "Berechne die Mittelwerte von bdi_post je Bedingung.", hint: "jamovi: Deskriptive Statistik, aufgeteilt nach bedingung. R: aggregate(bdi_post ~ bedingung, data = d, mean)", results: [res("M kvt", a.means[0]), res("M ipt", a.means[1]), res("M warteliste", a.means[2])] },
      { q: "Unterscheiden sich die Bedingungen in bdi_post? (einfaktorielle Varianzanalyse)", hint: "jamovi: ANOVA → einfaktorielle ANOVA (Fisher), Post-hoc Tukey. R: summary(aov(bdi_post ~ bedingung, data = d)); TukeyHSD(aov(...))", results: [res("F", a.F), res("df1", a.df1, 0), res("df2", a.df2, 0), pRes(a.p), res("η²", a.eta2, 3)] },
      { q: "Prüfe dasselbe nonparametrisch (Kruskal-Wallis-Test).", hint: "jamovi: ANOVA → Nonparametrisch → Kruskal-Wallis. R: kruskal.test(bdi_post ~ bedingung, data = d)", results: [res("H (χ²)", kw.H), res("df", kw.df, 0), pRes(kw.p)] }
    ],
    rows
  });
}

// ---------------------------------------------------------------- 4 Fragebogen
{
  const rng = S.makeRng(20260404);
  const lambda = [0.9, 0.8, 0.85, 0.7, 0.75, 0.6], reversed = [false, false, true, false, true, false];
  const rows = Array.from({ length: 150 }, (_, i) => {
    const th = rng.normal();
    const r = { id: i + 1 };
    lambda.forEach((l, j) => { const v = 3 + (reversed[j] ? -1 : 1) * l * th * 1.1 + rng.normal(0, 0.75); r["i" + (j + 1)] = clamp(Math.round(v), 1, 5); });
    r.zufriedenheit = r1(clamp(4 + 0.9 * th + rng.normal(0, 0.9), 1, 7));
    return r;
  });
  const items = lambda.map((_, j) => rows.map((r) => (reversed[j] ? 6 - r["i" + (j + 1)] : r["i" + (j + 1)])));
  const raw = lambda.map((_, j) => col(rows, "i" + (j + 1)));
  const al = S.cronbachAlpha(items), alRaw = S.cronbachAlpha(raw);
  const scale = rows.map((_, p) => S.mean(items.map((it) => it[p])));
  const rv = S.pearson(scale, col(rows, "zufriedenheit"));
  datasets.push({
    id: "fragebogen", title: "Skalenanalyse: Fragebogen zur Selbstwirksamkeit", file: "data/datasets/fragebogen.csv", modules: ["D2", "C4"],
    description: "Fiktive Erhebung mit 150 Personen: sechs Items einer Selbstwirksamkeitsskala (1 = trifft nicht zu … 5 = trifft zu), Items 3 und 5 sind negativ formuliert. Außenkriterium: Lebenszufriedenheit (1–7).",
    variables: [["id", "Personennummer", "nominal"], ["i1 … i6", "Items 1–6 (1–5); i3 und i5 negativ gepolt", "ordinal/intervall"], ["zufriedenheit", "Lebenszufriedenheit 1–7", "Intervall"]],
    tasks: [
      { q: "Pole i3 und i5 um (neu = 6 − alt) und berechne Cronbachs α der sechs Items.", hint: "jamovi: Faktor → Reliabilitätsanalyse, i3 und i5 als „umgekehrt kodiert“ markieren. R: psych::alpha(d[, paste0('i', 1:6)], keys = c(1, 1, -1, 1, -1, 1))", results: [res("Cronbachs α", al.alpha, 3)] },
      { q: "Wie groß wäre α, wenn man die Umpolung vergisst? Was lernst du daraus?", hint: "Reliabilitätsanalyse ohne Umkehrung rechnen.", results: [res("α ohne Umpolung", alRaw.alpha, 3)] },
      { q: "Berechne die part-whole-korrigierten Trennschärfen (nach Umpolung).", hint: "jamovi: Reliabilitätsanalyse → Item-Statistiken → „Item-Rest-Korrelation“. R: psych::alpha(...)$item.stats$r.drop", results: items.map((_, j) => res(`r_it i${j + 1}`, S.itemTotal(items, j), 3)) },
      { q: "Kriteriumsvalidität: Korrelation des Skalenmittelwerts (nach Umpolung) mit der Lebenszufriedenheit.", hint: "Skalenmittel als neue Variable berechnen, dann korrelieren.", results: [res("r", rv, 3)] }
    ],
    rows
  });
}

// ---------------------------------------------------------------- 5 Screening
{
  const rng = S.makeRng(20260505);
  const rows = Array.from({ length: 200 }, (_, i) => {
    const krank = rng() < 0.15;
    const pos = krank ? rng() < 0.85 : rng() < 0.15;
    const flip = (v, e) => (rng() < e ? !v : v);
    return { id: i + 1, screening: pos ? "positiv" : "negativ", diagnose: krank ? "ja" : "nein", rater_a: flip(krank, 0.05) ? "ja" : "nein", rater_b: flip(krank, 0.07) ? "ja" : "nein" };
  });
  const cnt = (f) => rows.filter(f).length;
  const tp = cnt((r) => r.screening === "positiv" && r.diagnose === "ja"), fn = cnt((r) => r.screening === "negativ" && r.diagnose === "ja");
  const fp = cnt((r) => r.screening === "positiv" && r.diagnose === "nein"), tn = cnt((r) => r.screening === "negativ" && r.diagnose === "nein");
  const dg = S.diag2x2(tp, fn, fp, tn), ch = S.chi2Table([[tp, fp], [fn, tn]]);
  const kt = [[cnt((r) => r.rater_a === "ja" && r.rater_b === "ja"), cnt((r) => r.rater_a === "ja" && r.rater_b === "nein")], [cnt((r) => r.rater_a === "nein" && r.rater_b === "ja"), cnt((r) => r.rater_a === "nein" && r.rater_b === "nein")]];
  const k = S.kappa(kt);
  datasets.push({
    id: "screening", title: "Diagnostik: Screening, Referenzdiagnose und Beurteilerübereinstimmung", file: "data/datasets/screening.csv", modules: ["E1", "E2", "D2"],
    description: "Fiktive Validierungsstudie mit 200 Personen: Ergebnis eines Depressionsscreenings, Diagnose laut strukturiertem Interview (Referenz) sowie die Einschätzung zweier unabhängiger Beurteilerinnen.",
    variables: [["id", "Personennummer", "nominal"], ["screening", "positiv / negativ", "nominal"], ["diagnose", "Referenzdiagnose ja / nein", "nominal"], ["rater_a", "Urteil Beurteilerin A ja / nein", "nominal"], ["rater_b", "Urteil Beurteilerin B ja / nein", "nominal"]],
    tasks: [
      { q: "Erstelle die Vierfeldertafel screening × diagnose und berechne Sensitivität, Spezifität, PPV und NPV (in %).", hint: "jamovi: Häufigkeiten → Kontingenztafeln. R: table(d$screening, d$diagnose)", results: [res("richtig positiv", tp, 0), res("falsch positiv", fp, 0), res("Sensitivität %", dg.sens * 100, 1), res("Spezifität %", dg.spec * 100, 1), res("PPV %", dg.ppv * 100, 1), res("NPV %", dg.npv * 100, 1)] },
      { q: "Hängen Screening und Diagnose statistisch zusammen? (χ²-Test ohne Kontinuitätskorrektur)", hint: "jamovi: Kontingenztafeln → χ². R: chisq.test(table(d$screening, d$diagnose), correct = FALSE)", results: [res("χ²", ch.chi2), res("df", ch.df, 0), pRes(ch.p)] },
      { q: "Wie gut stimmen die beiden Beurteilerinnen überein? (Cohens κ)", hint: "jamovi-Modul „agreement“ oder R: psych::cohen.kappa(table(d$rater_a, d$rater_b))", results: [res("p₀", k.po, 3), res("p_e", k.pe, 3), res("Cohens κ", k.kappa, 3)] }
    ],
    rows
  });
}

// ---------------------------------------------------------------- Ausgabe
const outDir = path.join(ROOT, "data/datasets");
fs.mkdirSync(outDir, { recursive: true });
const embedded = datasets.map((d) => {
  const cols = Object.keys(d.rows[0]);
  const csv = toCsv(cols, d.rows);
  fs.writeFileSync(path.join(ROOT, d.file), csv);
  const { rows, ...meta } = d;
  return Object.assign(meta, { n: rows.length, columns: cols, csv });
});
const js = "/* AUTOMATISCH ERZEUGT von tools/make-datasets.mjs – nicht von Hand bearbeiten (npm run datasets). */\n" +
  "PP.datasets = " + JSON.stringify(embedded, null, 1) + ";\n";
fs.writeFileSync(path.join(ROOT, "data/datasets.js"), js);
console.log(embedded.map((d) => `${d.file}: ${d.n} Zeilen, ${d.tasks.length} Aufgaben`).join("\n"));
