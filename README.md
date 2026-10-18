# PsychoPfad Wien

Selbstlern-App für das **Bachelorstudium Psychologie an der Universität Wien** (Curriculum Version 2022 inkl. 1. Änderung 2024, 180 ECTS).
Für jedes Modul des Modulplans gibt es eine eigene Rubrik mit:

| Rubrik | Inhalt |
|---|---|
| **Überblick** | Lehrveranstaltungen, Lernziele, Prüfungsform, Lernstrategie |
| **Wissen & Qualifikationen** | Vorausgesetztes Wissen, Kompetenzen als Selbsteinschätzungsbogen (4 Stufen), Arbeitstechniken |
| **Lernpfad** | Ausführliche Themen-Zusammenfassungen mit Schlüsselbegriffen und Leseempfehlungen, abhakbar |
| **Materialien** | Frei zugängliche Lehrbücher (OER), Artikel, Simulationen, Software |
| **Vorlesungen** | Öffentliche Vorlesungsreihen und Videokurse (MIT OCW, Yale, Coursera-Audit, YouTube) |
| **Fachliteratur** | Standardwerke mit Direktsuche in KIT-Bibliothek, UB Wien, Büchereien Wien, WorldCat, SpringerLink u. a. |
| **Karteikarten** | Glossar als Lernkarten mit Leitner-System |
| **Quiz** | Multiple-Choice mit sofortiger Erklärung, „nur falsche wiederholen“ |
| **Prüfung** | Prüfungssimulation mit Timer: MC-Teil + offene Fragen mit Musterlösung und Selbstbewertung, Note nach Beispielschlüssel |
| **Notizen** | Eigene Notizen pro Modul |

Dazu: empfohlener Semesterplan, Vorbereitung auf Zulassung/Aufnahmeverfahren, Bibliotheksübersicht, Glossar (≈ 390 Begriffe),
Volltextsuche, Fortschrittsübersicht mit Export/Import, Hell/Dunkel-Modus, Druck-/PDF-Ansicht.

**Umfang:** 25 Modul-Rubriken · 238 Lernthemen · 310 Materialien & Vorlesungen · 215 Fachbücher · 430 Quizfragen · 97 offene Prüfungsfragen mit Musterlösung.

## Starten

Keine Installation nötig: `index.html` im Browser öffnen (funktioniert auch offline per Doppelklick).
Alternativ lokal servieren:

```bash
python3 -m http.server 8000   # dann http://localhost:8000 öffnen
```

Der Lernfortschritt wird im Browser (localStorage) gespeichert – unter **Fortschritt** lässt er sich als JSON exportieren und auf anderen Geräten importieren.

## Bibliothekssuche

WorldCat, DNB, SpringerLink, Open Library und Google Scholar werden direkt durchsucht. Für **KIT-Katalog**, **u:search (UB Wien)**,
**Büchereien Wien** und **Stadtbibliothek Karlsruhe** wird der Suchbegriff in die Zwischenablage kopiert und der Katalog geöffnet.
Wer die Such-URL eines Katalogs kennt, trägt sie unter **Einstellungen** mit dem Platzhalter `{q}` ein – danach sucht der Button direkt.

## Struktur

```
index.html            App-Shell
css/style.css         Layout & Themes
js/app.js             Router, Ansichten, Quiz-/Prüfungs-Engine, Speicherung
data/meta.js          Studienstruktur, Bibliotheken, allgemeine Ressourcen, Semesterplan, Karrierewege
data/modules/*.js     Inhalte je Modulgruppe (0, A–H, W)
tests/validate.mjs    Datenprüfung (IDs, Quiz-Antworten, URLs, ECTS-Summen)
tests/smoke.mjs       Browser-Test aller Routen (Playwright)
```

Neues Modul hinzufügen: in einer Datei unter `data/modules/` `PP.addModule({...})` aufrufen (Schema siehe vorhandene Module)
und `node tests/validate.mjs` ausführen.

## Hinweise

- Die Modulstruktur ist aus dem veröffentlichten Curriculum rekonstruiert. **Verbindlich** sind der aktuelle Curriculumstext,
  u:find und das StudienServiceCenter Psychologie – Links stehen in der App unter „Offizielle Quellen“.
- Lehrveranstaltungs-Aufteilungen innerhalb von D1, D2, F1 sind als „laut u:find“ gekennzeichnet, weil sie sich semesterweise ändern können.
- Quiz- und Prüfungsfragen sind eigenständig erstellte Übungsaufgaben, keine offiziellen Prüfungsfragen.
- Viele Videolinks sind bewusst als Suchanfragen angelegt, damit sie auch bei geänderten Video-URLs funktionieren.
