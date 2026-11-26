// Swiggy MCP layer for the CampusRun prototype.
//
// The app never touches raw tools. It calls SwiggyAPI, which calls the REAL Swiggy MCP tool names
// with their documented arguments (Swiggy Builders Club reference, Nov 2026):
//   Food      (mcp.swiggy.com/food):    get_addresses, search_restaurants, get_restaurant_menu,
//                                       update_food_cart, get_food_cart, place_food_order, track_food_order
//   Instamart (mcp.swiggy.com/im):      search_products, update_cart
//   Dineout   (mcp.swiggy.com/dineout): search_restaurants_dineout, get_available_slots, book_table
//
// Transports:
//   mock: offline answers shaped exactly like Swiggy's documented output schemas (built from data.js)
//   live: POST /api/mcp -> server.js -> Swiggy MCP with your OAuth token (Sign in with Swiggy)
// The same normalisers parse both, so the demo exercises the real response contract.
(function () {
  const listeners = [];
  const D = () => window.DEMO;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const SERVERS = { food: "mcp.swiggy.com/food", instamart: "mcp.swiggy.com/im", dineout: "mcp.swiggy.com/dineout", campusrun: "campusrun (proposed Swiggy service)" };
  const emit = (e) => listeners.forEach((fn) => fn(e));
  let orderSeq = 4100;
  let mockCart = null;

  // ---------- mock server: real schemas, demo data ----------
  const restOut = (r) => ({ id: r.id, name: r.name, cuisines: r.cuisine.split(" · "), avgRating: r.rating, costForTwo: `₹${r.priceForOne * 2} for two`, areaName: r.cluster, deliveryTimeMinutes: 35, veg: r.veg });
  const mock = {
    food: {
      get_addresses: () => ({ addresses: [{ id: "addr_campus", addressLine: "Main Gate Drop Point, campus", phoneNumber: "XXXXXX0000", addressTag: "Campus" }], resolution: { defaultAddressId: "addr_campus", resolutionSource: "ranked_saved_address", needsUserClarification: false, candidateAddressIds: ["addr_campus"] } }),
      search_restaurants: ({ query = "" }) => {
        const q = query.toLowerCase();
        let list = D().restaurants.filter((r) => r.tags.some((t) => q.includes(t) || t.includes(q)) || r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q));
        if (!list.length) list = D().restaurants.slice();
        return { restaurants: list.map(restOut), dishes: [], query, totalRestaurants: list.length };
      },
      get_restaurant_menu: ({ restaurantId }) => {
        const r = D().restaurants.find((x) => x.id === restaurantId);
        return { restaurant: { id: restaurantId, name: r?.name, avgRating: r?.rating, isOpen: true }, categories: [{ title: "Recommended", items: (D().menus[restaurantId] || []).map((m) => ({ id: m.id, name: m.name, price: m.price, isVeg: m.veg, inStock: 1 })) }], totalCategories: 1, page: 1, pageSize: 8, hasMore: false };
      },
      update_food_cart: ({ restaurantId, restaurantName, cartItems }) => {
        const menu = D().menus[restaurantId] || [];
        const items = cartItems.map((c) => { const m = menu.find((x) => x.id === c.menu_item_id) || {}; return { menu_item_id: c.menu_item_id, name: m.name, quantity: c.quantity, is_veg: m.veg, subtotal: m.price * c.quantity, total: m.price * c.quantity, final_price: m.price * c.quantity }; });
        const item_total = items.reduce((a, b) => a + b.total, 0);
        mockCart = { cart_id: "cart_demo", restaurant: { id: restaurantId, name: restaurantName }, items, item_count: items.length, pricing: { item_total } };
        return { data: mockCart, statusCode: 0 };
      },
      get_food_cart: () => ({ data: mockCart, statusCode: 0 }),
      place_food_order: ({ paymentMethod = "Cash" }) => { orderSeq += 1; return { orderId: "SWG-" + orderSeq, status: "CONFIRMED", normalizedStatus: "success", items: [], restaurantName: mockCart?.restaurant?.name, totalAmount: mockCart?.pricing?.item_total, estimatedDelivery: null, deliveryAddress: "Main Gate Drop Point", paymentMethod }; },
      track_food_order: ({ orderId }) => ({ orders: [{ orderId, title: "On the way to campus", subtitle: "Part of your CampusRun", orderStatus: "IN_TRANSIT", etaText: "18 mins" }] }),
    },
    instamart: {
      search_products: ({ query = "" }) => {
        const q = query.toLowerCase();
        let res = D().instamart.filter((p) => p.name.toLowerCase().includes(q));
        if (!res.length) res = D().instamart;
        return { nextOffset: "", products: res.map((p) => ({ displayName: p.name, brand: "", inStock: true, isAvail: true, productId: p.id, parentProductId: p.id, variations: [{ spinId: "spin_" + p.id, skuId: "sku_" + p.id, quantityDescription: "", displayName: p.name, brandName: "", price: { mrp: p.price, offerPrice: p.price }, isInStockAndAvailable: true }] })) };
      },
      update_cart: ({ items }) => ({ items, reducedQuantityItems: [] }),
    },
    dineout: {
      search_restaurants_dineout: ({ latitude, longitude }) => ({ restaurants: D().dineout.map((r) => ({ id: r.id, name: r.name, cuisine: ["Goan", "Seafood"], locality: r.area, area: r.area, rating: { value: "4.3", count: 1200 }, costForTwo: `₹${r.costForTwo} for two`, offers: [{ offerTitle: `${r.studentOff}% off for students` }] })), latitude, longitude, total: D().dineout.length, offset: 0 }),
      get_available_slots: ({ restaurantId, date, latitude, longitude }) => {
        const r = D().dineout.find((x) => x.id === restaurantId);
        return { restaurantId, date, restaurantName: r?.name, latitude, longitude, slots: r.slots.map((t, i) => ({ isFree: true, slotId: 100 + i, displayTime: t, reservationTime: Math.floor(Date.now() / 1000) + 86400 * 2 + i * 1800, slotGroupName: "Dinner", availableInventory: 4, deals: [{ itemId: `${restaurantId}-free`, ticketId: "free", slotId: 100 + i, title: "Free table reservation", isFree: true }] })) };
      },
      book_table: ({ restaurantId, guestCount }) => { const r = D().dineout.find((x) => x.id === restaurantId); return { orderId: "DO-" + Math.floor(100000 + Math.random() * 899999), isDineout: true, restaurantName: r?.name, reservationDate: "Friday", reservationTime: "", guestCount, status: "CONFIRMED" }; },
    },
  };

  async function raw(server, tool, args) {
    const id = Math.random().toString(36).slice(2, 8);
    const t0 = performance.now();
    emit({ id, phase: "request", server, tool, args, endpoint: SERVERS[server] });
    try {
      let result;
      if (MCP.mode === "live") {
        const res = await fetch("/api/mcp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ server, tool, args }) });
        result = await res.json();
        if (!res.ok) throw new Error(result.error || "HTTP " + res.status);
      } else {
        await wait(200 + Math.random() * 250);
        result = mock[server][tool](args);
      }
      emit({ id, phase: "response", server, tool, result, ms: Math.round(performance.now() - t0) });
      return result;
    } catch (e) {
      emit({ id, phase: "error", server, tool, error: String(e.message || e) });
      throw e;
    }
  }

  // ---------- normalisers (Swiggy schema -> app model) ----------
  const num = (s) => { const m = String(s || "").replace(/,/g, "").match(/\d+(\.\d+)?/); return m ? Number(m[0]) : null; };
  const rupees = (p) => (p == null ? null : p > 5000 ? p / 100 : p); // some Swiggy price fields are in paise
  function flattenMenu(categories = []) {
    const out = [];
    const walk = (c) => { (c.items || []).forEach((i) => out.push(i)); (c.subcategories || []).forEach(walk); };
    categories.forEach(walk);
    return out.filter((i) => i.inStock !== 0 && i.price != null).map((i) => ({ id: i.id, name: i.name, price: rupees(i.price), veg: !!i.isVeg, hasVariants: !!i.hasVariants }));
  }

  const SwiggyAPI = {
    async addresses() {
      const r = await raw("food", "get_addresses", {});
      const list = r.addresses || [];
      const id = r.resolution?.defaultAddressId || list[0]?.id;
      return { list, address: list.find((a) => a.id === id) || null };
    },
    async searchRestaurants(query, loc) {
      const r = await raw("food", "search_restaurants", { query, ...loc });
      return (r.restaurants || []).filter((x) => x.id && (!x.availabilityStatus || /open|available/i.test(x.availabilityStatus))).map((x) => ({ id: x.id, name: x.name, cuisine: (x.cuisines || []).join(" · "), rating: x.avgRating || "–", priceForOne: (num(x.costForTwo) || 400) / 2, eta: x.deliveryTimeMinutes, area: x.areaName }));
    },
    async menu(restaurantId, loc) {
      const r = await raw("food", "get_restaurant_menu", { restaurantId, pageSize: 8, ...loc });
      return flattenMenu(r.categories).filter((i) => !i.hasVariants);
    },
    async setCart(restaurant, items, loc) {
      await raw("food", "update_food_cart", { restaurantId: restaurant.id, restaurantName: restaurant.name, cartItems: items.map((i) => ({ menu_item_id: i.itemId, quantity: i.qty })), ...loc });
      const c = await raw("food", "get_food_cart", loc.addressId ? { addressId: loc.addressId } : {});
      return c.data || c;
    },
    async placeOrder(addressId, note, paymentMethod = "Cash") {
      return raw("food", "place_food_order", { addressId, paymentMethod, noteToRestaurant: note });
    },
    async track(orderId) { const r = await raw("food", "track_food_order", { orderId }); return (r.orders || [])[0]; },
    async snacks(query, loc) {
      const r = await raw("instamart", "search_products", { query, ...loc });
      return (r.products || []).filter((p) => p.isAvail !== false).slice(0, 2).map((p) => { const v = p.variations[0]; return { id: v.spinId, spinId: v.spinId, skuId: v.skuId, name: v.displayName + (v.quantityDescription ? " · " + v.quantityDescription : ""), price: v.price.offerPrice }; });
    },
    async snacksToCart(products, addressId) {
      return raw("instamart", "update_cart", { ...(addressId ? { selectedAddressId: addressId } : {}), items: products.map((p) => ({ spinId: p.spinId, skuId: p.skuId, quantity: 1 })) });
    },
    async dineSearch(query, lat, lng) {
      const r = await raw("dineout", "search_restaurants_dineout", { query, latitude: lat, longitude: lng, limit: 5 });
      return (r.restaurants || []).map((x) => ({ id: x.id, name: x.name, area: x.locality || x.area, costForTwo: num(x.costForTwo), rating: x.rating?.value, offer: x.offers?.[0]?.offerTitle || "" }));
    },
    async dineSlots(restaurantId, date, lat, lng) {
      const r = await raw("dineout", "get_available_slots", { restaurantId, date, latitude: lat, longitude: lng });
      return (r.slots || []).filter((s) => s.availableInventory !== 0).slice(0, 4).map((s) => ({ ...s, deal: (s.deals || []).find((d) => d.isFree && !d.soldOut) || (s.deals || [])[0] }));
    },
    async book(restaurantId, slot, guestCount, lat, lng) {
      return raw("dineout", "book_table", { restaurantId, slotId: slot.slotId, itemId: slot.deal.itemId, reservationTime: slot.reservationTime, guestCount, latitude: lat, longitude: lng, paymentMethod: "Cash" });
    },
  };

  const MCP = { mode: "mock", servers: SERVERS, onCall: (fn) => listeners.push(fn) };

  // CampusRun run service: the NEW capability we propose Swiggy adds (scheduled, pooled campus
  // dispatch). It is not part of Swiggy MCP today, so the prototype simulates it locally.
  const CampusRun = {
    state: {},
    init(slots) { const fills = { lunch: 27, dinner: 31, midnight: 18 }; slots.forEach((s) => (this.state[s.id] = { orders: fills[s.id] || 10, capacity: s.capacity })); },
    async joinRun(slotId, orderId, podSize) {
      const id = "cr" + Math.random().toString(36).slice(2, 7);
      emit({ id, phase: "request", server: "campusrun", tool: "join_run", args: { slotId, orderId, podSize }, endpoint: SERVERS.campusrun });
      await wait(250);
      this.state[slotId].orders += 1;
      const res = { runId: "RUN-" + slotId.toUpperCase() + "-26", position: this.state[slotId].orders, dropOtp: String(Math.floor(1000 + Math.random() * 8999)) };
      emit({ id, phase: "response", server: "campusrun", tool: "join_run", result: res, ms: 250 });
      return res;
    },
  };

  window.MCP = MCP;
  window.SwiggyAPI = SwiggyAPI;
  window.CampusRun = CampusRun;
})();
