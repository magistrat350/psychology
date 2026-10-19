import test from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import vm from "vm";
import { ROOT } from "../../tools/lib/load-data.mjs";
import { versionInfo, versionJs } from "../../tools/lib/version.mjs";
import { buildWeb } from "../../tools/build-web.mjs";

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
const [major, minor] = pkg.version.split(".");

test("Versionsschema: major.minor aus package.json, Build-Nummer aus GitHub Actions", () => {
  const ci = versionInfo({ GITHUB_RUN_NUMBER: "17", GITHUB_SHA: "0123456789abcdef", GITHUB_REPOSITORY: "o/r" });
  assert.equal(ci.version, `${major}.${minor}.17`);
  assert.equal(ci.build, 17);
  assert.equal(ci.commit, "0123456");
  assert.equal(ci.repo, "o/r");
  const local = versionInfo({});
  assert.equal(local.version, `${pkg.version}-dev`);
  assert.equal(local.build, 0);
  assert.equal(local.repo, "magistrat350/psychology");
  assert.equal(versionInfo({ APP_VERSION: "9.9.9", APP_BUILD: "99" }).version, "9.9.9");
});

test("js/version.js ist ausführbar und im Repository als Entwicklungsstand markiert", () => {
  const run = (code) => { const ctx = { self: {} }; vm.runInNewContext(code, ctx); return ctx.self.PPVersion; };
  assert.equal(run(fs.readFileSync(path.join(ROOT, "js/version.js"), "utf8")).version, "dev");
  const info = versionInfo({ APP_VERSION: "2.0.3", APP_BUILD: "3" });
  assert.deepEqual(JSON.parse(JSON.stringify(run(versionJs(info)))), info);
});

test("www/-Build: Version, Service-Worker-Cache und Capacitor-Laufzeit", () => {
  const out = path.join(ROOT, "dist/www-unit");
  const env = { APP_VERSION: "2.0.42", APP_BUILD: "42", GITHUB_SHA: "abcdef1234", APP_DATE: "2026-10-18T12:00Z" };
  buildWeb({ out, env });
  assert.match(fs.readFileSync(path.join(out, "js/version.js"), "utf8"), /"version":"2\.0\.42"/);
  assert.match(fs.readFileSync(path.join(out, "sw.js"), "utf8"), /const VERSION = "psychopfad-2\.0\.42";/);
  assert.ok(!fs.existsSync(path.join(out, "js/capacitor.js")), "Web-Build ohne Capacitor");
  assert.ok(fs.existsSync(path.join(out, "data/datasets/therapie.csv")));
  buildWeb({ out, env, android: true });
  const html = fs.readFileSync(path.join(out, "index.html"), "utf8");
  assert.ok(fs.existsSync(path.join(out, "js/capacitor.js")));
  assert.ok(html.indexOf("js/capacitor.js") < html.indexOf("js/version.js") && html.indexOf("js/version.js") < html.indexOf("js/app.js"));
  fs.rmSync(out, { recursive: true, force: true });
});

test("Capacitor-Konfiguration passt zum Build", () => {
  const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "capacitor.config.json"), "utf8"));
  assert.equal(cfg.webDir, "www");
  assert.match(cfg.appId, /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/);
  for (const p of ["@capacitor/app", "@capacitor/filesystem", "@capacitor/share", "@capacitor/local-notifications", "@capacitor/android", "@capacitor/core"]) assert.ok(pkg.dependencies[p], `${p} fehlt`);
  for (const f of ["icon-only.png", "icon-foreground.png", "icon-background.png", "splash.png", "splash-dark.png"]) assert.ok(fs.existsSync(path.join(ROOT, "assets", f)), `assets/${f} fehlt`);
  // Benachrichtigungssymbol: im Workflow nach res/drawable kopiert, Name muss zur Konfiguration passen
  assert.equal(cfg.plugins.LocalNotifications.smallIcon, "ic_stat_psychopfad");
  const icon = fs.readFileSync(path.join(ROOT, "assets/notification-icon.xml"), "utf8");
  assert.match(icon, /<vector[\s\S]*android:pathData="[^"]+"[\s\S]*<\/vector>/);
  const wf = fs.readFileSync(path.join(ROOT, ".github/workflows/build.yml"), "utf8");
  assert.ok(wf.includes("res/drawable/ic_stat_psychopfad.xml"), "Workflow kopiert das Benachrichtigungssymbol nicht");
});
