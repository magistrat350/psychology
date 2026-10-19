# PsychoPfad Wien

Selbstlern-App für das **Bachelorstudium Psychologie an der Universität Wien** (Curriculum Version 2022 inkl. 1. Änderung 2024, 180 ECTS).

## Funktionen

**Pro Modul** (25 Rubriken entlang des Modulplans):

| Reiter | Inhalt |
|---|---|
| Überblick | Lehrveranstaltungen, Lernziele, Prüfungsform, Lernstrategie, eigener Stand |
| Wissen & Qualifikationen | Vorausgesetztes Wissen, Selbsteinschätzungsbogen, Arbeitstechniken |
| Lernpfad | Themen-Zusammenfassungen mit Schlüsselbegriffen und **Quellen zum Nachprüfen** (238 Themen, 661 Quellenangaben) |
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
- **Prüfmodus** – Curriculum-Checkliste (106 Prüfpunkte, unsichere Angaben markiert), **fachliche Prüfung der Inhalte** (siehe unten), gesammelte Fehlermeldungen (Button „⚑ Fehler melden“ an Quizfragen, Prüfungsfragen, Lernthemen, Karteikarten, Links, Büchern und Rechenaufgaben) mit Export als Markdown oder GitHub-Issue, Ergebnisse der Linkprüfung.
- Semesterplan, Vorbereitung auf das Aufnahmeverfahren, Glossar, Volltextsuche, Fortschritt mit Export/Import, Hell/Dunkel-Modus.
- **Installierbar und offline nutzbar** (PWA), wenn die App über http(s) ausgeliefert wird.
- **Android-App (APK)** mit Update-Prüfung über GitHub Releases und Versionsnummern (siehe unten).

## Starten

Ohne Installation: `index.html` im Browser öffnen. Für Offline-Modus und Installation als App:

```bash
npm run serve        # http://localhost:8080 – im Browser „Installieren“ bzw. „Zum Home-Bildschirm“
```

Auf einem Webserver (z. B. GitHub Pages) funktioniert das genauso – alle Pfade sind relativ.

Der Lernfortschritt liegt im Browser (localStorage). Unter **Fortschritt** lässt er sich als Datei speichern oder über die Zwischenablage auf ein anderes Gerät übertragen.

## Android-App & Updates über GitHub

Bei jedem Push baut GitHub Actions (`.github/workflows/build.yml`) die App: erst laufen alle Tests, dann entsteht mit [Capacitor](https://capacitorjs.com) eine Android-APK, die anschließend **im Android-Emulator (Android 14) getestet** wird (`tests/android-device.mjs`): Start, Ansichten, Dateisystem und Teilen-Menü, Zurück-Taste, Update-Abfrage, externe Links; dazu Installation, Version und Start der signierten Release-APK.
Nur wenn dieser Test besteht, wird die APK auf dem Standard-Branch als **GitHub-Release** veröffentlicht – mit Screenshots aus dem Emulator. Zusätzlich die Web-Version auf GitHub Pages (sobald unter *Settings → Pages* die Quelle „GitHub Actions“ gewählt ist).

- **Installieren:** https://github.com/magistrat350/psychology/releases/latest/download/psychopfad.apk auf dem Handy öffnen und installieren (einmalig „Installation aus unbekannten Quellen“ erlauben).
- **Aktualisieren:** Die App sucht beim Start (höchstens alle 12 Stunden) nach einer neueren Veröffentlichung und zeigt oben einen Hinweis mit Download-Link. Manuell: **Einstellungen → App-Version & Updates → Nach Updates suchen** – dort stehen auch die Neuerungen der Version. Die neue APK einfach drüberinstallieren, der Lernstand bleibt erhalten.
- **Web-Version:** Der Service Worker lädt neue Versionen im Hintergrund und zeigt dann „Neu laden“ an.
- **In der App:** Exporte (Anki, CSV, Fortschritt, Meldungen) öffnen das Teilen-Menü (z. B. „In Drive speichern“, an AnkiDroid oder per Mail senden); Links öffnen im Browser; die Zurück-Taste navigiert innerhalb der App.

**Versionsschema:** `<major>.<minor>.<Build>` – `major.minor` aus `package.json`, die Build-Nummer ist die Laufnummer des Workflows (und der Android-`versionCode`), z. B. `2.0.17` mit Tag `v2.0.17`. Für größere Inhaltsstände `npm version minor --no-git-tag-version` ausführen und committen (→ `2.1.<Build>`). Lokale Builds heißen `2.0.0-dev`. Die Version steht in den Einstellungen, unten in der Navigation und in jeder Fehlermeldung. Die Versionshinweise eines Releases entstehen aus den Commit-Nachrichten seit dem vorigen Release.

**Signaturschlüssel:** Updates lassen sich nur drüberinstallieren, wenn jede APK mit demselben Schlüssel signiert ist. Dafür liegt `signing/psychopfad.jks` im Repository (Alias `psychopfad`, Passwort `psychopfad-wien`). Da das Repository öffentlich ist, kann diesen Schlüssel jeder lesen. Sicherer ist ein eigener Schlüssel als Repository-Secret: `ANDROID_KEYSTORE_BASE64` (Keystore als Base64), `ANDROID_KEYSTORE_PASSWORD` und optional `ANDROID_KEY_ALIAS` (Standard `psychopfad`). Der Workflow nutzt die Secrets automatisch, wenn sie gesetzt sind. Achtung: Ein Schlüsselwechsel erfordert eine einmalige Neuinstallation – vorher unter **Fortschritt** den Lernstand sichern.

```bash
# eigener Schlüssel (einmalig) und Base64 für das Secret
keytool -genkeypair -keystore meine.jks -storetype PKCS12 -alias psychopfad -keyalg RSA -keysize 4096 -validity 10000
base64 -w0 meine.jks
```

Lokal bauen (mit installiertem Android-SDK und JDK 21):

```bash
npm install
npm run android:add          # www/ bauen, Android-Projekt und Icons erzeugen (einmalig)
npm run android:sync         # nach Änderungen: www/ neu bauen und ins Android-Projekt kopieren
cd android && ./gradlew assembleDebug
```

## Befehle

Voraussetzung: Node.js 18 oder neuer. Einmalig `npm install` (für die Browser-Tests zusätzlich `npx playwright install chromium`).

| Befehl | Zweck |
|---|---|
| `npm test` | alle Tests: Datenprüfung, Unit-Tests, Browser-Test aller 318 Ansichten und Abläufe, Offline- und Update-Test, Android-Version (simuliert), Build-Test |
| `npm run check-links` | prüft alle verlinkten URLs (siehe unten) |
| `npm run build` | Einzeldateien in `dist/`: `psychopfad-wien.html` (alles eingebettet, offline per Doppelklick), `artifact.html` (zum Veröffentlichen), Anki-Datei |
| `npm run build:web` | `www/` für GitHub Pages bzw. (mit `--android`) für die Android-App, mit Versionsnummer |
| `npm run android:add` / `android:sync` | Android-Projekt erzeugen bzw. aktualisieren (siehe oben) |
| `npm run version:info` | zeigt die Version, die ein Build bekäme |
| `npm run anki` | nur die Anki-Datei (`--modules=A1,A2`, `--kinds=card,quiz,exam`) |
| `npm run datasets` | Übungsdatensätze und Referenzergebnisse neu erzeugen (feste Seeds, reproduzierbar) |
| `npm run icons` | PNG-Icons und Android-Vorlagen (`assets/`) aus `icons/icon.svg` erzeugen |
| `npm run serve` | lokaler Server auf Port 8080 (`PORT=…` änderbar) |

## Linkprüfung

Läuft **jeden Montag automatisch auf GitHub** (`.github/workflows/links.yml`, von Hand: *Actions → Linkprüfung → Run workflow*). Ändert sich ein Befund, committet der Workflow `data/link-status.js`; defekte Links stehen in einem Issue mit dem Label `linkpruefung`, das bei jeder Prüfung aktualisiert und geschlossen wird, sobald alles erreichbar ist. Lokal:

```bash
npm run check-links                 # alle Links
npm run check-links -- --no-search  # ohne YouTube-/Google-Suchlinks
npm run check-links -- --only=coursera
npm run check-links -- --strict     # Exitcode 1 bei defekten Links (CI)
```

Das Skript prüft jede URL (HEAD, bei Ablehnung GET, höchstens 2 Anfragen gleichzeitig pro Server; DOIs über die DOI-Registrierung) und unterscheidet:
**erreichbar**, **defekt** (404/410, Domain existiert nicht) und **unklar** (403/429/5xx, Zeitüberschreitung, Weiterleitung auf die Startseite – im Browser prüfen).
Es schreibt `reports/link-report.md`, `reports/link-report.json` und `data/link-status.js`. Danach zeigt die App an den betroffenen Links „Link defekt“ bzw. „Link prüfen“ und listet sie im Prüfmodus.

## Quellen und fachliche Prüfung

Alle Inhalte wurden mit KI-Unterstützung erstellt. Damit man sie nachprüfen kann:

- **Quellen je Lernthema** (`data/sources.js`, Katalog in `data/source-catalog.js`): ein bis drei Angaben pro Thema – ein Lehrbuch aus der Literaturliste des Moduls mit dem Abschnitt, in dem man nachliest (bewusst ohne Kapitel- oder Seitenzahlen, weil sich Auflagen unterscheiden), dazu nach Möglichkeit eine frei zugängliche Quelle: OpenStax-Abschnitt, Fachartikel per DOI oder eine Quelle aus den Modulmaterialien. Ein Test stellt sicher, dass jede Angabe zu einem vorhandenen Buch bzw. Katalogeintrag passt; die Linkprüfung prüft OpenStax-Adressen und DOIs.
- **Prüfvermerke** (Prüfmodus → *Inhalte prüfen*): Lernthemen, Quizfragen und Prüfungsfragen lassen sich nach dem Abgleich mit einem Lehrbuch als *✓ geprüft* (mit Beleg, z. B. Buch und Seite) oder *✗ Fehler* (öffnet eine Fehlermeldung) markieren. An jedem Inhalt steht „ungeprüft“ bzw. „✓ fachlich geprüft“. Die eigenen Vermerke exportiert man als Datei; `node tools/merge-review.mjs <datei.json>` übernimmt sie nach `data/review.js`, damit sie für alle sichtbar sind. Ändert sich später ein Text, gilt er wieder als ungeprüft (der Test meldet den veralteten Vermerk).
- Beim Zusammenstellen der Quellen gefundene fachliche Fehler (u. a. WAIS-IV-Indizes, PRISMA 2020, Rogers' Bedingungen, Gen-Umwelt-Korrelation) sind korrigiert.

## Fehlermeldungen und Curriculum-Abgleich

- Meldungen und Checkliste werden im Browser gespeichert. Im Prüfmodus lassen sie sich als Markdown kopieren, als `.md` speichern oder direkt als GitHub-Issue in diesem Repository anlegen.
- In der als claude.ai-Artifact veröffentlichten Version werden Meldungen und Checkliste zusätzlich in der Datenbank der Seite gespeichert und auf allen Geräten zusammengeführt, sodass sie ausgewertet und in die Daten eingepflegt werden können.

## Struktur

```
index.html, manifest.webmanifest, sw.js, icons/   App-Shell und PWA
capacitor.config.json, assets/, signing/   Android-App (Projekt wird im Workflow erzeugt)
.github/workflows/build.yml   Tests, APK, Emulator-Test, Release, GitHub Pages
.github/workflows/links.yml   wöchentliche Linkprüfung
css/style.css
js/app.js        Oberfläche, Router, alle Ansichten
js/version.js    Versionsangaben (beim Build ersetzt)
js/update.js     Versionsvergleich und Update-Prüfung über GitHub Releases
js/sources.js    Quellenangaben der Lernthemen auflösen
js/review.js     Prüfvermerke (fachliche Prüfung)
js/stats.js      Statistik-Bibliothek (Verteilungen, Tests, Reliabilität …)
js/trainer.js    Aufgabengeneratoren des Rechentrainers
js/srs.js        Wiederholungsplanung
js/anki.js       Anki-Export
data/meta.js, data/modules/*.js   Studienstruktur und Modulinhalte
data/datasets.js, data/datasets/*.csv   Übungsdatensätze (erzeugt)
data/verify.js   Checkliste für den Curriculum-Abgleich
data/sources.js, data/source-catalog.js   Quellen zu den Lernthemen
data/review.js   gemeinsame Prüfvermerke
data/link-status.js   Ergebnis der Linkprüfung (erzeugt)
tools/           Build (auch www/ und Versionen), Server, Linkprüfer, Anki-Export, Datensatz- und Icon-Erzeugung
tests/           validate.mjs, unit/*.test.mjs, smoke.mjs, pwa.mjs, native.mjs, artifact.mjs, android-device.mjs (nur im Emulator)
```

Neues Modul: in einer Datei unter `data/modules/` `PP.addModule({...})` aufrufen (Schema siehe vorhandene Module), bei Bedarf Prüfpunkte in `data/verify.js` ergänzen und `npm test` ausführen. Neue Datei? Dann auch in `index.html` und in die Liste in `sw.js` eintragen (ein Test prüft das). Ordner, die in die App gehören, zusätzlich in `tools/build-web.mjs`.

## Hinweise

- Die Modulstruktur ist aus dem veröffentlichten Curriculum rekonstruiert. **Verbindlich** sind der aktuelle Curriculumstext, u:find und das StudienServiceCenter Psychologie. Der Prüfmodus hilft beim Abgleich.
- Quiz-, Prüfungs- und Rechenaufgaben sowie die Datensätze sind eigenständig erstellte Übungsmaterialien, keine offiziellen Prüfungsfragen oder echten Studiendaten.
- Viele Videolinks sind bewusst als Suchanfragen angelegt, damit sie auch bei geänderten Video-URLs funktionieren.
