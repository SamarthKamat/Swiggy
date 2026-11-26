# CampusRun prototype (webapp)

A working, click-through prototype of **Swiggy CampusRun**: scheduled, pooled campus delivery with an AI ordering agent (Run Captain) built on the **real Swiggy MCP servers**.

## Run it
Needs Node 18+ and no dependencies.

```bash
cd prototype
node server.js
```

Open http://localhost:5173. The student app is `index.html`; ops and unit economics are in `ops.html`.

## Demo mode vs live Swiggy MCP
| | Demo (default) | Live |
|---|---|---|
| Data | Fictional restaurants from `data.js` | Your real Swiggy account, real restaurants and menus |
| Tool calls | Same tool names and arguments as live; responses follow Swiggy's documented output schemas | `https://mcp.swiggy.com/food`, `/im`, `/dineout` |
| Needs | Nothing | One-time **Sign in with Swiggy** (phone + OTP) |

**To go live:**
1. Run `node server.js` and open http://localhost:5173
2. Set **MCP mode** to **Live Swiggy MCP**, then click **Sign in with Swiggy**. This uses Swiggy's documented OAuth 2.1 + PKCE flow with dynamic client registration and a `http://localhost:5173/auth/callback` redirect. Log in with your phone number and OTP on Swiggy's page; you're sent back signed in.
3. The token (5 days, refreshed automatically) is stored in `prototype/.swiggy-token.json`, which is git-ignored. Never commit it.
4. Check the live tool list any time at http://localhost:5173/api/tools

In live mode:
- **Run Captain** reads your saved address (`get_addresses`). At a remote campus it first shows how many restaurants Swiggy returns for your hostel address. It then searches the run's restaurant-cluster hub, builds a **real Swiggy cart** (`update_food_cart` → `get_food_cart`), and shows the real cart ID.
- **Place pod order** asks for confirmation before calling `place_food_order` (cash on delivery), because it is a **real order**. CampusRun's run dispatch (`campusrun.join_run`) is the new capability we propose to Swiggy, so it stays simulated.
- **Outing** searches real Dineout restaurants in Panaji (`search_restaurants_dineout` → `get_available_slots`) and asks before `book_table` makes a real free reservation.

Behind a corporate or sandbox proxy, start the server with `NODE_USE_ENV_PROXY=1 node server.js`. On a normal laptop you don't need it.

## Swiggy MCP tools used (checked against Swiggy Builders Club reference, Nov 2026)
| Server | Tools |
|---|---|
| Food | `get_addresses`, `search_restaurants` (query, addressId or lat/lng), `get_restaurant_menu` (restaurantId), `update_food_cart` (restaurantId, cartItems[{menu_item_id, quantity}]), `get_food_cart`, `place_food_order` (addressId, paymentMethod, noteToRestaurant), `track_food_order` (orderId) |
| Instamart | `search_products` (query, addressId), `update_cart` (selectedAddressId, items[{spinId, skuId, quantity}]) |
| Dineout | `search_restaurants_dineout` (query, latitude, longitude), `get_available_slots` (restaurantId, date, lat, lng), `book_table` (restaurantId, slotId, itemId, reservationTime, guestCount, lat, lng) |

Results are read from `structuredContent` (with the JSON-envelope fallback), as Swiggy's docs specify.

## Serviceability audit (real data for slide 1)
After signing in, save your GIM hostel address in the Swiggy app, then run:

```bash
node prototype/tools/serviceability-audit.js
```

It counts the open restaurants Swiggy returns for 6 cuisines at your saved addresses and at Panaji city centre, and writes `research/survey/serviceability.json`. The deck build picks it up automatically. It is read-only and never touches carts or orders.

## Files
- `index.html`, `styles.css`, `app.js`: student app and Run Captain agent (intent parsing → MCP calls → budget optimiser)
- `mcp.js`: `SwiggyAPI` adapter (real tool names), mock server with Swiggy-schema responses, and the CampusRun run service
- `data.js`: demo catalogue and run-hub coordinates
- `ops.html`: ops dashboard and economics simulator
- `server.js`: static server, Swiggy OAuth (`/auth/login`, `/auth/callback`, `/auth/status`, `/auth/logout`), and the `/api/mcp` and `/api/tools` proxy
- `tools/serviceability-audit.js`: real serviceability data via Swiggy MCP
