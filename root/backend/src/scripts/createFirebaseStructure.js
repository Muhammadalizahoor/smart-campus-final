// ================================================
// backend/src/scripts/createFirebaseStructure.js
// Real routes for Bus_143 and Bus_148 (Lahore)
// Matches frontend GoogleMap.jsx
// ================================================

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://locations-f7114-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const db = admin.database();

// =============================
// REAL ROUTE DATA
// =============================
const buses = {
  Bus_143: {
    // 🔵 Route 143: Mochi Pura → UET KSK (Khokhar Chowk REMOVED)
    route: [
      { lat: 31.554939, lng: 74.297859 }, // Mochi Pura
      { lat: 31.457430, lng: 74.291880 }, // Akbar Chowk
      { lat: 31.462271, lng: 74.301405 }, // M Ali Chowk
      // Khokhar Chowk REMOVED as per your instruction
      { lat: 31.460221, lng: 74.295970 }, // Al-Jannat Chowk
      { lat: 31.436278, lng: 74.288266 }, // Ameer Chowk
      { lat: 31.444772, lng: 74.293482 }, // Butt Chowk
      { lat: 31.439207, lng: 74.290763 }, // Ghazi Chowk
      { lat: 31.447379, lng: 74.274058 }, // Wapda Town
      { lat: 31.434296, lng: 74.264932 }, // Abu Bakar Chowk
      { lat: 31.451038, lng: 74.242592 }, // Abdul Sattar Edhi Road
      { lat: 31.706263, lng: 74.245948 }, // UET KSK
    ],
    // ⬇️ GPS module will update this node only
    current: { lat: 0, lng: 0, speed: 0, timestamp: "" },
  },

  Bus_148: {
    // 🔴 Route 148: Harbanspura → UET KSK
    route: [
      { lat: 31.586585, lng: 74.435234 }, // Harbanspura
      { lat: 31.563124, lng: 74.420000 }, // Taj Bagh
      { lat: 31.573840, lng: 74.404394 }, // Fateh Garh
      { lat: 31.564353, lng: 74.390423 }, // Lal Pul
      { lat: 31.571683, lng: 74.358574 }, // Mughalpura
      { lat: 31.555014, lng: 74.365148 }, // Dharampura
      { lat: 31.706263, lng: 74.245948 }, // UET KSK
    ],
    current: { lat: 0, lng: 0, speed: 0, timestamp: "" },
  },
};

async function upload() {
  await db.ref("live_locations").set(buses);
  console.log("✔ live_locations updated with routes for 143 & 148");
  process.exit(0);
}

upload().catch((err) => {
  console.error("❌ ERROR:", err);
  process.exit(1);
});
