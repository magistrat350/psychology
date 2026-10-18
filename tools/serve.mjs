// Minimaler statischer Server zum Testen der PWA: `npm run serve` → http://localhost:8080
import http from "http";
import fs from "fs";
import path from "path";
import { ROOT } from "./lib/load-data.mjs";

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json",
  ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png", ".csv": "text/csv; charset=utf-8", ".md": "text/markdown; charset=utf-8", ".txt": "text/plain; charset=utf-8" };

export function createServer(root = ROOT) {
  return http.createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = path.normalize(path.join(root, p));
    if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404, { "Content-Type": "text/plain" }); res.end("Nicht gefunden"); return; }
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" });
      res.end(buf);
    });
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const port = +(process.env.PORT || 8080);
  createServer().listen(port, () => console.log(`PsychoPfad Wien läuft auf http://localhost:${port}  (Strg+C beendet)`));
}
