/* AUTOMATISCH ERZEUGT von tools/make-datasets.mjs – nicht von Hand bearbeiten (npm run datasets). */
PP.datasets = [
 {
  "id": "lernstudie",
  "title": "Lernstudie: Lernzeit, Methode und Prüfungsleistung",
  "file": "data/datasets/lernstudie.csv",
  "modules": [
   "D1",
   "B3",
   "H2"
  ],
  "description": "Fiktive Studie mit 80 Studierenden: Lernmethode (Abrufübung vs. Wiederlesen), Lernzeit pro Woche, Schlafdauer, Prüfungsangst und Punkte in der Klausur.",
  "variables": [
   [
    "id",
    "Personennummer",
    "nominal"
   ],
   [
    "methode",
    "Lernmethode: abruf / lesen",
    "nominal"
   ],
   [
    "lernzeit",
    "Lernstunden pro Woche",
    "Verhältnis"
   ],
   [
    "schlaf",
    "durchschnittliche Schlafdauer in Stunden",
    "Verhältnis"
   ],
   [
    "angst",
    "Prüfungsangst, Skalenmittel 1–5",
    "Intervall"
   ],
   [
    "punkte",
    "Klausurpunkte 0–100",
    "Intervall"
   ]
  ],
  "tasks": [
   {
    "q": "Berechne Mittelwert und Standardabweichung der Klausurpunkte.",
    "hint": "jamovi: Exploration → Deskriptive Statistik. R: mean(d$punkte); sd(d$punkte)",
    "results": [
     {
      "label": "M",
      "value": 54.725,
      "d": 2
     },
     {
      "label": "SD",
      "value": 12.22052123440348,
      "d": 2
     }
    ]
   },
   {
    "q": "Wie hängen Lernzeit und Klausurpunkte zusammen? (Pearson-Korrelation mit Signifikanztest)",
    "hint": "jamovi: Regression → Korrelationsmatrix. R: cor.test(d$lernzeit, d$punkte)",
    "results": [
     {
      "label": "r",
      "value": 0.7038293770198149,
      "d": 3
     },
     {
      "label": "t",
      "value": 8.750455302272977,
      "d": 2
     },
     {
      "label": "df",
      "value": 78,
      "d": 0
     },
     {
      "label": "p",
      "value": 3.291698542921568e-13,
      "d": 3,
      "p": true
     }
    ]
   },
   {
    "q": "Unterscheiden sich die Lernmethoden in den Klausurpunkten? (t-Test für unabhängige Stichproben, gleiche Varianzen angenommen; Differenz abruf − lesen)",
    "hint": "jamovi: T-Tests → t-Test für unabhängige Stichproben, Effektgröße anhaken. R: t.test(punkte ~ methode, data = d, var.equal = TRUE)",
    "results": [
     {
      "label": "M abruf",
      "value": 60.15,
      "d": 2
     },
     {
      "label": "M lesen",
      "value": 49.3,
      "d": 2
     },
     {
      "label": "t",
      "value": 4.409867543588893,
      "d": 2
     },
     {
      "label": "df",
      "value": 78,
      "d": 0
     },
     {
      "label": "p",
      "value": 0.00003270335905238003,
      "d": 3,
      "p": true
     },
     {
      "label": "Cohens d",
      "value": 0.9860763599234781,
      "d": 2
     }
    ]
   },
   {
    "q": "Sage die Klausurpunkte aus der Lernzeit vorher (einfache lineare Regression).",
    "hint": "jamovi: Regression → Lineare Regression. R: summary(lm(punkte ~ lernzeit, data = d))",
    "results": [
     {
      "label": "Achsenabschnitt a",
      "value": 32.42810282520594,
      "d": 2
     },
     {
      "label": "Steigung b",
      "value": 2.9241832360385653,
      "d": 3
     },
     {
      "label": "R²",
      "value": 0.49537579195610065,
      "d": 3
     }
    ]
   },
   {
    "q": "Multiple Regression: punkte ~ lernzeit + angst + schlaf. Gib die unstandardisierten Koeffizienten und R² an.",
    "hint": "R: summary(lm(punkte ~ lernzeit + angst + schlaf, data = d))",
    "results": [
     {
      "label": "Achsenabschnitt",
      "value": 28.537181153753714,
      "d": 2
     },
     {
      "label": "b lernzeit",
      "value": 2.8748461784958863,
      "d": 3
     },
     {
      "label": "b angst",
      "value": -4.560176354863564,
      "d": 3
     },
     {
      "label": "b schlaf",
      "value": 2.4019500995381478,
      "d": 3
     },
     {
      "label": "R²",
      "value": 0.6111270100955826,
      "d": 3
     }
    ]
   }
  ],
  "n": 80,
  "columns": [
   "id",
   "methode",
   "lernzeit",
   "schlaf",
   "angst",
   "punkte"
  ],
  "csv": "id,methode,lernzeit,schlaf,angst,punkte\n1,abruf,3.9,7.6,3.3,42\n2,abruf,8.1,7.9,2.5,66\n3,abruf,6.1,7.2,2.5,61\n4,abruf,2.3,6.6,2.6,48\n5,abruf,11.6,6.9,1.7,87\n6,abruf,9.1,6.9,3.7,63\n7,abruf,10.9,6.1,3.2,64\n8,abruf,9.1,8.3,2.5,75\n9,abruf,12.2,7.3,3.6,61\n10,abruf,5.4,6.8,3.8,58\n11,abruf,6.5,6.1,3,52\n12,abruf,12.6,6.9,2.3,68\n13,abruf,3.3,7.6,1.3,53\n14,abruf,3.2,7,2.5,36\n15,abruf,3.7,7.5,2.8,35\n16,abruf,10.7,7.7,1.9,82\n17,abruf,12.2,5.9,2.6,67\n18,abruf,5.4,7.9,2.2,58\n19,abruf,9.9,7.1,2.3,73\n20,abruf,7.4,8.9,3.1,61\n21,abruf,9.6,7.1,2.7,62\n22,abruf,8.5,7.6,3.3,65\n23,abruf,7.7,7.1,2.4,63\n24,abruf,8,7.6,2,56\n25,abruf,4.1,6.4,2.5,46\n26,abruf,5.6,6.2,2.3,61\n27,abruf,7,5.3,3.4,48\n28,abruf,12.9,7.8,1.6,72\n29,abruf,6.2,6.7,3.5,45\n30,abruf,8.6,7.2,1,74\n31,abruf,7.7,8.2,1.6,65\n32,abruf,12.2,8.2,3.3,63\n33,abruf,7.9,6.5,2.9,56\n34,abruf,8,7.8,2.6,58\n35,abruf,12,6.6,3.9,79\n36,abruf,11.6,6.2,3.6,59\n37,abruf,5.8,5.2,3.9,42\n38,abruf,7.7,6.3,1.4,62\n39,abruf,7.1,7.1,2.8,60\n40,abruf,7,7.8,2.9,60\n41,lesen,11.2,6.2,3.3,51\n42,lesen,5.7,7,2.7,52\n43,lesen,0.5,6.5,2.3,35\n44,lesen,2.3,7,3.7,34\n45,lesen,8.5,6.9,2.5,54\n46,lesen,2.9,8.9,2.7,44\n47,lesen,8.5,7.9,2.9,48\n48,lesen,9.5,7.1,2.7,61\n49,lesen,8.2,6.2,3.1,40\n50,lesen,3.5,5.5,3.4,39\n51,lesen,5.5,5.1,2.2,43\n52,lesen,11.8,7.1,2.3,57\n53,lesen,6.3,6.2,1.8,47\n54,lesen,9.6,6.3,3.6,43\n55,lesen,5.8,7.1,3.3,44\n56,lesen,5.2,7.6,2,35\n57,lesen,11.3,4.6,3,60\n58,lesen,5.8,7.9,3.3,49\n59,lesen,11.9,8.1,3,68\n60,lesen,7.9,6.8,2.5,46\n61,lesen,6.5,5.9,2.8,51\n62,lesen,10.5,7.6,3.5,67\n63,lesen,4.5,6.4,3.2,49\n64,lesen,9.5,7.1,2.7,56\n65,lesen,7,7.2,2.9,50\n66,lesen,4.6,6.9,2.7,28\n67,lesen,11,8.2,1.1,70\n68,lesen,3.2,7,3.8,31\n69,lesen,4.8,6.5,1.7,54\n70,lesen,10.2,6,2.2,55\n71,lesen,8.4,7,3.1,47\n72,lesen,10.2,7.9,3,55\n73,lesen,6.5,8.7,2.1,44\n74,lesen,11.5,5.5,2.6,57\n75,lesen,7.8,6.7,3.3,46\n76,lesen,4.7,8.8,2.6,59\n77,lesen,7.6,5.7,3.3,40\n78,lesen,2.9,7.3,4.3,37\n79,lesen,9.6,5.8,2.9,61\n80,lesen,8.3,6.6,1.9,65\n"
 },
 {
  "id": "achtsamkeit",
  "title": "Achtsamkeitstraining: Prä-Post mit Wartekontrollgruppe",
  "file": "data/datasets/achtsamkeit.csv",
  "modules": [
   "D1",
   "F1"
  ],
  "description": "Fiktive Evaluationsstudie: 20 Personen nehmen an einem achtwöchigen Achtsamkeitstraining teil, 20 sind auf der Warteliste. Stress wurde vor und nach dem Zeitraum erhoben (Skala 10–40).",
  "variables": [
   [
    "id",
    "Personennummer",
    "nominal"
   ],
   [
    "gruppe",
    "training / warteliste",
    "nominal"
   ],
   [
    "stress_prae",
    "Stress vor dem Training",
    "Intervall"
   ],
   [
    "stress_post",
    "Stress nach dem Training",
    "Intervall"
   ]
  ],
  "tasks": [
   {
    "q": "Hat sich der Stress in der Trainingsgruppe verändert? (t-Test für abhängige Stichproben, Differenz prä − post)",
    "hint": "jamovi: T-Tests → t-Test für verbundene Stichproben (nur Trainingsgruppe filtern). R: with(subset(d, gruppe == 'training'), t.test(stress_prae, stress_post, paired = TRUE))",
    "results": [
     {
      "label": "M prä",
      "value": 27.5,
      "d": 2
     },
     {
      "label": "M post",
      "value": 22.85,
      "d": 2
     },
     {
      "label": "t",
      "value": 6.532403302838261,
      "d": 2
     },
     {
      "label": "df",
      "value": 19,
      "d": 0
     },
     {
      "label": "p",
      "value": 0.000002953398416732955,
      "d": 3,
      "p": true
     },
     {
      "label": "d_z",
      "value": 1.4606897841590496,
      "d": 2
     }
    ]
   },
   {
    "q": "Ist die Veränderung in der Trainingsgruppe größer als auf der Warteliste? (Differenzwerte prä − post bilden, t-Test für unabhängige Stichproben)",
    "hint": "jamovi: Daten → neue berechnete Variable diff = stress_prae − stress_post. R: d$diff <- d$stress_prae - d$stress_post; t.test(diff ~ gruppe, data = d, var.equal = TRUE)",
    "results": [
     {
      "label": "M Differenz training",
      "value": 4.65,
      "d": 2
     },
     {
      "label": "M Differenz warteliste",
      "value": 3,
      "d": 2
     },
     {
      "label": "t",
      "value": 1.198239635868819,
      "d": 2
     },
     {
      "label": "df",
      "value": 38,
      "d": 0
     },
     {
      "label": "p",
      "value": 0.2382438166795725,
      "d": 3,
      "p": true
     },
     {
      "label": "Cohens d",
      "value": 0.37891664320362595,
      "d": 2
     }
    ]
   }
  ],
  "n": 40,
  "columns": [
   "id",
   "gruppe",
   "stress_prae",
   "stress_post"
  ],
  "csv": "id,gruppe,stress_prae,stress_post\n1,training,30,20\n2,training,15,10\n3,training,30,22\n4,training,28,23\n5,training,33,25\n6,training,27,24\n7,training,33,27\n8,training,31,26\n9,training,22,21\n10,training,24,22\n11,training,31,23\n12,training,28,20\n13,training,33,26\n14,training,23,24\n15,training,24,17\n16,training,27,27\n17,training,31,29\n18,training,21,17\n19,training,32,32\n20,training,27,22\n21,warteliste,25,28\n22,warteliste,29,29\n23,warteliste,34,40\n24,warteliste,29,26\n25,warteliste,26,26\n26,warteliste,22,24\n27,warteliste,32,28\n28,warteliste,27,14\n29,warteliste,37,22\n30,warteliste,21,17\n31,warteliste,29,21\n32,warteliste,30,30\n33,warteliste,20,15\n34,warteliste,27,29\n35,warteliste,21,16\n36,warteliste,26,22\n37,warteliste,27,25\n38,warteliste,34,32\n39,warteliste,26,17\n40,warteliste,33,34\n"
 },
 {
  "id": "therapie",
  "title": "Psychotherapiestudie: drei Bedingungen",
  "file": "data/datasets/therapie.csv",
  "modules": [
   "D1",
   "F1"
  ],
  "description": "Fiktive randomisierte Studie mit 45 Personen mit depressiver Symptomatik: kognitive Verhaltenstherapie (kvt), interpersonelle Therapie (ipt) oder Warteliste. Depressivität vor und nach 16 Wochen (BDI-II-ähnlicher Summenwert 0–63).",
  "variables": [
   [
    "id",
    "Personennummer",
    "nominal"
   ],
   [
    "bedingung",
    "kvt / ipt / warteliste",
    "nominal"
   ],
   [
    "bdi_prae",
    "Depressivität vorher",
    "Intervall"
   ],
   [
    "bdi_post",
    "Depressivität nachher",
    "Intervall"
   ]
  ],
  "tasks": [
   {
    "q": "Berechne die Mittelwerte von bdi_post je Bedingung.",
    "hint": "jamovi: Deskriptive Statistik, aufgeteilt nach bedingung. R: aggregate(bdi_post ~ bedingung, data = d, mean)",
    "results": [
     {
      "label": "M kvt",
      "value": 13.733333333333333,
      "d": 2
     },
     {
      "label": "M ipt",
      "value": 16.666666666666668,
      "d": 2
     },
     {
      "label": "M warteliste",
      "value": 22.866666666666667,
      "d": 2
     }
    ]
   },
   {
    "q": "Unterscheiden sich die Bedingungen in bdi_post? (einfaktorielle Varianzanalyse)",
    "hint": "jamovi: ANOVA → einfaktorielle ANOVA (Fisher), Post-hoc Tukey. R: summary(aov(bdi_post ~ bedingung, data = d)); TukeyHSD(aov(...))",
    "results": [
     {
      "label": "F",
      "value": 5.746029082774051,
      "d": 2
     },
     {
      "label": "df1",
      "value": 2,
      "d": 0
     },
     {
      "label": "df2",
      "value": 42,
      "d": 0
     },
     {
      "label": "p",
      "value": 0.006225290624807427,
      "d": 3,
      "p": true
     },
     {
      "label": "η²",
      "value": 0.214836717068958,
      "d": 3
     }
    ]
   },
   {
    "q": "Prüfe dasselbe nonparametrisch (Kruskal-Wallis-Test).",
    "hint": "jamovi: ANOVA → Nonparametrisch → Kruskal-Wallis. R: kruskal.test(bdi_post ~ bedingung, data = d)",
    "results": [
     {
      "label": "H (χ²)",
      "value": 9.874975845410631,
      "d": 2
     },
     {
      "label": "df",
      "value": 2,
      "d": 0
     },
     {
      "label": "p",
      "value": 0.0071725939381502846,
      "d": 3,
      "p": true
     }
    ]
   }
  ],
  "n": 45,
  "columns": [
   "id",
   "bedingung",
   "bdi_prae",
   "bdi_post"
  ],
  "csv": "id,bedingung,bdi_prae,bdi_post\n1,kvt,32,19\n2,kvt,26,13\n3,kvt,22,13\n4,kvt,25,9\n5,kvt,28,20\n6,kvt,31,15\n7,kvt,36,14\n8,kvt,20,8\n9,kvt,18,8\n10,kvt,24,14\n11,kvt,23,14\n12,kvt,24,9\n13,kvt,26,12\n14,kvt,21,2\n15,kvt,40,36\n16,ipt,29,18\n17,ipt,28,19\n18,ipt,25,16\n19,ipt,32,30\n20,ipt,21,16\n21,ipt,29,20\n22,ipt,23,9\n23,ipt,25,21\n24,ipt,30,13\n25,ipt,24,12\n26,ipt,28,20\n27,ipt,28,17\n28,ipt,26,18\n29,ipt,15,3\n30,ipt,20,18\n31,warteliste,34,33\n32,warteliste,14,23\n33,warteliste,29,28\n34,warteliste,33,37\n35,warteliste,19,9\n36,warteliste,26,18\n37,warteliste,22,17\n38,warteliste,21,20\n39,warteliste,14,12\n40,warteliste,26,31\n41,warteliste,31,34\n42,warteliste,21,19\n43,warteliste,17,16\n44,warteliste,25,30\n45,warteliste,23,16\n"
 },
 {
  "id": "fragebogen",
  "title": "Skalenanalyse: Fragebogen zur Selbstwirksamkeit",
  "file": "data/datasets/fragebogen.csv",
  "modules": [
   "D2",
   "C4"
  ],
  "description": "Fiktive Erhebung mit 150 Personen: sechs Items einer Selbstwirksamkeitsskala (1 = trifft nicht zu … 5 = trifft zu), Items 3 und 5 sind negativ formuliert. Außenkriterium: Lebenszufriedenheit (1–7).",
  "variables": [
   [
    "id",
    "Personennummer",
    "nominal"
   ],
   [
    "i1 … i6",
    "Items 1–6 (1–5); i3 und i5 negativ gepolt",
    "ordinal/intervall"
   ],
   [
    "zufriedenheit",
    "Lebenszufriedenheit 1–7",
    "Intervall"
   ]
  ],
  "tasks": [
   {
    "q": "Pole i3 und i5 um (neu = 6 − alt) und berechne Cronbachs α der sechs Items.",
    "hint": "jamovi: Faktor → Reliabilitätsanalyse, i3 und i5 als „umgekehrt kodiert“ markieren. R: psych::alpha(d[, paste0('i', 1:6)], keys = c(1, 1, -1, 1, -1, 1))",
    "results": [
     {
      "label": "Cronbachs α",
      "value": 0.8594783946589372,
      "d": 3
     }
    ]
   },
   {
    "q": "Wie groß wäre α, wenn man die Umpolung vergisst? Was lernst du daraus?",
    "hint": "Reliabilitätsanalyse ohne Umkehrung rechnen.",
    "results": [
     {
      "label": "α ohne Umpolung",
      "value": -0.5833165467625925,
      "d": 3
     }
    ]
   },
   {
    "q": "Berechne die part-whole-korrigierten Trennschärfen (nach Umpolung).",
    "hint": "jamovi: Reliabilitätsanalyse → Item-Statistiken → „Item-Rest-Korrelation“. R: psych::alpha(...)$item.stats$r.drop",
    "results": [
     {
      "label": "r_it i1",
      "value": 0.6828218343809126,
      "d": 3
     },
     {
      "label": "r_it i2",
      "value": 0.6888987704389178,
      "d": 3
     },
     {
      "label": "r_it i3",
      "value": 0.715387845525941,
      "d": 3
     },
     {
      "label": "r_it i4",
      "value": 0.5602282822736849,
      "d": 3
     },
     {
      "label": "r_it i5",
      "value": 0.6796697417381754,
      "d": 3
     },
     {
      "label": "r_it i6",
      "value": 0.5771265041290128,
      "d": 3
     }
    ]
   },
   {
    "q": "Kriteriumsvalidität: Korrelation des Skalenmittelwerts (nach Umpolung) mit der Lebenszufriedenheit.",
    "hint": "Skalenmittel als neue Variable berechnen, dann korrelieren.",
    "results": [
     {
      "label": "r",
      "value": 0.6813124591355848,
      "d": 3
     }
    ]
   }
  ],
  "n": 150,
  "columns": [
   "id",
   "i1",
   "i2",
   "i3",
   "i4",
   "i5",
   "i6",
   "zufriedenheit"
  ],
  "csv": "id,i1,i2,i3,i4,i5,i6,zufriedenheit\n1,2,4,3,4,4,3,4.5\n2,2,2,4,2,4,2,4.3\n3,3,2,2,4,4,3,3.8\n4,4,5,1,4,1,5,6.3\n5,3,3,2,1,4,3,3\n6,3,2,3,3,3,3,3.9\n7,3,2,4,4,4,3,4.8\n8,5,5,2,4,3,5,4.3\n9,4,4,2,3,3,4,4.3\n10,4,4,4,4,3,2,3.9\n11,3,5,1,3,3,3,3.4\n12,3,3,3,3,3,4,4.4\n13,4,2,3,2,5,2,4.2\n14,5,5,1,5,1,3,5.6\n15,1,2,4,4,4,3,2.1\n16,3,3,3,4,3,4,6\n17,4,3,3,2,4,2,5\n18,2,2,4,1,3,2,3.2\n19,2,3,3,4,3,3,2.6\n20,3,4,3,4,2,4,7\n21,4,5,2,2,3,4,3.9\n22,3,3,2,3,4,4,5.4\n23,5,5,1,4,2,5,6\n24,4,2,3,3,3,2,3.7\n25,1,2,3,3,3,3,4.4\n26,2,4,3,3,2,4,4.8\n27,2,3,4,4,3,4,4.5\n28,2,1,5,2,4,1,4.1\n29,1,3,5,2,4,4,1.2\n30,5,3,1,3,1,4,5.4\n31,4,4,2,4,3,4,4.2\n32,3,2,2,3,2,4,3.9\n33,2,3,2,3,4,2,3.5\n34,5,4,3,4,2,4,5.3\n35,3,2,4,2,3,2,3.3\n36,4,3,4,3,3,2,4.6\n37,3,4,4,3,4,2,2.8\n38,4,3,2,4,2,4,5.5\n39,1,1,5,2,5,3,1.8\n40,2,4,4,4,4,2,3.2\n41,2,3,4,4,4,3,3.4\n42,4,2,4,2,3,3,3.2\n43,3,4,3,2,2,4,2.5\n44,3,2,3,3,4,4,3.8\n45,3,3,5,3,3,3,3.2\n46,3,2,4,2,4,2,4.2\n47,2,3,5,2,5,2,1.3\n48,2,2,5,3,3,2,3.2\n49,1,2,4,3,5,3,2.5\n50,1,1,4,2,3,2,2.2\n51,2,3,4,2,3,2,5.4\n52,2,2,3,3,4,2,2.3\n53,1,3,3,3,3,3,4.3\n54,3,3,2,4,3,2,7\n55,2,3,3,2,4,3,1.7\n56,1,2,3,2,3,2,2.7\n57,1,3,5,1,4,3,2.9\n58,2,4,4,3,2,3,5.6\n59,3,3,3,4,2,5,5.7\n60,1,2,5,3,4,2,2.7\n61,1,1,5,1,4,1,1.4\n62,2,4,2,4,3,3,5.1\n63,3,3,3,4,4,4,3.4\n64,4,4,2,4,2,4,4.5\n65,2,2,4,2,4,4,4.1\n66,2,3,5,2,4,3,2.5\n67,2,2,5,2,3,1,1\n68,5,5,1,4,1,3,6.4\n69,5,4,2,5,2,4,7\n70,5,5,2,5,2,4,5.9\n71,3,3,3,2,5,1,4.4\n72,5,5,1,5,2,3,6.3\n73,2,1,4,2,4,2,2.1\n74,2,3,5,2,4,2,2.8\n75,1,2,5,1,4,3,1.3\n76,3,3,3,5,2,3,4.8\n77,3,5,3,4,1,4,3.2\n78,3,3,4,4,3,2,2.9\n79,3,3,4,3,4,3,3.9\n80,5,5,3,2,1,4,4.4\n81,3,1,4,3,2,3,4\n82,2,3,4,3,3,3,5.3\n83,2,2,4,4,3,3,2.2\n84,3,3,3,4,4,4,3.8\n85,3,1,5,3,3,1,3.2\n86,3,2,3,4,3,4,4.3\n87,3,3,2,4,3,3,4.6\n88,2,2,5,2,5,2,2.4\n89,3,3,5,1,4,1,3.2\n90,1,3,3,1,4,4,1.6\n91,1,1,5,3,5,2,3\n92,4,3,4,3,3,3,4.5\n93,1,1,5,1,5,2,2.1\n94,2,3,4,3,3,3,4.4\n95,3,3,3,1,4,3,2.9\n96,1,1,5,4,5,2,4.7\n97,3,2,2,3,2,3,2.1\n98,2,4,3,3,4,3,2.2\n99,3,3,4,4,2,3,4\n100,2,1,4,3,5,1,3.5\n101,2,4,4,2,4,2,3.1\n102,2,3,3,3,2,3,2.3\n103,2,3,2,2,3,2,4.8\n104,2,3,3,3,4,4,4.9\n105,2,3,2,2,4,2,4.5\n106,1,1,5,2,5,1,1\n107,1,3,3,3,3,2,3.3\n108,5,4,1,3,1,4,7\n109,2,4,4,4,2,4,3.4\n110,2,2,3,3,3,2,3\n111,3,4,3,4,3,1,4.7\n112,2,2,5,3,3,2,4.5\n113,2,3,4,3,4,2,4.5\n114,4,3,3,2,3,3,3.7\n115,4,3,3,3,3,3,3\n116,3,5,2,4,3,4,4.4\n117,4,5,2,5,1,3,5.1\n118,5,2,3,3,3,2,5.5\n119,3,1,3,4,3,2,2.7\n120,5,5,1,5,2,2,4.9\n121,1,2,4,1,5,2,1.5\n122,3,4,2,4,3,4,4.2\n123,3,3,5,4,4,3,3.3\n124,5,5,2,4,3,4,4.8\n125,1,2,4,2,5,2,2.3\n126,4,2,3,4,3,4,3.4\n127,2,2,4,4,3,2,2.5\n128,1,3,4,1,3,3,1\n129,5,4,1,4,1,4,6.5\n130,2,2,5,1,4,2,3.3\n131,2,2,3,3,5,2,3.8\n132,5,3,3,3,3,4,3.1\n133,2,2,1,2,4,2,5.9\n134,3,3,3,2,4,3,3.3\n135,4,4,1,3,1,2,3.4\n136,4,4,1,3,2,5,5.6\n137,4,4,2,3,3,5,3.7\n138,3,2,4,3,5,2,4\n139,5,5,1,5,3,5,7\n140,4,4,2,3,3,3,4.6\n141,1,3,3,3,4,2,3.6\n142,3,3,4,2,3,2,2.4\n143,2,4,3,4,2,3,4.6\n144,3,4,3,3,4,4,5\n145,3,3,5,2,4,2,2.5\n146,3,4,3,4,2,3,4.8\n147,2,4,3,2,3,1,4.8\n148,4,5,1,5,1,4,6.2\n149,2,3,4,3,3,2,2.2\n150,1,4,4,1,3,3,3.7\n"
 },
 {
  "id": "screening",
  "title": "Diagnostik: Screening, Referenzdiagnose und Beurteilerübereinstimmung",
  "file": "data/datasets/screening.csv",
  "modules": [
   "E1",
   "E2",
   "D2"
  ],
  "description": "Fiktive Validierungsstudie mit 200 Personen: Ergebnis eines Depressionsscreenings, Diagnose laut strukturiertem Interview (Referenz) sowie die Einschätzung zweier unabhängiger Beurteilerinnen.",
  "variables": [
   [
    "id",
    "Personennummer",
    "nominal"
   ],
   [
    "screening",
    "positiv / negativ",
    "nominal"
   ],
   [
    "diagnose",
    "Referenzdiagnose ja / nein",
    "nominal"
   ],
   [
    "rater_a",
    "Urteil Beurteilerin A ja / nein",
    "nominal"
   ],
   [
    "rater_b",
    "Urteil Beurteilerin B ja / nein",
    "nominal"
   ]
  ],
  "tasks": [
   {
    "q": "Erstelle die Vierfeldertafel screening × diagnose und berechne Sensitivität, Spezifität, PPV und NPV (in %).",
    "hint": "jamovi: Häufigkeiten → Kontingenztafeln. R: table(d$screening, d$diagnose)",
    "results": [
     {
      "label": "richtig positiv",
      "value": 22,
      "d": 0
     },
     {
      "label": "falsch positiv",
      "value": 30,
      "d": 0
     },
     {
      "label": "Sensitivität %",
      "value": 88,
      "d": 1
     },
     {
      "label": "Spezifität %",
      "value": 82.85714285714286,
      "d": 1
     },
     {
      "label": "PPV %",
      "value": 42.30769230769231,
      "d": 1
     },
     {
      "label": "NPV %",
      "value": 97.97297297297297,
      "d": 1
     }
    ]
   },
   {
    "q": "Hängen Screening und Diagnose statistisch zusammen? (χ²-Test ohne Kontinuitätskorrektur)",
    "hint": "jamovi: Kontingenztafeln → χ². R: chisq.test(table(d$screening, d$diagnose), correct = FALSE)",
    "results": [
     {
      "label": "χ²",
      "value": 57.08345708345708,
      "d": 2
     },
     {
      "label": "df",
      "value": 1,
      "d": 0
     },
     {
      "label": "p",
      "value": 4.1744385725905886e-14,
      "d": 3,
      "p": true
     }
    ]
   },
   {
    "q": "Wie gut stimmen die beiden Beurteilerinnen überein? (Cohens κ)",
    "hint": "jamovi-Modul „agreement“ oder R: psych::cohen.kappa(table(d$rater_a, d$rater_b))",
    "results": [
     {
      "label": "p₀",
      "value": 0.87,
      "d": 3
     },
     {
      "label": "p_e",
      "value": 0.70945,
      "d": 3
     },
     {
      "label": "Cohens κ",
      "value": 0.552572706935123,
      "d": 3
     }
    ]
   }
  ],
  "n": 200,
  "columns": [
   "id",
   "screening",
   "diagnose",
   "rater_a",
   "rater_b"
  ],
  "csv": "id,screening,diagnose,rater_a,rater_b\n1,negativ,nein,nein,nein\n2,negativ,nein,nein,nein\n3,negativ,nein,nein,nein\n4,positiv,nein,nein,nein\n5,positiv,ja,ja,ja\n6,positiv,nein,nein,nein\n7,negativ,nein,nein,nein\n8,positiv,nein,nein,nein\n9,negativ,nein,nein,nein\n10,negativ,nein,nein,nein\n11,negativ,nein,nein,nein\n12,negativ,nein,nein,nein\n13,positiv,nein,nein,nein\n14,positiv,ja,ja,ja\n15,negativ,nein,nein,nein\n16,negativ,nein,nein,nein\n17,negativ,nein,nein,nein\n18,negativ,nein,nein,nein\n19,negativ,nein,nein,nein\n20,positiv,ja,ja,ja\n21,negativ,nein,nein,nein\n22,negativ,nein,nein,nein\n23,negativ,nein,nein,nein\n24,positiv,ja,ja,ja\n25,negativ,nein,nein,nein\n26,negativ,nein,nein,nein\n27,positiv,ja,ja,ja\n28,negativ,nein,nein,nein\n29,positiv,nein,nein,nein\n30,negativ,nein,nein,nein\n31,negativ,nein,nein,ja\n32,positiv,nein,nein,nein\n33,positiv,nein,nein,nein\n34,negativ,nein,nein,ja\n35,negativ,nein,nein,nein\n36,negativ,nein,nein,nein\n37,negativ,ja,ja,ja\n38,negativ,nein,nein,nein\n39,positiv,ja,ja,ja\n40,negativ,nein,nein,nein\n41,negativ,nein,nein,nein\n42,negativ,nein,nein,nein\n43,negativ,nein,nein,nein\n44,negativ,ja,ja,ja\n45,negativ,nein,nein,nein\n46,negativ,nein,nein,nein\n47,negativ,nein,nein,nein\n48,negativ,nein,nein,nein\n49,positiv,ja,nein,ja\n50,negativ,nein,nein,nein\n51,negativ,nein,nein,nein\n52,negativ,nein,nein,nein\n53,positiv,nein,nein,ja\n54,negativ,nein,nein,nein\n55,negativ,nein,nein,nein\n56,negativ,nein,nein,nein\n57,negativ,nein,nein,nein\n58,negativ,nein,nein,nein\n59,negativ,nein,nein,nein\n60,negativ,nein,nein,nein\n61,negativ,nein,nein,nein\n62,negativ,nein,nein,nein\n63,positiv,nein,nein,nein\n64,negativ,nein,ja,ja\n65,negativ,nein,nein,nein\n66,negativ,nein,nein,nein\n67,positiv,nein,nein,nein\n68,negativ,nein,nein,ja\n69,negativ,nein,nein,nein\n70,negativ,nein,nein,nein\n71,positiv,nein,nein,nein\n72,negativ,nein,nein,nein\n73,negativ,nein,nein,nein\n74,negativ,nein,nein,nein\n75,negativ,nein,nein,nein\n76,negativ,nein,nein,nein\n77,negativ,nein,nein,nein\n78,positiv,nein,nein,nein\n79,negativ,nein,nein,nein\n80,positiv,nein,nein,nein\n81,positiv,ja,ja,ja\n82,negativ,nein,nein,nein\n83,negativ,nein,nein,nein\n84,positiv,ja,ja,ja\n85,negativ,nein,nein,ja\n86,positiv,ja,ja,ja\n87,negativ,nein,nein,nein\n88,negativ,nein,nein,nein\n89,negativ,nein,nein,ja\n90,negativ,nein,ja,nein\n91,positiv,nein,nein,nein\n92,negativ,nein,nein,nein\n93,negativ,nein,nein,nein\n94,negativ,nein,nein,nein\n95,positiv,nein,nein,nein\n96,negativ,nein,nein,nein\n97,negativ,nein,nein,nein\n98,negativ,nein,nein,nein\n99,negativ,nein,nein,nein\n100,negativ,nein,nein,nein\n101,negativ,nein,nein,nein\n102,negativ,nein,nein,nein\n103,positiv,nein,nein,ja\n104,negativ,nein,nein,nein\n105,positiv,ja,nein,ja\n106,negativ,nein,nein,ja\n107,negativ,nein,nein,nein\n108,negativ,nein,nein,nein\n109,positiv,nein,nein,nein\n110,positiv,nein,nein,nein\n111,negativ,nein,nein,nein\n112,positiv,nein,nein,nein\n113,negativ,nein,nein,nein\n114,negativ,nein,nein,nein\n115,negativ,nein,ja,nein\n116,negativ,nein,nein,nein\n117,positiv,ja,ja,ja\n118,negativ,nein,nein,ja\n119,negativ,nein,nein,nein\n120,positiv,ja,ja,ja\n121,negativ,nein,nein,nein\n122,negativ,nein,nein,ja\n123,positiv,nein,nein,nein\n124,negativ,nein,nein,ja\n125,negativ,nein,nein,ja\n126,negativ,nein,nein,nein\n127,negativ,nein,ja,nein\n128,negativ,nein,nein,nein\n129,negativ,nein,nein,nein\n130,negativ,nein,nein,nein\n131,positiv,nein,ja,nein\n132,negativ,nein,nein,nein\n133,positiv,ja,ja,ja\n134,negativ,nein,nein,ja\n135,positiv,ja,ja,nein\n136,negativ,ja,ja,ja\n137,negativ,nein,nein,nein\n138,negativ,nein,nein,nein\n139,negativ,nein,nein,ja\n140,positiv,ja,ja,ja\n141,negativ,nein,nein,nein\n142,negativ,nein,nein,nein\n143,negativ,nein,nein,nein\n144,negativ,nein,nein,nein\n145,negativ,nein,nein,nein\n146,positiv,nein,nein,nein\n147,negativ,nein,nein,nein\n148,positiv,nein,nein,nein\n149,positiv,ja,ja,ja\n150,positiv,nein,nein,nein\n151,negativ,nein,nein,nein\n152,negativ,nein,nein,nein\n153,negativ,nein,nein,nein\n154,positiv,ja,ja,ja\n155,positiv,nein,nein,nein\n156,negativ,nein,nein,nein\n157,negativ,nein,nein,nein\n158,positiv,nein,nein,nein\n159,negativ,nein,nein,nein\n160,negativ,nein,nein,nein\n161,negativ,nein,nein,nein\n162,negativ,nein,nein,nein\n163,negativ,nein,nein,nein\n164,negativ,nein,nein,nein\n165,negativ,nein,nein,nein\n166,negativ,nein,ja,nein\n167,negativ,nein,nein,nein\n168,negativ,nein,nein,nein\n169,negativ,nein,nein,nein\n170,negativ,nein,nein,nein\n171,negativ,nein,nein,ja\n172,negativ,nein,nein,nein\n173,positiv,ja,ja,ja\n174,negativ,nein,nein,nein\n175,negativ,nein,nein,nein\n176,positiv,ja,ja,ja\n177,negativ,nein,nein,nein\n178,negativ,nein,nein,ja\n179,negativ,nein,nein,nein\n180,negativ,nein,nein,nein\n181,negativ,nein,nein,nein\n182,negativ,nein,nein,nein\n183,negativ,nein,nein,ja\n184,negativ,nein,nein,nein\n185,negativ,nein,nein,nein\n186,positiv,nein,nein,nein\n187,negativ,nein,nein,nein\n188,negativ,nein,nein,nein\n189,negativ,nein,nein,nein\n190,negativ,nein,nein,nein\n191,positiv,nein,nein,nein\n192,negativ,nein,nein,nein\n193,positiv,ja,ja,ja\n194,negativ,nein,nein,nein\n195,negativ,nein,nein,nein\n196,positiv,nein,nein,nein\n197,negativ,nein,nein,nein\n198,positiv,nein,nein,nein\n199,positiv,ja,ja,nein\n200,negativ,nein,nein,nein\n"
 }
];
