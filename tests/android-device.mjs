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
// Notbremse: hängt eine Verbindung zum Gerät, bricht der Test nach 8 Minuten mit Fehler ab (statt den Job zu blockieren)
setTimeout(() => { console.error("FEHLER: Zeitlimit von 8 Minuten überschritten"); finish(1); }, 8 * 60 * 1000).unref();
fs.mkdirSync(outDir, { recursive: true });

const adb = (...args) => execFileSync("adb", args, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
const sh = (cmd) => adb("shell", cmd);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const resumed = () => (sh("dumpsys activity activities").match(/(?:topResumedActivity|mResumedActivity)[=:][^\n]*/g) || []).join(" ");
const pidOf = () => { try { return sh(`pidof ${PKG}`).trim(); } catch (e) { return ""; } };
const launch = () => { try { sh(`am start -W -n ${PKG}/.MainActivity`); } catch (e) { /* unten geprüft */ } };
/** Startet die App und wartet auf ihren Prozess; direkt nach der Installation braucht Android manchmal einen zweiten Anlauf. */
async function startApp() {
  for (let i = 0; i < 3; i++) { launch(); await sleep(3000); if (pidOf()) return true; }
  return false;
}
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
  if (!(await startApp())) throw new Error("Debug-App startet nicht: " + sh("logcat -d -b crash").slice(-400));
  const pw = loadPlaywright();
  const [device] = (await within(pw._android.devices(), 60000, null)) || [];
  if (!device) throw new Error("Kein Gerät über adb erreichbar");
  const webview = await device.webView({ pkg: PKG }, { timeout: 90000 });
  const page = await within(webview.page(), 60000, null);
  if (!page) throw new Error("Keine Verbindung zur WebView der App");
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  // „Share canceled“ protokolliert Capacitor selbst, wenn das Teilen-Menü geschlossen wird; die App behandelt das
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource|Share canceled/.test(m.text())) errors.push(m.text()); });
  const go = async (hash) => { await page.evaluate((h) => { location.hash = h; }, hash); await sleep(400); };
  const click = (sel) => page.evaluate((s) => { const el = document.querySelector(s); if (!el) return false; el.click(); return true; }, sel);
  const text = (sel) => page.evaluate((s) => (document.querySelector(s) || {}).innerText || "", sel);

  await page.waitForFunction(() => window.PPApp && document.getElementById("app").innerText.length > 200, null, { timeout: 60000 });
  const info = await page.evaluate(() => ({ native: window.PPApp.native, platform: window.Capacitor && window.Capacitor.getPlatform(), version: window.PPVersion.version, build: window.PPVersion.build,
    plugins: ["Filesystem", "Share", "App", "LocalNotifications"].filter((p) => window.Capacitor.isPluginAvailable(p)), modules: PP.modules.length, ua: navigator.userAgent }));
  check("App startet, Inhalte geladen", info.modules >= 25, `${info.modules} Module, ${info.ua.match(/Chrome\/[\d.]+/) || ""}`);
  check("Android-Modus erkannt (Capacitor)", info.native && info.platform === "android", info.platform);
  check("Native Plugins verfügbar", info.plugins.length === 4, info.plugins.join(", "));
  if (process.env.APP_VERSION) check("Version in der App", info.version === process.env.APP_VERSION && String(info.build) === String(process.env.APP_BUILD), `${info.version} (Build ${info.build})`);
  screenshot("start");

  // Ansichten
  const routes = ["#/plan", "#/modul/A1/lernpfad", "#/modul/B1/quiz", "#/modul/D1/rechnen", "#/rechentrainer/ttest_ind/42", "#/wiederholen", "#/verlauf", "#/podcasts", "#/modul/B1/podcasts", "#/rechentrainer/ausgabe_lesen/7", "#/mischquiz", "#/datensaetze", "#/pruefmodus/inhalte", "#/pruefmodus/inhalte/C1", "#/einstellungen", "#/suche/Bindung"];
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

  // Tägliche Erinnerung: Erlaubnis (Android 13+) erteilen, einschalten, geplante Benachrichtigungen abfragen
  try { sh(`pm grant ${PKG} android.permission.POST_NOTIFICATIONS`); } catch (e) { /* ältere Android-Versionen */ }
  await go("#/einstellungen"); await click("#remOn");
  const pending = await waitFor(() => page.evaluate(() => window.Capacitor.registerPlugin("LocalNotifications").getPending().then((r) => r.notifications).catch((e) => [])).then((l) => l.length ? l : null), 15000, 1000) || [];
  check("Tägliche Erinnerung geplant", pending.length >= 6 && pending.length <= 7, pending.length ? `${pending.length} geplant, z. B. „${pending[0].body}“` : `0 geplant – ${await text("#remMsg")} · Vordergrund: ${resumed().slice(0, 100)}`);
  if (!resumed().includes(PKG)) { await back(); launch(); await sleep(1500); } // falls eine Systemeinstellung geöffnet wurde
  await page.evaluate(() => window.Capacitor.registerPlugin("LocalNotifications").schedule({ notifications: [{ id: 1999, title: "PsychoPfad – Test", body: "3 Karten fällig", channelId: "erinnerung", schedule: { at: new Date(Date.now() + 3000), allowWhileIdle: true }, isExactNotification: false, extra: { route: "#/verlauf" } }] }).catch(() => {}));
  const shown = await waitFor(() => { try { return /PsychoPfad – Test|3 Karten fällig/.test(sh("dumpsys notification --noredact")); } catch (e) { return false; } }, 30000, 2000);
  check("Benachrichtigung wird angezeigt", shown, shown ? "Testbenachrichtigung in der Statusleiste" : "nicht gefunden (Zeitplanung im Emulator kann sich verzögern)", { soft: true });
  if (shown) { sh("cmd statusbar expand-notifications"); await sleep(1500); screenshot("erinnerung"); sh("cmd statusbar collapse"); await sleep(800); }
  await go("#/verlauf"); screenshot("lernverlauf");

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
  sh(`am force-stop ${PKG}`); await startApp(); await sleep(4000);
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
  const started = await startApp();
  await sleep(9000);
  const pid = pidOf(), crash = sh("logcat -d -b crash");
  check("Release-App startet ohne Absturz", started && !!pid && resumed().includes(PKG) && !crash.includes(PKG),
    `pid ${pid || "–"}${crash.includes(PKG) ? ", Absturz: " + crash.slice(-300).replace(/\s+/g, " ") : ""}${pid ? "" : ", " + resumed().slice(0, 120)}`);
  screenshot("release-start");
}

try { await debugTests(); } catch (e) { check("Teil 1 abgeschlossen", false, e.message.split("\n")[0]); try { screenshot("fehler-debug"); } catch (x) { /* egal */ } }
try { await releaseTests(); } catch (e) { check("Teil 2 abgeschlossen", false, e.message.split("\n")[0]); }

finish();
function finish(forceCode) {
const failed = results.filter((r) => !r.ok && !r.soft);
const summary = `### Android-Emulator\n\n| | Prüfung | Details |\n|---|---|---|\n${results.map((r) => `| ${r.ok ? "✅" : r.soft ? "⚠️" : "❌"} | ${r.name} | ${String(r.detail).replace(/\|/g, "/").replace(/\n/g, " ")} |`).join("\n")}\n\nScreenshots: ${screenshots.map((s) => path.basename(s)).join(", ")}\n`;
if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary);
fs.writeFileSync(path.join(outDir, "ergebnis.md"), summary);
console.log(failed.length ? `FEHLER: ${failed.length} Prüfungen fehlgeschlagen` : `OK – ${results.length} Prüfungen auf dem Gerät`);
process.exit(forceCode || (failed.length ? 1 : 0));
}
