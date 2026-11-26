// Serviceability audit: real Swiggy data for the deck's "remote campus" claim.
//
// After signing in once (node server.js, then open http://localhost:5173/auth/login), run:
//   NODE_USE_ENV_PROXY=1 is only needed behind a proxy.
//   node prototype/tools/serviceability-audit.js ["<saved address tag for your GIM hostel>"]
//
// For each cuisine it asks Swiggy MCP (food.search_restaurants) how many restaurants deliver to
// (a) your saved Swiggy addresses (save your GIM hostel address in the Swiggy app first) and
// (b) Panaji city centre. It writes research/survey/serviceability.json, which the deck reads.
// It only reads data; it never touches carts or orders.
const fs = require("fs");
const path = require("path");
const { callTool } = require("../server.js");

const QUERIES = ["biryani", "pizza", "thali", "burger", "rolls", "chinese"];
const PANAJI = { latitude: 15.4909, longitude: 73.8278 };

async function count(query, loc) {
  let total = 0, offset = 0;
  for (let page = 0; page < 5; page++) {
    const r = await callTool("food", "search_restaurants", { query, ...loc, ...(offset ? { offset } : {}) });
    const open = (r.restaurants || []).filter((x) => x.id && (!x.availabilityStatus || /open|available/i.test(x.availabilityStatus)));
    total += open.length;
    if (!r.hasMore || r.nextOffset == null) break;
    offset = r.nextOffset;
  }
  return total;
}

(async () => {
  const addr = await callTool("food", "get_addresses", {});
  const targets = (addr.addresses || []).map((a) => ({ label: a.addressTag || a.addressLine.slice(0, 40), loc: { addressId: a.id } }));
  targets.push({ label: "Panaji city centre", loc: PANAJI });
  const out = { checkedAt: new Date().toISOString(), queries: QUERIES, campusLabel: process.argv[2] || targets[0].label, results: [] };
  for (const t of targets) {
    const per = {};
    for (const q of QUERIES) per[q] = await count(q, t.loc);
    const sum = Object.values(per).reduce((a, b) => a + b, 0);
    out.results.push({ label: t.label, perQuery: per, total: sum });
    console.log(`${t.label.padEnd(42)} ${sum} restaurant results  ${JSON.stringify(per)}`);
  }
  const file = path.join(__dirname, "..", "..", "research", "survey", "serviceability.json");
  fs.writeFileSync(file, JSON.stringify(out, null, 2));
  console.log("\nWrote", file, "(campus = " + out.campusLabel + "). Pass a different saved-address tag as the first argument if needed, then rebuild the deck.");
})().catch((e) => { console.error(e.message || e); process.exit(1); });
