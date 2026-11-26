# CampusRun: prototype video walkthrough script (≈ 3 min)

**Set-up before recording**
- `cd prototype && node server.js`, then open `http://localhost:5173` in Chrome at 1440×900, zoom 100%.
- Campus = **GIM · Poriem (remote)**, MCP mode = **Demo** (or **Live** if you have a Swiggy MCP token and have checked the schemas with `/api/tools`).
- Record screen and voice (OBS, Loom or Google Meet recording). Two voices work well: Speaker A = Samarth, Speaker B = Yogendra.
- Keep the **MCP trace** panel on screen the whole time. It is how judges see Swiggy MCP doing the work.

| Time | Screen | Voice-over |
|---|---|---|
| 0:00–0:20 | Home screen, GIM selected | **A:** "We're Team Syntara from Goa Institute of Management. Our campus is 30 km from Panaji, and on-demand delivery doesn't reach us. Gated city campuses have the opposite problem: delivery stops at the gate. CampusRun fixes both by turning scattered orders into scheduled, pooled runs." |
| 0:20–0:40 | Point at the yellow alert, the hero card, the countdown and the fill bar | **A:** "Instead of 'not serviceable', a GIM student now sees the next run: Dinner Run, 8:30 PM, orders close in 23 minutes, 31 students already in, drop at the main-gate shelf." |
| 0:40–1:15 | Click **Plan my order with Run Captain**, then the chip *Dinner for 4 under ₹900, 1 non-veg* | **B:** "Run Captain is an AI ordering agent built on Swiggy MCP. Watch the trace on the right: it calls `search_restaurants` on the Food server, reads the menu with `get_restaurant_menu`, then builds the cart with `update_food_cart`. Four people, one non-veg, ₹846 including fees, inside the budget." |
| 1:15–1:45 | **Send to Wing Pod** → scroll; click **+ Add Instamart snacks** | **B:** "The plan becomes a Wing Pod for roommates in Block C. Each person's item is tagged, Instamart snacks ride the same run, and the bill splits on UPI. At GIM on-demand isn't available, and CampusRun costs ₹32.58 a person in fees." |
| 1:45–2:00 | Switch campus to **City campus (gated)** | **A:** "On a gated city campus, the same pod costs ₹32.58 each instead of ₹80.58 for four separate orders, and nobody walks to the gate. That's ₹192 saved tonight." Switch back to GIM. |
| 2:00–2:25 | **Place pod order** → Track → click **Simulate run progress** 4× | **B:** "`place_food_order` joins the 8:30 run. The restaurant preps to the slot, 32 orders load into one vehicle, and it drives the 30 km once. At the drop point, a paid Campus Captain checks the OTP, so riders never enter hostels." |
| 2:25–2:40 | **Outing** tab → Find tables → book a slot | **A:** "For weekends, Run Captain books group tables through Swiggy Dineout's `book_table`, with the 20% student offer." |
| 2:40–3:00 | Open **Ops & Economics** and drag the *Orders per run* slider | **A:** "For Swiggy, a remote run of 30 orders makes ₹26 contribution per order and breaks even at 19. CampusRun reuses Campus Streaks, Student Rewards and MCP, so it can launch with three Goa campuses in 90 days. CampusRun: delivery to the hostel, not just the gate." |

**Tips**
- Rehearse once. Demo mode is deterministic, so the same clicks give the same result every time.
- If you collected primary research, add one line at 0:20: "Our survey of [n] GIM students found [__]% gave up ordering to campus."
- Export at 1080p and keep it under the length the submission portal allows.
- Don't upload it publicly (YouTube etc.) without Swiggy's approval; use an unlisted or private link only if the portal requires a link.
