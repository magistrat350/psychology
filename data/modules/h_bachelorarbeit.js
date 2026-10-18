/* Pflichtmodulgruppe H – Bachelorarbeit (16 ECTS) */
PP.addModule({
  id: "H1",
  group: "H",
  title: "Fachliteraturseminar",
  short: "Fachliteraturseminar",
  ects: 6,
  semester: "5",
  lvs: [{ type: "SE", title: "Fachliteraturseminar (Vorbereitung der Bachelorarbeit)", ects: 6, pi: true }],
  summary:
    "Im Fachliteraturseminar lernen Studierende, zu einem eingegrenzten Thema **systematisch Literatur zu recherchieren, kritisch zu bewerten, zu synthetisieren und darzustellen**. Häufig entsteht hier bereits das Konzept bzw. der theoretische Hintergrund der Bachelorarbeit. Inhalte: Recherchestrategien und Datenbanken, Literaturverwaltung, kritisches Lesen, Arten von Reviews (narrativ, systematisch, Metaanalyse), Argumentieren und Schreiben, Zitieren nach APA, gute wissenschaftliche Praxis (Plagiat, KI-Nutzung), Präsentation und Peer-Feedback.",
  goals: [
    "Eine präzise, beantwortbare Fragestellung formulieren",
    "Systematisch in Fachdatenbanken recherchieren und Ergebnisse dokumentieren",
    "Studien hinsichtlich Qualität und Aussagekraft kritisch bewerten",
    "Literatur strukturiert synthetisieren (nicht nur aneinanderreihen)",
    "Korrekt nach APA zitieren und Regeln guter wissenschaftlicher Praxis einhalten",
    "Ein Exposé bzw. einen Literaturüberblick verfassen und präsentieren"
  ],
  exam_info: "Prüfungsimmanent: Anwesenheit, Referat, Peer-Feedback, schriftliche Arbeit (Literaturüberblick bzw. Exposé). Beurteilungskriterien laut LV.",
  tips: [
    "Thema früh eingrenzen: PICO/PECO-Schema hilft (Population, Intervention/Exposition, Vergleich, Outcome).",
    "Ab der ersten Quelle Zotero nutzen – spart Tage beim Literaturverzeichnis.",
    "Synthesematrix anlegen: Zeilen = Studien, Spalten = Stichprobe, Design, Messung, Ergebnis, Effektgröße, Limitationen.",
    "Jeden Absatz mit einer Aussage beginnen, die Literatur dient als Beleg – nicht umgekehrt."
  ],
  prerequisites: ["D1/D2 (Methoden, Statistik, Gütekriterien)", "Fachwissen in einem Teilgebiet (Wahl des Themas)"],
  competencies: [
    "Ich kann eine Forschungsfrage nach PICO/PECO formulieren und eingrenzen.",
    "Ich kann Suchstrings mit Booleschen Operatoren, Trunkierung und Thesaurusbegriffen erstellen.",
    "Ich kann in PsycINFO/PubPsych, PubMed, Web of Science und Google Scholar recherchieren und die Suche dokumentieren.",
    "Ich kann ein Literaturverwaltungsprogramm (z. B. Zotero) bedienen.",
    "Ich kann narrative Reviews, systematische Reviews und Metaanalysen unterscheiden.",
    "Ich kann die Qualität einer Studie (Design, Stichprobe, Messung, Bias-Risiko) beurteilen.",
    "Ich kann den PRISMA-Prozess beschreiben.",
    "Ich kann Literatur thematisch synthetisieren und Forschungslücken herausarbeiten.",
    "Ich kann direkt und indirekt zitieren und ein Literaturverzeichnis nach APA 7 erstellen.",
    "Ich kann Plagiate vermeiden und die Regeln der Uni Wien zur KI-Nutzung einhalten."
  ],
  skills: ["Datenbankrecherche", "Zotero", "Synthesematrix", "Exposé schreiben", "APA 7", "Peer-Feedback"],
  topics: [
    { title: "Von der Themenidee zur Forschungsfrage",
      text: "Gute Forschungsfragen sind **relevant**, **präzise**, **beantwortbar** (mit verfügbaren Mitteln/Literatur) und **theoretisch verankert**. Eingrenzung über Population, Konstrukte, Kontext und Methode. Schemata: **PICO** (Population, Intervention, Comparison, Outcome) für Interventionsfragen, **PECO** (Exposure) für Zusammenhangsfragen, **SPIDER** für qualitative Fragen. Typen: deskriptiv, Zusammenhang, Unterschied, Wirkung, Mechanismus (Mediation), Bedingungen (Moderation). Erste Orientierung: aktuelle Reviews und Handbuchkapitel lesen.",
      concepts: ["Forschungsfrage", "PICO", "PECO", "SPIDER", "Eingrenzung", "Review als Einstieg"] },
    { title: "Recherche in Fachdatenbanken",
      text: "Datenbanken: **APA PsycInfo** (Hauptdatenbank der Psychologie; über Uni-Lizenz), **PubPsych** (ZPID, frei, europäisch), **PubMed** (Medizin), **Web of Science**/Scopus (zitationsbasiert), **ERIC** (Bildung), **Google Scholar** (breit, aber unsystematisch), PsyArXiv (Preprints). Techniken: Schlagwörter vs. Freitext, **Boolesche Operatoren** (AND, OR, NOT), Phrasensuche (\"…\"), **Trunkierung** (adolescen*), Thesaurus (APA Thesaurus Terms/MeSH), Filter (Jahr, Sprache, Methodik). **Schneeballverfahren**: rückwärts (Literaturliste) und vorwärts (Zitiert von). Suchprotokoll führen (Datenbank, Datum, Suchstring, Trefferzahl). Volltexte über u:search (UB Wien) bzw. KIT-Katalog, Fernleihe, Open-Access-Versionen (Unpaywall).",
      concepts: ["PsycInfo", "PubPsych", "PubMed", "Web of Science", "Boolesche Operatoren", "Trunkierung", "Thesaurus", "Schneeballverfahren", "Suchprotokoll", "Fernleihe"] },
    { title: "Literaturverwaltung und Lesestrategie",
      text: "**Zotero** (frei; Browser-Connector, Word/LibreOffice-Plugin, APA-7-Stil), Alternativen: Citavi (an vielen Unis lizenziert), EndNote, JabRef. Ordnerstruktur und Tags, PDFs annotieren. **Lesestrategie**: Abstract → Abbildungen/Tabellen → Diskussion → Methode im Detail; Notizen in eigenen Worten mit Seitenangaben (vermeidet unbeabsichtigtes Plagiat). **Synthesematrix** für den Vergleich vieler Studien.",
      concepts: ["Zotero", "Citavi", "Annotation", "Exzerpt", "Synthesematrix"] },
    { title: "Arten von Übersichtsarbeiten",
      text: "- **Narratives Review**: Expert:innen fassen Literatur zusammen – flexibel, aber anfällig für selektive Auswahl\n- **Systematisches Review**: vorab festgelegte Fragestellung, Suchstrategie, Ein-/Ausschlusskriterien, Qualitätsbewertung; Berichterstattung nach **PRISMA 2020** (Flussdiagramm: Identifikation → Screening → Eignung → Einschluss); Präregistrierung z. B. bei PROSPERO\n- **Metaanalyse**: statistische Zusammenfassung von Effektgrößen (Fixed vs. Random Effects, Heterogenität I², Publikationsbias: Funnel Plot, Egger-Test)\n- **Scoping Review**: Kartierung eines Forschungsfeldes\n- **Umbrella Review**: Review von Reviews\n\nIm Bachelor meist ein strukturierter narrativer Überblick mit systematischen Elementen.",
      concepts: ["narratives Review", "systematisches Review", "PRISMA 2020", "PROSPERO", "Metaanalyse", "Random Effects", "I²", "Funnel Plot", "Scoping Review"] },
    { title: "Studien kritisch bewerten",
      text: "Leitfragen: Passt das **Design** zur Fragestellung (Kausalität nur bei Experiment)? **Stichprobe**: Größe (Power), Rekrutierung, Generalisierbarkeit (WEIRD)? **Messung**: Reliabilität und Validität der Instrumente, Selbstbericht vs. Verhalten? **Analyse**: angemessen, präregistriert, Effektgrößen und KIs berichtet, Umgang mit fehlenden Daten? **Interpretation**: Schlüsse gedeckt? Interessenkonflikte? **Replikation**? Werkzeuge: Risk-of-Bias-Tools (z. B. Cochrane RoB 2 für RCTs), Checklisten (CASP), Evidenzhierarchie (Metaanalysen von RCTs oben, Expertenmeinung unten – mit Vorsicht anwenden).",
      concepts: ["Design-Passung", "Power", "Generalisierbarkeit", "Messqualität", "Risk of Bias", "CASP", "Evidenzhierarchie", "Interessenkonflikt"] },
    { title: "Synthetisieren und Argumentieren",
      text: "Synthese heißt: Studien **thematisch** (nicht Studie für Studie) zusammenführen, Übereinstimmungen und Widersprüche benennen, Widersprüche erklären (Stichprobe, Messung, Design), **Forschungslücken** identifizieren und daraus die eigene Fragestellung ableiten. Struktur: Trichterprinzip (vom Allgemeinen zum Spezifischen), Leitfragen-Gliederung, klare Absatzstruktur (Topic Sentence – Belege – Bewertung – Überleitung). Argumentationsmuster: These – Begründung – Beleg – Einschränkung. Vorsichtige, präzise Sprache (Hedging angemessen).",
      concepts: ["thematische Synthese", "Widersprüche erklären", "Forschungslücke", "Trichterprinzip", "Topic Sentence", "Argumentationsstruktur"] },
    { title: "Zitieren nach APA 7 und gute wissenschaftliche Praxis",
      text: "**Im Text**: (Autor, Jahr) bzw. Autor (Jahr); bei zwei Autor:innen beide (Müller & Meier, 2020), ab drei „et al.“ (Huber et al., 2021); direkte Zitate mit Seitenangabe (S. 12) und sparsam. **Literaturverzeichnis**: alphabetisch, hängender Einzug; Zeitschriftenartikel: Autor, A. A., & Autor, B. B. (Jahr). Titel. *Zeitschrift*, *Band*(Heft), Seiten. https://doi.org/… ; Buch: Autor, A. A. (Jahr). *Titel* (Aufl.). Verlag.\n\n**Gute wissenschaftliche Praxis**: Plagiat (auch Selbstplagiat, Paraphrasen ohne Quelle, Übersetzungsplagiat) ist ein schweres Vergehen; Plagiatsprüfung an der Uni Wien (Turnitin). **KI-Werkzeuge**: Nutzung nur im Rahmen der Vorgaben der Lehrveranstaltung/Universität, transparent deklarieren, Inhalte prüfen (Halluzinationen erfundener Quellen!). Datenfabrikation und -fälschung, Ghostwriting. Österreichische Agentur für wissenschaftliche Integrität (ÖAWI).",
      concepts: ["APA 7 Zitation", "et al.", "DOI", "Literaturverzeichnis", "Plagiat", "Turnitin", "KI-Deklaration", "ÖAWI"] },
    { title: "Exposé schreiben",
      text: "Ein **Exposé** (ca. 3–8 Seiten) bereitet die Bachelorarbeit vor: (1) Arbeitstitel, (2) Problemstellung und Relevanz, (3) theoretischer Hintergrund und Forschungsstand (kurz), (4) Forschungsfrage(n) und Hypothesen, (5) geplante Methode (Design, Stichprobe, Instrumente, Auswertung), (6) Ethik (Ethikantrag nötig?), (7) Zeitplan, (8) vorläufiges Literaturverzeichnis. Es dient der Abstimmung mit der Betreuungsperson und als Arbeitsplan.",
      concepts: ["Exposé", "Arbeitstitel", "Relevanz", "Methodenplan", "Zeitplan"] }
  ],
  materials: [
    { title: "PubPsych (ZPID) – frei zugängliche Literaturdatenbank", url: "https://pubpsych.zpid.de/", type: "Datenbank", lang: "DE/EN" },
    { title: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/", type: "Datenbank", lang: "EN" },
    { title: "Google Scholar", url: "https://scholar.google.com/", type: "Datenbank", lang: "EN" },
    { title: "u:search – Universitätsbibliothek Wien", url: "https://usearch.univie.ac.at/", type: "Katalog", lang: "DE/EN" },
    { title: "KIT-Katalog – KIT-Bibliothek", url: "https://katalog.bibliothek.kit.edu/", type: "Katalog", lang: "DE/EN" },
    { title: "Zotero – Literaturverwaltung (frei)", url: "https://www.zotero.org/", type: "Software", lang: "EN/DE" },
    { title: "Unpaywall – legale Open-Access-Versionen finden", url: "https://unpaywall.org/", type: "Werkzeug", lang: "EN" },
    { title: "PRISMA 2020 Statement & Flussdiagramm", url: "https://www.prisma-statement.org/", type: "Richtlinie", lang: "EN" },
    { title: "APA Style – Referenzbeispiele", url: "https://apastyle.apa.org/style-grammar-guidelines/references/examples", type: "Richtlinie", lang: "EN" },
    { title: "Österreichische Agentur für wissenschaftliche Integrität (ÖAWI)", url: "https://oeawi.at/", type: "Offizielle Info", lang: "DE" }
  ],
  lectures: [
    { title: "Literaturrecherche in PsycInfo / Datenbanken (YouTube-Suche)", url: "https://www.youtube.com/results?search_query=PsycInfo+Recherche+Tutorial", provider: "YouTube", lang: "DE/EN" },
    { title: "Zotero Tutorial (YouTube-Suche)", url: "https://www.youtube.com/results?search_query=Zotero+Tutorial+Deutsch", provider: "YouTube", lang: "DE" },
    { title: "Systematic Reviews & Meta-Analysis – Einführungen (YouTube-Suche)", url: "https://www.youtube.com/results?search_query=systematic+review+meta-analysis+introduction+psychology", provider: "YouTube", lang: "EN" },
    { title: "Coursera – Introduction to Systematic Review and Meta-Analysis (Johns Hopkins)", url: "https://www.coursera.org/learn/systematic-review", provider: "Coursera", lang: "EN" }
  ],
  literature: [
    { authors: "American Psychological Association", year: 2020, title: "Publication Manual of the American Psychological Association", ed: "7th ed.", publisher: "APA", tag: "Nachschlagen", lang: "EN" },
    { authors: "Deutsche Gesellschaft für Psychologie", year: 2019, title: "Richtlinien zur Manuskriptgestaltung", ed: "5. Aufl.", publisher: "Hogrefe", tag: "Nachschlagen", lang: "DE" },
    { authors: "Kornmeier, M.", year: 2021, title: "Wissenschaftlich schreiben leicht gemacht", publisher: "Haupt (UTB)", tag: "Standard", lang: "DE" },
    { authors: "Eco, U.", year: 2010, title: "Wie man eine wissenschaftliche Abschlußarbeit schreibt", publisher: "Facultas (UTB)", tag: "Klassiker", lang: "DE", note: "Wiener Verlag – humorvoller Klassiker." },
    { authors: "Theisen, M. R.", year: 2017, title: "Wissenschaftliches Arbeiten: Erfolgreich bei Bachelor- und Masterarbeit", publisher: "Vahlen", tag: "Einstieg", lang: "DE" },
    { authors: "Borenstein, M., Hedges, L. V., Higgins, J. P. T. & Rothstein, H. R.", year: 2021, title: "Introduction to Meta-Analysis", ed: "2nd ed.", publisher: "Wiley", tag: "Vertiefung", lang: "EN" },
    { authors: "Silvia, P. J.", year: 2019, title: "How to Write a Lot: A Practical Guide to Productive Academic Writing", ed: "2nd ed.", publisher: "APA", tag: "Einstieg", lang: "EN" }
  ],
  quiz: [
    { q: "Welcher Suchstring findet Artikel zu Angst ODER Furcht bei Jugendlichen (inkl. adolescence/adolescents)?", o: ["anxiety AND fear AND adolescent", "(anxiety OR fear) AND adolescen*", "anxiety NOT fear", "anxiety OR fear OR adolescent"], a: 1, e: "OR verbindet Synonyme, AND verknüpft Konzepte, * trunkiert." },
    { q: "Was bedeutet Vorwärts-Schneeballsuche?", o: ["Literaturliste eines Artikels durchsehen", "Neuere Arbeiten suchen, die einen Artikel zitieren", "Nach Jahreszahl sortieren", "Nur Bücher suchen"], a: 1, e: "„Zitiert von“ in Google Scholar/Web of Science." },
    { q: "Wodurch unterscheidet sich ein systematisches Review von einem narrativen?", o: ["Es ist kürzer", "Es folgt einer vorab festgelegten, transparenten und reproduzierbaren Such- und Auswahlstrategie", "Es enthält keine Tabellen", "Es wird nur von Studierenden verfasst"], a: 1, e: "Berichterstattung nach PRISMA." },
    { q: "Welches Maß beschreibt die Heterogenität in einer Metaanalyse?", o: ["Cronbachs α", "I²", "R²", "κ"], a: 1, e: "Anteil der Variabilität, der auf echte Unterschiede zurückgeht." },
    { q: "Ein Funnel Plot dient vor allem zur Prüfung auf …", o: ["Normalverteilung", "Publikationsbias", "Reliabilität", "Multikollinearität"], a: 1, e: "Asymmetrie deutet auf fehlende kleine, nicht-signifikante Studien hin." },
    { q: "Korrekte APA-7-Zitation im Text für einen Artikel von drei Autor:innen (Huber, Maier, Gruber, 2021)?", o: ["(Huber, Maier & Gruber, 2021) bei jeder Nennung", "(Huber et al., 2021)", "(Huber u. a. 2021, S.)", "(Huber 2021 et al.)"], a: 1, e: "Ab drei Autor:innen schon bei der ersten Nennung et al." },
    { q: "Was ist ein Plagiat?", o: ["Nur wörtliches Abschreiben ohne Quelle", "Übernahme fremder Gedanken oder Formulierungen ohne Kennzeichnung – auch als Paraphrase oder Übersetzung", "Zitieren mit Seitenangabe", "Verwendung einer Literaturverwaltung"], a: 1, e: "Auch Selbstplagiat ist problematisch." },
    { q: "Welcher Umgang mit KI-Werkzeugen ist mit guter wissenschaftlicher Praxis vereinbar?", o: ["Von KI erzeugte Quellen ungeprüft übernehmen", "Nutzung im erlaubten Rahmen, transparent deklariert, mit Prüfung aller Inhalte und Quellen", "Ganze Kapitel generieren lassen und als eigene ausgeben", "KI-Nutzung verschweigen"], a: 1, e: "Vorgaben der LV/Universität beachten; KI kann Quellen erfinden." },
    { q: "PICO steht für …", o: ["Population, Intervention, Comparison, Outcome", "Problem, Idee, Konzept, Ordnung", "Power, Interaction, Correlation, Outlier", "Plan, Implement, Check, Optimize"], a: 0, e: "Hilft, Fragestellungen und Suchstrings zu strukturieren." }
  ],
  exam: [
    { q: "Formulieren Sie zum Thema „Schlaf und Prüfungsleistung bei Studierenden“ eine präzise Forschungsfrage nach PECO, einen Suchstring für PsycInfo und Ein-/Ausschlusskriterien für die Literaturauswahl.", p: 8,
      s: "- PECO: P = Studierende, E = Schlafdauer/-qualität, C = kürzerer vs. längerer Schlaf, O = Prüfungsleistung/Noten (2 P.)\n- Suchstring: (sleep* OR \"sleep quality\" OR \"sleep duration\") AND (student* OR undergraduate*) AND (\"academic performance\" OR exam* OR grade*) (3 P.)\n- Kriterien: empirische Studien, Studierende, quantitative Leistungsmaße, Sprache DE/EN, Zeitraum, peer-reviewed; Ausschluss: klinische Schlafstörungen-Stichproben nur wenn nicht Fokus (3 P.)" },
    { q: "Beschreiben Sie den Aufbau eines Exposés für eine Bachelorarbeit und erläutern Sie, wozu jeder Teil dient.", p: 6,
      s: "- Titel, Problemstellung/Relevanz, Forschungsstand, Fragestellung/Hypothesen, Methode, Ethik, Zeitplan, Literatur (je kurze Funktion) (6 P.)" }
  ],
  glossary: [
    ["Boolesche Operatoren", "Verknüpfungen AND, OR, NOT zur Formulierung von Suchanfragen."],
    ["Trunkierung", "Platzhalter (z. B. *) für beliebige Wortendungen."],
    ["Schneeballverfahren", "Literatursuche über Literaturverzeichnisse (rückwärts) und Zitationen (vorwärts)."],
    ["Systematisches Review", "Übersichtsarbeit mit transparenter, reproduzierbarer Methodik."],
    ["PRISMA", "Richtlinie zur Berichterstattung systematischer Reviews und Metaanalysen."],
    ["Metaanalyse", "Statistische Zusammenfassung der Ergebnisse mehrerer Studien."],
    ["Publikationsbias", "Verzerrung durch bevorzugte Veröffentlichung signifikanter Ergebnisse."],
    ["Exposé", "Kurze Projektskizze einer geplanten wissenschaftlichen Arbeit."],
    ["Plagiat", "Unkenntlich gemachte Übernahme fremden geistigen Eigentums."],
    ["DOI", "Digital Object Identifier – dauerhafte Kennung wissenschaftlicher Publikationen."]
  ]
});

PP.addModule({
  id: "H2",
  group: "H",
  title: "Seminar mit Bachelorarbeit",
  short: "Bachelorarbeit",
  ects: 10,
  semester: "6",
  lvs: [{ type: "SE", title: "Bachelorarbeit (Seminar mit Abfassung der Bachelorarbeit)", ects: 10, pi: true }],
  summary:
    "Die **Bachelorarbeit** wird im Rahmen eines Seminars verfasst und betreut. In der Psychologie ist sie meist **empirisch**: Studierende bearbeiten – oft in Kleingruppen mit individuellen Teilfragestellungen – eine Fragestellung von der Planung über Ethik, Datenerhebung und Auswertung bis zur Verschriftlichung im Format eines wissenschaftlichen Artikels nach APA-Richtlinien. Erste Konzepte entstehen häufig bereits im Fachliteraturseminar (H1).\n\nDie Arbeit wird in der Regel auf Plagiat geprüft. Formale Vorgaben (Umfang, Sprache, Deckblatt, Abgabe, Eidesstattliche Erklärung) sind beim SSC Psychologie und in der LV zu finden.",
  goals: [
    "Eine empirische Fragestellung selbständig bearbeiten",
    "Studie planen (Design, Stichprobe, Material) und ethisch absichern",
    "Daten erheben, aufbereiten und angemessen analysieren",
    "Ergebnisse im Format eines wissenschaftlichen Artikels darstellen und diskutieren",
    "Projekt- und Zeitmanagement sowie Zusammenarbeit mit der Betreuung gestalten"
  ],
  exam_info: "Beurteilung der schriftlichen Bachelorarbeit (Inhalt, Methodik, Darstellung) sowie ggf. Seminarleistungen (Präsentation des Projekts, Zwischenberichte).",
  tips: [
    "Rückwärtsplanung vom Abgabetermin: Puffer für Ethik, Rekrutierung und Feedbackschleifen einplanen.",
    "Analyse-Skript schon mit Pilotdaten schreiben (R/jamovi) – spart Zeit und deckt Datenprobleme früh auf.",
    "Methode und Ergebnisse zuerst schreiben, Einleitung und Diskussion danach, Abstract zuletzt.",
    "Betreuung aktiv nutzen: Fragen sammeln, Termine vorbereiten, Feedback dokumentieren."
  ],
  prerequisites: ["H1 Fachliteraturseminar", "D1/D2 (Statistik, Messen)", "Fachwissen im gewählten Gebiet"],
  competencies: [
    "Ich kann ein realistisches Projekt mit Zeitplan und Meilensteinen planen.",
    "Ich kann prüfen, ob ein Ethikvotum nötig ist, und eine Einwilligungserklärung erstellen.",
    "Ich kann eine Studie präregistrieren (OSF/AsPredicted).",
    "Ich kann eine Stichprobengröße per Power-Analyse begründen.",
    "Ich kann Daten bereinigen, dokumentieren und reproduzierbar analysieren.",
    "Ich kann Hypothesentests und Effektgrößen korrekt berichten.",
    "Ich kann eine Diskussion mit Einordnung, Limitationen und Implikationen schreiben.",
    "Ich kann formale Anforderungen (APA, Abbildungen, Tabellen, Anhang, Erklärungen) erfüllen."
  ],
  skills: ["Projektmanagement", "Ethikantrag", "Präregistrierung", "Datenanalyse in R/jamovi", "Wissenschaftliches Schreiben", "Umgang mit Feedback"],
  topics: [
    { title: "Projektplanung und Betreuung",
      text: "Themenfindung meist über Seminarangebote der Arbeitsbereiche (u:find), teils eigene Vorschläge. Klären: Fragestellung, Umfang, Einzel- vs. Gruppenprojekt, verfügbare Ressourcen (Labor, Software, Versuchspersonen), Erwartungen der Betreuung. **Zeitplan** (Beispiel 1 Semester): Wochen 1–3 Literatur und Fragestellung, 4–5 Planung/Ethik/Präregistrierung, 6–9 Datenerhebung, 10–11 Auswertung, 12–15 Schreiben und Überarbeiten. Puffer einplanen (Rekrutierung dauert immer länger).",
      concepts: ["Themenfindung", "Betreuungsvereinbarung", "Zeitplan", "Meilensteine", "Puffer"] },
    { title: "Ethik, Datenschutz und Präregistrierung",
      text: "Prüfen, ob ein **Ethikvotum** der Ethikkommission der Universität Wien erforderlich ist (z. B. bei vulnerablen Gruppen, Täuschung, Belastung, sensiblen Daten) – Vorgaben der Fakultät/Betreuung beachten. Informierte Einwilligung, Datenschutzinformation (DSGVO), Pseudonymisierung, sichere Speicherung, Löschfristen. **Präregistrierung** von Hypothesen, Design, Stichprobengröße, Ausschlusskriterien und Analyseplan (OSF, AsPredicted) – zunehmend Standard auch bei Abschlussarbeiten.",
      concepts: ["Ethikvotum", "Einwilligungserklärung", "DSGVO", "Pseudonymisierung", "Präregistrierung"] },
    { title: "Datenerhebung und -management",
      text: "Rekrutierung (Uni-Plattformen, Social Media, Aushänge – Stichprobenverzerrungen bedenken), standardisierte Durchführung, Pilotierung. **Datenmanagement**: Rohdaten unverändert sichern, Variablennamen und Codebuch dokumentieren, Bereinigungsschritte im Skript (nicht händisch in Excel!), Versionierung, Backup. FAIR-Prinzipien, ggf. Datenveröffentlichung (anonymisiert).",
      concepts: ["Rekrutierung", "Pilotierung", "Codebuch", "Rohdatensicherung", "Skript statt Handarbeit", "FAIR"] },
    { title: "Datenanalyse",
      text: "Vorgehen nach Analyseplan: Deskriptive Statistik und Visualisierung, Voraussetzungsprüfung, konfirmatorische Hypothesentests, ggf. explorative Zusatzanalysen (als solche kennzeichnen). Effektgrößen und Konfidenzintervalle, ggf. Bayes-Faktoren oder Äquivalenztests bei Nullbefunden. Reproduzierbarkeit: R-Skript oder jamovi-Datei archivieren. Häufige Fehler: falscher Test für das Design, multiple Tests ohne Korrektur, Interpretation nicht-signifikanter Ergebnisse als Beleg für H₀, fehlende Prüfung von Ausreißern.",
      concepts: ["Analyseplan", "konfirmatorisch/explorativ", "Effektgröße", "Konfidenzintervall", "Äquivalenztest", "Reproduzierbarkeit"] },
    { title: "Aufbau und Schreiben der Arbeit",
      text: "Format eines empirischen Artikels (APA 7): **Titelblatt**, **Abstract** (Deutsch und/oder Englisch, ca. 150–250 Wörter), **Einleitung** (Problem, Theorie, Forschungsstand, Lücke, Hypothesen), **Methode** (Stichprobe, Material/Instrumente mit Gütekriterien, Durchführung, Design, Analyse), **Ergebnisse** (Deskriptiva, Hypothesentests, Tabellen/Abbildungen nach APA), **Diskussion** (Zusammenfassung, Einordnung in Literatur, Stärken und Limitationen, Implikationen, Ausblick), **Literaturverzeichnis**, **Anhang** (Materialien, Zusatzanalysen), Erklärungen (Eigenständigkeit, ggf. KI-Nutzung).\n\nSchreibprozess: Rohfassung zügig, dann überarbeiten (Struktur → Absätze → Sätze → Formales). Feedback von Peers einholen. Konsistente Terminologie, Zeitformen (Präteritum für eigene Ergebnisse), keine Übertreibungen.",
      concepts: ["Abstract", "Einleitung", "Methode", "Ergebnisse", "Diskussion", "Limitationen", "Anhang", "Eigenständigkeitserklärung", "Überarbeitung"] },
    { title: "Umgang mit Nullbefunden und Problemen",
      text: "Nicht-signifikante Ergebnisse sind **kein Scheitern**: Sie werden ebenso sorgfältig berichtet und diskutiert (Power, Messqualität, Theorie). Keine nachträglichen Hypothesenänderungen (HARKing) oder Analysevarianten bis zur Signifikanz (p-Hacking). Typische Probleme: zu wenige Teilnehmende (frühzeitig mit Betreuung sprechen), technische Fehler (Pilotierung!), Zeitdruck (Prioritäten, Umfang reduzieren). Schreibblockaden: feste Schreibzeiten, kleine Ziele, „Shitty first draft“.",
      concepts: ["Nullbefund", "HARKing vermeiden", "p-Hacking vermeiden", "Schreibroutine"] }
  ],
  materials: [
    { title: "OSF – Präregistrierung und Projektverwaltung", url: "https://osf.io/", type: "Plattform", lang: "EN" },
    { title: "AsPredicted – einfache Präregistrierung", url: "https://aspredicted.org/", type: "Plattform", lang: "EN" },
    { title: "Ethikkommission der Universität Wien", url: "https://ethikkommission.univie.ac.at/", type: "Offizielle Info", lang: "DE" },
    { title: "APA Style – Student Paper Sample", url: "https://apastyle.apa.org/style-grammar-guidelines/paper-format/sample-papers", type: "Richtlinie", lang: "EN" },
    { title: "APA – Journal Article Reporting Standards (JARS)", url: "https://apastyle.apa.org/jars", type: "Richtlinie", lang: "EN" },
    { title: "Learning Statistics with R", url: "https://learningstatisticswithr.com/", type: "Lehrbuch (OER)", lang: "EN" },
    { title: "StudienServiceCenter Psychologie – Bachelorarbeit & Abschluss", url: "https://ssc-psychologie.univie.ac.at/", type: "Offizielle Info", lang: "DE" },
    { title: "Lakens – Improving Your Statistical Inferences (Äquivalenztests, Power)", url: "https://lakens.github.io/statistical_inferences/", type: "Lehrbuch (OER)", lang: "EN" }
  ],
  lectures: [
    { title: "Bachelorarbeit Psychologie schreiben – Tipps (YouTube-Suche)", url: "https://www.youtube.com/results?search_query=Bachelorarbeit+Psychologie+schreiben+Tipps", provider: "YouTube", lang: "DE" },
    { title: "Reproducible analysis with R Markdown/Quarto (YouTube-Suche)", url: "https://www.youtube.com/results?search_query=Quarto+R+reproducible+report+tutorial", provider: "YouTube", lang: "EN" },
    { title: "Coursera – Improving your statistical inferences (Lakens)", url: "https://www.coursera.org/learn/statistical-inferences", provider: "Coursera", lang: "EN" }
  ],
  literature: [
    { authors: "American Psychological Association", year: 2020, title: "Publication Manual of the American Psychological Association", ed: "7th ed.", publisher: "APA", tag: "Nachschlagen", lang: "EN" },
    { authors: "Deutsche Gesellschaft für Psychologie", year: 2019, title: "Richtlinien zur Manuskriptgestaltung", ed: "5. Aufl.", publisher: "Hogrefe", tag: "Nachschlagen", lang: "DE" },
    { authors: "Döring, N.", year: 2023, title: "Forschungsmethoden und Evaluation in den Sozial- und Humanwissenschaften", ed: "6. Aufl.", publisher: "Springer", tag: "Standard", lang: "DE", ebook: true },
    { authors: "Field, A., Miles, J. & Field, Z.", year: 2012, title: "Discovering Statistics Using R", publisher: "SAGE", tag: "Standard", lang: "EN" },
    { authors: "Luhmann, M.", year: 2020, title: "R für Einsteiger", ed: "5. Aufl.", publisher: "Beltz", tag: "Einstieg", lang: "DE" },
    { authors: "Esselborn-Krumbiegel, H.", year: 2017, title: "Von der Idee zum Text: Eine Anleitung zum wissenschaftlichen Schreiben", ed: "5. Aufl.", publisher: "Schöningh (UTB)", tag: "Einstieg", lang: "DE" },
    { authors: "Bem, D. J.", year: 2004, title: "Writing the Empirical Journal Article (in: The Compleat Academic, APA)", publisher: "APA", tag: "Klassiker", lang: "EN", note: "Kurzer, viel zitierter Leitfaden – online frei auffindbar." }
  ],
  quiz: [
    { q: "In welchen Abschnitt gehören die Gütekriterien der verwendeten Fragebögen?", o: ["Einleitung", "Methode (Material/Instrumente)", "Ergebnisse", "Diskussion"], a: 1, e: "Mit Quellenangabe und ggf. Reliabilität in der eigenen Stichprobe." },
    { q: "Ihre Haupthypothese wird nicht bestätigt. Was ist korrekt?", o: ["Hypothese nachträglich ändern", "So lange Analysen variieren, bis etwas signifikant ist", "Ergebnis transparent berichten und mögliche Gründe (Power, Messung, Theorie) diskutieren", "Arbeit abbrechen"], a: 2, e: "Nullbefunde sind wissenschaftlich wertvoll." },
    { q: "Warum sollten Datenbereinigungsschritte in einem Skript erfolgen?", o: ["Weil es schneller tippt", "Für Nachvollziehbarkeit und Reproduzierbarkeit", "Weil Excel verboten ist", "Damit niemand die Daten sieht"], a: 1, e: "Jeder Schritt ist dokumentiert und wiederholbar." },
    { q: "Welche Reihenfolge des Schreibens wird häufig empfohlen?", o: ["Abstract zuerst", "Methode/Ergebnisse zuerst, Einleitung/Diskussion danach, Abstract zuletzt", "Diskussion zuerst", "Literaturverzeichnis zuerst"], a: 1, e: "Das Abstract fasst die fertige Arbeit zusammen." },
    { q: "Explorative Zusatzanalysen sollten …", o: ["als konfirmatorisch dargestellt werden", "klar als explorativ gekennzeichnet werden", "weggelassen werden", "nur im Anhang ohne Erwähnung stehen"], a: 1, e: "Trennung konfirmatorisch/explorativ ist Kern guter Praxis." },
    { q: "Was gehört NICHT in die Diskussion?", o: ["Einordnung in bisherige Literatur", "Limitationen", "Neue, bisher nicht berichtete Hauptergebnisse", "Implikationen und Ausblick"], a: 2, e: "Alle Ergebnisse gehören in den Ergebnisteil." }
  ],
  exam: [
    { q: "Erstellen Sie einen realistischen Zeitplan (15 Wochen) für eine empirische Bachelorarbeit mit Online-Fragebogenstudie und nennen Sie drei Risiken mit Gegenmaßnahmen.", p: 8,
      s: "- Zeitplan mit Phasen: Literatur/Fragestellung, Planung/Ethik/Präregistrierung, Programmierung & Pretest, Erhebung, Auswertung, Schreiben, Überarbeitung, Puffer (4 P.)\n- Risiken (je 4/3 P.): zu wenige Teilnehmende (früh rekrutieren, mehrere Kanäle), Ethikverzögerung (früh einreichen), technische Fehler (Pilotierung), Zeitdruck beim Schreiben (parallel schreiben), schlechte Datenqualität (Attention Checks)" },
    { q: "Schreiben Sie einen Ergebnisabsatz nach APA für folgenden Befund: Gruppe A (M = 24.1, SD = 5.2, n = 40) und Gruppe B (M = 21.3, SD = 5.6, n = 42) unterscheiden sich; t(80) = 2.34, p = .022, d = 0.52, 95 % KI der Differenz [0.42, 5.18].", p: 5,
      s: "- Beispiel: „Teilnehmende der Gruppe A berichteten höhere Werte (M = 24.1, SD = 5.2) als Teilnehmende der Gruppe B (M = 21.3, SD = 5.6), t(80) = 2.34, p = .022, d = 0.52, 95 % KI [0.42, 5.18].“ (3 P.)\n- Korrekte Formatierung (kursive Statistiken, keine führende Null bei p, Effektgröße, KI) (1 P.)\n- Keine Interpretation im Ergebnisteil (1 P.)" }
  ],
  glossary: [
    ["Präregistrierung", "Dokumentation von Hypothesen und Analyseplan vor der Datenerhebung."],
    ["Codebuch", "Dokumentation aller Variablen, Kodierungen und Bedeutungen eines Datensatzes."],
    ["JARS", "Journal Article Reporting Standards der APA."],
    ["Limitationen", "Einschränkungen der Aussagekraft einer Studie."],
    ["Eigenständigkeitserklärung", "Erklärung, die Arbeit selbständig und nur mit angegebenen Hilfsmitteln verfasst zu haben."]
  ]
});
