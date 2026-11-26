# CampusRun prototype (webapp)

A working, click-through prototype of **Swiggy CampusRun**: scheduled, pooled campus delivery with an AI ordering agent on Swiggy MCP.

## Run it
Needs Node 18+ and no dependencies.

```bash
cd prototype
node server.js
```

Open http://localhost:5173. The student app is `index.html`; ops and unit economics are in `ops.html`.

You can also open `index.html` directly in a browser. Demo mode works without the server.

## What it shows
| Screen | What happens | Swiggy MCP calls |
|---|---|---|
| Home | Next CampusRun slot, countdown, fill, drop point; campus switcher (remote GIM vs gated city campus) | none |
| Run Captain | Natural-language ask → budget-aware group cart | `food.search_restaurants`, `food.get_restaurant_menu`, `food.update_food_cart` |
| Wing Pod | Items per roommate, fee comparison, slot picker, UPI split, Instamart add-ons | `instamart.search_products`, `instamart.update_cart` |
| Track | Join the run, consolidated run status, drop-point OTP | `food.place_food_order`, `food.track_food_order`, `campusrun.join_run` (proposed new service, simulated) |
| Outing | Group table search and booking with the student offer | `dineout.search_restaurants`, `dineout.book_table` |
| Ops | Live unit-economics simulator, scale view, run manifest | none |

The **MCP trace** panel logs every tool call with its arguments, response and latency.

## Demo vs live mode
- **Demo (default):** `mcp.js` answers from `data.js` (fictional restaurants), so recordings come out the same every time.
- **Live:** `server.js` proxies calls to `https://mcp.swiggy.com/{food|im|dineout}` using MCP Streamable HTTP (`initialize` → `tools/call`). It needs an OAuth access token from the Swiggy MCP sign-in flow:

```bash
SWIGGY_MCP_TOKEN=<token> node server.js
```

Then open http://localhost:5173/api/tools to list the live tool schemas. Tool names follow the Swiggy Builders Club docs. **Check the argument names and the Instamart tool names against that list** before recording a live demo, and adjust `app.js` if they differ. Never commit the token.

Live ordering can place real orders. Stop before `place_food_order` unless you intend to buy.

## Files
- `index.html`, `styles.css`, `app.js`: student app and Run Captain agent logic (intent parsing → MCP calls → budget optimiser)
- `mcp.js`: MCP client (mock + live transports) and the CampusRun run service
- `data.js`: demo catalogue
- `ops.html`: ops dashboard and economics simulator
- `server.js`: static server + `/api/mcp` and `/api/tools` proxy
