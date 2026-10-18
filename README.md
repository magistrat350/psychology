# PsychoPfad Wien

Selbstlern-App für das **Bachelorstudium Psychologie an der Universität Wien** (Curriculum Version 2022 inkl. 1. Änderung 2024, 180 ECTS).

## Funktionen

**Pro Modul** (25 Rubriken entlang des Modulplans):

| Reiter | Inhalt |
|---|---|
| Überblick | Lehrveranstaltungen, Lernziele, Prüfungsform, Lernstrategie, eigener Stand |
| Wissen & Qualifikationen | Vorausgesetztes Wissen, Selbsteinschätzungsbogen, Arbeitstechniken |
| Lernpfad | Themen-Zusammenfassungen mit Schlüsselbegriffen und Leseempfehlungen (238 Themen) |
| Materialien / Vorlesungen | 310 frei zugängliche Quellen (OER, MIT OCW, Yale, Coursera-Audit, YouTube) |
| Fachliteratur | 215 Bücher mit Suche in KIT-Bibliothek, UB Wien, Büchereien Wien, WorldCat, SpringerLink |
| Karteikarten | Glossar mit Wiederholung in wachsenden Abständen |
| Quiz / Prüfung | 430 MC-Fragen mit Erklärung, Prüfungssimulation mit Timer und 97 offenen Fragen samt Musterlösung |
| Rechentrainer | (D1, D2, E1) generierte Rechenaufgaben mit Lösungsweg |
| Notizen | eigene Notizen |

**Modulübergreifend:**

- **Wiederholen** – Begriffe und Quizfragen aus allen Modulen, verzahnt gemischt. Gewusstes kommt nach 1, 3, 7, 16, 35, 80 Tagen wieder, Falsches am nächsten Tag. Falsche Antworten aus Quiz, Prüfung und Mischquiz landen automatisch hier. Einstellbar: neue Karten pro Tag, Module, Kartentypen. Tastatur: Leertaste umdrehen, 1/2 bewerten, Ziffern für Antworten, Enter weiter.
- **Mischquiz** – Fragen aus mehreren Modulen (Voreinstellungen StEOP, Grundlagen, Methoden, Anwendung, Alles) mit Auswertung je Modul.
- **Statistik-Rechentrainer** – 25 Aufgabentypen (Lage- und Streuungsmaße, z-/T-Werte, Normalverteilung, Korrelation, Regression, Bayes, Binomialverteilung, Konfidenzintervalle, t-Tests, ANOVA, χ², Effektgrößen, α-Kumulierung, Standardmessfehler, Spearman-Brown, Minderungskorrektur, Itemanalyse, Cronbachs α, Normwerte, Rasch-Modell, Cohens κ, Sensitivität/PPV). Neue Zahlen bei jedem Durchgang, Eingabe mit Komma oder Punkt, schrittweiser Lösungsweg. Jede Aufgabe hat eine Nummer und ist damit reproduzierbar (`#/rechentrainer/anova/1234`).
- **Übungsdatensätze** – 5 simulierte Datensätze als CSV (Lernstudie, Achtsamkeitstraining, Therapiestudie, Fragebogen/Skalenanalyse, Screening/Diagnostik) mit 17 Aufgaben, jamovi- und R-Hinweisen und Referenzergebnissen.
- **Anki-Export** – Begriffe, Quizfragen und Prüfungsfragen als Anki-Importdatei, ein Unterstapel pro Modul.
- **Prüfmodus** – Curriculum-Checkliste (106 Prüfpunkte, unsichere Angaben markiert), gesammelte Fehlermeldungen (Button „⚑ Fehler melden“ an Quizfragen, Prüfungsfragen, Lernthemen, Karteikarten, Links, Büchern und Rechenaufgaben) mit Export als Markdown oder GitHub-Issue, Ergebnisse der Linkprüfung.
- Semesterplan, Vorbereitung auf das Aufnahmeverfahren, Glossar, Volltextsuche, Fortschritt mit Export/Import, Hell/Dunkel-Modus.
- **Installierbar und offline nutzbar** (PWA), wenn die App über http(s) ausgeliefert wird.

## Starten

Ohne Installation: `index.html` im Browser öffnen. Für Offline-Modus und Installation als App:

```bash
npm run serve        # http://localhost:8080 – im Browser „Installieren“ bzw. „Zum Home-Bildschirm“
```

Auf einem Webserver (z. B. GitHub Pages) funktioniert das genauso – alle Pfade sind relativ.

Der Lernfortschritt liegt im Browser (localStorage). Unter **Fortschritt** lässt er sich als Datei speichern oder über die Zwischenablage auf ein anderes Gerät übertragen.

## Befehle

Voraussetzung: Node.js 18 oder neuer. Einmalig `npm install` (für die Browser-Tests zusätzlich `npx playwright install chromium`).

| Befehl | Zweck |
|---|---|
| `npm test` | alle Tests: Datenprüfung, Unit-Tests, Browser-Test aller 318 Ansichten und Abläufe, Offline-Test, Build-Test |
| `npm run check-links` | prüft alle verlinkten URLs (siehe unten) |
| `npm run build` | Einzeldateien in `dist/`: `psychopfad-wien.html` (alles eingebettet, offline per Doppelklick), `artifact.html` (zum Veröffentlichen), Anki-Datei |
| `npm run anki` | nur die Anki-Datei (`--modules=A1,A2`, `--kinds=card,quiz,exam`) |
| `npm run datasets` | Übungsdatensätze und Referenzergebnisse neu erzeugen (feste Seeds, reproduzierbar) |
| `npm run icons` | PNG-Icons aus `icons/icon.svg` erzeugen |
| `npm run serve` | lokaler Server auf Port 8080 (`PORT=…` änderbar) |

## Linkprüfung

```bash
npm run check-links                 # alle Links
npm run check-links -- --no-search  # ohne YouTube-/Google-Suchlinks
npm run check-links -- --only=coursera
npm run check-links -- --strict     # Exitcode 1 bei defekten Links (CI)
```

Das Skript prüft jede URL (HEAD, bei Ablehnung GET, höchstens 2 Anfragen gleichzeitig pro Server) und unterscheidet:
**erreichbar**, **defekt** (404/410, Domain existiert nicht) und **unklar** (403/429/5xx, Zeitüberschreitung, Weiterleitung auf die Startseite – im Browser prüfen).
Es schreibt `reports/link-report.md`, `reports/link-report.json` und `data/link-status.js`. Danach zeigt die App an den betroffenen Links „Link defekt“ bzw. „Link prüfen“ und listet sie im Prüfmodus.

## Fehlermeldungen und Curriculum-Abgleich

- Meldungen und Checkliste werden im Browser gespeichert. Im Prüfmodus lassen sie sich als Markdown kopieren, als `.md` speichern oder direkt als GitHub-Issue in diesem Repository anlegen.
- In der als claude.ai-Artifact veröffentlichten Version werden Meldungen und Checkliste zusätzlich in der Datenbank der Seite gespeichert und auf allen Geräten zusammengeführt, sodass sie ausgewertet und in die Daten eingepflegt werden können.

## Struktur

```
index.html, manifest.webmanifest, sw.js, icons/   App-Shell und PWA
css/style.css
js/app.js        Oberfläche, Router, alle Ansichten
js/stats.js      Statistik-Bibliothek (Verteilungen, Tests, Reliabilität …)
js/trainer.js    Aufgabengeneratoren des Rechentrainers
js/srs.js        Wiederholungsplanung
js/anki.js       Anki-Export
data/meta.js, data/modules/*.js   Studienstruktur und Modulinhalte
data/datasets.js, data/datasets/*.csv   Übungsdatensätze (erzeugt)
data/verify.js   Checkliste für den Curriculum-Abgleich
data/link-status.js   Ergebnis der Linkprüfung (erzeugt)
tools/           Build, Server, Linkprüfer, Anki-Export, Datensatz- und Icon-Erzeugung
tests/           validate.mjs, unit/*.test.mjs, smoke.mjs, pwa.mjs, artifact.mjs
```

Neues Modul: in einer Datei unter `data/modules/` `PP.addModule({...})` aufrufen (Schema siehe vorhandene Module), bei Bedarf Prüfpunkte in `data/verify.js` ergänzen und `npm test` ausführen. Neue Datei? Dann auch in `index.html` und in die Liste in `sw.js` eintragen (ein Test prüft das).

## Hinweise

- Die Modulstruktur ist aus dem veröffentlichten Curriculum rekonstruiert. **Verbindlich** sind der aktuelle Curriculumstext, u:find und das StudienServiceCenter Psychologie. Der Prüfmodus hilft beim Abgleich.
- Quiz-, Prüfungs- und Rechenaufgaben sowie die Datensätze sind eigenständig erstellte Übungsmaterialien, keine offiziellen Prüfungsfragen oder echten Studiendaten.
- Viele Videolinks sind bewusst als Suchanfragen angelegt, damit sie auch bei geänderten Video-URLs funktionieren.
