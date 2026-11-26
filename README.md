# CampusRun · Swiggy Food for Thought 2.0

**Team Syntara · Goa Institute of Management**

> *Delivery to the hostel, not just the gate.*
> CampusRun adds scheduled, pooled delivery runs to Swiggy for campuses that are either too remote for on-demand delivery (like GIM, 30.6 km from Panaji) or gated so riders stop at the main gate. An AI **Run Captain** built on Swiggy MCP plans budget-aware group carts, wing pods split the bill, and a paid student **Campus Captain** hands orders over at an OTP drop point.

## Submission contents
| Part | Weight | File |
|---|---|---|
| Business case (5 slides) | 70% | `deck/CampusRun_TeamSyntara_GIM.pptx` (+ `.pdf`) |
| Prototype (webapp) | 30% | `prototype/`: run with `cd prototype && node server.js` |
| Video walkthrough script | part of the 30% | `video/walkthrough-script.md` |
| Secondary research with sources | supports the 70% | `research/evidence.md` |
| Primary research kit (survey, interviews, observation, smoke test) | **mandatory validation** | `research/primary-research-kit.md` |

## Before you submit (checklist)
1. **Run the primary research** (`research/primary-research-kit.md`) and replace the four orange `[__]` placeholders on slide 1 with your real numbers. Edit `deck/build-deck.js` and rebuild, or edit the `.pptx` directly.
2. Open each source link in `research/evidence.md` and confirm the figures.
3. Record the video following `video/walkthrough-script.md`.
4. Don't publish the prototype or deck publicly. The competition rules require Swiggy's prior approval.

## The case in five lines
1. **Insight:** campus demand is already clustered in time (mess-off hours) and place (hostel blocks), yet it is fulfilled one order, one rider. On campus, speed is the wrong goal; predictable, pooled delivery is the right one.
2. **Solution:** three scheduled runs a day per campus, Run Captain AI + Wing Pods, drop points run by Campus Captains, and Instamart and Dineout riding along.
3. **Journey:** see the run → ask Run Captain → pool and split → track → collect with an OTP.
4. **Impact:** ₹26 contribution per order on a 30-order remote run, break-even at 19 orders. Students at gated campuses save ₹48 per order.
5. **Execution:** a 90-day, ₹10 L pilot on three Goa campuses with go/no-go gates, then 50 → 150 campuses.

## Rebuilding the deck
```bash
npm install pptxgenjs          # in any scratch folder
NODE_PATH=<that folder>/node_modules node deck/build-deck.js <path to pptx skill>/scripts/apply_theme.js
```
