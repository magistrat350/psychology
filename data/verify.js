/* Prüfmodus: Checkliste für den Abgleich des Modulplans mit dem Curriculum-PDF.
 * Pro Modul erzeugt die App automatisch Prüfpunkte zu Titel, ECTS und Lehrveranstaltungen;
 * hier stehen zusätzlich globale Punkte und gezielte Hinweise auf unsichere Angaben (unsure: true). */
PP.verification = {
  source: "Curriculum Bachelor Psychologie Universität Wien, Version 2022, inkl. 1. Änderung (MBl. 2023/24 Nr. 84)",
  howto: [
    "Öffne das konsolidierte Curriculum (PDF) und den Prüfungspass – Links unten.",
    "Gehe die Punkte der Reihe nach durch: „stimmt“, „weicht ab“ oder offen lassen.",
    "Bei Abweichungen trage ein, was im Curriculum steht (Seitenzahl hilft).",
    "Am Ende die Abweichungen als Markdown kopieren oder als GitHub-Issue anlegen – damit lassen sich die App-Daten korrigieren."
  ],
  global: [
    { id: "g-umfang", text: "Gesamtumfang 180 ECTS, Regelstudienzeit 6 Semester, akademischer Grad Bachelor of Science (BSc)." },
    { id: "g-gruppen", text: "Modulgruppen und ECTS: A StEOP 16 · B Basismodulgruppe I 24 · C Basismodulgruppe II 22 · D Methodische Grundlagen 23 · E Psychologische Diagnostik 13 · F Anwendungsfelder 24 · G Praktische Berufsvorbereitung 12 · H Bachelorarbeit 16 · Erweiterungscurricula/Wahlmodule 30." },
    { id: "g-steop-vorziehen", text: "StEOP: Welche Lehrveranstaltungen dürfen vor Abschluss der StEOP absolviert werden und bis zu welchem ECTS-Umfang? (in der App nicht konkret angegeben)", unsure: true },
    { id: "g-antritte", text: "Anzahl der zulässigen Prüfungsantritte, insbesondere für StEOP-Prüfungen.", unsure: true },
    { id: "g-wahl", text: "Wahlbereich: 30 ECTS aus Erweiterungscurricula und/oder Wahlmodulen der Psychologie – Kombinationsregeln und Ausschlüsse.", unsure: true },
    { id: "g-wahlmodule", text: "Wahlmodule seit 1.10.2024: W1a „Grundlagen der Psychologischen Psychotherapie“, W1b/W1c „Psychologie International 1 und 2“ – Bezeichnungen, ECTS-Umfang und Zugangsvoraussetzungen.", unsure: true },
    { id: "g-voraussetzungen", text: "Voraussetzungsketten zwischen Modulen (z. B. Methoden vor Diagnostik, Fachliteraturseminar vor Bachelorarbeit).", unsure: true },
    { id: "g-aufnahme", text: "Aufnahmeverfahren: Registrierung, Online-Self-Assessment und Aufnahmetest wie im Modul V0 beschrieben (Infos des SSC und der Aufnahmeverfahren-Seite, nicht im Curriculum selbst).", unsure: true }
  ],
  modules: {
    A1: [{ id: "a1-lv", text: "Lehrveranstaltungsstruktur: Ist A1 eine Vorlesung mit 8 ECTS oder mehrere Vorlesungen (welche Aufteilung)?", unsure: true }],
    A2: [{ id: "a2-lv", text: "A2 besteht aus zwei Vorlesungen (Entwicklungspsychologie, Sozialpsychologie) zu je 4 ECTS.", unsure: true }],
    B1: [{ id: "b1-lv", text: "B1 Allgemeine Psychologie: eine Vorlesung mit 8 ECTS oder Aufteilung (z. B. Allgemeine Psychologie I/II)?", unsure: true }],
    B2: [{ id: "b2-lv", text: "B2: Lehrveranstaltungsform und Aufteilung der 8 ECTS.", unsure: true }],
    B3: [{ id: "b3-optionen", text: "B3 Wahlmöglichkeiten: Vertiefung Allgemeine Psychologie, Vertiefung Biologische Psychologie oder forschungsorientiertes Praktikum (je 6 ECTS); Lehrveranstaltungstyp.", unsure: true }],
    B4: [{ id: "b4-umfang", text: "B4 VU „Psychologische Forschung erleben und reflektieren“ (2 ECTS): Umfang der Studienteilnahmen (Versuchspersonenstunden) und Leistungsnachweis.", unsure: true }],
    C1: [{ id: "c1-lv", text: "C1 Sozialpsychologie II: Vorlesung mit 4 ECTS.", unsure: true }],
    C2: [{ id: "c2-lv", text: "C2 Entwicklungspsychologie II: Vorlesung mit 4 ECTS.", unsure: true }],
    C3: [{ id: "c3-lv", text: "C3 Differentielle Psychologie und Persönlichkeitspsychologie: Vorlesung mit 4 ECTS.", unsure: true }],
    C4: [{ id: "c4-optionen", text: "C4 Wahlmöglichkeiten: Vertiefung Sozial-, Entwicklungs- oder Differentielle Psychologie bzw. forschungsorientiertes Praktikum (je 6 ECTS).", unsure: true }],
    C5: [{ id: "c5-lv", text: "C5 Diversitäts- und Genderforschung: genauer Titel, 4 ECTS, Lehrveranstaltungstyp.", unsure: true }],
    D1: [{ id: "d1-aufteilung", text: "D1 (13 ECTS): Aufteilung auf Forschungsmethoden-Vorlesung und Statistik-Lehrveranstaltungen, welche davon prüfungsimmanent sind.", unsure: true }],
    D2: [{ id: "d2-aufteilung", text: "D2 (10 ECTS): Aufteilung auf Lehrveranstaltungen und Inhalte (Testtheorie, Beobachtung, Interview, qualitative Methoden).", unsure: true }],
    E1: [{ id: "e1-lv", text: "E1 (7 ECTS): Lehrveranstaltungsform (VO oder VU).", unsure: true }],
    E2: [{ id: "e2-lv", text: "E2 (6 ECTS): Lehrveranstaltungsform und Prüfungsmodus.", unsure: true }],
    F1: [{ id: "f1-aufteilung", text: "F1 (12 ECTS): Aufteilung auf Klinische Psychologie, Gesundheitspsychologie und ggf. Seminar.", unsure: true }],
    F2: [{ id: "f2-lv", text: "F2 Bildungspsychologie (6 ECTS): Lehrveranstaltungsform.", unsure: true }],
    F3: [{ id: "f3-lv", text: "F3 Arbeits-, Organisations- und Wirtschaftspsychologie (6 ECTS): Lehrveranstaltungsform.", unsure: true }],
    G1: [{ id: "g1-lv", text: "G1 Psychologische Gesprächsführung (6 ECTS): Lehrveranstaltungstyp (UE/SE).", unsure: true }],
    G2: [{ id: "g2-optionen", text: "G2: Bezeichnung „G2a Wissenschaftsvermittlung und Kommunikation“, Alternativen (Orientierungspraktikum, praxisorientiertes Seminar) und geforderter Praktikumsumfang.", unsure: true }],
    H1: [{ id: "h1-lv", text: "H1 Fachliteraturseminar: 6 ECTS, Seminar.", unsure: true }],
    H2: [{ id: "h2-lv", text: "H2 Bachelorarbeit: Seminar mit 10 ECTS; formale Vorgaben zur Arbeit (Umfang, Sprache).", unsure: true }],
    W1: [{ id: "w1-regeln", text: "Wahlbereich 30 ECTS: Regeln für Erweiterungscurricula, Anerkennung von Auslandsleistungen.", unsure: true }],
    W1a: [{ id: "w1a-umfang", text: "W1a: ECTS-Umfang und Lehrveranstaltungen des Wahlmoduls „Grundlagen der Psychologischen Psychotherapie“.", unsure: true }]
  }
};
