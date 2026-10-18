// Offline-Test der PWA: Seite über http laden, Service Worker abwarten, Netz trennen, neu laden.
import { createServer } from "../tools/serve.mjs";
import { loadPlaywright } from "../tools/lib/playwright.mjs";

const pw = loadPlaywright();
const server = createServer();
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
} catch (e) { errors.push(e.message); }
await browser.close();
server.close();
if (errors.length) { console.error("FEHLER:\n" + errors.join("\n")); process.exit(1); }
console.log("OK – PWA funktioniert offline.");
