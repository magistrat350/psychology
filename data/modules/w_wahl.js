/* Wahlbereich – Erweiterungscurricula / Wahlmodule (30 ECTS) */
PP.addModule({
  id: "W1",
  group: "W",
  title: "Wahlbereich: Erweiterungscurricula, Psychologie International, Wahlmodule",
  short: "Wahlbereich & Erweiterungscurricula",
  ects: 30,
  semester: "3–6",
  choice:
    "Die 30 ECTS werden aus **Erweiterungscurricula (EC)** anderer Studienrichtungen der Universität Wien (meist 15 ECTS je EC) und/oder aus den **Wahlmodulen der Psychologie** absolviert. Seit der Curriculumsänderung 2024 gehören dazu u. a. **W1a „Grundlagen der Psychologischen Psychotherapie“** (siehe eigene Rubrik W1a) sowie **W1b/W1c „Psychologie International 1 und 2“** (Anrechnung von im Ausland absolvierten Psychologie-Leistungen, z. B. Erasmus). Genaue Kombinationsregeln und Ausschlüsse (z. B. keine ECs aus Psychologie für Psychologie-Studierende) im Curriculum prüfen.",
  lvs: [
    { type: "EC", title: "Erweiterungscurriculum/-curricula anderer Fächer (je i. d. R. 15 ECTS)", pi: false },
    { type: "W1a", title: "Grundlagen der Psychologischen Psychotherapie (Wahlmodul)", pi: false },
    { type: "W1b/W1c", title: "Psychologie International 1 und 2 (Auslandsleistungen)", pi: false }
  ],
  summary:
    "Der Wahlbereich erlaubt, das Psychologiestudium **interdisziplinär zu ergänzen** oder **international zu erweitern**. Eine kluge Wahl stärkt das eigene Profil für Master und Beruf: Wer in die Neurowissenschaften möchte, profitiert von Biologie, Informatik oder Statistik; wer in die Organisation möchte, von Wirtschaft oder Soziologie; wer in die Bildung möchte, von Bildungswissenschaft; wer in die Klinik möchte, vom Wahlmodul Psychotherapie-Grundlagen.\n\nDiese Rubrik gibt Entscheidungshilfen, Empfehlungen für passende Erweiterungscurricula nach Berufsziel und Hinweise zu Auslandsaufenthalten.",
  goals: [
    "Den Wahlbereich strategisch für das eigene Berufs- und Masterziel nutzen",
    "Passende Erweiterungscurricula auswählen und kombinieren",
    "Einen Auslandsaufenthalt (Erasmus+) planen und anrechnen lassen",
    "Interdisziplinäre Perspektiven in das psychologische Denken integrieren"
  ],
  exam_info: "Abhängig vom gewählten Erweiterungscurriculum bzw. Wahlmodul (Prüfungsformen des jeweiligen Fachs). Auslandsleistungen werden über Learning Agreement und Anerkennungsbescheid angerechnet.",
  tips: [
    "Erst Berufsziel skizzieren, dann ECs wählen – nicht nach „leichtester“ Option.",
    "Für Auslandssemester mindestens ein Jahr vorher planen (Bewerbungsfristen Erasmus+), Learning Agreement vor Abreise abstimmen.",
    "ECs mit Methodenbezug (Statistik, Informatik/Data Science) sind auf dem Arbeitsmarkt besonders wertvoll."
  ],
  prerequisites: ["Überblick über die eigenen Interessen und Berufsziele (siehe „Nach dem Bachelor“)"],
  competencies: [
    "Ich kenne die Regeln des Wahlbereichs (30 ECTS, Kombinationsmöglichkeiten, Wahlmodule W1a–W1c).",
    "Ich habe ein Berufs-/Masterziel und kann begründen, welche ECs dazu passen.",
    "Ich weiß, wie ich Erweiterungscurricula im Vorlesungsverzeichnis (u:find) finde und mich anmelde.",
    "Ich kenne Ablauf und Fristen für Erasmus+ und die Anerkennung von Auslandsleistungen.",
    "Ich kann Inhalte des gewählten Fachs mit psychologischen Fragestellungen verknüpfen."
  ],
  skills: ["Studienplanung", "Interdisziplinäres Arbeiten", "Interkulturelle Kompetenz (Ausland)"],
  topics: [
    { title: "Regeln und Möglichkeiten des Wahlbereichs",
      text: "Im Bachelor Psychologie (Version 2022) sind **30 ECTS** frei für **Erweiterungscurricula** anderer Studien (ECs sind kleine, in sich geschlossene Studienpakete, meist 15 ECTS) bzw. für **Wahlmodule der Psychologie**. Mit der 1. Änderung (in Kraft 1.10.2024) wurden Wahlmodule wie **W1a Grundlagen der Psychologischen Psychotherapie** und **W1b/W1c Psychologie International** eingeführt. ECs findet man im Vorlesungsverzeichnis unter „Erweiterungscurricula“; manche haben Zugangsbeschränkungen oder Platzlimits. Die Anrechnung erfolgt automatisch, wenn das EC korrekt belegt und abgeschlossen wurde – Details beim SSC.",
      concepts: ["30 ECTS", "Erweiterungscurriculum", "W1a", "W1b/W1c", "u:find", "Anrechnung"] },
    { title: "Empfehlungen nach Berufsziel",
      text: "- **Klinische Psychologie / Psychotherapie**: W1a Grundlagen der Psychologischen Psychotherapie; ECs aus Medizin-/Pflegenähe (sofern angeboten), Soziologie (Gesundheit, Ungleichheit), Philosophie (Ethik)\n- **Neuro- und Kognitionswissenschaft**: ECs aus Biologie, Molekularbiologie, Informatik, Cognitive Science, Statistik/Mathematik, Linguistik\n- **Arbeit, Organisation, Wirtschaft**: ECs aus Betriebswirtschaft, Volkswirtschaft, Soziologie, Kommunikationswissenschaft, Recht\n- **Bildung**: ECs aus Bildungswissenschaft, Sprachwissenschaft, Deutsch als Zweitsprache\n- **Forschung/Data Science**: Statistik, Informatik (Programmieren in Python/R), Wissenschaftsphilosophie\n- **Interkulturelles, Migration, Gender**: Kultur- und Sozialanthropologie, Gender Studies, Sprachen",
      concepts: ["Profilbildung", "Neuro/Kognition", "Klinik", "A&O/Wirtschaft", "Bildung", "Data Science"] },
    { title: "Psychologie International: Auslandssemester",
      text: "**Erasmus+** ermöglicht Studienaufenthalte an Partneruniversitäten in Europa (Stipendium, Studiengebührenbefreiung). Ablauf: Information (Internationale Beziehungen der Uni Wien, Fakultätskoordination) → Bewerbung (meist ca. ein Jahr vorher) → **Learning Agreement** (welche LVs werden wie angerechnet) → Aufenthalt → Transcript of Records → **Anerkennungsbescheid**. Außerhalb Europas: Non-EU Student Exchange Program, Summer Schools. Vorteile: Sprachkompetenz, internationales Profil, andere Forschungsschwerpunkte; die Wahlmodule „Psychologie International“ erleichtern die Anrechnung psychologischer Auslandsleistungen.",
      concepts: ["Erasmus+", "Learning Agreement", "Transcript of Records", "Anerkennungsbescheid", "Summer School"] },
    { title: "Interdisziplinäres Denken: Beispiele",
      text: "- **Philosophie**: Bewusstsein, Willensfreiheit, Ethik – Grundlagenfragen der Psychologie\n- **Biologie**: Evolution, Genetik, Physiologie – vertieft B2\n- **Informatik**: Programmieren (Experimente, Datenanalyse), Machine Learning (Vorhersagemodelle), Mensch-Computer-Interaktion\n- **Linguistik**: Spracherwerb, Psycholinguistik\n- **Soziologie**: soziale Ungleichheit, Organisation, Methoden der Sozialforschung\n- **Wirtschaft**: Verhaltensökonomie, Marketing, Personal\n- **Recht**: Rechtspsychologie, Berufsrecht, Datenschutz",
      concepts: ["Philosophie des Geistes", "Evolution", "Programmieren", "Psycholinguistik", "Sozialforschung", "Verhaltensökonomie", "Rechtspsychologie"] }
  ],
  materials: [
    { title: "u:find – Erweiterungscurricula im Vorlesungsverzeichnis", url: "https://ufind.univie.ac.at/", type: "Offizielle Info", lang: "DE" },
    { title: "Universität Wien – Studieren: Erweiterungscurricula (Informationen)", url: "https://studieren.univie.ac.at/", type: "Offizielle Info", lang: "DE" },
    { title: "Universität Wien – Internationales / Erasmus+ (Studierendenmobilität)", url: "https://international.univie.ac.at/", type: "Offizielle Info", lang: "DE/EN" },
    { title: "StudienServiceCenter Psychologie – Wahlbereich & Anerkennung", url: "https://ssc-psychologie.univie.ac.at/", type: "Offizielle Info", lang: "DE" },
    { title: "Mitteilungsblatt 2023/24 Nr. 84 – 1. Änderung des Curriculums (W1a–W1c)", url: "https://mtbl.univie.ac.at/storage/media/mtbl02/2023_2024/2023_2024_84.pdf", type: "Curriculum", lang: "DE" }
  ],
  lectures: [
    { title: "Harvard CS50 – Introduction to Computer Science (frei; ideal als Programmier-Einstieg)", url: "https://cs50.harvard.edu/x/", provider: "Harvard/edX", lang: "EN" },
    { title: "MIT 9.13 The Human Brain (für Neuro-Profil)", url: "https://ocw.mit.edu/courses/9-13-the-human-brain-spring-2019/", provider: "MIT OCW", lang: "EN" },
    { title: "Yale – Philosophy and the Science of Human Nature (Tamar Gendler)", url: "https://oyc.yale.edu/philosophy/phil-181", provider: "Yale Open Courses", lang: "EN" },
    { title: "Yale – Game Theory (Ben Polak; für Wirtschaftspsychologie)", url: "https://oyc.yale.edu/economics/econ-159", provider: "Yale Open Courses", lang: "EN" }
  ],
  literature: [
    { authors: "Gazzaniga, M. S.", year: 2012, title: "Die Ich-Illusion: Wie Bewusstsein und freier Wille entstehen", publisher: "Hanser", tag: "Einstieg", lang: "DE", note: "Brücke Psychologie–Philosophie–Neurowissenschaft." },
    { authors: "Kahneman, D.", year: 2012, title: "Schnelles Denken, langsames Denken", publisher: "Siedler", tag: "Einstieg", lang: "DE" },
    { authors: "Sapolsky, R. M.", year: 2017, title: "Gewalt und Mitgefühl (Behave)", publisher: "Hanser", tag: "Einstieg", lang: "DE" },
    { authors: "Pinker, S.", year: 2003, title: "Das unbeschriebene Blatt: Die moderne Leugnung der menschlichen Natur", publisher: "Berlin Verlag", tag: "Vertiefung", lang: "DE", note: "Kontrovers – kritisch lesen." }
  ],
  quiz: [
    { q: "Wie viele ECTS umfasst der Wahlbereich im BA Psychologie (Version 2022)?", o: ["10", "15", "30", "60"], a: 2, e: "Aus Erweiterungscurricula und/oder Wahlmodulen." },
    { q: "Welches Wahlmodul wurde mit der Curriculumsänderung 2024 eingeführt?", o: ["W1a Grundlagen der Psychologischen Psychotherapie", "Z1 Zoologie", "Pflichtpraktikum Klinik", "StEOP II"], a: 0, e: "Zusätzlich W1b/W1c Psychologie International." },
    { q: "Was regelt ein Learning Agreement?", o: ["Die Miete im Ausland", "Welche im Ausland absolvierten Lehrveranstaltungen wie angerechnet werden", "Die Prüfungstermine in Wien", "Das Stipendium"], a: 1, e: "Vor dem Aufenthalt abstimmen." },
    { q: "Für ein Profil in Richtung kognitive Neurowissenschaften sind besonders sinnvoll …", o: ["ECs aus Biologie, Informatik oder Statistik", "ECs aus Kunstgeschichte", "keine ECs", "nur Sprachkurse"], a: 0, e: "Methodische und biologische Vertiefung." }
  ],
  exam: [
    { q: "Entwickeln Sie für sich einen begründeten Plan für die 30 Wahl-ECTS mit Blick auf Ihr Berufsziel. Welche Kompetenzen erwerben Sie dadurch, die das Pflichtcurriculum nicht abdeckt?", p: 6,
      s: "- Berufsziel klar benannt (1 P.)\n- Konkrete ECs/Wahlmodule mit ECTS (2 P.)\n- Begründung über Kompetenzlücken und Synergien (2 P.)\n- Zeitliche Einplanung im Studienverlauf (1 P.)" }
  ],
  glossary: [
    ["Erweiterungscurriculum", "In sich geschlossenes Studienpaket eines anderen Fachs (meist 15 ECTS) zur Ergänzung des Hauptstudiums."],
    ["Learning Agreement", "Vereinbarung über Anrechnung von Lehrveranstaltungen eines Auslandsaufenthalts."],
    ["Erasmus+", "EU-Programm für Studierendenmobilität."]
  ]
});

PP.addModule({
  id: "W1a",
  group: "W",
  title: "Grundlagen der Psychologischen Psychotherapie (Wahlmodul)",
  short: "Grundlagen Psychotherapie (W1a)",
  ects: 0, /* Teil der 30 Wahl-ECTS (W1) – nicht doppelt zählen */
  semester: "4–6",
  choice: "Wahlmodul im Rahmen des Wahlbereichs (seit 1.10.2024). ECTS-Umfang, Lehrveranstaltungen und Zugangsbedingungen laut 1. Änderung des Curriculums und u:find prüfen – hier als Lernrubrik mit den zentralen Inhalten.",
  lvs: [{ type: "VO / SE", title: "Grundlagen der Psychologischen Psychotherapie (LVs lt. Curriculum/u:find)", pi: false }],
  summary:
    "Das Wahlmodul vermittelt **wissenschaftliche Grundlagen der Psychotherapie** aus psychologischer Perspektive: Geschichte und Systematik der Verfahren, Wirkfaktoren und Psychotherapieforschung, Störungs- und Veränderungsmodelle, therapeutische Beziehung, Ethik und Berufsrecht. Es knüpft an die Neuordnung der Psychotherapieausbildung in Österreich (**Psychotherapiegesetz 2024**) an, die eine akademische Ausbildung mit Bachelor- und Masterphase vorsieht.\n\n**Wichtig:** Ob und wie dieses Modul für den Zugang zu einem Master Psychotherapie bzw. zur weiteren Ausbildung angerechnet wird, hängt von den jeweils geltenden Übergangsbestimmungen und Zulassungsregeln ab – unbedingt aktuell beim SSC bzw. den anbietenden Universitäten prüfen.",
  goals: [
    "Die großen psychotherapeutischen Verfahrensgruppen und ihre Menschenbilder vergleichen",
    "Befunde der Psychotherapieforschung (Wirksamkeit, Wirkfaktoren, Prozess-Ergebnis-Forschung) kennen",
    "Grundprinzipien evidenzbasierter Interventionen verstehen",
    "Die Bedeutung der therapeutischen Beziehung erklären",
    "Ethische und rechtliche Rahmenbedingungen der Psychotherapie in Österreich kennen"
  ],
  exam_info: "Laut jeweiliger Lehrveranstaltung (Vorlesungsprüfung bzw. prüfungsimmanente Seminarleistungen).",
  tips: [
    "A1 (Geschichte der Psychotherapie) und F1 (Klinische Psychologie) wiederholen – das Modul baut darauf auf.",
    "Therapieverfahren in einer Vergleichsmatrix lernen: Menschenbild – Störungsmodell – Ziel – Techniken – Evidenz.",
    "Originalvideos von Therapiesitzungen (z. B. Rogers, Beck, Perls) vergleichend ansehen."
  ],
  prerequisites: ["A1 (Psychotherapieschulen)", "F1 (Klinische Psychologie)", "G1 (Gesprächsführung)"],
  competencies: [
    "Ich kann psychodynamische, verhaltenstherapeutische, humanistische und systemische Verfahren hinsichtlich Menschenbild, Störungsmodell und Techniken vergleichen.",
    "Ich kann Ergebnisse der Psychotherapie-Wirksamkeitsforschung (Effektstärken, Dodo-Bird-Debatte) darstellen.",
    "Ich kann allgemeine und spezifische Wirkfaktoren unterscheiden.",
    "Ich kann die Bedeutung von therapeutischer Allianz, Empathie und Feedback (Routine Outcome Monitoring) erklären.",
    "Ich kann Nebenwirkungen und Risiken von Psychotherapie benennen.",
    "Ich kann die Grundzüge des Psychotherapiegesetzes (1990/2024) und die Abgrenzung zur Klinischen Psychologie beschreiben.",
    "Ich kann ethische Grundsätze (Abstinenz, Verschwiegenheit, Aufklärung) anwenden."
  ],
  skills: ["Verfahrensvergleich", "Lesen von Psychotherapiestudien", "Ethische Fallreflexion"],
  topics: [
    { title: "Psychotherapie: Definition und Rahmen in Österreich",
      text: "Psychotherapie ist die **umfassende, bewusste und geplante Behandlung** von psychosozial oder psychosomatisch bedingten Verhaltensstörungen und Leidenszuständen mit wissenschaftlich-psychotherapeutischen Methoden, in einer Interaktion zwischen Behandelten und Psychotherapeut:innen (sinngemäß nach dem österreichischen Psychotherapiegesetz). Österreich war mit dem **Psychotherapiegesetz 1990** Vorreiter eines eigenständigen Psychotherapieberufs mit zahlreichen anerkannten **Methoden** (über 20), gegliedert in Clusterorientierungen: tiefenpsychologisch-psychodynamisch, humanistisch-existenziell, systemisch, verhaltenstherapeutisch.\n\nDas **Psychotherapiegesetz 2024** führt eine **akademische Ausbildung** ein (Studium + postgraduale fachspezifische Ausbildung) – mit Übergangsfristen. Abgrenzung: **Klinisch-psychologische Behandlung** (Psychologengesetz) und **ärztliche Psychotherapie/Psychiatrie**.",
      concepts: ["Definition Psychotherapie", "Psychotherapiegesetz 1990", "Psychotherapiegesetz 2024", "anerkannte Methoden", "Clusterorientierungen", "Abgrenzung Klinische Psychologie"] },
    { title: "Verfahrensvergleich",
      text: "- **Psychodynamisch/psychoanalytisch**: unbewusste Konflikte, Beziehungsmuster, Übertragung/Gegenübertragung, Abwehr; Deutung, Klärung; Langzeit- und Kurzzeitformen (z. B. Mentalisierungsbasierte Therapie, übertragungsfokussierte Psychotherapie)\n- **Verhaltenstherapie/KVT**: Lern- und kognitive Modelle, Verhaltensanalyse, Exposition, kognitive Umstrukturierung; dritte Welle (ACT, DBT, Schematherapie, achtsamkeitsbasierte Verfahren)\n- **Humanistisch-existenziell**: personzentriert (Rogers), Gestalttherapie, Existenzanalyse/Logotherapie, Psychodrama; Fokus auf Erleben, Wachstum, Sinn; emotionsfokussierte Therapie (Greenberg) als empirisch gut untersuchte Weiterentwicklung\n- **Systemisch**: Symptome im Kontext von Beziehungssystemen; zirkuläre Fragen, Reframing, Genogramm, lösungsorientierte Ansätze\n\nIntegrative Ansätze: **Allgemeine Psychotherapie** (Grawe), Common-Factors-Modelle, modulare Behandlungen.",
      concepts: ["psychodynamisch", "KVT", "dritte Welle", "personzentriert", "Gestalttherapie", "Existenzanalyse", "emotionsfokussiert", "systemisch", "Allgemeine Psychotherapie"] },
    { title: "Psychotherapieforschung",
      text: "**Ergebnisforschung**: Psychotherapie ist wirksam (mittlere Effektstärken gegenüber unbehandelten Kontrollen um d ≈ 0,8 in klassischen Metaanalysen; gegenüber aktiven Kontrollen kleiner). **Vergleichsforschung**: Dodo-Bird-Verdict vs. störungsspezifische Überlegenheit einzelner Verfahren (z. B. Exposition bei Angst, DBT bei Borderline-Suizidalität). Probleme: Allegiance-Effekte, Publikationsbias, Wartelistenkontrollen überschätzen Effekte. **Prozessforschung**: Was geschieht in Sitzungen? Rupture-and-Repair der Allianz, plötzliche Gewinne (Sudden Gains). **Routine Outcome Monitoring** und Feedback an Therapeut:innen verbessern Ergebnisse bei gefährdeten Verläufen (Lambert). **Therapeuteneffekte**: Unterschiede zwischen Therapeut:innen sind teils größer als zwischen Verfahren.",
      concepts: ["Ergebnisforschung", "Vergleichsforschung", "Allegiance-Effekt", "Prozessforschung", "Rupture & Repair", "Sudden Gains", "Routine Outcome Monitoring", "Therapeuteneffekte"] },
    { title: "Wirkfaktoren und therapeutische Beziehung",
      text: "**Allgemeine Wirkfaktoren**: therapeutische **Allianz** (Bordin: Konsens über Ziele und Aufgaben + emotionale Bindung), Empathie, positive Wertschätzung, Echtheit, Erwartungen/Hoffnung, Erklärungsmodell (Rationale), Ritual (Frank & Frank). **Grawe**: Ressourcenaktivierung, Problemaktualisierung, Problembewältigung, motivationale Klärung, Beziehung. **Kontextuelles Modell** (Wampold & Imel): Beziehung, Erwartungen und spezifische Ingredienzien wirken über drei Pfade. **Spezifische Faktoren**: verfahrensspezifische Techniken (z. B. Exposition). Debatte: Wie viel Varianz erklären allgemeine vs. spezifische Faktoren?",
      concepts: ["Allianz nach Bordin", "Empathie", "Erwartung", "Frank & Frank", "Grawe-Wirkfaktoren", "kontextuelles Modell", "spezifische Faktoren"] },
    { title: "Ethik, Risiken und Nebenwirkungen",
      text: "**Ethische Grundsätze**: Aufklärung über Methode, Dauer, Kosten, Alternativen und Risiken; Freiwilligkeit; **Verschwiegenheit**; **Abstinenzgebot** (keine privaten, sexuellen, finanziellen Beziehungen); Kompetenzgrenzen; Dokumentation; Fortbildung und Supervision; Berufskodex (Gesundheitsministerium/Psychotherapiebeirat). **Nebenwirkungen und Risiken**: Symptomverschlechterung (ca. 5–10 % der Patient:innen verschlechtern sich), Abhängigkeit von der Therapie, Belastung von Beziehungen, falsche Erinnerungen durch suggestive Techniken, Stigma. Erfassung unerwünschter Wirkungen (z. B. INEP-Fragebogen).",
      concepts: ["Aufklärungspflicht", "Abstinenzgebot", "Verschwiegenheit", "Berufskodex", "Nebenwirkungen", "Verschlechterung", "INEP"] }
  ],
  materials: [
    { title: "Österreichisches Gesundheitsministerium – Psychotherapie (Berufsrecht, Liste, Ausbildung)", url: "https://www.sozialministerium.gv.at/", type: "Offizielle Info", lang: "DE" },
    { title: "RIS – Psychotherapiegesetz (Suche)", url: "https://www.ris.bka.gv.at/", type: "Gesetz", lang: "DE" },
    { title: "Österreichischer Bundesverband für Psychotherapie (ÖBVP)", url: "https://www.psychotherapie.at/", type: "Berufsverband", lang: "DE" },
    { title: "Noba Project – Modul „Therapeutic Orientations“", url: "https://nobaproject.com/", type: "Lehrbuch (OER)", lang: "EN" },
    { title: "APA Division 12 – Research-Supported Psychological Treatments", url: "https://div12.org/treatments/", type: "Evidenzportal", lang: "EN" }
  ],
  lectures: [
    { title: "Three Approaches to Psychotherapy – Rogers, Perls, Ellis mit „Gloria“ (YouTube-Suche)", url: "https://www.youtube.com/results?search_query=Three+approaches+to+psychotherapy+Gloria", provider: "YouTube", lang: "EN" },
    { title: "Bruce Wampold – The Great Psychotherapy Debate (Vorträge, YouTube-Suche)", url: "https://www.youtube.com/results?search_query=Bruce+Wampold+psychotherapy+common+factors", provider: "YouTube", lang: "EN" },
    { title: "Psychotherapieverfahren im Vergleich (deutschsprachig, YouTube-Suche)", url: "https://www.youtube.com/results?search_query=Psychotherapieverfahren+Vergleich+Verhaltenstherapie+Psychoanalyse+systemisch", provider: "YouTube", lang: "DE" }
  ],
  literature: [
    { authors: "Kriz, J.", year: 2014, title: "Grundkonzepte der Psychotherapie", ed: "7. Aufl.", publisher: "Beltz", tag: "Standard", lang: "DE" },
    { authors: "Wampold, B. E. & Imel, Z. E.", year: 2015, title: "The Great Psychotherapy Debate", ed: "2nd ed.", publisher: "Routledge", tag: "Standard", lang: "EN" },
    { authors: "Grawe, K.", year: 2000, title: "Psychologische Therapie", ed: "2. Aufl.", publisher: "Hogrefe", tag: "Klassiker", lang: "DE" },
    { authors: "Lambert, M. J. (Ed.)", year: 2013, title: "Bergin and Garfield’s Handbook of Psychotherapy and Behavior Change", ed: "6th ed.", publisher: "Wiley", tag: "Nachschlagen", lang: "EN" },
    { authors: "Margraf, J. & Schneider, S. (Hrsg.)", year: 2018, title: "Lehrbuch der Verhaltenstherapie, Band 1", ed: "4. Aufl.", publisher: "Springer", tag: "Vertiefung", lang: "DE", ebook: true },
    { authors: "Rudolf, G.", year: 2014, title: "Psychodynamische Psychotherapie", publisher: "Schattauer", tag: "Vertiefung", lang: "DE" },
    { authors: "von Schlippe, A. & Schweitzer, J.", year: 2016, title: "Lehrbuch der systemischen Therapie und Beratung I", publisher: "Vandenhoeck & Ruprecht", tag: "Vertiefung", lang: "DE" }
  ],
  quiz: [
    { q: "Seit wann ist Psychotherapie in Österreich als eigenständiger Beruf gesetzlich geregelt?", o: ["1938", "1990", "2013", "2024"], a: 1, e: "Psychotherapiegesetz 1990; Neuordnung 2024." },
    { q: "Die therapeutische Allianz nach Bordin umfasst …", o: ["Übertragung und Gegenübertragung", "Einigkeit über Ziele und Aufgaben sowie emotionale Bindung", "nur Sympathie", "Diagnose und Prognose"], a: 1, e: "Goals, Tasks, Bond." },
    { q: "Was ist ein Allegiance-Effekt?", o: ["Treue der Patient:innen", "Verzerrung zugunsten des von den Forschenden bevorzugten Verfahrens", "Ein Wirkfaktor", "Eine Nebenwirkung"], a: 1, e: "Forschende finden tendenziell Vorteile ihres eigenen Verfahrens." },
    { q: "Routine Outcome Monitoring verbessert Therapieergebnisse vor allem …", o: ["bei allen gleich", "bei Patient:innen mit ungünstigem Verlauf (not-on-track)", "nur in der Psychoanalyse", "gar nicht"], a: 1, e: "Lambert: Feedback warnt vor Verschlechterung." },
    { q: "Welches Prinzip verbietet private oder sexuelle Beziehungen zu Patient:innen?", o: ["Verschwiegenheit", "Abstinenzgebot", "Aufklärungspflicht", "Dokumentationspflicht"], a: 1, e: "Zentrales berufsethisches Prinzip." },
    { q: "Welche Aussage zu Nebenwirkungen von Psychotherapie ist richtig?", o: ["Psychotherapie hat keine Nebenwirkungen", "Ein kleiner Teil der Patient:innen verschlechtert sich; Risiken sollten erfasst und aufgeklärt werden", "Nur Medikamente haben Nebenwirkungen", "Verschlechterung ist immer ein gutes Zeichen"], a: 1, e: "Etwa 5–10 % Verschlechterungen werden berichtet." }
  ],
  exam: [
    { q: "Vergleichen Sie zwei Psychotherapieverfahren Ihrer Wahl hinsichtlich Menschenbild, Störungsmodell, therapeutischer Beziehung, Techniken und Evidenzlage.", p: 10,
      s: "- Je Verfahren: Menschenbild (1), Störungsmodell (1), Beziehung (1), Techniken (1), Evidenz (1) – insgesamt 10 P." },
    { q: "Diskutieren Sie die Debatte „allgemeine vs. spezifische Wirkfaktoren“ und deren Bedeutung für Ausbildung und Praxis.", p: 8,
      s: "- Allgemeine Faktoren (Allianz, Empathie, Erwartung; kontextuelles Modell) mit Befunden (3 P.)\n- Spezifische Faktoren (störungsspezifische Techniken) mit Befunden (2 P.)\n- Implikationen: Beziehungskompetenz trainieren, evidenzbasierte Techniken gezielt einsetzen, Feedback/ROM, Therapeuteneffekte (3 P.)" }
  ],
  glossary: [
    ["Psychotherapiegesetz", "Österreichisches Gesetz zur Regelung des Psychotherapieberufs (1990; Neuordnung 2024)."],
    ["Therapeutische Allianz", "Arbeitsbündnis aus geteilten Zielen, Aufgaben und emotionaler Bindung."],
    ["Allegiance-Effekt", "Verzerrung von Studienergebnissen zugunsten des bevorzugten Verfahrens."],
    ["Routine Outcome Monitoring", "Regelmäßige Messung des Therapieverlaufs mit Rückmeldung."],
    ["Abstinenzgebot", "Verbot privater, sexueller oder finanzieller Beziehungen zu Patient:innen."],
    ["Kontextuelles Modell", "Psychotherapie wirkt über Beziehung, Erwartungen und spezifische Ingredienzien (Wampold & Imel)."]
  ]
});
