// CampusRun prototype: UI and agent logic. Team Syntara (GIM).
(function () {
  const D = window.DEMO;
  const $ = (s, r = document) => r.querySelector(s);
  const rupee = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
  const rupee2 = (n) => "₹" + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, "");

  const FEES = { runFee: 15, platformFee: 17.58 };

  const S = {
    campus: "gim",
    tab: "home",
    slot: "dinner",
    chat: [],
    pod: { restaurantId: null, items: [], instamart: [] },
    order: null,
    trackStep: 0,
    booking: null,
    budget: { monthly: 4000, spent: 2310, saved: 486 },
    busy: false,
  };
  window.CampusRun.init(D.slots);

  const campus = () => D.campuses[S.campus];
  const slotById = (id) => D.slots.find((s) => s.id === id);

  // ---------- time helpers ----------
  function slotDate(slot) {
    const [hm, ap] = slot.time.split(" ");
    let [h, m] = hm.split(":").map(Number);
    if (ap === "PM" && h !== 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    const d = new Date();
    d.setHours(h, m, 0, 0);
    if (d.getTime() - slot.closesMin * 60000 < Date.now()) d.setDate(d.getDate() + 1);
    return d;
  }
  function cutoffLeft(slot) {
    const ms = slotDate(slot).getTime() - slot.closesMin * 60000 - Date.now();
    const h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), s = Math.floor((ms % 60000) / 1000);
    return (h ? h + "h " : "") + String(m).padStart(2, "0") + "m " + String(s).padStart(2, "0") + "s";
  }
  function nextSlot() {
    return D.slots.slice().sort((a, b) => slotDate(a) - slotDate(b))[0];
  }

  // ---------- toast ----------
  let toastT;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("show"), 2400);
  }

  // ---------- MCP trace ----------
  const traceEl = $("#trace");
  window.MCP.onCall((e) => {
    const empty = traceEl.querySelector(".trace-empty");
    if (empty) empty.remove();
    if (e.phase === "request") {
      const div = document.createElement("div");
      div.className = "tr";
      div.id = "tr-" + e.id;
      div.innerHTML = `<div class="l1"><div><span class="srv ${e.server}">${e.server}</span><span class="tool">${e.tool}</span></div><span class="ms">…</span></div>
        <pre>→ ${escapeHtml(JSON.stringify(e.args))}</pre><div class="ep">${e.endpoint}</div>`;
      traceEl.prepend(div);
    } else {
      const div = $("#tr-" + e.id);
      if (!div) return;
      div.querySelector(".ms").textContent = e.phase === "error" ? "error" : e.ms + " ms";
      const pre = document.createElement("pre");
      pre.textContent = "← " + (e.phase === "error" ? e.error : summarize(e.result));
      div.insertBefore(pre, div.querySelector(".ep"));
    }
  });
  function summarize(obj) {
    const s = JSON.stringify(obj);
    return s.length > 260 ? s.slice(0, 260) + " …" : s;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  // ---------- render ----------
  function render() {
    document.querySelectorAll("#tabbar button").forEach((b) => b.classList.toggle("active", b.dataset.tab === S.tab));
    document.querySelectorAll("#journeySteps li").forEach((li) => li.classList.toggle("active", li.dataset.step === S.tab));
    const scr = $("#screen");
    scr.innerHTML = { home: viewHome, captain: viewCaptain, pod: viewPod, track: viewTrack, outing: viewOuting }[S.tab]();
    bind();
    if (S.tab === "captain") scr.scrollTop = scr.scrollHeight;
  }

  function header(title, sub) {
    return `<div class="h-row"><div class="loc">${sub}<b>${title}</b></div><div class="avatar">YP</div></div>`;
  }

  function viewHome() {
    const c = campus();
    const ns = slotById(S.slot) || nextSlot();
    const st = window.CampusRun.state[ns.id];
    const pct = Math.round((st.orders / st.capacity) * 100);
    const statusAlert = c.type === "remote"
      ? `<div class="alert"><span>⚠️</span><div><b>On-demand delivery: not serviceable here</b>${c.note}</div></div>`
      : `<div class="alert"><span>🚧</span><div><b>Riders stop at the main gate</b>${c.note}</div></div>`;
    const slotsHtml = D.slots.map((s) => {
      const x = window.CampusRun.state[s.id];
      const p = Math.round((x.orders / x.capacity) * 100);
      return `<div class="slot">
        <div><b>${s.label} · ${s.time}</b><div class="meta">From ${s.cluster} · orders close ${s.closesMin} min before</div>
        <div class="fill dark" style="margin-top:6px"><i style="width:${p}%"></i></div></div>
        <button class="pill ${S.slot === s.id ? "" : "grey"}" data-slot="${s.id}">${x.orders}/${x.capacity} ${S.slot === s.id ? "✓" : "join"}</button>
      </div>`;
    }).join("");
    const usedPct = Math.round((S.budget.spent / S.budget.monthly) * 100);
    return `${header(c.short, "Delivering to")}
      ${statusAlert}
      <div class="card hero">
        <div class="k">Next CampusRun · ${ns.label}</div>
        <div class="big">${ns.time}</div>
        <div class="sub">Orders close in <span class="countdown" id="cd">${cutoffLeft(ns)}</span></div>
        <div class="sub" style="margin-top:6px">${st.orders} students already in · drop at <b>${c.dropPoint}</b></div>
        <div class="fill"><i style="width:${pct}%"></i></div>
        <button class="btn white" data-go="captain">Plan my order with Run Captain ✦</button>
      </div>
      <div class="grid2">
        <button class="tile" data-go="captain"><div class="t-ic">✦</div><b>Run Captain AI</b><span>"Dinner for 4 under ₹900"</span></button>
        <button class="tile" data-go="pod"><div class="t-ic">◎</div><b>Wing Pod</b><span>Pool with your floor, split on UPI</span></button>
        <button class="tile" data-action="midnight"><div class="t-ic">☾</div><b>Midnight Run</b><span>Rolls, momos + Instamart snacks</span></button>
        <button class="tile" data-go="outing"><div class="t-ic">🍽</div><b>Weekend Outing</b><span>Dineout · 20% student offer</span></button>
      </div>
      <div class="sec-title">Today's runs</div>
      <div class="sec-sub">Batched from restaurant clusters → one vehicle → your drop point</div>
      <div class="card">${slotsHtml}</div>
      <div class="card">
        <div class="h-row"><b style="font-size:14px">Monthly food budget</b><span class="pill green">Saved ${rupee(S.budget.saved)} with runs</span></div>
        <div class="fill dark" style="margin-top:10px"><i style="width:${usedPct}%"></i></div>
        <div class="budget"><span>${rupee(S.budget.spent)} spent</span><span>${rupee(S.budget.monthly - S.budget.spent)} left · 12 days to go</span></div>
      </div>
      <div style="height:6px"></div>`;
  }

  function viewCaptain() {
    const s = slotById(S.slot);
    const intro = !S.chat.length
      ? `<div class="msg bot"><div class="who">Run Captain ✦</div>Hey! I plan orders for the <b>${s.label} (${s.time})</b>. Tell me the headcount, budget and what you're craving, and I'll build the cart on Swiggy for your pod.
          <div class="chips">
            <button class="chip" data-ask="Dinner for 4 under ₹900, 1 non-veg">Dinner for 4 under ₹900, 1 non-veg</button>
            <button class="chip" data-ask="Healthy high-protein dinner for 2 under ₹500">Healthy dinner for 2 under ₹500</button>
            <button class="chip" data-ask="Late night pizza party for 5, ₹250 each">Pizza party for 5, ₹250 each</button>
            <button class="chip" data-ask="Cheap veg thali for 3 under ₹450">Veg thali for 3 under ₹450</button>
          </div></div>` : "";
    const msgs = S.chat.map((m) => m.role === "user"
      ? `<div class="msg user">${escapeHtml(m.text)}</div>`
      : `<div class="msg bot"><div class="who">Run Captain ✦</div>${m.html}</div>`).join("");
    return `${header("Run Captain", "AI ordering agent · powered by Swiggy MCP")}
      <div class="chat" style="margin-top:14px">${intro}${msgs}${S.busy ? `<div class="thinking">Run Captain is calling Swiggy MCP…</div>` : ""}</div>
      <div class="composer"><input id="ask" placeholder="e.g. Biryani for 3 under ₹600" ${S.busy ? "disabled" : ""}/><button id="askBtn" ${S.busy ? "disabled" : ""}>↑</button></div>`;
  }

  function podTotals() {
    const menu = D.menus[S.pod.restaurantId] || [];
    const members = D.podMembers;
    const per = members.map(() => 0);
    let food = 0;
    S.pod.items.forEach((it) => { const p = it.price * it.qty; food += p; per[it.who] += p; });
    const im = S.pod.instamart.reduce((a, b) => a + b.price, 0);
    per[0] += im;
    const active = per.filter((x) => x > 0).length || 1;
    // Each member's share rides the run as its own order: run fee + platform fee per person, no small-cart fee.
    const feeEach = FEES.runFee + FEES.platformFee;
    const fees = feeEach * active;
    const c = campus();
    const onDemandEach = c.onDemand.available ? c.onDemand.deliveryFee + c.onDemand.smallCartFee + FEES.platformFee : null;
    return { food, im, per, active, fees, feeEach, onDemandEach, menu };
  }

  function viewPod() {
    const c = campus();
    if (!S.pod.items.length) {
      return `${header("Wing Pod", "Hostel Block C · Floor 2")}
        <div class="card" style="text-align:center;padding:26px 16px">
          <div style="font-size:40px">◎</div>
          <b>Your pod cart is empty</b>
          <div class="sec-sub" style="margin-top:6px">Ask Run Captain to plan a pooled order for your wing, or let it pick tonight's best value.</div>
          <button class="btn" data-go="captain">Plan with Run Captain ✦</button>
          <button class="btn ghost" data-ask-direct="Dinner for 4 under ₹900, 1 non-veg">Quick plan: dinner for 4 under ₹900</button>
        </div>`;
    }
    const r = D.restaurants.find((x) => x.id === S.pod.restaurantId);
    const t = podTotals();
    const items = S.pod.items.map((it) => {
      const m = D.podMembers[it.who];
      return `<div class="line-item"><span><span class="who-tag" style="background:${m.color}">${m.initials}</span><span class="veg ${it.veg ? "" : "nonveg"}"></span>${it.name}${it.qty > 1 ? " ×" + it.qty : ""}</span><b>${rupee(it.price * it.qty)}</b></div>`;
    }).join("");
    const imItems = S.pod.instamart.map((p) => `<div class="line-item"><span><span class="who-tag" style="background:#c2187f">IM</span>${p.name}</span><b>${rupee(p.price)}</b></div>`).join("");
    const split = D.podMembers.map((m, i) => t.per[i] > 0 ? `<div class="line-item"><span><span class="who-tag" style="background:${m.color}">${m.initials}</span>${m.name}</span><b>${rupee2(t.per[i] + t.feeEach)}</b></div>` : "").join("");
    const odBox = t.onDemandEach == null
      ? `<div class="old">On-demand<b>Not available</b><small>${c.distanceKm} km away: outside delivery radius</small></div>`
      : `<div class="old">${t.active} separate orders<b>${rupee2(t.onDemandEach)}/person</b><small>Delivery ₹${c.onDemand.deliveryFee} + small-cart ₹${c.onDemand.smallCartFee} + platform ₹${FEES.platformFee}, then a walk to the gate</small></div>`;
    const saving = t.onDemandEach == null ? null : (t.onDemandEach - t.feeEach) * t.active;
    const slotBtns = D.slots.map((s) => `<button data-slot="${s.id}" class="${S.slot === s.id ? "sel" : ""}">${s.time}<small>${s.label.replace(" Run", "")}</small></button>`).join("");
    const grand = t.food + t.im + t.fees;
    return `${header("Wing Pod", "Hostel Block C · Floor 2")}
      <div class="card">
        <div class="h-row"><div><b>${r.name}</b><div class="sec-sub">${r.cuisine} · ★ ${r.rating}</div></div><span class="pill green">Run-eligible</span></div>
        <div class="members" style="margin-top:10px">${D.podMembers.map((m) => `<div class="avatar" style="background:${m.color}">${m.initials}</div>`).join("")}</div>
        <div style="margin-top:10px">${items}${imItems}</div>
        <button class="btn ghost" data-action="addInstamart">+ Add Instamart snacks to this run</button>
      </div>
      <div class="card">
        <b style="font-size:14px">Pick your run</b>
        <div class="radio-slot">${slotBtns}</div>
        <div class="cmp">${odBox}<div class="new">CampusRun pod<b>${rupee2(t.feeEach)}/person</b><small>Run fee ₹${FEES.runFee} + platform ₹${FEES.platformFee}. No delivery or small-cart fee, delivered to your block.</small></div></div>
        ${saving != null ? `<div class="alert green"><span>💸</span><div><b>Your pod saves ${rupee(saving)} on fees tonight</b>and nobody walks to the gate.</div></div>` : `<div class="alert green"><span>🚀</span><div><b>CampusRun unlocks delivery at ${c.short.split(" ·")[0]}</b>Restaurants 30 km away, batched into one run.</div></div>`}
      </div>
      <div class="card">
        <b style="font-size:14px">Split (UPI collect per person)</b>
        <div style="margin-top:6px">${split}</div>
        <div class="plan-row total"><span>Pod total</span><span>${rupee2(grand)}</span></div>
        <button class="btn" data-action="place" ${S.busy ? "disabled" : ""}>Place pod order on ${slotById(S.slot).time} run</button>
      </div>`;
  }

  const TRACK_STEPS = [
    { t: "Pod order confirmed", d: "Joined the run · restaurant notified of the slot" },
    { t: "Restaurant prepping for the run", d: "Kitchen times prep to the run's pickup window" },
    { t: "Run vehicle loaded at cluster hub", d: "orders consolidated in insulated crates" },
    { t: "On the way to campus", d: "One trip covers every order in the run" },
    { t: "At the drop point", d: "Collect with your OTP" },
  ];

  function viewTrack() {
    if (!S.order) {
      return `${header("Track", "CampusRun")}
        <div class="card" style="text-align:center;padding:26px 16px"><div style="font-size:40px">➜</div><b>No active run yet</b>
        <div class="sec-sub" style="margin-top:6px">Place a pod order and track the whole run here.</div><button class="btn" data-go="pod">Go to Pod</button></div>`;
    }
    const c = campus();
    const s = slotById(S.order.slot);
    const st = window.CampusRun.state[s.id];
    const steps = TRACK_STEPS.map((x, i) => `<li class="${i < S.trackStep ? "done" : i === S.trackStep ? "now" : ""}">${x.t}<small>${i === 2 ? st.orders + " " + x.d : x.d}</small></li>`).join("");
    const prog = Math.min(S.trackStep / (TRACK_STEPS.length - 1), 1);
    const px = 40 + prog * 270, py = 130 - prog * 85;
    const atDrop = S.trackStep >= TRACK_STEPS.length - 1;
    return `${header(s.label + " · " + s.time, "Order " + S.order.orderId + " · " + S.order.runId)}
      <div class="map"><svg viewBox="0 0 350 170">
        <path d="M40 130 C 110 140, 140 60, 200 80 S 290 50, 310 45" stroke="#ffb999" stroke-width="5" fill="none" stroke-dasharray="2 9" stroke-linecap="round"/>
        <circle cx="40" cy="130" r="9" fill="#1b1b1f"/><text x="54" y="150" font-size="11" fill="#4a4a55" font-weight="700">${s.cluster} hub</text>
        <circle cx="310" cy="45" r="11" fill="#0e8a5f"/><text x="226" y="24" font-size="11" fill="#4a4a55" font-weight="700">${c.dropPoint.split(" ·")[0]}</text>
        <circle cx="${px}" cy="${py}" r="10" fill="#ff5200" stroke="#fff" stroke-width="3"/>
      </svg></div>
      <div class="card">
        <div class="h-row"><b style="font-size:14px">${st.orders} orders on this run</b><span class="pill">1 vehicle · ${c.distanceKm} km</span></div>
        <ul class="timeline">${steps}</ul>
        ${atDrop ? `<div style="text-align:center"><b>Drop-point OTP</b><div class="otp">${S.order.dropOtp.split("").map((d) => `<span>${d}</span>`).join("")}</div><div class="sec-sub" style="margin-top:6px">${c.dropPoint} · Campus Captain on duty</div></div>`
          : `<button class="btn" data-action="advance">Simulate run progress →</button>`}
      </div>`;
  }

  function viewOuting() {
    const b = S.booking;
    const list = (S.dineList || []).map((r) => `<div class="card"><div class="dine"><div class="img"></div><div><b>${r.name}</b><div class="meta">${r.area} · ${rupee(r.costForTwo)} for two</div><span class="pill green">${r.studentOff}% off · Student Rewards</span></div></div>
      <div class="slots-row">${r.slots.map((sl) => `<button data-book="${r.id}|${sl}">${sl}</button>`).join("")}</div></div>`).join("");
    return `${header("Weekend Outing", "Swiggy Dineout · for the batch")}
      <div class="card">
        <b style="font-size:14px">Plan Friday night for the gang</b>
        <div class="sec-sub">Run Captain finds tables near campus with the student offer and books them through Dineout MCP.</div>
        <div class="grid2" style="margin-top:10px">
          <label class="ctl">Party size<select id="party"><option>4</option><option selected>6</option><option>8</option></select></label>
          <label class="ctl">Area<select id="area"><option value="">Anywhere</option><option>Panaji</option><option>Calangute</option></select></label>
        </div>
        <button class="btn" data-action="findTables">Find tables</button>
      </div>
      ${b ? `<div class="alert green"><span>✅</span><div><b>Booked: ${b.restaurant}, ${b.slot}, ${b.partySize} people</b>Booking ${b.bookingId} · ${b.offer} applied. Shared to the batch group.</div></div>` : ""}
      ${list}`;
  }

  // ---------- Run Captain agent ----------
  function parseIntent(text) {
    const t = text.toLowerCase();
    const num = (re) => { const m = t.match(re); return m ? Number(m[1]) : null; };
    const words = { two: 2, three: 3, four: 4, five: 5, six: 6 };
    let people = num(/for\s+(\d+)/) || num(/(\d+)\s*(?:people|of us|friends|persons|ppl)/);
    if (!people) { const w = t.match(/for\s+(two|three|four|five|six)/); people = w ? words[w[1]] : 1; }
    people = Math.min(Math.max(people, 1), 8);
    const each = num(/(?:₹|rs\.?\s*)?(\d{2,4})\s*(?:each|per head|per person|\/head)/);
    let budget = num(/(?:under|below|within|budget|max)\s*(?:₹|rs\.?\s*)?(\d{2,5})/) || num(/₹\s*(\d{2,5})/);
    if (each) budget = each * people;
    if (!budget) budget = 220 * people;
    const nonVeg = num(/(\d+)\s*non[- ]?veg/);
    const allVeg = /\bveg\b/.test(t.replace(/non[- ]?veg/g, "")) && nonVeg == null;
    const tagHit = ["biryani", "pizza", "thali", "rolls", "momos", "healthy", "protein", "salad", "chinese"].find((k) => t.includes(k));
    const query = tagHit || (S.slot === "midnight" ? "late night" : S.slot === "lunch" ? "thali" : "dinner");
    return { people, budget, nonVeg: allVeg ? 0 : nonVeg == null ? people : Math.min(nonVeg, people), allVeg, query };
  }

  function buildPlan(menu, intent) {
    const perHead = intent.budget / intent.people;
    const mains = menu.filter((m) => m.price >= 95 && !/family|serves/i.test(m.name));
    const sides = menu.filter((m) => m.price < 95);
    const assigned = [];
    let total = 0;
    for (let i = 0; i < intent.people; i++) {
      const wantNonVeg = i < intent.nonVeg && !intent.allVeg;
      let pool = mains.filter((m) => (wantNonVeg ? !m.veg : m.veg));
      if (!pool.length) pool = mains.filter((m) => m.veg || !intent.allVeg);
      const used = (id) => assigned.filter((a) => a.itemId === id).length;
      const fit = pool.filter((m) => m.price <= perHead).sort((a, b) => used(a.id) - used(b.id) || b.price - a.price);
      const pick = fit[0] || pool.slice().sort((a, b) => a.price - b.price)[0];
      if (!pick) continue;
      assigned.push({ who: i % D.podMembers.length, itemId: pick.id, name: pick.name, price: pick.price, veg: pick.veg, qty: 1 });
      total += pick.price;
    }
    for (const s of sides.sort((a, b) => a.price - b.price)) {
      if (total + s.price <= intent.budget && !(intent.allVeg && !s.veg)) {
        assigned.push({ who: 0, itemId: s.id, name: s.name, price: s.price, veg: s.veg, qty: 1 });
        total += s.price;
      }
    }
    return { items: assigned, total };
  }

  async function ask(text) {
    if (!text || S.busy) return;
    S.chat.push({ role: "user", text });
    S.busy = true;
    render();
    try {
      const intent = parseIntent(text);
      const slot = slotById(S.slot);
      const sr = await window.MCP.call("food", "search_restaurants", { query: intent.query, veg: intent.allVeg || undefined, addressId: "campus:" + S.campus });
      const candidates = (sr.restaurants || []).filter((r) => D.restaurants.find((x) => x.id === r.id)?.runEligible !== false).slice(0, 3);
      let best = null;
      for (const r of candidates) {
        const menu = await window.MCP.call("food", "get_restaurant_menu", { restaurantId: r.id });
        const plan = buildPlan(menu.items || [], { ...intent, budget: intent.budget - (FEES.runFee + FEES.platformFee) * intent.people });
        if (plan.items.length && plan.total + (FEES.runFee + FEES.platformFee) * intent.people <= intent.budget) { best = { r, plan }; break; }
        if (!best || plan.total < best.plan.total) best = { r, plan };
      }
      if (!best) throw new Error("no plan");
      await window.MCP.call("food", "update_food_cart", { restaurantId: best.r.id, items: best.plan.items.map((i) => ({ itemId: i.itemId, quantity: i.qty })) });
      S.pod.restaurantId = best.r.id;
      S.pod.items = best.plan.items;
      const fees = (FEES.runFee + FEES.platformFee) * intent.people;
      const rows = best.plan.items.map((i) => `<div class="plan-row"><span><span class="veg ${i.veg ? "" : "nonveg"}"></span>${i.name}</span><span>${rupee(i.price)}</span></div>`).join("");
      const within = best.plan.total + (FEES.runFee + FEES.platformFee) * intent.people <= intent.budget;
      S.chat.push({ role: "bot", html: `Done. <b>${best.r.name}</b> (★ ${best.r.rating}) is on the <b>${slot.label} · ${slot.time}</b>. I built a ${intent.people}-person cart ${within ? "inside" : "close to"} your ${rupee(intent.budget)} budget, fees included${intent.allVeg ? ", all veg" : intent.nonVeg < intent.people ? `, ${intent.nonVeg} non-veg` : ""}:
        <div class="plan">${rows}<div class="plan-row"><span>Run + platform fee (₹${FEES.runFee + FEES.platformFee}/person)</span><span>${rupee2(fees)}</span></div>
        <div class="plan-row total"><span>Total · ${rupee2((best.plan.total + fees) / intent.people)}/person</span><span>${rupee2(best.plan.total + fees)}</span></div></div>
        <button class="btn" data-go="pod">Send to Wing Pod →</button>` });
    } catch (e) {
      S.chat.push({ role: "bot", html: "I couldn't reach Swiggy just now. Try again, or switch to demo mode." });
      toast(String(e.message || e));
    }
    S.busy = false;
    render();
  }

  async function placeOrder() {
    S.busy = true; render();
    try {
      const slot = slotById(S.slot);
      const o = await window.MCP.call("food", "place_food_order", { paymentMethod: "UPI", scheduledSlot: slot.id + "@" + slot.time, deliveryNote: campus().dropPoint });
      const active = new Set(S.pod.items.map((i) => i.who)).size;
      const run = await window.CampusRun.joinRun(slot.id, o.orderId, active);
      S.order = { orderId: o.orderId, slot: slot.id, runId: run.runId, dropOtp: run.dropOtp };
      S.trackStep = 0;
      S.budget.spent += Math.round(podTotals().per[0] + podTotals().feeEach);
      const t = podTotals();
      if (t.onDemandEach != null) S.budget.saved += Math.round(t.onDemandEach - t.feeEach);
      S.tab = "track";
      toast("Pod order placed · UPI split requests sent to " + (active - 1) + " friends");
    } catch (e) { toast("Order failed: " + (e.message || e)); }
    S.busy = false; render();
  }

  async function advance() {
    S.trackStep = Math.min(S.trackStep + 1, TRACK_STEPS.length - 1);
    if (S.trackStep === 3) await window.MCP.call("food", "track_food_order", { orderId: S.order.orderId });
    render();
  }

  async function addInstamart() {
    const q = S.slot === "midnight" ? "maggi" : "";
    const r = await window.MCP.call("instamart", "search_products", { query: q || "snacks" });
    const picks = (r.products || []).slice(0, 2);
    await window.MCP.call("instamart", "update_cart", { items: picks.map((p) => ({ productId: p.id, quantity: 1 })) });
    S.pod.instamart = picks;
    toast("Instamart add-ons ride the same run");
    render();
  }

  async function findTables() {
    const partySize = Number($("#party").value), area = $("#area").value;
    const r = await window.MCP.call("dineout", "search_restaurants", { area, partySize, date: "Friday" });
    S.dineList = r.restaurants;
    S.party = partySize;
    render();
  }
  async function book(id, slot) {
    const r = await window.MCP.call("dineout", "book_table", { restaurantId: id, slot, partySize: S.party || 6, date: "Friday" });
    S.booking = r;
    S.dineList = [];
    toast("Table booked · shared to batch group");
    render();
  }

  // ---------- events ----------
  function bind() {
    document.querySelectorAll("[data-go]").forEach((b) => b.onclick = () => { S.tab = b.dataset.go; render(); });
    document.querySelectorAll("[data-slot]").forEach((b) => b.onclick = () => { S.slot = b.dataset.slot; render(); });
    document.querySelectorAll("[data-ask]").forEach((b) => b.onclick = () => ask(b.dataset.ask));
    document.querySelectorAll("[data-ask-direct]").forEach((b) => b.onclick = () => { S.tab = "captain"; ask(b.dataset.askDirect); });
    document.querySelectorAll("[data-book]").forEach((b) => b.onclick = () => { const [id, sl] = b.dataset.book.split("|"); book(id, sl); });
    const act = { place: placeOrder, advance, addInstamart, findTables, midnight: () => { S.slot = "midnight"; S.tab = "captain"; render(); ask("Late night rolls for 3 under ₹400, 2 non-veg"); } };
    document.querySelectorAll("[data-action]").forEach((b) => b.onclick = () => act[b.dataset.action]());
    const inp = $("#ask"), btn = $("#askBtn");
    if (inp) {
      inp.onkeydown = (e) => { if (e.key === "Enter") ask(inp.value.trim()); };
      btn.onclick = () => ask(inp.value.trim());
    }
  }

  $("#tabbar").onclick = (e) => { const b = e.target.closest("button"); if (b) { S.tab = b.dataset.tab; render(); } };
  $("#campusSel").onchange = (e) => { S.campus = e.target.value; render(); };
  $("#modeSel").onchange = (e) => {
    window.MCP.mode = e.target.value;
    $("#modeBadge").textContent = e.target.value === "live" ? "live · via /api/mcp proxy" : "demo transport";
    toast(e.target.value === "live" ? "Live mode: start server.js with SWIGGY_MCP_TOKEN set" : "Demo mode (offline)");
  };
  $("#clearTrace").onclick = () => { traceEl.innerHTML = '<div class="trace-empty">Trace cleared.</div>'; };
  document.querySelectorAll("#journeySteps li").forEach((li) => li.onclick = () => { S.tab = li.dataset.step; render(); });

  setInterval(() => { const cd = $("#cd"); if (cd) cd.textContent = cutoffLeft(slotById(S.slot) || nextSlot()); }, 1000);

  // deep links for screenshots / video: ?campus=city&tab=pod&demo=1
  const qs = new URLSearchParams(location.search);
  if (qs.get("campus")) { S.campus = qs.get("campus"); $("#campusSel").value = S.campus; }
  if (qs.get("slot")) S.slot = qs.get("slot");
  S.tab = qs.get("tab") || "home";
  render();
  if (qs.get("ask")) { S.tab = "captain"; ask(qs.get("ask")); }
  window.__campusrun = { S, ask, placeOrder, advance, findTables, book, addInstamart, render };
})();
