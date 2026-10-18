// Rendert icons/icon.svg in PNG-Größen: `npm run icons`
//   icons/…  – Web-App-Manifest
//   assets/… – Vorlagen für die Android-App (npx capacitor-assets generate --android)
import fs from "fs";
import path from "path";
import { ROOT } from "./lib/load-data.mjs";
import { loadPlaywright } from "./lib/playwright.mjs";

const svg = fs.readFileSync(path.join(ROOT, "icons/icon.svg"), "utf8");
// Nur das Ψ ohne Hintergrund – für adaptive Android-Icons und den Startbildschirm
const glyph = (color, scale) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g transform="translate(256 260) scale(${scale}) translate(-256 -260)" fill="none" stroke="${color}" stroke-width="30" stroke-linecap="round">${svg.match(/<g [^>]*>([\s\S]*?)<\/g>/)[1]}</g></svg>`;
const ACCENT = "#8a1538", LIGHT_BG = "#f7f6f2", DARK_BG = "#15171b";

const pw = loadPlaywright();
const browser = await pw.chromium.launch();
const page = await browser.newPage();
async function render(file, size, art, { bg = "transparent", inner = size } = {}) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0;background:${bg};display:grid;place-items:center;width:${size}px;height:${size}px">
    <div style="width:${inner}px;height:${inner}px">${art.replace("<svg ", `<svg width="${inner}" height="${inner}" `)}</div></body></html>`);
  fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
  await page.screenshot({ path: path.join(ROOT, file), omitBackground: bg === "transparent" });
  console.log(file);
}
await render("icons/icon-192.png", 192, svg);
await render("icons/icon-512.png", 512, svg);
// maskable: Motiv verkleinert auf vollflächigem Hintergrund (sichere Zone ~80 %)
await render("icons/icon-maskable-512.png", 512, svg, { bg: ACCENT, inner: Math.round(512 * 0.76) });
await render("assets/icon-only.png", 1024, svg);
await render("assets/icon-background.png", 1024, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="${ACCENT}"/></svg>`, { bg: ACCENT });
await render("assets/icon-foreground.png", 1024, glyph("#f6e5ea", 0.62));
await render("assets/splash.png", 2732, svg, { bg: LIGHT_BG, inner: 640 });
await render("assets/splash-dark.png", 2732, svg, { bg: DARK_BG, inner: 640 });
await browser.close();
