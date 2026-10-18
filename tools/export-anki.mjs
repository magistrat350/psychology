// Erzeugt die Anki-Importdatei für alle Module: `npm run anki` → dist/anki/psychopfad-wien-anki.txt
// Optionen: --modules=A1,A2  --kinds=card,quiz,exam
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { ROOT, loadData } from "./lib/load-data.mjs";

const require = createRequire(import.meta.url);
const A = require("../js/anki.js");
const arg = (name) => (process.argv.find((a) => a.startsWith(`--${name}=`)) || "").split("=")[1];
const PP = loadData();
const mods = arg("modules") ? PP.modules.filter((m) => arg("modules").split(",").includes(m.id)) : PP.modules;
const kinds = arg("kinds") ? arg("kinds").split(",") : undefined;
const txt = A.build(mods, { kinds });
const out = path.join(ROOT, "dist/anki/psychopfad-wien-anki.txt");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, txt);
console.log(`${txt.trim().split("\n").length - 4} Karten → ${path.relative(ROOT, out)}`);
