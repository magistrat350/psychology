/* PsychoPfad Wien – Single-Page-App ohne Build-Schritt.
 * Routen (Hash): #/  #/plan  #/modul/<ID>/<tab>  #/wiederholen  #/verlauf  #/mischquiz  #/rechentrainer[/<gen>[/<seed>]]
 *                #/datensaetze  #/anki  #/pruefmodus[/<bereich>]  #/bibliothek  #/ressourcen  #/podcasts  #/karriere
 *                #/glossar  #/fortschritt  #/einstellungen  #/suche/<begriff>
 * Benötigt: data/*.js (inkl. figures.js), js/figures.js, js/version.js, js/update.js, js/backup.js, js/stats.js, js/trainer.js, js/srs.js, js/sources.js, js/review.js, js/anki.js
 * In der Android-App zusätzlich js/capacitor.js (vom Build eingebunden). */
(function () {
  "use strict";

  const STORE_KEY = "psychopfad_wien_v1";
  const S = window.PPStats, T = window.PPTrainer, R = window.PPSrs, A = window.PPAnki, SRC = window.PPSources, RV = window.PPReview, FIG = window.PPFigures;
  const $app = document.getElementById("app");
  const $side = document.getElementById("sidebar");
  const IN_ARTIFACT = !!(window.claude && typeof window.claude.use === "function");
  // Android-App: Capacitor stellt die nativen Plugins bereit (js/capacitor.js wird nur in den APK-Build eingebunden)
  const CAP = window.Capacitor;
  const IS_NATIVE = !!(CAP && typeof CAP.isNativePlatform === "function" && CAP.isNativePlatform() && typeof CAP.registerPlugin === "function");
  const native = IS_NATIVE ? { fs: CAP.registerPlugin("Filesystem"), share: CAP.registerPlugin("Share"), app: CAP.registerPlugin("App"), notif: CAP.registerPlugin("LocalNotifications") } : null;
  const V = window.PPVersion || { version: "dev", build: 0, commit: "", date: "", repo: PP.meta.repo };
  const U = window.PPUpdate, BK = window.PPBackup;

  // ---------- Zustand ----------
  const emptyState = () => ({
    comp: {}, quiz: {}, exam: {}, notes: {}, done: {}, cards: {}, read: {},
    srs: {}, srsCfg: { newPerDay: 15, modules: null, kinds: ["card", "quiz"], retention: 0.9, introduced: { day: "", count: 0, mods: {} } },
    reports: {}, verify: {}, review: {}, trainer: {}, mix: [], log: {}, exams: [], backup: { last: "", snoozeUntil: "" },
    settings: { theme: "auto", libTemplates: {}, reviewer: "", backupDays: 7, reminder: { on: false, time: "18:00" } }
  });
  let state = load();
  // Automatische Sicherung im GitHub-Gist: Zugangsschlüssel und Abgleich-Stand getrennt vom Lernstand (nicht im Export)
  const SYNC_KEY = "psychopfad_sync";
  let sync = loadSync(), syncTimer = null, syncDirtyFlag = false, syncBusy = false, syncUi = { busy: "", msg: "" };
  function loadSync() { try { return JSON.parse(localStorage.getItem(SYNC_KEY)) || {}; } catch (e) { return {}; } }
  function saveSync() { try { localStorage.setItem(SYNC_KEY, JSON.stringify(sync)); } catch (e) { /* privater Modus */ } }
  function load() {
    let st;
    try { const raw = localStorage.getItem(STORE_KEY); st = raw ? JSON.parse(raw) : {}; } catch (e) { st = {}; }
    const base = emptyState();
    st = Object.assign(base, st);
    st.srsCfg = Object.assign(emptyState().srsCfg, st.srsCfg || {});
    st.settings = Object.assign(emptyState().settings, st.settings || {});
    st.backup = Object.assign(emptyState().backup, st.backup || {});
    if (!st.log || typeof st.log !== "object" || Array.isArray(st.log)) st.log = {};
    if (!Array.isArray(st.exams)) st.exams = [];
    if (st.cards && Object.keys(st.cards).length && !st.cardsMigrated) { R.migrateCards(st.cards, PP.modules, st.srs, R.today()); st.cardsMigrated = true; }
    return st;
  }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* privater Modus */ } syncDirty(); }

  // ---------- Hilfen ----------
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function rich(s) {
    const blocks = esc(s).split(/\n\s*\n/);
    return blocks.map((b) => {
      const lines = b.split("\n");
      if (lines.every((l) => /^\s*- /.test(l))) return "<ul>" + lines.map((l) => "<li>" + inline(l.replace(/^\s*- /, "")) + "</li>").join("") + "</ul>";
      return "<p>" + inline(b.replace(/\n/g, "<br>")) + "</p>";
    }).join("");
  }
  const inline = (s) => s.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/\*(.+?)\*/g, "<i>$1</i>");
  const byId = (id) => PP.modules.find((m) => m.id === id);
  const groupOf = (gid) => PP.groups.find((g) => g.id === gid);
  const modulesOf = (gid) => PP.modules.filter((m) => m.group === gid);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pct = (x) => Math.round(x * 100);
  const today = () => R.today();
  function toast(msg) { const t = document.getElementById("toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2800); }
  function copyText(txt, msg) {
    const fail = "Kopieren nicht möglich – bitte manuell markieren.";
    // Ersatzweg für WebViews und ältere Browser ohne Clipboard-API
    const legacy = () => {
      try {
        const ta = document.createElement("textarea");
        ta.value = txt; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        const ok = document.execCommand("copy"); ta.remove(); toast(ok ? msg : fail);
      } catch (e) { toast(fail); }
    };
    try { navigator.clipboard.writeText(txt).then(() => toast(msg), legacy); } catch (e) { legacy(); }
  }
  function link(url, text) { return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>`; }
  function grade(p) {
    if (p >= 0.875) return { n: 1, t: "Sehr gut" };
    if (p >= 0.75) return { n: 2, t: "Gut" };
    if (p >= 0.625) return { n: 3, t: "Befriedigend" };
    if (p >= 0.5) return { n: 4, t: "Genügend" };
    return { n: 5, t: "Nicht genügend" };
  }
  const modPill = (id) => `<a class="pill" href="#/modul/${esc(id)}">${esc(id)}</a>`;

  // ---------- Plattform: veröffentlichte Seite (Datenbank, Downloads) ----------
  const cloud = { db: null, dl: null };
  function initCloud() {
    if (!IN_ARTIFACT) return;
    window.claude.use("downloads").then((d) => { cloud.dl = d; }).catch(() => {});
    window.claude.use("db").then((db) => { cloud.db = db; if (db) pullCloud(); }).catch(() => {});
  }
  async function pullCloud() {
    try {
      const snap = await cloud.db.collection("reports").get();
      snap.docs.forEach((d) => { const r = d.data(); if (r && !state.reports[d.id]) state.reports[d.id] = Object.assign({}, r, { synced: true }); });
      const v = await cloud.db.doc("verify/checklist").get();
      if (v.exists) { const items = (v.data() || {}).items || {}; Object.entries(items).forEach(([k, val]) => { if (!state.verify[k]) state.verify[k] = val; }); }
      const rv = await cloud.db.doc("review/marks").get();
      if (rv.exists) { const items = (rv.data() || {}).items || {}; Object.entries(items).forEach(([k, val]) => { if (!state.review[k]) state.review[k] = val; }); }
      save();
      if (location.hash.startsWith("#/pruefmodus")) keep(route);
    } catch (e) { /* offline oder nicht freigegeben – lokal weiterarbeiten */ }
  }
  async function pushReport(r) {
    if (!cloud.db) return;
    try { const body = Object.assign({}, r); delete body.synced; await cloud.db.collection("reports").doc(r.id).set(body); r.synced = true; save(); } catch (e) { /* bleibt lokal */ }
  }
  /** Schreibt ein Dokument verzögert (Eingaben werden gebündelt, höchstens ein Schreibvorgang gleichzeitig). */
  function docPusher(path, items) {
    let timer = null, writing = false;
    const push = () => {
      if (!cloud.db) return;
      clearTimeout(timer);
      timer = setTimeout(async () => {
        if (writing) return push();
        writing = true;
        try { await cloud.db.doc(path).set({ items: items(), updatedAt: new Date().toISOString() }); } catch (e) { /* lokal gespeichert */ }
        writing = false;
      }, 1200);
    };
    return push;
  }
  const pushVerify = docPusher("verify/checklist", () => state.verify);
  const pushReview = docPusher("review/marks", () => state.review);
  /** Datei anbieten: lokal als Download, auf der veröffentlichten Seite über die Speicherfunktion des Viewers,
   *  in der Android-App über das Teilen-Menü (WebViews können keine Blob-Downloads).
   *  Ergebnis: Promise<boolean> – true, wenn die Datei (vermutlich) gespeichert bzw. geteilt wurde. */
  function saveFile(filename, data, mime) {
    if (native) {
      return native.fs.writeFile({ path: filename, data, directory: "CACHE", encoding: "utf8" })
        .then((r) => native.share.share({ title: filename, files: [r.uri], dialogTitle: "Datei speichern oder teilen" }))
        .then(() => true, (e) => { if (!/cancel/i.test(String(e && e.message))) copyText(data, "Teilen nicht möglich – Inhalt stattdessen in die Zwischenablage kopiert."); return false; });
    }
    if (cloud.dl) {
      return cloud.dl.save({ filename, data }).then(() => { toast(`„${filename}“ gespeichert.`); return true; }, (e) => {
        if (e && e.code === "declined") toast("Speichern abgebrochen.");
        else if (e && e.code === "rate_limited") toast("Bitte kurz warten und erneut versuchen.");
        else copyText(data, "Speichern nicht möglich – Inhalt stattdessen in die Zwischenablage kopiert.");
        return false;
      });
    }
    if (IN_ARTIFACT) { copyText(data, "Datei-Speichern ist hier nicht verfügbar – Inhalt in die Zwischenablage kopiert."); return Promise.resolve(false); }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([data], { type: mime || "text/plain;charset=utf-8" }));
    a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    return Promise.resolve(true);
  }

  // ---------- Version & Updates (GitHub Releases) ----------
  // Die Android-App prüft beim Start (höchstens alle 12 Stunden) die neueste Veröffentlichung; die Web-App
  // aktualisiert sich über den Service Worker und meldet, wenn eine neue Version geladen wurde.
  const UPD_KEY = "psychopfad_update", APK_NAME = "psychopfad.apk", AUTO_CHECK_HOURS = 12;
  let upd = loadUpd(), updUi = { busy: false, error: "" }, swUpdated = false;
  function loadUpd() { try { return JSON.parse(localStorage.getItem(UPD_KEY)) || {}; } catch (e) { return {}; } }
  function saveUpd() { try { localStorage.setItem(UPD_KEY, JSON.stringify(upd)); } catch (e) { /* privater Modus */ } }
  const releasesUrl = () => `https://github.com/${V.repo}/releases`;
  const apkLatestUrl = () => `${releasesUrl()}/latest/download/${APK_NAME}`;
  // Nur gebaute Versionen (Build-Nummer > 0) vergleichen sich mit den Releases; der Entwicklungsstand nicht
  const updateAvailable = () => !!(V.build && upd.info && U.isNewer(upd.info.version, V.version));
  function platformName() { return IS_NATIVE ? "Android-App" : IN_ARTIFACT ? "Claude-Artifact" : location.protocol === "file:" ? "Offline-Datei" : "Web-App"; }
  async function checkForUpdate() {
    upd.info = await U.check({ repo: V.repo, current: V.version, apkName: APK_NAME });
    upd.checked = Date.now(); saveUpd();
    return upd.info;
  }
  function autoUpdateCheck() {
    if (!IS_NATIVE || !V.build) return;
    if (!U.due(upd.checked, Date.now(), AUTO_CHECK_HOURS)) { renderBanner(); return; }
    checkForUpdate().then(() => { renderBanner(); renderSidebar(); }, () => { /* offline – beim nächsten Start erneut */ });
  }
  function renderBanner() {
    const bar = document.getElementById("updateBanner"); if (!bar) return;
    const i = upd.info;
    if (swUpdated) {
      bar.innerHTML = `<span>🆕 Eine neue Version wurde geladen.</span><button class="btn small primary" data-upd="reload">Neu laden</button>`;
    } else if (IS_NATIVE && updateAvailable() && upd.dismissed !== i.version) {
      bar.innerHTML = `<span>🆕 Version <b>${esc(i.version)}</b> ist verfügbar.</span>
        <a class="btn small primary" href="${esc(i.apk || i.url)}" target="_blank" rel="noopener noreferrer">Herunterladen</a>
        <a class="btn small" href="#/einstellungen">Was ist neu?</a><button class="icon-btn" data-upd="dismiss" aria-label="Hinweis ausblenden" title="Ausblenden">✕</button>`;
    } else if (sync.conflict) {
      bar.innerHTML = `<span>☁️ Auf GitHub liegt eine neuere Sicherung (${esc(fmtTime(sync.conflict.updatedAt))}) – vermutlich von einem anderen Gerät.</span>
        <button class="btn small primary" data-sync="take">Übernehmen</button><button class="btn small" data-sync="keep">Dieses Gerät behalten</button>`;
    } else if (backupDue()) {
      const n = BK.daysSince(state.backup.last, Date.now());
      bar.innerHTML = `<span>💾 Dein Lernstand ist ${state.backup.last ? `seit ${n} Tagen nicht` : "noch nie"} gesichert worden. Er liegt nur auf diesem Gerät.</span>
        <button class="btn small primary" data-backup="now">Jetzt sichern</button><button class="btn small" data-backup="later">Später</button>`;
    } else { bar.hidden = true; bar.innerHTML = ""; return; }
    bar.hidden = false;
  }
  function updateResult() {
    if (updUi.busy) return `<p class="muted">Suche nach Updates …</p>`;
    if (updUi.error) return `<p class="notice small">${esc(updUi.error)}</p>`;
    const i = upd.info; if (!i) return "";
    const when = upd.checked ? new Date(upd.checked).toLocaleString("de-AT", { dateStyle: "short", timeStyle: "short" }) : "";
    const pub = i.published ? ` vom ${esc(i.published.slice(0, 10).split("-").reverse().join("."))}` : "";
    const notes = i.notes ? `<details ${updateAvailable() ? "open" : ""}><summary>Was ist neu in ${esc(i.version)}?</summary>${rich(i.notes)}</details>` : "";
    if (!updateAvailable()) {
      const txt = V.build ? `Du hast die neueste Version (${esc(i.version)}${pub}).` : `Neueste veröffentlichte Version: <b>${esc(i.version)}</b>${pub}.`;
      return `<p>✓ ${txt} <span class="small muted">Geprüft ${esc(when)}</span></p>${notes}`;
    }
    const action = IS_NATIVE
      ? `<a class="btn primary" href="${esc(i.apk || i.url)}" target="_blank" rel="noopener noreferrer">Version ${esc(i.version)} herunterladen${i.size ? ` (${(i.size / 1048576).toFixed(1).replace(".", ",")} MB)` : ""}</a>`
      : /^https?:$/.test(location.protocol) ? `<button class="btn primary" data-upd="reload">Seite neu laden</button>`
      : `<a class="btn primary" href="${esc(i.url || releasesUrl())}" target="_blank" rel="noopener noreferrer">Zur Veröffentlichung</a>`;
    return `<p>🆕 Neue Version <b>${esc(i.version)}</b>${pub} verfügbar. <span class="small muted">Geprüft ${esc(when)}</span></p><div class="btn-row">${action}</div>${notes}`;
  }
  function versionCard() {
    const commit = V.commit ? `Commit <a href="https://github.com/${esc(V.repo)}/commit/${esc(V.commit)}" target="_blank" rel="noopener noreferrer"><code>${esc(V.commit)}</code></a>` : "";
    const built = V.date ? `gebaut am ${esc(V.date.slice(0, 10).split("-").reverse().join("."))}` : "";
    const how = IS_NATIVE
      ? `Die App sucht beim Start (höchstens alle ${AUTO_CHECK_HOURS} Stunden) nach einer neuen Version und zeigt dann oben einen Hinweis. Update herunterladen, öffnen und installieren – dein Lernstand bleibt erhalten.`
      : `Die Web-App lädt neue Versionen automatisch und zeigt oben „Neu laden“ an. Für Android gibt es die App auch als APK – sie bietet Updates selbst an.`;
    return `<div class="card" id="versionCard"><h3>App-Version & Updates</h3>
      <p>Installiert: <b>${V.version === "dev" ? "Entwicklungsstand" : esc(V.version)}</b>${V.build ? ` (Build ${V.build})` : ""} · ${esc(platformName())}</p>
      <p class="small muted">${[commit, built].filter(Boolean).join(" · ") || "Direkt aus dem Repository geöffnet – Versionsnummern erhalten nur gebaute Versionen."}</p>
      <div id="updResult">${updateResult()}</div>
      <div class="btn-row">${IN_ARTIFACT ? "" : `<button class="btn${updateAvailable() ? "" : " primary"}" data-upd="check">Nach Updates suchen</button>`}<a class="btn" href="${esc(releasesUrl())}" target="_blank" rel="noopener noreferrer">Alle Versionen</a>${IS_NATIVE ? "" : `<a class="btn" href="${esc(apkLatestUrl())}" target="_blank" rel="noopener noreferrer">Android-App (APK)</a>`}</div>
      <p class="small muted">${how}</p></div>`;
  }

  // ---------- Sicherung des Lernstands ----------
  // 1) Erinnerung: nach einstellbarer Zeit ohne Sicherung oben ein Hinweis mit „Jetzt sichern“ (Datei bzw. Teilen-Menü).
  // 2) Optional automatisch in einem geheimen GitHub-Gist: hochladen kurz nach Änderungen und beim Verlassen der App;
  //    hat ein anderes Gerät inzwischen gesichert, wird nicht überschrieben, sondern nachgefragt.
  const SYNC_DELAY = 30000;
  const fmtTime = (iso) => (iso ? new Date(iso).toLocaleString("de-AT", { dateStyle: "short", timeStyle: "short" }) : "–");
  const backupMeta = () => ({ savedAt: new Date().toISOString(), version: V.version, device: platformName() });
  const syncOn = () => !!(sync.token && sync.gistId) && !IN_ARTIFACT;
  const syncClient = () => BK.gistClient({ token: sync.token });
  function backupDue() { return !IN_ARTIFACT && BK.reminderDue({ state, days: +state.settings.backupDays, lastAuto: syncOn() && !sync.error ? sync.lastPush : "" }); }
  function backupNow() {
    return saveFile(`psychopfad-lernstand-${today()}.json`, BK.payload(state, backupMeta()), "application/json").then((ok) => {
      if (!ok) return;
      state.backup.last = new Date().toISOString(); state.backup.snoozeUntil = ""; save();
      renderBanner(); if (location.hash.startsWith("#/einstellungen") || location.hash.startsWith("#/fortschritt")) keep(route);
    });
  }
  function syncDirty() {
    if (!syncOn() || sync.conflict) return;
    syncDirtyFlag = true; clearTimeout(syncTimer); syncTimer = setTimeout(() => syncPush(), SYNC_DELAY);
  }
  function syncRefresh() { saveSync(); renderBanner(); if (location.hash.startsWith("#/einstellungen")) keep(route); }
  function setConflict(gist) { sync.conflict = { updatedAt: gist.updated_at }; clearTimeout(syncTimer); syncRefresh(); }
  /** Hochladen. force: auch ohne Änderungen und trotz neuerer Sicherung auf GitHub (Konflikt „dieses Gerät behalten“). */
  async function syncPush(force) {
    if (!syncOn() || syncBusy || (sync.conflict && !force) || (!force && !syncDirtyFlag)) return;
    syncBusy = true; syncDirtyFlag = false; clearTimeout(syncTimer);
    try {
      const c = syncClient();
      if (!force) { const g = await c.get(sync.gistId); if (BK.remoteNewer(g.updated_at, sync.lastPush)) { syncBusy = false; setConflict(g); return; } }
      const res = await c.update(sync.gistId, BK.payload(state, backupMeta()));
      sync.lastPush = res.updated_at; sync.conflict = null; sync.error = "";
    } catch (e) { sync.error = BK.errorText(e); syncDirtyFlag = true; }
    syncBusy = false; syncRefresh();
  }
  /** Sicherung von GitHub in dieses Gerät übernehmen. */
  async function syncRestore() {
    const c = syncClient(), g = await c.get(sync.gistId), text = await c.content(g);
    if (!text) { const e = new Error("leer"); e.status = 404; throw e; }
    const { state: st } = BK.parsePayload(text);
    applyState(st);
    clearTimeout(syncTimer); syncDirtyFlag = false;
    sync.lastPush = g.updated_at; sync.conflict = null; sync.error = ""; syncRefresh();
  }
  async function syncConnect(token) {
    sync = { token };
    const c = syncClient();
    await c.user();   // prüft den Schlüssel
    const found = await c.find();
    if (found) {
      sync.gistId = found.id; sync.gistUrl = found.html_url;
      if (BK.hasProgress(state)) setConflict(found); else await syncRestore();
    } else {
      const g = await c.create(BK.payload(state, backupMeta()));
      sync.gistId = g.id; sync.gistUrl = g.html_url; sync.lastPush = g.updated_at;
    }
    syncRefresh();
  }
  function syncStartup() {
    if (!syncOn()) return;
    syncClient().get(sync.gistId).then((g) => { sync.error = ""; if (BK.remoteNewer(g.updated_at, sync.lastPush)) setConflict(g); else saveSync(); },
      (e) => { sync.error = BK.errorText(e); saveSync(); });
  }
  function runSync(label, fn) {
    syncUi = { busy: label, msg: "" }; keep(route);
    return fn().then(() => { syncUi = { busy: "", msg: "" }; }, (e) => { syncUi = { busy: "", msg: BK.errorText(e) }; })
      .then(() => { renderBanner(); if (location.hash.startsWith("#/einstellungen")) keep(route); });
  }
  // ---------- Tägliche Erinnerung (nur Android-App) ----------
  // Geplant werden die nächsten 7 Tage mit der erwarteten Zahl fälliger Karten; bei jedem Start und beim Verlassen
  // der App wird neu geplant, damit die Zahlen stimmen. Ein Tipp auf die Benachrichtigung öffnet die Wiederholung.
  // Nicht exakt (isExactNotification: false): sonst öffnet das Plugin unter Android 12+ die Einstellung
  // „Wecker & Erinnerungen“ – für eine tägliche Erinnerung reicht die ungefähre Uhrzeit.
  const REM_IDS = [1001, 1002, 1003, 1004, 1005, 1006, 1007];
  let remUi = "";
  function reminderPlan(now = new Date()) {
    const r = state.settings.reminder || {}, [hh, mm] = String(r.time || "18:00").split(":").map(Number), d = today();
    const fc = R.forecast(ITEMS, state.srs, d, 7), freshToday = srsQueue().fresh.length, next = upcomingExams()[0], out = [];
    for (let i = 0; i < 7; i++) {
      const day = R.addDays(d, i), at = parseDay(day); at.setHours(hh || 0, mm || 0, 0, 0);
      if (at <= now) continue;
      const due = fc[i], fresh = i === 0 ? freshToday : state.srsCfg.newPerDay;
      if (i === 0 && !due && isActive(d)) continue; // heute schon gelernt und nichts mehr fällig
      let body = due ? `${due} ${due === 1 ? "Karte" : "Karten"} fällig` : fresh ? `Nichts fällig – ${fresh} neue Karten warten` : "Zeit für eine kurze Runde";
      if (next) { const left = R.daysBetween(day, next.date); if (left >= 0 && left <= 21) body += ` · ${examTitle(next)} ${left === 0 ? "heute" : `in ${left} ${left === 1 ? "Tag" : "Tagen"}`}`; }
      out.push({ id: REM_IDS[i], title: "PsychoPfad – Wiederholen", body, schedule: { at, allowWhileIdle: true }, isExactNotification: false, channelId: "erinnerung", extra: { route: "#/wiederholen" } });
    }
    return out;
  }
  async function scheduleReminders() {
    if (!native || !native.notif) return;
    try {
      await native.notif.cancel({ notifications: REM_IDS.map((id) => ({ id })) });
      if (!state.settings.reminder.on || (await native.notif.checkPermissions()).display !== "granted") return;
      const list = reminderPlan(); if (list.length) await native.notif.schedule({ notifications: list });
      return "";
    } catch (e) { return (e && e.message) || String(e); } // Erinnerungen sind Komfort – Fehler nur melden, nicht stören
  }
  async function setReminder(on) {
    try {
      if (on) {
        let p = await native.notif.checkPermissions();
        if (p.display !== "granted") p = await native.notif.requestPermissions();
        if (p.display !== "granted") {
          state.settings.reminder.on = false; save();
          remUi = "Benachrichtigungen sind nicht erlaubt. Gib sie in den Android-Einstellungen frei (Apps › PsychoPfad › Benachrichtigungen) und schalte die Erinnerung dann erneut ein.";
          keep(route); return;
        }
      }
      state.settings.reminder.on = on; save();
      const err = await scheduleReminders();
      remUi = err ? "Erinnerung konnte nicht geplant werden: " + err : on ? "Erinnerung ist eingeschaltet." : "Erinnerung ist ausgeschaltet.";
    } catch (e) { remUi = "Erinnerung konnte nicht eingerichtet werden: " + (e && e.message ? e.message : e); }
    keep(route);
  }
  function reminderCard() {
    const r = state.settings.reminder;
    if (!IS_NATIVE) return `<div class="card"><h3>Tägliche Erinnerung</h3><p class="small muted">In der Android-App erinnert dich PsychoPfad auf Wunsch täglich an fällige Wiederholungen – etwa „14 Karten fällig · B1 in 5 Tagen“.</p></div>`;
    return `<div class="card" id="reminderCard"><h3>Tägliche Erinnerung</h3>
      <div class="form-row"><label><input type="checkbox" id="remOn" ${r.on ? "checked" : ""}> täglich erinnern</label><label>um <input type="time" id="remTime" value="${esc(r.time || "18:00")}"></label></div>
      <p class="small muted" id="remMsg">${esc(remUi || "Die Benachrichtigung nennt die fälligen Karten und den nächsten Prüfungstermin; ein Tipp darauf öffnet die Wiederholung. Hast du an dem Tag schon alles erledigt, bleibt sie aus.")}</p></div>`;
  }
  function backupCard() {
    const days = +state.settings.backupDays;
    let h = `<div class="card" id="backupCard"><h3>Sicherung des Lernstands</h3>
      <p>Dein Lernstand liegt nur auf diesem Gerät. Bei Deinstallation, Gerätewechsel oder gelöschten Browserdaten ist er sonst weg.</p>
      <p class="small">Letzte Sicherung als Datei: <b>${state.backup.last ? esc(fmtTime(state.backup.last)) : "noch keine"}</b></p>
      <div class="form-row"><label for="backupDays">An die Sicherung erinnern</label><select id="backupDays">${[[0, "nie"], [7, "nach 7 Tagen"], [14, "nach 14 Tagen"], [30, "nach 30 Tagen"]].map(([v, l]) => `<option value="${v}" ${days === v ? "selected" : ""}>${l}</option>`).join("")}</select></div>
      <div class="btn-row"><button class="btn primary" data-backup="now">Jetzt als Datei sichern</button><a class="btn" href="#/fortschritt">Sicherung laden</a></div>
      <p class="small muted">${IS_NATIVE ? "Die Datei geht ins Teilen-Menü – z. B. „In Drive speichern“ oder in die Dateien-App." : "Die Datei landet im Download-Ordner."} Laden lässt sie sich unter <a href="#/fortschritt">Fortschritt</a>.</p>`;
    if (IN_ARTIFACT) return h + `</div>`;
    h += `<h4>Automatisch sichern in einem GitHub-Gist (optional)</h4>`;
    if (!syncOn()) {
      h += `<p class="small">Die App lädt den Lernstand dann kurz nach Änderungen in einen <b>geheimen Gist</b> deines GitHub-Kontos und gleicht ihn zwischen Geräten ab.
          Geheime Gists sind nicht gelistet, aber für alle lesbar, die den Link kennen – deine Notizen stehen mit drin. Der Zugangsschlüssel bleibt nur auf diesem Gerät.</p>
        <ol class="small"><li><a href="https://github.com/settings/tokens/new?scopes=gist&amp;description=PsychoPfad%20Sicherung" target="_blank" rel="noopener noreferrer">Zugangsschlüssel auf GitHub erstellen</a> (klassischer Token, nur Berechtigung „gist“).</li><li>Schlüssel hier einfügen und verbinden. Auf weiteren Geräten denselben Schlüssel verwenden.</li></ol>
        <div class="form-row"><label for="syncToken">Zugangsschlüssel</label><input type="password" id="syncToken" autocomplete="off" spellcheck="false" placeholder="ghp_…"></div>
        <div class="btn-row"><button class="btn" data-sync="connect" ${syncUi.busy ? "disabled" : ""}>${syncUi.busy === "connect" ? "Verbinde …" : "Verbinden"}</button></div>`;
    } else {
      h += `<p class="small">Verbunden – <a href="${esc(sync.gistUrl || "https://gist.github.com/")}" target="_blank" rel="noopener noreferrer">Sicherung auf GitHub</a> · zuletzt hochgeladen: <b>${esc(fmtTime(sync.lastPush))}</b>${syncDirtyFlag ? " · Änderungen werden gleich hochgeladen" : ""}</p>
        ${sync.error ? `<p class="notice small">${esc(sync.error)}</p>` : ""}
        <div class="btn-row"><button class="btn" data-sync="push" ${syncUi.busy ? "disabled" : ""}>${syncUi.busy === "push" ? "Lade hoch …" : "Jetzt hochladen"}</button><button class="btn" data-sync="restore" ${syncUi.busy ? "disabled" : ""}>Von GitHub wiederherstellen</button><button class="btn" data-sync="disconnect">Trennen</button></div>`;
    }
    if (syncUi.msg) h += `<p class="notice small">${esc(syncUi.msg)}</p>`;
    return h + `<p class="small muted">Ob Android den Lernstand zusätzlich über die Google-Sicherung mitnimmt, hängt von den Geräteeinstellungen ab – verlassen sollte man sich darauf nicht.</p></div>`;
  }

  // ---------- Fortschritt ----------
  function compScore(m) {
    const c = state.comp[m.id] || {}, n = (m.competencies || []).length;
    if (!n) return 0;
    let s = 0; for (let i = 0; i < n; i++) s += (c[i] || 0) / 3;
    return s / n;
  }
  function moduleProgress(m) {
    if (state.done[m.id]) return 1;
    const q = state.quiz[m.id] ? state.quiz[m.id].best : 0, e = state.exam[m.id] ? state.exam[m.id].best : 0;
    return 0.4 * compScore(m) + 0.3 * q + 0.3 * e;
  }
  function ectsDone() { return Math.min(PP.meta.ects, PP.modules.filter((m) => state.done[m.id]).reduce((s, m) => s + (m.ects || 0), 0)); }

  // ---------- Wiederholung (modulübergreifend) ----------
  const ITEMS = R.collect(PP.modules);
  const ITEM = new Map(ITEMS.map((i) => [i.id, i]));
  function introducedToday() { const c = state.srsCfg.introduced; return c && c.day === today() ? c.count : 0; }
  function srsQueue() {
    return R.buildQueue(ITEMS, state.srs, today(), { newLimit: state.srsCfg.newPerDay, introducedToday: introducedToday(), newModules: state.srsCfg.modules, kinds: state.srsCfg.kinds });
  }
  const retention = () => state.srsCfg.retention || R.RETENTION;
  /** Bewertung 1–4 (nochmal, schwer, gut, leicht) bzw. true/false; FSRS berechnet Stabilität, Schwierigkeit und nächsten Termin. */
  function grade_srs(id, grade) {
    const isNew = !state.srs[id];
    state.srs[id] = R.review(state.srs[id], grade, today(), { retention: retention() });
    if (isNew) {
      const d = today(), c = state.srsCfg.introduced, same = c && c.day === d, mod = (ITEM.get(id) || {}).mod;
      const mods = Object.assign({}, same && c.mods ? c.mods : {}); if (mod) mods[mod] = (mods[mod] || 0) + 1;
      state.srsCfg.introduced = { day: d, count: (same ? c.count : 0) + 1, mods };
    }
    logActivity("rev", grade !== false && grade !== 1);
    save();
  }
  function markWrong(modId, q) { const id = R.quizId(modId, q); state.srs[id] = R.markWrong(state.srs[id], today(), { retention: retention() }); save(); }
  function dueCount() { return ITEMS.filter((it) => R.isDue(state.srs[it.id], today())).length; }
  const GRADES = [[1, "Nochmal"], [2, "Schwer"], [3, "Gut"], [4, "Leicht"]];
  function fmtDays(n) {
    n = Math.round(n);
    if (n <= 0) return "heute"; if (n === 1) return "1 Tag"; if (n < 31) return n + " Tage";
    if (n < 365) return "≈ " + Math.round(n / 30.4) + " Mon."; return "≈ " + S.fmt(n / 365, 1) + " J.";
  }
  /** Bewertungsknöpfe mit dem Abstand, den die jeweilige Bewertung ergäbe. */
  function gradeRow(attr, card, only) {
    const iv = R.preview(card, today(), { retention: retention() }), list = GRADES.filter(([g]) => !only || only.includes(g));
    return `<div class="grade-row" style="--n:${list.length}">${list.map(([g, label]) =>
      `<button class="btn grade${g === 3 ? " primary" : ""}" ${attr}="${g}" aria-keyshortcuts="${g}" title="Taste ${g}"><b>${label}</b><span class="small">${fmtDays(iv[g - 1])}</span></button>`).join("")}</div>
      <p class="small muted grade-hint">Tasten ${list[0][0]}–${list[list.length - 1][0]} · Abstand bis zur nächsten Wiederholung</p>`;
  }
  function memLabel(c) {
    if (!c) return "neu";
    const m = R.memory(c), r = R.cardRetrievability(c, today());
    return `Stabilität ${m.s < 1 ? "< 1 Tag" : fmtDays(m.s)}${r == null ? "" : ` · Abruf ${pct(r)} %`}`;
  }

  // ---------- Fehlermeldungen ----------
  function reportBtn(ctx) { return `<button class="report-btn" data-report="${esc(JSON.stringify(ctx))}" title="Inhaltlichen Fehler oder kaputten Link melden">⚑ Fehler melden</button>`; }
  const REPORT_CATS = ["fachlich falsch", "Antwort/Lösung falsch", "mehrdeutig/unklar", "Link defekt", "Literaturangabe falsch", "Tippfehler", "Sonstiges"];
  function openReport(ctx) {
    const ov = document.createElement("div");
    ov.className = "overlay"; ov.id = "overlay";
    ov.innerHTML = `<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="repTitle">
      <h3 id="repTitle">Fehler melden</h3>
      <p class="small muted">${esc(ctx.mod ? ctx.mod + " · " : "")}${esc(ctx.kind)}</p>
      <blockquote class="small">${esc((ctx.text || "").slice(0, 400))}</blockquote>
      <label for="repCat">Art des Fehlers</label>
      <select id="repCat">${REPORT_CATS.map((c) => `<option ${ctx.kind === "Link" && c === "Link defekt" ? "selected" : ""}>${esc(c)}</option>`).join("")}</select>
      <label for="repComment">Was ist falsch?</label>
      <textarea id="repComment" placeholder="z. B. Laut Lehrbuch X (S. 12) lautet die richtige Antwort …"></textarea>
      <label for="repFix">Korrekturvorschlag (optional)</label>
      <input type="text" id="repFix" placeholder="So sollte es heißen …">
      <div class="btn-row"><button class="btn primary" data-repsave="1">Meldung speichern</button><button class="btn" data-repclose="1">Abbrechen</button></div>
      <p class="small muted">Meldungen findest du im <a href="#/pruefmodus/meldungen">Prüfmodus</a>. ${IN_ARTIFACT ? "Auf dieser Seite werden sie zusätzlich gespeichert, damit sie ausgewertet werden können." : "Von dort lassen sie sich als Markdown oder GitHub-Issue weitergeben."}</p></div>`;
    ov.dataset.ctx = JSON.stringify(ctx);
    document.body.appendChild(ov);
    document.getElementById("repComment").focus();
  }
  function closeReport() { const o = document.getElementById("overlay"); if (o) o.remove(); }
  function saveReport() {
    const ov = document.getElementById("overlay"); if (!ov) return;
    const ctx = JSON.parse(ov.dataset.ctx);
    const comment = document.getElementById("repComment").value.trim();
    if (!comment) { toast("Bitte kurz beschreiben, was falsch ist."); return; }
    const id = "r-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
    const r = Object.assign({ id, created: new Date().toISOString(), category: document.getElementById("repCat").value, comment, fix: document.getElementById("repFix").value.trim(), status: "offen", app: V.version }, ctx);
    state.reports[id] = r; save(); closeReport(); toast("Meldung gespeichert – siehe Prüfmodus.");
    pushReport(r);
  }
  function reportMarkdown(r) {
    return `### ${r.category} – ${r.mod || "allgemein"} (${r.kind})\n\n> ${String(r.text || "").replace(/\n/g, " ")}\n\n${r.url ? `Link: ${r.url}\n\n` : ""}**Problem:** ${r.comment}\n${r.fix ? `\n**Vorschlag:** ${r.fix}\n` : ""}\n_Gemeldet am ${r.created.slice(0, 10)} · Referenz ${r.ref || "–"}${r.app ? " · App-Version " + r.app : ""}_\n`;
  }
  function issueUrl(title, body) {
    const repo = PP.meta.repo; if (!repo) return null;
    const max = 6000; if (body.length > max) body = body.slice(0, max) + "\n\n… (gekürzt – vollständigen Text aus dem Prüfmodus kopieren)";
    return `https://github.com/${repo}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  }

  // ---------- Linkstatus ----------
  function linkBadge(url) {
    const ls = PP.linkStatus && PP.linkStatus.results && PP.linkStatus.results[url];
    if (!ls) return "";
    if (ls.status === "defekt") return `<span class="pill bad" title="Linkprüfung ${esc(PP.linkStatus.checkedAt.slice(0, 10))}: ${esc(ls.detail || "")}">Link defekt</span>`;
    if (ls.status === "unklar") return `<span class="pill warn" title="${esc(ls.detail || "")}">Link prüfen</span>`;
    return "";
  }

  // ---------- Quellen & fachliche Prüfung ----------
  const RITEMS = RV.collect(PP.modules), RITEM = new Map(RITEMS.map((it) => [it.id, it]));
  const reviewOf = (id) => RV.status(id, PP.review, state.review);
  function reviewBadge(id) {
    const st = reviewOf(id);
    if (!st) return `<span class="pill" title="Noch nicht fachlich geprüft – Inhalte wurden mit KI-Unterstützung erstellt">ungeprüft</span>`;
    const who = [st.by, st.date && st.date.split("-").reverse().join("."), st.note].filter(Boolean).join(" · ");
    if (st.s === "fehler") return `<span class="pill bad" title="${esc(who)}">Fehler gemeldet</span>`;
    return `<span class="pill ok" title="${esc(who)}">✓ fachlich geprüft${st.local ? " (von dir)" : ""}</span>`;
  }
  function topicSources(m, t) { return ((PP.topicSources || {})[m.id] || {})[t.title] || []; }
  function sourcesHtml(m, t) {
    const list = topicSources(m, t).map((s) => SRC.resolve(s, m, PP.sourceCatalog)).filter(Boolean);
    if (!list.length) return "";
    return `<div class="sources small"><b>Zum Nachprüfen:</b><ul>${list.map((r) => `<li>${r.url ? `${link(r.url, r.text)} ${linkBadge(r.url)}` : esc(r.text)}${r.where ? ` – <span class="muted">${esc(r.where)}</span>` : ""}${r.free ? ' <span class="pill ok">frei</span>' : ""}</li>`).join("")}</ul></div>`;
  }
  function reviewCount(mod, kind) { const st = RV.stats(RITEMS.filter((it) => it.mod === mod && it.kind === kind), PP.review, state.review).all; return st; }

  // ---------- Bibliothekssuche ----------
  function libTemplate(lib) { const o = state.settings.libTemplates[lib.id]; return o != null && o !== "" ? o : lib.template; }
  function bookQuery(b) {
    if (b.isbn) return b.isbn.replace(/[^0-9Xx]/g, "");
    const firstAuthor = (b.authors || "").split(/[,&;]/)[0].trim().split(/\s+/)[0];
    return (b.title.replace(/[:.–-].*$/, "").trim() + " " + firstAuthor).trim();
  }
  function libHref(lib, q) { const tpl = libTemplate(lib); return tpl ? tpl.replace("{q}", encodeURIComponent(q)) : lib.home; }
  function libButtons(b) {
    const q = bookQuery(b);
    return `<div class="lib-btns">` + ["kit", "ubw", "bw", "worldcat", "springer"].map((id) => {
      const l = PP.libraries.find((x) => x.id === id), direct = !!libTemplate(l);
      return `<a class="btn small" href="${esc(libHref(l, q))}" target="_blank" rel="noopener noreferrer" ${direct ? "" : `data-libcopy="${esc(q)}"`} title="${esc(l.name)}${direct ? "" : " – Suchbegriff wird kopiert"}">${esc(l.short)}</a>`;
    }).join("") + `<button class="btn small" data-copy="${esc(citation(b, true))}" title="Quellenangabe kopieren">APA kopieren</button></div>`;
  }
  function citation(b, plain) {
    const s = `${b.authors} (${b.year || "o. J."}). ${b.title}${b.ed ? ` (${b.ed})` : ""}. ${b.publisher || ""}`.trim();
    return plain ? s : esc(s);
  }

  // ---------- Sidebar ----------
  function renderSidebar() {
    const cur = location.hash || "#/";
    const a = (href, label, extra = "") => `<a href="${href}" class="${cur === href || (href !== "#/" && cur.startsWith(href + "/")) ? "active" : ""}">${label}${extra}</a>`;
    const due = dueCount();
    const openReports = Object.values(state.reports).filter((r) => r.status !== "erledigt").length;
    let h = `<div class="nav-group">Lernen</div>` + a("#/", "🏠 Übersicht") + a("#/plan", "🗓️ Semesterplan") +
      a("#/wiederholen", "🔁 Wiederholen", due ? `<span class="nav-count">${due}</span>` : "") + a("#/verlauf", "📅 Lernverlauf & Termine") + a("#/mischquiz", "🎲 Mischquiz") +
      a("#/rechentrainer", "🧮 Rechentrainer") + a("#/datensaetze", "📊 Übungsdatensätze") +
      `<div class="nav-group">Nachschlagen</div>` + a("#/bibliothek", "📚 Literatur & Bibliotheken") + a("#/ressourcen", "🌐 Offene Ressourcen") + a("#/podcasts", "🎧 Podcasts") + a("#/glossar", "🔤 Glossar") +
      `<div class="nav-group">Verwalten</div>` + a("#/fortschritt", "📈 Fortschritt") + a("#/anki", "🃏 Anki-Export") +
      a("#/pruefmodus", "🔍 Prüfmodus", openReports ? `<span class="nav-count">${openReports}</span>` : "") + a("#/karriere", "🧭 Nach dem Bachelor") + a("#/einstellungen", "⚙️ Einstellungen");
    PP.groups.forEach((g) => {
      const mods = modulesOf(g.id); if (!mods.length) return;
      h += `<div class="nav-group">${esc(g.id === "0" ? "" : g.id + " · ")}${esc(g.short)}${g.ects ? " · " + g.ects + " ECTS" : ""}</div>`;
      mods.forEach((m) => {
        const href = "#/modul/" + m.id, active = cur.startsWith(href + "/") || cur === href;
        h += `<a href="${href}" class="${active ? "active" : ""}"><span class="mid">${esc(m.id)}</span><span>${esc(m.short || m.title)}</span>${state.done[m.id] ? '<span class="done-dot">✓</span>' : ""}</a>`;
      });
    });
    h += `<div class="nav-foot"><a href="#/einstellungen">Version ${esc(V.version)}${updateAvailable() ? ' <span class="nav-count">neu</span>' : ""}</a></div>`;
    $side.innerHTML = h;
  }

  // ---------- Übersicht ----------
  function viewHome() {
    const totalQ = PP.modules.reduce((s, m) => s + (m.quiz || []).length, 0);
    const totalB = PP.modules.reduce((s, m) => s + (m.literature || []).length, 0);
    const totalT = PP.modules.reduce((s, m) => s + (m.topics || []).length, 0);
    const totalR = PP.modules.reduce((s, m) => s + (m.materials || []).length + (m.lectures || []).length, 0);
    const done = ectsDone(), q = srsQueue();
    let h = `<section class="hero"><h1>${esc(PP.meta.title)}</h1>
      <p>Dein strukturierter Selbstlern-Begleiter entlang des Modulplans (${esc(PP.meta.curriculumVersion)}, ${PP.meta.ects} ECTS, ${PP.meta.semesters} Semester, ${esc(PP.meta.degree)}). Zu jedem Modul: Lernziele, Wissen und Qualifikationen, Lernpfad, freie Materialien und Vorlesungen, Fachliteratur mit Bibliothekssuche, Karteikarten, Quiz und Prüfungssimulation – dazu modulübergreifende Wiederholung, Statistik-Rechentrainer und Übungsdatensätze.</p>
      <div class="stats">
        <div class="stat"><b>${PP.modules.length}</b>Module & Rubriken</div>
        <div class="stat"><b>${totalT}</b>Lernthemen</div>
        <div class="stat"><b>${totalR}</b>Materialien & Vorlesungen</div>
        <div class="stat"><b>${totalB}</b>Fachbücher</div>
        <div class="stat"><b>${totalQ}</b>Quizfragen</div>
        <div class="stat"><b>${T.generators.length}</b>Rechenaufgaben-Typen</div>
        <div class="stat"><b>${done}/${PP.meta.ects}</b>ECTS abgehakt</div>
      </div>
      <div class="progress" style="margin-top:12px"><span style="width:${(done / PP.meta.ects) * 100}%"></span></div></section>
      <div class="card today"><div><h3>Heute</h3><p>${q.due.length} fällige Wiederholungen · ${q.fresh.length} neue Karten verfügbar</p>${homeExtras()}</div>
        <div class="btn-row"><a class="btn primary" href="#/wiederholen">Wiederholung starten</a><a class="btn" href="#/verlauf">Lernverlauf</a><a class="btn" href="#/mischquiz">Mischquiz</a><a class="btn" href="#/rechentrainer">Rechentrainer</a></div></div>
      <div class="notice small"><b>Hinweis:</b> ${esc(PP.meta.disclaimer)} <a href="#/pruefmodus">Im Prüfmodus</a> kannst du Angaben abgleichen und Fehler melden.
        Fachlich geprüft sind bisher <b>${RV.stats(RITEMS, PP.review, state.review).all.ok} von ${RITEMS.length}</b> Lernthemen und Fragen – zu jedem Lernthema stehen Quellen zum Nachprüfen dabei (<a href="#/pruefmodus/inhalte">Inhalte prüfen</a>).</div>`;
    PP.groups.forEach((g) => {
      const mods = modulesOf(g.id);
      h += `<h2>${g.id !== "0" ? esc(g.id) + " – " : ""}${esc(g.title)} ${g.ects ? `<span class="pill accent">${g.ects} ECTS</span>` : ""}</h2><p class="muted">${esc(g.desc)}</p><div class="grid">`;
      mods.forEach((m) => {
        h += `<a class="card module-card" href="#/modul/${m.id}"><span class="mc-id">${esc(m.id)} ${m.ects ? `<span class="pill">${m.ects} ECTS</span>` : ""} ${m.steop ? '<span class="pill warn">StEOP</span>' : ""} ${state.done[m.id] ? '<span class="pill ok">✓ erledigt</span>' : ""}</span>
          <span class="mc-title">${esc(m.title)}</span><span class="small muted">${esc((m.lvs || []).map((l) => l.type).join(" · "))}</span>
          <div class="progress"><span style="width:${pct(moduleProgress(m))}%"></span></div></a>`;
      });
      h += `</div>`;
    });
    h += `<h2>Offizielle Quellen</h2><ul>${PP.meta.officialLinks.map((l) => `<li>${link(l.url, l.title)} ${linkBadge(l.url)}</li>`).join("")}</ul>`;
    return h;
  }

  function viewPlan() {
    let h = `<h1>Empfohlener Semesterplan</h1><p class="muted">Vorschlag für ein Vollzeitstudium in Mindeststudienzeit – kein offizieller Studienplan. Lehrveranstaltungsangebot (Winter/Sommer) und Anmeldevoraussetzungen in u:find prüfen.</p><div class="grid">`;
    PP.semesterPlan.forEach((s) => {
      const ects = s.modules.reduce((sum, id) => sum + (id === "W" ? 10 : (byId(id) ? byId(id).ects : 0)), 0);
      h += `<div class="card sem-col"><h3>${esc(s.title)}</h3><ul class="clean">` + s.modules.map((id) => {
        if (id === "W") return `<li>▸ <a href="#/modul/W1">Erweiterungscurriculum / Wahlmodul</a> <span class="pill">≈10 ECTS</span></li>`;
        const m = byId(id); if (!m) return "";
        return `<li>▸ <a href="#/modul/${m.id}"><b>${m.id}</b> ${esc(m.short || m.title)}</a> <span class="pill">${m.ects} ECTS</span> ${state.done[m.id] ? "✓" : ""}</li>`;
      }).join("") + `</ul><p class="small muted">${esc(s.note)}</p><p class="small">≈ ${ects} ECTS (Module über zwei Semester doppelt gelistet)</p></div>`;
    });
    h += `</div><h2>Lerntipps</h2><ul>${PP.general.studyTips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
    return h;
  }

  // ---------- Modulansicht ----------
  const TABS = [
    ["ueberblick", "Überblick"], ["wissen", "Wissen & Qualifikationen"], ["lernpfad", "Lernpfad"], ["materialien", "Materialien"],
    ["vorlesungen", "Vorlesungen"], ["podcasts", "Podcasts"], ["literatur", "Fachliteratur"], ["karten", "Karteikarten"], ["quiz", "Quiz"], ["pruefung", "Prüfung"],
    ["rechnen", "Rechentrainer"], ["notizen", "Notizen"]
  ];
  const gensFor = (m) => T.generators.filter((g) => g.modules.includes(m.id));
  const datasetsFor = (m) => (PP.datasets || []).filter((d) => d.modules.includes(m.id));
  function tabCount(m, t) {
    return { wissen: (m.competencies || []).length, lernpfad: (m.topics || []).length, materialien: (m.materials || []).length, vorlesungen: (m.lectures || []).length, podcasts: podcastsFor(m).length,
      literatur: (m.literature || []).length, karten: (m.glossary || []).length, quiz: (m.quiz || []).length, pruefung: (m.exam || []).length, rechnen: gensFor(m).length }[t];
  }
  function viewModule(id, tab) {
    const m = byId(id);
    if (!m) return `<h1>Modul nicht gefunden</h1><p><a href="#/">Zur Übersicht</a></p>`;
    const tabs = TABS.filter(([k]) => k !== "rechnen" || gensFor(m).length || datasetsFor(m).length);
    tab = tabs.some(([k]) => k === tab) ? tab : "ueberblick";
    const g = groupOf(m.group), idx = PP.modules.indexOf(m), prev = PP.modules[idx - 1], next = PP.modules[idx + 1];
    let h = `<p class="small muted"><a href="#/">Übersicht</a> › ${esc(g.id !== "0" ? g.id + " – " : "")}${esc(g.title)}</p>
      <h1>${esc(m.id)} · ${esc(m.title)}</h1>
      <div class="pills">${m.ects ? `<span class="pill accent">${m.ects} ECTS</span>` : ""}${m.steop ? '<span class="pill warn">StEOP</span>' : ""}${m.semester ? `<span class="pill">empf. Semester: ${esc(m.semester)}</span>` : ""}${(m.lvs || []).map((l) => `<span class="pill">${esc(l.type)}${l.pi ? " · prüfungsimmanent" : ""}</span>`).join("")}</div>
      <nav class="tabs">${tabs.map(([k, label]) => { const c = tabCount(m, k); return `<a href="#/modul/${m.id}/${k}" class="${k === tab ? "active" : ""}">${label}${c ? `<span class="cnt">${c}</span>` : ""}</a>`; }).join("")}</nav>`;
    const fn = { ueberblick: tabOverview, wissen: tabWissen, lernpfad: tabTopics, materialien: tabMaterials, vorlesungen: tabLectures, podcasts: tabPodcasts, literatur: tabLit, karten: tabCards, quiz: tabQuiz, pruefung: tabExam, rechnen: tabRechnen, notizen: tabNotes }[tab];
    h += fn(m);
    h += `<div class="btn-row" style="margin-top:30px;justify-content:space-between">${prev ? `<a class="btn" href="#/modul/${prev.id}">← ${esc(prev.id)} ${esc(prev.short || prev.title)}</a>` : "<span></span>"}${next ? `<a class="btn" href="#/modul/${next.id}">${esc(next.id)} ${esc(next.short || next.title)} →</a>` : ""}</div>`;
    return h;
  }

  function tabOverview(m) {
    let h = `<div class="card"><h3>Worum geht es?</h3>${rich(m.summary || "")}</div>`;
    if (m.choice) h += `<div class="notice info"><b>Wahlmöglichkeit:</b> ${rich(m.choice)}</div>`;
    if (m.lvs && m.lvs.length) {
      h += `<div class="card"><h3>Lehrveranstaltungen</h3><div class="table-wrap"><table><thead><tr><th>Typ</th><th>Titel</th><th>ECTS</th><th>Prüfungsform</th></tr></thead><tbody>` +
        m.lvs.map((l) => `<tr><td><b>${esc(l.type)}</b></td><td>${esc(l.title)}</td><td>${l.ects || "–"}</td><td>${l.pi ? "prüfungsimmanent (laufende Leistungen, Anwesenheit)" : "nicht-prüfungsimmanent (Modul-/Vorlesungsprüfung)"}</td></tr>`).join("") +
        `</tbody></table></div><p class="small muted">VO = Vorlesung, UE = Übung, VU = Vorlesung mit Übung, SE = Seminar, PR = Praktikum. Details in u:find und Moodle. Angaben unsicher? <a href="#/pruefmodus/curriculum">Im Prüfmodus abgleichen</a>.</p></div>`;
    }
    if (m.goals) h += `<div class="card"><h3>Lernziele laut Modulbeschreibung (sinngemäß)</h3><ul>${m.goals.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
    if (m.exam_info) h += `<div class="card"><h3>Prüfung & Leistungsbeurteilung</h3>${rich(m.exam_info)}</div>`;
    if (m.tips) h += `<div class="card"><h3>Lernstrategie für dieses Modul</h3><ul>${m.tips.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
    const inSrs = !state.srsCfg.modules || state.srsCfg.modules.includes(m.id);
    const learned = ITEMS.filter((it) => it.mod === m.id && state.srs[it.id]).length, total = ITEMS.filter((it) => it.mod === m.id).length;
    h += `<div class="card"><h3>Dein Stand</h3><div class="progress"><span style="width:${pct(moduleProgress(m))}%"></span></div>
      <p class="small">Selbsteinschätzung ${pct(compScore(m))} % · bestes Quiz ${state.quiz[m.id] ? pct(state.quiz[m.id].best) + " %" : "–"} · beste Prüfung ${state.exam[m.id] ? pct(state.exam[m.id].best) + " %" : "–"} · Wiederholung: ${learned}/${total} Karten begonnen</p>
      <label><input type="checkbox" id="doneToggle" data-mod="${m.id}" ${state.done[m.id] ? "checked" : ""}> Modul abgeschlossen</label><br>
      <label><input type="checkbox" id="srsModToggle" data-mod="${m.id}" ${inSrs ? "checked" : ""}> Neue Karten aus diesem Modul in die tägliche Wiederholung aufnehmen</label></div>`;
    h += `<div class="btn-row"><a class="btn primary" href="#/modul/${m.id}/lernpfad">Lernpfad starten</a><a class="btn" href="#/modul/${m.id}/quiz">Quiz</a><a class="btn" href="#/modul/${m.id}/pruefung">Prüfungssimulation</a>${gensFor(m).length ? `<a class="btn" href="#/modul/${m.id}/rechnen">Rechentrainer</a>` : ""}</div>`;
    return h;
  }

  const LEVELS = ["neu", "Grundlagen", "sicher", "kann es erklären"];
  function tabWissen(m) {
    let h = "";
    if (m.prerequisites && m.prerequisites.length) h += `<div class="card"><h3>Vorausgesetztes Wissen</h3><ul>${m.prerequisites.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
    h += `<div class="card"><h3>Kompetenzen nach Abschluss – Selbsteinschätzungsbogen</h3><p class="small muted">Bewerte ehrlich. „Kann es erklären“ heißt: du könntest es ohne Unterlagen erklären und ein Beispiel geben.</p>`;
    const c = state.comp[m.id] || {};
    (m.competencies || []).forEach((txt, i) => {
      h += `<div class="comp"><div>${esc(txt)}</div><div class="rating">${LEVELS.map((l, lv) => `<button data-comp="${m.id}" data-i="${i}" data-lv="${lv}" class="${(c[i] || 0) === lv ? "on" : ""}">${l}</button>`).join("")}</div></div>`;
    });
    h += `<p class="small" style="margin-top:10px">Kompetenzindex: <b>${pct(compScore(m))} %</b></p></div>`;
    if (m.skills && m.skills.length) h += `<div class="card"><h3>Qualifikationen & Arbeitstechniken</h3><ul>${m.skills.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
    return h;
  }

  // Abbildungen zu einem Lernthema (js/figures.js, Zuordnung in data/figures.js)
  function topicFigures(m, t) {
    const ids = FIG && PP.topicFigures ? (PP.topicFigures[m.id] || {})[t.title] : null;
    return ids ? ids.map((id) => FIG.html(id)).join("") : "";
  }
  function tabTopics(m) {
    const r = state.read[m.id] || {}, n = (m.topics || []).length, done = Object.values(r).filter(Boolean).length;
    const rc = reviewCount(m.id, "topic");
    let h = `<p class="muted">Arbeite die Themen der Reihe nach durch und hake ab, was du verstanden hast. (${done}/${n}) · Fachlich geprüft: ${rc.ok}/${rc.total} – <a href="#/pruefmodus/inhalte/${esc(m.id)}">prüfen</a></p>
      <div class="btn-row"><button class="btn small" data-expand="1">Alle aufklappen</button><button class="btn small" data-expand="0">Alle zuklappen</button></div>`;
    (m.topics || []).forEach((t, i) => {
      h += `<details class="topic"><summary><span>${i + 1}. ${esc(t.title)}</span>${r[i] ? '<span class="pill ok">✓</span>' : ""}</summary><div class="t-body">${rich(t.text)}${topicFigures(m, t)}`;
      if (t.concepts && t.concepts.length) h += `<div class="concepts">${t.concepts.map((c) => `<span class="pill">${esc(c)}</span>`).join("")}</div>`;
      if (t.read) h += `<p class="small" style="margin-top:10px"><b>Lesen/Ansehen:</b> ${esc(t.read)}</p>`;
      h += sourcesHtml(m, t);
      h += `<div class="row-between"><label class="small"><input type="checkbox" data-read="${m.id}" data-i="${i}" ${r[i] ? "checked" : ""}> verstanden</label><span>${reviewBadge(RV.topicId(m.id, t))} ${reportBtn({ kind: "Lernthema", mod: m.id, ref: "t:" + R.hash(t.title), text: t.title })}</span></div></div></details>`;
    });
    return h;
  }

  function resourceList(list, emptyText, mod) {
    if (!list || !list.length) return `<p class="muted">${emptyText}</p>`;
    return `<div class="card"><ul class="clean">` + list.map((r) => `<li class="resource"><div class="r-title">${link(r.url, r.title)} ${linkBadge(r.url)}</div>
      <div class="r-meta pills">${r.type ? `<span class="pill">${esc(r.type)}</span>` : ""}${r.provider ? `<span class="pill">${esc(r.provider)}</span>` : ""}${r.lang ? `<span class="pill">${esc(r.lang)}</span>` : ""}${r.free !== false ? '<span class="pill ok">frei zugänglich</span>' : ""}</div>
      ${r.note ? `<div class="small muted">${esc(r.note)}</div>` : ""}${reportBtn({ kind: "Link", mod: mod || "", ref: "l:" + R.hash(r.url), text: r.title, url: r.url })}</li>`).join("") + `</ul></div>`;
  }
  function tabMaterials(m) {
    return `<p class="muted">Öffentlich und kostenlos zugängliche Lehrbücher, Artikel, Simulationen und Werkzeuge. Suchlinks führen zu aktuellen Treffern, falls sich URLs ändern.</p>` + resourceList(m.materials, "Noch keine Materialien hinterlegt.", m.id);
  }
  function tabLectures(m) {
    return `<p class="muted">Frei zugängliche Vorlesungsaufzeichnungen und Videokurse. Uni-interne Aufzeichnungen (u:stream/Moodle) sind nur mit u:account verfügbar.</p>` + resourceList(m.lectures, "Noch keine Vorlesungen hinterlegt.", m.id);
  }
  // Podcasts: Empfehlung des Podcasts plus Suchlink nach passenden Folgen (keine einzelnen Folgen verlinkt, die ändern sich)
  const podSearch = (p, q) => "https://duckduckgo.com/?q=" + encodeURIComponent(`"${p.title}" ${q}`);
  const podcastsFor = (m) => (PP.podcasts || []).filter((p) => p.modules[m.id]);
  function podcastItem(p, mod) {
    const x = mod ? p.modules[mod] : null;
    return `<li class="resource"><div class="r-title">🎧 ${link(p.url, p.title)} ${linkBadge(p.url)}</div>
      <div class="r-meta pills"><span class="pill">${esc(p.lang === "DE" ? "Deutsch" : "Englisch")}</span><span class="pill">${esc(p.by)}</span></div>
      ${x ? `<div><b>${esc(x.hint)}</b></div>` : ""}<div class="small muted">${esc(p.about)}</div>
      ${x ? `<div class="btn-row"><a class="btn small" href="${esc(podSearch(p, x.q))}" target="_blank" rel="noopener noreferrer">🔎 Passende Folgen suchen</a>${reportBtn({ kind: "Link", mod, ref: "l:" + R.hash(p.url), text: p.title, url: p.url })}</div>`
        : `<div class="pills" style="margin-top:4px">${Object.keys(p.modules).map((id) => `<a class="pill" href="#/modul/${esc(id)}/podcasts" title="${esc(p.modules[id].hint)}">${esc(id)}</a>`).join("")}</div>`}</li>`;
  }
  function tabPodcasts(m) {
    const list = podcastsFor(m).sort((a, b) => (a.lang === b.lang ? 0 : a.lang === "DE" ? -1 : 1));
    return `<p class="muted">Zum Weiterhören unterwegs: frei abrufbare Podcasts, die Themen dieses Moduls behandeln. Der Suchlink findet passende Folgen. Podcasts ersetzen keine Fachliteratur – prüfe Aussagen wie bei jeder Quelle. <a href="#/podcasts">Alle Podcasts</a></p>` +
      (list.length ? `<div class="card"><ul class="clean">${list.map((p) => podcastItem(p, m.id)).join("")}</ul></div>` : `<p class="muted">Für dieses Modul ist noch kein Podcast hinterlegt.</p>`);
  }
  function viewPodcasts() {
    const all = PP.podcasts || [], de = all.filter((p) => p.lang === "DE"), en = all.filter((p) => p.lang !== "DE");
    return `<h1>Podcasts <span class="pill">${all.length}</span></h1><p class="muted">Psychologie zum Hören – Fach- und Wissenschaftspodcasts sowie Sendungen von Ö1, Deutschlandfunk Nova, SWR, BR und BBC. Die Kürzel führen zu den Modulen, dort gibt es je Podcast einen Suchlink für passende Folgen. Abgerufen und geprüft im Oktober 2026; Adressen werden wöchentlich automatisch auf Erreichbarkeit getestet.</p>
      <h2>Deutschsprachig</h2><div class="card"><ul class="clean">${de.map((p) => podcastItem(p)).join("")}</ul></div>
      <h2>Englischsprachig</h2><div class="card"><ul class="clean">${en.map((p) => podcastItem(p)).join("")}</ul></div>`;
  }
  function tabLit(m) {
    const order = { Standard: 0, Einstieg: 1, Vertiefung: 2, Klassiker: 3, Nachschlagen: 4 };
    const list = (m.literature || []).slice().sort((a, b) => (order[a.tag] ?? 9) - (order[b.tag] ?? 9));
    let h = `<p class="muted">Ein Klick auf eine Bibliothek sucht den Titel (oder kopiert den Suchbegriff und öffnet den Katalog – Such-URLs lassen sich in den <a href="#/einstellungen">Einstellungen</a> hinterlegen). Ältere Auflagen reichen für das Grundverständnis meist aus.</p><div class="card"><ul class="clean">`;
    list.forEach((b) => {
      h += `<li class="resource"><div class="r-title">${esc(b.title)}${b.ed ? ` <span class="muted">(${esc(b.ed)})</span>` : ""}</div>
        <div class="small">${esc(b.authors)} · ${esc(b.year || "")} · ${esc(b.publisher || "")}${b.isbn ? " · ISBN " + esc(b.isbn) : ""}</div>
        <div class="pills" style="margin-top:4px">${b.tag ? `<span class="pill ${b.tag === "Standard" ? "accent" : ""}">${esc(b.tag)}</span>` : ""}${b.lang ? `<span class="pill">${esc(b.lang)}</span>` : ""}${b.ebook ? '<span class="pill ok">oft als E-Book über Uni-Lizenz</span>' : ""}</div>
        ${b.note ? `<div class="small muted" style="margin-top:4px">${esc(b.note)}</div>` : ""}${libButtons(b)}${reportBtn({ kind: "Literatur", mod: m.id, ref: "b:" + R.hash(b.title), text: citation(b, true) })}</li>`;
    });
    return h + `</ul></div>`;
  }

  // Karteikarten des Moduls – gleiche Wiederholungsdaten wie die modulübergreifende Wiederholung
  let cardSession = null;
  function tabCards(m) {
    const items = ITEMS.filter((it) => it.mod === m.id && it.kind === "card");
    if (!items.length) return `<p class="muted">Keine Karteikarten.</p>`;
    const st = R.stats(items, state.srs, today());
    if (!cardSession || cardSession.mod !== m.id) cardSession = { mod: m.id, flipped: false, id: null };
    if (!cardSession.id || !ITEM.has(cardSession.id)) cardSession.id = pickCard(items);
    const it = ITEM.get(cardSession.id), c = state.srs[it.id];
    return `<p class="muted">Die Karten teilen ihre Lerndaten mit der <a href="#/wiederholen">modulübergreifenden Wiederholung</a>: Nach dem Umdrehen bewertest du, wie gut du den Begriff wusstest, und der Planer (FSRS) legt fest, wann er wiederkommt.</p>
      <div class="pills"><span class="pill">${st.total} Begriffe</span><span class="pill">${st.learned} begonnen</span><span class="pill warn">${st.due} heute fällig</span><span class="pill ok">${st.mature} gefestigt</span></div>
      <div class="card flash ${cardSession.flipped ? "back" : ""}" id="flash" data-flip="1" role="button" tabindex="0">
        ${cardSession.flipped ? `<div><div class="small muted">${esc(it.term)}</div>${esc(it.def)}</div>` : `<div><div class="small muted">Begriff · ${memLabel(c)}</div><b>${esc(it.term)}</b><div class="small muted" style="margin-top:8px">Klicken oder Leertaste zum Umdrehen</div></div>`}
      </div>
      ${cardSession.flipped ? gradeRow("data-cardgrade", c) : ""}<div class="btn-row" style="justify-content:center">${reportBtn({ kind: "Karteikarte", mod: m.id, ref: it.id, text: it.term + ": " + it.def })}</div>
      <details class="topic"><summary>Alle Begriffe als Liste (${items.length})</summary><div class="t-body"><dl>${items.map((x) => `<dt><b>${esc(x.term)}</b></dt><dd class="small">${esc(x.def)}</dd>`).join("")}</dl></div></details>`;
  }
  function pickCard(items) {
    const d = today();
    const due = items.filter((it) => R.isDue(state.srs[it.id], d));
    if (due.length) return due[Math.floor(Math.random() * due.length)].id;
    const fresh = items.filter((it) => !state.srs[it.id]);
    if (fresh.length) return fresh[0].id;
    const sorted = items.slice().sort((a, b) => R.cardRetrievability(state.srs[a.id], d) - R.cardRetrievability(state.srs[b.id], d));
    return sorted[Math.floor(Math.random() * Math.min(5, sorted.length))].id;
  }

  // ---------- Quiz-Bausteine ----------
  function quizCard(q, n, chosen, optOrder, attrs, ctx) {
    return `<div class="card q"><div class="q-head"><div class="q-text">${n}. ${esc(q.q)}</div>${ctx.pill || ""}</div><div class="opts">` +
      optOrder.map((k) => {
        let cls = "";
        if (chosen !== undefined) { if (k === q.a) cls = "correct"; else if (k === chosen) cls = "wrong"; }
        return `<button class="opt ${cls}" ${attrs} data-k="${k}" ${chosen !== undefined ? "disabled" : ""}>${esc(q.o[k])}</button>`;
      }).join("") + `</div>${chosen !== undefined ? `<div class="explain">${chosen === q.a ? "✓ Richtig." : "✗ Leider falsch – kommt in deine Wiederholung."} ${esc(q.e || "")}</div>` : ""}
      <div class="q-foot">${reviewBadge(R.quizId(ctx.mod, q))} ${reportBtn({ kind: "Quizfrage", mod: ctx.mod, ref: R.quizId(ctx.mod, q), text: q.q + " → " + q.o[q.a] })}</div></div>`;
  }

  let quizSession = null;
  function tabQuiz(m) {
    const qs = m.quiz || [];
    if (!qs.length) return `<p class="muted">Kein Quiz vorhanden.</p>`;
    if (!quizSession || quizSession.mod !== m.id) quizSession = { mod: m.id, order: shuffle(qs.map((_, i) => i)), answers: {}, optOrder: {} };
    const s = quizSession, answered = Object.keys(s.answers).length, total = s.order.length;
    const correct = Object.entries(s.answers).filter(([i, a]) => qs[i].a === a).length;
    let h = `<div class="sticky-bar">${s.subset ? '<span class="pill warn">Wiederholung</span>' : ""}<b>${answered}/${total}</b> beantwortet · <b>${correct}</b> richtig ${answered ? `(${pct(correct / answered)} %)` : ""}
      <button class="btn small" data-quiz="reset">Neu mischen</button><button class="btn small" data-quiz="wrong">Nur falsche wiederholen</button>
      ${state.quiz[m.id] ? `<span class="small muted">Bestes Ergebnis: ${pct(state.quiz[m.id].best)} %</span>` : ""}<span class="small muted">Fachlich geprüft: ${reviewCount(m.id, "quiz").ok}/${qs.length}</span></div>`;
    s.order.forEach((qi, n) => {
      if (!s.optOrder[qi]) s.optOrder[qi] = shuffle(qs[qi].o.map((_, k) => k));
      h += quizCard(qs[qi], n + 1, s.answers[qi], s.optOrder[qi], `data-qa="${qi}"`, { mod: m.id });
    });
    if (answered === total) {
      const p = correct / total;
      h += `<div class="card"><h3>Ergebnis${s.subset ? " (Wiederholungsrunde)" : ""}</h3><div class="score-big">${pct(p)} %</div><p>Note nach Beispielschlüssel: <b>${grade(p).n} (${grade(p).t})</b></p>${correct < total ? `<p class="small">Die ${total - correct} falsch beantworteten Fragen stehen heute in deiner <a href="#/wiederholen">Wiederholung</a>.</p>` : ""}</div>`;
    }
    return h;
  }
  function answerQuiz(m, qi, k) {
    const s = quizSession; if (s.answers[qi] !== undefined) return;
    s.answers[qi] = k;
    const qs = m.quiz;
    logActivity("quiz", qs[qi].a === k);
    if (qs[qi].a !== k) markWrong(m.id, qs[qi]); else save();
    if (!s.subset && Object.keys(s.answers).length === qs.length) {
      const p = Object.entries(s.answers).filter(([i, a]) => qs[i].a === a).length / qs.length;
      const prev = state.quiz[m.id] || { best: 0, attempts: 0 };
      state.quiz[m.id] = { best: Math.max(prev.best, p), last: p, attempts: prev.attempts + 1, date: new Date().toISOString() };
      save();
    }
  }

  // Prüfungssimulation
  let exam = null;
  function tabExam(m) {
    const mc = m.quiz || [], open = m.exam || [];
    if (!exam || exam.mod !== m.id) exam = { mod: m.id, phase: "setup" };
    const hist = state.exam[m.id];
    if (exam.phase === "setup") {
      const defMc = Math.min(20, mc.length), defOpen = Math.min(3, open.length);
      return `<div class="card"><h3>Prüfungssimulation konfigurieren</h3>
        <p>Multiple-Choice-Teil ohne sofortiges Feedback und offene Fragen, die du nach Abgabe mit der Musterlösung selbst bewertest. Falsch beantwortete MC-Fragen landen in deiner Wiederholung.</p>
        <div class="form-row"><label>MC-Fragen <input type="number" id="exMc" min="0" max="${mc.length}" value="${defMc}"></label><span class="small muted">von ${mc.length}</span>
        <label>Offene Fragen <input type="number" id="exOpen" min="0" max="${open.length}" value="${defOpen}"></label><span class="small muted">von ${open.length}</span>
        <label>Zeit (Minuten) <input type="number" id="exTime" min="5" max="240" value="${Math.max(15, defMc * 1.5 + defOpen * 10)}"></label></div>
        <p class="small muted">MC je 1 Punkt; offene Fragen mit angegebener Punktzahl. Bestanden ab 50 % (Beispielschlüssel).</p>
        <button class="btn primary" data-exam="start">Prüfung starten</button></div>
        ${hist ? `<div class="card"><h3>Bisherige Ergebnisse</h3><p>Bestes Ergebnis: <b>${pct(hist.best)} %</b> · letzte: ${pct(hist.last)} % · Versuche: ${hist.attempts}</p></div>` : ""}
        <details class="topic"><summary>Alle offenen Prüfungsfragen mit Musterlösungen ansehen (${open.length})</summary><div class="t-body">${open.map((q, i) => `<p><b>${i + 1}. ${esc(q.q)}</b> <span class="pill">${q.p} P.</span></p><div class="solution small">${rich(q.s)}</div>${reviewBadge(RV.examId(m.id, q))} ${reportBtn({ kind: "Prüfungsfrage", mod: m.id, ref: "e:" + R.hash(q.q), text: q.q })}`).join("")}</div></details>`;
    }
    if (exam.phase === "run") {
      let h = `<div class="sticky-bar"><span>⏱ <span class="timer" id="examTimer"></span></span><button class="btn primary" data-exam="submit">Abgeben</button><button class="btn small" data-exam="abort">Abbrechen</button></div>`;
      exam.mcIdx.forEach((qi, n) => {
        const q = mc[qi];
        h += `<div class="card q"><div class="q-text">${n + 1}. ${esc(q.q)}</div><div class="opts">` + exam.optOrder[qi].map((k) => `<button class="opt ${exam.mcAns[qi] === k ? "selected" : ""}" data-ex="${qi}" data-k="${k}">${esc(q.o[k])}</button>`).join("") + `</div></div>`;
      });
      exam.openIdx.forEach((oi, n) => {
        const q = open[oi];
        h += `<div class="card"><div class="q-text"><b>Offene Frage ${n + 1}</b> <span class="pill">${q.p} Punkte</span></div><p>${esc(q.q)}</p><textarea data-open="${oi}" aria-label="Antwort auf offene Frage ${n + 1}" placeholder="Deine Antwort …">${esc(exam.openAns[oi] || "")}</textarea></div>`;
      });
      setTimeout(startTimer, 0);
      return h;
    }
    const mcPts = exam.mcIdx.filter((qi) => exam.mcAns[qi] === mc[qi].a).length;
    const openMax = exam.openIdx.reduce((s, oi) => s + open[oi].p, 0), openPts = exam.openIdx.reduce((s, oi) => s + (exam.selfScore[oi] || 0), 0);
    const max = exam.mcIdx.length + openMax, tot = mcPts + openPts, p = max ? tot / max : 0, gr = grade(p);
    let h = `<div class="card"><h3>Ergebnis</h3><div class="score-big">${tot} / ${max} Punkte · ${pct(p)} %</div>
      <p>Note (Beispielschlüssel): <b>${gr.n} – ${gr.t}</b> ${gr.n < 5 ? "✓ bestanden" : "✗ nicht bestanden"}</p>
      <p class="small muted">MC: ${mcPts}/${exam.mcIdx.length}. Offene Fragen: ${openPts}/${openMax} (unten selbst bewerten – das Ergebnis aktualisiert sich).</p>
      <div class="btn-row"><button class="btn primary" data-exam="save">Ergebnis speichern</button><button class="btn" data-exam="new">Neue Prüfung</button></div></div>`;
    exam.openIdx.forEach((oi, n) => {
      const q = open[oi];
      h += `<div class="card"><b>Offene Frage ${n + 1}:</b> ${esc(q.q)}<p class="small muted">Deine Antwort:</p><div class="explain">${esc(exam.openAns[oi] || "(keine Antwort)").replace(/\n/g, "<br>")}</div>
        <div class="solution"><b>Musterlösung / Bewertungskriterien:</b>${rich(q.s)}</div>
        <p>Selbstbewertung: ${Array.from({ length: q.p + 1 }, (_, k) => `<button class="btn small ${exam.selfScore[oi] === k ? "primary" : ""}" data-self="${oi}" data-pts="${k}">${k}</button>`).join(" ")} / ${q.p}</p>${reviewBadge(RV.examId(m.id, q))} ${reportBtn({ kind: "Prüfungsfrage", mod: m.id, ref: "e:" + R.hash(q.q), text: q.q })}</div>`;
    });
    exam.mcIdx.forEach((qi, n) => {
      const q = mc[qi], a = exam.mcAns[qi];
      h += `<div class="card q"><div class="q-text">${n + 1}. ${esc(q.q)}</div><div class="opts">` + exam.optOrder[qi].map((k) => `<button class="opt ${k === q.a ? "correct" : k === a ? "wrong" : ""}" disabled>${esc(q.o[k])}</button>`).join("") + `</div><div class="explain">${a === q.a ? "✓" : a === undefined ? "– nicht beantwortet." : "✗"} ${esc(q.e || "")}</div><div class="q-foot">${reportBtn({ kind: "Quizfrage", mod: m.id, ref: R.quizId(m.id, q), text: q.q + " → " + q.o[q.a] })}</div></div>`;
    });
    exam.result = p;
    return h;
  }
  function finishExam(m) {
    exam.phase = "result"; clearInterval(startTimer._i);
    exam.mcIdx.forEach((qi) => {
      const ok = exam.mcAns[qi] === m.quiz[qi].a;
      if (exam.mcAns[qi] !== undefined) logActivity("quiz", ok);
      if (!ok) markWrong(m.id, m.quiz[qi]);
    });
    logActivity("ex"); save();
  }
  function startTimer() {
    const el = document.getElementById("examTimer"); if (!el || !exam || exam.phase !== "run") return;
    clearInterval(startTimer._i);
    const tick = () => {
      const left = Math.max(0, exam.end - Date.now()), mm = Math.floor(left / 60000), ss = Math.floor((left % 60000) / 1000);
      const e2 = document.getElementById("examTimer"); if (!e2) { clearInterval(startTimer._i); return; }
      e2.textContent = `${mm}:${String(ss).padStart(2, "0")}`;
      if (left <= 0) { toast("Zeit abgelaufen – Prüfung wird abgegeben."); finishExam(byId(exam.mod)); route(); }
    };
    tick(); startTimer._i = setInterval(tick, 1000);
  }

  function tabRechnen(m) {
    const gens = gensFor(m), ds = datasetsFor(m);
    let h = `<p class="muted">Rechenaufgaben mit zufällig erzeugten Zahlen, Eingabeprüfung und vollständigem Lösungsweg. Jede Aufgabe hat eine Nummer, über die sie sich exakt wiederholen lässt.</p>`;
    if (gens.length) h += generatorList(gens);
    if (ds.length) h += `<h3>Passende Übungsdatensätze</h3><ul>${ds.map((d) => `<li><a href="#/datensaetze">${esc(d.title)}</a> <span class="small muted">(${d.n} Fälle, ${d.tasks.length} Aufgaben)</span></li>`).join("")}</ul>`;
    return h;
  }
  function tabNotes(m) {
    return `<p class="muted">Deine Notizen werden lokal im Browser gespeichert (Export unter <a href="#/fortschritt">Fortschritt</a>).</p><textarea id="notes" data-mod="${m.id}" aria-label="Notizen zu ${esc(m.id)}" style="min-height:380px" placeholder="Zusammenfassungen, offene Fragen, Prüfungstermine …">${esc(state.notes[m.id] || "")}</textarea>`;
  }

  // ---------- Wiederholen ----------
  let rev = null;
  function viewReview() {
    if (rev && rev.active) return reviewSession();
    const q = srsQueue(), st = R.stats(ITEMS, state.srs, today()), cfg = state.srsCfg;
    const fc = R.forecast(ITEMS, state.srs, today(), 8).slice(1);
    let h = `<h1>Wiederholen</h1><p class="muted">Begriffe und Quizfragen aus allen Modulen, verzahnt gemischt. Nach jeder Karte bewertest du, wie gut du sie wusstest – <b>Nochmal</b>, <b>Schwer</b>, <b>Gut</b> oder <b>Leicht</b>. Der Planer (FSRS, dasselbe Gedächtnismodell wie in Anki) schätzt daraus für jedes Element, wie stabil es im Gedächtnis ist, und legt die nächste Wiederholung so, dass du es dann mit etwa ${pct(retention())} % Wahrscheinlichkeit noch weißt. Im Modul-Quiz oder in Prüfungen falsch beantwortete Fragen landen automatisch hier.</p>
      ${rev && rev.finished ? `<div class="notice info"><b>Runde beendet:</b> ${rev.correct} von ${rev.done} gewusst.${rev.mod ? ` <a href="#/verlauf">Zurück zu den Prüfungsterminen</a>` : ""}</div>` : ""}
      <div class="card today"><div><h3>Heute</h3><p><b>${q.due.length}</b> fällig · <b>${q.fresh.length}</b> neu (Limit ${cfg.newPerDay}/Tag, heute schon ${introducedToday()} eingeführt)</p></div>
        <div class="btn-row"><button class="btn primary" data-rev="start" ${q.all.length ? "" : "disabled"}>${q.all.length ? `Runde starten (${q.all.length})` : "Für heute alles erledigt"}</button><a class="btn" href="#/verlauf">Lernverlauf & Prüfungstermine</a></div></div>
      <div class="grid">
        <div class="card"><h3>Gedächtnisstabilität</h3><p class="small">${st.learned} von ${st.total} Elementen begonnen · ${st.mature} gefestigt (Stabilität ≥ 3 Wochen)</p>${spanChart(st)}</div>
        <div class="card"><h3>Nächste 7 Tage</h3><div class="table-wrap"><table><thead><tr><th>Tag</th><th class="num">fällig</th></tr></thead><tbody>${fc.map((n, i) => `<tr><td>${i === 0 ? "morgen" : esc(dayLabel(R.addDays(today(), i + 1)))}</td><td class="num">${n}</td></tr>`).join("")}</tbody></table></div>
          <p class="small muted">Ohne neue Elemente – mehr im <a href="#/verlauf">Lernverlauf</a>.</p></div>
      </div>
      <div class="card"><h3>Einstellungen</h3>
        <div class="form-row"><label>Neue Elemente pro Tag <input type="number" id="srsNew" min="0" max="200" value="${cfg.newPerDay}"></label>
        <label>Ziel-Behaltensquote <select id="srsRet">${[0.8, 0.85, 0.9, 0.95].map((r) => `<option value="${r}" ${Math.abs(retention() - r) < 1e-9 ? "selected" : ""}>${pct(r)} %${r === 0.9 ? " (empfohlen)" : ""}</option>`).join("")}</select></label>
        <label><input type="checkbox" class="srsKind" value="card" ${cfg.kinds.includes("card") ? "checked" : ""}> Begriffe</label>
        <label><input type="checkbox" class="srsKind" value="quiz" ${cfg.kinds.includes("quiz") ? "checked" : ""}> Quizfragen</label></div>
        <p class="small muted">Die Behaltensquote bestimmt die Abstände: Bei 95 % sind sie nur etwa 40 % so lang wie bei 90 % (deutlich mehr Wiederholungen), bei 80 % rund dreimal so lang (weniger Aufwand, mehr Vergessenes). Sie gilt ab der nächsten Bewertung.</p>
        <p class="small">Neue Elemente aus diesen Modulen (in Curriculumsreihenfolge):</p>
        <div class="btn-row"><button class="btn small" data-srsmods="all">alle</button><button class="btn small" data-srsmods="none">keine</button><button class="btn small" data-srsmods="steop">nur StEOP</button></div>
        <div class="mod-checks">${PP.modules.map((m) => `<label><input type="checkbox" class="srsMod" value="${m.id}" ${!cfg.modules || cfg.modules.includes(m.id) ? "checked" : ""}> ${esc(m.id)} <span class="muted small">${esc(m.short || m.title)}</span></label>`).join("")}</div>
        <button class="btn primary" data-srscfg="save">Einstellungen speichern</button></div>`;
    return h;
  }
  function reviewSession() {
    const id = rev.queue[rev.idx];
    if (!id) { rev.active = false; rev.finished = true; return viewReview(); }
    const it = ITEM.get(id), c = state.srs[id];
    const head = `<div class="sticky-bar"><b>${rev.idx + 1}/${rev.queue.length}</b> · ${rev.correct} richtig ${modPill(it.mod)} <span class="pill">${memLabel(c)}</span>${rev.mod ? `<span class="pill accent">Prüfungsvorbereitung</span>` : ""}<button class="btn small" data-rev="stop">Runde beenden</button></div>
      <div class="progress" style="margin:8px 0 14px"><span style="width:${pct(rev.idx / rev.queue.length)}%"></span></div>`;
    if (it.kind === "card") {
      return head + `<div class="card flash ${rev.flipped ? "back" : ""}" data-rev="flip" role="button" tabindex="0">${rev.flipped ? `<div><div class="small muted">${esc(it.term)}</div>${esc(it.def)}</div>` : `<div><div class="small muted">Begriff</div><b>${esc(it.term)}</b><div class="small muted" style="margin-top:8px">Klicken oder Leertaste</div></div>`}</div>
        ${rev.flipped ? gradeRow("data-revgrade", c) : ""}<div class="btn-row" style="justify-content:center">${reportBtn({ kind: "Karteikarte", mod: it.mod, ref: it.id, text: it.term + ": " + it.def })}</div>`;
    }
    if (!rev.opt[id]) rev.opt[id] = shuffle(it.q.o.map((_, k) => k));
    return head + quizCard(it.q, rev.idx + 1, rev.chosen, rev.opt[id], `data-revq="1"`, { mod: it.mod }) +
      (rev.chosen === undefined ? "" : rev.chosen === it.q.a
        ? `<p class="small" style="text-align:center">Richtig – wie leicht fiel es dir? (Enter = Gut)</p>${gradeRow("data-revgrade", c, [2, 3, 4])}`
        : `<div class="btn-row" style="justify-content:center"><button class="btn primary" data-revgrade="1">Weiter (Enter) – kommt heute noch einmal</button></div>`);
  }
  /** Runde starten – ohne Optionen die tägliche Wiederholung, mit `mod` die Vorbereitung auf eine Prüfung (fällige + `newLimit` neue Elemente des Moduls). */
  function startReview(opts = {}) {
    const q = opts.mod ? R.buildQueue(ITEMS.filter((it) => it.mod === opts.mod), state.srs, today(), { newLimit: opts.newLimit || 0, kinds: state.srsCfg.kinds }) : srsQueue();
    rev = { active: true, mod: opts.mod || null, queue: q.all.map((x) => x.id), idx: 0, done: 0, correct: 0, requeued: {}, flipped: false, chosen: undefined, opt: {} };
  }
  function gradeReview(grade) {
    const id = rev.queue[rev.idx], ok = grade > 1;
    grade_srs(id, grade);
    rev.done++; if (ok) rev.correct++;
    if (!ok && !rev.requeued[id]) { rev.requeued[id] = true; rev.queue.push(id); }
    rev.idx++; rev.flipped = false; rev.chosen = undefined;
  }

  // ---------- Lernverlauf & Prüfungstermine ----------
  const WD = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"], MON = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  const parseDay = (day) => { const [y, m, d] = day.split("-").map(Number); return new Date(y, m - 1, d); };
  const dayLabel = (day, year) => { const dt = parseDay(day); return `${WD[dt.getDay()]} ${dt.getDate()}.${dt.getMonth() + 1}.${year ? dt.getFullYear() : ""}`; };
  const mondayOf = (day) => R.addDays(day, -((parseDay(day).getDay() + 6) % 7));
  /** Tageszähler: rev = Wiederholungen, quiz = Quiz-/Mischquiz-/Prüfungs-MC-Fragen, tr = Rechenaufgaben (erster Versuch), ex = Prüfungssimulationen; jeweils mit …Ok. */
  function logActivity(kind, ok) {
    const d = today(), e = state.log[d] || (state.log[d] = {});
    e[kind] = (e[kind] || 0) + 1; if (ok) e[kind + "Ok"] = (e[kind + "Ok"] || 0) + 1;
    const days = Object.keys(state.log); if (days.length > 800) days.sort().slice(0, days.length - 800).forEach((k) => delete state.log[k]);
  }
  const LOG_KINDS = ["rev", "quiz", "tr"];
  function dayTotals(day) {
    const e = state.log[day] || {}; let n = 0, ok = 0;
    LOG_KINDS.forEach((k) => { n += e[k] || 0; ok += e[k + "Ok"] || 0; });
    return { n, ok, ex: e.ex || 0 };
  }
  const isActive = (day) => { const t = dayTotals(day); return t.n + t.ex > 0; };
  function streak() {
    let d = today(), n = 0;
    if (!isActive(d)) d = R.addDays(d, -1); // heute noch nichts gemacht: die Serie bis gestern zählt noch
    while (isActive(d)) { n++; d = R.addDays(d, -1); }
    return n;
  }
  function examTitle(x) { const m = byId(x.mod); return x.title || (m ? `${m.id} ${m.short || m.title}` : x.mod); }
  function upcomingExams() { const d = today(); return state.exams.filter((x) => x.date >= d).sort((a, b) => a.date.localeCompare(b.date)); }
  /**
   * Tagesziel bis zur Prüfung: die noch neuen Elemente des Moduls gleichmäßig auf die Tage bis zum Vortag verteilen
   * (der Vortag bleibt fürs Wiederholen), dazu alle fälligen. `recall` = erwarteter Anteil abrufbarer Elemente am
   * Prüfungstag, wenn ab jetzt nicht mehr wiederholt wird (neue zählen als 0).
   */
  function examPlan(x) {
    const d = today(), left = R.daysBetween(d, x.date);
    const items = ITEMS.filter((it) => it.mod === x.mod && state.srsCfg.kinds.includes(it.kind));
    const learned = items.filter((it) => state.srs[it.id]), fresh = items.length - learned.length;
    const c = state.srsCfg.introduced, introToday = c && c.day === d && c.mods ? c.mods[x.mod] || 0 : 0;
    const newGoal = left > 0 ? Math.max(0, Math.ceil((fresh + introToday) / Math.max(1, left - 1)) - introToday) : 0;
    const due = items.filter((it) => R.isDue(state.srs[it.id], d)).length;
    const recall = items.length ? learned.reduce((s, it) => s + (R.cardRetrievability(state.srs[it.id], x.date) || 0), 0) / items.length : 0;
    return { left, total: items.length, learned: learned.length, fresh, newGoal: Math.min(fresh, newGoal), due, recall };
  }
  function homeExtras() {
    const s = streak(), next = upcomingExams()[0], parts = [];
    if (s) parts.push(`🔥 ${s} ${s === 1 ? "Tag" : "Tage"} in Folge gelernt`);
    if (next) {
      const p = examPlan(next), todo = p.newGoal + p.due;
      parts.push(`📅 <a href="#/verlauf">${esc(examTitle(next))}</a> ${p.left === 0 ? "heute" : `in ${p.left} ${p.left === 1 ? "Tag" : "Tagen"}`} · ${todo ? `Tagesziel: ${todo} Elemente` : "Tagesziel erreicht ✓"}`);
    } else parts.push(`📅 <a href="#/verlauf">Prüfungstermin eintragen</a> – mit Countdown und Tagesziel`);
    return `<p class="small">${parts.join(" · ")}</p>`;
  }

  // Diagramme in HTML/CSS (Beschriftungen bleiben auf dem Handy lesbar). Je Diagramm eine Datenreihe, daher ohne
  // Legende; Werte per Tooltip (data-tip) und vollständig in der Tabellenansicht darunter.
  function niceMax(v) { if (v <= 4) return 4; if (v <= 10) return 10; const p = Math.pow(10, Math.floor(Math.log10(v))), f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; }
  function chartFrame(ticks, fmtTick, plot, xLabels, n) {
    return `<div class="chart"><div class="ch-area">${ticks.map((t) => `<div class="ch-tick" style="bottom:${t.pos}%"><span>${esc(fmtTick(t.v))}</span></div>`).join("")}<div class="ch-plot">${plot}</div></div>
      <div class="ch-x" style="grid-template-columns:repeat(${n},minmax(0,1fr))" aria-hidden="true">${xLabels.map((l) => `<span class="${l.center ? "c" : ""}" style="grid-column:${l.col + 1} / span ${l.span}">${esc(l.text)}</span>`).join("")}</div></div>`;
  }
  const tableView = (head, rows) => `<details class="ch-table"><summary class="small">Als Tabelle</summary><div class="table-wrap"><table><thead><tr>${head.map((x, i) => `<th${i ? ' class="num"' : ""}>${esc(x)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((x, i) => `<td${i ? ' class="num"' : ""}>${esc(x)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details>`;
  function forecastChart(days) {
    const d = today(), fc = R.forecast(ITEMS, state.srs, d, days), max = niceMax(Math.max(...fc));
    const lab = (i) => (i === 0 ? "heute" : dayLabel(R.addDays(d, i)));
    const plot = `<div class="ch-bars" style="grid-template-columns:repeat(${days},minmax(0,1fr))">${fc.map((n, i) => `<div class="ch-col" data-tip="${esc(lab(i))}: ${n} fällig"><span class="ch-bar" style="height:${(100 * n / max).toFixed(1)}%"></span></div>`).join("")}</div>`;
    const xl = []; for (let i = 0; i < days; i += 7) xl.push({ col: i, span: Math.min(7, days - i), text: i === 0 ? "heute" : dayLabel(R.addDays(d, i)).slice(3) });
    return `<div role="img" aria-label="Säulendiagramm: fällige Wiederholungen pro Tag, Werte in der Tabelle darunter">` + chartFrame([0, max / 2, max].map((v) => ({ v, pos: 100 * v / max })), String, plot, xl, days) + `</div>` +
      tableView(["Tag", "fällig"], fc.map((n, i) => [lab(i), n]));
  }
  function weekStats(weeks) {
    const end = today(), mon = mondayOf(end), out = [];
    for (let w = weeks - 1; w >= 0; w--) {
      const start = R.addDays(mon, -7 * w); let n = 0, ok = 0;
      for (let i = 0; i < 7; i++) { const day = R.addDays(start, i); if (day > end) break; const t = dayTotals(day); n += t.n; ok += t.ok; }
      out.push({ start, n, ok, acc: n ? Math.min(1, ok / n) : null });
    }
    return out;
  }
  function accuracyChart(weeks) {
    const ws = weekStats(weeks), n = ws.length, x = (i) => 100 * (i + 0.5) / n, y = (a) => 100 - 100 * a;
    // Linie nur zwischen benachbarten Wochen mit Daten, Lücken bleiben sichtbar
    let path = ""; ws.forEach((w, i) => { if (w.acc == null) return; path += `${i && ws[i - 1].acc != null ? " L" : " M"}${x(i).toFixed(2)} ${y(w.acc).toFixed(2)}`; });
    const plot = `<svg class="ch-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${path.trim()}"/></svg>` +
      ws.map((w, i) => (w.acc == null ? "" : `<span class="ch-dot" style="left:${x(i).toFixed(2)}%;top:${y(w.acc).toFixed(2)}%"></span>`)).join("") +
      `<div class="ch-hit" style="grid-template-columns:repeat(${n},minmax(0,1fr))">${ws.map((w) => `<div data-tip="Woche ab ${esc(dayLabel(w.start))}: ${w.n ? `${pct(w.acc)} % richtig (${w.ok} von ${w.n})` : "keine Aufgaben"}"></div>`).join("")}</div>`;
    const xl = ws.map((w, i) => ({ col: i, span: 1, center: true, text: (n - 1 - i) % 2 === 0 ? dayLabel(w.start).slice(3) : "" })).filter((l) => l.text);
    return `<div role="img" aria-label="Liniendiagramm: Anteil richtiger Antworten pro Woche, Werte in der Tabelle darunter">` + chartFrame([0, 50, 100].map((v) => ({ v, pos: v })), (v) => v + " %", plot, xl, n) + `</div>` +
      tableView(["Woche ab", "Aufgaben", "richtig", "Quote"], ws.map((w) => [dayLabel(w.start, true), w.n, w.ok, w.n ? pct(w.acc) + " %" : "–"]));
  }
  // Stabilitätsverteilung: waagrechte Balken mit Zahl am Ende (Text liest sich auch ohne Grafik)
  function spanChart(st) {
    const max = Math.max(1, ...st.bySpan);
    return `<div class="hbars">${st.spans.map((l, i) => `<span class="small">${esc(l)}</span><span class="hbar-track" aria-hidden="true"><span class="hbar" style="width:${(100 * st.bySpan[i] / max).toFixed(1)}%"></span></span><span class="small num">${st.bySpan[i]}</span>`).join("")}</div>`;
  }
  // Lernkalender: ein Kästchen pro Tag, Spalten = Wochen (Mo–So), Farbstufen nach Anzahl bearbeiteter Aufgaben
  const HEAT = [1, 15, 40, 80], HEAT_LABELS = ["0", "1–14", "15–39", "40–79", "≥ 80"];
  const heatLevel = (n) => HEAT.filter((t) => n >= t).length;
  function heatmap(weeks) {
    const end = today(), start = R.addDays(mondayOf(end), -7 * (weeks - 1)), rows = [];
    let cells = ["Mo", "", "Mi", "", "Fr", "", "So"].map((l) => `<span class="hm-wd">${l}</span>`).join(""), months = "";
    for (let w = 0; w < weeks; w++) {
      const wStart = R.addDays(start, 7 * w);
      const first = [0, 1, 2, 3, 4, 5, 6].map((i) => R.addDays(wStart, i)).find((day) => day.endsWith("-01"));
      // Monatsname über der Woche mit dem Monatsersten; ganz links auch der angeschnittene Monat, wenn Platz ist
      const showStart = w === 0 && !first && ![1, 2].some((k) => [0, 1, 2, 3, 4, 5, 6].some((i) => R.addDays(wStart, 7 * k + i).endsWith("-01")));
      if (first || showStart) months += `<span style="grid-column:${w + 2} / span 3">${MON[parseDay(first || wStart).getMonth()]}</span>`;
      for (let i = 0; i < 7; i++) {
        const day = R.addDays(wStart, i);
        if (day > end) { cells += `<span class="hm-cell hm-none"></span>`; continue; }
        const t = dayTotals(day);
        if (t.n || t.ex) rows.push([dayLabel(day, true), t.n, t.n ? pct(t.ok / t.n) + " %" : "–", t.ex]);
        const tip = `${dayLabel(day, true)}: ${t.n ? `${t.n} ${t.n === 1 ? "Aufgabe" : "Aufgaben"}, ${pct(t.ok / t.n)} % richtig` : "nichts gelernt"}${t.ex ? `, ${t.ex} Prüfungssimulation${t.ex > 1 ? "en" : ""}` : ""}`;
        cells += `<span class="hm-cell hm${heatLevel(t.n)}${day === end ? " hm-today" : ""}" data-tip="${esc(tip)}"></span>`;
      }
    }
    return `<div class="heat" style="--w:${weeks}" role="img" aria-label="Lernkalender der letzten ${weeks} Wochen, Werte in der Tabelle darunter"><div class="hm-months" aria-hidden="true">${months}</div><div class="hm-grid">${cells}</div></div>
      <div class="hm-legend small muted"><span>Aufgaben pro Tag:</span>${HEAT_LABELS.map((l, i) => `<span class="hm-key"><span class="hm-cell hm${i}"></span>${l}</span>`).join("")}</div>
      ${tableView(["Tag", "Aufgaben", "richtig", "Prüfungen"], rows.reverse())}`;
  }
  let tipEl = null;
  function showTip(el) {
    if (!tipEl) { tipEl = document.createElement("div"); tipEl.className = "ch-tip"; tipEl.setAttribute("aria-hidden", "true"); document.body.appendChild(tipEl); }
    tipEl.textContent = el.dataset.tip; tipEl.style.display = "block";
    const r = el.getBoundingClientRect(), w = tipEl.offsetWidth, h = tipEl.offsetHeight;
    const left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), document.documentElement.clientWidth - w - 8);
    const top = r.top - h - 8 < 0 ? r.bottom + 8 : r.top - h - 8;
    tipEl.style.left = left + window.scrollX + "px"; tipEl.style.top = top + window.scrollY + "px";
    document.querySelectorAll(".tip-on").forEach((x) => x.classList.remove("tip-on")); el.classList.add("tip-on");
  }
  function hideTip() { if (tipEl) tipEl.style.display = "none"; document.querySelectorAll(".tip-on").forEach((x) => x.classList.remove("tip-on")); }
  const tipTarget = (ev) => ev.target && ev.target.closest && ev.target.closest(".chart [data-tip], .heat [data-tip]");
  document.addEventListener("pointerover", (ev) => { const el = tipTarget(ev); if (el) showTip(el); });
  document.addEventListener("pointerout", (ev) => { const el = tipTarget(ev); if (el && !(ev.relatedTarget && el.contains(ev.relatedTarget))) hideTip(); });

  function examCard(x) {
    const p = examPlan(x), todo = p.newGoal + p.due;
    return `<div class="card exam-card"><div class="exam-head"><div><b>${esc(examTitle(x))}</b>${x.title ? ` <span class="small muted">${esc(x.mod)}</span>` : ""}<div class="small muted">${esc(dayLabel(x.date, true))}</div></div>
        <div class="countdown"><b>${p.left === 0 ? "heute" : p.left}</b>${p.left === 0 ? "" : `<span class="small">${p.left === 1 ? "Tag" : "Tage"}</span>`}</div></div>
      <div class="progress" title="${p.learned} von ${p.total} begonnen"><span style="width:${pct(p.total ? p.learned / p.total : 0)}%"></span></div>
      <p class="small">${p.learned} von ${p.total} Elementen begonnen · <b>heute:</b> ${p.newGoal} neue + ${p.due} fällige · am Prüfungstag ohne weitere Wiederholung voraussichtlich abrufbar: ≈ ${pct(p.recall)} %</p>
      <div class="btn-row"><button class="btn primary" data-exstudy="${esc(x.id)}" ${todo ? "" : "disabled"}>${todo ? `Heute lernen (${todo})` : "Tagesziel erreicht ✓"}</button><a class="btn small" href="#/modul/${esc(x.mod)}/pruefung">Prüfungssimulation</a><button class="btn small" data-exdel="${esc(x.id)}">Entfernen</button></div></div>`;
  }
  function viewHistory() {
    const d = today(), st = R.stats(ITEMS, state.srs, d), q = srsQueue(), s = streak();
    let n7 = 0, ok7 = 0, act30 = 0;
    for (let i = 0; i < 30; i++) { const day = R.addDays(d, -i), t = dayTotals(day); if (i < 7) { n7 += t.n; ok7 += t.ok; } if (t.n + t.ex) act30++; }
    const next = upcomingExams(), past = state.exams.filter((x) => x.date < d).sort((a, b) => b.date.localeCompare(a.date));
    let h = `<h1>Lernverlauf & Prüfungstermine</h1><p class="muted">Wann du was gelernt hast, was in den nächsten Wochen fällig wird und wie du dich auf Prüfungen vorbereitest. Gezählt werden Wiederholungen, Fragen aus Quiz, Mischquiz und Prüfungssimulation sowie Rechenaufgaben (erster Versuch). Alles bleibt auf diesem Gerät und ist Teil der Sicherung.</p>
      <div class="stats">
        <div class="stat"><b>${s}</b>${s === 1 ? "Tag" : "Tage"} in Folge</div><div class="stat"><b>${act30}</b>Lerntage (30 Tage)</div>
        <div class="stat"><b>${n7}</b>Aufgaben (7 Tage)</div><div class="stat"><b>${n7 ? pct(ok7 / n7) + " %" : "–"}</b>richtig (7 Tage)</div><div class="stat"><b>${q.due.length}</b>heute fällig</div>
      </div>
      <h2>Prüfungstermine</h2>${next.length ? next.map(examCard).join("") : `<p class="muted">Noch keine Termine eingetragen.</p>`}
      <div class="card"><h3>Termin eintragen</h3><div class="form-row">
        <label>Modul <select id="exMod">${PP.modules.filter((m) => ITEMS.some((it) => it.mod === m.id)).map((m) => `<option value="${m.id}">${esc(m.id)} ${esc(m.short || m.title)}</option>`).join("")}</select></label>
        <label>Datum <input type="date" id="exDate" min="${d}"></label>
        <label>Bezeichnung <input type="text" id="exTitle" maxlength="80" placeholder="optional, z. B. 1. Termin"></label></div>
        <button class="btn primary" data-examadd="1">Termin speichern</button>
        <p class="small muted">Termine und Anmeldefristen stehen in u:find bzw. u:space. Das Tagesziel verteilt die noch neuen Begriffe und Quizfragen des Moduls gleichmäßig auf die Tage bis zum Vortag der Prüfung; dazu kommen die fälligen Wiederholungen.</p></div>
      ${past.length ? `<details class="topic"><summary>Vergangene Termine (${past.length})</summary><div class="t-body"><ul class="clean">${past.map((x) => `<li>${esc(dayLabel(x.date, true))} · ${esc(examTitle(x))} <button class="btn small" data-exdel="${esc(x.id)}">Entfernen</button></li>`).join("")}</ul></div></details>` : ""}
      <h2>Lernkalender</h2><div class="card">${heatmap(26)}</div>
      <div class="grid">
        <div class="card"><h3>Fällig in den nächsten 30 Tagen</h3><p class="small muted">Ohne neue Elemente; „heute“ enthält Überfälliges.</p>${forecastChart(30)}</div>
        <div class="card"><h3>Trefferquote pro Woche</h3><p class="small muted">Anteil richtig beantworteter Aufgaben, letzte 12 Wochen.</p>${accuracyChart(12)}</div>
      </div>
      <div class="card"><h3>Gedächtnisstabilität</h3><p class="small muted">Stabilität = Zeit, bis die Abrufwahrscheinlichkeit laut Modell auf 90 % sinkt. ${st.learned} von ${st.total} Elementen begonnen, ${st.mature} gefestigt (≥ 3 Wochen).</p>${spanChart(st)}</div>`;
    return h;
  }

  // ---------- Mischquiz ----------
  let mix = null;
  const PRESETS = { StEOP: ["A1", "A2"], Grundlagen: ["B1", "B2", "C1", "C2", "C3", "C5"], Methoden: ["D1", "D2", "E1", "E2"], Anwendung: ["F1", "F2", "F3", "G1"], Alles: null };
  function viewMix() {
    if (mix && mix.items) return mixSession();
    const sel = (mix && mix.sel) || PRESETS.StEOP;
    return `<h1>Mischquiz</h1><p class="muted">Fragen aus mehreren Modulen gemischt – so trainierst du, Wissen auseinanderzuhalten (Interleaving). Falsche Antworten landen in deiner Wiederholung.</p>
      <div class="card"><h3>Auswahl</h3><div class="btn-row">${Object.keys(PRESETS).map((k) => `<button class="btn small" data-mixpreset="${k}">${k}</button>`).join("")}</div>
      <div class="mod-checks">${PP.modules.filter((m) => (m.quiz || []).length).map((m) => `<label><input type="checkbox" class="mixMod" value="${m.id}" ${sel.includes(m.id) ? "checked" : ""}> ${esc(m.id)} <span class="muted small">${esc(m.short || m.title)} (${m.quiz.length})</span></label>`).join("")}</div>
      <div class="form-row"><label>Anzahl Fragen <select id="mixN">${[10, 20, 30, 50].map((n) => `<option ${n === ((mix && mix.n) || 20) ? "selected" : ""}>${n}</option>`).join("")}</select></label></div>
      <button class="btn primary" data-mix="start">Mischquiz starten</button></div>
      ${state.mix.length ? `<div class="card"><h3>Letzte Ergebnisse</h3><div class="table-wrap"><table><thead><tr><th>Datum</th><th>Module</th><th>Ergebnis</th></tr></thead><tbody>${state.mix.slice(-8).reverse().map((r) => `<tr><td>${esc(r.date.slice(0, 10))}</td><td>${esc(r.mods.join(", "))}</td><td class="num">${r.correct}/${r.n}</td></tr>`).join("")}</tbody></table></div></div>` : ""}`;
  }
  function startMix(mods, n) {
    const pools = mods.map((id) => shuffle((byId(id).quiz || []).map((q) => ({ mod: id, q }))));
    const out = [];
    for (let i = 0; out.length < n && pools.some((p) => p[i]); i++) shuffle(pools).forEach((p) => { if (p[i] && out.length < n) out.push(p[i]); });
    mix = { sel: mods, n, items: out, answers: {}, opt: out.map((x) => shuffle(x.q.o.map((_, k) => k))), saved: false };
  }
  function mixSession() {
    const answered = Object.keys(mix.answers).length, correct = mix.items.filter((x, i) => mix.answers[i] === x.q.a).length;
    let h = `<div class="sticky-bar"><b>${answered}/${mix.items.length}</b> beantwortet · <b>${correct}</b> richtig <button class="btn small" data-mix="new">Neues Mischquiz</button></div>`;
    mix.items.forEach((x, i) => { h += quizCard(x.q, i + 1, mix.answers[i], mix.opt[i], `data-mixq="${i}"`, { mod: x.mod, pill: modPill(x.mod) }); });
    if (answered === mix.items.length) {
      const per = {};
      mix.items.forEach((x, i) => { per[x.mod] = per[x.mod] || { n: 0, c: 0 }; per[x.mod].n++; if (mix.answers[i] === x.q.a) per[x.mod].c++; });
      if (!mix.saved) { state.mix.push({ date: new Date().toISOString(), mods: mix.sel, n: mix.items.length, correct }); state.mix = state.mix.slice(-50); save(); mix.saved = true; }
      h += `<div class="card"><h3>Ergebnis</h3><div class="score-big">${pct(correct / mix.items.length)} %</div><div class="table-wrap"><table><thead><tr><th>Modul</th><th>richtig</th><th></th></tr></thead><tbody>${Object.entries(per).map(([mod, v]) => `<tr><td>${modPill(mod)} ${esc(byId(mod).short || byId(mod).title)}</td><td class="num">${v.c}/${v.n}</td><td style="min-width:120px"><div class="progress"><span style="width:${pct(v.c / v.n)}%"></span></div></td></tr>`).join("")}</tbody></table></div>
        <div class="btn-row"><a class="btn primary" href="#/wiederholen">Fehler wiederholen</a><button class="btn" data-mix="new">Neues Mischquiz</button></div></div>`;
    }
    return h;
  }

  // ---------- Rechentrainer ----------
  let trainer = null;
  function generatorList(gens) {
    const byTopic = {};
    gens.forEach((g) => { (byTopic[g.topic] = byTopic[g.topic] || []).push(g); });
    return Object.entries(byTopic).map(([topic, list]) => `<h3>${esc(topic)}</h3><div class="grid">${list.map((g) => {
      const st = state.trainer[g.id];
      return `<a class="card module-card" href="#/rechentrainer/${g.id}"><span class="mc-title">${esc(g.title)}</span><span class="pills">${g.modules.map((x) => `<span class="pill">${x}</span>`).join("")}${st ? `<span class="pill ${st.solved ? "ok" : ""}">${st.solved || 0}/${st.tries} gelöst</span>` : ""}</span></a>`;
    }).join("")}</div>`).join("");
  }
  // Spalten mit ausschließlich Zahlen (inkl. „< .001“, leer, „—“) werden wie in jamovi rechtsbündig gesetzt
  function swTable(o) {
    const isNum = (c) => /^\s*(?:[<>]\s*)?[-−]?\.?\d/.test(String(c)), blank = (c) => c === "" || c === "—" || c == null;
    const num = o.head.map((_, i) => o.rows.some((r) => isNum(r[i])) && o.rows.every((r) => blank(r[i]) || isNum(r[i])));
    const cls = (i) => (num[i] ? ' class="num"' : "");
    return `<div class="sw-table"><div class="sw-title">${esc(o.title)}</div><div class="table-wrap"><table><thead><tr>${o.head.map((c, i) => `<th${cls(i)}>${esc(c)}</th>`).join("")}</tr></thead><tbody>${o.rows.map((r) => `<tr>${r.map((c, i) => `<td${cls(i)}>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>${o.note ? `<div class="sw-note">${esc(o.note)}</div>` : ""}</div>`;
  }
  function viewTrainer(genId, seedStr) {
    if (!genId) {
      return `<h1>Statistik-Rechentrainer</h1><p class="muted">Aufgaben zu Statistik (D1), Testtheorie (D2) und Diagnostik (E1) mit neuen Zahlen bei jedem Durchgang. Gib Ergebnisse mit Komma oder Punkt ein; gerundete Werte werden mit kleiner Toleranz akzeptiert. Für Tests werden kritische Werte angegeben – wie in einer Klausur mit Tabellenanhang.</p>
        <p><a class="btn" href="#/datensaetze">Zu den Übungsdatensätzen für jamovi/R →</a></p>` + generatorList(T.generators);
    }
    const g = T.generators.find((x) => x.id === genId);
    if (!g) return `<h1>Aufgabe nicht gefunden</h1><p><a href="#/rechentrainer">Zur Übersicht</a></p>`;
    let seed = parseInt(seedStr, 10);
    if (!(seed > 0)) { seed = 1 + Math.floor(Math.random() * 999999); history.replaceState(null, "", `#/rechentrainer/${genId}/${seed}`); }
    if (!trainer || trainer.id !== genId || trainer.seed !== seed) trainer = { id: genId, seed, task: T.make(genId, seed), inputs: {}, result: null, showSolution: false };
    const t = trainer.task;
    let h = `<p class="small muted"><a href="#/rechentrainer">Rechentrainer</a> › ${esc(t.topic)}</p><h1>${esc(t.title)}</h1>
      <div class="pills">${t.modules.map((x) => modPill(x)).join("")}<span class="pill">Aufgabe Nr. ${seed}</span></div>
      <div class="card"><p>${esc(t.intro)}</p>`;
    if (t.table) h += `<div class="table-wrap"><table class="data"><thead><tr>${t.table.head.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${t.table.rows.map((r) => `<tr>${r.map((c) => `<td class="num">${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    // Software-Ausgabe im Stil von jamovi/SPSS (Zahlen mit Dezimalpunkt, wie in den Programmen)
    if (t.output) h += `<div class="sw-output"><div class="sw-label">Ausgabe (nachgebildet, simulierte Daten)</div>${t.output.map(swTable).join("")}</div>`;
    h += `</div><form class="card answers" id="trainerForm" autocomplete="off">`;
    t.answers.forEach((a, i) => {
      const ok = trainer.result ? trainer.result[i] : null, val = trainer.inputs[a.key] || "";
      const field = a.type === "choice"
        ? `<select id="tr-${a.key}" data-tr="${a.key}"><option value="">– wählen –</option>${a.options.map((o) => `<option ${val === o ? "selected" : ""}>${esc(o)}</option>`).join("")}</select>`
        : `<input type="text" inputmode="decimal" id="tr-${a.key}" data-tr="${a.key}" value="${esc(val)}" placeholder="Ergebnis">`;
      h += `<div class="answer ${ok === true ? "is-ok" : ok === false ? "is-bad" : ""}"><label for="tr-${a.key}">${esc(a.label)}${a.unit ? ` <span class="muted">(${esc(a.unit)})</span>` : ""}</label>${field}<span class="mark" aria-live="polite">${ok === true ? "✓" : ok === false ? "✗" : ""}</span>${trainer.showSolution ? `<span class="small muted">Lösung: <b>${esc(T.display(a))}</b></span>` : ""}</div>`;
    });
    h += `<div class="btn-row"><button class="btn primary" type="submit">Prüfen</button><button class="btn" type="button" data-trainer="solution">${trainer.showSolution ? "Lösungsweg ausblenden" : "Lösungsweg zeigen"}</button><button class="btn" type="button" data-trainer="new">Neue Aufgabe</button>${reportBtn({ kind: "Rechenaufgabe", mod: t.modules[0], ref: `${genId}#${seed}`, text: t.title + " (Aufgabe Nr. " + seed + ")" })}</div></form>`;
    if (trainer.showSolution) h += `<div class="card solution"><h3>Lösungsweg</h3><ol>${t.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>`;
    return h;
  }
  function checkTrainer() {
    const t = trainer.task;
    document.querySelectorAll("[data-tr]").forEach((el) => { trainer.inputs[el.dataset.tr] = el.value; });
    trainer.result = T.check(t, trainer.inputs);
    const allOk = trainer.result.every(Boolean);
    if (!trainer.counted) {
      const st = state.trainer[t.id] || { tries: 0, solved: 0 };
      st.tries++; if (allOk) st.solved++; state.trainer[t.id] = st; trainer.counted = true; logActivity("tr", allOk); save();
    } else if (allOk && !trainer.solvedCounted) { state.trainer[t.id].solved++; save(); }
    if (allOk) trainer.solvedCounted = true;
    toast(allOk ? "Alles richtig!" : `${trainer.result.filter(Boolean).length} von ${trainer.result.length} richtig.`);
  }

  // ---------- Übungsdatensätze ----------
  const fmtRes = (r) => (r.p && r.value < 0.001 ? "< ,001" : S.fmt(r.value, r.d));
  function viewDatasets() {
    const ds = PP.datasets || [];
    return `<h1>Übungsdatensätze</h1><p class="muted">Fiktive, realistisch simulierte Datensätze zum Üben in jamovi, JASP oder R. Jede Aufgabe hat Referenzergebnisse zum Selbstkontrollieren. Die CSV-Dateien verwenden Komma als Trennzeichen und Punkt als Dezimalzeichen (in jamovi/R direkt lesbar; in Excel ggf. über „Daten → Aus Text/CSV“ importieren).</p>` +
      ds.map((d) => {
        const rows = d.csv.trim().split("\n").slice(1, 9).map((l) => l.split(","));
        return `<section class="card dataset" id="ds-${d.id}"><h2>${esc(d.title)}</h2><div class="pills">${d.modules.map(modPill).join("")}<span class="pill">${d.n} Fälle</span><span class="pill">${d.columns.length} Variablen</span></div>
          <p>${esc(d.description)}</p>
          <div class="btn-row"><button class="btn primary" data-dssave="${d.id}">CSV speichern</button><button class="btn" data-dscopy="${d.id}">CSV kopieren</button>${IN_ARTIFACT || IS_NATIVE ? "" : `<a class="btn" href="${esc(d.file)}" download>Datei direkt öffnen</a>`}</div>
          <h3>Variablen</h3><div class="table-wrap"><table><thead><tr><th>Name</th><th>Bedeutung</th><th>Skalenniveau</th></tr></thead><tbody>${d.variables.map((v) => `<tr><td><code>${esc(v[0])}</code></td><td>${esc(v[1])}</td><td>${esc(v[2])}</td></tr>`).join("")}</tbody></table></div>
          <details class="topic"><summary>Vorschau (erste 8 Zeilen)</summary><div class="t-body table-wrap"><table class="data"><thead><tr>${d.columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td class="num">${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div></details>
          <h3>Aufgaben</h3><ol class="ds-tasks">${d.tasks.map((t) => `<li><p>${esc(t.q)}</p><p class="small muted">${esc(t.hint)}</p>
            <details><summary>Referenzergebnis anzeigen</summary><div class="table-wrap"><table><tbody>${t.results.map((r) => `<tr><td>${esc(r.label)}</td><td class="num"><b>${esc(fmtRes(r))}</b></td></tr>`).join("")}</tbody></table></div></details></li>`).join("")}</ol>
          <p class="small muted">In R laden: <code>d &lt;- read.csv("${esc(d.file.split("/").pop())}")</code></p></section>`;
      }).join("");
  }

  // ---------- Anki-Export ----------
  let ankiSel = null;
  function viewAnki() {
    if (!ankiSel) ankiSel = { mods: PP.modules.map((m) => m.id), kinds: ["card", "quiz", "exam"] };
    const mods = PP.modules.filter((m) => ankiSel.mods.includes(m.id));
    const rows = A.rows(mods, { kinds: ankiSel.kinds });
    return `<h1>Anki-Export</h1><p class="muted">Erzeugt eine Importdatei für <a href="https://apps.ankiweb.net/" target="_blank" rel="noopener noreferrer">Anki</a>: Begriffe, Quizfragen (mit Antwortoptionen und Erklärung) und offene Prüfungsfragen mit Musterlösung. Jedes Modul wird ein eigener Unterstapel unter „${esc(A.DECK)}“.</p>
      <div class="card"><h3>Auswahl</h3>
        <div class="form-row">${[["card", "Begriffe"], ["quiz", "Quizfragen"], ["exam", "Prüfungsfragen"]].map(([k, l]) => `<label><input type="checkbox" class="ankiKind" value="${k}" ${ankiSel.kinds.includes(k) ? "checked" : ""}> ${l}</label>`).join("")}</div>
        <div class="btn-row"><button class="btn small" data-ankimods="all">alle Module</button><button class="btn small" data-ankimods="none">keine</button></div>
        <div class="mod-checks">${PP.modules.map((m) => `<label><input type="checkbox" class="ankiMod" value="${m.id}" ${ankiSel.mods.includes(m.id) ? "checked" : ""}> ${esc(m.id)} <span class="muted small">${esc(m.short || m.title)}</span></label>`).join("")}</div>
        <p><b>${rows.length}</b> Karten ausgewählt.</p>
        <div class="btn-row"><button class="btn primary" data-anki="save" ${rows.length ? "" : "disabled"}>Datei speichern (.txt)</button><button class="btn" data-anki="copy" ${rows.length ? "" : "disabled"}>In Zwischenablage kopieren</button></div></div>
      <div class="card"><h3>So importierst du die Datei</h3><ol>
        <li>Anki am Computer öffnen (Version 2.1.55 oder neuer) → <b>Datei → Importieren</b> → die gespeicherte <code>.txt</code>-Datei wählen.</li>
        <li>Notiztyp <b>„Einfach“ (Basic)</b>; Feld 1 → Vorderseite, Feld 2 → Rückseite. Stapel und Schlagwörter übernimmt Anki aus Spalte 3 und 4.</li>
        <li>„HTML in Feldern erlauben“ bleibt aktiviert (Antwortlisten und Hervorhebungen).</li>
        <li>Auf dem Handy: mit AnkiWeb synchronisieren, dann in AnkiDroid oder AnkiMobile lernen.</li>
        <li>Bei einem erneuten Import aktualisiert Anki vorhandene Karten mit gleicher Vorderseite, statt sie doppelt anzulegen (Standardeinstellung „Aktualisieren“).</li></ol></div>
      ${rows.length ? `<div class="card"><h3>Vorschau</h3><div class="table-wrap"><table class="anki-prev"><thead><tr><th>Vorderseite</th><th>Rückseite</th><th>Stapel</th></tr></thead><tbody>${rows.slice(0, 4).map((r) => `<tr><td>${r[0]}</td><td>${r[1]}</td><td class="small">${esc(r[2])}</td></tr>`).join("")}</tbody></table></div></div>` : ""}`;
  }

  // ---------- Prüfmodus ----------
  function verifyItems() {
    const V = PP.verification, out = [];
    V.global.forEach((g) => out.push(Object.assign({ group: "Allgemein" }, g)));
    PP.modules.filter((m) => m.group !== "0").forEach((m) => {
      const grp = `${m.id} · ${m.title}`;
      out.push({ group: grp, mod: m.id, id: `${m.id}-titel`, text: `Modulbezeichnung: „${m.title}“` });
      out.push({ group: grp, mod: m.id, id: `${m.id}-ects`, text: `Umfang: ${m.ects ? m.ects + " ECTS" : "Teil des Wahlbereichs"}` });
      out.push({ group: grp, mod: m.id, id: `${m.id}-lvs`, text: `Lehrveranstaltungen: ${(m.lvs || []).map((l) => `${l.type} „${l.title}“${l.ects ? ` (${l.ects} ECTS)` : ""}, ${l.pi ? "prüfungsimmanent" : "nicht prüfungsimmanent"}`).join("; ") || "–"}` });
      if (m.steop) out.push({ group: grp, mod: m.id, id: `${m.id}-steop`, text: "Gehört zur StEOP." });
      ((V.modules || {})[m.id] || []).forEach((x) => out.push(Object.assign({ group: grp, mod: m.id }, x)));
    });
    return out;
  }
  function viewVerify(sub, mod) {
    sub = ["curriculum", "inhalte", "meldungen", "links"].includes(sub) ? sub : "curriculum";
    const reports = Object.values(state.reports).sort((a, b) => b.created.localeCompare(a.created));
    const open = reports.filter((r) => r.status !== "erledigt").length;
    let h = `<h1>Prüfmodus</h1><p class="muted">Inhalte prüfen und Fehler sammeln, damit die App verlässlich wird.</p>
      <nav class="tabs"><a href="#/pruefmodus/curriculum" class="${sub === "curriculum" ? "active" : ""}">Curriculum-Abgleich</a><a href="#/pruefmodus/inhalte" class="${sub === "inhalte" ? "active" : ""}">Inhalte prüfen</a><a href="#/pruefmodus/meldungen" class="${sub === "meldungen" ? "active" : ""}">Fehlermeldungen<span class="cnt">${open}</span></a><a href="#/pruefmodus/links" class="${sub === "links" ? "active" : ""}">Linkprüfung</a></nav>`;
    if (sub === "inhalte") {
      h += viewContentReview(mod);
    } else if (sub === "curriculum") {
      const items = verifyItems(), st = (id) => (state.verify[id] || {}).s || "";
      const nOk = items.filter((i) => st(i.id) === "ok").length, nDiff = items.filter((i) => st(i.id) === "diff").length;
      h += `<div class="card"><h3>So gehst du vor</h3><ol>${PP.verification.howto.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>
        <p class="small">Quelle: ${esc(PP.verification.source)}</p><ul class="small">${PP.meta.officialLinks.slice(0, 4).map((l) => `<li>${link(l.url, l.title)}</li>`).join("")}</ul></div>
        <div class="sticky-bar"><b>${nOk + nDiff}/${items.length}</b> geprüft · <span class="pill ok">${nOk} stimmt</span> <span class="pill bad">${nDiff} weicht ab</span>
          <button class="btn small" data-verify="copy">Abweichungen kopieren</button>${nDiff ? `<a class="btn small" href="${esc(issueUrl("Curriculum-Abgleich: " + nDiff + " Abweichungen", verifyMarkdown()))}" target="_blank" rel="noopener noreferrer">Als GitHub-Issue</a>` : ""}${IN_ARTIFACT ? `<span class="small muted">${cloud.db ? "wird gespeichert" : "nur lokal"}</span>` : ""}</div>`;
      let lastGroup = "";
      items.forEach((it) => {
        if (it.group !== lastGroup) { if (lastGroup) h += `</div>`; h += `<h3>${esc(it.group)}</h3><div class="card verify-list">`; lastGroup = it.group; }
        const v = state.verify[it.id] || {};
        h += `<div class="verify-row ${v.s === "ok" ? "is-ok" : v.s === "diff" ? "is-bad" : ""}"><div>${it.unsure ? '<span class="pill warn">unsicher</span> ' : ""}${esc(it.text)}</div>
          <div class="rating">${[["ok", "stimmt"], ["diff", "weicht ab"], ["", "offen"]].map(([k, l]) => `<button data-vset="${it.id}" data-v="${k}" class="${(v.s || "") === k ? "on" : ""}">${l}</button>`).join("")}</div>
          <input type="text" data-vnote="${it.id}" aria-label="Notiz zu ${esc(it.text.slice(0, 40))}" value="${esc(v.note || "")}" placeholder="Laut Curriculum (mit Seitenzahl): …"></div>`;
      });
      h += `</div>`;
    } else if (sub === "meldungen") {
      h += `<div class="btn-row"><button class="btn primary" data-reports="copy" ${reports.length ? "" : "disabled"}>Alle offenen als Markdown kopieren</button><button class="btn" data-reports="save" ${reports.length ? "" : "disabled"}>Als Datei speichern (.md)</button></div>
        ${IN_ARTIFACT ? `<p class="small muted">${cloud.db ? "Meldungen werden zusätzlich in der Datenbank dieser Seite gespeichert und können dort ausgewertet werden." : "Datenbank nicht verfügbar – Meldungen sind nur in diesem Browser gespeichert."}</p>` : ""}`;
      if (!reports.length) h += `<div class="card"><p>Noch keine Meldungen. Über <b>⚑ Fehler melden</b> an Quizfragen, Lernthemen, Karteikarten, Links, Büchern und Rechenaufgaben kannst du Fehler erfassen.</p></div>`;
      reports.forEach((r) => {
        const url = issueUrl(`[${r.category}] ${r.mod || "allgemein"}: ${String(r.text || "").slice(0, 60)}`, reportMarkdown(r));
        h += `<div class="card report ${r.status === "erledigt" ? "done" : ""}"><div class="pills"><span class="pill ${r.status === "erledigt" ? "ok" : "warn"}">${esc(r.status)}</span><span class="pill">${esc(r.category)}</span>${r.mod ? modPill(r.mod) : ""}<span class="pill">${esc(r.kind)}</span><span class="small muted">${esc(r.created.slice(0, 16).replace("T", " "))}${IN_ARTIFACT ? (r.synced ? " · gespeichert" : " · nur lokal") : ""}</span></div>
          <blockquote class="small">${esc(r.text)}</blockquote>${r.url ? `<p class="small">${link(r.url, r.url)}</p>` : ""}<p><b>Problem:</b> ${esc(r.comment)}</p>${r.fix ? `<p><b>Vorschlag:</b> ${esc(r.fix)}</p>` : ""}
          <div class="btn-row">${url ? `<a class="btn small" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Als GitHub-Issue anlegen</a>` : ""}<button class="btn small" data-rep="${r.id}" data-repact="toggle">${r.status === "erledigt" ? "wieder öffnen" : "als erledigt markieren"}</button><button class="btn small" data-rep="${r.id}" data-repact="delete">löschen</button></div></div>`;
      });
    } else {
      const ls = PP.linkStatus;
      h += `<div class="card"><h3>Linkprüfung</h3><p>Die Links werden jeden Montag automatisch auf GitHub geprüft (Workflow „Linkprüfung“). Defekte Links landen in einem Issue mit dem Label <code>linkpruefung</code>, die Befunde kommen mit dem nächsten Release in die App. Von Hand lässt sich die Prüfung auf GitHub unter <i>Actions → Linkprüfung → Run workflow</i> starten oder auf dem eigenen Rechner (Node.js ab Version 18):</p>
        <pre><code>npm install
npm run check-links</code></pre>
        <p class="small">Es prüft alle ${PP.modules.reduce((s, m) => s + (m.materials || []).length + (m.lectures || []).length, 0)} Modul-Links sowie allgemeine Ressourcen, schreibt einen Bericht nach <code>reports/link-report.md</code> und aktualisiert <code>data/link-status.js</code>. Danach markiert die App defekte Links direkt an der Fundstelle. Optionen: <code>--no-search</code> (Suchlinks überspringen), <code>--only=youtube</code> (nur passende URLs), <code>--strict</code> (Fehlercode bei defekten Links, z. B. für CI).</p></div>`;
      if (!ls) h += `<div class="notice info">Noch keine Prüfergebnisse vorhanden.</div>`;
      else {
        const res = Object.entries(ls.results || {}), bad = res.filter(([, v]) => v.status === "defekt"), unc = res.filter(([, v]) => v.status === "unklar");
        h += `<div class="card"><h3>Ergebnis vom ${esc(ls.checkedAt.slice(0, 16).replace("T", " "))}</h3><div class="pills"><span class="pill ok">${ls.summary.ok} erreichbar</span><span class="pill bad">${ls.summary.defekt} defekt</span><span class="pill warn">${ls.summary.unklar} unklar</span><span class="pill">${ls.summary.total} geprüft</span></div></div>`;
        [["Defekte Links", bad], ["Manuell prüfen", unc]].forEach(([title, list]) => {
          if (!list.length) return;
          h += `<h3>${title}</h3><div class="card table-wrap"><table><thead><tr><th>Link</th><th>Fundort</th><th>Befund</th></tr></thead><tbody>${list.map(([u, v]) => `<tr><td>${link(u, v.title || u)}</td><td class="small">${esc((v.where || []).join("; "))}</td><td class="small">${esc(v.detail || "")}</td></tr>`).join("")}</tbody></table></div>`;
        });
      }
    }
    return h;
  }
  // Fachliche Prüfung: Übersicht je Modul bzw. alle Inhalte eines Moduls mit Prüfvermerk
  // Gerade bearbeitete Einträge bleiben sichtbar, auch wenn sie nicht mehr zum Filter passen (Beleg nachtragen)
  let reviewFilter = "offen", reviewSticky = { mod: "", ids: new Set() };
  function viewContentReview(mod) {
    const m = mod && byId(mod);
    const all = RV.stats(RITEMS, PP.review, state.review);
    let h = `<div class="card"><h3>So gehst du vor</h3><ol>
        <li>Modul wählen und Thema bzw. Frage mit einem Lehrbuch oder der angegebenen Quelle vergleichen.</li>
        <li>Stimmt alles: <b>✓ geprüft</b> und im Feld den Beleg festhalten (Buch, Auflage, Seite).</li>
        <li>Fehler gefunden: <b>✗ Fehler</b> – das öffnet eine Fehlermeldung mit Korrekturvorschlag.</li>
        <li>Ab und zu <b>exportieren</b> und die Datei weitergeben: Mit <code>node tools/merge-review.mjs</code> kommen die Vermerke in <code>data/review.js</code> und sind dann für alle als „fachlich geprüft“ sichtbar.</li></ol>
      <p class="small muted">Alle Inhalte wurden mit KI-Unterstützung erstellt. Solange ein Inhalt nicht geprüft ist, steht an ihm „ungeprüft“. Ändert sich ein Text später, gilt er wieder als ungeprüft.</p>
      <div class="form-row"><label for="reviewer">Dein Kürzel für Prüfvermerke</label><input type="text" id="reviewer" value="${esc(state.settings.reviewer)}" placeholder="z. B. JD" maxlength="20"></div></div>
      <div class="sticky-bar"><b>${all.all.ok}/${all.all.total}</b> Inhalte geprüft${all.all.fehler ? ` · <span class="pill bad">${all.all.fehler} mit Fehler</span>` : ""}
        <button class="btn small" data-review="copy" ${Object.keys(state.review).length ? "" : "disabled"}>Eigene Vermerke kopieren</button><button class="btn small" data-review="save" ${Object.keys(state.review).length ? "" : "disabled"}>Als Datei speichern</button>${IN_ARTIFACT ? `<span class="small muted">${cloud.db ? "wird gespeichert" : "nur lokal"}</span>` : ""}</div>`;
    if (!m) {
      h += `<div class="card table-wrap"><table><thead><tr><th>Modul</th><th>Lernthemen</th><th>Quizfragen</th><th>Prüfungsfragen</th><th></th></tr></thead><tbody>` +
        PP.modules.map((x) => {
          const p = all.per[x.id], cell = (k) => p[k].total ? `${p[k].ok}/${p[k].total}${p[k].fehler ? ` <span class="pill bad">${p[k].fehler}</span>` : ""}` : "–";
          return `<tr><td><a href="#/pruefmodus/inhalte/${esc(x.id)}">${esc(x.id)} ${esc(x.short || x.title)}</a></td><td class="num">${cell("topic")}</td><td class="num">${cell("quiz")}</td><td class="num">${cell("exam")}</td><td><a class="btn small" href="#/pruefmodus/inhalte/${esc(x.id)}">prüfen</a></td></tr>`;
        }).join("") + `</tbody></table></div>`;
      return h;
    }
    const items = RITEMS.filter((it) => it.mod === m.id);
    const matches = (it, f) => { const st = reviewOf(it.id); return f === "alle" || (f === "offen" ? !st : f === "geprueft" ? !!st && st.s === "ok" : !!st && st.s === "fehler"); };
    if (reviewSticky.mod !== m.id) reviewSticky = { mod: m.id, ids: new Set() };
    const show = (it) => matches(it, reviewFilter) || reviewSticky.ids.has(it.id);
    h += `<p><a href="#/pruefmodus/inhalte">← alle Module</a></p><h2>${esc(m.id)} · ${esc(m.title)}</h2>
      <div class="btn-row">${[["offen", "ungeprüft"], ["geprueft", "geprüft"], ["fehler", "mit Fehler"], ["alle", "alle"]].map(([k, l]) => `<button class="btn small ${reviewFilter === k ? "primary" : ""}" data-rfilter="${k}">${l} (${items.filter((it) => matches(it, k)).length})</button>`).join("")}</div>`;
    ["topic", "quiz", "exam"].forEach((kind) => {
      const list = items.filter((it) => it.kind === kind && show(it));
      if (!list.length) return;
      h += `<h3>${{ topic: "Lernthemen", quiz: "Quizfragen", exam: "Prüfungsfragen" }[kind]} (${list.length})</h3><div class="card verify-list">`;
      list.forEach((it) => {
        const v = state.review[it.id] || {}, st = reviewOf(it.id), x = it.item;
        let body;
        if (kind === "topic") body = `<b>${esc(x.title)}</b><details><summary class="small">Text anzeigen</summary>${rich(x.text)}</details>${sourcesHtml(m, x)}`;
        else if (kind === "quiz") body = `<b>${esc(x.q)}</b><ol type="A" class="small">${x.o.map((o, k) => `<li class="${k === x.a ? "correct-opt" : ""}">${esc(o)}${k === x.a ? " ✓" : ""}</li>`).join("")}</ol><div class="small muted">${esc(x.e || "")}</div>`;
        else body = `<b>${esc(x.q)}</b> <span class="pill">${x.p} P.</span><details><summary class="small">Musterlösung</summary><div class="solution small">${rich(x.s)}</div></details>`;
        h += `<div class="verify-row ${st && st.s === "ok" ? "is-ok" : st && st.s === "fehler" ? "is-bad" : ""}"><div>${body}${st && !st.local ? `<div class="small muted">Gemeinsamer Vermerk: ${esc([st.by, st.date, st.note].filter(Boolean).join(" · "))}</div>` : ""}</div>
          <div class="rating">${[["ok", "✓ geprüft"], ["fehler", "✗ Fehler"], ["", "offen"]].map(([k, l]) => `<button data-rset="${it.id}" data-r="${k}" class="${(v.s || "") === k ? "on" : ""}">${l}</button>`).join("")}</div>
          <input type="text" data-rnote="${it.id}" aria-label="Beleg" value="${esc(v.note || "")}" placeholder="Beleg: Buch, Auflage, Seite …"></div>`;
      });
      h += `</div>`;
    });
    return h;
  }
  function setReview(id, s) {
    const it = RITEM.get(id); if (!it) return;
    if (!s) {
      const v = state.review[id];
      if (v) { delete v.s; delete v.by; delete v.date; if (!v.note) delete state.review[id]; }
      save(); pushReview(); return;
    }
    const v = state.review[id] = state.review[id] || {};
    v.s = s; v.by = state.settings.reviewer || ""; v.date = today();
    save(); pushReview();
    if (s === "fehler") {
      const x = it.item, text = it.kind === "topic" ? x.title : it.kind === "quiz" ? x.q + " → " + x.o[x.a] : x.q;
      openReport({ kind: RV.KINDS[it.kind], mod: it.mod, ref: id, text });
    }
  }
  function reviewExport() {
    return JSON.stringify(RV.exportData(state.review, { reviewer: state.settings.reviewer, version: V.version, exported: new Date().toISOString() }), null, 2);
  }

  function verifyMarkdown() {
    const items = verifyItems();
    const diffs = items.filter((i) => (state.verify[i.id] || {}).s === "diff");
    return `## Curriculum-Abgleich (${new Date().toISOString().slice(0, 10)})\n\n` + (diffs.length ? diffs.map((i) => `- **${i.group}** – ${i.text}\n  - Laut Curriculum: ${(state.verify[i.id] || {}).note || "(keine Notiz)"}`).join("\n") : "Keine Abweichungen markiert.") + "\n";
  }

  // ---------- Weitere Seiten ----------
  function viewLibrary() {
    let h = `<h1>Fachliteratur & Bibliotheken</h1><p>Alle Lehrbücher aus allen Modulen mit Direktsuche. Viele deutschsprachige Psychologie-Lehrbücher sind bei Springer erschienen und über Hochschullizenzen (KIT, Uni Wien) als kostenloses E-Book abrufbar.</p>`;
    h += `<h2>Bibliotheken</h2><div class="grid">` + PP.libraries.filter((l) => l.info).map((l) => `<div class="card"><h3>${link(l.home, l.name)}</h3><p class="small">${esc(l.info)}</p>${(l.links || []).map((x) => `<div class="small">→ ${link(x.url, x.title)}</div>`).join("")}</div>`).join("") + `</div>`;
    h += `<h2>Alle Bücher nach Modul</h2><p><input type="text" id="litFilter" aria-label="Bücher filtern" placeholder="Filtern nach Titel, Autor:in …" style="width:100%"></p><div id="litAll">`;
    PP.modules.forEach((m) => {
      if (!(m.literature || []).length) return;
      h += `<div class="lit-mod"><h3><a href="#/modul/${m.id}/literatur">${esc(m.id)} · ${esc(m.title)}</a></h3><div class="card"><ul class="clean">` +
        m.literature.map((b) => `<li class="resource" data-filter="${esc((b.title + " " + b.authors).toLowerCase())}"><div class="r-title">${esc(b.title)}</div><div class="small">${esc(b.authors)} · ${esc(b.year || "")} · ${esc(b.publisher || "")} ${b.tag ? `<span class="pill">${esc(b.tag)}</span>` : ""}</div>${libButtons(b)}</li>`).join("") + `</ul></div></div>`;
    });
    return h + `</div>`;
  }
  function viewResources() {
    const g = PP.general;
    return `<h1>Offene Ressourcen (modulübergreifend)</h1><h2>Offene Lehrbücher</h2>${resourceList(g.openTextbooks)}<h2>Kurse & Vorlesungsreihen</h2>${resourceList(g.courses)}
      <h2>Lexika, Datenbanken, Zitierstil</h2>${resourceList(g.reference)}<h2>Software & Werkzeuge</h2>${resourceList(g.tools)}`;
  }
  function viewCareer() {
    return `<h1>Nach dem Bachelor</h1>${PP.careers.map((c) => `<div class="card"><h3>${esc(c.title)}</h3><p>${esc(c.text)}</p></div>`).join("")}
      <h2>Links</h2><ul>${PP.careerLinks.map((l) => `<li>${link(l.url, l.title)} ${linkBadge(l.url)}</li>`).join("")}</ul>`;
  }
  function viewGlossary() {
    const all = [];
    PP.modules.forEach((m) => (m.glossary || []).forEach(([t, d]) => all.push({ t, d, m })));
    all.sort((a, b) => a.t.localeCompare(b.t, "de"));
    return `<h1>Glossar <span class="pill">${all.length} Begriffe</span></h1><p><input type="text" id="glFilter" aria-label="Glossar filtern" placeholder="Begriff filtern …" style="width:100%"></p><div class="card"><dl id="glList">` +
      all.map((x) => `<div data-filter="${esc((x.t + " " + x.d).toLowerCase())}"><dt><b>${esc(x.t)}</b> <a class="pill" href="#/modul/${x.m.id}/karten">${esc(x.m.id)}</a></dt><dd class="small">${esc(x.d)}</dd></div>`).join("") + `</dl></div>`;
  }
  function viewProgress() {
    const st = R.stats(ITEMS, state.srs, today());
    const tr = Object.values(state.trainer).reduce((s, x) => ({ tries: s.tries + x.tries, solved: s.solved + (x.solved || 0) }), { tries: 0, solved: 0 });
    let h = `<h1>Fortschritt</h1><div class="stats">
      <div class="stat"><b>${ectsDone()}/${PP.meta.ects}</b>ECTS abgehakt</div><div class="stat"><b>${st.learned}</b>Karten begonnen</div><div class="stat"><b>${st.mature}</b>Karten gefestigt</div>
      <div class="stat"><b>${tr.solved}/${tr.tries}</b>Rechenaufgaben gelöst</div><div class="stat"><b>${state.mix.length}</b>Mischquizze</div></div>
      <div class="card table-wrap" style="margin-top:14px"><table><thead><tr><th>Modul</th><th>ECTS</th><th>Fortschritt</th><th>Selbsteinsch.</th><th>Quiz</th><th>Prüfung</th><th>Karten</th><th>✓</th></tr></thead><tbody>`;
    PP.modules.forEach((m) => {
      const items = ITEMS.filter((it) => it.mod === m.id), learned = items.filter((it) => state.srs[it.id]).length;
      h += `<tr><td><a href="#/modul/${m.id}">${esc(m.id)} ${esc(m.short || m.title)}</a></td><td class="num">${m.ects || "–"}</td><td style="min-width:120px"><div class="progress"><span style="width:${pct(moduleProgress(m))}%"></span></div></td>
        <td class="num">${pct(compScore(m))} %</td><td class="num">${state.quiz[m.id] ? pct(state.quiz[m.id].best) + " %" : "–"}</td><td class="num">${state.exam[m.id] ? pct(state.exam[m.id].best) + " %" : "–"}</td><td class="num">${learned}/${items.length}</td><td>${state.done[m.id] ? "✓" : ""}</td></tr>`;
    });
    h += `</tbody></table></div><h2>Sichern & Übertragen</h2><p>Alle Daten liegen nur auf diesem Gerät. Sichere sie regelmäßig – oder richte in den <a href="#/einstellungen">Einstellungen</a> eine Erinnerung bzw. die automatische Sicherung ein.</p>
      <div class="btn-row"><button class="btn primary" data-act="export">Als Datei speichern (JSON)</button><button class="btn" data-act="copyState">In Zwischenablage kopieren</button><label class="btn">Datei importieren <input type="file" id="importFile" accept="application/json" hidden></label><button class="btn" data-act="reset">Alles zurücksetzen</button></div>
      <label class="small muted" for="importText">Oder exportierten Text hier einfügen und übernehmen:</label><textarea id="importText" placeholder="{ … exportierter Fortschritt … }" style="min-height:80px"></textarea>
      <div class="btn-row"><button class="btn" data-act="importText">Eingefügten Fortschritt übernehmen</button></div>`;
    return h;
  }
  function viewSettings() {
    let h = `<h1>Einstellungen</h1>${versionCard()}${reminderCard()}${backupCard()}<div class="card"><h3>Farbschema</h3><select id="themeSel" aria-label="Farbschema">${[["auto", "System"], ["light", "Hell"], ["dark", "Dunkel"]].map(([v, l]) => `<option value="${v}" ${state.settings.theme === v ? "selected" : ""}>${l}</option>`).join("")}</select></div>
      <div class="card"><h3>Such-URLs der Bibliothekskataloge</h3><p class="small">Platzhalter <code>{q}</code> wird durch den Suchbegriff ersetzt. Im Katalog nach <code>TESTWORT</code> suchen, Adresse kopieren und <code>TESTWORT</code> durch <code>{q}</code> ersetzen. Leer = Suchbegriff wird kopiert und die Katalogstartseite geöffnet.</p>`;
    PP.libraries.forEach((l) => { h += `<p><label><b>${esc(l.name)}</b><br><input type="url" data-libtpl="${l.id}" value="${esc(libTemplate(l))}" placeholder="${esc(l.home)}…?q={q}" style="width:100%"></label></p>`; });
    return h + `<button class="btn primary" data-act="saveLibs">Speichern</button></div>`;
  }
  function viewSearch(q) {
    q = (q || "").trim(); const ql = q.toLowerCase();
    if (ql.length < 2) return `<h1>Suche</h1><p>Mindestens 2 Zeichen eingeben.</p>`;
    const hl = (s) => esc(s).replace(new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<mark>$1</mark>");
    const res = [];
    PP.modules.forEach((m) => {
      if ((m.title + " " + m.id).toLowerCase().includes(ql)) res.push({ href: `#/modul/${m.id}`, m, kind: "Modul", text: m.title });
      (m.topics || []).forEach((t) => { const s = t.title + " " + t.text + " " + (t.concepts || []).join(" "); if (s.toLowerCase().includes(ql)) res.push({ href: `#/modul/${m.id}/lernpfad`, m, kind: "Thema", text: t.title, ctx: snippet(t.text + " " + (t.concepts || []).join(", "), ql) }); });
      (m.glossary || []).forEach(([t, d]) => { if ((t + " " + d).toLowerCase().includes(ql)) res.push({ href: `#/modul/${m.id}/karten`, m, kind: "Begriff", text: t, ctx: d }); });
      (m.literature || []).forEach((b) => { if ((b.title + " " + b.authors).toLowerCase().includes(ql)) res.push({ href: `#/modul/${m.id}/literatur`, m, kind: "Buch", text: b.title, ctx: b.authors }); });
      (m.materials || []).concat(m.lectures || []).forEach((r) => { if ((r.title + " " + (r.note || "")).toLowerCase().includes(ql)) res.push({ href: `#/modul/${m.id}/materialien`, m, kind: "Material", text: r.title, ctx: r.note }); });
      (m.quiz || []).forEach((x) => { if ((x.q + " " + x.e).toLowerCase().includes(ql)) res.push({ href: `#/modul/${m.id}/quiz`, m, kind: "Quizfrage", text: x.q }); });
    });
    (PP.podcasts || []).forEach((p) => { if ((p.title + " " + p.by + " " + p.about).toLowerCase().includes(ql)) res.push({ href: "#/podcasts", m: byId(Object.keys(p.modules)[0]), kind: "Podcast", text: p.title, ctx: p.about }); });
    T.generators.forEach((g) => { if ((g.title + " " + g.topic).toLowerCase().includes(ql)) res.push({ href: `#/rechentrainer/${g.id}`, m: byId(g.modules[0]), kind: "Rechenaufgabe", text: g.title }); });
    return `<h1>Suche: „${esc(q)}“ <span class="pill">${res.length} Treffer</span></h1>` + (res.length ? `<div class="card"><ul class="clean">` + res.slice(0, 300).map((r) => `<li class="resource"><span class="pill">${r.kind}</span> <a href="${r.href}"><b>${hl(r.text)}</b></a> <span class="small muted">· ${esc(r.m.id)} ${esc(r.m.short || r.m.title)}</span>${r.ctx ? `<div class="small muted">${hl(r.ctx)}</div>` : ""}</li>`).join("") + `</ul></div>` : "<p>Keine Treffer.</p>");
  }
  function snippet(text, ql) {
    const t = text.replace(/\*\*/g, ""), i = t.toLowerCase().indexOf(ql);
    if (i < 0) return t.slice(0, 160) + "…";
    return (i > 60 ? "…" : "") + t.slice(Math.max(0, i - 60), i + 100) + "…";
  }

  // ---------- Router ----------
  function route() {
    hideTip();
    const parts = (location.hash.replace(/^#\/?/, "") || "").split("/").map((p) => { try { return decodeURIComponent(p); } catch (e) { return p; } });
    let html;
    switch (parts[0]) {
      case "": html = viewHome(); break;
      case "plan": html = viewPlan(); break;
      case "modul": html = viewModule(parts[1], parts[2]); break;
      case "wiederholen": html = viewReview(); break;
      case "verlauf": html = viewHistory(); break;
      case "mischquiz": html = viewMix(); break;
      case "rechentrainer": html = viewTrainer(parts[1], parts[2]); break;
      case "datensaetze": html = viewDatasets(); break;
      case "anki": html = viewAnki(); break;
      case "pruefmodus": html = viewVerify(parts[1], parts[2]); break;
      case "bibliothek": html = viewLibrary(); break;
      case "ressourcen": html = viewResources(); break;
      case "podcasts": html = viewPodcasts(); break;
      case "karriere": html = viewCareer(); break;
      case "glossar": html = viewGlossary(); break;
      case "fortschritt": html = viewProgress(); break;
      case "einstellungen": html = viewSettings(); break;
      case "suche": html = viewSearch(parts.slice(1).join("/")); break;
      default: html = viewHome();
    }
    $app.innerHTML = html;
    renderSidebar();
    $side.classList.remove("open");
    const m = parts[0] === "modul" ? byId(parts[1]) : null;
    document.title = m ? `${m.id} ${m.short || m.title} – PsychoPfad Wien` : "PsychoPfad Wien";
  }
  let lastHash = "";
  window.addEventListener("hashchange", () => {
    const base = (h) => h.split("/").slice(0, 3).join("/");
    const scroll = base(location.hash) !== base(lastHash);
    if (exam && exam.phase === "run" && !location.hash.endsWith("/pruefung")) { exam = null; clearInterval(startTimer._i); }
    if (rev && rev.active && !location.hash.startsWith("#/wiederholen")) rev.active = false;
    closeReport();
    lastHash = location.hash; route(); if (scroll) window.scrollTo(0, 0);
  });
  // Neu zeichnen ohne Scroll-Sprung; aufgeklappte Abschnitte bleiben offen
  function keep(fn) {
    const y = window.scrollY, open = [...$app.querySelectorAll("details")].map((d) => d.open);
    fn();
    const now = [...$app.querySelectorAll("details")];
    if (now.length === open.length) now.forEach((d, i) => { d.open = open[i]; });
    window.scrollTo(0, y);
  }

  // ---------- Events ----------
  document.addEventListener("click", (ev) => {
    const lc = ev.target.closest("[data-libcopy]");
    if (lc) { copyText(lc.dataset.libcopy, `„${lc.dataset.libcopy}“ kopiert – im Katalog einfügen.`); return; }
    if (ev.target.id === "overlay") { closeReport(); return; }
    const flip = ev.target.closest("[data-flip]");
    if (flip && cardSession) { cardSession.flipped = !cardSession.flipped; keep(route); return; }
    const revFlip = ev.target.closest('[data-rev="flip"]');
    if (revFlip && rev) { rev.flipped = !rev.flipped; keep(route); return; }
    const t = ev.target.closest("button"); if (!t) return;
    const d = t.dataset;
    const segs = location.hash.split("/"), cur = segs[1] === "modul" && segs[2] ? byId(decodeURIComponent(segs[2])) : null;
    if (d.report) { openReport(JSON.parse(d.report)); return; }
    if (d.repsave) { saveReport(); return; }
    if (d.repclose) { closeReport(); return; }
    if (d.copy) { copyText(d.copy, "Quellenangabe kopiert."); return; }
    if (d.comp) { state.comp[d.comp] = state.comp[d.comp] || {}; state.comp[d.comp][d.i] = +d.lv; save(); keep(route); return; }
    if (d.expand) { document.querySelectorAll("details.topic").forEach((x) => { x.open = d.expand === "1"; }); return; }
    if (d.cardgrade !== undefined && cardSession) { grade_srs(cardSession.id, +d.cardgrade); cardSession.id = null; cardSession.flipped = false; keep(route); return; }
    if (d.qa !== undefined && cur) { answerQuiz(cur, +d.qa, +d.k); keep(route); return; }
    if (d.quiz && cur) {
      if (d.quiz === "reset") quizSession = null;
      if (d.quiz === "wrong" && quizSession) {
        const wrong = Object.entries(quizSession.answers).filter(([i, a]) => cur.quiz[i].a !== a).map(([i]) => +i);
        const order = shuffle(wrong.concat(quizSession.order.filter((i) => quizSession.answers[i] === undefined)));
        if (!order.length) { toast("Keine falschen Antworten – super!"); return; }
        quizSession = { mod: cur.id, order, answers: {}, optOrder: {}, subset: true };
      }
      route(); window.scrollTo(0, 0); return;
    }
    if (d.exam && cur) {
      if (d.exam === "start") {
        const nMc = Math.max(0, Math.min(+document.getElementById("exMc").value || 0, cur.quiz.length));
        const nOp = Math.max(0, Math.min(+document.getElementById("exOpen").value || 0, (cur.exam || []).length));
        const mins = Math.max(1, +document.getElementById("exTime").value || 30);
        const mcIdx = shuffle(cur.quiz.map((_, i) => i)).slice(0, nMc);
        const optOrder = {}; mcIdx.forEach((qi) => { optOrder[qi] = shuffle(cur.quiz[qi].o.map((_, k) => k)); });
        exam = { mod: cur.id, phase: "run", mcIdx, optOrder, openIdx: shuffle((cur.exam || []).map((_, i) => i)).slice(0, nOp), mcAns: {}, openAns: {}, selfScore: {}, end: Date.now() + mins * 60000 };
      } else if (d.exam === "submit") {
        if (!exam.confirmSubmit) { exam.confirmSubmit = true; t.textContent = "Wirklich abgeben? Erneut klicken"; return; }
        finishExam(cur);
      } else if (d.exam === "abort") { exam = null; clearInterval(startTimer._i); }
      else if (d.exam === "new") { exam = null; }
      else if (d.exam === "save") {
        const prev = state.exam[cur.id] || { best: 0, attempts: 0 };
        state.exam[cur.id] = { best: Math.max(prev.best, exam.result), last: exam.result, attempts: prev.attempts + 1, date: new Date().toISOString() };
        save(); toast("Ergebnis gespeichert."); return;
      }
      route(); window.scrollTo(0, 0); return;
    }
    if (d.ex !== undefined && exam) { exam.mcAns[+d.ex] = +d.k; t.parentElement.querySelectorAll(".opt").forEach((o) => o.classList.toggle("selected", o === t)); return; }
    if (d.self !== undefined && exam) { exam.selfScore[+d.self] = +d.pts; keep(route); return; }
    // Wiederholen
    if (d.rev === "start") { startReview(); route(); window.scrollTo(0, 0); return; }
    if (d.rev === "stop") { rev.active = false; rev.finished = true; route(); return; }
    if (d.revgrade !== undefined && rev && rev.active) { gradeReview(+d.revgrade); route(); return; }
    if (d.revq !== undefined && rev && rev.active && rev.chosen === undefined) { rev.chosen = +d.k; keep(route); return; }
    // Lernverlauf: Prüfungstermine
    if (d.examadd) {
      const mod = document.getElementById("exMod").value, date = document.getElementById("exDate").value, title = document.getElementById("exTitle").value.trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { toast("Bitte ein Datum wählen."); return; }
      if (date < today()) { toast("Das Datum liegt in der Vergangenheit."); return; }
      state.exams.push({ id: "x" + Date.now().toString(36), mod, date, title: title.slice(0, 80) });
      save(); toast("Prüfungstermin gespeichert."); keep(route); return;
    }
    if (d.exdel) { state.exams = state.exams.filter((x) => x.id !== d.exdel); save(); keep(route); return; }
    if (d.exstudy) {
      const x = state.exams.find((e) => e.id === d.exstudy); if (!x) return;
      startReview({ mod: x.mod, newLimit: examPlan(x).newGoal }); location.hash = "#/wiederholen"; window.scrollTo(0, 0); return;
    }
    if (d.srsmods) {
      const v = d.srsmods === "all" ? PP.modules.map((m) => m.id) : d.srsmods === "none" ? [] : ["V0", "A1", "A2"];
      document.querySelectorAll(".srsMod").forEach((c) => { c.checked = v.includes(c.value); }); return;
    }
    if (d.srscfg) {
      const n = Math.max(0, Math.min(200, parseInt(document.getElementById("srsNew").value, 10) || 0));
      const mods = [...document.querySelectorAll(".srsMod")].filter((c) => c.checked).map((c) => c.value);
      const kinds = [...document.querySelectorAll(".srsKind")].filter((c) => c.checked).map((c) => c.value);
      const ret = parseFloat(document.getElementById("srsRet").value);
      state.srsCfg.newPerDay = n; state.srsCfg.modules = mods.length === PP.modules.length ? null : mods; state.srsCfg.kinds = kinds.length ? kinds : ["card", "quiz"];
      if ([0.8, 0.85, 0.9, 0.95].includes(ret)) state.srsCfg.retention = ret;
      save(); toast("Einstellungen gespeichert."); keep(route); return;
    }
    // Mischquiz
    if (d.mixpreset) {
      const sel = PRESETS[d.mixpreset] || PP.modules.filter((m) => (m.quiz || []).length).map((m) => m.id);
      document.querySelectorAll(".mixMod").forEach((c) => { c.checked = sel.includes(c.value); }); return;
    }
    if (d.mix === "start") {
      const mods = [...document.querySelectorAll(".mixMod")].filter((c) => c.checked).map((c) => c.value);
      if (!mods.length) { toast("Bitte mindestens ein Modul wählen."); return; }
      startMix(mods, +document.getElementById("mixN").value); route(); window.scrollTo(0, 0); return;
    }
    if (d.mix === "new") { mix = mix ? { sel: mix.sel, n: mix.n } : null; route(); window.scrollTo(0, 0); return; }
    if (d.mixq !== undefined && mix && mix.answers[+d.mixq] === undefined) {
      const i = +d.mixq, x = mix.items[i]; mix.answers[i] = +d.k;
      logActivity("quiz", +d.k === x.q.a);
      if (+d.k !== x.q.a) markWrong(x.mod, x.q); else save();
      keep(route); return;
    }
    // Rechentrainer
    if (d.trainer === "solution" && trainer) { document.querySelectorAll("[data-tr]").forEach((el) => { trainer.inputs[el.dataset.tr] = el.value; }); trainer.showSolution = !trainer.showSolution; keep(route); return; }
    if (d.trainer === "new" && trainer) { location.hash = `#/rechentrainer/${trainer.id}/${1 + Math.floor(Math.random() * 999999)}`; return; }
    // Datensätze
    if (d.dssave) { const ds = PP.datasets.find((x) => x.id === d.dssave); saveFile(ds.file.split("/").pop(), ds.csv, "text/csv;charset=utf-8"); return; }
    if (d.dscopy) { const ds = PP.datasets.find((x) => x.id === d.dscopy); copyText(ds.csv, "CSV kopiert."); return; }
    // Anki
    if (d.ankimods) { ankiSel.mods = d.ankimods === "all" ? PP.modules.map((m) => m.id) : []; keep(route); return; }
    if (d.anki) {
      const txt = A.build(PP.modules.filter((m) => ankiSel.mods.includes(m.id)), { kinds: ankiSel.kinds });
      if (d.anki === "save") saveFile("psychopfad-wien-anki.txt", txt, "text/plain;charset=utf-8"); else copyText(txt, "Anki-Text kopiert – als .txt-Datei speichern und in Anki importieren.");
      return;
    }
    // Prüfmodus
    if (d.vset !== undefined) {
      const v = state.verify[d.vset] = state.verify[d.vset] || {};
      v.s = d.v; v.t = new Date().toISOString(); save(); pushVerify(); keep(route); return;
    }
    if (d.verify === "copy") { copyText(verifyMarkdown(), "Abweichungen als Markdown kopiert."); return; }
    if (d.rset !== undefined) {
      if (d.r && !state.settings.reviewer) { toast("Bitte zuerst oben dein Kürzel eintragen."); const r = document.getElementById("reviewer"); if (r) r.focus(); return; }
      reviewSticky.ids.add(d.rset); setReview(d.rset, d.r); keep(route); return;
    }
    if (d.rfilter) { reviewFilter = d.rfilter; reviewSticky.ids.clear(); keep(route); return; }
    if (d.review === "copy") { copyText(reviewExport(), "Prüfvermerke kopiert."); return; }
    if (d.review === "save") { saveFile(`psychopfad-pruefvermerke-${today()}.json`, reviewExport(), "application/json"); return; }
    if (d.reports) {
      const md = "# Fehlermeldungen PsychoPfad Wien\n\n" + Object.values(state.reports).filter((r) => r.status !== "erledigt").map(reportMarkdown).join("\n---\n\n");
      if (d.reports === "copy") copyText(md, "Meldungen kopiert."); else saveFile("psychopfad-fehlermeldungen.md", md, "text/markdown;charset=utf-8");
      return;
    }
    if (d.rep) {
      const r = state.reports[d.rep]; if (!r) return;
      if (d.repact === "toggle") { r.status = r.status === "erledigt" ? "offen" : "erledigt"; pushReport(r); }
      if (d.repact === "delete") {
        if (!t.dataset.armed) { t.dataset.armed = "1"; t.textContent = "Wirklich löschen? Erneut klicken"; return; }
        delete state.reports[d.rep];
        if (cloud.db && r.synced) cloud.db.collection("reports").doc(r.id).delete().catch(() => {});
      }
      save(); keep(route); return;
    }
    // Updates
    if (d.upd === "check") {
      updUi = { busy: true, error: "" }; keep(route);
      checkForUpdate().then(() => { updUi = { busy: false, error: "" }; }, (e) => { updUi = { busy: false, error: U.errorText(e) }; })
        .then(() => { if (location.hash.startsWith("#/einstellungen")) keep(route); else renderSidebar(); renderBanner(); });
      return;
    }
    if (d.upd === "dismiss") { upd.dismissed = upd.info && upd.info.version; saveUpd(); renderBanner(); return; }
    if (d.upd === "reload") { location.reload(); return; }
    // Sicherung
    if (d.backup === "now") { backupNow(); return; }
    if (d.backup === "later") { state.backup.snoozeUntil = new Date(Date.now() + 2 * 864e5).toISOString(); save(); renderBanner(); return; }
    if (d.sync === "connect") {
      const tok = (document.getElementById("syncToken") || {}).value || "";
      if (!tok.trim()) { toast("Bitte zuerst den Zugangsschlüssel einfügen."); return; }
      runSync("connect", () => syncConnect(tok.trim()).catch((e) => { sync = {}; saveSync(); throw e; })).then(() => { if (syncOn()) toast(sync.conflict ? "Verbunden – auf GitHub liegt schon eine Sicherung." : "Verbunden – der Lernstand wird jetzt automatisch gesichert."); });
      return;
    }
    if (d.sync === "push") { runSync("push", () => { syncDirtyFlag = true; return syncPush(true); }); return; }
    if (d.sync === "restore" || d.sync === "take") {
      if (d.sync === "restore" && !t.dataset.armed) { t.dataset.armed = "1"; t.textContent = "Lernstand auf diesem Gerät ersetzen? Erneut tippen"; return; }
      runSync("restore", syncRestore).then(() => { if (!syncUi.msg) toast("Sicherung von GitHub übernommen."); });
      return;
    }
    if (d.sync === "keep") { sync.conflict = null; runSync("push", () => syncPush(true)); return; }
    if (d.sync === "disconnect") {
      if (!t.dataset.armed) { t.dataset.armed = "1"; t.textContent = "Wirklich trennen? Erneut tippen"; return; }
      clearTimeout(syncTimer); sync = {}; saveSync(); renderBanner(); keep(route); toast("Getrennt – die Sicherung auf GitHub bleibt erhalten."); return;
    }
    // Fortschritt & Einstellungen
    if (d.act === "export") { backupNow(); return; }
    if (d.act === "copyState") { copyText(JSON.stringify(state), "Fortschritt kopiert – z. B. in einer Notiz sichern."); return; }
    if (d.act === "importText") { importState(document.getElementById("importText").value); return; }
    if (d.act === "reset") {
      if (!t.dataset.armed) { t.dataset.armed = "1"; t.textContent = "Wirklich alles löschen? Erneut klicken"; return; }
      state = emptyState(); save(); applyTheme(); route(); toast("Alles zurückgesetzt."); return;
    }
    if (d.act === "saveLibs") {
      document.querySelectorAll("[data-libtpl]").forEach((i) => {
        const lib = PP.libraries.find((l) => l.id === i.dataset.libtpl), v = i.value.trim();
        if (v && !v.includes("{q}")) { toast(`${lib.short}: URL muss {q} enthalten.`); return; }
        if (v === lib.template) delete state.settings.libTemplates[lib.id]; else state.settings.libTemplates[lib.id] = v;
      });
      save(); toast("Gespeichert."); return;
    }
  });
  function importState(txt) {
    try { applyState(BK.parsePayload(txt).state); toast("Import erfolgreich."); }
    catch (e) { toast("Das ist kein gültiger Export."); }
  }
  function applyState(obj) {
    localStorage.removeItem(STORE_KEY); state = Object.assign(emptyState(), obj); save(); state = load(); applyTheme(); route();
  }

  document.addEventListener("submit", (ev) => {
    if (ev.target.id === "trainerForm") { ev.preventDefault(); if (trainer) { checkTrainer(); keep(route); } }
  });
  document.addEventListener("change", (ev) => {
    const t = ev.target;
    if (t.id === "doneToggle") { state.done[t.dataset.mod] = t.checked; save(); keep(route); }
    if (t.id === "srsModToggle") {
      let mods = state.srsCfg.modules || PP.modules.map((m) => m.id);
      mods = t.checked ? Array.from(new Set(mods.concat([t.dataset.mod]))) : mods.filter((x) => x !== t.dataset.mod);
      state.srsCfg.modules = mods.length === PP.modules.length ? null : mods; save(); toast(t.checked ? "Modul in die Wiederholung aufgenommen." : "Modul aus neuen Karten entfernt.");
    }
    if (t.dataset.read) { state.read[t.dataset.read] = state.read[t.dataset.read] || {}; state.read[t.dataset.read][t.dataset.i] = t.checked; save(); keep(route); }
    if (t.classList.contains("ankiKind")) { ankiSel.kinds = [...document.querySelectorAll(".ankiKind")].filter((c) => c.checked).map((c) => c.value); keep(route); }
    if (t.classList.contains("ankiMod")) { ankiSel.mods = [...document.querySelectorAll(".ankiMod")].filter((c) => c.checked).map((c) => c.value); keep(route); }
    if (t.id === "themeSel") { state.settings.theme = t.value; save(); applyTheme(); }
    if (t.id === "remOn") setReminder(t.checked);
    if (t.id === "remTime" && /^\d{2}:\d{2}$/.test(t.value)) { state.settings.reminder.time = t.value; save(); scheduleReminders(); }
    if (t.id === "backupDays") { state.settings.backupDays = +t.value; save(); renderBanner(); }
    if (t.id === "importFile" && t.files[0]) t.files[0].text().then(importState);
  });
  document.addEventListener("input", (ev) => {
    const t = ev.target;
    if (t.id === "notes") { state.notes[t.dataset.mod] = t.value; clearTimeout(t._s); t._s = setTimeout(save, 400); }
    if (t.dataset.open !== undefined && exam) exam.openAns[+t.dataset.open] = t.value;
    if (t.dataset.tr && trainer) trainer.inputs[t.dataset.tr] = t.value;
    if (t.id === "reviewer") { state.settings.reviewer = t.value.trim(); clearTimeout(t._s); t._s = setTimeout(save, 400); }
    if (t.dataset.rnote) {
      const v = state.review[t.dataset.rnote] = state.review[t.dataset.rnote] || {};
      v.note = t.value; clearTimeout(t._s); t._s = setTimeout(() => { save(); pushReview(); }, 500);
    }
    if (t.dataset.vnote) { const v = state.verify[t.dataset.vnote] = state.verify[t.dataset.vnote] || {}; v.note = t.value; clearTimeout(t._s); t._s = setTimeout(() => { save(); pushVerify(); }, 500); }
    if (t.id === "litFilter" || t.id === "glFilter") {
      const v = t.value.toLowerCase();
      document.querySelectorAll("[data-filter]").forEach((li) => { li.style.display = li.dataset.filter.includes(v) ? "" : "none"; });
      if (t.id === "litFilter") document.querySelectorAll(".lit-mod").forEach((s) => { s.style.display = [...s.querySelectorAll("[data-filter]")].some((li) => li.style.display !== "none") ? "" : "none"; });
    }
  });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") { closeReport(); return; }
    if (document.getElementById("overlay") || /^(INPUT|TEXTAREA|SELECT)$/.test(ev.target.tagName)) return;
    if (location.hash.startsWith("#/wiederholen") && rev && rev.active) {
      const it = ITEM.get(rev.queue[rev.idx]); if (!it) return;
      if (it.kind === "card") {
        if (ev.key === " " || ev.key === "Enter") { ev.preventDefault(); rev.flipped = !rev.flipped; keep(route); }
        else if (rev.flipped && /^[1-4]$/.test(ev.key)) { gradeReview(+ev.key); route(); }
      } else if (rev.chosen === undefined && /^[1-9]$/.test(ev.key)) {
        const k = rev.opt[it.id][+ev.key - 1]; if (k !== undefined) { rev.chosen = k; keep(route); }
      } else if (rev.chosen !== undefined) {
        const ok = rev.chosen === it.q.a;
        if (ev.key === "Enter") { ev.preventDefault(); gradeReview(ok ? 3 : 1); route(); }
        else if (ok && /^[2-4]$/.test(ev.key)) { gradeReview(+ev.key); route(); }
      }
      return;
    }
    if (cardSession && document.getElementById("flash") && (ev.key === " " || ev.key === "Enter") && ev.target.id === "flash") { ev.preventDefault(); cardSession.flipped = !cardSession.flipped; keep(route); }
    else if (cardSession && cardSession.flipped && document.getElementById("flash") && /^[1-4]$/.test(ev.key)) { grade_srs(cardSession.id, +ev.key); cardSession.id = null; cardSession.flipped = false; keep(route); }
  });

  document.getElementById("searchForm").addEventListener("submit", (ev) => { ev.preventDefault(); location.hash = "#/suche/" + encodeURIComponent(document.getElementById("searchInput").value); });
  document.getElementById("menuToggle").addEventListener("click", () => $side.classList.toggle("open"));
  document.getElementById("themeToggle").addEventListener("click", () => {
    const dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    state.settings.theme = dark ? "light" : "dark"; save(); applyTheme();
  });
  function applyTheme() { const t = state.settings.theme; if (t === "auto") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t; }

  // Offline-Fähigkeit (PWA) – nur über http(s), nicht als Datei, nicht auf der veröffentlichten Seite und nicht
  // in der Android-App (dort liegen alle Dateien in der APK; ein Cache würde nach Updates alte Dateien liefern)
  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol) && !IN_ARTIFACT && !IS_NATIVE) {
    window.addEventListener("load", () => {
      const hadController = !!navigator.serviceWorker.controller;
      navigator.serviceWorker.register("sw.js").then((reg) => {
        // Neuer Service Worker übernimmt → neue Version ist geladen und wird beim Neuladen angezeigt
        navigator.serviceWorker.addEventListener("controllerchange", () => { if (hadController) { swUpdated = true; renderBanner(); } });
        document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") reg.update().catch(() => {}); });
      }).catch(() => {});
    });
  }
  if (IS_NATIVE && navigator.serviceWorker) navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {});
  // Android-Zurück-Taste: erst Dialog bzw. Menü schließen, dann in der App zurück, auf der ersten Seite beenden
  if (native) {
    native.app.addListener("backButton", (ev) => {
      if (document.getElementById("overlay")) closeReport();
      else if ($side.classList.contains("open")) $side.classList.remove("open");
      else if (ev && ev.canGoBack) history.back();
      else native.app.exitApp();
    }).catch(() => {});
  }

  if (native && native.notif) {
    native.notif.createChannel({ id: "erinnerung", name: "Tägliche Erinnerung", description: "Fällige Wiederholungen und Prüfungstermine", importance: 3 }).catch(() => {});
    native.notif.addListener("localNotificationActionPerformed", (a) => { const r = a && a.notification && a.notification.extra && a.notification.extra.route; if (r) location.hash = r; }).catch(() => {});
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") scheduleReminders(); });
  }

  // Zugriff für automatische Tests
  // Beim Verlassen der App ausstehende Änderungen sofort hochladen
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden" && syncDirtyFlag) syncPush(); });

  window.PPApp = { get state() { return state; }, get trainer() { return trainer; }, get review() { return rev; }, get update() { return upd; }, get sync() { return sync; },
    syncNow: () => syncPush(), srsQueue, verifyItems, reminderPlan, scheduleReminders, native: IS_NATIVE };

  applyTheme();
  initCloud();
  lastHash = location.hash;
  route();
  autoUpdateCheck();
  syncStartup();
  scheduleReminders();
  renderBanner();
})();
