/* Grunddaten: Studienstruktur, Bibliotheken, allgemeine Ressourcen.
 * Struktur nach dem Curriculum für das Bachelorstudium Psychologie der Universität Wien,
 * Version 2022 (MBl. 09.05.2022, Nr. 173) inkl. 1. Änderung (MBl. 28.03.2024, Nr. 84, in Kraft 1.10.2024).
 * Verbindlich ist immer der aktuelle Curriculumstext – siehe PP.meta.officialLinks. */
window.PP = {
  modules: [],
  addModule(m) { this.modules.push(m); }
};

PP.meta = {
  title: "Bachelorstudium Psychologie – Universität Wien",
  degree: "Bachelor of Science (BSc)",
  ects: 180,
  semesters: 6,
  curriculumVersion: "Version 2022 (inkl. 1. Änderung 2024)",
  lastChecked: "2026-10",
  repo: "magistrat350/psychology",
  disclaimer:
    "Die Modulstruktur wurde aus dem öffentlich publizierten Curriculum (Version 2022) und dem Prüfungspass rekonstruiert. " +
    "Lehrveranstaltungstypen, ECTS-Aufteilungen innerhalb der Module und Prüfungsmodalitäten können sich durch Curriculumsänderungen " +
    "verschieben. Maßgeblich sind immer der konsolidierte Curriculumstext, u:find und das StudienServiceCenter Psychologie. " +
    "Lerninhalte, Quizze und Prüfungsfragen dieser App sind eigenständig erstellte Übungsmaterialien und keine offiziellen Prüfungsfragen der Universität Wien.",
  officialLinks: [
    { title: "Curriculum BA Psychologie, Version 2022 (konsolidiert, Senat Uni Wien)", url: "https://senat.univie.ac.at/fileadmin/user_upload/s_senat/konsolidierte_Bachelorcurricula/BA_Psychologie_Version2022.pdf" },
    { title: "Mitteilungsblatt 2021/22 Nr. 173 – Erstveröffentlichung des Curriculums", url: "https://mtbl.univie.ac.at/storage/media/mtbl02/2021_2022/2021_2022_173.pdf" },
    { title: "Mitteilungsblatt 2023/24 Nr. 84 – 1. Änderung (u. a. Wahlmodule W1a–W1c)", url: "https://mtbl.univie.ac.at/storage/media/mtbl02/2023_2024/2023_2024_84.pdf" },
    { title: "Prüfungspass Bachelor Version 2022 (SSC Psychologie)", url: "https://ssc-psychologie.univie.ac.at/fileadmin/user_upload/ssc_psychologie/Downloads/Bachelorstudium/Bachelorabschluss/Pruefungspass_Bachelor_Version_2022.pdf" },
    { title: "StudienServiceCenter (SSC) Psychologie", url: "https://ssc-psychologie.univie.ac.at/" },
    { title: "u:find – Vorlesungsverzeichnis Bachelor Psychologie (Version 2022)", url: "https://ufind.univie.ac.at/de/vvz_sub.html?path=322408" },
    { title: "Fakultät für Psychologie der Universität Wien", url: "https://psychologie.univie.ac.at/" },
    { title: "Curriculum Version 2017 (für Studierende im „alten“ Bachelor)", url: "https://senat.univie.ac.at/fileadmin/user_upload/s_senat/konsolidierte_Bachelorcurricula/BA_Psychologie_Version2017.pdf" }
  ]
};

/* Modulgruppen. ECTS gemäß Curriculum 2022. */
PP.groups = [
  { id: "0", title: "Vorbereitung & Zulassung", ects: 0, short: "Vor dem Studium",
    desc: "Nicht Teil des Curriculums: Voraussetzungen, Aufnahmeverfahren und Brückenwissen (Mathematik, Englisch, wissenschaftliches Lesen)." },
  { id: "A", title: "Studieneingangs- und Orientierungsphase (StEOP)", ects: 16, short: "StEOP",
    desc: "Die StEOP muss vollständig absolviert sein, bevor die meisten weiteren Lehrveranstaltungen belegt werden dürfen (Vorziehregeln laut Curriculum beachten). Prüfungen sind in der Regel schriftliche Vorlesungsprüfungen mit begrenzter Zahl an Antritten." },
  { id: "B", title: "Basismodulgruppe I", ects: 24, short: "Basis I",
    desc: "Allgemeine Psychologie, Biologische Psychologie und kognitiv-affektive Neurowissenschaften sowie Vertiefung bzw. forschungsorientiertes Praktikum." },
  { id: "C", title: "Basismodulgruppe II", ects: 22, short: "Basis II",
    desc: "Sozial-, Entwicklungs- und Differentielle Psychologie (Fortsetzung), Vertiefung sowie Diversitäts- und Genderforschung." },
  { id: "D", title: "Methodische Grundlagen", ects: 23, short: "Methoden",
    desc: "Forschungsmethoden, Statistik, Messen und Beobachten – das Fundament für alle empirischen Fächer und die Bachelorarbeit." },
  { id: "E", title: "Psychologische Diagnostik", ects: 13, short: "Diagnostik",
    desc: "Theorie und Techniken sowie Praxis psychologischen Diagnostizierens (Testtheorie-Anwendung, Gutachten, diagnostischer Prozess)." },
  { id: "F", title: "Anwendungsfelder der Psychologie", ects: 24, short: "Anwendung",
    desc: "Klinische und Gesundheitspsychologie, Bildungspsychologie sowie Arbeits-, Organisations- und Wirtschaftspsychologie." },
  { id: "G", title: "Praktische Berufsvorbereitung", ects: 12, short: "Beruf",
    desc: "Psychologische Gesprächsführung sowie Wahl zwischen Wissenschaftsvermittlung & Kommunikation, Orientierungspraktikum oder praxisorientiertem Seminar." },
  { id: "H", title: "Bachelorarbeit", ects: 16, short: "Bachelorarbeit",
    desc: "Fachliteraturseminar (6 ECTS) und Seminar mit Bachelorarbeit (10 ECTS)." },
  { id: "W", title: "Erweiterungscurricula / Wahlmodule", ects: 30, short: "Wahl",
    desc: "30 ECTS aus Erweiterungscurricula anderer Studien oder aus den Wahlmodulen der Psychologie (seit 2024 u. a. W1a „Grundlagen der Psychologischen Psychotherapie“ sowie W1b/W1c „Psychologie International“)." }
];

/* Bibliotheken & Kataloge.
 * template: Such-URL mit {q} als Platzhalter. Fehlt ein Template, wird der Suchbegriff
 * in die Zwischenablage kopiert und die Katalogstartseite geöffnet.
 * Templates können in den Einstellungen überschrieben werden. */
PP.libraries = [
  { id: "kit", name: "KIT-Bibliothek (Karlsruhe)", short: "KIT", home: "https://katalog.bibliothek.kit.edu/", template: "",
    info: "Die KIT-Bibliothek ist öffentlich zugänglich; auch Privatpersonen können ein Bibliothekskonto eröffnen. Viele Lehrbücher (v. a. Springer) gibt es dort zusätzlich als E-Book – im Campusnetz bzw. per VPN für KIT-Angehörige.",
    links: [{ title: "Bibliothekskonto für Privatpersonen", url: "https://www.bibliothek.kit.edu/eroeffnung-bibliothekskonto-privatpersonen.php" }, { title: "KIT-Bibliothek Startseite", url: "https://www.bibliothek.kit.edu/" }] },
  { id: "ubw", name: "Universitätsbibliothek Wien (u:search)", short: "UB Wien", home: "https://usearch.univie.ac.at/", template: "",
    info: "Die Fachbereichsbibliothek Psychologie der UB Wien führt die Lehrbuchsammlung (oft viele Exemplare der Standardwerke). Externe Personen können in der Regel einen Bibliotheksausweis beantragen – Bedingungen auf der UB-Webseite prüfen.",
    links: [{ title: "Universitätsbibliothek Wien", url: "https://bibliothek.univie.ac.at/" }] },
  { id: "bw", name: "Büchereien Wien (öffentlich)", short: "Büchereien Wien", home: "https://www.buechereien.wien.gv.at/", template: "",
    info: "Öffentliche Stadtbibliothek Wiens mit Hauptbücherei am Gürtel; gut sortiert bei populärwissenschaftlicher Psychologie, Ratgebern und Klassikern; E-Medien über die virtuelle Bücherei.",
    links: [] },
  { id: "kasb", name: "Stadtbibliothek Karlsruhe (öffentlich)", short: "Stadtbib. KA", home: "https://stadtbibliothek.karlsruhe.de/", template: "",
    info: "Öffentliche Bibliothek in Karlsruhe – Ergänzung zur KIT-Bibliothek.",
    links: [] },
  { id: "worldcat", name: "WorldCat (weltweit, zeigt Bibliotheken in der Nähe)", short: "WorldCat", home: "https://search.worldcat.org/", template: "https://search.worldcat.org/search?q={q}", info: "", links: [] },
  { id: "dnb", name: "Deutsche Nationalbibliothek", short: "DNB", home: "https://portal.dnb.de/", template: "https://portal.dnb.de/opac.htm?method=simpleSearch&query={q}", info: "Nur zur Titelrecherche (Präsenzbestand).", links: [] },
  { id: "springer", name: "SpringerLink (E-Books, oft über Uni-Lizenz)", short: "SpringerLink", home: "https://link.springer.com/", template: "https://link.springer.com/search?query={q}", info: "Viele deutschsprachige Psychologie-Lehrbücher (Springer-Lehrbuch, Bachelor-Reihe) sind über KIT- oder Uni-Wien-Lizenzen kostenlos als PDF verfügbar.", links: [] },
  { id: "openlib", name: "Open Library / Internet Archive (digitale Ausleihe)", short: "Open Library", home: "https://openlibrary.org/", template: "https://openlibrary.org/search?q={q}", info: "Kontrollierte digitale Ausleihe, v. a. englische Klassiker.", links: [] },
  { id: "scholar", name: "Google Scholar", short: "Scholar", home: "https://scholar.google.com/", template: "https://scholar.google.com/scholar?q={q}", info: "Für Fachartikel; im Uni-Netz mit Volltextlinks der Bibliothek.", links: [] }
];

/* Allgemeine, modulübergreifende Ressourcen */
PP.general = {
  openTextbooks: [
    { title: "OpenStax – Psychology 2e", url: "https://openstax.org/details/books/psychology-2e", lang: "EN", type: "Lehrbuch (OER)", note: "Vollständiges, kostenloses Einführungslehrbuch; deckt fast alle Grundlagenfächer auf Einstiegsniveau ab." },
    { title: "Noba Project – frei verfügbare Lehrbuchmodule", url: "https://nobaproject.com/", lang: "EN", type: "Lehrbuch (OER)", note: "Von Fachwissenschaftler:innen verfasste Kapitel zu nahezu jedem Teilgebiet; mit Lernfragen und Vokabellisten." },
    { title: "Introduction to Psychology – 1st Canadian Edition (BCcampus)", url: "https://opentextbc.ca/introductiontopsychology/", lang: "EN", type: "Lehrbuch (OER)", note: "" },
    { title: "Research Methods in Psychology (Price, Jhangiani & Chiang, BCcampus)", url: "https://opentextbc.ca/researchmethods/", lang: "EN", type: "Lehrbuch (OER)", note: "" },
    { title: "Principles of Social Psychology (BCcampus)", url: "https://opentextbc.ca/socialpsychology/", lang: "EN", type: "Lehrbuch (OER)", note: "" },
    { title: "LibreTexts – Psychology Bookshelf", url: "https://socialsci.libretexts.org/Bookshelves/Psychology", lang: "EN", type: "Sammlung (OER)", note: "Dutzende offene Lehrbücher zu allen Teilgebieten." },
    { title: "Open Textbook Library (University of Minnesota) – Psychologie", url: "https://open.umn.edu/opentextbooks/subjects/psychology", lang: "EN", type: "Sammlung (OER)", note: "" }
  ],
  reference: [
    { title: "Dorsch – Lexikon der Psychologie (online, frei zugänglich)", url: "https://dorsch.hogrefe.com/", lang: "DE", type: "Lexikon" },
    { title: "Spektrum – Lexikon der Psychologie", url: "https://www.spektrum.de/lexikon/psychologie/", lang: "DE", type: "Lexikon" },
    { title: "APA Dictionary of Psychology", url: "https://dictionary.apa.org/", lang: "EN", type: "Lexikon" },
    { title: "Stanford Encyclopedia of Philosophy", url: "https://plato.stanford.edu/", lang: "EN", type: "Enzyklopädie", note: "Für Wissenschaftstheorie, Bewusstsein, Geist-Gehirn-Problem." },
    { title: "PubPsych (ZPID) – Literaturdatenbank Psychologie", url: "https://pubpsych.zpid.de/", lang: "DE/EN", type: "Datenbank" },
    { title: "PsyArXiv – Preprints", url: "https://osf.io/preprints/psyarxiv", lang: "EN", type: "Datenbank" },
    { title: "Open Test Archive (ZPID) – frei nutzbare Tests", url: "https://www.testarchiv.eu/", lang: "DE/EN", type: "Testsammlung" },
    { title: "APA Style (7th edition)", url: "https://apastyle.apa.org/", lang: "EN", type: "Zitierstil" }
  ],
  tools: [
    { title: "jamovi – kostenlose Statistiksoftware (Point-and-Click, basiert auf R)", url: "https://www.jamovi.org/", type: "Software" },
    { title: "JASP – kostenlose Statistiksoftware inkl. Bayes-Statistik", url: "https://jasp-stats.org/", type: "Software" },
    { title: "R – Statistikumgebung", url: "https://www.r-project.org/", type: "Software" },
    { title: "RStudio Desktop (Posit)", url: "https://posit.co/download/rstudio-desktop/", type: "Software" },
    { title: "PsychoPy – Experimente programmieren", url: "https://www.psychopy.org/", type: "Software" },
    { title: "PsyToolkit – Online-Experimente & Fragebögen, viele Demo-Paradigmen", url: "https://www.psytoolkit.org/", type: "Software" },
    { title: "Open Science Framework (OSF)", url: "https://osf.io/", type: "Plattform" },
    { title: "Zotero – Literaturverwaltung", url: "https://www.zotero.org/", type: "Software" },
    { title: "Anki – Karteikarten mit Spaced Repetition", url: "https://apps.ankiweb.net/", type: "Software" }
  ],
  courses: [
    { title: "Yale Open Courses – PSYC 110 Introduction to Psychology (Paul Bloom)", url: "https://oyc.yale.edu/psychology/psyc-110", lang: "EN", provider: "Yale" },
    { title: "MIT OpenCourseWare – 9.00SC Introduction to Psychology", url: "https://ocw.mit.edu/courses/9-00sc-introduction-to-psychology-fall-2011/", lang: "EN", provider: "MIT" },
    { title: "Coursera – Introduction to Psychology (Yale, gratis im Audit-Modus)", url: "https://www.coursera.org/learn/introduction-psychology", lang: "EN", provider: "Coursera/Yale" },
    { title: "Crash Course Psychology (YouTube-Playlist, 40 Folgen)", url: "https://www.youtube.com/results?search_query=Crash+Course+Psychology+playlist", lang: "EN", provider: "YouTube" },
    { title: "Podcast „Psychologie to go!“ (Franca Cerutti)", url: "https://www.google.com/search?q=Psychologie+to+go+Podcast", lang: "DE", provider: "Podcast" }
  ],
  studyTips: [
    "Pro Modul zuerst Überblick (Lernziele + Themenliste), dann Lehrbuchkapitel, dann Vorlesungsvideos, zum Schluss Quiz und Prüfungssimulation.",
    "Aktives Abrufen (Retrieval Practice) und verteiltes Lernen (Spacing) sind die zwei am besten belegten Lernstrategien (Dunlosky et al., 2013) – nutze die Karteikarten-Funktion und wiederhole in wachsenden Abständen.",
    "Open-Book-Lesen mit Zusammenfassen in eigenen Worten (Elaboration) schlägt reines Markieren deutlich.",
    "Englische Fachliteratur früh trainieren: Ab dem 2. Semester ist ein großer Teil der Literatur englisch.",
    "Statistik nicht aufschieben: Methoden-Module bauen aufeinander auf; Übungen mit jamovi/JASP oder R parallel zur Theorie machen.",
    "Für StEOP-Prüfungen: Prüfungsstoff genau laut LV-Ankündigung in u:find/Moodle eingrenzen – Prüfungen beziehen sich auf angegebene Kapitel."
  ]
};

/* Empfohlener (nicht offizieller) Semesterplan im Vollzeitstudium */
PP.semesterPlan = [
  { sem: 1, title: "1. Semester (Winter)", modules: ["A1", "A2", "B1", "D1"], note: "StEOP abschließen hat Priorität. Vorziehregeln laut Curriculum prüfen; Methoden früh beginnen." },
  { sem: 2, title: "2. Semester (Sommer)", modules: ["B2", "B4", "C1", "C2", "D1"], note: "Basismodule; D1 läuft typischerweise über zwei Semester (Statistik I/II)." },
  { sem: 3, title: "3. Semester (Winter)", modules: ["B3", "C3", "C5", "D2", "W"], note: "Vertiefungen wählen; Erweiterungscurriculum beginnen." },
  { sem: 4, title: "4. Semester (Sommer)", modules: ["C4", "E1", "F1", "W"], note: "Diagnostik-Theorie und Klinische Psychologie." },
  { sem: 5, title: "5. Semester (Winter)", modules: ["E2", "F2", "F3", "G1", "H1"], note: "Anwendungsfelder; Fachliteraturseminar als Vorbereitung der Bachelorarbeit." },
  { sem: 6, title: "6. Semester (Sommer)", modules: ["G2", "H2", "W"], note: "Bachelorarbeit, Praxis/Wissenschaftsvermittlung, restliche Wahl-ECTS." }
];

/* Weiterführende Wege nach dem Bachelor */
PP.careers = [
  { title: "Masterstudium Psychologie (Uni Wien, 120 ECTS)", text: "Der Bachelor ist in Österreich kein berufsqualifizierender Abschluss für die geschützten Berufe. Für Klinische Psychologie, Gesundheitspsychologie und die meisten psychologischen Tätigkeiten ist ein Masterabschluss in Psychologie Voraussetzung." },
  { title: "Klinische Psycholog:in / Gesundheitspsycholog:in", text: "Nach dem Master: postgraduelle Ausbildung nach dem Psychologengesetz 2013 (theoretische und praktische Fachausbildung, Supervision, Prüfung) – Eintragung in die Liste beim Gesundheitsministerium." },
  { title: "Psychotherapeut:in", text: "Das Psychotherapiegesetz 2024 stellt die Ausbildung schrittweise auf ein akademisches Modell um (Bachelor mit psychotherapeutischen Grundlagen, Master Psychotherapie, anschließend postgraduelle fachspezifische Ausbildung). Übergangsbestimmungen und Inkrafttreten aktuell prüfen – das Wahlmodul W1a „Grundlagen der Psychologischen Psychotherapie“ ist darauf ausgerichtet." },
  { title: "Arbeits-, Organisations- und Wirtschaftspsychologie", text: "Personalauswahl und -entwicklung, Organisationsberatung, Markt- und Konsumentenforschung, UX-Research, Arbeits- und Gesundheitsschutz (Arbeitspsychologie ist in Österreich als Präventivfachkraft anerkannt)." },
  { title: "Wissenschaft & Forschung", text: "Doktoratsstudium (PhD) z. B. an der Vienna Doctoral School in Cognition, Behavior and Neuroscience (VDS CoBeNe) oder im Ausland." },
  { title: "Weitere Felder", text: "Schulpsychologie/Bildungsberatung, Verkehrspsychologie, Rechtspsychologie, Sportpsychologie, Neuropsychologie, Data Science, Public Health, Wissenschaftskommunikation." }
];
PP.careerLinks = [
  { title: "Berufsverband Österreichischer PsychologInnen (BÖP)", url: "https://www.boep.or.at/" },
  { title: "Rechtsinformationssystem des Bundes (RIS) – Psychologengesetz 2013 & Psychotherapiegesetz", url: "https://www.ris.bka.gv.at/" },
  { title: "Gesundheitsportal Österreich", url: "https://www.gesundheit.gv.at/" }
];
