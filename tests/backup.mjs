// Browser-Test der Sicherung: Erinnerung, Sicherung als Datei, automatische Sicherung im GitHub-Gist mit zwei
// Geräten (Abgleich, Konflikt „Übernehmen“/„Dieses Gerät behalten“), ungültiger Schlüssel, Trennen.
// Die GitHub-API wird im Test nachgebildet. Aufruf: node tests/backup.mjs
import fs from "fs";
import { createServer } from "../tools/serve.mjs";
import { loadPlaywright } from "../tools/lib/playwright.mjs";

const server = createServer();
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${server.address().port}/index.html`;
const FILE = "psychopfad-lernstand.json", TOKEN = "ghp_testschluessel";
const gists = {}; let clock = 0, apiCalls = 0;
const stamp = () => new Date(Date.UTC(2026, 9, 19, 10, 0, ++clock)).toISOString().replace(/\.\d{3}Z$/, "Z");
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept", "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS" };
async function github(route) {
  const req = route.request(), u = new URL(req.url()), m = req.method();
  if (m === "OPTIONS") return route.fulfill({ status: 204, headers: cors });
  apiCalls++;
  const send = (status, body) => route.fulfill({ status, headers: cors, contentType: "application/json", body: JSON.stringify(body) });
  if (req.headers().authorization !== "Bearer " + TOKEN) return send(401, { message: "Bad credentials" });
  const full = (g) => ({ id: g.id, html_url: "https://gist.github.com/" + g.id, updated_at: g.updated_at, files: { [FILE]: { filename: FILE, content: g.content, truncated: false } } });
  if (u.pathname === "/user") return send(200, { login: "test" });
  if (u.pathname === "/gists" && m === "GET") return send(200, Object.values(gists).map((g) => ({ id: g.id, updated_at: g.updated_at, files: { [FILE]: { filename: FILE } } })));
  if (u.pathname === "/gists" && m === "POST") {
    const b = JSON.parse(req.postData()); const id = "g" + (Object.keys(gists).length + 1);
    gists[id] = { id, public: b.public, content: b.files[FILE].content, updated_at: stamp() };
    return send(201, full(gists[id]));
  }
  const g = gists[u.pathname.split("/")[2]];
  if (!g) return send(404, { message: "Not Found" });
  if (m === "PATCH") { g.content = JSON.parse(req.postData()).files[FILE].content; g.updated_at = stamp(); }
  return send(200, full(g));
}

const pw = loadPlaywright();
const browser = await pw.chromium.launch();
const errors = [];
const step = (msg) => console.log("  ✓ " + msg);
async function device() {
  const context = await browser.newContext({ acceptDownloads: true });
  await context.route("https://api.github.com/**", github);
  const page = await context.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
  await page.goto(url);
  return page;
}
const go = (page, h) => page.evaluate((x) => { location.hash = x; }, h).then(() => page.waitForTimeout(60));
const st = (page) => page.evaluate(() => JSON.parse(JSON.stringify(window.PPApp.state)));
const banner = (page) => page.$eval("#updateBanner", (b) => (b.hidden ? "" : b.textContent));
const remote = (id) => JSON.parse(gists[id].content);

try {
  // 1) Erinnerung: mit Lernstand und alter Sicherung erscheint der Hinweis; „Später“ blendet ihn aus
  const a = await device();
  await a.evaluate((old) => {
    localStorage.setItem("psychopfad_wien_v1", JSON.stringify({ srs: { "q:A1:demo": { box: 2, due: "2026-10-20" } }, notes: { A1: "Gerät A" }, backup: { last: old } }));
  }, new Date(Date.now() - 10 * 864e5).toISOString());
  await a.reload(); await a.waitForTimeout(150);
  if (!/seit 10 Tagen nicht gesichert/.test(await banner(a))) errors.push("Erinnerung erscheint nicht: " + (await banner(a)));
  await a.click('[data-backup="later"]');
  await a.reload(); await a.waitForTimeout(150);
  if (await banner(a)) errors.push("„Später“ wirkt nicht über einen Neustart");
  step("Erinnerung nach 10 Tagen, „Später“ blendet sie aus");

  // 2) Sicherung als Datei aus den Einstellungen
  await go(a, "#/einstellungen");
  const [dl] = await Promise.all([a.waitForEvent("download"), a.click('#backupCard [data-backup="now"]')]);
  const file = JSON.parse(fs.readFileSync(await dl.path(), "utf8"));
  if (!file._backup || file.notes.A1 !== "Gerät A") errors.push("Sicherungsdatei unvollständig");
  if (Date.now() - Date.parse((await st(a)).backup.last) > 60000) errors.push("Zeitpunkt der Sicherung nicht gespeichert");
  await a.selectOption("#backupDays", "14");
  if ((await st(a)).settings.backupDays !== 14) errors.push("Erinnerungsabstand nicht gespeichert");
  step("Sicherung als Datei (mit Angaben), Zeitpunkt und Abstand gespeichert");

  // 3) Ungültiger Schlüssel
  await a.fill("#syncToken", "falsch");
  await a.click('[data-sync="connect"]'); await a.waitForTimeout(300);
  if (!(await a.textContent("#backupCard")).includes("ungültig")) errors.push("Ungültiger Schlüssel wird nicht gemeldet");
  if ((await a.evaluate(() => window.PPApp.sync)).token) errors.push("Ungültiger Schlüssel bleibt gespeichert");

  // 4) Verbinden: neuer geheimer Gist mit dem Lernstand
  await a.fill("#syncToken", TOKEN);
  await a.click('[data-sync="connect"]'); await a.waitForTimeout(400);
  const id = Object.keys(gists)[0];
  if (!id || gists[id].public !== false || remote(id).notes.A1 !== "Gerät A") errors.push("Gist nicht (geheim) angelegt");
  if (JSON.stringify(await st(a)).includes(TOKEN)) errors.push("Zugangsschlüssel steht im Lernstand (Export)!");
  step("Ungültiger Schlüssel abgelehnt; Verbinden legt geheimen Gist an, Schlüssel nicht im Lernstand");

  // 5) Änderung → hochladen
  await a.evaluate(() => { window.PPApp.state.notes.A1 = "Gerät A, geändert"; });
  await go(a, "#/modul/A1/notizen"); await a.fill("#notes", "Gerät A, geändert"); await a.waitForTimeout(500);
  await a.evaluate(() => window.PPApp.syncNow()); await a.waitForTimeout(300);
  if (remote(id).notes.A1 !== "Gerät A, geändert") errors.push("Änderung nicht hochgeladen");
  step("Änderungen werden hochgeladen");

  // 6) Zweites Gerät ohne Lernstand: verbinden übernimmt die Sicherung
  const b = await device();
  await go(b, "#/einstellungen");
  await b.fill("#syncToken", TOKEN);
  await b.click('[data-sync="connect"]'); await b.waitForTimeout(500);
  if ((await st(b)).notes.A1 !== "Gerät A, geändert") errors.push("Zweites Gerät übernimmt die Sicherung nicht");
  await go(b, "#/modul/B1/notizen"); await b.fill("#notes", "Gerät B"); await b.waitForTimeout(500);
  await b.evaluate(() => window.PPApp.syncNow()); await b.waitForTimeout(300);
  step("Zweites Gerät übernimmt die Sicherung und lädt eigene Änderungen hoch");

  // 7) Gerät A startet neu → neuere Sicherung erkannt → „Übernehmen“
  await a.reload(); await a.waitForTimeout(400);
  if (!/neuere Sicherung/.test(await banner(a))) errors.push("Neuere Sicherung von Gerät B nicht erkannt");
  await a.click('[data-sync="take"]'); await a.waitForTimeout(400);
  if ((await st(a)).notes.B1 !== "Gerät B" || (await banner(a)).includes("neuere Sicherung")) errors.push("„Übernehmen“ funktioniert nicht");
  step("Neuere Sicherung eines anderen Geräts wird erkannt und übernommen");

  // 8) Gleichzeitige Änderungen: B lädt nicht über A hinweg, sondern fragt; „Dieses Gerät behalten“ überschreibt
  await go(a, "#/modul/C1/notizen"); await a.fill("#notes", "A zuerst"); await a.waitForTimeout(500);
  await a.evaluate(() => window.PPApp.syncNow()); await a.waitForTimeout(300);
  await go(b, "#/modul/C1/notizen"); await b.fill("#notes", "B danach"); await b.waitForTimeout(500);
  await b.evaluate(() => window.PPApp.syncNow()); await b.waitForTimeout(300);
  if (remote(id).notes.C1 !== "A zuerst" || !/neuere Sicherung/.test(await banner(b))) errors.push("Konflikt nicht erkannt – Sicherung überschrieben?");
  await b.click('[data-sync="keep"]'); await b.waitForTimeout(400);
  if (remote(id).notes.C1 !== "B danach") errors.push("„Dieses Gerät behalten“ lädt nicht hoch");
  step("Konflikt: kein Überschreiben ohne Rückfrage, „Dieses Gerät behalten“ lädt hoch");

  // 9) Wiederherstellen (zweistufig) und Trennen
  await go(a, "#/einstellungen");
  await a.click('[data-sync="restore"]'); await a.click('[data-sync="restore"]'); await a.waitForTimeout(400);
  if ((await st(a)).notes.C1 !== "B danach") errors.push("Wiederherstellen von GitHub funktioniert nicht");
  await a.click('[data-sync="disconnect"]'); await a.click('[data-sync="disconnect"]'); await a.waitForTimeout(100);
  if ((await a.evaluate(() => window.PPApp.sync)).token || !gists[id]) errors.push("Trennen fehlerhaft");
  step(`Wiederherstellen und Trennen (${apiCalls} API-Aufrufe)`);
} catch (e) { errors.push(e.message); }

await browser.close();
server.close();
if (errors.length) { console.error("FEHLER:\n" + [...new Set(errors)].join("\n")); process.exit(1); }
console.log("OK – Sicherung funktioniert.");
