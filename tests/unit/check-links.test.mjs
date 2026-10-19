import test from "node:test";
import assert from "node:assert/strict";
import http from "http";
import { checkAll, classify, doiApiUrl, sameStatus, issueMarkdown } from "../../tools/check-links.mjs";
import { loadData, collectLinks, isSearchUrl } from "../../tools/lib/load-data.mjs";

test("Linkprüfer erkennt erreichbare, defekte und unklare Links (lokaler Testserver)", async () => {
  const server = http.createServer((req, res) => {
    const p = req.url;
    if (p === "/ok") { res.writeHead(200); return res.end("ok"); }
    if (p === "/weg") { res.writeHead(404); return res.end(); }
    if (p === "/umzug") { res.writeHead(301, { Location: "/ok" }); return res.end(); }
    if (p === "/alt/seite") { res.writeHead(302, { Location: "/" }); return res.end(); }
    if (p === "/") { res.writeHead(200); return res.end("home"); }
    if (p === "/nurget") { if (req.method === "HEAD") { res.writeHead(405); return res.end(); } res.writeHead(200); return res.end("ok"); }
    if (p === "/gesperrt") { res.writeHead(403); return res.end(); }
    if (p === "/langsam") { setTimeout(() => { res.writeHead(200); res.end(); }, 2000); return; }
    res.writeHead(500); res.end();
  });
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const res = await checkAll(["/ok", "/weg", "/umzug", "/alt/seite", "/nurget", "/gesperrt", "/langsam"].map((p) => base + p), { timeout: 500 });
  server.close();
  const st = Object.fromEntries(res.map((r) => [new URL(r.url).pathname, r.status]));
  assert.deepEqual(st, { "/ok": "ok", "/weg": "defekt", "/umzug": "ok", "/alt/seite": "unklar", "/nurget": "ok", "/gesperrt": "unklar", "/langsam": "unklar" });
});

test("Netzwerkfehler-Klassifikation", () => {
  assert.equal(classify({ error: "ENOTFOUND" }).status, "defekt");
  assert.equal(classify({ error: "Zeitüberschreitung" }).status, "unklar");
  assert.equal(classify({ code: 410 }).status, "defekt");
});

test("Alle Datenlinks werden gesammelt, Suchlinks erkannt", () => {
  const links = collectLinks(loadData());
  assert.ok(links.length > 300);
  assert.ok(links.every((l) => l.url.startsWith("https://")));
  assert.ok(isSearchUrl("https://www.youtube.com/results?search_query=x"));
  assert.ok(!isSearchUrl("https://openstax.org/details/books/psychology-2e"));
});

test("DOI-Links werden über die DOI-Registrierung geprüft", () => {
  assert.equal(doiApiUrl("https://doi.org/10.1037/h0043158"), "https://doi.org/api/handles/10.1037/h0043158");
  assert.equal(doiApiUrl("https://dx.doi.org/10.1016/0749-5978(91)90020-T"), "https://doi.org/api/handles/10.1016/0749-5978(91)90020-T");
  assert.equal(doiApiUrl("https://openstax.org/books/psychology-2e/pages/6-introduction"), null);
});

test("Wöchentlicher Lauf: unveränderte Befunde erkennen, Issue-Text", () => {
  const a = { "https://a": { status: "ok", detail: "" }, "https://b": { status: "defekt", detail: "HTTP 404" } };
  assert.equal(sameStatus(a, { "https://a": { status: "ok", detail: "→ x" }, "https://b": { status: "defekt", detail: "HTTP 410" } }), true);
  assert.equal(sameStatus(a, { "https://a": { status: "ok" }, "https://b": { status: "ok" } }), false);
  assert.equal(sameStatus(a, { "https://a": { status: "ok" } }), false);
  const results = { "https://b": { status: "defekt", detail: "HTTP 404", title: "Titel | mit Strich", where: ["A1 · Materialien"] }, "https://c": { status: "unklar", detail: "HTTP 403", title: "C", where: ["B1"] } };
  const md = issueMarkdown({ checkedAt: "2026-10-19T04:23:00Z", summary: { total: 2, ok: 0, defekt: 1, unklar: 1 }, results }, "https://github.com/o/r/actions/runs/1");
  assert.match(md, /## Defekte Links \(1\)/);
  assert.match(md, /Titel \/ mit Strich \| https:\/\/b \| A1 · Materialien \| HTTP 404/);
  assert.match(md, /Unklare Links \(1\)/);
  assert.match(md, /actions\/runs\/1/);
  const many = {}; for (let i = 0; i < 500; i++) many["https://x/" + i] = { status: "defekt", detail: "HTTP 404", title: "T".repeat(200), where: ["W".repeat(300)] };
  assert.ok(issueMarkdown({ checkedAt: "2026-10-19T00:00:00Z", summary: { total: 500, ok: 0, defekt: 500, unklar: 0 }, results: many }).length < 65536, "passt in ein Issue");
});
