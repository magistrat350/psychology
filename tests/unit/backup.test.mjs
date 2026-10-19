import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "module";
const BK = createRequire(import.meta.url)("../../js/backup.js");

const DAY = 864e5, now = Date.UTC(2026, 9, 19, 12);
const iso = (ms) => new Date(ms).toISOString();
const withProgress = (backup = {}) => ({ srs: { "q:A1:x": { box: 1 } }, backup });

test("Erinnerung nur mit Lernstand, im eingestellten Abstand, nicht während „Später“", () => {
  assert.equal(BK.hasProgress({ srs: {}, quiz: {}, mix: [] }), false);
  assert.equal(BK.hasProgress({ notes: { A1: "x" } }), true);
  assert.equal(BK.reminderDue({ state: { srs: {} }, days: 7, now }), false, "nichts zu sichern");
  assert.equal(BK.reminderDue({ state: withProgress(), days: 0, now }), false, "ausgeschaltet");
  assert.equal(BK.reminderDue({ state: withProgress(), days: 7, now }), true, "noch nie gesichert");
  assert.equal(BK.reminderDue({ state: withProgress({ last: iso(now - 3 * DAY) }), days: 7, now }), false);
  assert.equal(BK.reminderDue({ state: withProgress({ last: iso(now - 8 * DAY) }), days: 7, now }), true);
  assert.equal(BK.reminderDue({ state: withProgress({ last: iso(now - 8 * DAY), snoozeUntil: iso(now + DAY) }), days: 7, now }), false);
  assert.equal(BK.reminderDue({ state: withProgress({ last: iso(now - 8 * DAY) }), days: 7, now, lastAuto: iso(now - DAY) }), false, "automatische Sicherung zählt");
});

test("Sicherungsdatei: Lernstand plus Angaben, Rückweg ohne Angaben", () => {
  const text = BK.payload({ srs: { a: 1 }, notes: { A1: "n" } }, { savedAt: "2026-10-19T12:00:00Z", version: "2.0.5" });
  const back = BK.parsePayload(text);
  assert.deepEqual(back.state, { srs: { a: 1 }, notes: { A1: "n" } });
  assert.equal(back.meta.version, "2.0.5");
  assert.equal(BK.parsePayload('{"srs":{}}').meta, null, "alte Exporte ohne Angaben");
  assert.throws(() => BK.parsePayload("[1,2]"));
  assert.throws(() => BK.parsePayload("kein json"));
});

test("Neuere Sicherung auf GitHub erkennen", () => {
  assert.equal(BK.remoteNewer("2026-10-19T10:00:05Z", "2026-10-19T10:00:01Z"), true);
  assert.equal(BK.remoteNewer("2026-10-19T10:00:01Z", "2026-10-19T10:00:01Z"), false);
  assert.equal(BK.remoteNewer("2026-10-19T10:00:01Z", ""), true);
  assert.equal(BK.remoteNewer("", "2026-10-19T10:00:01Z"), false);
});

test("Gist-Client: Anfragen, Suche, gekürzte Dateien, Fehler", async () => {
  const calls = [];
  const fake = async (url, opts = {}) => {
    calls.push({ url, method: opts.method || "GET", auth: opts.headers && opts.headers.Authorization, body: opts.body && JSON.parse(opts.body) });
    const json = (status, body) => ({ ok: status < 300, status, json: async () => body, text: async () => JSON.stringify(body) });
    if (url.endsWith("/user")) return json(200, { login: "jd" });
    if (url.includes("/gists?per_page=100")) return json(200, [{ id: "a", files: { "x.txt": {} } }, { id: "b", files: { [BK.GIST_FILE]: {} } }]);
    if (url.endsWith("/gists") && opts.method === "POST") return json(201, { id: "c", updated_at: "t1", html_url: "https://gist.github.com/c" });
    if (url.endsWith("/gists/c") && opts.method === "PATCH") return json(200, { id: "c", updated_at: "t2" });
    if (url.endsWith("/gists/big")) return json(200, { id: "big", files: { [BK.GIST_FILE]: { truncated: true, raw_url: "https://gist.githubusercontent.com/raw/big" } } });
    if (url.startsWith("https://gist.githubusercontent.com/")) return { ok: true, status: 200, text: async () => '{"srs":{"z":1}}' };
    return json(401, { message: "Bad credentials" });
  };
  const c = BK.gistClient({ token: "ghp_x", fetch: fake });
  assert.equal((await c.user()).login, "jd");
  assert.equal(calls[0].auth, "Bearer ghp_x");
  assert.equal((await c.find()).id, "b");
  await c.create("{}");
  assert.equal(calls.at(-1).body.public, false, "geheimer Gist");
  assert.ok(calls.at(-1).body.files[BK.GIST_FILE]);
  assert.equal((await c.update("c", "{}")).updated_at, "t2");
  assert.equal(calls.at(-1).method, "PATCH");
  assert.equal(await c.content(await c.get("big")), '{"srs":{"z":1}}', "große Datei über raw_url");
  const err = await c.get("fremd").catch((e) => e);
  assert.equal(err.status, 401);
  assert.match(BK.errorText(err), /ungültig/);
  assert.match(BK.errorText(new TypeError("Failed to fetch")), /online/);
  assert.match(BK.errorText(Object.assign(new Error(), { status: 404 })), /nicht gefunden/);
});
