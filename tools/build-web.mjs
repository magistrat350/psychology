// Stellt die Web-App in www/ zusammen – Grundlage für die Android-App (Capacitor) und GitHub Pages.
//   node tools/build-web.mjs            → www/ für das Web (GitHub Pages)
//   node tools/build-web.mjs --android  → zusätzlich mit Capacitor-Laufzeit für die Android-App
// Dabei werden js/version.js mit der Build-Version und der Cache-Name des Service Workers ersetzt,
// damit installierte Web-Apps nach einem Release die neuen Dateien laden.
import fs from "fs";
import path from "path";
import { ROOT } from "./lib/load-data.mjs";
import { versionInfo, versionJs } from "./lib/version.mjs";

const ITEMS = ["index.html", "manifest.webmanifest", "sw.js", "css", "js", "data", "icons"];

export function buildWeb({ android = false, out = path.join(ROOT, "www"), env = process.env } = {}) {
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  for (const item of ITEMS) fs.cpSync(path.join(ROOT, item), path.join(out, item), { recursive: true });
  const info = versionInfo(env);
  fs.writeFileSync(path.join(out, "js/version.js"), versionJs(info));
  const swFile = path.join(out, "sw.js");
  const sw = fs.readFileSync(swFile, "utf8");
  if (!/const VERSION = "[^"]*";/.test(sw)) throw new Error("sw.js: VERSION-Zeile nicht gefunden");
  fs.writeFileSync(swFile, sw.replace(/const VERSION = "[^"]*";/, `const VERSION = "psychopfad-${info.version}";`));
  if (android) {
    // Capacitor-Laufzeit ohne Bundler: stellt Capacitor.registerPlugin() für die nativen Plugins bereit
    fs.copyFileSync(path.join(ROOT, "node_modules/@capacitor/core/dist/capacitor.js"), path.join(out, "js/capacitor.js"));
    const htmlFile = path.join(out, "index.html");
    const html = fs.readFileSync(htmlFile, "utf8");
    if (!html.includes('<script src="js/version.js"></script>')) throw new Error("index.html: js/version.js nicht eingebunden");
    fs.writeFileSync(htmlFile, html.replace('<script src="js/version.js"></script>', '<script src="js/capacitor.js"></script>\n  <script src="js/version.js"></script>'));
  }
  return info;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const android = process.argv.includes("--android");
  const info = buildWeb({ android });
  console.log(`www/ erstellt – Version ${info.version} (Build ${info.build}${info.commit ? ", " + info.commit : ""})${android ? " mit Capacitor-Laufzeit" : ""}`);
}
