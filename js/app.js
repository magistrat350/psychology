/* PsychoPfad Wien – Single-Page-App ohne Build-Schritt.
 * Routen (Hash): #/  #/plan  #/modul/<ID>/<tab>  #/bibliothek  #/ressourcen  #/karriere
 *                #/fortschritt  #/einstellungen  #/glossar  #/suche/<begriff> */
(function () {
  "use strict";

  const STORE_KEY = "psychopfad_wien_v1";
  const $app = document.getElementById("app");
  const $side = document.getElementById("sidebar");

  // ---------- Zustand ----------
  const emptyState = () => ({ comp: {}, quiz: {}, exam: {}, notes: {}, done: {}, cards: {}, read: {}, settings: { theme: "auto", libTemplates: {} } });
  let state = load();
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return emptyState();
      return Object.assign(emptyState(), JSON.parse(raw));
    } catch (e) { return emptyState(); }
  }
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* privater Modus */ } }

  // ---------- Hilfen ----------
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Minimal-Markup: **fett**, *kursiv*, Absätze durch Leerzeile, Zeilen mit "- " als Liste
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
  function toast(msg) { const t = document.getElementById("toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2600); }
  function copyText(txt, msg) {
    try { navigator.clipboard.writeText(txt).then(() => toast(msg), () => toast(txt)); } catch (e) { toast(txt); }
  }
  function link(url, text) { return `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>`; }

  // Österreichischer Notenschlüssel (Beispiel – jede LV legt ihren eigenen fest)
  function grade(p) {
    if (p >= 0.875) return { n: 1, t: "Sehr gut" };
    if (p >= 0.75) return { n: 2, t: "Gut" };
    if (p >= 0.625) return { n: 3, t: "Befriedigend" };
    if (p >= 0.5) return { n: 4, t: "Genügend" };
    return { n: 5, t: "Nicht genügend" };
  }

  // ---------- Fortschritt ----------
  function compScore(m) {
    const c = state.comp[m.id] || {};
    const n = (m.competencies || []).length;
    if (!n) return 0;
    let s = 0; for (let i = 0; i < n; i++) s += (c[i] || 0) / 3;
    return s / n;
  }
  function moduleProgress(m) {
    // 40 % Selbsteinschätzung, 30 % bestes Quiz, 30 % beste Prüfung; "abgeschlossen" = 100 %
    if (state.done[m.id]) return 1;
    const q = state.quiz[m.id] ? state.quiz[m.id].best : 0;
    const e = state.exam[m.id] ? state.exam[m.id].best : 0;
    return 0.4 * compScore(m) + 0.3 * q + 0.3 * e;
  }
  function ectsDone() { return Math.min(PP.meta.ects, PP.modules.filter((m) => state.done[m.id]).reduce((s, m) => s + (m.ects || 0), 0)); }

  // ---------- Bibliothekssuche ----------
  function libTemplate(lib) { const o = state.settings.libTemplates[lib.id]; return o != null && o !== "" ? o : lib.template; }
  function bookQuery(b) {
    if (b.isbn) return b.isbn.replace(/[^0-9Xx]/g, "");
    const firstAuthor = (b.authors || "").split(/[,&;]/)[0].trim().split(/\s+/)[0];
    return (b.title.replace(/[:.–-].*$/, "").trim() + " " + firstAuthor).trim();
  }
  // Bibliotheken ohne Such-URL: Link zur Startseite, Suchbegriff wird beim Klick kopiert
  function libHref(lib, q) { const tpl = libTemplate(lib); return tpl ? tpl.replace("{q}", encodeURIComponent(q)) : lib.home; }
  function libButtons(b) {
    const q = bookQuery(b);
    const prim = ["kit", "ubw", "bw", "worldcat", "springer"];
    return `<div class="lib-btns">` + prim.map((id) => {
      const l = PP.libraries.find((x) => x.id === id);
      const direct = !!libTemplate(l);
      return `<a class="btn small" href="${esc(libHref(l, q))}" target="_blank" rel="noopener noreferrer" ${direct ? "" : `data-libcopy="${esc(q)}"`} title="${esc(l.name)}${direct ? "" : " – Suchbegriff wird kopiert"}">${esc(l.short)}</a>`;
    }).join("") + `<button class="btn small" data-copy="${esc(citation(b, true))}" title="Quellenangabe kopieren">APA kopieren</button></div>`;
  }
  function citation(b, plain) {
    const ed = b.ed ? ` (${b.ed})` : "";
    const s = `${b.authors} (${b.year || "o. J."}). ${b.title}${ed}. ${b.publisher || ""}`.trim();
    return plain ? s : esc(s);
  }

  // ---------- Sidebar ----------
  function renderSidebar(route) {
    const cur = location.hash || "#/";
    const a = (href, label, extra = "") => `<a href="${href}" class="${cur === href || (href !== "#/" && cur.startsWith(href + "/")) ? "active" : ""}">${label}${extra}</a>`;
    let h = a("#/", "🏠 Übersicht") + a("#/plan", "🗓️ Semesterplan") + a("#/bibliothek", "📚 Fachliteratur & Bibliotheken") +
      a("#/ressourcen", "🌐 Offene Ressourcen") + a("#/glossar", "🔤 Glossar") + a("#/fortschritt", "📈 Fortschritt") +
      a("#/karriere", "🧭 Nach dem Bachelor") + a("#/einstellungen", "⚙️ Einstellungen");
    PP.groups.forEach((g) => {
      const mods = modulesOf(g.id);
      if (!mods.length) return;
      h += `<div class="nav-group">${esc(g.id === "0" ? "" : g.id + " · ")}${esc(g.short)}${g.ects ? " · " + g.ects + " ECTS" : ""}</div>`;
      mods.forEach((m) => {
        const href = "#/modul/" + m.id;
        const active = cur.startsWith(href + "/") || cur === href;
        h += `<a href="${href}" class="${active ? "active" : ""}"><span class="mid">${esc(m.id)}</span><span>${esc(m.short || m.title)}</span>${state.done[m.id] ? '<span class="done-dot">✓</span>' : ""}</a>`;
      });
    });
    $side.innerHTML = h;
  }

  // ---------- Views ----------
  function viewHome() {
    const totalQ = PP.modules.reduce((s, m) => s + (m.quiz || []).length, 0);
    const totalB = PP.modules.reduce((s, m) => s + (m.literature || []).length, 0);
    const totalT = PP.modules.reduce((s, m) => s + (m.topics || []).length, 0);
    const totalR = PP.modules.reduce((s, m) => s + (m.materials || []).length + (m.lectures || []).length, 0);
    const done = ectsDone();
    let h = `<section class="hero"><h1>${esc(PP.meta.title)}</h1>
      <p>Dein strukturierter Selbstlern-Begleiter entlang des Modulplans (${esc(PP.meta.curriculumVersion)}, ${PP.meta.ects} ECTS, ${PP.meta.semesters} Semester, ${esc(PP.meta.degree)}). Zu jedem Modul: Lernziele, benötigtes Wissen und Qualifikationen, ausführlicher Lernpfad, frei zugängliche Materialien und Vorlesungen, Fachliteratur mit Direktsuche in KIT-Bibliothek, UB Wien und öffentlichen Bibliotheken, Karteikarten, Quiz und Prüfungssimulation.</p>
      <div class="stats">
        <div class="stat"><b>${PP.modules.length}</b>Module & Rubriken</div>
        <div class="stat"><b>${totalT}</b>Lernthemen</div>
        <div class="stat"><b>${totalR}</b>Materialien & Vorlesungen</div>
        <div class="stat"><b>${totalB}</b>Fachbücher</div>
        <div class="stat"><b>${totalQ}</b>Quizfragen</div>
        <div class="stat"><b>${done}/${PP.meta.ects}</b>ECTS abgehakt</div>
      </div>
      <div class="progress" style="margin-top:12px"><span style="width:${(done / PP.meta.ects) * 100}%"></span></div></section>
      <div class="notice small"><b>Hinweis:</b> ${esc(PP.meta.disclaimer)}</div>`;
    PP.groups.forEach((g) => {
      const mods = modulesOf(g.id);
      h += `<h2>${g.id !== "0" ? esc(g.id) + " – " : ""}${esc(g.title)} ${g.ects ? `<span class="pill accent">${g.ects} ECTS</span>` : ""}</h2><p class="muted">${esc(g.desc)}</p><div class="grid">`;
      mods.forEach((m) => {
        const p = moduleProgress(m);
        h += `<a class="card module-card" href="#/modul/${m.id}"><span class="mc-id">${esc(m.id)} ${m.ects ? `<span class="pill">${m.ects} ECTS</span>` : ""} ${m.steop ? '<span class="pill warn">StEOP</span>' : ""} ${state.done[m.id] ? '<span class="pill ok">✓ erledigt</span>' : ""}</span>
          <span class="mc-title">${esc(m.title)}</span><span class="small muted">${esc((m.lvs || []).map((l) => l.type).join(" · "))}</span>
          <div class="progress"><span style="width:${pct(p)}%"></span></div></a>`;
      });
      h += `</div>`;
    });
    h += `<h2>Offizielle Quellen</h2><ul>${PP.meta.officialLinks.map((l) => `<li>${link(l.url, l.title)}</li>`).join("")}</ul>`;
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
      }).join("") + `</ul><p class="small muted">${esc(s.note)}</p><p class="small">≈ ${ects} ECTS (Module, die über zwei Semester laufen, sind doppelt gelistet)</p></div>`;
    });
    h += `</div><h2>Lerntipps</h2><ul>${PP.general.studyTips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
    return h;
  }

  const TABS = [
    ["ueberblick", "Überblick"], ["wissen", "Wissen & Qualifikationen"], ["lernpfad", "Lernpfad"], ["materialien", "Materialien"],
    ["vorlesungen", "Vorlesungen"], ["literatur", "Fachliteratur"], ["karten", "Karteikarten"], ["quiz", "Quiz"], ["pruefung", "Prüfung"], ["notizen", "Notizen"]
  ];
  function tabCount(m, t) {
    return { wissen: (m.competencies || []).length, lernpfad: (m.topics || []).length, materialien: (m.materials || []).length, vorlesungen: (m.lectures || []).length,
      literatur: (m.literature || []).length, karten: (m.glossary || []).length, quiz: (m.quiz || []).length, pruefung: (m.exam || []).length }[t];
  }

  function viewModule(id, tab) {
    const m = byId(id);
    if (!m) return `<h1>Modul nicht gefunden</h1><p><a href="#/">Zur Übersicht</a></p>`;
    tab = tab || "ueberblick";
    const g = groupOf(m.group);
    const idx = PP.modules.indexOf(m);
    const prev = PP.modules[idx - 1], next = PP.modules[idx + 1];
    let h = `<p class="small muted"><a href="#/">Übersicht</a> › ${esc(g.id !== "0" ? g.id + " – " : "")}${esc(g.title)}</p>
      <h1>${esc(m.id)} · ${esc(m.title)}</h1>
      <div class="pills">${m.ects ? `<span class="pill accent">${m.ects} ECTS</span>` : ""}${m.steop ? '<span class="pill warn">StEOP</span>' : ""}${m.semester ? `<span class="pill">empf. Semester: ${esc(m.semester)}</span>` : ""}${(m.lvs || []).map((l) => `<span class="pill">${esc(l.type)}${l.pi ? " · prüfungsimmanent" : ""}</span>`).join("")}</div>
      <nav class="tabs">${TABS.map(([k, label]) => { const c = tabCount(m, k); return `<a href="#/modul/${m.id}/${k}" class="${k === tab ? "active" : ""}">${label}${c ? `<span class="cnt">${c}</span>` : ""}</a>`; }).join("")}</nav>`;
    const fn = { ueberblick: tabOverview, wissen: tabWissen, lernpfad: tabTopics, materialien: tabMaterials, vorlesungen: tabLectures, literatur: tabLit, karten: tabCards, quiz: tabQuiz, pruefung: tabExam, notizen: tabNotes }[tab] || tabOverview;
    h += fn(m);
    h += `<div class="btn-row" style="margin-top:30px;justify-content:space-between">${prev ? `<a class="btn" href="#/modul/${prev.id}">← ${esc(prev.id)} ${esc(prev.short || prev.title)}</a>` : "<span></span>"}${next ? `<a class="btn" href="#/modul/${next.id}">${esc(next.id)} ${esc(next.short || next.title)} →</a>` : ""}</div>`;
    return h;
  }

  function tabOverview(m) {
    const p = moduleProgress(m);
    let h = `<div class="card"><h3>Worum geht es?</h3>${rich(m.summary || "")}</div>`;
    if (m.choice) h += `<div class="notice info"><b>Wahlmöglichkeit:</b> ${rich(m.choice)}</div>`;
    if (m.lvs && m.lvs.length) {
      h += `<div class="card"><h3>Lehrveranstaltungen</h3><div class="table-wrap"><table><thead><tr><th>Typ</th><th>Titel</th><th>ECTS</th><th>Prüfungsform</th></tr></thead><tbody>` +
        m.lvs.map((l) => `<tr><td><b>${esc(l.type)}</b></td><td>${esc(l.title)}</td><td>${l.ects || "–"}</td><td>${l.pi ? "prüfungsimmanent (laufende Leistungen, Anwesenheit)" : "nicht-prüfungsimmanent (Modul-/Vorlesungsprüfung)"}</td></tr>`).join("") +
        `</tbody></table></div><p class="small muted">VO = Vorlesung, UE = Übung, VU = Vorlesung mit Übung, SE = Seminar, PR = Praktikum. Details zu Prüfungsterminen und Stoff in u:find und Moodle.</p></div>`;
    }
    if (m.goals) h += `<div class="card"><h3>Lernziele laut Modulbeschreibung (sinngemäß)</h3><ul>${m.goals.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
    if (m.exam_info) h += `<div class="card"><h3>Prüfung & Leistungsbeurteilung</h3>${rich(m.exam_info)}</div>`;
    if (m.tips) h += `<div class="card"><h3>Lernstrategie für dieses Modul</h3><ul>${m.tips.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
    h += `<div class="card"><h3>Dein Stand</h3><div class="progress"><span style="width:${pct(p)}%"></span></div>
      <p class="small">Selbsteinschätzung ${pct(compScore(m))} % · bestes Quiz ${state.quiz[m.id] ? pct(state.quiz[m.id].best) + " %" : "–"} · beste Prüfung ${state.exam[m.id] ? pct(state.exam[m.id].best) + " %" : "–"}</p>
      <label><input type="checkbox" id="doneToggle" data-mod="${m.id}" ${state.done[m.id] ? "checked" : ""}> Modul abgeschlossen</label></div>`;
    h += `<div class="btn-row"><a class="btn primary" href="#/modul/${m.id}/lernpfad">Lernpfad starten</a><a class="btn" href="#/modul/${m.id}/quiz">Quiz</a><a class="btn" href="#/modul/${m.id}/pruefung">Prüfungssimulation</a></div>`;
    return h;
  }

  const LEVELS = ["neu", "Grundlagen", "sicher", "kann es erklären"];
  function tabWissen(m) {
    let h = "";
    if (m.prerequisites && m.prerequisites.length) h += `<div class="card"><h3>Vorausgesetztes Wissen</h3><ul>${m.prerequisites.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
    h += `<div class="card"><h3>Kompetenzen nach Abschluss – Selbsteinschätzungsbogen</h3><p class="small muted">Bewerte ehrlich. „Kann es erklären“ heißt: du könntest es einer Kommilitonin ohne Unterlagen erklären und ein Beispiel geben.</p>`;
    const c = state.comp[m.id] || {};
    (m.competencies || []).forEach((txt, i) => {
      h += `<div class="comp"><div>${esc(txt)}</div><div class="rating">${LEVELS.map((l, lv) => `<button data-comp="${m.id}" data-i="${i}" data-lv="${lv}" class="${(c[i] || 0) === lv ? "on" : ""}">${l}</button>`).join("")}</div></div>`;
    });
    h += `<p class="small" style="margin-top:10px">Kompetenzindex: <b>${pct(compScore(m))} %</b></p></div>`;
    if (m.skills && m.skills.length) h += `<div class="card"><h3>Qualifikationen & Arbeitstechniken</h3><ul>${m.skills.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
    return h;
  }

  function tabTopics(m) {
    const r = state.read[m.id] || {};
    const n = (m.topics || []).length; const done = Object.values(r).filter(Boolean).length;
    let h = `<p class="muted">Arbeite die Themen der Reihe nach durch. Jedes Thema enthält eine Zusammenfassung, Schlüsselbegriffe und Leseempfehlungen. Hake ab, was du verstanden hast. (${done}/${n})</p>
      <div class="btn-row"><button class="btn small" data-expand="1">Alle aufklappen</button><button class="btn small" data-expand="0">Alle zuklappen</button></div>`;
    (m.topics || []).forEach((t, i) => {
      h += `<details class="topic"><summary><span>${i + 1}. ${esc(t.title)}</span>${r[i] ? '<span class="pill ok">✓</span>' : ""}</summary><div class="t-body">${rich(t.text)}`;
      if (t.concepts && t.concepts.length) h += `<div class="concepts">${t.concepts.map((c) => `<span class="pill">${esc(c)}</span>`).join("")}</div>`;
      if (t.read) h += `<p class="small" style="margin-top:10px"><b>Lesen/Ansehen:</b> ${esc(t.read)}</p>`;
      h += `<label class="small"><input type="checkbox" data-read="${m.id}" data-i="${i}" ${r[i] ? "checked" : ""}> verstanden</label></div></details>`;
    });
    return h;
  }

  function resourceList(list, emptyText) {
    if (!list || !list.length) return `<p class="muted">${emptyText}</p>`;
    return `<div class="card"><ul class="clean">` + list.map((r) => `<li class="resource"><div class="r-title">${link(r.url, r.title)}</div>
      <div class="r-meta pills">${r.type ? `<span class="pill">${esc(r.type)}</span>` : ""}${r.provider ? `<span class="pill">${esc(r.provider)}</span>` : ""}${r.lang ? `<span class="pill">${esc(r.lang)}</span>` : ""}${r.free !== false ? '<span class="pill ok">frei zugänglich</span>' : ""}</div>
      ${r.note ? `<div class="small muted">${esc(r.note)}</div>` : ""}</li>`).join("") + `</ul></div>`;
  }
  function tabMaterials(m) {
    return `<p class="muted">Öffentlich und kostenlos zugängliche Lehrbücher, Skripten, Artikel, Simulationen und Werkzeuge. Links mit Suchsymbol (Suchanfragen) führen zu aktuellen Treffern, falls sich URLs ändern.</p>` +
      resourceList(m.materials, "Noch keine Materialien hinterlegt.");
  }
  function tabLectures(m) {
    return `<p class="muted">Frei zugängliche Vorlesungsaufzeichnungen und Videokurse. Universitätsinterne Aufzeichnungen der Uni Wien (u:stream/Moodle) sind nur mit u:account verfügbar.</p>` +
      resourceList(m.lectures, "Noch keine Vorlesungen hinterlegt.");
  }
  function tabLit(m) {
    const order = { Standard: 0, Einstieg: 1, Vertiefung: 2, Klassiker: 3, Nachschlagen: 4 };
    const list = (m.literature || []).slice().sort((a, b) => (order[a.tag] ?? 9) - (order[b.tag] ?? 9));
    let h = `<p class="muted">Ein Klick auf eine Bibliothek sucht den Titel (bzw. kopiert den Suchbegriff und öffnet den Katalog, falls die Bibliothek keine Direktsuche erlaubt – Such-URLs lassen sich in den <a href="#/einstellungen">Einstellungen</a> hinterlegen). Auflagen ändern sich – ältere Auflagen sind für das Grundverständnis meist ausreichend und eher verfügbar.</p><div class="card"><ul class="clean">`;
    list.forEach((b) => {
      h += `<li class="resource"><div class="r-title">${esc(b.title)}${b.ed ? ` <span class="muted">(${esc(b.ed)})</span>` : ""}</div>
        <div class="small">${esc(b.authors)} · ${esc(b.year || "")} · ${esc(b.publisher || "")}${b.isbn ? " · ISBN " + esc(b.isbn) : ""}</div>
        <div class="pills" style="margin-top:4px">${b.tag ? `<span class="pill ${b.tag === "Standard" ? "accent" : ""}">${esc(b.tag)}</span>` : ""}${b.lang ? `<span class="pill">${esc(b.lang)}</span>` : ""}${b.ebook ? '<span class="pill ok">oft als E-Book über Uni-Lizenz</span>' : ""}</div>
        ${b.note ? `<div class="small muted" style="margin-top:4px">${esc(b.note)}</div>` : ""}${libButtons(b)}</li>`;
    });
    return h + `</ul></div>`;
  }

  // Karteikarten (einfaches Leitner-System: Box 0–4)
  function tabCards(m) {
    const gl = m.glossary || [];
    if (!gl.length) return `<p class="muted">Keine Karteikarten.</p>`;
    const cs = state.cards[m.id] || {};
    const boxes = [0, 0, 0, 0, 0]; gl.forEach((_, i) => boxes[cs[i] || 0]++);
    let h = `<p class="muted">Leitner-System: Gewusste Karten wandern eine Box weiter, nicht gewusste zurück in Box 1. Karten in niedrigen Boxen kommen häufiger dran.</p>
      <div class="pills">${boxes.map((b, i) => `<span class="pill ${i === 4 ? "ok" : ""}">Box ${i + 1}: ${b}</span>`).join("")}</div>
      <div class="card flash" id="flash" data-mod="${m.id}"></div>
      <div class="btn-row" id="flashBtns" style="justify-content:center"></div>
      <details class="topic"><summary>Alle Begriffe als Liste (${gl.length})</summary><div class="t-body"><dl>${gl.map(([t, d]) => `<dt><b>${esc(t)}</b></dt><dd class="small">${esc(d)}</dd>`).join("")}</dl></div></details>`;
    setTimeout(() => nextCard(m), 0);
    return h;
  }
  function nextCard(m) {
    const gl = m.glossary; const cs = state.cards[m.id] || {};
    // gewichtete Auswahl: Box 0 → Gewicht 16, Box 4 → 1
    const weights = gl.map((_, i) => Math.pow(2, 4 - (cs[i] || 0)));
    let r = Math.random() * weights.reduce((a, b) => a + b, 0), idx = 0;
    for (; idx < weights.length; idx++) { r -= weights[idx]; if (r <= 0) break; }
    idx = Math.min(idx, gl.length - 1);
    const el = document.getElementById("flash"); const btns = document.getElementById("flashBtns");
    if (!el) return;
    el.classList.remove("back"); el.innerHTML = `<div><div class="small muted">Begriff · Box ${(cs[idx] || 0) + 1}</div><b>${esc(gl[idx][0])}</b><div class="small muted" style="margin-top:8px">Klicken zum Umdrehen</div></div>`;
    btns.innerHTML = "";
    el.onclick = () => {
      el.classList.add("back"); el.innerHTML = `<div><div class="small muted">${esc(gl[idx][0])}</div>${esc(gl[idx][1])}</div>`;
      btns.innerHTML = `<button class="btn" data-card="0">✗ Nicht gewusst</button><button class="btn primary" data-card="1">✓ Gewusst</button>`;
      btns.querySelectorAll("button").forEach((b) => b.onclick = () => {
        state.cards[m.id] = state.cards[m.id] || {};
        const cur = state.cards[m.id][idx] || 0;
        state.cards[m.id][idx] = b.dataset.card === "1" ? Math.min(4, cur + 1) : 0;
        save(); route();
      });
    };
  }

  // Quiz: alle Fragen, sofortiges Feedback
  let quizSession = null;
  function tabQuiz(m) {
    const qs = m.quiz || [];
    if (!qs.length) return `<p class="muted">Kein Quiz vorhanden.</p>`;
    if (!quizSession || quizSession.mod !== m.id) quizSession = { mod: m.id, order: shuffle(qs.map((_, i) => i)), answers: {}, optOrder: {} };
    const s = quizSession;
    const answered = Object.keys(s.answers).length;
    const correct = Object.entries(s.answers).filter(([i, a]) => qs[i].a === a).length;
    const total = s.order.length;
    let h = `<div class="sticky-bar">${s.subset ? '<span class="pill warn">Wiederholung</span>' : ""}<b>${answered}/${total}</b> beantwortet · <b>${correct}</b> richtig ${answered ? `(${pct(correct / answered)} %)` : ""}
      <button class="btn small" data-quiz="reset">Neu mischen</button><button class="btn small" data-quiz="wrong">Nur falsche wiederholen</button>
      ${state.quiz[m.id] ? `<span class="small muted">Bestes Ergebnis: ${pct(state.quiz[m.id].best)} %</span>` : ""}</div>`;
    s.order.forEach((qi, n) => {
      const q = qs[qi];
      if (!s.optOrder[qi]) s.optOrder[qi] = shuffle(q.o.map((_, k) => k));
      const a = s.answers[qi];
      h += `<div class="card q"><div class="q-text">${n + 1}. ${esc(q.q)}</div><div class="opts">` +
        s.optOrder[qi].map((k) => {
          let cls = "";
          if (a !== undefined) { if (k === q.a) cls = "correct"; else if (k === a) cls = "wrong"; }
          return `<button class="opt ${cls}" data-qa="${qi}" data-k="${k}" ${a !== undefined ? "disabled" : ""}>${esc(q.o[k])}</button>`;
        }).join("") + `</div>${a !== undefined ? `<div class="explain">${a === q.a ? "✓ Richtig." : "✗ Leider falsch."} ${esc(q.e || "")}</div>` : ""}</div>`;
    });
    if (answered === total) {
      const p = correct / total;
      h += `<div class="card"><h3>Ergebnis${s.subset ? " (Wiederholungsrunde)" : ""}</h3><div class="score-big">${pct(p)} %</div><p>Note nach Beispielschlüssel: <b>${grade(p).n} (${grade(p).t})</b></p></div>`;
    }
    return h;
  }
  function answerQuiz(m, qi, k) {
    const s = quizSession; if (s.answers[qi] !== undefined) return;
    s.answers[qi] = k;
    const qs = m.quiz;
    if (!s.subset && Object.keys(s.answers).length === qs.length) {
      const p = Object.entries(s.answers).filter(([i, a]) => qs[i].a === a).length / qs.length;
      const prev = state.quiz[m.id] || { best: 0, attempts: 0 };
      state.quiz[m.id] = { best: Math.max(prev.best, p), last: p, attempts: prev.attempts + 1, date: new Date().toISOString() };
      save();
    }
  }

  // Prüfungssimulation: MC-Teil (zufällig, ohne Feedback) + offene Fragen mit Selbstbewertung
  let exam = null;
  function tabExam(m) {
    const mc = m.quiz || [], open = m.exam || [];
    if (!exam || exam.mod !== m.id) exam = { mod: m.id, phase: "setup" };
    const hist = state.exam[m.id];
    if (exam.phase === "setup") {
      const defMc = Math.min(20, mc.length), defOpen = Math.min(3, open.length);
      return `<div class="card"><h3>Prüfungssimulation konfigurieren</h3>
        <p>Simuliert eine schriftliche Modulprüfung: Multiple-Choice-Teil ohne sofortiges Feedback und offene Fragen, die du nach Abgabe mit der Musterlösung selbst bewertest.</p>
        <p><label>MC-Fragen: <input type="number" id="exMc" min="0" max="${mc.length}" value="${defMc}" style="width:80px"></label> (von ${mc.length})
        &nbsp; <label>Offene Fragen: <input type="number" id="exOpen" min="0" max="${open.length}" value="${defOpen}" style="width:80px"></label> (von ${open.length})
        &nbsp; <label>Zeit (Minuten): <input type="number" id="exTime" min="5" max="240" value="${Math.max(15, defMc * 1.5 + defOpen * 10)}" style="width:80px"></label></p>
        <p class="small muted">Bewertung: MC je 1 Punkt; offene Fragen mit angegebener Punktzahl. Bestanden ab 50 % (Beispielschlüssel; die tatsächlichen Schlüssel legt jede Lehrveranstaltung fest).</p>
        <button class="btn primary" data-exam="start">Prüfung starten</button></div>
        ${hist ? `<div class="card"><h3>Bisherige Ergebnisse</h3><p>Bestes Ergebnis: <b>${pct(hist.best)} %</b> · letzte: ${pct(hist.last)} % · Versuche: ${hist.attempts}</p></div>` : ""}
        <details class="topic"><summary>Alle offenen Prüfungsfragen mit Musterlösungen ansehen (${open.length})</summary><div class="t-body">${open.map((q, i) => `<p><b>${i + 1}. ${esc(q.q)}</b> <span class="pill">${q.p} P.</span></p><div class="solution small">${rich(q.s)}</div>`).join("")}</div></details>`;
    }
    if (exam.phase === "run") {
      let h = `<div class="sticky-bar"><span>⏱ <span class="timer" id="examTimer"></span></span><button class="btn primary" data-exam="submit">Abgeben</button><button class="btn small" data-exam="abort">Abbrechen</button></div>`;
      exam.mcIdx.forEach((qi, n) => {
        const q = mc[qi];
        h += `<div class="card q"><div class="q-text">${n + 1}. ${esc(q.q)}</div><div class="opts">` + exam.optOrder[qi].map((k) => `<button class="opt ${exam.mcAns[qi] === k ? "selected" : ""}" data-ex="${qi}" data-k="${k}">${esc(q.o[k])}</button>`).join("") + `</div></div>`;
      });
      exam.openIdx.forEach((oi, n) => {
        const q = open[oi];
        h += `<div class="card"><div class="q-text"><b>Offene Frage ${n + 1}</b> <span class="pill">${q.p} Punkte</span></div><p>${esc(q.q)}</p><textarea data-open="${oi}" placeholder="Deine Antwort …">${esc(exam.openAns[oi] || "")}</textarea></div>`;
      });
      setTimeout(startTimer, 0);
      return h;
    }
    // Ergebnis
    const mcPts = exam.mcIdx.filter((qi) => exam.mcAns[qi] === mc[qi].a).length;
    const openMax = exam.openIdx.reduce((s, oi) => s + open[oi].p, 0);
    const openPts = exam.openIdx.reduce((s, oi) => s + (exam.selfScore[oi] || 0), 0);
    const max = exam.mcIdx.length + openMax; const tot = mcPts + openPts; const p = max ? tot / max : 0;
    const gr = grade(p);
    let h = `<div class="card"><h3>Ergebnis</h3><div class="score-big">${tot} / ${max} Punkte · ${pct(p)} %</div>
      <p>Note (Beispielschlüssel): <b>${gr.n} – ${gr.t}</b> ${gr.n < 5 ? "✓ bestanden" : "✗ nicht bestanden"}</p>
      <p class="small muted">MC: ${mcPts}/${exam.mcIdx.length}. Offene Fragen: ${openPts}/${openMax} (bitte unten selbst bewerten – das Ergebnis aktualisiert sich).</p>
      <div class="btn-row"><button class="btn primary" data-exam="save">Ergebnis speichern</button><button class="btn" data-exam="new">Neue Prüfung</button></div></div>`;
    exam.openIdx.forEach((oi, n) => {
      const q = open[oi];
      h += `<div class="card"><b>Offene Frage ${n + 1}:</b> ${esc(q.q)}<p class="small muted">Deine Antwort:</p><div class="explain">${esc(exam.openAns[oi] || "(keine Antwort)").replace(/\n/g, "<br>")}</div>
        <div class="solution"><b>Musterlösung / Bewertungskriterien:</b>${rich(q.s)}</div>
        <p>Selbstbewertung: ${Array.from({ length: q.p + 1 }, (_, k) => `<button class="btn small ${exam.selfScore[oi] === k ? "primary" : ""}" data-self="${oi}" data-pts="${k}">${k}</button>`).join(" ")} / ${q.p}</p></div>`;
    });
    exam.mcIdx.forEach((qi, n) => {
      const q = mc[qi]; const a = exam.mcAns[qi];
      h += `<div class="card q"><div class="q-text">${n + 1}. ${esc(q.q)}</div><div class="opts">` + exam.optOrder[qi].map((k) => `<button class="opt ${k === q.a ? "correct" : k === a ? "wrong" : ""}" disabled>${esc(q.o[k])}</button>`).join("") + `</div><div class="explain">${a === q.a ? "✓" : a === undefined ? "– nicht beantwortet." : "✗"} ${esc(q.e || "")}</div></div>`;
    });
    exam.result = p;
    return h;
  }
  function startTimer() {
    const el = document.getElementById("examTimer"); if (!el || !exam || exam.phase !== "run") return;
    clearInterval(startTimer._i);
    const tick = () => {
      const left = Math.max(0, exam.end - Date.now());
      const mm = Math.floor(left / 60000), ss = Math.floor((left % 60000) / 1000);
      const e2 = document.getElementById("examTimer"); if (!e2) { clearInterval(startTimer._i); return; }
      e2.textContent = `${mm}:${String(ss).padStart(2, "0")}`;
      if (left <= 0) { clearInterval(startTimer._i); toast("Zeit abgelaufen – Prüfung wird abgegeben."); exam.phase = "result"; route(); }
    };
    tick(); startTimer._i = setInterval(tick, 1000);
  }

  function tabNotes(m) {
    return `<p class="muted">Deine Notizen werden lokal im Browser gespeichert (Export unter <a href="#/fortschritt">Fortschritt</a>).</p><textarea id="notes" data-mod="${m.id}" style="min-height:380px" placeholder="Zusammenfassungen, offene Fragen, Prüfungstermine …">${esc(state.notes[m.id] || "")}</textarea>`;
  }

  function viewLibrary() {
    let h = `<h1>Fachliteratur & Bibliotheken</h1><p>Alle Lehrbücher aus allen Modulen mit Direktsuche. Tipp: Viele deutschsprachige Psychologie-Lehrbücher sind bei Springer erschienen und über Hochschullizenzen (KIT, Uni Wien) als kostenloses E-Book abrufbar.</p>`;
    h += `<h2>Bibliotheken</h2><div class="grid">` + PP.libraries.filter((l) => l.info).map((l) => `<div class="card"><h3>${link(l.home, l.name)}</h3><p class="small">${esc(l.info)}</p>${(l.links || []).map((x) => `<div class="small">→ ${link(x.url, x.title)}</div>`).join("")}</div>`).join("") + `</div>`;
    h += `<h2>Alle Bücher nach Modul</h2><p><input type="text" id="litFilter" placeholder="Filtern nach Titel, Autor:in …" style="width:100%"></p><div id="litAll">`;
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
      <h2>Links</h2><ul>${PP.careerLinks.map((l) => `<li>${link(l.url, l.title)}</li>`).join("")}</ul>`;
  }

  function viewGlossary() {
    const all = [];
    PP.modules.forEach((m) => (m.glossary || []).forEach(([t, d]) => all.push({ t, d, m })));
    all.sort((a, b) => a.t.localeCompare(b.t, "de"));
    return `<h1>Glossar <span class="pill">${all.length} Begriffe</span></h1><p><input type="text" id="glFilter" placeholder="Begriff filtern …" style="width:100%"></p><div class="card"><dl id="glList">` +
      all.map((x) => `<div data-filter="${esc((x.t + " " + x.d).toLowerCase())}"><dt><b>${esc(x.t)}</b> <a class="pill" href="#/modul/${x.m.id}/karten">${esc(x.m.id)}</a></dt><dd class="small">${esc(x.d)}</dd></div>`).join("") + `</dl></div>`;
  }

  function viewProgress() {
    let h = `<h1>Fortschritt</h1><p>${ectsDone()} von ${PP.meta.ects} ECTS als abgeschlossen markiert (Wahlbereich: 30 ECTS werden über W-Module gezählt).</p><div class="card table-wrap"><table><thead><tr><th>Modul</th><th>ECTS</th><th>Fortschritt</th><th>Selbsteinsch.</th><th>Quiz</th><th>Prüfung</th><th>✓</th></tr></thead><tbody>`;
    PP.modules.forEach((m) => {
      h += `<tr><td><a href="#/modul/${m.id}">${esc(m.id)} ${esc(m.short || m.title)}</a></td><td>${m.ects || "–"}</td><td style="min-width:120px"><div class="progress"><span style="width:${pct(moduleProgress(m))}%"></span></div></td>
        <td>${pct(compScore(m))} %</td><td>${state.quiz[m.id] ? pct(state.quiz[m.id].best) + " %" : "–"}</td><td>${state.exam[m.id] ? pct(state.exam[m.id].best) + " %" : "–"}</td><td>${state.done[m.id] ? "✓" : ""}</td></tr>`;
    });
    h += `</tbody></table></div><h2>Sichern & Übertragen</h2><p>Alle Daten liegen nur in diesem Browser. Exportiere sie regelmäßig.</p>
      <div class="btn-row"><button class="btn primary" data-act="export">Als Datei exportieren (JSON)</button><button class="btn" data-act="copyState">In Zwischenablage kopieren</button><label class="btn">Datei importieren <input type="file" id="importFile" accept="application/json" hidden></label><button class="btn" data-act="reset">Alles zurücksetzen</button></div>
      <p class="small muted">Oder exportierten Text hier einfügen und übernehmen:</p><textarea id="importText" placeholder="{ … exportierter Fortschritt … }" style="min-height:80px"></textarea>
      <div class="btn-row"><button class="btn" data-act="importText">Eingefügten Fortschritt übernehmen</button></div>`;
    return h;
  }

  function viewSettings() {
    let h = `<h1>Einstellungen</h1><div class="card"><h3>Farbschema</h3><select id="themeSel">${[["auto", "System"], ["light", "Hell"], ["dark", "Dunkel"]].map(([v, l]) => `<option value="${v}" ${state.settings.theme === v ? "selected" : ""}>${l}</option>`).join("")}</select></div>
      <div class="card"><h3>Such-URLs der Bibliothekskataloge</h3><p class="small">Platzhalter <code>{q}</code> wird durch den Suchbegriff ersetzt. So findest du die URL: im Katalog eine Suche nach <code>TESTWORT</code> ausführen, die Adresse aus der Browserzeile kopieren und <code>TESTWORT</code> durch <code>{q}</code> ersetzen. Leer = Suchbegriff wird kopiert und die Katalogstartseite geöffnet.</p>`;
    PP.libraries.forEach((l) => {
      h += `<p><label><b>${esc(l.name)}</b><br><input type="url" data-libtpl="${l.id}" value="${esc(libTemplate(l))}" placeholder="${esc(l.home)}…?q={q}" style="width:100%"></label></p>`;
    });
    return h + `<button class="btn primary" data-act="saveLibs">Speichern</button></div>`;
  }

  function viewSearch(q) {
    q = (q || "").trim(); const ql = q.toLowerCase();
    if (ql.length < 2) return `<h1>Suche</h1><p>Mindestens 2 Zeichen eingeben.</p>`;
    const hl = (s) => esc(s).replace(new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<mark>$1</mark>");
    const res = [];
    PP.modules.forEach((m) => {
      if ((m.title + " " + m.id).toLowerCase().includes(ql)) res.push({ m, tab: "ueberblick", kind: "Modul", text: m.title });
      (m.topics || []).forEach((t) => { const s = t.title + " " + t.text + " " + (t.concepts || []).join(" "); if (s.toLowerCase().includes(ql)) res.push({ m, tab: "lernpfad", kind: "Thema", text: t.title, ctx: snippet(t.text + " " + (t.concepts || []).join(", "), ql) }); });
      (m.glossary || []).forEach(([t, d]) => { if ((t + " " + d).toLowerCase().includes(ql)) res.push({ m, tab: "karten", kind: "Begriff", text: t, ctx: d }); });
      (m.literature || []).forEach((b) => { if ((b.title + " " + b.authors).toLowerCase().includes(ql)) res.push({ m, tab: "literatur", kind: "Buch", text: b.title, ctx: b.authors }); });
      (m.materials || []).concat(m.lectures || []).forEach((r) => { if ((r.title + " " + (r.note || "")).toLowerCase().includes(ql)) res.push({ m, tab: "materialien", kind: "Material", text: r.title, ctx: r.note }); });
      (m.quiz || []).forEach((x) => { if ((x.q + " " + x.e).toLowerCase().includes(ql)) res.push({ m, tab: "quiz", kind: "Quizfrage", text: x.q }); });
    });
    return `<h1>Suche: „${esc(q)}“ <span class="pill">${res.length} Treffer</span></h1>` + (res.length ? `<div class="card"><ul class="clean">` + res.slice(0, 300).map((r) => `<li class="resource"><span class="pill">${r.kind}</span> <a href="#/modul/${r.m.id}/${r.tab}"><b>${hl(r.text)}</b></a> <span class="small muted">· ${esc(r.m.id)} ${esc(r.m.short || r.m.title)}</span>${r.ctx ? `<div class="small muted">${hl(r.ctx)}</div>` : ""}</li>`).join("") + `</ul></div>` : "<p>Keine Treffer.</p>");
  }
  function snippet(text, ql) {
    const t = text.replace(/\*\*/g, ""); const i = t.toLowerCase().indexOf(ql);
    if (i < 0) return t.slice(0, 160) + "…";
    return (i > 60 ? "…" : "") + t.slice(Math.max(0, i - 60), i + 100) + "…";
  }

  // ---------- Router ----------
  function route() {
    const parts = (location.hash.replace(/^#\/?/, "") || "").split("/").map(decodeURIComponent);
    let html;
    switch (parts[0]) {
      case "": html = viewHome(); break;
      case "plan": html = viewPlan(); break;
      case "modul": html = viewModule(parts[1], parts[2]); break;
      case "bibliothek": html = viewLibrary(); break;
      case "ressourcen": html = viewResources(); break;
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
    lastHash = location.hash; route(); if (scroll) window.scrollTo(0, 0);
  });

  // ---------- Events (Delegation) ----------
  document.addEventListener("click", (ev) => {
    const lc = ev.target.closest("[data-libcopy]");
    if (lc) { copyText(lc.dataset.libcopy, `„${lc.dataset.libcopy}“ kopiert – im Katalog einfügen.`); return; }
    const t = ev.target.closest("button"); if (!t) return;
    const d = t.dataset;
    const cur = (location.hash.split("/")[2] || "") && byId(decodeURIComponent(location.hash.split("/")[2]));
    if (d.copy) { copyText(d.copy, "Quellenangabe kopiert."); return; }
    if (d.comp) { state.comp[d.comp] = state.comp[d.comp] || {}; state.comp[d.comp][d.i] = +d.lv; save(); keep(route); return; }
    if (d.expand) { document.querySelectorAll("details.topic").forEach((x) => x.open = d.expand === "1"); return; }
    if (d.qa !== undefined && cur) { answerQuiz(cur, +d.qa, +d.k); keep(route); return; }
    if (d.quiz && cur) {
      if (d.quiz === "reset") quizSession = null;
      if (d.quiz === "wrong" && quizSession) {
        const wrong = Object.entries(quizSession.answers).filter(([i, a]) => cur.quiz[i].a !== a).map(([i]) => +i);
        const unanswered = quizSession.order.filter((i) => quizSession.answers[i] === undefined);
        const order = shuffle(wrong.concat(unanswered));
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
        const optOrder = {}; mcIdx.forEach((qi) => optOrder[qi] = shuffle(cur.quiz[qi].o.map((_, k) => k)));
        exam = { mod: cur.id, phase: "run", mcIdx, optOrder, openIdx: shuffle((cur.exam || []).map((_, i) => i)).slice(0, nOp), mcAns: {}, openAns: {}, selfScore: {}, end: Date.now() + mins * 60000 };
      } else if (d.exam === "submit") {
        if (!exam.confirmSubmit) { exam.confirmSubmit = true; t.textContent = "Wirklich abgeben? Erneut klicken"; return; }
        exam.phase = "result"; clearInterval(startTimer._i);
      }
      else if (d.exam === "abort") { exam = null; clearInterval(startTimer._i); }
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
    if (d.act === "export") {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "psychopfad-fortschritt.json"; a.click(); return;
    }
    if (d.act === "copyState") { copyText(JSON.stringify(state), "Fortschritt kopiert – z. B. in einer Notiz sichern."); return; }
    if (d.act === "importText") {
      try { state = Object.assign(emptyState(), JSON.parse(document.getElementById("importText").value)); save(); applyTheme(); route(); toast("Import erfolgreich."); } catch (e) { toast("Text ist kein gültiger Export."); }
      return;
    }
    if (d.act === "reset") {
      if (!t.dataset.armed) { t.dataset.armed = "1"; t.textContent = "Wirklich alles löschen? Erneut klicken"; return; }
      state = emptyState(); save(); applyTheme(); route(); toast("Alles zurückgesetzt."); return;
    }
    if (d.act === "saveLibs") {
      document.querySelectorAll("[data-libtpl]").forEach((i) => {
        const lib = PP.libraries.find((l) => l.id === i.dataset.libtpl);
        const v = i.value.trim();
        if (v && !v.includes("{q}")) { toast(`${lib.short}: URL muss {q} enthalten.`); return; }
        if (v === lib.template) delete state.settings.libTemplates[lib.id]; else state.settings.libTemplates[lib.id] = v;
      });
      save(); toast("Gespeichert."); return;
    }
  });
  // Re-Render ohne Scroll-Sprung
  function keep(fn) { const y = window.scrollY; fn(); window.scrollTo(0, y); }

  document.addEventListener("change", (ev) => {
    const t = ev.target;
    if (t.id === "doneToggle") { state.done[t.dataset.mod] = t.checked; save(); keep(route); }
    if (t.dataset.read) { state.read[t.dataset.read] = state.read[t.dataset.read] || {}; state.read[t.dataset.read][t.dataset.i] = t.checked; save(); const op = [...document.querySelectorAll("details.topic")].map((x) => x.open); keep(route); document.querySelectorAll("details.topic").forEach((x, i) => x.open = op[i]); }
    if (t.id === "themeSel") { state.settings.theme = t.value; save(); applyTheme(); }
    if (t.id === "importFile" && t.files[0]) {
      t.files[0].text().then((txt) => { try { state = Object.assign(emptyState(), JSON.parse(txt)); save(); applyTheme(); route(); toast("Import erfolgreich."); } catch (e) { toast("Datei ungültig."); } });
    }
  });
  document.addEventListener("input", (ev) => {
    const t = ev.target;
    if (t.id === "notes") { state.notes[t.dataset.mod] = t.value; clearTimeout(t._s); t._s = setTimeout(save, 400); }
    if (t.dataset.open !== undefined && exam) exam.openAns[+t.dataset.open] = t.value;
    if (t.id === "litFilter" || t.id === "glFilter") {
      const v = t.value.toLowerCase();
      document.querySelectorAll("[data-filter]").forEach((li) => li.style.display = li.dataset.filter.includes(v) ? "" : "none");
      if (t.id === "litFilter") document.querySelectorAll(".lit-mod").forEach((s) => s.style.display = [...s.querySelectorAll("[data-filter]")].some((li) => li.style.display !== "none") ? "" : "none");
    }
  });

  document.getElementById("searchForm").addEventListener("submit", (ev) => { ev.preventDefault(); location.hash = "#/suche/" + encodeURIComponent(document.getElementById("searchInput").value); });
  document.getElementById("menuToggle").addEventListener("click", () => $side.classList.toggle("open"));
  document.getElementById("themeToggle").addEventListener("click", () => {
    const dark = document.documentElement.dataset.theme === "dark" || (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    state.settings.theme = dark ? "light" : "dark"; save(); applyTheme();
  });
  function applyTheme() { const t = state.settings.theme; if (t === "auto") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = t; }

  applyTheme();
  lastHash = location.hash;
  route();
})();
