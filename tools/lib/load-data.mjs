// Lädt alle Datenskripte aus index.html (in derselben Reihenfolge wie im Browser) in eine Sandbox
// und gibt das PP-Objekt zurück. Gemeinsam genutzt von Tests und Werkzeugen.
import fs from "fs";
import path from "path";
import vm from "vm";
import { fileURLToPath } from "url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

export function scriptList() {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  return [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);
}

export function loadData({ includeApp = false } = {}) {
  const ctx = { window: {}, console };
  ctx.self = ctx.window;
  vm.createContext(ctx);
  for (const s of scriptList()) {
    if (!includeApp && s.startsWith("js/app")) continue;
    const code = fs.readFileSync(path.join(ROOT, s), "utf8").replace(/^window\.PP =/m, "PP =");
    vm.runInContext(code, ctx, { filename: s });
  }
  return ctx.PP || ctx.window.PP;
}

/** Alle in den Daten verlinkten URLs mit Fundort. */
export function collectLinks(PP) {
  const out = [];
  const add = (url, title, where, extra = {}) => { if (url) out.push({ url, title, where, ...extra }); };
  PP.modules.forEach((m) => {
    (m.materials || []).forEach((r) => add(r.url, r.title, `${m.id} · Materialien`, { mod: m.id }));
    (m.lectures || []).forEach((r) => add(r.url, r.title, `${m.id} · Vorlesungen`, { mod: m.id }));
  });
  Object.entries(PP.general || {}).forEach(([k, list]) => Array.isArray(list) && list.forEach((r) => r && r.url && add(r.url, r.title, `Allgemein · ${k}`)));
  (PP.meta.officialLinks || []).forEach((l) => add(l.url, l.title, "Offizielle Quellen"));
  (PP.careerLinks || []).forEach((l) => add(l.url, l.title, "Nach dem Bachelor"));
  (PP.libraries || []).forEach((l) => { add(l.home, l.name, "Bibliotheken"); (l.links || []).forEach((x) => add(x.url, x.title, `Bibliotheken · ${l.short}`)); });
  return out;
}

export const isSearchUrl = (u) => /youtube\.com\/results|google\.[a-z.]+\/search|scholar\.google|\/search\?|[?&](q|query|search_query)=/.test(u);
