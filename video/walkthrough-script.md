# CampusRun: prototype video walkthrough script (≈ 3 min)

**Set-up before recording**
- `cd prototype && node server.js`, then open `http://localhost:5173` in Chrome at 1440×900, zoom 100%.
- Campus = **GIM · Poriem (remote)**. MCP mode = **Demo** gives a predictable recording. Switch to **Live Swiggy MCP** and **Sign in with Swiggy** to show real restaurants and a real cart; that's stronger for the 30%, but rehearse it first.
- Record screen and voice (OBS, Loom or Google Meet recording). Two voices work well: Speaker A = Samarth, Speaker B = Yogendra.
- Keep the **MCP trace** panel on screen the whole time. It is how judges see Swiggy MCP doing the work.

| Time | Screen | Voice-over |
|---|---|---|
| 0:00–0:20 | Home screen, GIM selected | **A:** "We're Team Syntara from Goa Institute of Management. Our campus is 30 km from Panaji, and on-demand delivery doesn't reach us. Gated city campuses have the opposite problem: delivery stops at the gate. CampusRun fixes both by turning scattered orders into scheduled, pooled runs." |
| 0:20–0:40 | Point at the yellow alert, the hero card, the countdown and the fill bar | **A:** "In our survey of 173 GIM students, 80% had a campus order fail or gave up on it. Instead of 'not serviceable', a GIM student now sees the next run: Dinner Run, 8:30 PM, orders close in 23 minutes, 31 students already in, drop at the main-gate shelf." |
| 0:40–1:15 | Click **Plan my order with Run Captain**, then the chip *Dinner for 4 under ₹900, 1 non-veg* | **B:** "Run Captain is an AI ordering agent built on Swiggy MCP. Watch the trace on the right: it calls `search_restaurants` on Swiggy's Food server, reads menus with `get_restaurant_menu`, builds the cart with `update_food_cart` and confirms it with `get_food_cart`. Four people, one non-veg, ₹846 including fees, inside the budget." |
| 1:15–1:45 | **Send to Wing Pod** → scroll; click **+ Add Instamart snacks** | **B:** "The plan becomes a Wing Pod for roommates in Block C. Each person's item is tagged, Instamart snacks ride the same run, and the bill splits on UPI. At GIM on-demand isn't available, and CampusRun costs ₹32.58 a person in fees." |
| 1:45–2:00 | Switch campus to **City campus (gated)** | **A:** "On a gated city campus, the same pod costs ₹32.58 each instead of ₹80.58 for four separate orders, and nobody walks to the gate. That's ₹192 saved tonight." Switch back to GIM. |
| 2:00–2:25 | **Place pod order** → Track → click **Simulate run progress** 4× | **B:** "`place_food_order` joins the 8:30 run. The restaurant preps to the slot, 32 orders load into one vehicle, and it drives the 30 km once. At the drop point, a paid Campus Captain checks the OTP, so riders never enter hostels." |
| 2:25–2:40 | **Outing** tab → Find tables → book a slot | **A:** "For weekends, Run Captain finds tables with `search_restaurants_dineout`, checks Friday slots with `get_available_slots` and books with `book_table`." |
| 2:40–3:00 | Open **Ops & Economics** and drag the *Orders per run* slider | **A:** "For Swiggy, at the ₹230 basket from our survey, a remote run of 30 orders makes ₹15 contribution per order and breaks even at 23. CampusRun reuses Campus Streaks, Student Rewards and MCP, so it can launch with three Goa campuses in 90 days. CampusRun: delivery to the hostel, not just the gate." |

**Tips**
- Rehearse once. Demo mode is deterministic, so the same clicks give the same result every time.
- Survey facts to have ready for Q&A: n = 173; 79% would use a fixed slot; gate pickup is the #1 frustration (45%); runs follow demand: dinner 86%, late night 74%, evening 45%, lunch 34% (dropped).
- Export at 1080p and keep it under the length the submission portal allows.
- Don't upload it publicly (YouTube etc.) without Swiggy's approval; use an unlisted or private link only if the portal requires a link.
