import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { ROOT, scriptList } from "../../tools/lib/load-data.mjs";

const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
const assets = JSON.parse(sw.match(/const ASSETS = (\[[\s\S]*?\]);/)[1].replace(/,\s*\]/, "]"));

test("Service Worker lädt alle App-Dateien vor", () => {
  const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  const refs = scriptList().concat([...html.matchAll(/<link [^>]*href="([^"]+)"/g)].map((m) => m[1]));
  for (const r of refs) assert.ok(assets.includes(r), `${r} fehlt in sw.js`);
  for (const f of fs.readdirSync(path.join(ROOT, "data/datasets"))) assert.ok(assets.includes(`data/datasets/${f}`), `data/datasets/${f} fehlt in sw.js`);
  for (const a of assets.filter((x) => x !== "./")) assert.ok(fs.existsSync(path.join(ROOT, a)), `${a} existiert nicht`);
});

test("Manifest ist gültig und Icons existieren", () => {
  const m = JSON.parse(fs.readFileSync(path.join(ROOT, "manifest.webmanifest"), "utf8"));
  assert.equal(m.display, "standalone");
  assert.ok(m.icons.some((i) => i.sizes === "512x512" && i.purpose === "maskable"));
  for (const i of m.icons) { assert.ok(fs.existsSync(path.join(ROOT, i.src)), i.src); assert.ok(assets.includes(i.src), `${i.src} nicht vorgeladen`); }
});
