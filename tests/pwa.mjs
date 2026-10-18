// Offline-Test der PWA: www/-Build über http laden, Service Worker abwarten, Netz trennen, neu laden.
// Danach: neue Version veröffentlichen (anderer Cache-Name) → App meldet „Neu laden“.
import fs from "fs";
import path from "path";
import { ROOT } from "../tools/lib/load-data.mjs";
import { buildWeb } from "../tools/build-web.mjs";
import { createServer } from "../tools/serve.mjs";
import { loadPlaywright } from "../tools/lib/playwright.mjs";

const out = path.join(ROOT, "dist/www-pwa");
buildWeb({ out, env: { APP_VERSION: "2.0.1", APP_BUILD: "1" } });
const pw = loadPlaywright();
const server = createServer(out);
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${server.address().port}/`;
const browser = await pw.chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto(url);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  const controlled = await page.evaluate(() => !!navigator.serviceWorker.controller);
  if (!controlled) errors.push("Service Worker kontrolliert die Seite nicht");
  const manifest = await page.evaluate(() => fetch("manifest.webmanifest").then((r) => r.json()).then((m) => m.short_name));
  if (manifest !== "PsychoPfad") errors.push("Manifest nicht abrufbar");
  await context.setOffline(true);
  await page.reload();
  await page.evaluate(() => { location.hash = "#/modul/D1/rechnen"; });
  await page.waitForTimeout(100);
  const text = await page.textContent("#app");
  if (!text.includes("Rechentrainer") || text.length < 200) errors.push("App offline nicht nutzbar");
  const csv = await page.evaluate(() => fetch("data/datasets/therapie.csv").then((r) => r.text()));
  if (!csv.startsWith("id,bedingung")) errors.push("Datensatz offline nicht verfügbar");
  console.log("  ✓ Service Worker aktiv, App und Datensätze offline verfügbar");

  // Neue Version veröffentlicht: geänderter Service Worker übernimmt, App bietet Neuladen an
  await context.setOffline(false);
  buildWeb({ out, env: { APP_VERSION: "2.0.2", APP_BUILD: "2" } });
  if (await page.$eval("#updateBanner", (b) => !b.hidden)) errors.push("Update-Hinweis ohne neue Version");
  await page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
  await page.waitForSelector("#updateBanner:not([hidden])", { timeout: 5000 });
  if (!(await page.textContent("#updateBanner")).includes("neue Version")) errors.push("Update-Hinweis der Web-App fehlt");
  await page.click('[data-upd="reload"]');
  await page.waitForFunction(() => window.PPVersion && window.PPVersion.version === "2.0.2", null, { timeout: 5000 });
  console.log("  ✓ Neue Version erkannt, nach „Neu laden“ aktiv (2.0.1 → 2.0.2)");
} catch (e) { errors.push(e.message); }
await browser.close();
server.close();
fs.rmSync(out, { recursive: true, force: true });
if (errors.length) { console.error("FEHLER:\n" + errors.join("\n")); process.exit(1); }
console.log("OK – PWA funktioniert offline.");
