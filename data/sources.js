/* Quellen zu den Lernthemen: wo man den Inhalt eines Themas nachlesen und prüfen kann.
 * PP.topicSources[<Modul>][<Thementitel>] = [ { lit | oer | doi | mat … } ] – Format siehe js/sources.js.
 * Buchangaben nennen bewusst keine Kapitel- oder Seitenzahlen (Auflagen unterscheiden sich); die genaue Stelle
 * wird bei der fachlichen Prüfung im Prüfvermerk festgehalten (data/review.js). */
PP.topicSources = {
  "V0": {
    "Formale Voraussetzungen und Ablauf": [
      { "mat": "StudienServiceCenter Psychologie – Infos zu Studium & Aufnahmeverfahren" },
      { "mat": "Universität Wien – Studieren (Zulassung, Fristen, Aufnahmeverfahren)" }
    ],
    "Was ist Psychologie – und was nicht?": [
      { "lit": "Myers 2023", "where": "Abschnitt zur Definition der Psychologie als empirische Wissenschaft und zur Abgrenzung ihrer Teilgebiete, u. a. Klinische Psychologie gegenüber Psychiatrie" },
      { "oer": "psych", "sec": "1.1" }
    ],
    "Teilgebiete der Psychologie im Überblick": [
      { "lit": "Myers 2023", "where": "Abschnitt zu den Teilgebieten der Psychologie (Grundlagenforschung und angewandte Bereiche)" },
      { "lit": "Gerrig 2018", "where": "Abschnitt zu Teildisziplinen und Arbeitsfeldern der Psychologie" },
      { "oer": "psych", "sec": "1.3" }
    ],
    "Wissenschaftliche Texte auf Englisch lesen": [
      { "lit": "Myers 2021", "where": "Lerntipps zur Lesestrategie SQ3R (Survey, Question, Read, Retrieve, Review) und Abschnitt zu Korrelation und Kausalität" },
      { "oer": "psych", "sec": "2.3" }
    ],
    "Mathematische Grundlagen für die Statistik": [
      { "lit": "Myers 2023", "where": "Abschnitt zum statistischen Denken: Lagemaße (Mittelwert, Median, Modus) und Streuung" },
      { "oer": "stats", "ch": 2 },
      { "oer": "stats", "ch": 3 }
    ],
    "Logisches und kritisches Denken": [
      { "lit": "Myers 2023", "where": "Abschnitt zum kritischen Denken in der Psychologie: Rückschaufehler, Selbstüberschätzung, Korrelation vs. Kausalität" },
      { "lit": "Kahneman 2012", "where": "Abschnitte zu Urteilsheuristiken und Denkfehlern: Bestätigungstendenz, Vernachlässigung von Basisraten, Rückschaufehler" },
      { "oer": "psych", "sec": "2.3" }
    ],
    "Studienorganisation an der Uni Wien": [
      { "mat": "Universität Wien – Studieren (Zulassung, Fristen, Aufnahmeverfahren)" },
      { "mat": "StudienServiceCenter Psychologie – Infos zu Studium & Aufnahmeverfahren" }
    ],
    "Lernen lernen: evidenzbasierte Lernstrategien": [
      { "lit": "Myers 2023", "where": "Abschnitt zu Gedächtnisstrategien: Testing-Effekt (Abrufübung) und Spacing-Effekt (verteiltes Lernen)" },
      { "doi": "10.1177/1529100612453266" }
    ]
  },
  "A1": {
    "Alltagspsychologie vs. wissenschaftliche Psychologie": [
      { "lit": "Hussy 2013", "where": "Abschnitt zu Alltagspsychologie und wissenschaftlicher Psychologie sowie zu Merkmalen wissenschaftlichen Vorgehens" },
      { "oer": "psych", "sec": "2.1" },
      { "mat": "Research Methods in Psychology (BCcampus) – Kap. 1–4" }
    ],
    "Erkenntnistheoretische Grundpositionen": [
      { "lit": "Hergenhahn 2014", "where": "Abschnitte zu Rationalismus (Descartes, Leibniz, Kant) und Empirismus (Locke, Hume) sowie zum logischen Positivismus" },
      { "lit": "Chalmers 2007", "where": "Abschnitte zum Induktivismus und zum Induktionsproblem (Hume)" },
      { "mat": "Stanford Encyclopedia of Philosophy – Vienna Circle" }
    ],
    "Kritischer Rationalismus (Popper) und Falsifikation": [
      { "lit": "Popper 1934", "where": "Falsifizierbarkeit als Abgrenzungskriterium, Basissätze, empirischer Gehalt und Bewährung von Theorien" },
      { "lit": "Chalmers 2007", "where": "Abschnitte zum Falsifikationismus Poppers und seinen Grenzen" },
      { "mat": "Stanford Encyclopedia of Philosophy – Karl Popper" }
    ],
    "Kuhn, Lakatos & Feyerabend: Wissenschaft als sozialer Prozess": [
      { "lit": "Chalmers 2007", "where": "Abschnitte zu Kuhns Paradigmen und wissenschaftlichen Revolutionen, Lakatos’ Forschungsprogrammen und Feyerabends methodologischem Anarchismus" },
      { "lit": "Kuhn 1962", "where": "Normalwissenschaft, Anomalien, Krise, Paradigmenwechsel und Inkommensurabilität" },
      { "mat": "Stanford Encyclopedia of Philosophy – Thomas Kuhn" }
    ],
    "Theorien, Hypothesen und der Forschungsprozess": [
      { "lit": "Döring 2023", "where": "Abschnitte zu wissenschaftlichen Theorien, Hypothesenarten und zum Ablauf des Forschungsprozesses" },
      { "lit": "Hussy 2013", "where": "Abschnitte zu Hypothesenarten, Operationalisierung und statistischen Hypothesen (H₀/H₁)" },
      { "oer": "psych", "sec": "2.1" }
    ],
    "Methodenüberblick: Experiment, Quasi-Experiment, Korrelation": [
      { "lit": "Hussy 2013", "where": "Abschnitte zu experimentellen und quasi-experimentellen Designs, Techniken der Störvariablenkontrolle sowie interner und externer Validität" },
      { "lit": "Döring 2023", "where": "Abschnitte zu Untersuchungsdesigns: Experiment, Quasi-Experiment und nicht-experimentelle Studien" },
      { "oer": "psych", "sec": "2.3" }
    ],
    "Weitere Zugänge: Beobachtung, Befragung, Einzelfall, qualitative Forschung": [
      { "lit": "Döring 2023", "where": "Abschnitte zu Datenerhebungsmethoden (Beobachtung, Befragung, Tests, physiologische Messungen), qualitativer Forschung und Mixed Methods" },
      { "lit": "Hussy 2013", "where": "Abschnitte zu qualitativen Methoden (qualitative Inhaltsanalyse, Grounded Theory) und Mixed Methods" },
      { "oer": "psych", "sec": "2.2" }
    ],
    "Gütekriterien und Replikationskrise": [
      { "lit": "Hussy 2013", "where": "Abschnitt zu den Gütekriterien Objektivität, Reliabilität und Validität" },
      { "mat": "Coursera – Improving your statistical inferences (Daniël Lakens) – Woche zu Replikation/Open Science" },
      { "doi": "10.1126/science.aac4716" }
    ],
    "Vorgeschichte: Philosophie, Physiologie, Psychophysik": [
      { "lit": "Hergenhahn 2014", "where": "Abschnitte zu den philosophischen Wurzeln (Aristoteles, Descartes, britischer Empirismus/Assoziationismus) und zu den physiologischen und psychophysischen Anfängen (Helmholtz, Weber, Fechner) sowie zu Darwin und Galton" },
      { "lit": "Lück 2014", "where": "Abschnitte zur philosophischen und naturwissenschaftlichen Vorgeschichte der Psychologie und zu Fechners Psychophysik" },
      { "mat": "Noba Project – „History of Psychology“ (Module suchen)" }
    ],
    "Wundt, Strukturalismus und Funktionalismus": [
      { "lit": "Lück 2014", "where": "Abschnitte zu Wundt und dem Leipziger Institut, zur Introspektion und Völkerpsychologie sowie zu Strukturalismus und Funktionalismus" },
      { "lit": "Hergenhahn 2014", "where": "Abschnitte zu Wundt, Titchener, Ebbinghaus und William James" },
      { "oer": "psych", "sec": "1.2" }
    ],
    "Psychoanalyse – und die erste Wiener Schule": [
      { "lit": "Kriz 2014", "where": "Abschnitt zur Psychoanalyse: Unbewusstes, Struktur- und topisches Modell, Abwehrmechanismen, psychosexuelle Entwicklung, Übertragung sowie Weiterentwicklungen" },
      { "lit": "Hergenhahn 2014", "where": "Abschnitt zu Freud und der Psychoanalyse" },
      { "oer": "psych", "sec": "11.2" }
    ],
    "Behaviorismus": [
      { "lit": "Hergenhahn 2014", "where": "Abschnitte zu Pawlow, Thorndike, Watsons Behaviorismus, Skinner und den Neobehavioristen (Tolman, Hull)" },
      { "oer": "psych", "sec": "1.2" },
      { "doi": "10.1037/h0069608" }
    ],
    "Gestaltpsychologie und Kognitive Wende": [
      { "lit": "Hergenhahn 2014", "where": "Abschnitte zur Gestaltpsychologie (Wertheimer, Köhler, Koffka, Lewin) und zur Entstehung der Kognitiven Psychologie (Informationsverarbeitung, Miller, Chomsky, Neisser)" },
      { "oer": "psych", "sec": "1.2" },
      { "doi": "10.1037/h0043158" }
    ],
    "Humanistische Psychologie": [
      { "lit": "Hergenhahn 2014", "where": "Abschnitt zur humanistischen Psychologie als „dritte Kraft“ (Maslow, Rogers)" },
      { "lit": "Kriz 2014", "where": "Abschnitte zu humanistischen Verfahren: personzentrierte Psychotherapie mit den Basisvariablen, Gestalttherapie" },
      { "oer": "psych", "sec": "11.5" }
    ],
    "Psychologie in Wien: Bühler, Marienthal, Vertreibung": [
      { "lit": "Lück 2014", "where": "Abschnitte zur Wiener Schule um Karl und Charlotte Bühler und zur Vertreibung von Psychologinnen und Psychologen nach 1933/1938" },
      { "lit": "Jahoda 1933", "where": "Die Marienthal-Studie selbst: Methoden und Befund der „müden Gemeinschaft“" },
      { "mat": "Dorsch Lexikon der Psychologie – Einträge zu Schulen und Personen" }
    ],
    "Geschichte und Systematik der Psychotherapie": [
      { "lit": "Kriz 2014", "where": "Überblick über die psychotherapeutischen Grundorientierungen: psychodynamische, verhaltenstherapeutische, humanistische und systemische Verfahren" },
      { "oer": "psych", "sec": "16.2" }
    ],
    "Wirksamkeit und Wirkfaktoren der Psychotherapie": [
      { "lit": "Wampold 2015", "where": "Geschichte der Wirksamkeitsforschung (Eysenck, Smith & Glass), Dodo-Bird-Verdict und kontextuelles Modell mit allgemeinen Wirkfaktoren" },
      { "doi": "10.1037/0003-066X.32.9.752" },
      { "doi": "10.1002/wps.20238" }
    ],
    "Ethik in Forschung und Praxis": [
      { "lit": "Döring 2023", "where": "Abschnitt zur Forschungsethik: informierte Einwilligung, Freiwilligkeit, Täuschung und Aufklärung, Datenschutz, Ethikkommissionen" },
      { "oer": "psych", "sec": "2.4" },
      { "mat": "APA Ethical Principles of Psychologists and Code of Conduct" }
    ]
  },
  "A2": {
    "Grundfragen der Entwicklungspsychologie": [
      { "lit": "Schneider 2018", "where": "Abschnitte zu Grundfragen und Grundbegriffen der Entwicklungspsychologie und zur Lebensspannenpsychologie nach Baltes" },
      { "oer": "psych", "sec": "9.1" },
      { "doi": "10.1037/0012-1649.23.5.611" }
    ],
    "Methoden der Entwicklungsforschung": [
      { "lit": "Siegler 2021", "where": "Abschnitte zu Forschungsdesigns (Querschnitt, Längsschnitt, mikrogenetische Methode) und zu Methoden der Säuglingsforschung (Habituation, Präferenz, Erwartungsverletzung)" },
      { "lit": "Schneider 2018", "where": "Abschnitt zu entwicklungspsychologischen Versuchsplänen: Quer- und Längsschnitt, Kohorten-Sequenz-Designs" },
      { "oer": "psych", "sec": "2.2" }
    ],
    "Pränatale Entwicklung und Neugeborene": [
      { "lit": "Siegler 2021", "where": "Abschnitte zur pränatalen Entwicklung (Phasen, Teratogene) und zur Neugeborenenperiode (Reflexe, Wahrnehmung)" },
      { "lit": "Berk 2020", "where": "Abschnitte zur pränatalen Entwicklung und zu Fähigkeiten des Neugeborenen" },
      { "oer": "psych", "sec": "9.3" }
    ],
    "Kognitive Entwicklung nach Piaget": [
      { "lit": "Siegler 2021", "where": "Abschnitt zu Piagets Theorie: Assimilation, Akkommodation, Äquilibration und die vier Stadien" },
      { "oer": "psych", "sec": "9.2" },
      { "mat": "Noba Project – Module „Attachment Through the Life Course“, „Cognitive Development in Childhood“, „Conformity and Obedience“ (Suche)" }
    ],
    "Soziokulturelle Theorie (Wygotski) und Informationsverarbeitung": [
      { "lit": "Siegler 2021", "where": "Abschnitte zu soziokulturellen Theorien (Wygotski, Zone der nächsten Entwicklung), Informationsverarbeitungs- und Kernwissenstheorien" },
      { "lit": "Berk 2020", "where": "Abschnitte zu Wygotskis Theorie (Zone der nächsten Entwicklung, Scaffolding, private Sprache) und zur Informationsverarbeitung (exekutive Funktionen)" },
      { "mat": "Noba Project – Module „Attachment Through the Life Course“, „Cognitive Development in Childhood“, „Conformity and Obedience“ (Suche)" }
    ],
    "Bindung": [
      { "lit": "Siegler 2021", "where": "Abschnitte zur Bindungstheorie, zur Fremden Situation und den Bindungstypen sowie zur Feinfühligkeit" },
      { "lit": "Bowlby 1969", "where": "Bindung als Verhaltenssystem, ethologische Grundlagen (Prägung, Harlows Studien) und innere Arbeitsmodelle" },
      { "oer": "psych", "sec": "9.3" }
    ],
    "Theory of Mind, Sprache und Emotion": [
      { "lit": "Siegler 2021", "where": "Abschnitte zu Theory of Mind (False-Belief-Aufgaben), Sprachentwicklung und emotionaler Entwicklung" },
      { "oer": "psych", "sec": "7.2" },
      { "doi": "10.1016/0010-0277(83)90004-5" }
    ],
    "Psychosoziale Entwicklung (Erikson) und Jugendalter": [
      { "lit": "Berk 2020", "where": "Abschnitte zu Eriksons psychosozialen Stadien über die Lebensspanne, Marcias Identitätsstatus und zur Entwicklung im Jugendalter" },
      { "oer": "psych", "sec": "9.2" },
      { "doi": "10.1037/h0023281" }
    ],
    "Gegenstand und Methoden der Sozialpsychologie": [
      { "lit": "Aronson 2014", "where": "Einführung in die Sozialpsychologie (Definition, Macht der Situation, Konstruktion der Realität) und Abschnitt zu ihren Forschungsmethoden" },
      { "lit": "Jonas 2014", "where": "Abschnitte zur Geschichte und zu den Forschungsmethoden der Sozialpsychologie" },
      { "oer": "psych", "sec": "12.1" }
    ],
    "Soziale Wahrnehmung und Attribution": [
      { "lit": "Aronson 2014", "where": "Abschnitte zur sozialen Wahrnehmung und Attribution: Kovariationsmodell, fundamentaler Attributionsfehler, Akteur-Beobachter-Unterschied, selbstwertdienliche Verzerrung" },
      { "oer": "psych", "sec": "12.1" },
      { "doi": "10.1016/0022-1031(67)90034-0" }
    ],
    "Einstellungen und kognitive Dissonanz": [
      { "lit": "Aronson 2014", "where": "Abschnitte zu Einstellungen, Einstellung und Verhalten (Theorie des geplanten Verhaltens), Persuasion (ELM) und kognitiver Dissonanz" },
      { "oer": "psych", "sec": "12.3" },
      { "doi": "10.1037/h0041593" }
    ],
    "Sozialer Einfluss: Konformität und Gehorsam": [
      { "lit": "Aronson 2014", "where": "Abschnitte zu Konformität (Sherif, Asch, normativer und informationaler Einfluss, Minoritäteneinfluss) und Gehorsam (Milgram)" },
      { "lit": "Milgram 1974", "where": "Gehorsamsexperimente und ihre Variationen (Nähe zum Opfer, Anwesenheit der Autorität, ungehorsame Mitstreiter)" },
      { "oer": "psych", "sec": "12.4" }
    ],
    "Gruppen und Leistung": [
      { "lit": "Aronson 2014", "where": "Abschnitte zu Gruppenprozessen: soziale Erleichterung, soziales Faulenzen, Deindividuation, Gruppenpolarisierung, Groupthink" },
      { "lit": "Jonas 2014", "where": "Abschnitte zu Gruppenleistung und Gruppenentscheidungen" },
      { "oer": "psych", "sec": "12.4" }
    ],
    "Vorurteile, Stereotype und Intergruppenbeziehungen": [
      { "lit": "Aronson 2014", "where": "Abschnitte zu Stereotypen, Vorurteilen und Diskriminierung, sozialer Identität, realistischem Gruppenkonflikt, Kontakthypothese und Stereotype Threat" },
      { "oer": "psych", "sec": "12.5" },
      { "doi": "10.1037/0022-3514.69.5.797" }
    ],
    "Prosoziales Verhalten und Aggression": [
      { "lit": "Aronson 2014", "where": "Abschnitte zu prosozialem Verhalten (Bystander-Effekt, Entscheidungsmodell, Empathie-Altruismus) und zu Aggression (Frustrations-Aggression, soziales Lernen)" },
      { "oer": "psych", "sec": "12.6" },
      { "doi": "10.1037/h0025589" }
    ]
  },
  "B1": {
    "Psychophysik und Signalentdeckung": [
      { "lit": "Goldstein 2015", "where": "Abschnitt zu Psychophysik: Schwellen, Weber’sches Gesetz, psychophysische Methoden und Signalentdeckungstheorie" },
      { "oer": "psych", "sec": "5.1" },
      { "doi": "10.1037/h0058700" }
    ],
    "Visuelle Wahrnehmung: Organisation, Tiefe, Konstanz": [
      { "lit": "Goldstein 2015", "where": "Abschnitte zu Wahrnehmungsorganisation (Gestaltgesetze, Figur-Grund), Objekterkennung, Tiefen- und Größenwahrnehmung, Konstanzen und Täuschungen" },
      { "oer": "psych", "sec": "5.6" },
      { "mat": "Michael Bach – Optische Täuschungen & visuelle Phänomene (mit Erklärungen)" }
    ],
    "Aufmerksamkeit": [
      { "lit": "Müsseler 2017", "where": "Abschnitt zu Aufmerksamkeit: Selektionstheorien (frühe/späte Selektion), räumliche Aufmerksamkeit und visuelle Suche" },
      { "lit": "Eysenck 2020", "where": "Abschnitte zu selektiver Aufmerksamkeit, Load-Theorie, Merkmalsintegrationstheorie und visueller Suche" },
      { "doi": "10.1016/0010-0285(80)90005-5" }
    ],
    "Klassisches Konditionieren": [
      { "lit": "Gluck 2010", "where": "Abschnitt zur klassischen Konditionierung: Erwerb, Extinktion, Generalisierung, Blockierung und Rescorla-Wagner-Modell" },
      { "oer": "psych", "sec": "6.2" },
      { "doi": "10.1037/h0025984" }
    ],
    "Operantes Konditionieren und Beobachtungslernen": [
      { "lit": "Gluck 2010", "where": "Abschnitte zu instrumenteller (operanter) Konditionierung, Verstärkung, Bestrafung und Verstärkerplänen sowie zum sozialen Lernen durch Beobachtung" },
      { "oer": "psych", "sec": "6.3" },
      { "oer": "psych", "sec": "6.4" }
    ],
    "Gedächtnis: Systeme und Modelle": [
      { "lit": "Baddeley 2020", "where": "Abschnitte zu sensorischem Gedächtnis, Kurzzeit- und Arbeitsgedächtnis (Mehrkomponentenmodell), Verarbeitungstiefe und Langzeitgedächtnissystemen" },
      { "oer": "psych", "sec": "8.1" },
      { "doi": "10.1016/S1364-6613(00)01538-2" }
    ],
    "Enkodieren, Abrufen, Vergessen, falsche Erinnerungen": [
      { "lit": "Baddeley 2020", "where": "Abschnitte zu Vergessen und Interferenz, Abruf und Enkodierspezifität, Konsolidierung sowie Augenzeugengedächtnis und falschen Erinnerungen" },
      { "oer": "psych", "sec": "8.3" },
      { "doi": "10.1037/h0020071" }
    ],
    "Kategorien, Problemlösen und Schließen": [
      { "lit": "Goldstein 2019", "where": "Abschnitte zu Kategorisierung (Prototypen, Basisebene), Problemlösen (Problemraum, Einsicht, funktionale Gebundenheit, Einstellungseffekt) und deduktivem Schließen (Syllogismen, Wason-Wahlaufgabe)" },
      { "oer": "psych", "sec": "7.3" },
      { "doi": "10.1037/h0093599" }
    ],
    "Urteilen und Entscheiden": [
      { "lit": "Kahneman 2012", "where": "Darstellung von Urteilsheuristiken und -verzerrungen (Verfügbarkeit, Repräsentativität, Anker), der zwei Denksysteme sowie von Prospect Theory, Verlustaversion und Framing" },
      { "doi": "10.1126/science.185.4157.1124" },
      { "doi": "10.2307/1914185" }
    ],
    "Sprache": [
      { "lit": "Eysenck 2020", "where": "Abschnitte zu Sprachwahrnehmung, visueller Worterkennung, Satzverarbeitung (Holzwegsätze) und Sprachproduktion" },
      { "lit": "Anderson 2013", "where": "Abschnitte zu Sprachstruktur, Sprachverstehen und zum Verhältnis von Sprache und Denken" },
      { "oer": "psych", "sec": "7.2" }
    ],
    "Motivation": [
      { "lit": "Heckhausen 2018", "where": "Abschnitte zu Leistungsmotivation und Risikowahl-Modell, intrinsischer Motivation und Selbstbestimmung, Rubikonmodell der Handlungsphasen und Implementierungsintentionen" },
      { "oer": "psych", "sec": "10.1" },
      { "doi": "10.1207/S15327965PLI1104_01" }
    ],
    "Emotion": [
      { "lit": "Brandstätter 2018", "where": "Abschnitte zu Emotionstheorien (James-Lange, Cannon-Bard, Schachter-Singer, Appraisal-Theorien), Basisemotionen und Emotionsausdruck" },
      { "oer": "psych", "sec": "10.4" },
      { "doi": "10.1037/h0046234" }
    ]
  },
  "B2": {
    "Neuronen und Gliazellen": [
      { "lit": "Schandry 2016", "where": "Abschnitt zum Aufbau von Nervenzellen und zu den Typen und Funktionen von Gliazellen" },
      { "lit": "Bear 2018", "where": "Abschnitt zu Neuronen und Gliazellen" },
      { "oer": "psych", "sec": "3.2" }
    ],
    "Ruhe- und Aktionspotenzial": [
      { "lit": "Schandry 2016", "where": "Abschnitt zu Ruhemembranpotenzial, Aktionspotenzial und Erregungsleitung" },
      { "oer": "psych", "sec": "3.2" },
      { "mat": "Neuroscience Online – Open-Access-Lehrbuch (UTHealth Houston)" }
    ],
    "Synapsen und Neurotransmitter": [
      { "lit": "Schandry 2016", "where": "Abschnitt zu synaptischer Übertragung, Rezeptortypen und Neurotransmittersystemen" },
      { "oer": "psych", "sec": "3.2" },
      { "mat": "Neuroscience Online – Open-Access-Lehrbuch (UTHealth Houston)" }
    ],
    "Aufbau des Nervensystems": [
      { "lit": "Pinel 2019", "where": "Abschnitte zur Gliederung des Nervensystems (ZNS/PNS, autonomes Nervensystem), zu anatomischen Lagebezeichnungen und zu den Hirnabschnitten" },
      { "oer": "psych", "sec": "3.3" },
      { "oer": "psych", "sec": "3.4" }
    ],
    "Großhirnrinde und subkortikale Strukturen": [
      { "lit": "Schandry 2016", "where": "Abschnitte zu den Lappen der Großhirnrinde und ihren Funktionen sowie zu limbischen Strukturen und Basalganglien" },
      { "lit": "Pinel 2019", "where": "Abschnitte zur Neuroanatomie von Großhirnrinde und subkortikalen Strukturen" },
      { "oer": "psych", "sec": "3.4" }
    ],
    "Methoden der Neurowissenschaften": [
      { "lit": "Ward 2020", "where": "Abschnitte zu Läsionsmethode und doppelter Dissoziation, Elektrophysiologie (EEG/EKP), funktioneller Bildgebung (fMRT, PET) und Hirnstimulation (TMS)" },
      { "lit": "Gazzaniga 2019", "where": "Abschnitt zu den Methoden der kognitiven Neurowissenschaften" },
      { "oer": "psych", "sec": "3.4" }
    ],
    "Sinnessysteme: Sehen und Hören": [
      { "lit": "Bear 2018", "where": "Abschnitte zu Auge und Retina, zentraler Sehbahn und visuellem Kortex sowie zum auditorischen System" },
      { "oer": "psych", "sec": "5.3" },
      { "oer": "psych", "sec": "5.4" }
    ],
    "Motorik": [
      { "lit": "Schandry 2016", "where": "Abschnitt zur Motorik: motorischer Kortex, Pyramidenbahn, Basalganglien und Kleinhirn" },
      { "lit": "Bear 2018", "where": "Abschnitte zur motorischen Kontrolle durch Rückenmark und Gehirn" },
      { "mat": "Neuroscience Online – Open-Access-Lehrbuch (UTHealth Houston)" }
    ],
    "Hormone und Stress": [
      { "lit": "Schandry 2016", "where": "Abschnitte zum endokrinen System und zur Stressreaktion (Sympathikus-Nebennierenmark-Achse, HPA-Achse, Cortisol)" },
      { "oer": "psych", "sec": "3.5" },
      { "oer": "psych", "sec": "14.1" }
    ],
    "Schlaf und biologische Rhythmen": [
      { "lit": "Pinel 2019", "where": "Abschnitt zu Schlaf, Schlafstadien, circadianen Rhythmen und Schlafstörungen" },
      { "oer": "psych", "sec": "4.2" },
      { "oer": "psych", "sec": "4.3" }
    ],
    "Neurobiologie von Lernen und Gedächtnis": [
      { "lit": "Bear 2018", "where": "Abschnitte zu Gedächtnissystemen (Patient H. M.) und zu molekularen Mechanismen von Lernen und Gedächtnis (LTP, NMDA-Rezeptor)" },
      { "lit": "Kandel 2021", "where": "Abschnitte zu Lernen und Gedächtnis, synaptischer Plastizität (LTP) und Aplysia-Studien" },
      { "oer": "psych", "sec": "8.2" }
    ],
    "Affektive Neurowissenschaften: Emotion, Belohnung, Entscheidung": [
      { "lit": "Gazzaniga 2019", "where": "Abschnitte zu Emotion (Amygdala, Furchtkonditionierung) sowie zu Belohnung und Entscheidungsfindung" },
      { "lit": "Sapolsky 2017", "where": "Darstellung von Amygdala, präfrontalem Kortex und dopaminergem Belohnungssystem" },
      { "oer": "psych", "sec": "10.4" }
    ],
    "Lateralisierung, Plastizität, Genetik und Evolution": [
      { "lit": "Pinel 2019", "where": "Abschnitte zu Lateralisierung und Split-Brain-Forschung, Neuroplastizität sowie Evolution und Genetik des Verhaltens" },
      { "oer": "psych", "sec": "3.4" },
      { "oer": "psych", "sec": "3.1" }
    ]
  },
  "B3": {
    "Originalliteratur finden und lesen": [
      { "lit": "Sedlmeier 2018", "where": "Abschnitte zu Operationalisierung, Validität, Effektgrößen und Teststärke als Grundlage für kritisches Lesen" },
      { "mat": "Lakens – Improving Your Statistical Inferences (offenes Online-Buch)" }
    ],
    "Paradigmen der kognitiven Kontrolle": [
      { "mat": "PsyToolkit – Experiment- und Fragebogenbibliothek" },
      { "doi": "10.1037/h0054651" }
    ],
    "Experimente programmieren": [
      { "lit": "Peirce 2018", "where": "Darstellung des Aufbaus von Experimenten in PsychoPy, inkl. Randomisierung, Counterbalancing und Stimulus-Timing" },
      { "lit": "Huber 2019", "where": "Abschnitte zu Versuchsplanung und Kontrolltechniken wie Randomisierung und Ausbalancierung" },
      { "mat": "PsychoPy – Dokumentation und Tutorials" }
    ],
    "Reaktionszeitdaten aufbereiten und auswerten": [
      { "lit": "Sedlmeier 2018", "where": "Abschnitte zu t-Tests für abhängige Stichproben, Varianzanalyse mit Messwiederholung und Effektgrößen" },
      { "oer": "stats", "ch": 10 },
      { "doi": "10.3389/fpsyg.2013.00863" }
    ],
    "Psychophysiologische und neurowissenschaftliche Vertiefung": [
      { "lit": "Luck 2014", "where": "Darstellung der EEG-Aufzeichnung und EKP-Analyse: Elektroden und Referenz, Artefakte, Filterung, Baseline-Korrektur und Mittelung" },
      { "lit": "Huettel 2014", "where": "Abschnitte zu fMRT-Versuchsdesigns (Block- vs. ereigniskorreliertes Design) und statistischer Auswertung inkl. Korrektur für multiples Testen" },
      { "mat": "MIT 9.13 The Human Brain – Sitzungen zu fMRT-Methoden und Experimentdesign" }
    ],
    "Open Science und Präregistrierung": [
      { "lit": "Sedlmeier 2018", "where": "Abschnitte zu Teststärke und Planung des Stichprobenumfangs" },
      { "mat": "Lakens – Improving Your Statistical Inferences (offenes Online-Buch)" },
      { "doi": "10.1073/pnas.1708274114" }
    ],
    "Den Forschungsbericht schreiben (APA 7)": [
      { "lit": "American 2020", "where": "Abschnitte zu Aufbau und Elementen eines empirischen Artikels, zur Darstellung statistischer Ergebnisse sowie zu Tabellen und Abbildungen" },
      { "lit": "Deutsche 2019", "where": "Richtlinien zur Manuskriptgestaltung und Ergebnisdarstellung für deutschsprachige Arbeiten" },
      { "mat": "APA Style – Beispielpapiere (Student Paper)" }
    ]
  },
  "B4": {
    "Die Versuchsperson als aktive Teilnehmende": [
      { "lit": "Rosenthal 2009", "where": "Abschnitte zu Demand Characteristics (Orne), Rollen von Versuchspersonen und Bewertungsangst" },
      { "lit": "Huber 2019", "where": "Abschnitt zu Störeinflüssen durch Versuchspersonen im Experiment" },
      { "mat": "Orne (1962): On the social psychology of the psychological experiment – Volltext suchen" }
    ],
    "Versuchsleitereffekte": [
      { "lit": "Rosenthal 2009", "where": "Abschnitte zu Versuchsleitererwartungseffekten (inkl. Kluger Hans) und Gegenmaßnahmen" },
      { "lit": "Huber 2019", "where": "Abschnitt zu Versuchsleitereffekten und Kontrolltechniken wie Standardisierung und Blindversuch" },
      { "mat": "Clever Hans und Versuchsleitereffekte (YouTube-Suche)" }
    ],
    "Informierte Einwilligung und Freiwilligkeit": [
      { "lit": "Döring 2023", "where": "Abschnitt zur Forschungsethik: informierte Einwilligung, Freiwilligkeit und Schutz der Teilnehmenden" },
      { "oer": "psych", "sec": "2.4" },
      { "mat": "APA Ethics Code – Standard 8 (Research and Publication)" }
    ],
    "Datenschutz in der Forschung": [
      { "lit": "Döring 2023", "where": "Abschnitt zu Forschungsethik und Datenschutz (Anonymisierung, Pseudonymisierung)" }
    ],
    "Reflexion strukturiert schreiben": [
      { "lit": "Döring 2023", "where": "Abschnitte zu Untersuchungsdesign, Gütekriterien und Forschungsethik als Bezugsrahmen für die Analyse eigener Forschungserfahrungen" }
    ]
  },
  "C1": {
    "Das Selbst: Selbstkonzept und Selbstwert": [
      { "lit": "Aronson 2014", "where": "Abschnitte zu Selbstkonzept und Selbstwert, Introspektion, Selbstwahrnehmungstheorie und sozialem Vergleich" },
      { "mat": "Principles of Social Psychology – 1st International H5P Edition (BCcampus)" },
      { "doi": "10.1037/0033-295X.84.3.231" }
    ],
    "Selbstregulation und Selbstdarstellung": [
      { "lit": "Aronson 2014", "where": "Abschnitte zu Selbstaufmerksamkeit, Selbstkontrolle und Impression Management (Ingratiation, Self-Handicapping)" },
      { "lit": "Myers 2022", "where": "Abschnitte zu Selbstdarstellung, Self-Handicapping und Self-Monitoring" },
      { "oer": "psych", "sec": "12.2" }
    ],
    "Soziale Kognition: automatisch und kontrolliert": [
      { "lit": "Fiske 2020", "where": "Abschnitte zu Schemata, Zugänglichkeit und Priming, automatischer vs. kontrollierter Verarbeitung und Zwei-Prozess-Modellen (u. a. Kontinuum-Modell)" },
      { "lit": "Aronson 2014", "where": "Abschnitte zu automatischem und kontrolliertem Denken, Schemata, Priming und kontrafaktischem Denken" },
      { "mat": "Principles of Social Psychology – 1st International H5P Edition (BCcampus)" }
    ],
    "Interpersonale Attraktion": [
      { "lit": "Aronson 2014", "where": "Abschnitte zu Determinanten interpersonaler Anziehung: Nähe, Ähnlichkeit, Reziprozität, physische Attraktivität und Fehlattribution von Erregung" },
      { "lit": "Myers 2022", "where": "Abschnitte zu Attraktion: Nähe, Mere-Exposure, Attraktivität, Ähnlichkeit" },
      { "mat": "Principles of Social Psychology – 1st International H5P Edition (BCcampus)" }
    ],
    "Enge Beziehungen": [
      { "lit": "Aronson 2014", "where": "Abschnitte zu engen Beziehungen: Liebe, Bindungsstile in Partnerschaften, soziale Austausch- und Equity-Theorie sowie Investitionsmodell" },
      { "lit": "Myers 2022", "where": "Abschnitte zu Liebe, Bindung und Beziehungsende" },
      { "mat": "Principles of Social Psychology – 1st International H5P Edition (BCcampus)" }
    ],
    "Soziale Normen und Kooperation": [
      { "lit": "Aronson 2014", "where": "Abschnitte zu deskriptiven und injunktiven Normen sowie zu sozialen Dilemmata (Gefangenendilemma, Tit-for-Tat)" },
      { "mat": "Principles of Social Psychology – 1st International H5P Edition (BCcampus)" },
      { "mat": "The Evolution of Trust – interaktives Spiel zur Spieltheorie (Nicky Case)" }
    ],
    "Stereotype, Vorurteile und ihre Reduktion – Vertiefung": [
      { "lit": "Fiske 2020", "where": "Abschnitte zu Stereotypen und Vorurteilen, u. a. Stereotype-Content-Modell, ambivalenter Sexismus und subtile Formen von Vorurteilen" },
      { "lit": "Aronson 2014", "where": "Abschnitte zu automatischer und kontrollierter Stereotypisierung und zur Reduktion von Vorurteilen (Kontakthypothese)" },
      { "mat": "Noba Project – Module „The Self“, „Love, Friendship and Social Support“, „Prejudice, Discrimination, and Stereotyping“, „Cooperation“" }
    ],
    "Kultur und Sozialverhalten": [
      { "lit": "Henrich 2020", "where": "Darstellung des WEIRD-Problems und kultureller Unterschiede in Psychologie und Verhalten" },
      { "lit": "Aronson 2014", "where": "Abschnitte zu Kultur und Selbst (independent/interdependent) und zu kulturellen Unterschieden in der Attribution" },
      { "mat": "Henrich, Heine & Norenzayan (2010): The weirdest people in the world? – Volltext suchen" }
    ],
    "Angewandte Sozialpsychologie": [
      { "lit": "Aronson 2014", "where": "Abschnitte zur Anwendung der Sozialpsychologie in Gesundheit, Umwelt und Recht" },
      { "lit": "Thaler 2009", "where": "Darstellung von Nudging und Entscheidungsarchitektur" },
      { "doi": "10.1016/0749-5978(91)90020-T" }
    ]
  },
  "C2": {
    "Selbstregulation und Temperament": [
      { "lit": "Berk 2020", "where": "Abschnitt zu Temperament (Thomas & Chess, Rothbart, Kagan), Passungsmodell und Entwicklung der Selbstregulation" },
      { "lit": "Mischel 2015", "where": "Darstellung des Marshmallow-Tests und der Längsschnittbefunde zum Belohnungsaufschub" },
      { "mat": "Watts, Duncan & Quan (2018): Revisiting the marshmallow test – Volltext suchen" }
    ],
    "Moralentwicklung": [
      { "lit": "Siegler 2021", "where": "Abschnitt zur Moralentwicklung (Piaget, Kohlberg, Gilligan, Domänentheorie) und zu prosozialem Verhalten" },
      { "lit": "Berk 2020", "where": "Abschnitt zur moralischen Entwicklung in Kindheit und Jugend" },
      { "oer": "psych", "sec": "9.2" }
    ],
    "Familie und Erziehung": [
      { "lit": "Siegler 2021", "where": "Abschnitt zu Familie und Erziehung (Erziehungsstile, bidirektionale Einflüsse, Geschwister, Scheidung, sozioökonomischer Status)" },
      { "oer": "psych", "sec": "9.3" },
      { "doi": "10.2307/1126611" }
    ],
    "Peers, Freundschaft und Schule": [
      { "lit": "Siegler 2021", "where": "Abschnitt zu Peerbeziehungen (Freundschaft, soziometrischer Status, Bullying)" },
      { "lit": "Lohaus 2018", "where": "Abschnitt zu Peerbeziehungen und Freundschaften im Jugendalter" },
      { "mat": "LibreTexts – Lifespan Development (Lally & Valentine-French u. a.)" }
    ],
    "Jugendalter": [
      { "lit": "Lohaus 2018", "where": "Abschnitte zu Pubertät, Gehirnentwicklung, Identität, Entwicklungsaufgaben und Problemverhalten im Jugendalter" },
      { "oer": "psych", "sec": "9.3" },
      { "doi": "10.1037/0033-295X.100.4.674" }
    ],
    "Erwachsenenalter": [
      { "lit": "Santrock 2021", "where": "Abschnitte zu Emerging Adulthood sowie frühem und mittlerem Erwachsenenalter (Persönlichkeitsentwicklung, Partnerschaft, Elternschaft, Midlife)" },
      { "oer": "psych", "sec": "9.3" },
      { "doi": "10.1037/0033-2909.132.1.1" }
    ],
    "Altern: Kognition, Emotion, Erfolgreiches Altern": [
      { "lit": "Santrock 2021", "where": "Abschnitte zur kognitiven und sozioemotionalen Entwicklung im späten Erwachsenenalter (fluide/kristalline Intelligenz, Seattle Longitudinal Study, sozioemotionale Selektivität)" },
      { "lit": "Baltes 1990", "where": "Beitrag zum Modell der selektiven Optimierung mit Kompensation und zu Kriterien erfolgreichen Alterns" },
      { "doi": "10.1037/0003-066X.54.3.165" }
    ],
    "Resilienz und Entwicklungspsychopathologie": [
      { "lit": "Werner 2001", "where": "Darstellung der Kauai-Längsschnittstudie zu Risiko-, Schutzfaktoren und Resilienz" },
      { "mat": "Center on the Developing Child (Harvard) – Resilienz, Toxic Stress, Executive Function" },
      { "doi": "10.1037/0003-066X.56.3.227" }
    ],
    "Lebensende, Trauer und Medien": [
      { "lit": "Berk 2020", "where": "Abschnitt zu Sterben, Tod und Trauer (Kübler-Ross, Formen der Trauerbewältigung)" },
      { "oer": "psych", "sec": "9.4" }
    ]
  },
  "C3": {
    "Gegenstand und Paradigmen": [
      { "lit": "Neyer 2018", "where": "Einführende Abschnitte zum Persönlichkeitsbegriff, zur Differentiellen Psychologie und zu den Paradigmen der Persönlichkeitspsychologie" },
      { "lit": "Stemmler 2016", "where": "Einführung in Gegenstand, Geschichte (William Stern) und Methoden der Differentiellen Psychologie" },
      { "oer": "psych", "ch": 11 }
    ],
    "Eigenschaftsmodelle: Big Five und HEXACO": [
      { "lit": "Neyer 2018", "where": "Abschnitt zum Eigenschaftsparadigma (lexikalischer Ansatz, Faktorenanalyse, Big Five, HEXACO)" },
      { "oer": "psych", "sec": "11.7" },
      { "doi": "10.1037/0022-3514.52.1.81" }
    ],
    "Biologische Persönlichkeitstheorien": [
      { "lit": "Stemmler 2016", "where": "Abschnitte zu biopsychologischen Persönlichkeitstheorien (Eysenck, Gray) und zur Verhaltensgenetik" },
      { "lit": "Neyer 2018", "where": "Abschnitte zum neurowissenschaftlichen und molekulargenetischen Paradigma (Erregungs- und Verstärkersensitivitätstheorien, Zwillings- und Adoptionsstudien)" },
      { "oer": "psych", "sec": "11.6" }
    ],
    "Person-Situation-Debatte und Interaktionismus": [
      { "lit": "Funder 2019", "where": "Abschnitt zur Person-Situation-Debatte (Mischels Konsistenzkritik, Aggregation, Interaktionismus)" },
      { "oer": "psych", "sec": "11.4" },
      { "doi": "10.1037/0033-295X.102.2.246" }
    ],
    "Stabilität und Veränderung": [
      { "lit": "Neyer 2018", "where": "Abschnitt zur Persönlichkeitsentwicklung (Rangordnungsstabilität, Mittelwertveränderung, soziale Investition)" },
      { "lit": "Larsen 2020", "where": "Abschnitt zu Stabilität, Veränderung und Kohärenz von Persönlichkeitsdispositionen über die Zeit" },
      { "doi": "10.1037/0033-2909.132.1.1" }
    ],
    "Intelligenz: Modelle": [
      { "lit": "Rost 2013", "where": "Abschnitte zu Intelligenzdefinitionen und Strukturmodellen (g-Faktor, Primärfähigkeiten, Gf/Gc, CHC, Berliner Modell)" },
      { "oer": "psych", "sec": "7.4" },
      { "doi": "10.2307/1412107" }
    ],
    "Intelligenz: Messung, Erblichkeit, Validität": [
      { "lit": "Rost 2013", "where": "Abschnitte zu Intelligenzmessung, IQ-Normierung, Erblichkeit und Vorhersagevalidität" },
      { "lit": "Ritchie 2015", "where": "Darstellung von Intelligenzmessung, Erblichkeit, Vorhersagekraft und Flynn-Effekt" },
      { "oer": "psych", "sec": "7.5" }
    ],
    "Selbstkonzept, Motive, Kreativität": [
      { "lit": "Neyer 2018", "where": "Abschnitte zu Motiven (implizit/explizit), Selbstkonzept und Selbstwert sowie Kreativität" },
      { "lit": "Larsen 2020", "where": "Abschnitte zu Motiven (Leistung, Macht, Intimität; TAT) und zum Selbst" },
      { "oer": "psych", "sec": "7.4" }
    ],
    "Geschlechts- und Gruppenunterschiede richtig interpretieren": [
      { "lit": "Larsen 2020", "where": "Abschnitt zu Geschlecht und Persönlichkeit (Effektgrößen, Geschlechtsunterschiede in Persönlichkeit, Interessen und Fähigkeiten)" },
      { "mat": "Hyde (2005): The gender similarities hypothesis – Volltext suchen" },
      { "mat": "Interpreting Cohen’s d – interaktive Visualisierung (Kristoffer Magnusson)" }
    ]
  },
  "C4": {
    "Fragebogenstudien planen": [
      { "lit": "Döring 2023", "where": "Abschnitte zur Fragebogenmethode, Online-Befragung, Stichprobenziehung und Datenqualität" },
      { "lit": "Moosbrugger 2020", "where": "Abschnitte zur Fragebogenkonstruktion (Itemformulierung, Antwortformate, Instruktion, Pretest)" },
      { "mat": "SoSci Survey – Online-Befragungen (kostenlos für Forschung)" }
    ],
    "Skalenbildung und Reliabilität": [
      { "lit": "Moosbrugger 2020", "where": "Abschnitte zu Itemanalyse (Trennschärfe), Reliabilität und Koeffizienten der internen Konsistenz (α, ω)" },
      { "lit": "Field 2018", "where": "Abschnitt zur Reliabilitätsanalyse in SPSS (Umpolung, Cronbachs α) und zum Umgang mit fehlenden Werten" },
      { "doi": "10.1007/BF02310555" }
    ],
    "Korrelation, Regression, Moderation, Mediation": [
      { "lit": "Hayes 2022", "where": "Einführung in Regression, Moderation (Interaktionsterm, Simple Slopes) und Mediation (indirekter Effekt, Bootstrapping, PROCESS)" },
      { "lit": "Field 2018", "where": "Abschnitte zu Korrelation, multipler Regression sowie Moderation und Mediation" },
      { "oer": "stats", "ch": 12 }
    ],
    "Systematische Beobachtung": [
      { "lit": "Döring 2023", "where": "Abschnitt zur wissenschaftlichen Beobachtung (Beobachtungssysteme, Stichprobenpläne, Beobachterübereinstimmung, Beobachtungsfehler)" },
      { "doi": "10.1177/001316446002000104" },
      { "doi": "10.1037/0033-2909.86.2.420" }
    ],
    "Längsschnitt-, Tagebuch- und ESM-Designs": [
      { "lit": "Mehl 2012", "where": "Beiträge zu Experience Sampling, Tagebuchverfahren und ambulantem Assessment sowie zur Mehrebenenanalyse intensiver Längsschnittdaten" },
      { "lit": "Döring 2023", "where": "Abschnitte zu Längsschnittdesigns und Tagebuchmethoden" },
      { "lit": "Field 2018", "where": "Abschnitt zu Mehrebenenmodellen (multilevel linear models)" }
    ],
    "Forschung mit Kindern und sensiblen Themen": [
      { "lit": "Döring 2023", "where": "Abschnitt zur Forschungsethik (informierte Einwilligung, Schutz vulnerabler Gruppen)" },
      { "oer": "psych", "sec": "2.4" }
    ]
  },
  "C5": {
    "Grundbegriffe": [
      { "lit": "Steins 2010", "where": "Grundlegende Beiträge zu Sex/Gender, Geschlechtsidentität und Doing Gender" },
      { "lit": "Genkova 2016", "where": "Beiträge zu Diversitätsbegriff und Diversitätsdimensionen" },
      { "mat": "Noba Project – Module „Gender“, „Prejudice, Discrimination, and Stereotyping“, „Culture“" }
    ],
    "Geschlechtsunterschiede und -ähnlichkeiten": [
      { "lit": "Hyde 2022", "where": "Abschnitte zu Geschlechtsunterschieden und -ähnlichkeiten (Metaanalysen, Gender-Similarities-Hypothese)" },
      { "lit": "Fine 2012", "where": "Kritik an neurowissenschaftlichen Geschlechterbehauptungen (Neurosexismus) und an Befunden zu Geschlechtsunterschieden im Gehirn" },
      { "mat": "Hyde (2005): The gender similarities hypothesis – Volltext suchen" }
    ],
    "Theorien der Geschlechterentwicklung": [
      { "lit": "Eckes 2000", "where": "Beiträge zu Theorien der Geschlechterentwicklung (sozial-kognitive, kognitive und Schema-Ansätze, soziale Rollen)" },
      { "lit": "Eagly 2012", "where": "Darstellung der Social-Role-Theorie" },
      { "mat": "Noba Project – Module „Gender“, „Prejudice, Discrimination, and Stereotyping“, „Culture“" }
    ],
    "Stereotype, Sexismus und Diskriminierung": [
      { "lit": "Hyde 2022", "where": "Abschnitte zu Geschlechterstereotypen, Sexismus und Diskriminierung im Beruf" },
      { "lit": "Steins 2010", "where": "Beiträge zu Geschlechterstereotypen und Sexismus" },
      { "mat": "Noba Project – Module „Gender“, „Prejudice, Discrimination, and Stereotyping“, „Culture“" }
    ],
    "Intersektionalität": [
      { "lit": "Crenshaw 1989", "where": "Originalaufsatz zur Intersektionalität (Überschneidung von Diskriminierung aufgrund von Race und Geschlecht)" },
      { "mat": "Kimberlé Crenshaw – The urgency of intersectionality (TED)" }
    ],
    "Minderheitenstress und Gesundheit": [
      { "lit": "Hyde 2022", "where": "Abschnitte zu psychischer Gesundheit (Geschlechtsunterschiede bei Depression und Angst) und zu Erfahrungen sexueller Minderheiten" },
      { "mat": "Meyer (2003): Prejudice, social stress, and mental health in LGB populations – Volltext suchen" }
    ],
    "Weitere Dimensionen: Alter, Behinderung, sozioökonomischer Status, Kultur": [
      { "lit": "Genkova 2016", "where": "Beiträge zu einzelnen Diversitätsdimensionen (Alter, Behinderung, soziale Herkunft, Kultur)" },
      { "mat": "WHO – ICF (Internationale Klassifikation der Funktionsfähigkeit)" }
    ],
    "Diversitätssensible Forschung und Praxis": [
      { "lit": "Genkova 2016", "where": "Beiträge zu Diversity-Kompetenz und Diversity Management in Organisationen und Praxis" },
      { "mat": "APA Style – Bias-Free Language" }
    ]
  },
  "D1": {
    "Messen und Skalenniveaus": [
      { "lit": "Eid 2017", "where": "Abschnitt zu Messen, Skalenniveaus und zulässigen Transformationen" },
      { "oer": "stats", "ch": 1 },
      { "mat": "Research Methods in Psychology (BCcampus)" }
    ],
    "Deskriptive Statistik: Verteilungen, Lage, Streuung": [
      { "lit": "Eid 2017", "where": "Abschnitte zu Häufigkeitsverteilungen und Grafiken, Lage- und Streuungsmaßen, Verteilungsform sowie z-Standardisierung" },
      { "oer": "stats", "ch": 2 },
      { "mat": "Learning Statistics with R (Danielle Navarro) – kostenloses Lehrbuch für Psychologie" }
    ],
    "Zusammenhangsmaße": [
      { "lit": "Eid 2017", "where": "Abschnitte zu Kovarianz und Korrelationskoeffizienten für metrische, ordinale und nominale Variablen sowie zu Einflussfaktoren auf Korrelationen" },
      { "oer": "stats", "ch": 12 },
      { "mat": "Learning Statistics with R (Danielle Navarro) – kostenloses Lehrbuch für Psychologie" }
    ],
    "Einfache lineare Regression": [
      { "lit": "Eid 2017", "where": "Abschnitt zur einfachen linearen Regression: Kleinste-Quadrate-Kriterium, Regressionskoeffizienten, Determinationskoeffizient und Standardschätzfehler" },
      { "oer": "stats", "ch": 12 },
      { "mat": "Learning Statistics with R (Danielle Navarro) – kostenloses Lehrbuch für Psychologie" }
    ],
    "Wahrscheinlichkeit und Bayes-Theorem": [
      { "lit": "Bortz 2010", "where": "Abschnitte zu Grundbegriffen der Wahrscheinlichkeitstheorie (Axiome, bedingte Wahrscheinlichkeit, Unabhängigkeit, Bayes-Theorem) und Kombinatorik" },
      { "oer": "stats", "ch": 3 },
      { "doi": "10.1037/0033-295X.102.4.684" }
    ],
    "Zufallsvariablen und Verteilungen": [
      { "lit": "Bortz 2010", "where": "Abschnitte zu Zufallsvariablen, Erwartungswert und Wahrscheinlichkeitsverteilungen (Binomial-, Normal-, t-, χ²- und F-Verteilung)" },
      { "oer": "stats", "ch": 4 },
      { "oer": "stats", "ch": 6 }
    ],
    "Stichprobenverteilung, Standardfehler, Konfidenzintervall": [
      { "lit": "Eid 2017", "where": "Abschnitte zu Stichprobenkennwerteverteilungen, Standardfehler, Eigenschaften von Schätzern und Konfidenzintervallen" },
      { "oer": "stats", "ch": 7 },
      { "oer": "stats", "ch": 8 }
    ],
    "Logik des Signifikanztests": [
      { "lit": "Rasch 2014", "where": "Abschnitte zur Logik des Signifikanztests: Hypothesen, p-Wert, α- und β-Fehler, Teststärke und Effektgröße" },
      { "mat": "Lakens – Improving Your Statistical Inferences (offenes Online-Buch)" },
      { "doi": "10.1080/00031305.2016.1154108" }
    ],
    "t-Tests": [
      { "lit": "Rasch 2014", "where": "Abschnitt zum t-Test für eine Stichprobe, für unabhängige und für abhängige Stichproben inkl. Voraussetzungen und Effektgröße" },
      { "oer": "stats", "ch": 10 },
      { "mat": "Learning Statistics with R (Danielle Navarro) – kostenloses Lehrbuch für Psychologie" }
    ],
    "Varianzanalyse (ANOVA)": [
      { "lit": "Rasch 2014", "where": "Abschnitte zur ein- und mehrfaktoriellen Varianzanalyse, zu Post-hoc-Tests und Kontrasten sowie zur Varianzanalyse mit Messwiederholung" },
      { "oer": "stats", "ch": 13 },
      { "mat": "Learning Statistics with R (Danielle Navarro) – kostenloses Lehrbuch für Psychologie" }
    ],
    "Nonparametrische Verfahren und χ²-Test": [
      { "lit": "Bortz 2010", "where": "Abschnitte zu Verfahren für Rangdaten (U-Test, Wilcoxon-Test, Kruskal-Wallis- und Friedman-Test) und zu χ²-Verfahren für Häufigkeitsdaten" },
      { "oer": "stats", "ch": 11 },
      { "mat": "Learning Statistics with R (Danielle Navarro) – kostenloses Lehrbuch für Psychologie" }
    ],
    "Multiple Regression und Allgemeines Lineares Modell": [
      { "lit": "Eid 2017", "where": "Abschnitte zur multiplen Regression (partielle Regressionsgewichte, Multikollinearität, hierarchische Regression, Dummy-Kodierung) und zum Allgemeinen Linearen Modell" },
      { "lit": "Field 2018", "where": "Abschnitte zur multiplen und logistischen Regression sowie zum Allgemeinen Linearen Modell" },
      { "mat": "Learning Statistics with R (Danielle Navarro) – kostenloses Lehrbuch für Psychologie" }
    ],
    "Versuchsplanung und Validität": [
      { "lit": "Shadish 2002", "where": "Darstellung der Validitätsarten (statistische, interne, Konstrukt- und externe Validität) und der Bedrohungen der internen Validität" },
      { "mat": "Research Methods in Psychology (BCcampus)" },
      { "doi": "10.1037/h0040950" }
    ],
    "Effektgrößen, Teststärke und Stichprobenplanung": [
      { "lit": "Rasch 2014", "where": "Abschnitte zu Effektgrößen, Teststärke und Stichprobenumfangsplanung" },
      { "mat": "Lakens – Improving Your Statistical Inferences (offenes Online-Buch)" },
      { "doi": "10.1037/0033-2909.112.1.155" }
    ],
    "Statistiksoftware und Ergebnisbericht": [
      { "lit": "Luhmann 2020", "where": "Einführung in R und RStudio: Datenaufbereitung, Analysen und Arbeiten mit Skripten" },
      { "lit": "Field 2018", "where": "Durchführung von Analysen in SPSS und Hinweise zum Berichten der Ergebnisse" },
      { "mat": "R for Data Science (2e, Wickham et al.)" }
    ]
  },
  "D2": {
    "Messtheorie und latente Merkmale": [
      { "lit": "Eid 2014", "where": "Abschnitte zu den Grundlagen des Messens, zu latenten Variablen und zu Messmodellen" },
      { "lit": "Moosbrugger 2020", "where": "Grundlagen zu latenten Merkmalen und ihrer Erfassung über Indikatoren (Messmodelle)" }
    ],
    "Klassische Testtheorie (KTT)": [
      { "lit": "Moosbrugger 2020", "where": "Abschnitt zur Klassischen Testtheorie: Axiome, Reliabilität, Standardmessfehler, Konfidenzintervall für den wahren Wert, Spearman-Brown-Formel und Minderungskorrektur" },
      { "lit": "Eid 2014", "where": "Abschnitt zur Klassischen Testtheorie" },
      { "mat": "Personality Project (William Revelle) – Psychometrie-Lehrbuchkapitel und R-Paket psych" }
    ],
    "Reliabilitätsschätzung": [
      { "lit": "Moosbrugger 2020", "where": "Abschnitt zu Methoden der Reliabilitätsschätzung (Retest-, Paralleltest-, Testhalbierungsreliabilität, interne Konsistenz, Cronbachs α und McDonalds ω)" },
      { "mat": "Personality Project (William Revelle) – Psychometrie-Lehrbuchkapitel und R-Paket psych" },
      { "doi": "10.1007/BF02310555" }
    ],
    "Validität und Nebengütekriterien": [
      { "lit": "Moosbrugger 2020", "where": "Abschnitte zu Validität (Inhalts-, Kriteriums- und Konstruktvalidität) und weiteren Gütekriterien von Tests" },
      { "doi": "10.1037/h0040957" },
      { "doi": "10.1037/0003-066X.50.9.741" }
    ],
    "Itemanalyse": [
      { "lit": "Bühner 2021", "where": "Abschnitt zur Itemanalyse: Itemschwierigkeit, Trennschärfe, Itemvarianz und Distraktorenanalyse" },
      { "lit": "Moosbrugger 2020", "where": "Abschnitt zur deskriptivstatistischen Itemanalyse" },
      { "lit": "Lienert 1998", "where": "Darstellung der klassischen Itemanalyse (Schwierigkeit, Trennschärfe, Selektionskennwert)" }
    ],
    "Fragebogen- und Testkonstruktion": [
      { "lit": "Bühner 2021", "where": "Abschnitte zu Konstruktionsstrategien, Itemformulierung, Antwortformaten und Antworttendenzen" },
      { "lit": "Moosbrugger 2020", "where": "Abschnitte zu Itemkonstruktion, Antwortformaten und verzerrtem Antwortverhalten" }
    ],
    "Faktorenanalyse": [
      { "lit": "Bühner 2021", "where": "Abschnitte zur explorativen und konfirmatorischen Faktorenanalyse (Extraktion, Bestimmung der Faktorenzahl, Rotation, Modellgüte)" },
      { "mat": "lavaan – Tutorial zu CFA/SEM in R" },
      { "mat": "Personality Project (William Revelle) – Psychometrie-Lehrbuchkapitel und R-Paket psych" }
    ],
    "Item-Response-Theorie und das Rasch-Modell": [
      { "lit": "Strobl 2015", "where": "Einführung in das Rasch-Modell: Modellgleichung, Itemcharakteristische Kurven, suffiziente Statistik, spezifische Objektivität und Prüfung der Modellgeltung" },
      { "lit": "Embretson 2000", "where": "Darstellung von 1PL-, 2PL- und 3PL-Modellen und von computerisiertem adaptivem Testen" },
      { "mat": "Personality Project (William Revelle) – Psychometrie-Lehrbuchkapitel und R-Paket psych" }
    ],
    "Normierung und Interpretation von Testwerten": [
      { "lit": "Moosbrugger 2020", "where": "Abschnitt zu Testwertinterpretation, Normierung und Normskalen (Prozentrang, z-, T-, IQ-, Standard- und Stanine-Werte)" },
      { "lit": "Lienert 1998", "where": "Darstellung der Testeichung und Normierung" },
      { "oer": "psych", "sec": "7.5" }
    ],
    "Systematische Beobachtung": [
      { "lit": "Faßnacht 1995", "where": "Darstellung der systematischen Verhaltensbeobachtung: Beobachtungssysteme, Stichprobenpläne, Beobachtungsfehler und Beobachterübereinstimmung" },
      { "oer": "psych", "sec": "2.2" }
    ],
    "Interview und qualitative Methoden": [
      { "lit": "Flick 2017", "where": "Überblick über qualitative Interviewformen, Grounded Theory, theoretische Sättigung und Triangulation" },
      { "lit": "Mayring 2022", "where": "Darstellung der Grundformen qualitativer Inhaltsanalyse (Zusammenfassung, Explikation, Strukturierung) und des Kodierleitfadens" },
      { "doi": "10.1191/1478088706qp063oa" }
    ],
    "Weitere Messzugänge: objektive, implizite und projektive Verfahren": [
      { "lit": "Moosbrugger 2020", "where": "Überblick über Testarten (u. a. Persönlichkeitsfragebogen, objektive Persönlichkeitstests, projektive Verfahren)" },
      { "oer": "psych", "sec": "11.9" },
      { "doi": "10.1037/0022-3514.74.6.1464" }
    ]
  },
  "E1": {
    "Was ist psychologische Diagnostik?": [
      { "lit": "Schmidt-Atzert 2021", "where": "Einführung in Ziele, Anwendungsfelder und Grundbegriffe der psychologischen Diagnostik (Status- vs. Prozessdiagnostik, Selektion vs. Modifikation, norm- vs. kriteriumsorientiert)" },
      { "lit": "Kubinger 2019", "where": "Abschnitt zu Gegenstand und Grundbegriffen psychologischen Diagnostizierens" }
    ],
    "Der diagnostische Prozess": [
      { "lit": "Westhoff 2014", "where": "Darstellung des diagnostischen Prozesses von der Fragestellung über psychologische Fragen und Untersuchungsplan bis zum Gutachten (inkl. Verhaltensgleichung)" },
      { "lit": "Kubinger 2019", "where": "Abschnitt zum Ablauf des diagnostischen Prozesses" }
    ],
    "Entscheidungstheorie und Nutzen": [
      { "lit": "Schmidt-Atzert 2021", "where": "Abschnitt zu diagnostischen Entscheidungen: Vierfeldertafel, Sensitivität und Spezifität, Cut-off, Grund- und Selektionsquote, Taylor-Russell-Tafeln und Entscheidungsstrategien" },
      { "mat": "Sensitivity, Specificity, PPV erklärt (StatQuest, YouTube-Suche)" }
    ],
    "Klinische vs. statistische Urteilsbildung": [
      { "lit": "Meehl 1954", "where": "Grundlegende Gegenüberstellung klinischer und statistischer (aktuarischer) Vorhersage" },
      { "mat": "Grove et al. (2000): Clinical versus mechanical prediction: A meta-analysis – Volltext suchen" },
      { "doi": "10.1126/science.2648573" }
    ],
    "Leistungs- und Intelligenzdiagnostik": [
      { "lit": "Schmidt-Atzert 2021", "where": "Abschnitt zu Intelligenz-, Leistungs- und Konzentrationstests und zur Interpretation von Testprofilen" },
      { "lit": "Kubinger 2019", "where": "Abschnitt zur Intelligenz- und Leistungsdiagnostik" },
      { "oer": "psych", "sec": "7.5" }
    ],
    "Persönlichkeits- und klinische Fragebögen": [
      { "lit": "Schmidt-Atzert 2021", "where": "Abschnitte zu Persönlichkeitsfragebögen und klinischen Fragebögen sowie zu deren Verfälschbarkeit" },
      { "oer": "psych", "sec": "11.9" },
      { "mat": "Noba Project – Modul „Personality Assessment“" }
    ],
    "Objektive Persönlichkeitstests, projektive und implizite Verfahren": [
      { "lit": "Kubinger 2019", "where": "Abschnitte zu objektiven Persönlichkeitstests und zu projektiven Verfahren" },
      { "oer": "psych", "sec": "11.9" },
      { "doi": "10.1037/0022-3514.74.6.1464" }
    ],
    "Diagnostisches Interview, Anamnese und Beobachtung": [
      { "lit": "Schmidt-Atzert 2021", "where": "Abschnitt zum diagnostischen Interview (Anamnese, strukturierte klinische Interviews, Einstellungsinterview) und zur Verhaltensbeobachtung" },
      { "lit": "Kanning 2004", "where": "Standards für Einstellungsinterviews und Verhaltensbeobachtung in der Personaldiagnostik" }
    ],
    "Qualitätsstandards: Testbeurteilung und DIN 33430": [
      { "lit": "Schmidt-Atzert 2021", "where": "Abschnitte zu Testauswahl und Testbeurteilung sowie zu Qualitätsstandards wie DIN 33430" },
      { "lit": "Kanning 2004", "where": "Darstellung von Qualitätsstandards der Personaldiagnostik einschließlich DIN 33430" },
      { "mat": "International Test Commission – Guidelines" }
    ],
    "Recht und Ethik der Diagnostik in Österreich": [
      { "lit": "Kubinger 2019", "where": "Abschnitt zu ethischen und rechtlichen Rahmenbedingungen psychologischen Diagnostizierens" },
      { "mat": "Rechtsinformationssystem (RIS) – Psychologengesetz 2013 (Suche)" },
      { "mat": "Berufsverband Österreichischer PsychologInnen (BÖP) – Berufsethik" }
    ]
  },
  "E2": {
    "Testdurchführung in der Praxis": [
      { "lit": "Kubinger 2019", "where": "Abschnitte zur Testdurchführung (standardisierte Instruktion, Testleiterverhalten, Protokollierung) und zur Durchführungs- und Auswertungsobjektivität" },
      { "lit": "Schmidt-Atzert 2021", "where": "Abschnitt zur Durchführung psychologischer Tests" }
    ],
    "Auswertung und Interpretation": [
      { "lit": "Schmidt-Atzert 2021", "where": "Abschnitt zur Interpretation von Testergebnissen: Normwerte, Konfidenzintervalle und kritische Differenzen" },
      { "lit": "Kubinger 2019", "where": "Abschnitt zur Auswertung und Interpretation von Testergebnissen" }
    ],
    "Das psychologische Gutachten": [
      { "lit": "Westhoff 2014", "where": "Aufbau und Qualitätskriterien psychologischer Gutachten (Fragestellung, psychologische Fragen, Untersuchungsplan, Ergebnisse, Befund, Stellungnahme)" },
      { "lit": "Kubinger 2019", "where": "Abschnitt zum Erstellen psychologischer Gutachten" }
    ],
    "Rückmeldung von Ergebnissen": [
      { "lit": "Schmidt-Atzert 2021", "where": "Abschnitt zur Mitteilung diagnostischer Ergebnisse an Klient:innen und Auftraggeber" }
    ],
    "Bildungs- und Schuldiagnostik": [
      { "lit": "Schmidt-Atzert 2021", "where": "Abschnitt zur pädagogisch-psychologischen Diagnostik (Schulleistung, Lernstörungen, Hochbegabung)" },
      { "mat": "WHO – ICD-11 Browser (Kapitel 6: Mental, behavioural or neurodevelopmental disorders)" },
      { "mat": "Schulpsychologie-Bildungsberatung (Österreich)" }
    ],
    "Eignungsdiagnostik in Organisationen": [
      { "lit": "Schuler 2014", "where": "Darstellung von Anforderungsanalyse, Verfahren der Personalauswahl (Interviews, Tests, Arbeitsproben, Assessment Center) und ihrer prognostischen Validität" },
      { "mat": "Sackett et al. (2022): Revisiting meta-analytic estimates of validity in personnel selection – Volltext suchen" },
      { "doi": "10.1037/0033-2909.124.2.262" }
    ],
    "Klinische Diagnostik und Klassifikation": [
      { "lit": "Schmidt-Atzert 2021", "where": "Abschnitt zur klinisch-psychologischen Diagnostik (Klassifikation, strukturierte Interviews, Verlaufsdiagnostik)" },
      { "oer": "psych", "sec": "15.2" },
      { "mat": "WHO – ICD-11 Browser (Kapitel 6: Mental, behavioural or neurodevelopmental disorders)" }
    ],
    "Neuropsychologische und verkehrspsychologische Diagnostik": [
      { "lit": "Lezak 2012", "where": "Grundlagen der neuropsychologischen Untersuchung: kognitive Funktionsbereiche, Schätzung des prämorbiden Niveaus, Screeningverfahren und Beschwerdenvalidierung" },
      { "mat": "Kuratorium für Verkehrssicherheit (KFV) – Verkehrspsychologie in Österreich" },
      { "mat": "MoCA – Montreal Cognitive Assessment (Informationen)" }
    ]
  },
  "F1": {
    "Gesundheit, Krankheit und psychische Störung": [
      { "lit": "Comer 2008", "where": "Abschnitt zur Definition abnormen Verhaltens und zu Kriterien für Abnormalität" },
      { "lit": "Antonovsky 1997", "where": "Darstellung der Salutogenese, des Gesundheits-Krankheits-Kontinuums und des Kohärenzgefühls" },
      { "oer": "psych", "sec": "15.1" }
    ],
    "Klassifikation und Epidemiologie": [
      { "lit": "Hoyer 2020", "where": "Abschnitt zu Klassifikation und Diagnostik psychischer Störungen (ICD, DSM) sowie zur Epidemiologie" },
      { "mat": "WHO – ICD-11 Browser, Kapitel 6" },
      { "doi": "10.1016/j.euroneuro.2011.07.018" }
    ],
    "Ätiologische Modelle": [
      { "lit": "Hoyer 2020", "where": "Abschnitt zu Ätiologiemodellen psychischer Störungen, u. a. Vulnerabilitäts-Stress-Modell sowie lerntheoretische und kognitive Erklärungsansätze" },
      { "lit": "Margraf 2018", "where": "Abschnitt zu lerntheoretischen Grundlagen der Verhaltenstherapie und zur Verhaltensanalyse (SORKC)" },
      { "oer": "psych", "sec": "15.3" }
    ],
    "Depressive und bipolare Störungen": [
      { "lit": "Hoyer 2020", "where": "Abschnitt zu depressiven und bipolaren Störungen: Symptomatik, Epidemiologie, Erklärungsmodelle und Behandlung" },
      { "lit": "Beck 1979", "where": "Darstellung des kognitiven Modells der Depression (kognitive Triade, Schemata, Denkfehler) und der kognitiven Therapie" },
      { "oer": "psych", "sec": "15.7" }
    ],
    "Angststörungen": [
      { "lit": "Hoyer 2020", "where": "Abschnitt zu Angststörungen (Panikstörung, Agoraphobie, generalisierte und soziale Angststörung, spezifische Phobien)" },
      { "lit": "Margraf 2018", "where": "Abschnitt zur Verhaltenstherapie bei Angststörungen, u. a. Teufelskreismodell der Panik und Exposition" },
      { "oer": "psych", "sec": "15.4" }
    ],
    "Zwangsstörung, Trauma- und Belastungsstörungen": [
      { "lit": "Hoyer 2020", "where": "Abschnitt zu Zwangsstörungen sowie zu Trauma- und belastungsbezogenen Störungen (PTBS, Anpassungsstörung)" },
      { "oer": "psych", "sec": "15.5" },
      { "oer": "psych", "sec": "15.6" }
    ],
    "Essstörungen, Substanzstörungen und körperliche Beschwerden": [
      { "lit": "Hoyer 2020", "where": "Abschnitte zu Essstörungen, substanzbezogenen Störungen und somatoformen bzw. körperlichen Belastungsstörungen" },
      { "oer": "psych", "sec": "4.5" },
      { "mat": "Abnormal Psychology – offenes Lehrbuch (Bridley & Daffin, Washington State University)" }
    ],
    "Schizophrenie und psychotische Störungen": [
      { "lit": "Hoyer 2020", "where": "Abschnitt zu Schizophrenie und anderen psychotischen Störungen: Symptomatik, Ätiologie und Behandlung" },
      { "oer": "psych", "sec": "15.8" },
      { "mat": "Noba Project – Module zu Angst, Depression, Schizophrenie, Stress, Health Psychology" }
    ],
    "Persönlichkeitsstörungen": [
      { "lit": "Hoyer 2020", "where": "Abschnitt zu Persönlichkeitsstörungen, u. a. Borderline-Persönlichkeitsstörung und ihre Behandlung" },
      { "oer": "psych", "sec": "15.11" },
      { "mat": "WHO – ICD-11 Browser, Kapitel 6" }
    ],
    "Störungen in Kindheit und Jugend, neurokognitive Störungen": [
      { "lit": "Petermann 2013", "where": "Abschnitte zu ADHS, Autismus-Spektrum-Störungen, Störungen des Sozialverhaltens sowie internalisierenden und externalisierenden Störungen" },
      { "lit": "Hoyer 2020", "where": "Abschnitt zu neurokognitiven Störungen (Delir, Demenz)" },
      { "oer": "psych", "sec": "15.10" }
    ],
    "Suizidalität und Krisenintervention": [
      { "lit": "Comer 2008", "where": "Abschnitt zu Suizid: Risikofaktoren, Erklärungsansätze, Behandlung und Prävention" },
      { "oer": "psych", "sec": "15.7" },
      { "mat": "NIMH – Health Topics (Störungsbilder, Studienlage)" }
    ],
    "Klinisch-psychologische Intervention und Psychotherapie": [
      { "lit": "Margraf 2018", "where": "Abschnitte zu verhaltenstherapeutischen Methoden (u. a. Psychoedukation, Exposition, kognitive Umstrukturierung, Problemlösetraining, Entspannungsverfahren) und zur Therapieforschung" },
      { "lit": "Hoyer 2020", "where": "Abschnitt zu Psychotherapieforschung und evidenzbasierter klinisch-psychologischer Intervention" },
      { "oer": "psych", "sec": "16.2" }
    ],
    "Gesundheitsverhalten: Modelle": [
      { "lit": "Schwarzer 2004", "where": "Darstellung der Modelle des Gesundheitsverhaltens (u. a. Health Belief Model, Schutzmotivationstheorie, Theorie des geplanten Verhaltens, Transtheoretisches Modell, HAPA)" },
      { "lit": "Knoll 2017", "where": "Abschnitt zu Theorien des Gesundheitsverhaltens und zur Intentions-Verhaltens-Lücke" },
      { "doi": "10.1111/j.1464-0597.2007.00325.x" }
    ],
    "Stress, Bewältigung und soziale Unterstützung": [
      { "lit": "Lazarus 1984", "where": "Darstellung des transaktionalen Stressmodells (primäre und sekundäre Bewertung) und der Bewältigungsformen (problem- vs. emotionsorientiert)" },
      { "lit": "Knoll 2017", "where": "Abschnitte zu Stress, Stressbewältigung und sozialer Unterstützung" },
      { "oer": "psych", "ch": 14 }
    ],
    "Prävention und Gesundheitsförderung": [
      { "lit": "Renneberg 2006", "where": "Abschnitt zu Prävention und Gesundheitsförderung" },
      { "mat": "Fonds Gesundes Österreich – Gesundheitsförderung" }
    ],
    "Chronische Krankheit, Schmerz und Berufsrecht": [
      { "lit": "Renneberg 2006", "where": "Abschnitte zu chronischen Erkrankungen, Krankheitsbewältigung und Schmerz" }
    ]
  },
  "F2": {
    "Gegenstand und Strukturmodell der Bildungspsychologie": [
      { "lit": "Spiel 2010", "where": "Darstellung von Gegenstand und Strukturmodell der Bildungspsychologie (Bildungsphasen, Handlungsebenen, Handlungsfelder)" }
    ],
    "Lerntheorien und Instruktionsdesign": [
      { "lit": "Schunk 2020", "where": "Darstellung behavioristischer, kognitiver und konstruktivistischer Lerntheorien und ihrer Anwendung im Unterricht" },
      { "lit": "Mayer 2020", "where": "Darstellung der Prinzipien multimedialen Lernens und ihrer kognitiven Grundlagen" },
      { "doi": "10.1207/s15326985ep4102_1" }
    ],
    "Selbstreguliertes Lernen und Lernstrategien": [
      { "lit": "Hasselhorn 2022", "where": "Abschnitt zu Lernstrategien, Metakognition und selbstreguliertem Lernen" },
      { "mat": "The Learning Scientists – Materialien zu evidenzbasierten Lernstrategien" },
      { "doi": "10.1177/1529100612453266" }
    ],
    "Motivation im Bildungskontext": [
      { "lit": "Wild 2020", "where": "Abschnitt zur Lern- und Leistungsmotivation (u. a. Erwartungs-Wert-Theorie, Zielorientierungen, Attribution, Selbstwirksamkeit)" },
      { "doi": "10.1037/0033-295X.84.2.191" },
      { "doi": "10.1207/S15327965PLI1104_01" }
    ],
    "Unterrichtsqualität und Lehrkräfte": [
      { "lit": "Helmke 2015", "where": "Darstellung des Angebots-Nutzungs-Modells und der Merkmale von Unterrichtsqualität, u. a. Klassenführung" },
      { "lit": "Hattie 2013", "where": "Synthese der Metaanalysen zu Einflussfaktoren auf Lernleistung, u. a. Feedback und Lehrer-Schüler-Beziehung" },
      { "doi": "10.3102/003465430298487" }
    ],
    "Begabung, Lernschwierigkeiten und Inklusion": [
      { "lit": "Hasselhorn 2022", "where": "Abschnitte zu Begabung und Hochbegabung sowie zu Lernschwierigkeiten" },
      { "lit": "Woolfolk 2014", "where": "Abschnitt zu Lernenden mit besonderen Bedürfnissen: Hochbegabung, Lernstörungen, ADHS und inklusiver Unterricht" }
    ],
    "Bildungsungleichheit": [
      { "lit": "Woolfolk 2014", "where": "Abschnitt zu sozioökonomischem Status, kultureller Vielfalt und Schulerfolg (u. a. Lehrkrafterwartungen, Stereotype Threat)" },
      { "mat": "OECD PISA – Ergebnisse und Berichte" }
    ],
    "Prävention, Intervention, Evaluation und Bildungsmonitoring": [
      { "lit": "Spiel 2010", "where": "Abschnitte zu Prävention, Intervention, Evaluation und Bildungsmonitoring" },
      { "mat": "IQS – Institut des Bundes für Qualitätssicherung im österreichischen Schulwesen (PISA, PIRLS, iKMPLUS)" },
      { "mat": "OECD PISA – Ergebnisse und Berichte" }
    ],
    "Lebenslanges Lernen, Hochschule und digitale Bildung": [
      { "lit": "Spiel 2010", "where": "Abschnitte zur Hochschul-, Erwachsenen- und Weiterbildung (Bildung über die Lebensspanne)" },
      { "lit": "Mayer 2020", "where": "Darstellung der Gestaltungsprinzipien für multimediale und digitale Lernumgebungen" }
    ]
  },
  "F3": {
    "Geschichte und Menschenbilder der A&O-Psychologie": [
      { "lit": "Kirchler 2011 Arbeits-", "where": "Abschnitt zu Menschenbildern in Organisationen und zur Geschichte der Arbeits- und Organisationspsychologie" },
      { "lit": "Ulich 2011", "where": "Abschnitt zu Scientific Management, Human-Relations-Bewegung und soziotechnischem Systemansatz" },
      { "oer": "psych", "sec": "13.1" }
    ],
    "Arbeitsgestaltung": [
      { "lit": "Ulich 2011", "where": "Abschnitte zu Arbeitsgestaltung, Kriterien humaner Arbeit und Handlungsregulationstheorie" },
      { "lit": "Nerdinger 2019", "where": "Abschnitt zur Arbeitsgestaltung, u. a. Job Characteristics Model" },
      { "doi": "10.1016/0030-5073(76)90016-7" }
    ],
    "Belastung, Beanspruchung, Stress und Gesundheit": [
      { "lit": "Nerdinger 2019", "where": "Abschnitt zu psychischer Belastung und Beanspruchung, Stressmodellen und Gesundheit bei der Arbeit" },
      { "doi": "10.2307/2392498" },
      { "doi": "10.1108/02683940710733115" }
    ],
    "Arbeitsmotivation und Arbeitszufriedenheit": [
      { "lit": "Nerdinger 2019", "where": "Abschnitte zu Theorien der Arbeitsmotivation und zur Arbeitszufriedenheit" },
      { "mat": "OpenStax Organizational Behavior" },
      { "doi": "10.1037/0003-066X.57.9.705" }
    ],
    "Führung": [
      { "lit": "Nerdinger 2019", "where": "Abschnitt zu Führung: Eigenschafts-, Verhaltens- und Kontingenzansätze, transaktionale und transformationale Führung" },
      { "lit": "Robbins 2022", "where": "Abschnitt zu Führungstheorien (u. a. Ohio-Studien, Fiedler, situative Führung, LMX, transformationale Führung)" },
      { "mat": "OpenStax Organizational Behavior" }
    ],
    "Gruppen und Teams in Organisationen": [
      { "lit": "Kauffeld 2019", "where": "Abschnitt zu Gruppen und Teams in Organisationen (Teamentwicklung, Prozessverluste und -gewinne, Konflikte)" },
      { "lit": "Schuler 2014", "where": "Abschnitt zu Gruppenarbeit und Gruppenprozessen in Organisationen" },
      { "mat": "OpenStax Organizational Behavior" }
    ],
    "Organisationskultur, -entwicklung und Change": [
      { "lit": "Nerdinger 2019", "where": "Abschnitte zu Organisationskultur und Organisationsentwicklung" },
      { "lit": "Robbins 2022", "where": "Abschnitte zu Organisationskultur und organisationalem Wandel (u. a. Lewin, Kotter, Widerstand gegen Veränderung)" },
      { "mat": "OpenStax Organizational Behavior" }
    ],
    "Personalpsychologie": [
      { "lit": "Kauffeld 2019", "where": "Abschnitte zu Personalauswahl, Personalentwicklung und Leistungsbeurteilung" },
      { "oer": "psych", "sec": "13.2" },
      { "doi": "10.1037/0033-2909.124.2.262" }
    ],
    "Wirtschaftspsychologie: Entscheiden, Geld, Steuern": [
      { "lit": "Kirchler 2011 Wirtschaftspsychologie", "where": "Abschnitte zu ökonomischen Entscheidungen, Geld und Steuerverhalten" },
      { "lit": "Thaler 2018", "where": "Darstellung verhaltensökonomischer Befunde (u. a. Besitztumseffekt, mentale Kontoführung, Sunk Costs, Nudging)" },
      { "mat": "Kirchler, Hoelzl & Wahl (2008): Enforced versus voluntary tax compliance: The slippery slope framework – Volltext suchen" }
    ],
    "Konsumenten-, Markt- und Werbepsychologie": [
      { "lit": "Felser 2015", "where": "Darstellung von Kaufentscheidungen, Werbewirkung und Einstellungsänderung durch Werbung" },
      { "lit": "Kirchler 2011 Wirtschaftspsychologie", "where": "Abschnitt zum Konsumentenverhalten" },
      { "doi": "10.1016/S0065-2601(08)60214-2" }
    ]
  },
  "G1": {
    "Kommunikationsmodelle": [
      { "lit": "Watzlawick 1969", "where": "Abschnitt zu den pragmatischen Axiomen der menschlichen Kommunikation (Inhalts- und Beziehungsaspekt, Interpunktion, digitale/analoge Kommunikation, symmetrische/komplementäre Interaktion)" },
      { "lit": "Schulz 1981", "where": "Darstellung des Vier-Seiten-Modells einer Nachricht und des Empfangens mit „vier Ohren“" },
      { "mat": "Schulz von Thun Institut – Modelle (Vier-Seiten-Modell, Inneres Team)" }
    ],
    "Personzentrierte Grundhaltungen": [
      { "lit": "Weinberger 2013", "where": "Ausführungen zu den personzentrierten Grundhaltungen Empathie, bedingungslose Wertschätzung und Echtheit/Kongruenz" },
      { "oer": "psych", "sec": "16.2" },
      { "doi": "10.1037/h0045357" }
    ],
    "Aktives Zuhören und Gesprächstechniken": [
      { "lit": "Weinberger 2013", "where": "Ausführungen zu aktivem Zuhören, Paraphrasieren und Verbalisieren emotionaler Erlebnisinhalte" },
      { "lit": "Bamberger 2015", "where": "Abschnitte zu lösungsorientierten Fragetechniken wie Skalierungsfragen" },
      { "mat": "Aktives Zuhören & Gesprächsführung – Übungsvideos (YouTube-Suche)" }
    ],
    "Struktur eines Beratungs- und Erstgesprächs": [
      { "lit": "Kanfer 2012", "where": "Abschnitt zum Phasenmodell des Beratungs- und Therapieprozesses (Eingangsphase, Rollenklärung, Zielklärung, Planung, Evaluation)" },
      { "lit": "Benien 2015", "where": "Ausführungen zu Ablauf und Gestaltung von Beratungsgesprächen" }
    ],
    "Motivierende Gesprächsführung (Motivational Interviewing)": [
      { "lit": "Miller 2015", "where": "Darstellung von Haltung (Spirit), Prozessen, OARS-Techniken sowie Change Talk und Sustain Talk" },
      { "mat": "Motivational Interviewing Network of Trainers (MINT) – Ressourcen" },
      { "mat": "Motivational Interviewing – Demonstrationen (YouTube-Suche)" }
    ],
    "Lösungs- und ressourcenorientierte Techniken": [
      { "lit": "Bamberger 2015", "where": "Ausführungen zu lösungsorientierten Interventionen wie Wunderfrage, Ausnahme-, Skalierungs- und Bewältigungsfragen" },
      { "mat": "Lösungsorientierte Beratung – Wunderfrage (YouTube-Suche)" }
    ],
    "Schwierige Situationen: Krise, Suizidalität, Ärger": [
      { "lit": "Benien 2015", "where": "Ausführungen zu Konfliktgesprächen und zum Umgang mit Ärger und Vorwürfen" },
      { "mat": "WHO – Psychological First Aid: Guide for Field Workers (frei als PDF)" }
    ],
    "Feedback, Selbstreflexion und professionelle Grenzen": [
      { "lit": "Benien 2015", "where": "Ausführungen zu Kritik- und Feedbackgesprächen" },
      { "lit": "Sachse 2006", "where": "Ausführungen zur Gestaltung und Reflexion der professionellen Beziehung zwischen beratender Person und Klient:in" }
    ]
  },
  "G2": {
    "Modelle der Wissenschaftskommunikation": [
      { "lit": "Bonfadelli 2017", "where": "Abschnitte zu Modellen der Wissenschaftskommunikation (Defizit-, Dialog- und Partizipationsmodell) und zum Vertrauen in Wissenschaft" },
      { "mat": "Wissenschaft im Dialog – Wissenschaftskommunikation (inkl. Wissenschaftsbarometer)" }
    ],
    "Für Laien schreiben – ohne zu übertreiben": [
      { "lit": "Könneker 2012", "where": "Ausführungen zum allgemeinverständlichen Schreiben über Forschung, etwa in Pressemitteilungen und populären Texten" },
      { "lit": "Pinker 2014", "where": "Ausführungen zu klarem, verständlichem Schreiben für ein nicht fachkundiges Publikum" },
      { "mat": "Sumner et al. (2014): The association between exaggeration in health related science news and academic press releases – Volltext suchen" }
    ],
    "Präsentieren": [
      { "lit": "Alley 2013", "where": "Ausführungen zu Aufbau wissenschaftlicher Vorträge und zur Foliengestaltung mit Aussage-Überschriften" },
      { "mat": "How to give a great research talk (YouTube-Suche)" }
    ],
    "Datenvisualisierung": [
      { "lit": "Wilke 2019", "where": "Abschnitte zur Darstellung von Verteilungen und Unsicherheit, zu Farbwahl und zu irreführenden Achsen" },
      { "lit": "Gigerenzer 2013", "where": "Ausführungen zur verständlichen Risikokommunikation mit natürlichen Häufigkeiten" },
      { "mat": "Fundamentals of Data Visualization (Claus Wilke, frei online)" }
    ],
    "Fehlinformation und Medienarbeit": [
      { "lit": "Könneker 2012", "where": "Ausführungen zur Medienarbeit, etwa zum Umgang mit Journalist:innen und zu Interviews" },
      { "mat": "The Debunking Handbook 2020 (Lewandowsky et al., frei, auch auf Deutsch)" },
      { "mat": "Bad News Game – Prebunking spielerisch (Cambridge)" }
    ],
    "Orientierungspraktikum: Berufsfelder und Platzsuche": [
      { "oer": "psych", "sec": "1.4" },
      { "mat": "BÖP – Berufsfelder und Praktikumsinformationen" },
      { "mat": "StudienServiceCenter Psychologie – Infos zu Praktikum und Anrechnung" }
    ],
    "Rolle und Ethik als Praktikant:in": [
      { "mat": "StudienServiceCenter Psychologie – Infos zu Praktikum und Anrechnung" },
      { "mat": "BÖP – Berufsfelder und Praktikumsinformationen" }
    ],
    "Praktikumsbericht und Reflexion": [
      { "mat": "StudienServiceCenter Psychologie – Infos zu Praktikum und Anrechnung" }
    ]
  },
  "H1": {
    "Von der Themenidee zur Forschungsfrage": [
      { "lit": "Kornmeier 2021", "where": "Ausführungen zur Themenfindung, Eingrenzung des Themas und Formulierung der Fragestellung" },
      { "lit": "Eco 2010", "where": "Abschnitt zur Wahl und Eingrenzung des Themas einer Abschlussarbeit" }
    ],
    "Recherche in Fachdatenbanken": [
      { "lit": "Theisen 2017", "where": "Ausführungen zur Literaturrecherche und Materialsuche" },
      { "mat": "PubPsych (ZPID) – frei zugängliche Literaturdatenbank" },
      { "mat": "u:search – Universitätsbibliothek Wien" }
    ],
    "Literaturverwaltung und Lesestrategie": [
      { "lit": "Theisen 2017", "where": "Ausführungen zum Lesen, Exzerpieren und Verwalten von Literatur" },
      { "mat": "Zotero – Literaturverwaltung (frei)" }
    ],
    "Arten von Übersichtsarbeiten": [
      { "lit": "Borenstein 2021", "where": "Abschnitte zu Fixed- vs. Random-Effects-Modellen, Heterogenität (I²) und Publikationsbias" },
      { "mat": "PRISMA 2020 Statement & Flussdiagramm" },
      { "mat": "Coursera – Introduction to Systematic Review and Meta-Analysis (Johns Hopkins)" }
    ],
    "Studien kritisch bewerten": [
      { "oer": "psych", "sec": "2.3" },
      { "doi": "10.1371/journal.pmed.0020124" },
      { "doi": "10.1038/nrn3475" }
    ],
    "Synthetisieren und Argumentieren": [
      { "lit": "Kornmeier 2021", "where": "Ausführungen zu Argumentation, Gliederung und Aufbau wissenschaftlicher Texte" },
      { "lit": "American 2020", "where": "Abschnitt zu klarem, präzisem wissenschaftlichem Schreibstil" }
    ],
    "Zitieren nach APA 7 und gute wissenschaftliche Praxis": [
      { "lit": "American 2020", "where": "Abschnitte zu Zitationen im Text, Literaturverzeichnis-Einträgen und zur Vermeidung von Plagiaten" },
      { "mat": "APA Style – Referenzbeispiele" },
      { "mat": "Österreichische Agentur für wissenschaftliche Integrität (ÖAWI)" }
    ],
    "Exposé schreiben": [
      { "lit": "Kornmeier 2021", "where": "Ausführungen zur Planung einer Abschlussarbeit (Exposé, Gliederung, Zeitplan)" },
      { "lit": "Theisen 2017", "where": "Ausführungen zur Planung und Vorbereitung einer Bachelor- oder Masterarbeit" }
    ]
  },
  "H2": {
    "Projektplanung und Betreuung": [
      { "lit": "Esselborn-Krumbiegel 2017", "where": "Ausführungen zur Planung des Arbeitsprozesses von der Themenfindung bis zum fertigen Text" },
      { "mat": "StudienServiceCenter Psychologie – Bachelorarbeit & Abschluss" }
    ],
    "Ethik, Datenschutz und Präregistrierung": [
      { "lit": "Döring 2023", "where": "Abschnitte zu Forschungsethik, informierter Einwilligung und Datenschutz" },
      { "mat": "Ethikkommission der Universität Wien" },
      { "doi": "10.1073/pnas.1708274114" }
    ],
    "Datenerhebung und -management": [
      { "lit": "Döring 2023", "where": "Abschnitte zu Datenerhebung, Stichprobenziehung und Datenaufbereitung" },
      { "lit": "Luhmann 2020", "where": "Ausführungen zur skriptbasierten Datenaufbereitung in R" },
      { "mat": "OSF – Präregistrierung und Projektverwaltung" }
    ],
    "Datenanalyse": [
      { "lit": "Field 2012", "where": "Abschnitte zu Testwahl, Voraussetzungsprüfung und Effektgrößen" },
      { "mat": "Lakens – Improving Your Statistical Inferences (Äquivalenztests, Power)" },
      { "doi": "10.1177/0956797613504966" }
    ],
    "Aufbau und Schreiben der Arbeit": [
      { "lit": "American 2020", "where": "Abschnitte zu Aufbau und Berichtsstandards empirischer Arbeiten (Abstract, Einleitung, Methode, Ergebnisse, Diskussion)" },
      { "lit": "Bem 2004", "where": "Anleitung zum Aufbau und Schreiben eines empirischen Artikels" },
      { "mat": "APA Style – Student Paper Sample" }
    ],
    "Umgang mit Nullbefunden und Problemen": [
      { "lit": "Döring 2023", "where": "Ausführungen zu fragwürdigen Forschungspraktiken und Open-Science-Prinzipien" },
      { "mat": "Lakens – Improving Your Statistical Inferences (Äquivalenztests, Power)" },
      { "doi": "10.1177/0956797611417632" }
    ]
  },
  "W1": {
    "Regeln und Möglichkeiten des Wahlbereichs": [
      { "mat": "Mitteilungsblatt 2023/24 Nr. 84 – 1. Änderung des Curriculums (W1a–W1c)" },
      { "mat": "Universität Wien – Studieren: Erweiterungscurricula (Informationen)" },
      { "mat": "StudienServiceCenter Psychologie – Wahlbereich & Anerkennung" }
    ],
    "Empfehlungen nach Berufsziel": [
      { "mat": "u:find – Erweiterungscurricula im Vorlesungsverzeichnis" },
      { "mat": "Universität Wien – Studieren: Erweiterungscurricula (Informationen)" }
    ],
    "Psychologie International: Auslandssemester": [
      { "mat": "Universität Wien – Internationales / Erasmus+ (Studierendenmobilität)" },
      { "mat": "StudienServiceCenter Psychologie – Wahlbereich & Anerkennung" },
      { "mat": "Mitteilungsblatt 2023/24 Nr. 84 – 1. Änderung des Curriculums (W1a–W1c)" }
    ],
    "Interdisziplinäres Denken: Beispiele": [
      { "lit": "Gazzaniga 2012", "where": "Ausführungen zu Bewusstsein und Willensfreiheit aus neurowissenschaftlicher Sicht" },
      { "lit": "Kahneman 2012", "where": "Ausführungen zu Urteilsheuristiken und Verhaltensökonomie" },
      { "mat": "Yale – Philosophy and the Science of Human Nature (Tamar Gendler)" }
    ]
  },
  "W1a": {
    "Psychotherapie: Definition und Rahmen in Österreich": [
      { "lit": "Kriz 2014", "where": "Überblick über die großen psychotherapeutischen Grundorientierungen (psychodynamisch, humanistisch, systemisch, verhaltenstherapeutisch)" },
      { "mat": "RIS – Psychotherapiegesetz (Suche)" },
      { "mat": "Österreichisches Gesundheitsministerium – Psychotherapie (Berufsrecht, Liste, Ausbildung)" }
    ],
    "Verfahrensvergleich": [
      { "lit": "Kriz 2014", "where": "Darstellung der Grundkonzepte psychodynamischer, verhaltenstherapeutischer, humanistischer und systemischer Verfahren" },
      { "oer": "psych", "sec": "16.2" },
      { "mat": "Noba Project – Modul „Therapeutic Orientations“" }
    ],
    "Psychotherapieforschung": [
      { "lit": "Lambert 2013", "where": "Abschnitte zu Wirksamkeit, Prozess- und Ergebnisforschung sowie zu Therapeuteneffekten" },
      { "lit": "Wampold 2015", "where": "Ausführungen zu Vergleichsstudien, Dodo-Bird-Verdict, Allegiance- und Therapeuteneffekten" },
      { "doi": "10.1037/0003-066X.32.9.752" }
    ],
    "Wirkfaktoren und therapeutische Beziehung": [
      { "lit": "Wampold 2015", "where": "Darstellung des kontextuellen Modells und der Evidenz zu allgemeinen vs. spezifischen Wirkfaktoren" },
      { "lit": "Grawe 2000", "where": "Ausführungen zu den allgemeinen Wirkfaktoren (Ressourcenaktivierung, Problemaktualisierung, Problembewältigung, motivationale Klärung)" },
      { "doi": "10.1002/wps.20238" }
    ],
    "Ethik, Risiken und Nebenwirkungen": [
      { "lit": "Lambert 2013", "where": "Abschnitte zu Verschlechterungen und negativen Effekten von Psychotherapie" },
      { "mat": "Österreichisches Gesundheitsministerium – Psychotherapie (Berufsrecht, Liste, Ausbildung)" },
      { "mat": "RIS – Psychotherapiegesetz (Suche)" }
    ]
  }
};
