// Rendert icons/icon.svg in PNG-Größen für das Web-App-Manifest: `npm run icons`
import fs from "fs";
import path from "path";
import { ROOT } from "./lib/load-data.mjs";
import { loadPlaywright } from "./lib/playwright.mjs";

const svg = fs.readFileSync(path.join(ROOT, "icons/icon.svg"), "utf8");
const pw = loadPlaywright();
const browser = await pw.chromium.launch();
const page = await browser.newPage();
for (const [name, size, pad] of [["icon-192.png", 192, 0], ["icon-512.png", 512, 0], ["icon-maskable-512.png", 512, 0.12]]) {
  // maskable: Motiv verkleinert auf vollflächigem Hintergrund (sichere Zone ~80 %)
  const inner = Math.round(size * (1 - 2 * pad));
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:${pad ? "#8a1538" : "transparent"};display:grid;place-items:center;width:${size}px;height:${size}px">
    <div style="width:${inner}px;height:${inner}px">${svg.replace("<svg ", `<svg width="${inner}" height="${inner}" `)}</div></body></html>`);
  await page.screenshot({ path: path.join(ROOT, "icons", name), omitBackground: !pad });
  console.log("icons/" + name);
}
await browser.close();
