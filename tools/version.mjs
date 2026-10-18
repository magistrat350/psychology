// Gibt die Versionsangaben des aktuellen Builds aus.
//   node tools/version.mjs        → JSON
//   node tools/version.mjs --env  → APP_VERSION=…, APP_BUILD=… (für $GITHUB_ENV in GitHub Actions)
import { versionInfo } from "./lib/version.mjs";

const info = versionInfo();
if (process.argv.includes("--env")) console.log(`APP_VERSION=${info.version}\nAPP_BUILD=${info.build || 1}`);
else console.log(JSON.stringify(info, null, 2));
