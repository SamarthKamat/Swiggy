// CampusRun prototype server: serves the webapp and proxies live calls to Swiggy MCP.
//   node server.js                               -> http://localhost:5173 (demo mode works with no token)
//   SWIGGY_MCP_TOKEN=<oauth token> node server.js -> "Live Swiggy MCP" mode in the UI also works
//
// Swiggy MCP uses MCP Streamable HTTP with OAuth 2.1 (PKCE). Get a token through any MCP client
// that has finished the Swiggy OAuth flow (see Swiggy Builders Club docs), then pass it here.
// Never commit the token.
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 5173;
const TOKEN = process.env.SWIGGY_MCP_TOKEN || "";
const BASE = process.env.SWIGGY_MCP_BASE || "https://mcp.swiggy.com";
const SERVER_PATHS = { food: "/food", instamart: "/im", dineout: "/dineout" };
const sessions = {};
let rpcId = 1;

const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml" };

async function rpc(server, method, params, isNotification = false) {
  const url = BASE + SERVER_PATHS[server];
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
    Authorization: "Bearer " + TOKEN,
  };
  if (sessions[server]) headers["Mcp-Session-Id"] = sessions[server];
  const body = { jsonrpc: "2.0", method, params };
  if (!isNotification) body.id = rpcId++;
  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  const sid = res.headers.get("mcp-session-id");
  if (sid) sessions[server] = sid;
  if (isNotification) return null;
  if (!res.ok) throw new Error(`${server} ${method} -> HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const ct = res.headers.get("content-type") || "";
  const text = await res.text();
  let msg;
  if (ct.includes("text/event-stream")) {
    const datas = text.split("\n").filter((l) => l.startsWith("data:")).map((l) => l.slice(5).trim());
    msg = datas.map((d) => { try { return JSON.parse(d); } catch { return null; } }).filter(Boolean).find((m) => m.id === body.id);
  } else msg = JSON.parse(text);
  if (!msg) throw new Error("Empty MCP response");
  if (msg.error) throw new Error(msg.error.message || JSON.stringify(msg.error));
  return msg.result;
}

async function ensureSession(server) {
  if (sessions[server]) return;
  await rpc(server, "initialize", {
    protocolVersion: "2025-06-18",
    capabilities: {},
    clientInfo: { name: "campusrun-prototype", version: "0.1.0" },
  });
  await rpc(server, "notifications/initialized", {}, true);
}

async function callTool(server, tool, args) {
  await ensureSession(server);
  const result = await rpc(server, "tools/call", { name: tool, arguments: args });
  if (result.structuredContent) return result.structuredContent;
  const txt = (result.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n");
  try { return JSON.parse(txt); } catch { return { text: txt }; }
}

http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/mcp") {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", async () => {
      try {
        if (!TOKEN) throw new Error("SWIGGY_MCP_TOKEN is not set. Use demo mode, or restart server.js with a token.");
        const { server, tool, args } = JSON.parse(raw);
        if (!SERVER_PATHS[server]) throw new Error("Unknown server " + server);
        const out = await callTool(server, tool, args || {});
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(out));
      } catch (e) {
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: String(e.message || e) }));
      }
    });
    return;
  }
  if (req.method === "GET" && req.url === "/api/tools") {
    // Lists the live tool schemas so argument names can be checked against Swiggy's servers.
    try {
      const out = {};
      for (const s of Object.keys(SERVER_PATHS)) { await ensureSession(s); out[s] = await rpc(s, "tools/list", {}); }
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(out, null, 2));
    } catch (e) { res.writeHead(502); res.end(String(e.message || e)); }
    return;
  }
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  const file = path.join(__dirname, urlPath === "/" ? "index.html" : urlPath);
  if (!file.startsWith(__dirname)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
}).listen(PORT, () => console.log(`CampusRun prototype → http://localhost:${PORT}  (live MCP: ${TOKEN ? "token set" : "demo only"})`));
