import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "module";
const U = createRequire(import.meta.url)("../../js/update.js");

test("Versionen vergleichen", () => {
  assert.equal(U.compare("2.0.17", "2.0.9"), 1);
  assert.equal(U.compare("v2.1.18", "2.0.30"), 1);
  assert.equal(U.compare("2.0.5", "2.0.5"), 0);
  assert.equal(U.compare("2.0", "2.0.0"), 0);
  assert.equal(U.compare("3.0.1", "10.0.0"), -1);
  assert.equal(U.compare("2.0.0-dev", "2.0.0"), -1, "Entwicklungsstand ist älter als die Veröffentlichung");
  assert.throws(() => U.compare("abc", "1.0"));
});

test("isNewer ignoriert ungültige Angaben", () => {
  assert.equal(U.isNewer("2.0.9", "2.0.5"), true);
  assert.equal(U.isNewer("2.0.5", "2.0.5"), false);
  assert.equal(U.isNewer("2.0.4", "2.0.5"), false);
  assert.equal(U.isNewer("2.0.9", "dev"), false);
  assert.equal(U.isNewer("", "2.0.5"), false);
});

test("Prüfintervall", () => {
  const h = 3600 * 1000, now = Date.UTC(2026, 9, 18, 12);
  assert.equal(U.due(undefined, now, 12), true);
  assert.equal(U.due(now - 11 * h, now, 12), false);
  assert.equal(U.due(now - 12 * h, now, 12), true);
  assert.equal(U.due(now + h, now, 12), true, "Uhr zurückgestellt → erneut prüfen");
});

const release = {
  tag_name: "v2.0.9", name: "PsychoPfad Wien 2.0.9", body: "- Neu: A", html_url: "https://github.com/o/r/releases/tag/v2.0.9", published_at: "2026-10-18T10:00:00Z",
  assets: [{ name: "psychopfad-2.0.9.apk", browser_download_url: "https://x/psychopfad-2.0.9.apk", size: 1 },
    { name: "psychopfad.apk", browser_download_url: "https://x/psychopfad.apk", size: 5242880 }]
};

test("Release-Angaben auslesen", () => {
  const i = U.fromRelease(release, "psychopfad.apk");
  assert.equal(i.version, "2.0.9");
  assert.equal(i.apk, "https://x/psychopfad.apk", "bevorzugt die APK mit festem Namen");
  assert.equal(i.size, 5242880);
  assert.equal(U.fromRelease({ tag_name: "v1.0.1", assets: [{ name: "app.apk", browser_download_url: "https://x/app.apk" }] }, "psychopfad.apk").apk, "https://x/app.apk");
  assert.equal(U.fromRelease({ tag_name: "v1.0.1" }, "psychopfad.apk").apk, "");
});

const fakeFetch = (status, body, calls = []) => async (url, opts) => { calls.push({ url, opts }); return { ok: status >= 200 && status < 300, status, json: async () => body }; };

test("Update-Prüfung gegen die GitHub-API", async () => {
  const calls = [];
  const i = await U.check({ repo: "o/r", current: "2.0.5", apkName: "psychopfad.apk", fetch: fakeFetch(200, release, calls) });
  assert.equal(calls[0].url, "https://api.github.com/repos/o/r/releases/latest");
  assert.equal(calls[0].opts.cache, "no-store");
  assert.equal(i.newer, true);
  assert.equal((await U.check({ repo: "o/r", current: "2.0.9", apkName: "psychopfad.apk", fetch: fakeFetch(200, release) })).newer, false);
});

test("Fehler werden verständlich gemeldet", async () => {
  const err = async (status, body) => { try { await U.check({ repo: "o/r", current: "2.0.5", fetch: fakeFetch(status, body) }); } catch (e) { return U.errorText(e); } return "kein Fehler"; };
  assert.match(await err(404, {}), /Noch keine veröffentlichte Version/);
  assert.match(await err(403, {}), /Abfragelimit/);
  assert.match(await err(500, {}), /Fehler 500/);
  assert.match(await err(200, { tag_name: "nightly" }), /keine gültige Versionsnummer/);
  let offline;
  try { await U.check({ repo: "o/r", current: "1.0.0", fetch: async () => { throw new TypeError("Failed to fetch"); } }); } catch (e) { offline = U.errorText(e); }
  assert.match(offline, /Bist du online/);
});
