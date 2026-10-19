// Browser-Test der Android-Version: baut www/ wie für die APK und ersetzt die Capacitor-Laufzeit durch Attrappen
// (Dateisystem, Teilen, Zurück-Taste, Benachrichtigungen). Die GitHub-API wird simuliert – geprüft werden Update-Hinweis,
// manuelle Prüfung, Prüfintervall, Dateiexport über das Teilen-Menü und die Zurück-Taste.
import path from "path";
import fs from "fs";
import { ROOT } from "../tools/lib/load-data.mjs";
import { buildWeb } from "../tools/build-web.mjs";
import { createServer } from "../tools/serve.mjs";
import { loadPlaywright } from "../tools/lib/playwright.mjs";

const out = path.join(ROOT, "dist/www-native");
buildWeb({ android: true, out, env: { APP_VERSION: "2.0.5", APP_BUILD: "5", GITHUB_SHA: "abc1234def", APP_DATE: "2026-10-18T12:00Z" } });
const capMock = `window.__cap = { calls: [], listeners: {} };
window.Capacitor = { isNativePlatform: () => true, getPlatform: () => "android", registerPlugin: (name) => ({
  Filesystem: { writeFile: async (o) => { __cap.calls.push(["writeFile", o]); return { uri: "file:///data/cache/" + o.path }; } },
  Share: { share: async (o) => { __cap.calls.push(["share", o]); return {}; } },
  App: { addListener: async (ev, fn) => { __cap.listeners[ev] = fn; return { remove: async () => {} }; }, exitApp: async () => { __cap.calls.push(["exitApp"]); } },
  LocalNotifications: {
    checkPermissions: async () => ({ display: __cap.perm || "prompt" }),
    requestPermissions: async () => { __cap.calls.push(["requestPermissions"]); __cap.perm = __cap.allow ? "granted" : "denied"; return { display: __cap.perm }; },
    schedule: async (o) => { __cap.calls.push(["schedule", JSON.parse(JSON.stringify(o))]); return { notifications: o.notifications.map((n) => ({ id: n.id })) }; },
    cancel: async (o) => { __cap.calls.push(["cancel", o]); },
    createChannel: async (o) => { __cap.calls.push(["createChannel", o]); },
    addListener: async (ev, fn) => { __cap.listeners[ev] = fn; return { remove: async () => {} }; }
  }
})[name] };`;
fs.writeFileSync(path.join(out, "js/capacitor.js"), capMock);

const release = (v, body) => ({ tag_name: "v" + v, name: "PsychoPfad Wien " + v, body, html_url: `https://github.com/magistrat350/psychology/releases/tag/v${v}`, published_at: "2026-10-18T10:00:00Z",
  assets: [{ name: "psychopfad.apk", browser_download_url: `https://github.com/magistrat350/psychology/releases/download/v${v}/psychopfad.apk`, size: 4718592 }] });
let api = { status: 200, body: release("2.0.9", "- Neue Funktion A\n- Fehler B behoben") }, apiCalls = 0;

const server = createServer(out);
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${server.address().port}/index.html`;
const pw = loadPlaywright();
const browser = await pw.chromium.launch();
const context = await browser.newContext();
await context.route("https://api.github.com/**", (route) => { apiCalls++; if (api.offline) return route.abort("internetdisconnected"); route.fulfill({ status: api.status, contentType: "application/json", headers: { "Access-Control-Allow-Origin": "*" }, body: JSON.stringify(api.body) }); });
const page = await context.newPage();
const errors = [];
const step = (msg) => console.log("  ✓ " + msg);
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
const go = async (h) => { await page.evaluate((x) => { location.hash = x; }, h); await page.waitForTimeout(30); };
const text = (sel) => page.textContent(sel);

try {
  // 1) Automatische Prüfung beim Start → Hinweis mit APK-Link
  await page.goto(url);
  await page.waitForSelector("#updateBanner:not([hidden])", { timeout: 3000 });
  if (!(await page.evaluate(() => window.PPApp.native))) errors.push("Android-Modus nicht erkannt");
  const href = await page.getAttribute("#updateBanner a.primary", "href");
  if (!href.endsWith("/v2.0.9/psychopfad.apk")) errors.push("Update-Hinweis verlinkt nicht die APK: " + href);
  if (!(await text("#updateBanner")).includes("2.0.9")) errors.push("Update-Hinweis ohne Versionsnummer");
  if (!(await text("#sidebar")).includes("Version 2.0.5")) errors.push("Version fehlt in der Navigation");
  step("Start: neue Version 2.0.9 erkannt, Hinweis mit APK-Link");

  // 2) Einstellungen: installierte Version, Neuigkeiten, Download
  await go("#/einstellungen");
  const card = await text("#versionCard");
  for (const s of ["2.0.5", "Build 5", "Android-App", "abc1234", "Neue Funktion A", "4,5 MB"]) if (!card.includes(s)) errors.push(`Versionskarte: „${s}“ fehlt`);
  if (await page.$('#versionCard a[href$="/latest/download/psychopfad.apk"]')) errors.push("Android-App bietet sich selbst als Download an");
  step("Einstellungen zeigen Version, Build, Commit und Neuigkeiten");

  // 3) Ausblenden bleibt nach Neustart erhalten; Prüfintervall verhindert erneute Abfrage
  await page.click('[data-upd="dismiss"]');
  if (!(await page.$eval("#updateBanner", (b) => b.hidden))) errors.push("Hinweis lässt sich nicht ausblenden");
  const before = apiCalls;
  await page.reload(); await page.waitForTimeout(200);
  if (!(await page.$eval("#updateBanner", (b) => b.hidden))) errors.push("Ausgeblendeter Hinweis erscheint wieder");
  if (apiCalls !== before) errors.push("Automatische Prüfung ignoriert das 12-Stunden-Intervall");
  step("Hinweis ausgeblendet, kein erneuter Abruf innerhalb von 12 Stunden");

  // 4) Manuelle Prüfung: aktuell, keine Veröffentlichung, offline
  api = { status: 200, body: release("2.0.5", "- Stand") };
  await go("#/einstellungen");
  await page.click('[data-upd="check"]'); await page.waitForTimeout(150);
  if (!(await text("#updResult")).includes("neueste Version")) errors.push("Manuelle Prüfung meldet nicht „aktuell“");
  if (await page.$("#sidebar .nav-foot .nav-count")) errors.push("Navigation zeigt veraltetes Update an");
  api = { status: 404, body: { message: "Not Found" } };
  await page.click('[data-upd="check"]'); await page.waitForTimeout(150);
  if (!(await text("#updResult")).includes("Noch keine veröffentlichte Version")) errors.push("404 wird nicht verständlich gemeldet");
  api = { offline: true };
  await page.click('[data-upd="check"]'); await page.waitForTimeout(150);
  if (!(await text("#updResult")).includes("online")) errors.push("Offline-Fehler wird nicht gemeldet");
  step("Manuelle Prüfung: aktuell, keine Veröffentlichung, offline");

  // 5) Dateien über das Teilen-Menü statt Download
  await go("#/anki");
  await page.click('[data-anki="save"]'); await page.waitForTimeout(100);
  const calls = await page.evaluate(() => __cap.calls);
  const w = calls.find((c) => c[0] === "writeFile"), s = calls.find((c) => c[0] === "share");
  if (!w || w[1].path !== "psychopfad-wien-anki.txt" || w[1].directory !== "CACHE" || !w[1].data.startsWith("#separator:tab")) errors.push("Anki-Datei nicht in den Cache geschrieben");
  if (!s || s[1].files[0] !== "file:///data/cache/psychopfad-wien-anki.txt") errors.push("Teilen-Menü nicht mit der Datei geöffnet");
  if (await page.$('#app a[download]')) errors.push("Download-Link in der Android-App");
  await go("#/datensaetze");
  if (await page.$('a[download]')) errors.push("Datensatz-Downloadlink in der Android-App");
  step("Anki-Export über Dateisystem und Teilen-Menü");

  // 6) Zurück-Taste: Dialog schließen, zurück navigieren, auf der ersten Seite beenden
  await go("#/plan"); await go("#/glossar");
  await page.evaluate(() => __cap.listeners.backButton({ canGoBack: true })); await page.waitForTimeout(80);
  if (!page.url().endsWith("#/plan")) errors.push("Zurück-Taste navigiert nicht zurück: " + page.url());
  await go("#/modul/A1/quiz"); await page.click(".report-btn");
  await page.evaluate(() => __cap.listeners.backButton({ canGoBack: true })); await page.waitForTimeout(50);
  if (await page.$("#overlay") || !page.url().endsWith("#/modul/A1/quiz")) errors.push("Zurück-Taste schließt den Dialog nicht zuerst");
  await page.evaluate(() => __cap.listeners.backButton({ canGoBack: false }));
  if (!(await page.evaluate(() => __cap.calls.some((c) => c[0] === "exitApp")))) errors.push("Zurück-Taste beendet die App auf der ersten Seite nicht");
  step("Zurück-Taste: Dialog, Verlauf, Beenden");

  // 7) Fehlermeldungen enthalten die App-Version; kein Service Worker in der App
  await page.click(".report-btn"); await page.fill("#repComment", "Test"); await page.click('[data-repsave="1"]');
  const rep = await page.evaluate(() => Object.values(window.PPApp.state.reports)[0]);
  if (!rep || rep.app !== "2.0.5") errors.push("Meldung ohne App-Version");
  if (await page.evaluate(() => navigator.serviceWorker.getRegistrations().then((r) => r.length))) errors.push("Service Worker in der Android-App registriert");
  step("Meldungen mit App-Version, kein Service Worker");

  // 8) Tägliche Erinnerung: Erlaubnis abgelehnt → Hinweis; erlaubt → 7 Tage geplant, Tipp öffnet die Wiederholung
  await go("#/einstellungen");
  if (!(await page.evaluate(() => __cap.calls.some((c) => c[0] === "createChannel" && c[1].id === "erinnerung")))) errors.push("Benachrichtigungskanal nicht angelegt");
  await page.click("#remOn"); await page.waitForTimeout(100);
  if (!(await text("#remMsg")).includes("nicht erlaubt") || (await page.isChecked("#remOn"))) errors.push("Abgelehnte Erlaubnis wird nicht gemeldet");
  await page.evaluate(() => { __cap.allow = true; __cap.calls.length = 0; });
  await page.check("#remOn"); await page.waitForTimeout(100);
  const sched = await page.evaluate(() => __cap.calls.filter((c) => c[0] === "schedule").pop());
  const list = sched ? sched[1].notifications : [];
  if (list.length < 6 || list.length > 7) errors.push(`Erinnerung: ${list.length} statt 6–7 Benachrichtigungen geplant`);
  if (!list.every((n) => /Karten? fällig|neue Karten warten/.test(n.body) && n.channelId === "erinnerung" && n.extra.route === "#/wiederholen" && new Date(n.schedule.at) > new Date())) errors.push("Erinnerung: Inhalt/Zeitpunkt falsch: " + JSON.stringify(list[0]));
  if (new Set(list.map((n) => new Date(n.schedule.at).getHours() + ":" + new Date(n.schedule.at).getMinutes())).size !== 1) errors.push("Erinnerung: unterschiedliche Uhrzeiten");
  await page.fill("#remTime", "07:30"); await page.dispatchEvent("#remTime", "change"); await page.waitForTimeout(100);
  const re = await page.evaluate(() => __cap.calls.filter((c) => c[0] === "schedule").pop()[1].notifications);
  if (!re.every((n) => { const d = new Date(n.schedule.at); return d.getHours() === 7 && d.getMinutes() === 30; })) errors.push("Neue Uhrzeit wird nicht übernommen");
  await go("#/plan");
  await page.evaluate(() => __cap.listeners.localNotificationActionPerformed({ actionId: "tap", notification: { id: 1002, extra: { route: "#/wiederholen" } } })); await page.waitForTimeout(50);
  if (!page.url().endsWith("#/wiederholen")) errors.push("Tipp auf die Erinnerung öffnet die Wiederholung nicht");
  step(`Erinnerung: Erlaubnis, ${list.length} Tage geplant („${list[0] && list[0].body}“), Uhrzeit, Tipp öffnet Wiederholung`);
} catch (e) { errors.push(e.message); }

await browser.close();
server.close();
fs.rmSync(out, { recursive: true, force: true });
if (errors.length) { console.error("FEHLER:\n" + [...new Set(errors)].join("\n")); process.exit(1); }
console.log("OK – Android-Version (simuliert) ohne Fehler.");
