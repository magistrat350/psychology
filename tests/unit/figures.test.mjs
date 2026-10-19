import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import vm from "vm";
import { createRequire } from "module";
import { loadData, ROOT } from "../../tools/lib/load-data.mjs";
const F = createRequire(import.meta.url)("../../js/figures.js");

const REQUIRED = ["neuron", "synapse", "aktionspotenzial", "gehirn-lappen", "gehirn-limbisch", "mehrspeichermodell", "arbeitsgedaechtnis",
  "klassische-konditionierung", "operante-konditionierung", "signalentdeckung", "normalverteilung", "schiefe", "alpha-beta", "streudiagramme",
  "interaktion-2x2", "versuchsplaene", "yerkes-dodson", "reliabilitaet-validitaet", "erziehungsstile", "transaktionales-stressmodell", "biopsychosozial"];

// data/figures.js ist (noch) nicht in index.html eingebunden → selbst in eine Sandbox laden
function topicFigures() {
  const ctx = { PP: {} };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "data/figures.js"), "utf8"), ctx, { filename: "data/figures.js" });
  return ctx.PP.topicFigures;
}

// einfacher Stack-Parser: jedes Start-Tag braucht ein passendes End-Tag
function unbalanced(svg) {
  const stack = [];
  for (const m of svg.matchAll(/<(\/?)([A-Za-z][\w:-]*)\b[^>]*?(\/?)>/g)) {
    const [, close, name, self] = m;
    if (self) continue;
    if (!close) stack.push(name);
    else if (stack.pop() !== name) return `unerwartetes </${name}>`;
  }
  return stack.length ? `offen: ${stack.join(", ")}` : "";
}

test("Liste: alle geforderten Abbildungen mit Titel, Bildunterschrift und Textalternative", () => {
  const list = F.list();
  const ids = list.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length, "IDs eindeutig");
  for (const id of REQUIRED) assert.ok(ids.includes(id), id);
  for (const f of list) {
    for (const k of ["title", "caption", "alt"]) assert.ok(typeof f[k] === "string" && f[k].trim().length > 10, `${f.id}.${k}`);
    assert.ok(f.alt.length >= f.caption.length * 0.6, `${f.id}: Textalternative zu knapp`);
  }
});

test("Jede Abbildung rendert gültiges, eigenständiges SVG", () => {
  const allIds = [];
  for (const { id, title } of F.list()) {
    const svg = F.render(id);
    assert.ok(svg.startsWith("<svg"), id);
    const root = svg.match(/^<svg[^>]*>/)[0];
    assert.match(root, /viewBox="0 0 \d+(\.\d+)? \d+(\.\d+)?"/, id);
    assert.match(root, /role="img"/, id);
    assert.match(root, /class="fig"/, id);
    assert.ok(!/\s(width|height)=/.test(root), `${id}: keine festen Maße am <svg>`);
    assert.ok(svg.includes(`<title id="fig-${id}-t">`), `${id}: <title>`);
    assert.ok(svg.includes(title.replace(/&/g, "&amp;")), `${id}: Titel im SVG`);
    assert.ok(!/undefined|NaN|Infinity/.test(svg), `${id}: undefined/NaN`);
    assert.equal(unbalanced(svg), "", id);
    assert.ok(!/<(script|image|img|foreignObject|style)\b/i.test(svg), `${id}: keine Skripte/Bilder`);
    assert.ok(!/\s(fill|stroke|style|color)=|#[0-9a-f]{3,6}\b|https?:\/\/(?!www\.w3\.org\/2000\/svg)/i.test(svg), `${id}: Farben nur über Klassen, keine externen Ressourcen`);
    const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    ids.forEach((x) => assert.ok(x.startsWith(`fig-${id}-`), `${id}: ID ${x} mit Präfix`));
    allIds.push(...ids);
    const refs = [...svg.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]).concat(root.match(/aria-labelledby="([^"]+)"/)[1].split(" "));
    refs.forEach((r) => assert.ok(ids.includes(r), `${id}: Verweis auf #${r}`));
    for (const m of svg.matchAll(/class="([^"]+)"/g)) m[1].split(" ").forEach((c) => assert.match(c, /^fig(-|$)/, `${id}: Klasse ${c}`));
  }
  assert.equal(new Set(allIds).size, allIds.length, "IDs über alle Abbildungen eindeutig");
  assert.equal(F.render("gibt-es-nicht"), "");
  assert.match(F.html("neuron"), /^<figure class="fig-wrap"><svg[\s\S]*<figcaption>[^<]+<\/figcaption><\/figure>$/);
});

test("Streudiagramme: Punktwolken haben die angegebene Korrelation", () => {
  const svg = F.render("streudiagramme");
  const groups = [...svg.matchAll(/<g data-r="([^"]+)">([\s\S]*?)<\/g>/g)];
  assert.equal(groups.length, 4);
  for (const [, r, body] of groups) {
    const p = [...body.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)"/g)].map((m) => [Number(m[1]), -Number(m[2])]);
    const mx = p.reduce((s, q) => s + q[0], 0) / p.length, my = p.reduce((s, q) => s + q[1], 0) / p.length;
    const sxy = p.reduce((s, q) => s + (q[0] - mx) * (q[1] - my), 0), sxx = p.reduce((s, q) => s + (q[0] - mx) ** 2, 0), syy = p.reduce((s, q) => s + (q[1] - my) ** 2, 0);
    assert.ok(Math.abs(sxy / Math.sqrt(sxx * syy) - Number(r)) < 0.02, `r = ${r}`);
  }
});

test("Zuordnung data/figures.js: existierende Module, Themen und Abbildungen", () => {
  const map = topicFigures();
  const PP = loadData();
  const figIds = new Set(F.list().map((f) => f.id));
  const used = new Set();
  assert.ok(map && typeof map === "object");
  for (const [mod, topics] of Object.entries(map)) {
    const m = PP.modules.find((x) => x.id === mod);
    assert.ok(m, `Modul ${mod}`);
    const titles = new Set((m.topics || []).map((t) => t.title));
    for (const [title, figs] of Object.entries(topics)) {
      assert.ok(titles.has(title), `${mod}: Thema „${title}“`);
      assert.ok(Array.isArray(figs) && figs.length, `${mod}/${title}`);
      assert.equal(new Set(figs).size, figs.length, `${mod}/${title}: doppelt`);
      figs.forEach((f) => { assert.ok(figIds.has(f), `${mod}/${title}: Abbildung ${f}`); used.add(f); });
    }
  }
  for (const id of figIds) assert.ok(used.has(id), `Abbildung ${id} ist keinem Thema zugeordnet`);
});
