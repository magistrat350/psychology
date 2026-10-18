/* PPUpdate – Versionsvergleich und Update-Prüfung über GitHub Releases.
 * Versionen: <major>.<minor>.<build>, z. B. 2.0.17 (Tag v2.0.17). Browser (window.PPUpdate) und Node (require). */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.PPUpdate = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";
  const API = "https://api.github.com/repos/";

  /** "v2.0.17" → { nums: [2,0,17], pre: false }; "2.0.0-dev" → pre: true; ungültig → null */
  function parse(v) {
    const m = String(v == null ? "" : v).trim().match(/^v?(\d+(?:\.\d+)*)(?:([-+])(.*))?$/i);
    if (!m) return null;
    return { nums: m[1].split(".").map(Number), pre: m[2] === "-" };
  }
  /** -1, 0 oder 1; Vorabversionen (2.0.0-dev) sind älter als die zugehörige Version (2.0.0). */
  function compare(a, b) {
    const pa = parse(a), pb = parse(b);
    if (!pa || !pb) throw new Error(`Ungültige Version: ${!pa ? a : b}`);
    for (let i = 0; i < Math.max(pa.nums.length, pb.nums.length); i++) {
      const d = (pa.nums[i] || 0) - (pb.nums[i] || 0);
      if (d) return d > 0 ? 1 : -1;
    }
    return pa.pre === pb.pre ? 0 : pa.pre ? -1 : 1;
  }
  function isNewer(latest, current) {
    if (!parse(latest) || !parse(current)) return false;
    return compare(latest, current) > 0;
  }
  /** Ist die letzte automatische Prüfung länger als `hours` her? */
  function due(lastChecked, now, hours) {
    return !lastChecked || now < lastChecked || now - lastChecked >= hours * 3600 * 1000;
  }
  /** Relevante Angaben aus der Antwort von /releases/latest. */
  function fromRelease(rel, apkName) {
    const tag = String(rel.tag_name || "");
    const assets = rel.assets || [];
    const apk = assets.find((a) => a.name === apkName) || assets.find((a) => /\.apk$/i.test(a.name || ""));
    return {
      version: tag.replace(/^v/i, ""), tag, name: rel.name || tag, notes: rel.body || "",
      url: rel.html_url || "", published: rel.published_at || "",
      apk: apk ? apk.browser_download_url : "", size: apk ? apk.size || 0 : 0
    };
  }
  /** Fragt die neueste Veröffentlichung ab. Wirft bei Netzfehlern; `err.status` enthält den HTTP-Status. */
  async function check({ repo, current, apkName, fetch: f }) {
    f = f || (typeof fetch === "function" ? fetch : null);
    const res = await f(API + repo + "/releases/latest", { headers: { Accept: "application/vnd.github+json" }, cache: "no-store" });
    if (!res.ok) { const e = new Error("HTTP " + res.status); e.status = res.status; throw e; }
    const info = fromRelease(await res.json(), apkName);
    if (!parse(info.version)) { const e = new Error("Release ohne gültige Versionsnummer: " + info.tag); e.invalid = true; throw e; }
    info.newer = isNewer(info.version, current);
    return info;
  }
  /** Verständliche Fehlermeldung für die Oberfläche. */
  function errorText(e) {
    if (e && e.status === 404) return "Noch keine veröffentlichte Version gefunden.";
    if (e && (e.status === 403 || e.status === 429)) return "GitHub-Abfragelimit erreicht – bitte später erneut versuchen.";
    if (e && e.status) return `GitHub antwortet mit Fehler ${e.status}.`;
    if (e && e.invalid) return "Die neueste Veröffentlichung hat keine gültige Versionsnummer.";
    return "Keine Verbindung zu GitHub. Bist du online?";
  }
  return { parse, compare, isNewer, due, fromRelease, check, errorText };
});
