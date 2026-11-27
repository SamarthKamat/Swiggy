# CampusRun: secondary research evidence pack

Team Syntara · Goa Institute of Management · Swiggy Food for Thought 2.0

Every number in the deck traces to a row below. The facts were gathered from web search results in Nov 2026. **Open each link and confirm the exact wording before you submit**: some pages are news re-prints, and a few figures carry caveats, noted in the last column.

## 0. Primary research: GIM student survey

Google Form, n = 173 GIM students (PGDM Core 82, BDA 48, BIFS 22, HCM 21; 92% in campus hostels), collected 26–27 Nov 2026. Raw export: `survey/GIM_Swiggy_CampusRun_Survey_Responses.csv`; computed results: `survey/results.json` (`python3 research/survey/analyze.py`).

| Finding | Value | Used in |
|---|---|---|
| Failed or abandoned a campus order | 80% (50% "unserviceable", 31% abandoned over fees) | Slide 1 |
| Ordered but hit gate wait or hassle | 15% | Notes |
| Median walk + wait at the gate | 15–20 min (57% spend 15+ min) | Slide 1 |
| Would order from a fixed slot to save ₹40+ | 79% (50% "definitely") | Slide 1 |
| Average per-person basket (bucket midpoints) | ₹229, used as AOV ₹230 | Slides 1, 4 |
| Biggest frustration | Gate pickup 45%, fees 34%, group coordination 15%, cold food 7% | Slide 1 |
| Why order outside the mess | Mess fatigue 81%, late-night hunger 74%, group hangouts 65%, cuisine/healthy cravings 49% | Slide 1 |
| Ordering windows | Dinner 86%, late night 74%, evening snacks 45%, lunch 34% | Slides 2, 5: lunch slot replaced by evening |
| Feature pull | Wing pooling + UPI split 77%, Instamart add-ons 71%, OTP drop shelf 61%, AI planner 56%, Dineout offers 46% | Slide 2 |
| Weekly users if launched | 80% (stated 1.73 orders per student a week) | Slide 4 demand check |
| Would order healthy / EatRight meals regularly | 46% (83% at least occasionally) | Slide 2 |

**How the research changed the solution:** (1) the third run moved from lunch (34%) to evening snacks (45%), and the pilot starts with dinner and midnight; (2) AOV came down from an assumed ₹300 to the surveyed ₹230, so the unit economics were rebuilt (₹15 per order, break-even 23); (3) wing pooling and the OTP shelf were confirmed as core features, not add-ons.

## 1. Scale of the problem: where Indian students study

| Fact used in deck | Source | Caveat |
|---|---|---|
| 61.4% of colleges and 43% of universities are in rural areas | Ministry of Education / PIB AISHE release: https://pib.gov.in/PressReleasePage.aspx?PRID=1894517 · Careers360 summary: https://news.careers360.com/student-enrollment-in-higher-education-crosses-4-crore-aishe-report-2020-2021 | Careers360 links the figure to AISHE 2020-21. Cite it as "AISHE (2020-21)" if the PIB page confirms that year |
| 4.33 crore higher-education enrolment (2021-22) | PIB: https://pib.gov.in/PressReleasePage.aspx?PRID=1999713 · AISHE 2021-22 book: https://education.gov.in/sites/upload_files/mhrd/files/statistics-new/AISHE%20Book_2021-22_4.pdf | none |
| 45,473 colleges registered (2021-22) | AISHE 2021-22 book (link above) | not used on slides, available for Q&A |

## 2. The remote-campus archetype (GIM)

| Fact | Source | Caveat |
|---|---|---|
| GIM to Panaji is 30.6 km by road (~31 min by car) | Rome2rio: https://www.rome2rio.com/s/Goa-Institute-of-Management/Panjim | none |
| Campus is at Poriem, near Sanquelim (Sattari) | GIM: https://gim.ac.in/institute/campus | none |
| Students petitioned for quick-commerce delivery to the "scenic yet secluded" campus | Change.org: https://www.change.org/p/extend-blinkit-services-to-gim | Undated in search results. Check the date; it shows unmet demand, not current serviceability |

## 3. The gated-campus archetype

| Fact | Source | Caveat |
|---|---|---|
| Anna University: delivery executives allowed only up to the gate; bicycles inside campus | News Arena India: https://www.newsarenaindia.com/states/anna-university-promotes-bicycles-restricts-food-delivery-entry/32882 | Check whether the rule is still current |
| IGGMCH Nagpur barred food-delivery agents from hostels; movement limited to the security post (Oct 2025) | Careers360: https://news.careers360.com/nagpur-medical-college-bans-entry-food-delivery-agents-inside-hostel-buildings-amid-rising-rape-cases-rg-kar-durgapur-assault-report | Safety-driven, which supports drop points over riders inside hostels |
| EFLU Hyderabad students demanded unrestricted entry for delivery riders | Sakshi Post: https://www.sakshipost.com/eflu-students-demand-unrestricted-entry-for-food-delivery-boys | Older item. Use it as a pattern, not as current |
| Delivery agents usually stop at the main gate, so students walk long distances | Campus Ideaz: https://campusideaz.com/ideaz/campus-grub-redefining-dining-in-universities | Opinion/concept piece, not data |

## 4. Mess dissatisfaction: why students order at all

| Fact | Source | Caveat |
|---|---|---|
| 86.4% of SRMIST respondents who waste mess food cite poor quality (1,800+ students surveyed) | SRMIST food-waste project: https://vikashpr.github.io/18CSE301J-FinalProject | Student project survey, one campus. Present it as indicative |
| Azim Premji University students submitted a food charter built from 800+ responses (Feb 2025) | Akshayakalpa feature: https://gfm.akshayakalpa.org/read/feature-article/mess-on-my-plate-indias-students-are-fixing-their-college-diets | No percentages in the snippet |
| Food quality is among the most common hostel complaints | Careers360: https://news.careers360.com/ladies-hostel-life-public-private-university-college-fees-mess-food-dirty-toilet-women-security-higher-ed-student-mental-health | Journalism, not a survey |

## 5. Affordability: fees on small carts

| Fact | Source | Caveat |
|---|---|---|
| Swiggy platform fee: ₹2 (Apr 2023) → ₹14 (Aug 2025) → ₹15 (Sep 2025) → ₹17.58 incl. GST (Mar 2026) | Business Today: https://www.businesstoday.in/technology/story/swiggy-hikes-platform-fee-to-rs-1758-per-order-follows-zomatos-recent-increase-522031-2026-03-24 · Inc42: https://inc42.com/buzz/swiggy-raises-platform-fee-to-%e2%82%b917-58-after-zomatos-hike/ | Intermediate steps differ slightly across outlets. Fees vary by city |
| 87% of food-delivery users report hidden charges ("basket sneaking") | LocalCircles survey via Global Brands Magazine: https://www.globalbrandsmagazine.com/basket-sneaking-the-hidden-charges-on-food-delivery-apps/ | Secondary report; sample size and date not shown |
| Goa college students: study of pricing awareness, platform trust and spending on delivery apps (Jul 2026) | Zenodo: https://zenodo.org/records/21276753 | **Read it**. Goa-specific data would strengthen slide 1 |

## 6. Swiggy's right to win (existing assets CampusRun reuses)

| Fact | Source |
|---|---|
| Campus Streaks: 4,800+ campuses in 310 cities; collective 24-hour order targets twice a week; up to ₹75 Swiggy cash | PR Newswire (Sep 2025): https://www.prnewswire.com/in/news-releases/swiggy-expands-campus-streaks-a-new-initiative-that-provides-a-fun-way-for-college-students-to-order-and-win-together-302545065.html |
| Student Rewards Program: 3 lakh+ enrolments; ages 18–25; college ID verification; Dineout 20% off bills over ₹799 | Tribune: https://www.tribuneindia.com/news/business/swiggys-students-rewards-program-crosses-3-lakh-enrollments-signing-up-now-made-easier-with-valid-physical-college-id |
| EatRight orders from campuses up 40%+ YoY; healthy late-night orders up 10%+ | Mediainfoline (Nov 2025): https://www.mediainfoline.com/foodies/swiggys-eatright-orders-from-campuses-grow-by-over-40-yoy |
| Late-night (12–2 AM) ordering is now a habit | How India Swiggy'd 2025: https://www.swiggy.com/corporate/press-release/how-india-swiggyd-2025-a-feast-for-the-fast-the-foodie-and-the-future/ |
| Group Ordering exists (party coordination) | Swiggy blog: https://blog.swiggy.com/?p=20248 |

## 7. Swiggy MCP (prototype requirement)

Checked directly against the Swiggy Builders Club docs (`mcp.swiggy.com/builders`, Nov 2026).

| Fact | Source |
|---|---|
| 4 MCP servers (Food, Instamart, Dineout, Scenes), 60+ tools; ordering from ChatGPT, Claude and Gemini (Jan 2026) | https://mcp.swiggy.com/builders/docs/start/what-is-swiggy-mcp/ · Swiggy corporate: https://www.swiggy.com/corporate/?p=16731 |
| Endpoints `mcp.swiggy.com/food`, `/im`, `/dineout`; Streamable HTTP in stateless JSON mode | https://mcp.swiggy.com/builders/docs/reference/protocol/ |
| OAuth 2.1 + PKCE with dynamic client registration; `http://localhost` redirects allowed for development; 5-day access token with refresh | https://mcp.swiggy.com/builders/docs/start/authenticate/ |
| Tools used: Food `get_addresses`, `search_restaurants`, `get_restaurant_menu`, `update_food_cart`, `get_food_cart`, `place_food_order`, `track_food_order`; Instamart `search_products`, `update_cart`; Dineout `search_restaurants_dineout`, `get_available_slots`, `book_table` | https://mcp.swiggy.com/builders/docs/reference/ |
