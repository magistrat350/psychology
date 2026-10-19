/* Podcast-Empfehlungen zu den Modulen (PP.podcasts).
 * Auswahl: real existierende, frei hörbare Podcasts zu Psychologie, deutsch- und englischsprachig – Fach- und
 * Wissenschaftspodcasts, Wissenschaftsformate des öffentlich-rechtlichen Rundfunks (Ö1, Deutschlandfunk Nova,
 * SWR, BR, BBC) sowie zwei Formate aus Hochschule und Wissenschaftspraxis (JKU Linz, Open Science Radio).
 * Prüfstand: 19.10.2026. Jeder Podcast wurde per Websuche geprüft (Existenz, Macher:innen, Inhalt, Abrufbarkeit,
 * Adresse). URLs stammen nur aus Suchtreffern; die Quelle steht als Kommentar beim Eintrag. Die Seiten von
 * Deutschlandfunk Nova, SWR und BR ließen sich nicht durchsuchen – dort ist die Seite bei Apple Podcasts
 * eingetragen. Die Erreichbarkeit der URLs wird automatisch geprüft (data/link-status.js).
 * Bewusst keine einzelnen Folgen: Die App erzeugt pro Modul einen Suchlink („Folgen zu … finden“) aus
 * Podcasttitel + q. `hint` beschreibt allgemein, welche Art von Folgen der Podcast zu dem Modul bietet.
 * Format: { id, title, by, lang: "DE" | "EN", url, about, modules: { <Modul-ID>: { hint, q } } } */
PP.podcasts = [
  // URL: Suchtreffer hiddenbrain.org (About-Seite, Folgenseiten unter www.hiddenbrain.org/podcast/…)
  { id: "hidden-brain", title: "Hidden Brain", by: "Shankar Vedantam (Hidden Brain Media)", lang: "EN",
    url: "https://www.hiddenbrain.org/",
    about: "Wöchentliche Folgen, die sozialwissenschaftliche Forschung über unbewusste Muster im Verhalten mit Geschichten und Interviews erklären. Gut als leicht zugänglicher Einstieg für alle Semester.",
    modules: {
      A2: { hint: "Folgen zu sozialem Einfluss, Gruppen und Vorurteilen", q: "social influence conformity groups prejudice" },
      B1: { hint: "Folgen zu Gedächtnis, Aufmerksamkeit, Entscheidungen und Emotionen", q: "memory attention decision making emotion" },
      C1: { hint: "Folgen zu Selbstbild, Beziehungen und Kooperation", q: "self-esteem relationships cooperation" },
      C5: { hint: "Folgen zu unbewussten Vorurteilen und Diskriminierung", q: "unconscious bias stereotypes discrimination" },
      F3: { hint: "Folgen zu Arbeit, Geld und Konsumentscheidungen", q: "work money spending behavioral economics" }
    } },

  // URL: Suchtreffer apa.org (Podcast-Seite der APA)
  { id: "speaking-of-psychology", title: "Speaking of Psychology", by: "American Psychological Association (APA), Moderation Kim Mills", lang: "EN",
    url: "https://www.apa.org/news/podcasts/speaking-of-psychology",
    about: "Interviewpodcast des US-Fachverbands: Forschende stellen aktuelle Befunde aus allen Teilgebieten vor, mit Transkripten. Breit einsetzbar, gut für einen Überblick über das Fach.",
    modules: {
      V0: { hint: "Überblick, womit sich Psychologie in Forschung und Praxis beschäftigt", q: "what psychologists study psychology careers" },
      C2: { hint: "Folgen zu Erziehung, Jugendalter und Altern", q: "parenting adolescence aging" },
      C5: { hint: "Folgen zu Gender, Rassismus und Diskriminierung", q: "gender racism discrimination" },
      F1: { hint: "Folgen zu Depression, Angst, Suizidprävention und Stress", q: "depression anxiety suicide prevention stress" },
      F2: { hint: "Folgen zu Lehren und Lernen in Schule und Hochschule", q: "teaching learning education" },
      W1a: { hint: "Folgen zu Psychotherapie und ihrer Wirksamkeit", q: "psychotherapy effectiveness" }
    } },

  // URL: Suchtreffer scottbarrykaufman.com/podcast.html (offizielle Podcastseite)
  { id: "psychology-podcast", title: "The Psychology Podcast", by: "Scott Barry Kaufman", lang: "EN",
    url: "https://scottbarrykaufman.com/podcast/",
    about: "Lange Gespräche mit Forschenden über Kreativität, Intelligenz, Wohlbefinden und Selbstverwirklichung. Lief 2014–2025; das Archiv mit 478 Folgen bleibt frei abrufbar.",
    modules: {
      A1: { hint: "Gespräche zur humanistischen Psychologie (Maslow, Selbstverwirklichung)", q: "humanistic psychology Maslow self-actualization" },
      B1: { hint: "Folgen zu Motivation und Kreativität", q: "motivation creativity" },
      C3: { hint: "Folgen zu Intelligenz, Persönlichkeit und Begabung", q: "intelligence personality giftedness" }
    } },

  // URL: Programmseite der BBC (b006qxx9), in Suchtreffern über Wikipedia und Podcastverzeichnisse belegt
  { id: "all-in-the-mind", title: "All in the Mind", by: "BBC Radio 4, Claudia Hammond", lang: "EN",
    url: "https://www.bbc.co.uk/programmes/b006qxx9",
    about: "Halbstündiges Radiomagazin der BBC über Psychologie, Psychiatrie und Neurowissenschaft, das Studien einordnet und Betroffene zu Wort kommen lässt. Gut für den Bezug von Forschung zur Versorgung.",
    modules: {
      B1: { hint: "Beiträge zu Wahrnehmung, Aufmerksamkeit und Gedächtnis", q: "perception attention memory" },
      B2: { hint: "Beiträge aus der Neurowissenschaft", q: "neuroscience brain" },
      C3: { hint: "Beiträge zu Persönlichkeit und ihrer Veränderung", q: "personality change" },
      F1: { hint: "Beiträge zu psychischen Störungen, Behandlung und Versorgung", q: "mental health psychosis depression treatment" }
    } },

  // URL: Suchtreffer disi.org/manyminds/ (Podcastseite des Diverse Intelligences Summer Institute)
  { id: "many-minds", title: "Many Minds", by: "Kensy Cooperrider (Diverse Intelligences Summer Institute)", lang: "EN",
    url: "https://disi.org/manyminds/",
    about: "Gespräche und Audio-Essays darüber, wie Menschen, Tiere und Maschinen denken, wahrnehmen, fühlen und lernen. Für alle, die über die Psychologie hinaus in die Kognitionswissenschaft schauen wollen.",
    modules: {
      A2: { hint: "Gespräche zu Kindheit und Entwicklung im Kulturvergleich", q: "childhood development culture" },
      B1: { hint: "Gespräche zu Sprache, Denken und Wahrnehmung", q: "language cognition perception" },
      B2: { hint: "Gespräche zu Evolution, Tierkognition und Gehirn", q: "evolution animal cognition brain" },
      W1: { hint: "Interdisziplinäre Gespräche (Kognitionswissenschaft, Anthropologie, Biologie, KI)", q: "cognitive science interdisciplinary" }
    } },

  // URL: Suchtreffer brainsciencepodcast.com (About-Seite)
  { id: "brain-science", title: "Brain Science with Ginger Campbell, MD", by: "Ginger Campbell, MD", lang: "EN",
    url: "https://brainsciencepodcast.com/",
    about: "Neurowissenschaft für Laien: Interviews mit Forschenden und Besprechungen von Fachbüchern über das Gehirn. Regulär beendet im Dezember 2023; Folgen ab 2016 bleiben frei abrufbar.",
    modules: {
      B2: { hint: "Gespräche zu Gehirn, Neuronen, Schlaf und Gedächtnis", q: "neurons brain sleep memory" },
      B3: { hint: "Vertiefung: neurowissenschaftliche Methoden und Bildgebung", q: "brain imaging neuroscience methods" }
    } },

  // URL: Suchtreffer fourbeers.com (Startseite und Folgenarchiv)
  { id: "two-psychologists-four-beers", title: "Two Psychologists Four Beers", by: "Yoel Inbar, Michael Inzlicht, Alexa Tullett", lang: "EN",
    url: "https://www.fourbeers.com/",
    about: "Drei Sozialpsycholog:innen diskutieren locker über Kontroversen in Psychologie und Wissenschaftsbetrieb, oft mit Gästen. Gut, um Debatten wie die Replikationskrise aus Sicht der Forschenden zu hören.",
    modules: {
      A1: { hint: "Diskussionen zur Replikationskrise und zum Selbstverständnis der Psychologie", q: "replication crisis philosophy of science" },
      C1: { hint: "Diskussionen über umstrittene sozialpsychologische Befunde", q: "social psychology ego depletion priming" },
      H1: { hint: "Studien kritisch lesen und einordnen", q: "evaluating research methodology" }
    } },

  // URL: Suchtreffer everythinghertz.com (Startseite und Folgenseiten)
  { id: "everything-hertz", title: "Everything Hertz", by: "Dan Quintana, James Heathers", lang: "EN",
    url: "https://everythinghertz.com/",
    about: "Podcast „von Forschenden für Forschende“ über Methodik, Open Science und den Alltag in der Wissenschaft. Besonders hilfreich ab dem Fachliteraturseminar und für die Bachelorarbeit.",
    modules: {
      B3: { hint: "Folgen zu Open Science und Präregistrierung", q: "open science preregistration" },
      B4: { hint: "Forschungsalltag und Forschungsintegrität aus Sicht von Forschenden", q: "research integrity research ethics" },
      H1: { hint: "Folgen zu Peer Review und dem kritischen Lesen von Studien", q: "peer review preprints" },
      H2: { hint: "Folgen zu Reproduzierbarkeit, Datenteilen und Publizieren", q: "reproducibility data sharing publishing" }
    } },

  // URL: Suchtreffer quantitudepod.org (Startseite, Episodes, About)
  { id: "quantitude", title: "Quantitude", by: "Greg Hancock, Patrick Curran", lang: "EN",
    url: "https://quantitude.org/",
    about: "Zwei Methodenprofessoren erklären Statistik und Messung mit viel Humor; eine Syllabus-Seite ordnet die Folgen nach Themen. Ideal begleitend zu den Methoden- und Statistikmodulen.",
    modules: {
      C4: { hint: "Folgen zu Regression, Mediation, Moderation und Längsschnittmodellen", q: "regression mediation moderation growth models" },
      D1: { hint: "Statistik-Grundlagen verständlich erklärt (Signifikanztest, Effektgröße, Teststärke)", q: "p-values effect size power" },
      D2: { hint: "Folgen zu Messung, Reliabilität, Faktorenanalyse und IRT", q: "measurement reliability factor analysis item response theory" },
      H2: { hint: "Folgen zu Fragen der eigenen Datenanalyse", q: "data analysis missing data" }
    } },

  // URL: Suchtreffer learningscientists.org/learning-scientists-podcast
  { id: "learning-scientists", title: "The Learning Scientists Podcast", by: "The Learning Scientists (u. a. Megan Sumeracki, Cindy Nebel, Althea Need Kaminske)", lang: "EN",
    url: "https://www.learningscientists.org/learning-scientists-podcast",
    about: "Kognitionspsycholog:innen erklären evidenzbasierte Lernstrategien für Lehrende, Studierende und Eltern. Direkt nutzbar für das eigene Lernen im Studium.",
    modules: {
      V0: { hint: "Evidenzbasierte Lernstrategien (Abrufübung, verteiltes Lernen)", q: "retrieval practice spacing study strategies" },
      B1: { hint: "Gedächtnisforschung, angewandt aufs Lernen", q: "memory learning research" },
      F2: { hint: "Folgen zu Unterricht, Motivation und selbstreguliertem Lernen", q: "teaching motivation self-regulated learning" }
    } },

  // URL: Suchtreffer schwab.com/learn/choiceology (Hauptseite des Podcasts)
  { id: "choiceology", title: "Choiceology with Katy Milkman", by: "Katy Milkman (Wharton School), produziert von Charles Schwab", lang: "EN",
    url: "https://www.schwab.com/learn/choiceology",
    about: "Jede Folge verbindet eine Geschichte mit einem Interview zu Urteilsfehlern und Verhaltensökonomie. Gut für Entscheidungsforschung und Wirtschaftspsychologie; Herausgeber ist ein Finanzunternehmen.",
    modules: {
      B1: { hint: "Folgen zu Urteilsfehlern, Heuristiken und Entscheidungen", q: "biases heuristics decision making" },
      F3: { hint: "Folgen zu Nudges, Geldentscheidungen und Teamarbeit", q: "nudges money decisions teams" }
    } },

  // URL: Suchtreffer ted.com/podcasts/worklife (offizielle TED-Seite)
  { id: "worklife", title: "WorkLife (TED)", by: "TED Audio Collective; Adam Grant (bis 2026), seitdem Molly Graham", lang: "EN",
    url: "https://www.ted.com/podcasts/worklife",
    about: "Der Organisationspsychologe Adam Grant besucht ungewöhnliche Arbeitsplätze und verbindet sie mit Forschung zu Motivation, Burnout und Teams; seit 2026 moderiert Molly Graham. Passend zur A&O-Psychologie.",
    modules: {
      F3: { hint: "Folgen zu Arbeitsmotivation, Burnout, Führung und Teams", q: "motivation burnout leadership teams" }
    } },

  // URL: Suchtreffer thetestingpsychologist.com/category/podcast/
  { id: "testing-psychologist", title: "The Testing Psychologist", by: "Jeremy Sharp", lang: "EN",
    url: "https://thetestingpsychologist.com/category/podcast/",
    about: "Podcast für Praktiker:innen der psychologischen und neuropsychologischen Diagnostik (über 600 Folgen), teils auch zu Praxisorganisation. Achtung: US-Kontext – Recht und Standards in Österreich sind andere.",
    modules: {
      E1: { hint: "Folgen zu Testverfahren und diagnostischem Vorgehen", q: "psychological assessment testing" },
      E2: { hint: "Folgen zu Befundbericht, Rückmeldung und Differenzialdiagnostik (z. B. ADHS, Autismus)", q: "report writing feedback ADHD autism assessment" }
    } },

  // URL: Suchtreffer shows.acast.com (Folgenseite beim Hoster Acast)
  { id: "talking-to-change", title: "Talking To Change – A Motivational Interviewing Podcast", by: "Glenn Hinds, Sebastian Kaplan", lang: "EN",
    url: "https://shows.acast.com/talking-to-change-a-motivational-interviewing-podcast/episodes",
    about: "Gespräche über Motivierende Gesprächsführung (MI): Grundhaltung, Techniken, Training und Anwendung in Gesundheit, Sozialarbeit und Bildung. Die ersten Folgen erklären die Grundlagen.",
    modules: {
      G1: { hint: "Folgen zu Motivational Interviewing: Haltung, Gesprächstechniken (OARS), Prozesse", q: "motivational interviewing OARS spirit" },
      F1: { hint: "MI bei Gesundheitsverhalten und Sucht", q: "health behavior change addiction" }
    } },

  // URL: Suchtreffer statsandstories.net (Startseite und Folgenliste)
  { id: "stats-and-stories", title: "Stats + Stories", by: "John Bailer, Richard Campbell, Rosemary Pennington (Miami University, American Statistical Association)", lang: "EN",
    url: "https://statsandstories.net/",
    about: "Statistiker und Medienwissenschaftler sprechen mit Gästen über die Geschichten hinter Zahlen und Daten. Gut, um statistisches Denken und das Vermitteln von Ergebnissen zu üben.",
    modules: {
      D1: { hint: "Wie Statistik in Forschung und Alltag eingesetzt und missverstanden wird", q: "statistics" },
      G2: { hint: "Daten und Statistik verständlich kommunizieren, Statistik im Journalismus", q: "data journalism communicating statistics" }
    } },

  // URL: Suchtreffer developingchild.harvard.edu/resources/podcasts/
  { id: "brain-architects", title: "The Brain Architects", by: "Center on the Developing Child, Harvard University", lang: "EN",
    url: "https://developingchild.harvard.edu/news-insights/podcasts/",
    about: "Podcast des Harvard-Zentrums zur frühen Kindheit: Wissenschaft zu Gehirnentwicklung, Stress und Lebensbedingungen von Kindern, danach Expert:innen zur Praxis. Für Entwicklungspsychologie mit Anwendungsbezug.",
    modules: {
      A2: { hint: "Folgen zu früher Kindheit, Gehirnentwicklung und Bezugspersonen", q: "early childhood brain development serve and return" },
      C2: { hint: "Folgen zu toxischem Stress, Resilienz und Familie", q: "toxic stress resilience families" }
    } },

  // URL: Suchtreffer podcasts.apple.com (keine eigene Website gefunden)
  { id: "psychologie-to-go", title: "Psychologie to go!", by: "Franca Cerutti (Psychotherapeutin), mit Christian Weiss (Psychiater)", lang: "DE",
    url: "https://podcasts.apple.com/de/podcast/psychologie-to-go/id1332049198",
    about: "Wöchentlicher deutschsprachiger Podcast aus der therapeutischen Praxis zu Störungsbildern, Beziehungen und Krisen. Praxisnah und gut verständlich; kein Ersatz für Fachliteratur.",
    modules: {
      F1: { hint: "Folgen zu Angst, Depression, Sucht und weiteren Störungsbildern", q: "Angststörung Depression Sucht" },
      W1a: { hint: "Einblicke in den psychotherapeutischen Alltag", q: "Psychotherapie Therapie" }
    } },

  // URL: Suchtreffer podcasts.apple.com (br.de war für die Suche nicht zugänglich)
  { id: "die-loesung", title: "Die Lösung – der Psychologie-Podcast", by: "Bayerischer Rundfunk (PULS); Verena Fiebiger, Sophia Sailer, mit Psychotherapeut:innen", lang: "DE",
    url: "https://podcasts.apple.com/de/podcast/die-l%C3%B6sung-der-psychologie-podcast/id1463142541",
    about: "Psychologie-Podcast des BR (seit 2019): Moderatorinnen besprechen mit Psychotherapeut:innen Alltagsthemen wie Stress, Selbstwert und psychische Erkrankungen. Leicht zugänglich, gut zum Einstieg.",
    modules: {
      C1: { hint: "Folgen zu Selbstwert, Beziehungen und Entscheidungen", q: "Selbstwert Beziehung Entscheiden" },
      F1: { hint: "Folgen zu Depression, Angst und Stress", q: "Depression Angst Stress" },
      W1a: { hint: "Folgen rund um Psychotherapie (Beginn, Ablauf, Abbruch)", q: "Psychotherapie Therapie" }
    } },

  // URL: Suchtreffer podcasts.apple.com (deutschlandfunknova.de war für die Suche nicht zugänglich)
  { id: "hoersaal", title: "Hörsaal – Deutschlandfunk Nova", by: "Deutschlandfunk Nova (u. a. Katja Weber, Nina Bust-Bartels)", lang: "DE",
    url: "https://podcasts.apple.com/de/podcast/h%C3%B6rsaal-deutschlandfunk-nova/id828868503",
    about: "Aufgezeichnete Vorträge und Vorlesungen von Hochschulen, mit kurzer Einordnung; darunter regelmäßig Vorträge von Psycholog:innen. Gut, um Forschung aus vielen Fächern im Vorlesungsformat zu hören.",
    modules: {
      C3: { hint: "Vorträge zu Persönlichkeit und Persönlichkeitsentwicklung", q: "Psychologie Persönlichkeit" },
      G2: { hint: "Wissenschaftliche Vorträge für ein breites Publikum – Anschauung fürs eigene Präsentieren", q: "Psychologin Vortrag" },
      W1: { hint: "Vorlesungen aus vielen Fächern – Anregungen für den Wahlbereich", q: "Ringvorlesung" }
    } },

  // URL: Suchtreffer podcasts.apple.com (swr.de war für die Suche nicht zugänglich)
  { id: "das-wissen", title: "Das Wissen (SWR)", by: "SWR Kultur (früher „SWR2 Wissen“)", lang: "DE",
    url: "https://podcasts.apple.com/de/podcast/das-wissen-swr/id104913043",
    about: "Tägliche Wissenschaftsfeatures des SWR zu Gesundheit, Wissenschaft und Gesellschaft, regelmäßig auch zu Psychologie; Manuskripte gibt es beim SWR. Gut als gründlich recherchierte Ergänzung.",
    modules: {
      B1: { hint: "Beiträge zu Aufmerksamkeit, Gefühlen und Gedächtnis", q: "Aufmerksamkeit Gefühle Gedächtnis" },
      C2: { hint: "Beiträge zu Altern, Sterben und Trauer", q: "Altern Trauer Sterben" },
      F1: { hint: "Beiträge zu psychischer Gesundheit und Behandlung", q: "psychische Gesundheit Depression Psychotherapie" }
    } },

  // URL: Suchtreffer podcasts.apple.com (br.de war für die Suche nicht zugänglich)
  { id: "radiowissen", title: "radioWissen (Bayern 2)", by: "Bayerischer Rundfunk, Bayern 2", lang: "DE",
    url: "https://podcasts.apple.com/de/podcast/radiowissen/id257719552",
    about: "Tägliche Wissenssendung von Bayern 2 mit rund 2.000 Folgen, darunter Beiträge aus Psychologie und Philosophie. Gut für Grundbegriffe und Geschichte der Psychologie in Hörfeature-Form.",
    modules: {
      A1: { hint: "Sendungen zu Freud, Psychoanalyse und Geschichte der Psychologie", q: "Freud Psychoanalyse Psychologie Geschichte" },
      B1: { hint: "Sendungen zu Gedächtnis und Gefühlen", q: "Gedächtnis Gefühle" }
    } },

  // URL: Suchtreffer oe1.orf.at/collection/581929 (Sendereihenseite Radiokolleg)
  { id: "oe1-radiokolleg", title: "Ö1 Radiokolleg", by: "ORF Ö1", lang: "DE",
    url: "https://oe1.orf.at/collection/581929",
    about: "Mehrteilige Wissenssendungsreihen von Ö1 zu allen Fachgebieten, regelmäßig zu Psychologie, Psychotherapie und Psychoanalyse – mit Österreich-Bezug. Auch als Podcast; ältere Reihen teils nur noch als Sendungsseite.",
    modules: {
      A1: { hint: "Reihen zur Psychoanalyse und ihrer Wiener Geschichte", q: "Psychoanalyse Wien" },
      F1: { hint: "Reihen zu Stress, Gefühlen und psychischer Gesundheit", q: "Stress psychische Gesundheit" },
      W1a: { hint: "Reihen zu Psychotherapie-Richtungen und ihren Menschenbildern", q: "Psychotherapie" }
    } },

  // URL: Suchtreffer podcasts.apple.com (eigene Website psy-cast.de nur im Beschreibungstext genannt)
  { id: "raetsel-des-unbewussten", title: "Rätsel des Unbewussten – Podcast zu Psychoanalyse und Psychotherapie", by: "Cécile Loetz, Jakob Müller (Psychotherapeut:innen und Forschende)", lang: "DE",
    url: "https://podcasts.apple.com/de/podcast/r%C3%A4tsel-des-unbewu%C3%9Ften-psychoanalyse-psychotherapie/id1434733064",
    about: "Seit 2018: zwei promovierte Psychotherapeut:innen erklären Psychoanalyse und Tiefenpsychologie und sprechen über Themen aus der Praxis. Gut, um psychodynamisches Denken neben dem verhaltenstherapeutischen Lehrbuch kennenzulernen.",
    modules: {
      A1: { hint: "Folgen zu Grundbegriffen der Psychoanalyse (Unbewusstes, Abwehr, Traum)", q: "Unbewusstes Abwehrmechanismen Traum" },
      F1: { hint: "Folgen zu Trauma, Borderline und Angsterkrankungen", q: "Trauma Borderline Angst" },
      W1a: { hint: "Folgen zu psychodynamischer Therapie und psychoanalytischer Forschung", q: "Psychotherapie psychoanalytische Forschung" }
    } },

  // URL: Suchtreffer jku.at (Podcastseite des Instituts für Psychologie)
  { id: "jku-psychologinnen-in-die-praxis", title: "PsychologInnen in die Praxis (JKU Linz)", by: "Studierende der LV „Wissenschaft-Praxis-Transfer“ (Bernad Batinic), Institut für Psychologie, Johannes Kepler Universität Linz", lang: "DE",
    url: "https://www.jku.at/institut-fuer-psychologie/studium/service/aom-transfer/podcast/",
    about: "Studierende interviewen Psycholog:innen aus verschiedenen Berufsfeldern über ihren Arbeitsalltag und Werdegang; österreichischer Kontext. Gut zur Orientierung vor Praktikum und Berufswahl.",
    modules: {
      V0: { hint: "Was Psycholog:innen beruflich machen – Einblick in Berufsfelder", q: "Berufsfelder Psychologie" },
      G2: { hint: "Interviews mit Praktiker:innen – Orientierung für die Praktikumswahl", q: "Praxis Interview" },
      W1: { hint: "Berufsziele und Karrierewege nach dem Studium", q: "Karriere Berufsziel" }
    } },

  // URL: Suchtreffer openscienceradio.org/archiv/ (Folgenarchiv)
  { id: "open-science-radio", title: "Open Science Radio", by: "Matthias Fromm, Konrad Förstner", lang: "DE",
    url: "https://openscienceradio.org/archiv/",
    about: "Unregelmäßiger Podcast zu Open Access, Open Data und offener Wissenschaft, Folgen auf Deutsch und Englisch (jüngste gefundene Folge: Jänner 2024). Gut als Hintergrund zu guter wissenschaftlicher Praxis.",
    modules: {
      B3: { hint: "Folgen zu Open Science, offenen Daten und Präregistrierung", q: "Open Science Open Data" },
      H2: { hint: "Folgen zu Open Access, Forschungsdaten und guter wissenschaftlicher Praxis", q: "Open Access Forschungsdaten" }
    } }
];
