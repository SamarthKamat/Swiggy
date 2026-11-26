// Swiggy MCP client used by the CampusRun prototype.
//
// Two transports:
//   MOCK : answers from data.js, so the demo runs offline and the same way every time (good for the video).
//   LIVE : sends JSON-RPC `tools/call` to Swiggy's MCP servers through server.js
//          (https://mcp.swiggy.com/{food|im|dineout}, OAuth 2.1 token set via SWIGGY_MCP_TOKEN).
//
// Every call goes out as an event, and the "MCP trace" console shows it, so judges can see
// which Swiggy MCP capability powers each step of the user journey.
//
// Tool names follow Swiggy Builders Club docs (Food: search_restaurants, search_menu,
// get_restaurant_menu, update_food_cart, get_food_cart, place_food_order, track_food_order;
// Dineout: book_table). Check argument names against the live tool schema (tools/list) before a live run.

(function () {
  const listeners = [];
  const D = () => window.DEMO;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  let cart = { restaurantId: null, items: [] };
  let imCart = [];
  let orderSeq = 4100;

  const SERVERS = { food: "mcp.swiggy.com/food", instamart: "mcp.swiggy.com/im", dineout: "mcp.swiggy.com/dineout" };

  function emit(evt) { listeners.forEach((fn) => fn(evt)); }

  const mock = {
    food: {
      async search_restaurants({ query = "", veg }) {
        const q = query.toLowerCase();
        let list = D().restaurants.filter((r) => !q || r.tags.some((t) => q.includes(t) || t.includes(q)) || r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q));
        if (!list.length) list = D().restaurants.slice();
        if (veg) list = list.filter((r) => r.veg);
        return { restaurants: list.map(({ id, name, cuisine, rating, priceForOne, cluster }) => ({ id, name, cuisine, rating, priceForOne, cluster })) };
      },
      async search_menu({ query = "" }) {
        const q = query.toLowerCase();
        const hits = [];
        Object.entries(D().menus).forEach(([rid, items]) => items.forEach((it) => { if (it.name.toLowerCase().includes(q)) hits.push({ restaurantId: rid, ...it }); }));
        return { items: hits };
      },
      async get_restaurant_menu({ restaurantId }) { return { restaurantId, items: D().menus[restaurantId] || [] }; },
      async update_food_cart({ restaurantId, items }) {
        cart = { restaurantId, items: items.map((i) => ({ ...i })) };
        const menu = D().menus[restaurantId] || [];
        const subtotal = cart.items.reduce((s, i) => s + (menu.find((m) => m.id === i.itemId)?.price || 0) * i.quantity, 0);
        return { cart: { restaurantId, items: cart.items, subtotal } };
      },
      async get_food_cart() { return { cart }; },
      async place_food_order({ paymentMethod = "UPI", scheduledSlot }) {
        orderSeq += 1;
        return { orderId: "SWG-" + orderSeq, status: "CONFIRMED", paymentMethod, scheduledSlot };
      },
      async track_food_order({ orderId }) { return { orderId, status: "IN_TRANSIT", etaMin: 18 }; },
    },
    instamart: {
      async search_products({ query = "" }) {
        const q = query.toLowerCase();
        const res = D().instamart.filter((p) => !q || p.name.toLowerCase().includes(q));
        return { products: res.length ? res : D().instamart };
      },
      async update_cart({ items }) { imCart = items; return { cart: { items } }; },
    },
    dineout: {
      async search_restaurants({ area = "", partySize = 2 }) {
        const res = D().dineout.filter((r) => !area || r.area.toLowerCase().includes(area.toLowerCase()));
        return { restaurants: (res.length ? res : D().dineout).map((r) => ({ ...r, partySize })) };
      },
      async book_table({ restaurantId, slot, partySize }) {
        const r = D().dineout.find((x) => x.id === restaurantId);
        return { bookingId: "DO-" + Math.floor(100000 + Math.random() * 899999), restaurant: r?.name, slot, partySize, status: "CONFIRMED", offer: `${r?.studentOff || 20}% Student Rewards` };
      },
    },
  };

  async function callLive(server, tool, args) {
    const res = await fetch("/api/mcp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ server, tool, args }),
    });
    if (!res.ok) throw new Error("Live MCP call failed: " + res.status);
    return res.json();
  }

  const MCP = {
    mode: "mock",
    servers: SERVERS,
    onCall(fn) { listeners.push(fn); },
    async call(server, tool, args = {}) {
      const id = Math.random().toString(36).slice(2, 8);
      const started = performance.now();
      emit({ id, phase: "request", server, tool, args, endpoint: SERVERS[server] });
      let result;
      try {
        if (MCP.mode === "live") result = await callLive(server, tool, args);
        else { await wait(220 + Math.random() * 260); result = await mock[server][tool](args); }
      } catch (e) {
        emit({ id, phase: "error", server, tool, error: String(e) });
        throw e;
      }
      emit({ id, phase: "response", server, tool, result, ms: Math.round(performance.now() - started) });
      return result;
    },
  };

  // CampusRun service. This is the NEW capability we propose Swiggy adds: scheduled, pooled
  // campus delivery. It is not part of Swiggy MCP today; the prototype simulates it locally.
  const CampusRun = {
    state: {},
    init(slots) {
      const fills = { lunch: 27, dinner: 31, midnight: 18 };
      slots.forEach((s) => (this.state[s.id] = { orders: fills[s.id] || 10, capacity: s.capacity }));
    },
    async joinRun(slotId, orderId, pod) {
      emit({ id: "cr" + orderId, phase: "request", server: "campusrun", tool: "join_run", args: { slotId, orderId, podSize: pod }, endpoint: "campusrun.swiggy (proposed)" });
      await wait(250);
      this.state[slotId].orders += 1;
      const res = { runId: "RUN-" + slotId.toUpperCase() + "-26", position: this.state[slotId].orders, dropOtp: String(Math.floor(1000 + Math.random() * 8999)) };
      emit({ id: "cr" + orderId, phase: "response", server: "campusrun", tool: "join_run", result: res, ms: 250 });
      return res;
    },
  };

  window.MCP = MCP;
  window.CampusRun = CampusRun;
})();
