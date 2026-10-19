// Baut Einzeldatei-Versionen der App: `npm run build`
//   dist/psychopfad-wien.html – vollständige Offline-Datei (alles eingebettet)
//   dist/artifact.html        – Seiteninhalt zum Veröffentlichen als claude.ai-Artifact (ohne Dokumentrahmen und PWA-Verweise)
//   dist/anki/…               – Anki-Export (über tools/export-anki.mjs)
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { ROOT } from "./lib/load-data.mjs";
import { versionInfo, versionJs } from "./lib/version.mjs";

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const html = read("index.html");
const css = read("css/style.css") + "\n" + read("css/figures.css");
const info = versionInfo();
const script = (src) => (src === "js/version.js" ? versionJs(info) : read(src));
const inlineScripts = (s) => s.replace(/<script src="([^"]+)"><\/script>/g, (_, src) => `<script>\n${script(src).replace(/<\/script/gi, "<\\/script")}\n</script>`);

const standalone = inlineScripts(html)
  .replace(/\s*<link rel="manifest"[^>]*>/, "")
  .replace(/\s*<link rel="apple-touch-icon"[^>]*>/, "")
  .replace(/<link rel="icon" href="icons\/icon.svg"[^>]*>/, `<link rel="icon" href="data:image/svg+xml;base64,${Buffer.from(read("icons/icon.svg")).toString("base64")}">`)
  .replace(/<link rel="stylesheet" href="css\/style.css">/, `<style>\n${css}\n</style>`)
  .replace(/\s*<link rel="stylesheet" href="css\/figures.css">/, "");

const title = html.match(/<title>.*?<\/title>/)[0];
const desc = html.match(/<meta name="description"[^>]*>/)[0];
const body = html.match(/<body>([\s\S]*)<\/body>/)[1];
const artifact = `${title}\n${desc}\n<style>\n${css}\n</style>\n${inlineScripts(body)}`;

fs.mkdirSync(path.join(ROOT, "dist"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "dist/psychopfad-wien.html"), standalone);
fs.writeFileSync(path.join(ROOT, "dist/artifact.html"), artifact);
const kb = (p) => Math.round(fs.statSync(path.join(ROOT, p)).size / 1024) + " KB";
console.log(`Version ${info.version}`);
console.log(`dist/psychopfad-wien.html (${kb("dist/psychopfad-wien.html")})\ndist/artifact.html (${kb("dist/artifact.html")})`);
execFileSync(process.execPath, [path.join(ROOT, "tools/export-anki.mjs")], { stdio: "inherit" });
