// Demo catalogue used in MOCK mode. Restaurant names are fictional placeholders.
// In LIVE mode the same shapes come back from Swiggy MCP (food / instamart / dineout).
window.DEMO = {
  campuses: {
    gim: {
      id: "gim",
      name: "Goa Institute of Management",
      short: "GIM · Poriem, Sattari",
      type: "remote",
      distanceKm: 30.6,
      note: "30.6 km from Panaji. Outside on-demand delivery radius for most restaurants.",
      dropPoint: "Main Gate Drop Point · Shelf B",
      students: 1100,
      onDemand: { available: false, deliveryFee: null, smallCartFee: null },
    },
    city: {
      id: "city",
      name: "Metro City University (demo)",
      short: "City campus · gated",
      type: "gated",
      distanceKm: 3.2,
      note: "On-demand works, but riders stop at the gate. Students walk ~900 m from the hostel.",
      dropPoint: "Hostel Block C · Smart Shelf",
      students: 6000,
      onDemand: { available: true, deliveryFee: 38, smallCartFee: 25 },
    },
  },

  slots: [
    { id: "lunch", label: "Lunch Run", time: "1:15 PM", closesMin: 45, cluster: "Mapusa–Bicholim", capacity: 40 },
    { id: "dinner", label: "Dinner Run", time: "8:30 PM", closesMin: 45, cluster: "Panaji–Porvorim", capacity: 40 },
    { id: "midnight", label: "Midnight Run", time: "11:45 PM", closesMin: 40, cluster: "Mapusa", capacity: 30 },
  ],

  restaurants: [
    { id: "r1", name: "Coastal Biryani Co.", cuisine: "Biryani · North Indian", rating: 4.4, priceForOne: 220, veg: false, tags: ["biryani", "rice", "north indian", "dinner"], cluster: "Panaji–Porvorim", runEligible: true },
    { id: "r2", name: "Slice Republic Pizza", cuisine: "Pizza · Italian", rating: 4.2, priceForOne: 250, veg: false, tags: ["pizza", "italian", "party", "late night"], cluster: "Panaji–Porvorim", runEligible: true },
    { id: "r3", name: "Thali Junction", cuisine: "Thali · Home-style", rating: 4.5, priceForOne: 160, veg: true, tags: ["thali", "home style", "healthy", "veg", "lunch"], cluster: "Mapusa–Bicholim", runEligible: true },
    { id: "r4", name: "Roll Call Kathi Rolls", cuisine: "Rolls · Snacks", rating: 4.3, priceForOne: 140, veg: false, tags: ["rolls", "snacks", "late night", "egg"], cluster: "Mapusa", runEligible: true },
    { id: "r5", name: "Green Bowl Kitchen", cuisine: "Salads · Healthy (EatRight)", rating: 4.6, priceForOne: 210, veg: true, tags: ["healthy", "salad", "protein", "eatright", "veg"], cluster: "Panaji–Porvorim", runEligible: true },
    { id: "r6", name: "Momo Station", cuisine: "Momos · Chinese", rating: 4.1, priceForOne: 130, veg: false, tags: ["momos", "chinese", "snacks", "late night"], cluster: "Mapusa–Bicholim", runEligible: true },
  ],

  menus: {
    r1: [
      { id: "m11", name: "Chicken Dum Biryani (Half)", price: 199, veg: false },
      { id: "m12", name: "Veg Dum Biryani (Half)", price: 159, veg: true },
      { id: "m13", name: "Paneer Tikka (6 pc)", price: 179, veg: true },
      { id: "m14", name: "Family Chicken Biryani (serves 3)", price: 549, veg: false },
      { id: "m15", name: "Gulab Jamun (2 pc)", price: 59, veg: true },
    ],
    r2: [
      { id: "m21", name: "Margherita (Medium)", price: 249, veg: true },
      { id: "m22", name: "Farmhouse (Medium)", price: 329, veg: true },
      { id: "m23", name: "Chicken Tikka (Medium)", price: 369, veg: false },
      { id: "m24", name: "Garlic Bread", price: 99, veg: true },
      { id: "m25", name: "Coke 750 ml", price: 45, veg: true },
    ],
    r3: [
      { id: "m31", name: "Mini Veg Thali", price: 129, veg: true },
      { id: "m32", name: "Full Veg Thali", price: 169, veg: true },
      { id: "m33", name: "Dal Khichdi + Papad", price: 119, veg: true },
      { id: "m34", name: "Buttermilk", price: 30, veg: true },
    ],
    r4: [
      { id: "m41", name: "Double Egg Roll", price: 99, veg: false },
      { id: "m42", name: "Chicken Tikka Roll", price: 139, veg: false },
      { id: "m43", name: "Paneer Roll", price: 119, veg: true },
      { id: "m44", name: "Masala Fries", price: 79, veg: true },
    ],
    r5: [
      { id: "m51", name: "High-Protein Chicken Bowl", price: 239, veg: false },
      { id: "m52", name: "Paneer Quinoa Bowl", price: 219, veg: true },
      { id: "m53", name: "Sprouts Salad", price: 129, veg: true },
    ],
    r6: [
      { id: "m61", name: "Veg Steamed Momos (8)", price: 99, veg: true },
      { id: "m62", name: "Chicken Steamed Momos (8)", price: 129, veg: false },
      { id: "m63", name: "Chicken Fried Momos (8)", price: 149, veg: false },
    ],
  },

  instamart: [
    { id: "i1", name: "Maggi 2-Minute Noodles (Pack of 4)", price: 56 },
    { id: "i2", name: "Amul Kool Cafe 200 ml", price: 30 },
    { id: "i3", name: "Lay's Classic Salted 52 g", price: 20 },
    { id: "i4", name: "Instant Coffee Sachets (10)", price: 60 },
    { id: "i5", name: "Bananas (6 pc)", price: 48 },
  ],

  dineout: [
    { id: "d1", name: "Riverside Shack (demo)", area: "Panaji", costForTwo: 1200, studentOff: 20, slots: ["7:00 PM", "7:30 PM", "8:30 PM"] },
    { id: "d2", name: "Old Quarter Café (demo)", area: "Fontainhas, Panaji", costForTwo: 900, studentOff: 20, slots: ["6:30 PM", "8:00 PM"] },
    { id: "d3", name: "Beach Grill House (demo)", area: "Calangute", costForTwo: 1500, studentOff: 20, slots: ["8:00 PM", "9:00 PM"] },
  ],

  podMembers: [
    { name: "You", initials: "YO", color: "#FF5200" },
    { name: "Aarav (Room 214)", initials: "AR", color: "#0E8A5F" },
    { name: "Ishita (Room 218)", initials: "IS", color: "#7A3FF2" },
    { name: "Kabir (Room 221)", initials: "KB", color: "#1D6FE0" },
  ],
};
