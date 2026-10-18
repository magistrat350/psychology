// Lädt Playwright aus node_modules (npm install) oder – als Rückfall – aus einer globalen Installation.
import { createRequire } from "module";
import { execSync } from "child_process";
import path from "path";
const require = createRequire(import.meta.url);
export function loadPlaywright() {
  try { return require("playwright"); } catch (e) { /* weiter unten */ }
  try { const root = execSync("npm root -g").toString().trim(); return require(path.join(root, "playwright")); } catch (e) { /* weiter unten */ }
  console.error("Playwright fehlt. Bitte `npm install` ausführen (und einmalig `npx playwright install chromium`).");
  process.exit(2);
}
