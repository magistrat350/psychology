// Versionsangaben für alle Builds. Eine Quelle: "version" in package.json (major.minor),
// ergänzt um die Laufnummer von GitHub Actions als Build-Nummer.
//   Release-Build (CI): <major>.<minor>.<Laufnummer>, z. B. 2.0.17 – die Build-Nummer ist der Android-versionCode
//   lokal:              <package.json-Version>-dev, Build 0
// Überschreibbar mit APP_VERSION, APP_BUILD, APP_DATE (z. B. für Tests).
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { ROOT } from "./load-data.mjs";

function gitCommit() {
  try { return execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch (e) { return ""; }
}
function defaultRepo() {
  const m = fs.readFileSync(path.join(ROOT, "data/meta.js"), "utf8").match(/repo:\s*"([^"]+)"/);
  return m ? m[1] : "";
}

export function versionInfo(env = process.env) {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  const [major, minor] = pkg.version.split(".");
  const build = parseInt(env.APP_BUILD || env.GITHUB_RUN_NUMBER || "0", 10) || 0;
  return {
    version: env.APP_VERSION || (build ? `${major}.${minor}.${build}` : `${pkg.version}-dev`),
    build,
    commit: (env.GITHUB_SHA || gitCommit()).slice(0, 7),
    date: env.APP_DATE || new Date().toISOString().slice(0, 16) + "Z",
    repo: env.GITHUB_REPOSITORY || defaultRepo()
  };
}

/** Inhalt von js/version.js für einen Build. */
export function versionJs(info) {
  return `/* Versionsangaben – beim Build erzeugt (tools/lib/version.mjs). */\nself.PPVersion = ${JSON.stringify(info)};\n`;
}
