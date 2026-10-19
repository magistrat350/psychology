// Test der echten Android-App im Emulator (läuft in GitHub Actions, siehe .github/workflows/build.yml).
//   node tests/android-device.mjs <debug.apk> <release.apk> <screenshot-ordner>
// Teil 1 – Debug-APK (WebView per Playwright steuerbar): App startet, Inhalte und Ansichten laden, native Plugins
//   (Dateisystem, Teilen, Zurück-Taste), Update-Abfrage bei GitHub, externe Links öffnen außerhalb der App.
// Teil 2 – Release-APK (die veröffentlichte Datei): installierbar, richtige Version, startet ohne Absturz.
// Umgebungsvariablen: APP_VERSION, APP_BUILD (erwartete Version), GITHUB_STEP_SUMMARY (Ergebnistabelle).
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { loadPlaywright } from "../tools/lib/playwright.mjs";

const [debugApk, releaseApk, outDir = "android-screenshots"] = process.argv.slice(2);
if (!debugApk || !releaseApk) { console.error("Aufruf: node tests/android-device.mjs <debug.apk> <release.apk> [screenshot-ordner]"); process.exit(2); }
const PKG = "io.github.magistrat350.psychopfad";
const results = [], screenshots = [];
fs.mkdirSync(outDir, { recursive: true });

const adb = (...args) => execFileSync("adb", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const sh = (cmd) => adb("shell", cmd);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const resumed = () => (sh("dumpsys activity activities").match(/(?:topResumedActivity|mResumedActivity)[=:][^\n]*/g) || []).join(" ");
const launch = () => sh(`monkey -p ${PKG} -c android.intent.category.LAUNCHER 1`);
const back = async () => { sh("input keyevent 4"); await sleep(1200); };
function check(name, ok, detail = "", { soft = false } = {}) {
  results.push({ name, ok: !!ok, soft, detail });
  console.log(`${ok ? "  ✓" : soft ? "  ⚠" : "  ✗"} ${name}${detail ? " – " + detail : ""}`);
}
function screenshot(name) {
  const file = path.join(outDir, name + ".png");
  fs.writeFileSync(file, execFileSync("adb", ["exec-out", "screencap", "-p"], { maxBuffer: 64 * 1024 * 1024 }));
  screenshots.push(file);
}
const within = (promise, ms, fallback) => Promise.race([promise.catch(() => fallback), sleep(ms).then(() => fallback)]);
async function waitFor(fn, ms, step = 500) { const end = Date.now() + ms; for (;;) { const v = await fn(); if (v || Date.now() > end) return v; await sleep(step); } }

async function debugTests() {
  console.log("Teil 1: Debug-APK");
  adb("install", "-r", debugApk);
  launch();
  const pw = loadPlaywright();
  const [device] = await pw._android.devices();
  const webview = await device.webView({ pkg: PKG }, { timeout: 90000 });
  const page = await webview.page();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // „Share canceled“ protokolliert Capacitor selbst, wenn das Teilen-Menü geschlossen wird; die App behandelt das
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|Share canceled/.test(m.text())) errors.push(m.text()); });
  const go = async (hash) => { await page.evaluate((h) => { location.hash = h; }, hash); await sleep(400); };
  const click = (sel) => page.evaluate((s) => { const el = document.querySelector(s); if (!el) return false; el.click(); return true; }, sel);
  const text = (sel) => page.evaluate((s) => (document.querySelector(s) || {}).innerText || "", sel);

  await page.waitForFunction(() => window.PPApp && document.getElementById("app").innerText.length > 200, null, { timeout: 60000 });
  const info = await page.evaluate(() => ({ native: window.PPApp.native, platform: window.Capacitor && window.Capacitor.getPlatform(), version: window.PPVersion.version, build: window.PPVersion.build,
    plugins: ["Filesystem", "Share", "App"].filter((p) => window.Capacitor.isPluginAvailable(p)), modules: PP.modules.length, ua: navigator.userAgent }));
  check("App startet, Inhalte geladen", info.modules >= 25, `${info.modules} Module, ${info.ua.match(/Chrome\/[\d.]+/) || ""}`);
  check("Android-Modus erkannt (Capacitor)", info.native && info.platform === "android", info.platform);
  check("Native Plugins verfügbar", info.plugins.length === 3, info.plugins.join(", "));
  if (process.env.APP_VERSION) check("Version in der App", info.version === process.env.APP_VERSION && String(info.build) === String(process.env.APP_BUILD), `${info.version} (Build ${info.build})`);
  screenshot("start");

  // Ansichten
  const routes = ["#/plan", "#/modul/A1/lernpfad", "#/modul/B1/quiz", "#/modul/D1/rechnen", "#/rechentrainer/ttest_ind/42", "#/wiederholen", "#/mischquiz", "#/datensaetze", "#/pruefmodus/inhalte", "#/pruefmodus/inhalte/C1", "#/einstellungen", "#/suche/Bindung"];
  const empty = [];
  for (const r of routes) { await go(r); if ((await text("#app")).length < 80) empty.push(r); }
  check(`${routes.length} Ansichten gerendert`, !empty.length, empty.join(", "));
  await go("#/modul/B1/quiz"); screenshot("quiz");
  await go("#/rechentrainer/anova/7"); screenshot("rechentrainer");
  await go("#/modul/A1/lernpfad"); await click("details.topic summary"); await sleep(300); screenshot("lernpfad-quellen");

  // Update-Abfrage über das Netz des Geräts
  await go("#/einstellungen");
  let upd = "";
  for (let i = 0; i < 3; i++) {
    await click('[data-upd="check"]');
    upd = await waitFor(async () => { const t = await text("#updResult"); return /Suche nach Updates/.test(t) ? "" : t; }, 30000);
    if (!/Keine Verbindung/.test(upd)) break;
    await sleep(5000);
  }
  check("Update-Abfrage bei GitHub", /neueste Version|verfügbar|Neueste veröffentlichte|Noch keine veröffentlichte|Abfragelimit/.test(upd), upd.split("\n")[0].slice(0, 120));
  screenshot("einstellungen");

  // Export über Dateisystem + Teilen-Menü
  await go("#/anki");
  await click('[data-anki="save"]');
  const chooser = await waitFor(() => /Chooser|Resolver|intentresolver/i.test(resumed()) && resumed(), 10000);
  check("Teilen-Menü öffnet sich", !!chooser, (chooser || resumed()).slice(0, 140));
  if (chooser) screenshot("teilen");
  let cached = "";
  try { cached = sh(`run-as ${PKG} ls cache`); } catch (e) { cached = String(e.message); }
  check("Exportdatei im App-Cache", cached.includes("psychopfad-wien-anki.txt"), cached.trim().split("\n").slice(0, 5).join(" "));
  if (chooser) await back();
  check("App nach dem Teilen wieder im Vordergrund", resumed().includes(PKG), resumed().slice(0, 140));

  // Zurück-Taste
  await go("#/plan"); await go("#/glossar");
  await back();
  check("Zurück-Taste navigiert in der App zurück", (await page.evaluate(() => location.hash)) === "#/plan", await page.evaluate(() => location.hash));
  await go("#/modul/A1/quiz"); await click(".report-btn"); await sleep(300);
  const overlayOpen = await page.evaluate(() => !!document.getElementById("overlay"));
  await back();
  // Der Dialog setzt den Fokus ins Textfeld: der erste Druck schließt ggf. nur die Bildschirmtastatur
  if (await page.evaluate(() => !!document.getElementById("overlay"))) await back();
  const afterBack = await page.evaluate(() => ({ overlay: !!document.getElementById("overlay"), hash: location.hash }));
  check("Zurück-Taste schließt zuerst den Dialog", overlayOpen && !afterBack.overlay && afterBack.hash === "#/modul/A1/quiz", JSON.stringify(afterBack));

  // Externer Link öffnet außerhalb der App
  await go("#/modul/A1/materialien");
  const href = await page.evaluate(() => { const a = document.querySelector('#app a[target="_blank"][href^="https://"]'); if (a) a.click(); return a && a.href; });
  await sleep(3000);
  const appUrl = await within(page.evaluate(() => location.href), 10000, "");
  check("Externer Link bleibt nicht in der App", !appUrl || appUrl.startsWith("https://localhost"), `${href} → App bleibt bei ${appUrl.slice(0, 60)}`);
  check("Externer Link öffnet Browser", !resumed().includes(PKG), resumed().slice(0, 140), { soft: true });
  launch(); await sleep(1500);

  check("Keine JavaScript-Fehler", !errors.length, errors.slice(0, 3).join(" | "));

  // Beenden: frisch starten, Zurück auf der ersten Seite schließt die App
  try { sh("am force-stop com.android.chrome"); } catch (e) { /* kein Browser */ }
  sh(`am force-stop ${PKG}`); launch(); await sleep(6000);
  await back(); await sleep(1000);
  check("Zurück auf der Startseite beendet die App", !resumed().includes(PKG), resumed().slice(0, 140));
}

async function releaseTests() {
  console.log("Teil 2: Release-APK");
  try { adb("uninstall", PKG); } catch (e) { /* nicht installiert */ }
  let installed = true;
  try { adb("install", releaseApk); } catch (e) { installed = false; check("Release-APK installierbar", false, String(e.message).slice(0, 200)); return; }
  check("Release-APK installierbar", installed);
  const pkgInfo = sh(`dumpsys package ${PKG}`);
  const vName = (pkgInfo.match(/versionName=(\S+)/) || [])[1], vCode = (pkgInfo.match(/versionCode=(\d+)/) || [])[1];
  if (process.env.APP_VERSION) check("Versionsangaben der APK", vName === process.env.APP_VERSION && vCode === String(process.env.APP_BUILD), `versionName=${vName}, versionCode=${vCode}`);
  sh("logcat -c");
  launch();
  await sleep(12000);
  const pid = sh(`pidof ${PKG}`).trim();
  const crash = sh("logcat -d -b crash");
  check("Release-App startet ohne Absturz", !!pid && resumed().includes(PKG) && !crash.includes(PKG), `pid ${pid || "–"}${crash.includes(PKG) ? ", Absturz im Log" : ""}`);
  screenshot("release-start");
}

try { await debugTests(); } catch (e) { check("Teil 1 abgeschlossen", false, e.message.split("\n")[0]); try { screenshot("fehler-debug"); } catch (x) { /* egal */ } }
try { await releaseTests(); } catch (e) { check("Teil 2 abgeschlossen", false, e.message.split("\n")[0]); }

const failed = results.filter((r) => !r.ok && !r.soft);
const summary = `### Android-Emulator\n\n| | Prüfung | Details |\n|---|---|---|\n${results.map((r) => `| ${r.ok ? "✅" : r.soft ? "⚠️" : "❌"} | ${r.name} | ${String(r.detail).replace(/\|/g, "/").replace(/\n/g, " ")} |`).join("\n")}\n\nScreenshots: ${screenshots.map((s) => path.basename(s)).join(", ")}\n`;
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
fs.writeFileSync(path.join(outDir, "ergebnis.md"), summary);
console.log(failed.length ? `FEHLER: ${failed.length} Prüfungen fehlgeschlagen` : `OK – ${results.length} Prüfungen auf dem Gerät`);
process.exit(failed.length ? 1 : 0);
