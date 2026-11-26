// CampusRun prototype server: serves the webapp and connects it to the real Swiggy MCP servers.
//
//   node server.js       -> http://localhost:5173
//
// Demo mode needs nothing. For LIVE mode, click "Sign in with Swiggy" in the app (or open
// http://localhost:5173/auth/login). This runs Swiggy's documented OAuth 2.1 + PKCE flow:
//   1. Dynamic Client Registration at POST https://mcp.swiggy.com/auth/register (RFC 7591)
//   2. Browser redirect to /auth/authorize, where you sign in with your Swiggy phone number + OTP
//   3. Code exchange at POST /auth/token. The access token lasts 5 days and is refreshed automatically.
// The token is kept in .swiggy-token.json next to this file (git-ignored). Never commit it.
// You can also pass a token directly: SWIGGY_MCP_TOKEN=<token> node server.js
//
// Swiggy runs MCP Streamable HTTP in stateless JSON mode (no Mcp-Session-Id), so each
// tools/call is a single JSON-RPC POST with the Bearer token.
const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 5173);
const BASE = process.env.SWIGGY_MCP_BASE || "https://mcp.swiggy.com";
const REDIRECT_URI = `http://localhost:${PORT}/auth/callback`;
const TOKEN_FILE = path.join(__dirname, ".swiggy-token.json");
const SERVER_PATHS = { food: "/food", instamart: "/im", dineout: "/dineout" };
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".png": "image/png", ".svg": "image/svg+xml", ".jpg": "image/jpeg" };

// ---------------- token store ----------------
let store = { client_id: null, access_token: process.env.SWIGGY_MCP_TOKEN || null, refresh_token: null, expires_at: null };
try { if (!process.env.SWIGGY_MCP_TOKEN) store = { ...store, ...JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8")) }; } catch {}
const save = () => fs.writeFileSync(TOKEN_FILE, JSON.stringify(store, null, 2), { mode: 0o600 });
const pending = {}; // state -> { verifier }

async function registerClient() {
  if (store.client_id) return store.client_id;
  const res = await fetch(BASE + "/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_name: "CampusRun prototype (local)",
      redirect_uris: [REDIRECT_URI],
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
      scope: "mcp:tools",
    }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.client_id) throw new Error("Client registration failed: " + res.status + " " + JSON.stringify(body));
  store.client_id = body.client_id;
  save();
  return store.client_id;
}

async function tokenRequest(params) {
  const res = await fetch(BASE + "/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: store.client_id, ...params }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.access_token) throw new Error("Token request failed: " + res.status + " " + JSON.stringify(body));
  store.access_token = body.access_token;
  if (body.refresh_token) store.refresh_token = body.refresh_token;
  store.expires_at = Date.now() + (body.expires_in || 432000) * 1000;
  save();
}

async function ensureToken() {
  if (!store.access_token) throw Object.assign(new Error("Not signed in to Swiggy. Click 'Sign in with Swiggy' first."), { code: 401 });
  if (store.expires_at && store.refresh_token && Date.now() > store.expires_at - 5 * 60000) {
    await tokenRequest({ grant_type: "refresh_token", refresh_token: store.refresh_token });
  }
  return store.access_token;
}

// ---------------- MCP client ----------------
let rpcId = 1;
const initialized = {};

async function rpc(server, method, params, { notification = false, retried = false } = {}) {
  const token = await ensureToken();
  const body = { jsonrpc: "2.0", method, params };
  if (!notification) body.id = rpcId++;
  const res = await fetch(BASE + SERVER_PATHS[server], {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", Authorization: "Bearer " + token },
    body: JSON.stringify(body),
  });
  if (res.status === 401 && !retried && store.refresh_token) {
    await tokenRequest({ grant_type: "refresh_token", refresh_token: store.refresh_token });
    return rpc(server, method, params, { notification, retried: true });
  }
  if (notification) return null;
  const text = await res.text();
  if (!res.ok) throw Object.assign(new Error(`${server}.${method} -> HTTP ${res.status}: ${text.slice(0, 300)}`), { code: res.status });
  let msg;
  if ((res.headers.get("content-type") || "").includes("text/event-stream")) {
    msg = text.split("\n").filter((l) => l.startsWith("data:")).map((l) => { try { return JSON.parse(l.slice(5)); } catch { return null; } }).find((m) => m && m.id === body.id);
  } else msg = JSON.parse(text);
  if (!msg) throw new Error("Empty MCP response");
  if (msg.error) throw new Error(msg.error.message || JSON.stringify(msg.error));
  return msg.result;
}

async function ensureInit(server) {
  if (initialized[server]) return;
  await rpc(server, "initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "campusrun-prototype", version: "0.2.0" } });
  await rpc(server, "notifications/initialized", {}, { notification: true });
  initialized[server] = true;
}

// Per Swiggy docs: read structuredContent; if missing, parse the JSON envelope in content[0].text.
function unwrap(result) {
  let env = result.structuredContent;
  if (!env || (typeof env === "object" && !Object.keys(env).length)) {
    const txt = (result.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n");
    try { env = JSON.parse(txt); } catch { env = { success: !result.isError, message: txt }; }
  }
  if (result.isError || env.success === false) throw new Error((env.error && env.error.message) || env.message || "Swiggy MCP tool error");
  if (env.data === undefined || env.data === null || typeof env.data !== "object") return env;
  const { data, ...rest } = env;
  return { ...rest, ...data };
}

async function callTool(server, tool, args) {
  await ensureInit(server);
  return unwrap(await rpc(server, "tools/call", { name: tool, arguments: args }));
}

// ---------------- HTTP ----------------
function json(res, code, obj) { res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj, null, 2)); }
function readBody(req) { return new Promise((r) => { let s = ""; req.on("data", (c) => (s += c)); req.on("end", () => r(s)); }); }

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (url.pathname === "/auth/status") {
      return json(res, 200, { signedIn: !!store.access_token, expiresAt: store.expires_at, clientRegistered: !!store.client_id });
    }
    if (url.pathname === "/auth/login") {
      await registerClient();
      const verifier = crypto.randomBytes(32).toString("base64url");
      const challenge = crypto.createHash("sha256").update(verifier).digest("base64url");
      const state = crypto.randomBytes(16).toString("hex");
      pending[state] = { verifier };
      const q = new URLSearchParams({ response_type: "code", client_id: store.client_id, redirect_uri: REDIRECT_URI, code_challenge: challenge, code_challenge_method: "S256", state, scope: "mcp:tools" });
      res.writeHead(302, { Location: `${BASE}/auth/authorize?${q}` });
      return res.end();
    }
    if (url.pathname === "/auth/callback") {
      const state = url.searchParams.get("state"), code = url.searchParams.get("code");
      const p = pending[state];
      if (!p || !code) throw new Error("Sign-in failed: missing or unknown state/code. Start again at /auth/login.");
      delete pending[state];
      await tokenRequest({ grant_type: "authorization_code", code, code_verifier: p.verifier, redirect_uri: REDIRECT_URI });
      res.writeHead(302, { Location: "/?mode=live" });
      return res.end();
    }
    if (url.pathname === "/auth/logout") {
      store.access_token = store.refresh_token = store.expires_at = null;
      save();
      return json(res, 200, { signedIn: false });
    }
    if (req.method === "POST" && url.pathname === "/api/mcp") {
      const { server: s, tool, args } = JSON.parse(await readBody(req));
      if (!SERVER_PATHS[s]) throw new Error("Unknown server " + s);
      return json(res, 200, await callTool(s, tool, args || {}));
    }
    if (url.pathname === "/api/tools") {
      const out = {};
      for (const s of Object.keys(SERVER_PATHS)) {
        await ensureInit(s);
        const list = await rpc(s, "tools/list", {});
        out[s] = (list.tools || []).map((t) => ({ name: t.name, required: (t.inputSchema && t.inputSchema.required) || [], properties: Object.keys((t.inputSchema && t.inputSchema.properties) || {}) }));
      }
      return json(res, 200, out);
    }
  } catch (e) {
    return json(res, e.code === 401 ? 401 : 502, { error: String(e.message || e) });
  }

  // static files
  const file = path.join(__dirname, url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname));
  if (!file.startsWith(__dirname) || path.basename(file).startsWith(".")) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end("Not found"); }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
    res.end(data);
  });
});

if (require.main === module) {
  server.listen(PORT, () => console.log(`CampusRun prototype → http://localhost:${PORT}   (Swiggy: ${store.access_token ? "signed in" : "not signed in; demo mode works, or open /auth/login"})`));
}
module.exports = { callTool, ensureToken };
