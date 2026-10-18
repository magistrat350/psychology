import test from "node:test";
import assert from "node:assert/strict";
import http from "http";
import { checkAll, classify } from "../../tools/check-links.mjs";
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
