// Builds deck/CampusRun_TeamSyntara_GIM.pptx: the 5-slide business case.
// Run: NODE_PATH=<dir with pptxgenjs> node deck/build-deck.js <path to apply_theme.js>
const path = require("path");
const pptxgen = require("pptxgenjs");
const { applyTheme } = require(process.argv[2]);

const ROOT = path.join(__dirname, "..");
const A = (f) => path.join(ROOT, "assets", f);
const OUT = path.join(__dirname, "CampusRun_TeamSyntara_GIM.pptx");
const readJson = (f) => { try { return JSON.parse(require("fs").readFileSync(path.join(ROOT, "research", "survey", f), "utf8")); } catch { return null; } };
const SURVEY = readJson("results.json");     // real GIM survey results from analyze.py
const AUDIT = readJson("serviceability.json"); // real Swiggy MCP serviceability audit

const THEME = {
  name: "CampusRun",
  headFontFace: "Arial",
  bodyFontFace: "Arial",
  colors: {
    dk1: "1B1B1F", lt1: "FFFFFF", dk2: "4A4A55", lt2: "F4F4F6",
    accent1: "FF5200", accent2: "0E8A5F", accent3: "FFF1EA", accent4: "8A8A96", accent5: "E6F6EF", accent6: "C2187F",
    hlink: "FF5200", folHlink: "C2187F",
  },
};
const HEX = { ink: "1B1B1F", orange: "FF5200", green: "0E8A5F", muted: "8A8A96", grid: "ECECF1", ink2: "4A4A55", pink: "C2187F" };

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = "CampusRun: Team Syntara, Goa Institute of Management";
pres.author = "Team Syntara (GIM)";
pres.company = "Goa Institute of Management";
const C = pres.SchemeColor;
const ORANGE = C.accent1, GREEN = C.accent2, SOFT = C.accent3, MUTED = C.accent4, GSOFT = C.accent5, PINK = C.accent6, INK = C.text1, INK2 = C.text2, GREY = C.background2, WHITE = C.background1;

pres.defineSlideMaster({
  title: "CONTENT",
  background: { color: WHITE },
  objects: [
    { image: { path: A("gim-logo.jpg"), x: 12.08, y: 0.28, w: 0.85, h: 0.525 } },
    { text: { text: "Team Syntara  ·  Goa Institute of Management  ·  Swiggy Food for Thought 2.0", options: { x: 0.45, y: 7.08, w: 7.5, h: 0.28, fontSize: 9, color: MUTED, margin: 0 } } },
    { placeholder: { options: { name: "eyebrow", type: "body", x: 0.45, y: 0.32, w: 9, h: 0.28, fontSize: 11, bold: true, color: ORANGE, charSpacing: 2, margin: 0 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: 0.45, y: 0.6, w: 11.4, h: 0.85, fontSize: 23, bold: true, color: INK, valign: "top", align: "left", margin: 0, fontFace: "Arial" }, text: "" } },
  ],
  slideNumber: { x: 12.4, y: 7.06, w: 0.5, h: 0.3, fontSize: 9, color: MUTED, align: "right" },
});

let objN = 0;
const oid = (p) => `${p}-${++objN}`;
function box(s, x, y, w, h, fill, extra = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, line: { color: fill, width: 0 }, rectRadius: 0.12, objectName: oid("card"), ...extra });
}
function txt(s, text, o) { s.addText(text, { isTextBox: true, margin: 0, valign: "top", fontSize: 12, color: INK, objectName: oid("text"), ...o }); }
function circleNum(s, n, x, y, d = 0.42, fill = ORANGE, color = WHITE) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: fill }, line: { color: fill, width: 0 }, objectName: oid("dot") });
  txt(s, String(n), { x, y, w: d, h: d, align: "center", valign: "middle", fontSize: d > 0.4 ? 13 : 11, bold: true, color });
}
function source(s, t) { txt(s, t, { x: 0.45, y: 6.8, w: 12.4, h: 0.26, fontSize: 8.5, color: MUTED, italic: true }); }
function slide(section, eyebrow, title) {
  const s = pres.addSlide({ masterName: "CONTENT", sectionTitle: section });
  s.addText(eyebrow, { placeholder: "eyebrow" });
  s.addText(title, { placeholder: "title" });
  return s;
}

// ======================= SLIDE 1 · CAMPUS INSIGHT =======================
pres.addSection({ title: "Campus Insight" });
{
  const s = slide("Campus Insight", "01 · CAMPUS INSIGHT", "Students aren't short of food options. Delivery stops 30 km away, or 500 m short at the gate");

  // Column 1: secondary evidence
  txt(s, "What published data says", { x: 0.45, y: 1.6, w: 4, h: 0.3, fontSize: 13, bold: true });
  const stats = [
    ["61.4%", "of India's colleges are in rural areas, outside dense delivery grids. 4.33 crore students are enrolled in higher education.", "AISHE, Ministry of Education (PIB)"],
    ["₹2 → ₹17.58", "Swiggy platform fee per order, Apr 2023 → Mar 2026. Flat fees weigh most on small student carts.", "Business Today, Inc42 (Mar 2026)"],
    ["86.4%", "of SRMIST students who waste mess food blame poor quality (1,800+ respondents). Off-mess ordering is a need, not a treat.", "SRMIST campus food-waste survey"],
  ];
  stats.forEach(([n, l, src], i) => {
    const y = 1.98 + i * 1.6;
    box(s, 0.45, y, 4.05, 1.45, GREY);
    txt(s, n, { x: 0.65, y: y + 0.14, w: 3.7, h: 0.5, fontSize: 26, bold: true, color: ORANGE });
    txt(s, l, { x: 0.65, y: y + 0.64, w: 3.7, h: 0.55, fontSize: 10.5, color: INK2 });
    txt(s, src, { x: 0.65, y: y + 1.18, w: 3.7, h: 0.2, fontSize: 8.5, color: MUTED, italic: true });
  });

  // Column 2: two archetypes
  txt(s, "Two campus archetypes, one root cause", { x: 4.75, y: 1.6, w: 4.4, h: 0.3, fontSize: 13, bold: true });
  const arche = [
    ["A", "Remote campus: no access", [
      "GIM Poriem is 30.6 km by road from Panaji. Most restaurants sit outside on-demand radius.",
      "GIM students have petitioned online to bring quick-commerce delivery to campus.",
      "Result: mess or nothing, especially after 10 PM.",
    ]],
    ["B", "Gated campus: costly last 500 m", [
      "Anna University lets delivery executives in only up to the gate. IGGMCH Nagpur barred agents from hostels (Oct 2025).",
      "Students walk to the gate, and every small order pays its own delivery and small-cart fee.",
      "Riders queue at gates: one trip per order.",
    ]],
  ];
  arche.forEach(([k, t, bl], i) => {
    const y = 1.98 + i * 2.42;
    box(s, 4.75, y, 4.35, 2.28, i === 0 ? SOFT : GREY);
    circleNum(s, k, 4.95, y + 0.17, 0.42, i === 0 ? ORANGE : INK);
    txt(s, t, { x: 5.5, y: y + 0.22, w: 3.5, h: 0.35, fontSize: 13, bold: true });
    s.addText(bl.map((b, j) => ({ text: b, options: { bullet: { indent: 12 }, breakLine: j < bl.length - 1, paraSpaceAfter: 4 } })),
      { isTextBox: true, x: 4.95, y: y + 0.72, w: 4.0, h: 1.5, fontSize: 10.5, color: INK2, valign: "top", margin: 0, objectName: oid("bullets") });
  });

  // Column 3: primary research + insight
  box(s, 9.3, 1.6, 3.58, 2.95, WHITE, { line: { color: ORANGE, width: 1.25, dashType: "dash" } });
  txt(s, "PRIMARY RESEARCH · GIM", { x: 9.5, y: 1.75, w: 3.2, h: 0.25, fontSize: 10, bold: true, color: ORANGE, charSpacing: 1 });
  // Filled automatically from research/survey/results.json (analyze.py) and serviceability.json
  // (prototype/tools/serviceability-audit.js). Until those exist the slide shows [__] blanks.
  const v = (x, suf = "") => (x === null || x === undefined ? "[__]" + suf : x + suf);
  const method = SURVEY
    ? `Survey of ${SURVEY.n} GIM students${SURVEY.interviews ? ` + ${SURVEY.interviews} interviews` : ""}${SURVEY.evenings ? ` + gate observation over ${SURVEY.evenings} evening${SURVEY.evenings === 1 ? "" : "s"}` : ""}`
    : "Survey (n = [__]) + [__] interviews + gate observation over [__] evenings";
  txt(s, method, { x: 9.5, y: 2.02, w: 3.2, h: 0.45, fontSize: 10, color: INK2 });
  const pr = [
    [v(SURVEY && SURVEY.pct_failed_or_gave_up, "%"), "tried ordering to campus and failed, or gave up"],
    [v(SURVEY && SURVEY.median_walk_wait_min, " min"), "median walk + wait to collect a delivery"],
    [v(SURVEY && SURVEY.pct_would_use_fixed_slot, "%"), "would order from a fixed slot to save ₹40+ a meal"],
  ];
  if (AUDIT) {
    const camp = AUDIT.results.find((r) => r.label === AUDIT.campusLabel) || AUDIT.results[0];
    const city = AUDIT.results.find((r) => /panaji/i.test(r.label));
    if (camp && city) pr[0] = [`${camp.total} vs ${city.total}`, "Swiggy restaurant results at our hostel vs Panaji (MCP audit)"];
  }
  pr.forEach(([n, l], i) => {
    const y = 2.58 + i * 0.63;
    txt(s, n, { x: 9.5, y, w: 1.2, h: 0.5, fontSize: n.length > 7 ? 14 : 18, bold: true, color: ORANGE, valign: "middle" });
    txt(s, l, { x: 10.72, y, w: 2.0, h: 0.5, fontSize: 10, color: INK2, valign: "middle" });
  });

  box(s, 9.3, 4.7, 3.58, 2.0, INK);
  txt(s, "KEY INSIGHT", { x: 9.5, y: 4.85, w: 3.2, h: 0.25, fontSize: 10, bold: true, color: ORANGE, charSpacing: 1 });
  txt(s, [
    { text: "Campus demand is already clustered in time (mess-off hours) and place (hostel blocks), yet it is fulfilled one order, one rider. ", options: { color: WHITE } },
    { text: "On campus, speed is the wrong goal. Predictable, pooled delivery is the right one.", options: { color: ORANGE, bold: true } },
  ], { x: 9.5, y: 5.13, w: 3.2, h: 1.5, fontSize: 11.5 });

  source(s, "Sources: PIB / Ministry of Education AISHE release; Business Today and Inc42 on Swiggy platform fee (Mar 2026); SRMIST food-waste survey; Change.org petition to extend Blinkit to GIM; Anna University gate rule (News Arena India); IGGMCH Nagpur (Careers360, Oct 2025); Rome2rio (GIM to Panaji 30.6 km).");
  s.addNotes("Campus Insight. Secondary evidence: AISHE (Ministry of Education / PIB): 43% of universities and 61.4% of colleges are located in rural areas; 4.33 crore enrolment in 2021-22. Swiggy platform fee went from Rs 2 (Apr 2023) to Rs 17.58 incl. GST (Mar 2026), per Business Today and Inc42. SRMIST survey of 1,800+ students: poor quality cited by 86.4% as the reason for wasting mess food. Gate rules: Anna University allows delivery executives only up to the gate; IGGMCH Nagpur limited delivery agents to the security post outside hostels (Oct 2025); EFLU students protested delivery restrictions. GIM's Poriem campus is 30.6 km by road from Panaji (Rome2rio); a Change.org petition asks Blinkit to extend delivery to GIM. Primary research boxes are filled from research/survey/results.json (real survey) and serviceability.json (Swiggy MCP audit).");
}

// ======================= SLIDE 2 · SOLUTION =======================
pres.addSection({ title: "Proposed Solution" });
{
  const s = slide("Proposed Solution", "02 · PROPOSED SOLUTION", "CampusRun: scheduled, pooled runs that turn scattered campus orders into one profitable trip");

  box(s, 0.45, 1.6, 8.1, 0.95, SOFT);
  txt(s, [
    { text: "Swiggy CampusRun  ", options: { bold: true, color: ORANGE, fontSize: 17 } },
    { text: "Three fixed delivery slots a day (Lunch · Dinner · Midnight) per campus. Orders close 45 minutes before the run, restaurants prep to the slot, and one vehicle carries the whole run to an OTP drop point inside campus.", options: { color: INK2, fontSize: 11.5 } },
  ], { x: 0.7, y: 1.72, w: 7.7, h: 0.75, valign: "middle" });

  const pillars = [
    ["1", "Scheduled Runs", "Orders batch by restaurant cluster into 3 daily slots. A ₹15 run fee replaces delivery + small-cart fees. Remote campuses get delivery for the first time."],
    ["2", "Run Captain AI + Wing Pods", "An agent on Swiggy MCP turns \"dinner for 4 under ₹900, 1 non-veg\" into a cart, pools the hostel wing and splits the bill over UPI."],
    ["3", "Drop Points + Campus Captains", "An OTP shelf at the gate or hostel, run by a paid student gig. Riders never enter hostels, which matches the safety rules campuses are already setting."],
    ["4", "The ecosystem rides along", "Instamart snacks join the same run. Dineout handles weekend outings (20% student offer). Campus Streaks and Student Rewards fill the slots."],
  ];
  pillars.forEach(([n, t, d], i) => {
    const x = 0.45 + (i % 2) * 4.12, y = 2.72 + Math.floor(i / 2) * 2.02;
    box(s, x, y, 3.98, 1.88, GREY);
    circleNum(s, n, x + 0.2, y + 0.2);
    txt(s, t, { x: x + 0.75, y: y + 0.24, w: 3.1, h: 0.35, fontSize: 13.5, bold: true });
    txt(s, d, { x: x + 0.2, y: y + 0.75, w: 3.6, h: 1.08, fontSize: 12, color: INK2 });
  });

  // Right column: why Swiggy
  box(s, 8.8, 1.6, 4.08, 3.1, INK);
  txt(s, "WHY SWIGGY, WHY NOW", { x: 9.02, y: 1.76, w: 3.7, h: 0.25, fontSize: 10, bold: true, color: ORANGE, charSpacing: 1 });
  const why = [
    ["4,800+", "campuses already in Campus Streaks (Sep 2025): demand exists"],
    ["3 lakh+", "students verified in Student Rewards: targeting exists"],
    ["40%+", "YoY growth in EatRight orders from campuses"],
    ["Live", "Swiggy MCP for Food, Instamart and Dineout (Jan 2026): an agent rail exists"],
  ];
  why.forEach(([n, l], i) => {
    const y = 2.1 + i * 0.63;
    txt(s, n, { x: 9.02, y, w: 1.15, h: 0.55, fontSize: 16, bold: true, color: WHITE, valign: "middle" });
    txt(s, l, { x: 10.2, y, w: 2.55, h: 0.55, fontSize: 10, color: "D9DBE6", valign: "middle" });
  });

  box(s, 8.8, 4.86, 4.08, 1.84, GSOFT);
  txt(s, "What is genuinely new", { x: 9.02, y: 4.98, w: 3.7, h: 0.3, fontSize: 12.5, bold: true, color: GREEN });
  txt(s, [
    { text: "Campus Streaks drives demand. Group Order coordinates friends. ", options: { color: INK2 } },
    { text: "Nothing yet fixes campus fulfilment economics. ", options: { color: INK, bold: true } },
    { text: "CampusRun turns campus delivery from one-order-one-rider into one-run-many-orders.", options: { color: INK2 } },
  ], { x: 9.02, y: 5.32, w: 3.7, h: 1.3, fontSize: 10.5 });

  source(s, "Sources: Swiggy Campus Streaks release (PR Newswire, Sep 2025); Swiggy Student Rewards (Tribune / UNI); Swiggy EatRight campus growth (Mediainfoline, Nov 2025); Swiggy MCP launch (Swiggy corporate, Jan 2026) and Builders Club docs.");
  s.addNotes("Solution. CampusRun adds a scheduled, batched fulfilment mode for campuses Swiggy tags remote or gated. It reuses existing Swiggy assets: Campus Streaks (4,800+ campuses in 310 cities, Sep 2025), Student Rewards (3 lakh+ enrolments), Dineout student offer (20% off bills over Rs 799), Instamart, and Swiggy MCP (Food, Instamart, Dineout servers). Run Captain is an AI agent built on the live Swiggy MCP tools (OAuth 2.1 sign-in): Food get_addresses, search_restaurants, get_restaurant_menu, update_food_cart, get_food_cart, place_food_order, track_food_order; Instamart search_products, update_cart; Dineout search_restaurants_dineout, get_available_slots, book_table.");
}

// ======================= SLIDE 3 · USER JOURNEY =======================
pres.addSection({ title: "User Journey" });
{
  const s = slide("User Journey", "03 · USER JOURNEY & EXPERIENCE", "Four taps from \"I'm hungry\" to an OTP pickup, and every stakeholder gains");

  const phones = [
    ["phone-home.png", "1", "See the next run", "Countdown, seats filled and the drop point"],
    ["phone-captain.png", "2", "Ask Run Captain", "AI builds a 4-person cart inside the budget"],
    ["phone-pod-gim.png", "3", "Pool & split", "Wing Pod, Instamart add-ons, UPI split"],
    ["phone-track.png", "4", "Track & collect", "One vehicle, one OTP at the shelf"],
  ];
  phones.forEach(([img, n, t, d], i) => {
    const x = 0.45 + i * 2.05;
    s.addImage({ path: A(img), x: x + 0.1, y: 1.58, w: 1.7, h: 3.49, objectName: oid("phone"), altText: "CampusRun prototype screen: " + t });
    circleNum(s, n, x + 0.02, 5.16, 0.32);
    txt(s, t, { x: x + 0.4, y: 5.16, w: 1.55, h: 0.32, fontSize: 11.5, bold: true, valign: "middle" });
    txt(s, d, { x: x + 0.02, y: 5.52, w: 1.9, h: 0.45, fontSize: 9.5, color: INK2 });
  });

  // MCP strip
  box(s, 0.45, 6.02, 8.1, 0.72, INK);
  txt(s, [
    { text: "SWIGGY MCP  ", options: { color: ORANGE, bold: true } },
    { text: "Food: get_addresses → search_restaurants → get_restaurant_menu → update_food_cart → get_food_cart → place_food_order → track_food_order  ·  Instamart: search_products, update_cart  ·  Dineout: search_restaurants_dineout, get_available_slots, book_table", options: { color: WHITE } },
  ], { x: 0.62, y: 6.02, w: 7.8, h: 0.72, fontSize: 9.5, valign: "middle", fontFace: "Arial" });

  // stakeholders
  txt(s, "Who gains, and how", { x: 8.85, y: 1.6, w: 4, h: 0.3, fontSize: 13, bold: true });
  const st = [
    ["Students", "Access at remote campuses. ₹32.58 in fees instead of ₹80.58 at gated ones. No walk to the gate. Budget-aware AI ordering."],
    ["Restaurants", "Predictable batches at fixed times. Fewer, larger pickups. New demand from campuses they couldn't serve."],
    ["Run partners", "One loaded trip instead of 30 short ones. No waiting at gates. Fixed, schedulable earnings."],
    ["Campus Captains", "A paid student gig of about 30 minutes per run at the drop point. Verifies OTPs."],
    ["Campus admin", "No outsiders inside hostels. One accountable hand-off point. Fewer gate crowds."],
    ["Swiggy", "Positive contribution per order on campuses it can't serve today. Habit formed before graduation."],
  ];
  st.forEach(([w, d], i) => {
    const y = 1.98 + i * 0.8;
    box(s, 8.85, y, 4.03, 0.7, i % 2 ? WHITE : GREY);
    txt(s, w, { x: 9.0, y, w: 1.4, h: 0.7, fontSize: 10.5, bold: true, color: i === 5 ? ORANGE : INK, valign: "middle" });
    txt(s, d, { x: 10.42, y, w: 2.4, h: 0.7, fontSize: 9, color: INK2, valign: "middle" });
  });

  source(s, "Screens from the working CampusRun webapp prototype (prototype/ in the submission). Fee comparison uses demo on-demand fees (delivery ₹38 + small-cart ₹25 + platform ₹17.58) against run fee ₹15 + platform ₹17.58.");
  s.addNotes("User journey, shown live in the prototype video: 1) Home shows the next CampusRun slot, its fill and the drop point; GIM shows on-demand as not serviceable. 2) Run Captain parses headcount, budget and veg preference, then calls Swiggy MCP: search_restaurants, get_restaurant_menu, update_food_cart. 3) Wing Pod assigns items to roommates, adds Instamart snacks to the same run and splits the bill over UPI. 4) place_food_order joins the run; tracking walks through prep, consolidation, transit and drop-point OTP. Weekend outings use Dineout book_table with the student offer.");
}

// ======================= SLIDE 4 · BUSINESS IMPACT =======================
pres.addSection({ title: "Business Impact" });
{
  const s = slide("Business Impact", "04 · BUSINESS IMPACT", "Batching makes a 30 km campus profitable: ₹26 contribution per order, break-even at 19 orders a run");

  const kpis = [["₹26", "contribution per order", "remote run, 30 orders"], ["19", "orders to break even", "per run, capacity 40"], ["₹48", "saved per student order", "at gated campuses"]];
  kpis.forEach(([n, l, sub], i) => {
    const x = 0.45 + i * 2.13;
    box(s, x, 1.6, 2.0, 1.25, i === 0 ? SOFT : GREY);
    txt(s, n, { x: x + 0.18, y: 1.7, w: 1.7, h: 0.55, fontSize: 26, bold: true, color: i === 2 ? GREEN : ORANGE });
    txt(s, l, { x: x + 0.18, y: 2.24, w: 1.75, h: 0.3, fontSize: 10.5, bold: true });
    txt(s, sub, { x: x + 0.18, y: 2.52, w: 1.75, h: 0.25, fontSize: 9, color: MUTED });
  });

  const cats = ["Commission (18% of ₹300)", "Run fee", "Platform fee", "Vehicle (₹1,100 ÷ 30)", "Student incentive", "Payment gateway", "Campus Captain", "Contribution"];
  s.addChart(pres.charts.BAR, [
    { name: "Revenue", labels: cats, values: [54, 15, 15, 0, 0, 0, 0, 0] },
    { name: "Cost", labels: cats, values: [0, 0, 0, 37, 10, 6, 5, 0] },
    { name: "Contribution", labels: cats, values: [0, 0, 0, 0, 0, 0, 0, 26] },
  ], {
    x: 0.45, y: 3.0, w: 6.25, h: 3.72, barDir: "bar", barGrouping: "stacked", objectName: "unit-economics-chart",
    showTitle: true, title: "Per-order economics, remote run (₹): revenue 84 − cost 58 = 26", titleFontSize: 11, titleColor: HEX.ink, titleFontFace: "+mn-lt",
    chartColors: [HEX.orange, HEX.ink2, HEX.green],
    showValue: true, dataLabelPosition: "inEnd", dataLabelFontSize: 10, dataLabelColor: "FFFFFF", dataLabelFontFace: "+mn-lt", dataLabelFormatCode: "#,##0;-#,##0;;",
    catAxisLabelColor: HEX.ink2, catAxisLabelFontSize: 9.5, catAxisLabelFontFace: "+mn-lt", catAxisOrientation: "maxMin", catAxisLineShow: false,
    valAxisHidden: true, valGridLine: { style: "none" }, catGridLine: { style: "none" },
    showLegend: true, legendPos: "b", legendFontSize: 9, legendColor: HEX.ink2, legendFontFace: "+mn-lt", barGapWidthPct: 40,
  });

  // scale table
  txt(s, "Scale path (3 runs a day, 30 orders a run, ₹300 AOV, 300 days)", { x: 7.0, y: 1.6, w: 5.9, h: 0.3, fontSize: 12, bold: true });
  const hdr = { bold: true, color: WHITE, fill: { color: INK }, fontSize: 10 };
  const rows = [
    [{ text: "Stage", options: hdr }, { text: "Campuses", options: { ...hdr, align: "right" } }, { text: "Orders / yr", options: { ...hdr, align: "right" } }, { text: "GOV / yr", options: { ...hdr, align: "right" } }, { text: "Contribution", options: { ...hdr, align: "right" } }],
    ["Pilot (Goa, 90 days)", "3", "0.8 L", "₹2.4 Cr", "₹0.2 Cr"],
    ["Phase 2 (months 4–9)", "50", "13.5 L", "₹40.5 Cr", "₹3.6 Cr"],
    ["Year 1", "150", "40.5 L", "₹121.5 Cr", "₹10.7 Cr"],
    ["Year 3", "1,000", "270 L", "₹810 Cr", "₹71 Cr"],
  ].map((r, i) => i === 0 ? r : r.map((c, j) => ({ text: c, options: { fontSize: 10, align: j ? "right" : "left", color: INK, bold: i === 4, fill: { color: i % 2 ? WHITE : GREY } } })));
  s.addTable(rows, { x: 7.0, y: 1.98, w: 5.88, colW: [1.9, 0.9, 1.0, 1.04, 1.04], rowH: 0.34, border: { type: "none" }, margin: [0.03, 0.08, 0.03, 0.08], valign: "middle", objectName: "scale-table" });
  txt(s, "1,000 campuses is about a fifth of the 4,800+ already in Campus Streaks.", { x: 7.0, y: 3.74, w: 5.9, h: 0.25, fontSize: 9, color: MUTED, italic: true });

  txt(s, "Impact beyond the P&L", { x: 7.0, y: 4.08, w: 5.9, h: 0.3, fontSize: 12, bold: true });
  const imp = [
    ["New demand", "Orders from campuses that cannot order on-demand today are incremental, not cannibalised."],
    ["Frequency & habit", "Three predictable slots a day plus pooling make ordering a routine, which Campus Streaks then rewards."],
    ["Lifetime value", "Students who form the habit at 18–22 become Swiggy's core urban customers after graduation."],
    ["Fleet efficiency", "One loaded trip replaces up to 30 single-order trips and the queue at the gate."],
  ];
  imp.forEach(([t, d], i) => {
    const y = 4.45 + i * 0.57;
    s.addShape(pres.shapes.OVAL, { x: 7.0, y: y + 0.1, w: 0.22, h: 0.22, fill: { color: i === 0 ? ORANGE : GREEN }, line: { width: 0, color: WHITE }, objectName: oid("dot") });
    txt(s, t, { x: 7.35, y, w: 1.55, h: 0.5, fontSize: 10.5, bold: true, valign: "middle" });
    txt(s, d, { x: 8.9, y, w: 3.98, h: 0.5, fontSize: 9.5, color: INK2, valign: "middle" });
  });

  source(s, "All economics are planning assumptions (commission 18%, platform fee ₹15 ex-GST, vehicle ₹1,100 per 60 km round trip) for the pilot to check against Swiggy's actual data. Live model: prototype/ops.html.");
  s.addNotes("Unit economics (remote run, 30 orders, AOV Rs 300): revenue per order = commission 54 + run fee 15 + platform fee 15 = Rs 84. Costs per order = vehicle 37 (Rs 1,100 round trip / 30) + incentive 10 + gateway 6 + captain 5 = Rs 58. Contribution Rs 26 per order, Rs 790 per run. Break-even = (1,100 + 150) / (84 - 16) = 18.4, so 19 orders per run. Gated campus: the student pays Rs 32.58 in fees instead of Rs 80.58 (Rs 38 delivery + Rs 25 small-cart + Rs 17.58 platform), saving Rs 48. Swiggy gives up fee revenue there but replaces per-order rider cost with a batched trip (Rs 450 / 25 = Rs 18 per order); the pilot measures the net effect against Swiggy's real on-demand cost. Use the sliders in prototype/ops.html during Q&A.");
}

// ======================= SLIDE 5 · EXECUTION =======================
pres.addSection({ title: "Execution Plan" });
{
  const s = slide("Execution Plan", "05 · EXECUTION PLAN", "A 90-day, ₹10 L pilot on three Goa campuses, with clear gates before scaling to 150");

  const phases = [
    ["Weeks 0–2", "Set up", "MoUs with GIM + 2 Goa campuses (1 remote, 1 gated). Onboard 12–15 restaurants in 2 clusters. Hire 6 Campus Captains. Install shelves."],
    ["Weeks 3–10", "Run the pilot", "Start at 2 runs a day, then 3. A/B test slot times, run fee (₹9 vs ₹15) and pod incentives. Run Captain goes live on Swiggy MCP."],
    ["Weeks 11–12", "Decide", "Read KPIs against the gates. If met, codify the playbook: campus tagging, cluster maps, Captain hiring kit."],
    ["Months 4–12", "Scale", "50 residential campuses outside metro cores, then 150 by Year 1. Prioritise campuses already in Campus Streaks."],
  ];
  phases.forEach(([w, t, d], i) => {
    const x = 0.45 + i * 3.13;
    box(s, x, 1.6, 2.98, 1.92, i === 3 ? INK : SOFT);
    txt(s, w.toUpperCase(), { x: x + 0.18, y: 1.72, w: 2.6, h: 0.25, fontSize: 9.5, bold: true, color: ORANGE, charSpacing: 1 });
    txt(s, t, { x: x + 0.18, y: 1.98, w: 2.6, h: 0.32, fontSize: 13.5, bold: true, color: i === 3 ? WHITE : INK });
    txt(s, d, { x: x + 0.18, y: 2.35, w: 2.66, h: 1.12, fontSize: 9.5, color: i === 3 ? "D9DBE6" : INK2 });
  });

  // budget
  txt(s, "Pilot cost (gross, 80 run-days)", { x: 0.45, y: 3.7, w: 3.9, h: 0.3, fontSize: 12, bold: true });
  const bud = [["Run vehicles (640 runs)", "₹3.9 L"], ["Campus Captains", "₹1.0 L"], ["Shelves, crates, signage", "₹0.9 L"], ["Launch incentives & campus marketing", "₹2.0 L"], ["Tech: run scheduling + Run Captain", "₹2.5 L"]];
  const brow = bud.map(([a, b], i) => [{ text: a, options: { fontSize: 10, color: INK, fill: { color: i % 2 ? WHITE : GREY } } }, { text: b, options: { fontSize: 10, align: "right", color: INK, fill: { color: i % 2 ? WHITE : GREY } } }]);
  brow.push([{ text: "Total", options: { bold: true, fontSize: 10.5, color: WHITE, fill: { color: INK } } }, { text: "≈ ₹10.3 L", options: { bold: true, fontSize: 10.5, align: "right", color: WHITE, fill: { color: INK } } }]);
  s.addTable(brow, { x: 0.45, y: 4.05, w: 3.9, colW: [2.85, 1.05], rowH: 0.32, border: { type: "none" }, margin: [0.03, 0.08, 0.03, 0.08], valign: "middle", objectName: "budget-table" });
  txt(s, "Run revenue at 25 orders a run is about ₹13 L, so the pilot pays for itself once it hits the fill target.", { x: 0.45, y: 6.05, w: 3.9, h: 0.6, fontSize: 9.5, color: GREEN, bold: true });

  // risks
  txt(s, "Risks & mitigations", { x: 4.6, y: 3.7, w: 4.6, h: 0.3, fontSize: 12, bold: true });
  const risks = [
    ["Runs don't fill", "Minimum-order threshold; merge slots; Campus Streaks targets tied to runs"],
    ["Food quality over 30 km", "Insulated crates, rides under 40 min, run-eligible menus only"],
    ["Campus admin pushback", "Drop points match safety rules; revenue share to student council"],
    ["Cannibalising on-demand", "Only campuses tagged remote or gated; on-demand stays available"],
    ["Restaurant overload", "Slot caps per restaurant; prep windows sent at cutoff"],
  ];
  risks.forEach(([r, m], i) => {
    const y = 4.05 + i * 0.54;
    box(s, 4.6, y, 4.6, 0.47, i % 2 ? WHITE : GREY);
    txt(s, r, { x: 4.72, y, w: 1.6, h: 0.47, fontSize: 9.5, bold: true, valign: "middle" });
    txt(s, m, { x: 6.35, y, w: 2.8, h: 0.47, fontSize: 9, color: INK2, valign: "middle" });
  });

  // metrics
  box(s, 9.45, 3.7, 3.43, 3.0, INK);
  txt(s, "GO / NO-GO GATES (WEEK 12)", { x: 9.65, y: 3.82, w: 3.1, h: 0.25, fontSize: 9.5, bold: true, color: ORANGE, charSpacing: 1 });
  const kp = [["≥ 25", "orders per run (fill ≥ 60%)"], ["≥ 90%", "runs at the drop point on time"], ["≥ ₹20", "contribution per order"], ["≥ 3", "orders per active student per month"], ["≥ 30%", "of remote-campus buyers new to Swiggy"], ["≥ 50", "NPS from students and campus admin"]];
  kp.forEach(([n, l], i) => {
    const y = 4.14 + i * 0.42;
    txt(s, n, { x: 9.65, y, w: 0.95, h: 0.38, fontSize: 13, bold: true, color: WHITE, valign: "middle" });
    txt(s, l, { x: 10.6, y, w: 2.2, h: 0.38, fontSize: 9.5, color: "D9DBE6", valign: "middle" });
  });

  source(s, "Dependencies: campus MoUs · scheduled + batch dispatch · MCP OAuth for Run Captain · UPI collect. Costs: team estimates (GIM 2 runs/day at ₹1,100; 2 gated campuses 3 runs/day at ₹450).");
  s.addNotes("Execution. Pilot cost: vehicles = GIM 2 runs/day x 80 days x Rs 1,100 (Rs 1.76 L) + 2 gated campuses x 3 runs/day x 80 days x Rs 450 (Rs 2.16 L) = Rs 3.9 L; Captains Rs 150 x 640 runs = Rs 0.96 L; shelves, crates and signage Rs 0.9 L; incentives and marketing Rs 2.0 L; tech Rs 2.5 L. Total about Rs 10.3 L. Revenue at 25 orders/run: 640 runs x 25 x about Rs 81 = about Rs 13 L. Gates: fill of 25+ per run, on-time 90%+, contribution Rs 20+ per order, 3+ orders per active student per month, 30%+ new-to-Swiggy at remote campuses, NPS 50+.");
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
