/* PPBackup – Sicherung des Lernstands: Erinnerung an die Sicherung als Datei und optionale automatische
 * Sicherung in einem geheimen GitHub-Gist (eigener Zugangsschlüssel, bleibt auf dem Gerät).
 * Browser (window.PPBackup) und Node (require). */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PPBackup = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const DAY = 24 * 3600 * 1000;
  const GIST_FILE = "psychopfad-lernstand.json";
  const API = "https://api.github.com";

  /** Gibt es überhaupt etwas zu sichern? */
  function hasProgress(st) {
    const any = (o) => o && Object.keys(o).length > 0;
    return !!st && (any(st.srs) || any(st.quiz) || any(st.exam) || any(st.notes) || any(st.done) || any(st.read) || any(st.comp) ||
      any(st.reports) || any(st.review) || any(st.trainer) || (st.mix || []).length > 0);
  }
  const daysSince = (iso, now) => (iso ? Math.floor((now - Date.parse(iso)) / DAY) : Infinity);
  /** Erinnerung fällig? days = Abstand in Tagen (0 = aus); eine automatische Sicherung im Abstand zählt mit. */
  function reminderDue({ state, days, now = Date.now(), lastAuto = "" }) {
    if (!days || !hasProgress(state)) return false;
    const b = state.backup || {};
    if (b.snoozeUntil && Date.parse(b.snoozeUntil) > now) return false;
    return Math.min(daysSince(b.last, now), daysSince(lastAuto, now)) >= days;
  }
  /** Inhalt der Sicherungsdatei: der Lernstand plus Angaben zur Sicherung. */
  function payload(state, meta) {
    return JSON.stringify(Object.assign({}, state, { _backup: Object.assign({ app: "PsychoPfad Wien" }, meta) }));
  }
  /** Sicherung wieder in einen Lernstand verwandeln (ohne die Sicherungsangaben). */
  function parsePayload(text) {
    const data = JSON.parse(text);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("Keine gültige Sicherung");
    const meta = data._backup || null;
    delete data._backup;
    return { state: data, meta };
  }
  /** Hat ein anderes Gerät nach unserem letzten Hochladen gesichert? (Zeitstempel von GitHub, ISO-Format) */
  const remoteNewer = (remoteUpdatedAt, lastPush) => !!remoteUpdatedAt && (!lastPush || remoteUpdatedAt > lastPush);

  /** Kleiner Client für die GitHub-Gist-API. Wirft Fehler mit .status. */
  function gistClient({ token, fetch: f }) {
    f = f || (typeof fetch === "function" ? fetch.bind(typeof self !== "undefined" ? self : null) : null);
    async function call(path, opts = {}) {
      const headers = { Accept: "application/vnd.github+json", Authorization: "Bearer " + token };
      if (opts.body) headers["Content-Type"] = "application/json";
      const res = await f(API + path, { method: opts.method || "GET", headers, body: opts.body ? JSON.stringify(opts.body) : undefined, cache: "no-store" });
      if (!res.ok) { const e = new Error("HTTP " + res.status); e.status = res.status; throw e; }
      return res.status === 204 ? null : res.json();
    }
    async function content(gist) {
      const file = gist.files && gist.files[GIST_FILE];
      if (!file) return null;
      if (!file.truncated) return file.content;
      const res = await f(file.raw_url, { cache: "no-store" });   // große Dateien liefert die API gekürzt
      if (!res.ok) { const e = new Error("HTTP " + res.status); e.status = res.status; throw e; }
      return res.text();
    }
    return {
      user: () => call("/user"),
      /** Vorhandene Sicherung dieses Kontos suchen (eigene Gists, erste 100). */
      async find() { const list = await call("/gists?per_page=100"); return (list || []).find((g) => g.files && g.files[GIST_FILE]) || null; },
      create: (text) => call("/gists", { method: "POST", body: { description: "PsychoPfad Wien – Sicherung des Lernstands", public: false, files: { [GIST_FILE]: { content: text } } } }),
      update: (id, text) => call(`/gists/${id}`, { method: "PATCH", body: { files: { [GIST_FILE]: { content: text } } } }),
      get: (id) => call(`/gists/${id}`),
      content
    };
  }
  function errorText(e) {
    if (e && e.status === 401) return "Der Zugangsschlüssel ist ungültig oder abgelaufen.";
    if (e && e.status === 403) return "Zugriff verweigert – hat der Schlüssel die Berechtigung „gist“? Oder das Abfragelimit ist erreicht.";
    if (e && e.status === 404) return "Die Sicherung wurde auf GitHub nicht gefunden (gelöscht?).";
    if (e && e.status) return `GitHub antwortet mit Fehler ${e.status}.`;
    if (e instanceof SyntaxError || (e && /gültige Sicherung/.test(e.message))) return "Die Sicherung ist beschädigt.";
    return "Keine Verbindung zu GitHub. Bist du online?";
  }
  return { GIST_FILE, hasProgress, daysSince, reminderDue, payload, parsePayload, remoteNewer, gistClient, errorText };
});
