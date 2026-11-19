// serve.mjs - three local servers that act as three origins (CORS open, like GitHub Pages):
//   http://127.0.0.1:8080  the Appeal Desk site (this folder)
//   http://localhost:8081  the rule networks (this folder's peers/)
//   http://localhost:8082  this folder again, so partner-demo/ (an example agent site) reaches ../runtime like it will when deployed
// Usage: node serve.mjs   Apache-2.0
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const here = path.dirname(fileURLToPath(import.meta.url));
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".css": "text/css; charset=utf-8", ".ttf": "font/ttf", ".txt": "text/plain; charset=utf-8", ".md": "text/markdown; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png" };
function serve(port, root, host = "0.0.0.0") {
  const srv = http.createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    if (req.method === "OPTIONS") { res.writeHead(204); return res.end(); }
    let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (p.includes("..")) { res.writeHead(400); return res.end("bad path"); }
    let file = path.join(root, p);
    try { if ((await stat(file)).isDirectory()) file = path.join(file, "index.html"); } catch { /* fall through to 404 */ }
    try {
      const body = await readFile(file);
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
      res.end(body);
    } catch { res.writeHead(404, { "Content-Type": "text/plain" }); res.end("not found"); }
  });
  return new Promise((r) => srv.listen(port, host, () => r(srv)));
}
export async function startAll() {
  return [await serve(8080, here), await serve(8081, path.join(here, "peers")), await serve(8082, here)];
}
if (import.meta.url === `file://${process.argv[1]}`) { await startAll(); console.log("site http://127.0.0.1:8080  peers http://localhost:8081  partner http://localhost:8082"); }
