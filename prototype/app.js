// CampusRun prototype: UI and Run Captain agent logic. Team Syntara (GIM).
(function () {
  const D = window.DEMO;
  const API = window.SwiggyAPI;
  const $ = (s, r = document) => r.querySelector(s);
  const rupee = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
  const rupee2 = (n) => "₹" + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, "");
  const FEES = { runFee: 15, platformFee: 17.58 };
  const LIVE = () => window.MCP.mode === "live";

  const S = {
    campus: "gim", tab: "home", slot: "dinner", chat: [], busy: false,
    pod: { restaurant: null, items: [], instamart: [] },
    order: null, trackStep: 0, booking: null, dine: { list: [], slotsFor: null, slots: [] }, party: 6,
    address: null, // live: { id, addressLine } from get_addresses
    budget: { monthly: 4000, spent: 2310, saved: 486 },
  };
  window.CampusRun.init(D.slots);
  const campus = () => D.campuses[S.campus];
  const slotById = (id) => D.slots.find((s) => s.id === id);

  // ---------- time ----------
  function slotDate(slot) {
    const [hm, ap] = slot.time.split(" ");
    let [h, m] = hm.split(":").map(Number);
    if (ap === "PM" && h !== 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    const d = new Date(); d.setHours(h, m, 0, 0);
    if (d.getTime() - slot.closesMin * 60000 < Date.now()) d.setDate(d.getDate() + 1);
    return d;
  }
  function cutoffLeft(slot) {
    const ms = slotDate(slot).getTime() - slot.closesMin * 60000 - Date.now();
    const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
    return (h ? h + "h " : "") + String(m).padStart(2, "0") + "m " + String(s).padStart(2, "0") + "s";
  }
  function nextFriday() {
    const d = new Date(); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
    return d.toISOString().slice(0, 10);
  }

  let toastT;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2800); }
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------- MCP trace ----------
  const traceEl = $("#trace");
  window.MCP.onCall((e) => {
    traceEl.querySelector(".trace-empty")?.remove();
    if (e.phase === "request") {
      const div = document.createElement("div");
      div.className = "tr"; div.id = "tr-" + e.id;
      div.innerHTML = `<div class="l1"><div><span class="srv ${e.server}">${e.server}</span><span class="tool">${e.tool}</span></div><span class="ms">…</span></div><pre>→ ${esc(JSON.stringify(e.args))}</pre><div class="ep">${e.endpoint}${LIVE() && e.server !== "campusrun" ? " · LIVE" : ""}</div>`;
      traceEl.prepend(div);
    } else {
      const div = $("#tr-" + e.id); if (!div) return;
      div.querySelector(".ms").textContent = e.phase === "error" ? "error" : e.ms + " ms";
      const pre = document.createElement("pre");
      const s = e.phase === "error" ? e.error : JSON.stringify(e.result);
      pre.textContent = "← " + (s.length > 260 ? s.slice(0, 260) + " …" : s);
      div.insertBefore(pre, div.querySelector(".ep"));
    }
  });

  // ---------- views ----------
  function render() {
    document.querySelectorAll("#tabbar button").forEach((b) => b.classList.toggle("active", b.dataset.tab === S.tab));
    document.querySelectorAll("#journeySteps li").forEach((li) => li.classList.toggle("active", li.dataset.step === S.tab));
    const scr = $("#screen");
    scr.innerHTML = { home: viewHome, captain: viewCaptain, pod: viewPod, track: viewTrack, outing: viewOuting }[S.tab]();
    bind();
    if (S.tab === "captain") scr.scrollTop = scr.scrollHeight;
  }
  const header = (title, sub) => `<div class="h-row"><div class="loc">${sub}<b>${title}</b></div><div class="avatar">YP</div></div>`;
  const deliverTo = () => (LIVE() && S.address ? S.address.addressLine.slice(0, 38) : campus().short);

  function viewHome() {
    const c = campus(), ns = slotById(S.slot), st = window.CampusRun.state[ns.id];
    const pct = Math.round((st.orders / st.capacity) * 100);
    const alert = c.type === "remote"
      ? `<div class="alert"><span>⚠️</span><div><b>On-demand delivery: not serviceable here</b>${c.note}</div></div>`
      : `<div class="alert"><span>🚧</span><div><b>Riders stop at the main gate</b>${c.note}</div></div>`;
    const slots = D.slots.map((s) => {
      const x = window.CampusRun.state[s.id], p = Math.round((x.orders / x.capacity) * 100);
      return `<div class="slot"><div><b>${s.label} · ${s.time}</b><div class="meta">From ${s.cluster} · orders close ${s.closesMin} min before</div><div class="fill dark" style="margin-top:6px"><i style="width:${p}%"></i></div></div>
        <button class="pill ${S.slot === s.id ? "" : "grey"}" data-slot="${s.id}">${x.orders}/${x.capacity} ${S.slot === s.id ? "✓" : "join"}</button></div>`;
    }).join("");
    const used = Math.round((S.budget.spent / S.budget.monthly) * 100);
    return `${header(deliverTo(), "Delivering to")}${alert}
      <div class="card hero"><div class="k">Next CampusRun · ${ns.label}</div><div class="big">${ns.time}</div>
        <div class="sub">Orders close in <span class="countdown" id="cd">${cutoffLeft(ns)}</span></div>
        <div class="sub" style="margin-top:6px">${st.orders} students already in · drop at <b>${c.dropPoint}</b></div>
        <div class="fill"><i style="width:${pct}%"></i></div>
        <button class="btn white" data-go="captain">Plan my order with Run Captain ✦</button></div>
      <div class="grid2">
        <button class="tile" data-go="captain"><div class="t-ic">✦</div><b>Run Captain AI</b><span>"Dinner for 4 under ₹900"</span></button>
        <button class="tile" data-go="pod"><div class="t-ic">◎</div><b>Wing Pod</b><span>Pool with your floor, split on UPI</span></button>
        <button class="tile" data-action="midnight"><div class="t-ic">☾</div><b>Midnight Run</b><span>Rolls, momos + Instamart snacks</span></button>
        <button class="tile" data-go="outing"><div class="t-ic">🍽</div><b>Weekend Outing</b><span>Dineout · student offer</span></button>
      </div>
      <div class="sec-title">Today's runs</div><div class="sec-sub">Batched from restaurant clusters → one vehicle → your drop point</div>
      <div class="card">${slots}</div>
      <div class="card"><div class="h-row"><b style="font-size:14px">Monthly food budget</b><span class="pill green">Saved ${rupee(S.budget.saved)} with runs</span></div>
        <div class="fill dark" style="margin-top:10px"><i style="width:${used}%"></i></div>
        <div class="budget"><span>${rupee(S.budget.spent)} spent</span><span>${rupee(S.budget.monthly - S.budget.spent)} left · 12 days to go</span></div></div><div style="height:6px"></div>`;
  }

  function viewCaptain() {
    const s = slotById(S.slot);
    const intro = !S.chat.length ? `<div class="msg bot"><div class="who">Run Captain ✦</div>Hey! I plan orders for the <b>${s.label} (${s.time})</b>. Tell me the headcount, budget and what you're craving, and I'll build the cart on Swiggy for your pod.
      <div class="chips">
        <button class="chip" data-ask="Dinner for 4 under ₹900, 1 non-veg">Dinner for 4 under ₹900, 1 non-veg</button>
        <button class="chip" data-ask="Healthy high-protein dinner for 2 under ₹550">Healthy dinner for 2 under ₹550</button>
        <button class="chip" data-ask="Late night pizza party for 5, ₹280 each">Pizza party for 5, ₹280 each</button>
        <button class="chip" data-ask="Cheap veg thali for 3 under ₹550">Veg thali for 3 under ₹550</button>
      </div></div>` : "";
    const msgs = S.chat.map((m) => m.role === "user" ? `<div class="msg user">${esc(m.text)}</div>` : `<div class="msg bot"><div class="who">Run Captain ✦</div>${m.html}</div>`).join("");
    return `${header("Run Captain", "AI ordering agent · powered by Swiggy MCP")}
      <div class="chat" style="margin-top:14px">${intro}${msgs}${S.busy ? `<div class="thinking">Run Captain is calling Swiggy MCP…</div>` : ""}</div>
      <div class="composer"><input id="ask" placeholder="e.g. Biryani for 3 under ₹700" ${S.busy ? "disabled" : ""}/><button id="askBtn" ${S.busy ? "disabled" : ""}>↑</button></div>`;
  }

  function podTotals() {
    const per = D.podMembers.map(() => 0);
    let food = 0;
    S.pod.items.forEach((it) => { const p = it.price * it.qty; food += p; per[it.who] += p; });
    const im = S.pod.instamart.reduce((a, b) => a + b.price, 0);
    per[0] += im;
    const active = per.filter((x) => x > 0).length || 1;
    const feeEach = FEES.runFee + FEES.platformFee; // each member's share rides the run as its own order
    const c = campus();
    const onDemandEach = c.onDemand.available ? c.onDemand.deliveryFee + c.onDemand.smallCartFee + FEES.platformFee : null;
    return { food, im, per, active, feeEach, fees: feeEach * active, onDemandEach };
  }

  function viewPod() {
    const c = campus();
    if (!S.pod.items.length) return `${header("Wing Pod", "Hostel Block C · Floor 2")}
      <div class="card" style="text-align:center;padding:26px 16px"><div style="font-size:40px">◎</div><b>Your pod cart is empty</b>
      <div class="sec-sub" style="margin-top:6px">Ask Run Captain to plan a pooled order for your wing.</div>
      <button class="btn" data-go="captain">Plan with Run Captain ✦</button>
      <button class="btn ghost" data-ask-direct="Dinner for 4 under ₹900, 1 non-veg">Quick plan: dinner for 4 under ₹900</button></div>`;
    const r = S.pod.restaurant, t = podTotals();
    const items = S.pod.items.map((it) => { const m = D.podMembers[it.who]; return `<div class="line-item"><span><span class="who-tag" style="background:${m.color}">${m.initials}</span><span class="veg ${it.veg ? "" : "nonveg"}"></span>${esc(it.name)}${it.qty > 1 ? " ×" + it.qty : ""}</span><b>${rupee(it.price * it.qty)}</b></div>`; }).join("");
    const im = S.pod.instamart.map((p) => `<div class="line-item"><span><span class="who-tag" style="background:#c2187f">IM</span>${esc(p.name)}</span><b>${rupee(p.price)}</b></div>`).join("");
    const split = D.podMembers.map((m, i) => t.per[i] > 0 ? `<div class="line-item"><span><span class="who-tag" style="background:${m.color}">${m.initials}</span>${m.name}</span><b>${rupee2(t.per[i] + t.feeEach)}</b></div>` : "").join("");
    const od = t.onDemandEach == null
      ? `<div class="old">On-demand<b>Not available</b><small>${c.distanceKm} km away: outside delivery radius</small></div>`
      : `<div class="old">${t.active} separate orders<b>${rupee2(t.onDemandEach)}/person</b><small>Delivery ₹${c.onDemand.deliveryFee} + small-cart ₹${c.onDemand.smallCartFee} + platform ₹${FEES.platformFee}, then a walk to the gate</small></div>`;
    const saving = t.onDemandEach == null ? null : (t.onDemandEach - t.feeEach) * t.active;
    const slotBtns = D.slots.map((s) => `<button data-slot="${s.id}" class="${S.slot === s.id ? "sel" : ""}">${s.time}<small>${s.label.replace(" Run", "")}</small></button>`).join("");
    return `${header("Wing Pod", "Hostel Block C · Floor 2")}
      <div class="card"><div class="h-row"><div><b>${esc(r.name)}</b><div class="sec-sub">${esc(r.cuisine)} · ★ ${r.rating}</div></div><span class="pill green">Run-eligible</span></div>
        <div class="members" style="margin-top:10px">${D.podMembers.map((m) => `<div class="avatar" style="background:${m.color}">${m.initials}</div>`).join("")}</div>
        <div style="margin-top:10px">${items}${im}</div>
        <button class="btn ghost" data-action="addInstamart">+ Add Instamart snacks to this run</button></div>
      <div class="card"><b style="font-size:14px">Pick your run</b><div class="radio-slot">${slotBtns}</div>
        <div class="cmp">${od}<div class="new">CampusRun pod<b>${rupee2(t.feeEach)}/person</b><small>Run fee ₹${FEES.runFee} + platform ₹${FEES.platformFee}. No delivery or small-cart fee, delivered to your block.</small></div></div>
        ${saving != null ? `<div class="alert green"><span>💸</span><div><b>Your pod saves ${rupee(saving)} on fees tonight</b>and nobody walks to the gate.</div></div>` : `<div class="alert green"><span>🚀</span><div><b>CampusRun unlocks delivery at ${c.short.split(" ·")[0]}</b>Restaurants 30 km away, batched into one run.</div></div>`}</div>
      <div class="card"><b style="font-size:14px">Split (UPI collect per person)</b><div style="margin-top:6px">${split}</div>
        <div class="plan-row total"><span>Pod total</span><span>${rupee2(t.food + t.im + t.fees)}</span></div>
        <button class="btn" data-action="place" ${S.busy ? "disabled" : ""}>Place pod order on ${slotById(S.slot).time} run</button></div>`;
  }

  const TRACK = [
    { t: "Pod order confirmed", d: "Joined the run · restaurant notified of the slot" },
    { t: "Restaurant prepping for the run", d: "Kitchen times prep to the run's pickup window" },
    { t: "Run vehicle loaded at cluster hub", d: "orders consolidated in insulated crates" },
    { t: "On the way to campus", d: "One trip covers every order in the run" },
    { t: "At the drop point", d: "Collect with your OTP" },
  ];
  function viewTrack() {
    if (!S.order) return `${header("Track", "CampusRun")}<div class="card" style="text-align:center;padding:26px 16px"><div style="font-size:40px">➜</div><b>No active run yet</b><div class="sec-sub" style="margin-top:6px">Place a pod order and track the whole run here.</div><button class="btn" data-go="pod">Go to Pod</button></div>`;
    const c = campus(), s = slotById(S.order.slot), st = window.CampusRun.state[s.id];
    const steps = TRACK.map((x, i) => `<li class="${i < S.trackStep ? "done" : i === S.trackStep ? "now" : ""}">${x.t}<small>${i === 2 ? st.orders + " " + x.d : i === 3 && S.order.eta ? "Swiggy ETA: " + esc(S.order.eta) : x.d}</small></li>`).join("");
    const prog = Math.min(S.trackStep / (TRACK.length - 1), 1), px = 40 + prog * 270, py = 130 - prog * 85;
    const atDrop = S.trackStep >= TRACK.length - 1;
    return `${header(s.label + " · " + s.time, "Order " + esc(S.order.orderId) + " · " + S.order.runId)}
      <div class="map"><svg viewBox="0 0 350 170"><path d="M40 130 C 110 140, 140 60, 200 80 S 290 50, 310 45" stroke="#ffb999" stroke-width="5" fill="none" stroke-dasharray="2 9" stroke-linecap="round"/>
        <circle cx="40" cy="130" r="9" fill="#1b1b1f"/><text x="54" y="150" font-size="11" fill="#4a4a55" font-weight="700">${s.cluster} hub</text>
        <circle cx="310" cy="45" r="11" fill="#0e8a5f"/><text x="226" y="24" font-size="11" fill="#4a4a55" font-weight="700">${c.dropPoint.split(" ·")[0]}</text>
        <circle cx="${px}" cy="${py}" r="10" fill="#ff5200" stroke="#fff" stroke-width="3"/></svg></div>
      <div class="card"><div class="h-row"><b style="font-size:14px">${st.orders} orders on this run</b><span class="pill">1 vehicle · ${c.distanceKm} km</span></div>
        <ul class="timeline">${steps}</ul>
        ${atDrop ? `<div style="text-align:center"><b>Drop-point OTP</b><div class="otp">${S.order.dropOtp.split("").map((d) => `<span>${d}</span>`).join("")}</div><div class="sec-sub" style="margin-top:6px">${c.dropPoint} · Campus Captain on duty</div></div>` : `<button class="btn" data-action="advance">Simulate run progress →</button>`}</div>`;
  }

  function viewOuting() {
    const b = S.booking, centre = D.outingCentre;
    const list = S.dine.list.map((r) => `<div class="card"><div class="dine"><div class="img"></div><div><b>${esc(r.name)}</b><div class="meta">${esc(r.area)}${r.costForTwo ? " · " + rupee(r.costForTwo) + " for two" : ""}${r.rating ? " · ★ " + r.rating : ""}</div>${r.offer ? `<span class="pill green">${esc(r.offer)}</span>` : ""}</div></div>
      ${S.dine.slotsFor === r.id ? `<div class="slots-row">${S.dine.slots.map((sl, i) => `<button data-book="${i}">${esc(sl.displayTime)}</button>`).join("") || '<span class="sec-sub">No free slots on Friday</span>'}</div>` : `<div class="slots-row"><button data-slots="${r.id}">See Friday slots</button></div>`}</div>`).join("");
    return `${header("Weekend Outing", "Swiggy Dineout · for the batch")}
      <div class="card"><b style="font-size:14px">Plan Friday night for the gang</b><div class="sec-sub">Run Captain finds tables in ${centre.label} with student offers and books them through Dineout MCP.</div>
        <div class="grid2" style="margin-top:10px">
          <label class="ctl">Party size<select id="party">${[4, 6, 8].map((n) => `<option ${n === S.party ? "selected" : ""}>${n}</option>`).join("")}</select></label>
          <label class="ctl">Vibe<select id="vibe"><option>cafe</option><option>seafood</option><option>rooftop</option><option>live music</option></select></label>
        </div><button class="btn" data-action="findTables">Find tables</button></div>
      ${b ? `<div class="alert green"><span>✅</span><div><b>Booked: ${esc(b.restaurantName)}, ${esc(b.when)}, ${b.guestCount} people</b>Booking ${esc(b.orderId)} · ${esc(b.status)}. Shared to the batch group.</div></div>` : ""}${list}`;
  }

  // ---------- Run Captain agent ----------
  function parseIntent(text) {
    const t = text.toLowerCase();
    const n = (re) => { const m = t.match(re); return m ? Number(m[1]) : null; };
    const words = { two: 2, three: 3, four: 4, five: 5, six: 6 };
    let people = n(/for\s+(\d+)/) || n(/(\d+)\s*(?:people|of us|friends|persons|ppl)/);
    if (!people) { const w = t.match(/for\s+(two|three|four|five|six)/); people = w ? words[w[1]] : 1; }
    people = Math.min(Math.max(people, 1), 8);
    const each = n(/(?:₹|rs\.?\s*)?(\d{2,4})\s*(?:each|per head|per person|\/head)/);
    let budget = n(/(?:under|below|within|budget|max)\s*(?:₹|rs\.?\s*)?(\d{2,5})/) || n(/₹\s*(\d{2,5})/);
    if (each) budget = each * people;
    if (!budget) budget = 250 * people;
    const nonVeg = n(/(\d+)\s*non[- ]?veg/);
    const allVeg = /\bveg\b/.test(t.replace(/non[- ]?veg/g, "")) && nonVeg == null;
    const hit = ["biryani", "pizza", "thali", "rolls", "momos", "healthy", "protein", "salad", "chinese", "burger"].find((k) => t.includes(k));
    const query = hit || (S.slot === "midnight" ? "rolls" : S.slot === "lunch" ? "thali" : "biryani");
    return { people, budget, nonVeg: allVeg ? 0 : nonVeg == null ? people : Math.min(nonVeg, people), allVeg, query };
  }

  function buildPlan(menu, intent, foodBudget) {
    const perHead = foodBudget / intent.people;
    const mains = menu.filter((m) => m.price >= 95 && !/family|serves|combo for|bucket|platter/i.test(m.name));
    const sides = menu.filter((m) => m.price < 95 && m.price > 0);
    const assigned = []; let total = 0;
    const used = (id) => assigned.filter((a) => a.itemId === id).length;
    for (let i = 0; i < intent.people; i++) {
      const wantNonVeg = i < intent.nonVeg && !intent.allVeg;
      let pool = mains.filter((m) => (wantNonVeg ? !m.veg : m.veg));
      if (!pool.length) pool = mains.filter((m) => m.veg || !intent.allVeg);
      const fit = pool.filter((m) => m.price <= perHead).sort((a, b) => used(a.id) - used(b.id) || b.price - a.price);
      const pick = fit[0] || pool.slice().sort((a, b) => a.price - b.price)[0];
      if (!pick) continue;
      assigned.push({ who: i % D.podMembers.length, itemId: pick.id, name: pick.name, price: pick.price, veg: pick.veg, qty: 1 });
      total += pick.price;
    }
    for (const s of sides.sort((a, b) => a.price - b.price)) if (total + s.price <= foodBudget && !(intent.allVeg && !s.veg)) { assigned.push({ who: 0, itemId: s.id, name: s.name, price: s.price, veg: s.veg, qty: 1 }); total += s.price; break; }
    return { items: assigned, total };
  }

  async function ask(text) {
    if (!text || S.busy) return;
    S.chat.push({ role: "user", text }); S.busy = true; render();
    try {
      const intent = parseIntent(text), slot = slotById(S.slot);
      const fees = (FEES.runFee + FEES.platformFee) * intent.people;
      // CampusRun sources from the run's restaurant-cluster hub, not the student's (unserviceable) address.
      const loc = { latitude: slot.hub.latitude, longitude: slot.hub.longitude };
      let note = "";
      if (LIVE() && S.address && campus().type === "remote") {
        const atCampus = await API.searchRestaurants(intent.query, { addressId: S.address.id });
        note = `<div class="alert" style="margin:0 0 8px"><span>📍</span><div><b>Swiggy shows ${atCampus.length} open "${esc(intent.query)}" restaurants delivering to your saved address</b>so I searched the ${slot.cluster} run hub instead.</div></div>`;
      }
      let rs = await API.searchRestaurants(intent.query, loc);
      if (!LIVE()) rs = rs.filter((r) => D.restaurants.find((x) => x.id === r.id)?.runEligible !== false);
      let best = null;
      for (const r of rs.slice(0, 3)) {
        const menu = await API.menu(r.id, loc);
        const plan = buildPlan(menu, intent, intent.budget - fees);
        if (plan.items.length && plan.total + fees <= intent.budget) { best = { r, plan }; break; }
        if (plan.items.length && (!best || plan.total < best.plan.total)) best = { r, plan };
      }
      if (!best) throw new Error("No restaurant on this run could fit that order. Try a bigger budget or another cuisine.");
      const cart = await API.setCart(best.r, best.plan.items, loc);
      S.pod.restaurant = best.r; S.pod.items = best.plan.items;
      const rows = best.plan.items.map((i) => `<div class="plan-row"><span><span class="veg ${i.veg ? "" : "nonveg"}"></span>${esc(i.name)}</span><span>${rupee(i.price)}</span></div>`).join("");
      const within = best.plan.total + fees <= intent.budget;
      const cartNote = cart && cart.pricing && LIVE() ? `<div class="sec-sub" style="margin-top:6px">Swiggy cart ${esc(cart.cart_id || "")} confirmed: ${cart.item_count || best.plan.items.length} items.</div>` : "";
      S.chat.push({ role: "bot", html: `${note}Done. <b>${esc(best.r.name)}</b> (★ ${best.r.rating}) is on the <b>${slot.label} · ${slot.time}</b>. I built a ${intent.people}-person cart ${within ? "inside" : "close to"} your ${rupee(intent.budget)} budget, fees included${intent.allVeg ? ", all veg" : intent.nonVeg < intent.people ? `, ${intent.nonVeg} non-veg` : ""}:
        <div class="plan">${rows}<div class="plan-row"><span>Run + platform fee (₹${FEES.runFee + FEES.platformFee}/person)</span><span>${rupee2(fees)}</span></div>
        <div class="plan-row total"><span>Total · ${rupee2((best.plan.total + fees) / intent.people)}/person</span><span>${rupee2(best.plan.total + fees)}</span></div></div>${cartNote}
        <button class="btn" data-go="pod">Send to Wing Pod →</button>` });
    } catch (e) {
      const msg = String(e.message || e);
      S.chat.push({ role: "bot", html: /sign/i.test(msg) ? `I need you to sign in to Swiggy first. <a href="/auth/login">Sign in with Swiggy →</a>` : esc(msg) });
    }
    S.busy = false; render();
  }

  async function placeOrder() {
    const slot = slotById(S.slot);
    if (LIVE()) {
      const ok = confirm("LIVE mode places a REAL Swiggy order (cash on delivery) to your saved address:\n" + (S.address?.addressLine || "") + "\n\nCampusRun's run dispatch is the new capability we propose, so a live order arrives as a normal Swiggy delivery.\n\nPlace the real order?");
      if (!ok) { toast("Cancelled. Your Swiggy cart is still saved."); return; }
    }
    S.busy = true; render();
    try {
      const note = `CampusRun ${slot.label} ${slot.time}: pack for batch pickup`;
      const o = await API.placeOrder(LIVE() ? S.address.id : "addr_campus", note, "Cash");
      const active = new Set(S.pod.items.map((i) => i.who)).size;
      const run = await window.CampusRun.joinRun(slot.id, o.orderId, active);
      S.order = { orderId: o.orderId, slot: slot.id, runId: run.runId, dropOtp: run.dropOtp, eta: null };
      S.trackStep = 0;
      const t = podTotals();
      S.budget.spent += Math.round(t.per[0] + t.feeEach);
      if (t.onDemandEach != null) S.budget.saved += Math.round(t.onDemandEach - t.feeEach);
      S.tab = "track";
      toast("Pod order placed · UPI split requests sent to " + Math.max(active - 1, 0) + " friends");
    } catch (e) { toast("Order failed: " + (e.message || e)); }
    S.busy = false; render();
  }

  async function advance() {
    S.trackStep = Math.min(S.trackStep + 1, TRACK.length - 1);
    if (S.trackStep === 3) { try { const tr = await API.track(S.order.orderId); S.order.eta = tr?.etaText || null; } catch {} }
    render();
  }

  async function addInstamart() {
    try {
      const loc = LIVE() && S.address ? { addressId: S.address.id } : {};
      const picks = await API.snacks(S.slot === "midnight" ? "maggi" : "chips", loc);
      await API.snacksToCart(picks, loc.addressId);
      S.pod.instamart = picks; toast("Instamart add-ons ride the same run");
    } catch (e) { toast("Instamart: " + (e.message || e)); }
    render();
  }

  async function findTables() {
    S.party = Number($("#party").value);
    const c = D.outingCentre;
    try { S.dine.list = await API.dineSearch($("#vibe").value, c.latitude, c.longitude); S.dine.slotsFor = null; }
    catch (e) { toast("Dineout: " + (e.message || e)); }
    render();
  }
  async function showSlots(id) {
    const c = D.outingCentre;
    try { S.dine.slots = await API.dineSlots(id, nextFriday(), c.latitude, c.longitude); S.dine.slotsFor = id; }
    catch (e) { toast("Dineout: " + (e.message || e)); }
    render();
  }
  async function book(i) {
    const slot = S.dine.slots[i], r = S.dine.list.find((x) => x.id === S.dine.slotsFor), c = D.outingCentre;
    if (!slot?.deal) return toast("That slot has no bookable deal");
    if (LIVE() && !confirm(`LIVE mode books a REAL free table at ${r.name}, ${slot.displayTime}, for ${S.party}. Book it?`)) return;
    try {
      const res = await API.book(r.id, slot, S.party, c.latitude, c.longitude);
      S.booking = { ...res, restaurantName: res.restaurantName || r.name, when: [res.reservationDate, res.reservationTime || slot.displayTime].filter(Boolean).join(" "), guestCount: res.guestCount || S.party };
      S.dine = { list: [], slotsFor: null, slots: [] }; toast("Table booked · shared to batch group");
    } catch (e) { toast("Booking failed: " + (e.message || e)); }
    render();
  }

  // ---------- live mode / sign-in ----------
  async function setMode(mode) {
    window.MCP.mode = mode;
    $("#modeSel").value = mode;
    const badge = $("#modeBadge"), auth = $("#authBtn");
    if (mode !== "live") { badge.textContent = "demo transport"; auth.style.display = "none"; S.address = null; render(); return; }
    let st = { signedIn: false };
    try { st = await (await fetch("/auth/status")).json(); } catch { toast("Live mode needs the local server: node server.js"); }
    auth.style.display = "";
    auth.textContent = st.signedIn ? "Signed in to Swiggy ✓" : "Sign in with Swiggy";
    auth.href = st.signedIn ? "#" : "/auth/login";
    badge.textContent = st.signedIn ? "LIVE · mcp.swiggy.com" : "live · sign-in needed";
    if (st.signedIn) {
      try { const a = await API.addresses(); S.address = a.address; if (!S.address) toast("Add your campus address in the Swiggy app, then reload"); }
      catch (e) { toast("Swiggy: " + (e.message || e)); }
    } else toast("Click 'Sign in with Swiggy' (phone + OTP) to use live mode");
    render();
  }

  // ---------- events ----------
  function bind() {
    document.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => { S.tab = b.dataset.go; render(); }));
    document.querySelectorAll("[data-slot]").forEach((b) => (b.onclick = () => { S.slot = b.dataset.slot; render(); }));
    document.querySelectorAll("[data-ask]").forEach((b) => (b.onclick = () => ask(b.dataset.ask)));
    document.querySelectorAll("[data-ask-direct]").forEach((b) => (b.onclick = () => { S.tab = "captain"; ask(b.dataset.askDirect); }));
    document.querySelectorAll("[data-slots]").forEach((b) => (b.onclick = () => showSlots(b.dataset.slots)));
    document.querySelectorAll("[data-book]").forEach((b) => (b.onclick = () => book(Number(b.dataset.book))));
    const act = { place: placeOrder, advance, addInstamart, findTables, midnight: () => { S.slot = "midnight"; S.tab = "captain"; render(); ask("Late night rolls for 3 under ₹450, 2 non-veg"); } };
    document.querySelectorAll("[data-action]").forEach((b) => (b.onclick = () => act[b.dataset.action]()));
    const inp = $("#ask");
    if (inp) { inp.onkeydown = (e) => { if (e.key === "Enter") ask(inp.value.trim()); }; $("#askBtn").onclick = () => ask(inp.value.trim()); }
  }
  $("#tabbar").onclick = (e) => { const b = e.target.closest("button"); if (b) { S.tab = b.dataset.tab; render(); } };
  $("#campusSel").onchange = (e) => { S.campus = e.target.value; render(); };
  $("#modeSel").onchange = (e) => setMode(e.target.value);
  $("#clearTrace").onclick = () => { traceEl.innerHTML = '<div class="trace-empty">Trace cleared.</div>'; };
  document.querySelectorAll("#journeySteps li").forEach((li) => (li.onclick = () => { S.tab = li.dataset.step; render(); }));
  setInterval(() => { const cd = $("#cd"); if (cd) cd.textContent = cutoffLeft(slotById(S.slot)); }, 1000);

  const qs = new URLSearchParams(location.search);
  if (qs.get("campus")) { S.campus = qs.get("campus"); $("#campusSel").value = S.campus; }
  if (qs.get("slot")) S.slot = qs.get("slot");
  S.tab = qs.get("tab") || "home";
  render();
  if (qs.get("mode") === "live") setMode("live");
  window.__campusrun = { S, ask, render };
})();
