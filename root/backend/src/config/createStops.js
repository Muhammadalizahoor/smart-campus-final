// ===============================================
// createStops.js  (ONE-TIME FIRESTORE SETUP)
// ===============================================

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

async function createStops() {
  console.log("🚍 Creating stops...");



  const stops148 = [
    { id: "muslin_town", name: "Muslin_town", lat:31.52071888152995, lng:74.32261811502903, order: 1, routeId: "route_04" },
    { id: "naqsha_Stop", name: "Naqsha_Stop", lat:31.516741390435463, lng:74.31528484034222, order: 2, routeId: "route_04" },
    { id: "bhaikewal_Morr", name: "Bhaikewal_Morr", lat:31.509179273280644, lng:74.3028791220923, order: 3, routeId: "route_04" },
    { id: "wahdat_road", name: "Wahdat_road", lat:31.507650204925067, lng:74.29652656415593, order: 4, routeId: "route_04" },
    { id: "raza_block", name: "Raza_block", lat:31.50641089168856, lng:74.28615134034024, order: 5, routeId: "route_04" },
    { id: "uet_ksk_148", name: "UET KSK (148)", lat:31.692611677533087, lng:74.2517482589608, order: 6, routeId: "route_04" },
  ];

  const allStops = [...stops148];

  for (const stop of allStops) {
    const ref = firestore.collection("stops").doc(stop.id);
    const exists = await ref.get();

    if (!exists.exists) {
      await ref.set(stop);
      console.log("✅ Created:", stop.id);
    } else {
      console.log("⏭ Already exists, skipped:", stop.id);
    }
  }

  console.log("🎉 DONE — All stops processed.");
}

createStops();
