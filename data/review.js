/* Fachliche Prüfung der Inhalte – gemeinsame Prüfvermerke.
 * Format: "<ID>": { s: "ok" | "fehler", by: "Kürzel", date: "JJJJ-MM-TT", note: "Beleg, z. B. Buch + Seite" }
 * IDs: t:/q:/x:<Modul>:<Hash des Titels bzw. der Frage> (siehe js/review.js). Ändert sich ein Text, gilt er wieder als ungeprüft
 * (tests/validate.mjs meldet dann den veralteten Eintrag). Ergänzen: Export aus der App (Prüfmodus → Inhalte) und
 *   node tools/merge-review.mjs <export.json>
 * Bisher ist nichts geprüft: Alle Inhalte wurden mit KI-Unterstützung erstellt und warten auf eine fachliche Durchsicht. */
PP.review = {};
