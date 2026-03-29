
// // backend//src//controllers//speedController.js


const { rtdb, firestore } = require("../config/firebase");

// ================= SPEED LIMIT RULES =================
const SPEED_ZONES = [
  { zone: "campus", speedLimit: 40 },
  { zone: "main_road", speedLimit: 60 },
  { zone: "highway", speedLimit: 80 },
];

function resolveZone(lat, lng) {
  return SPEED_ZONES[0]; // campus for now
}

// ================= REAL-TIME MONITOR =================
exports.startSpeedMonitoring = () => {
  const busesRef = rtdb.ref("live_locations");

  busesRef.on("value", async (snapshot) => {
    if (!snapshot.exists()) return;

    const buses = snapshot.val();

    for (const busId in buses) {
      const current = buses[busId]?.current;
      if (!current) continue;

      const { lat, lng, speed } = current;
      if (speed == null) continue;

      const zone = resolveZone(lat, lng);

      if (Number(speed) > zone.speedLimit) {
        const now = new Date();

        await firestore.collection("speed_events").add({
          busId,
          actualSpeed: Number(speed),
          speedLimit: zone.speedLimit,
          zone: zone.zone,
          roadName: zone.zone.toUpperCase(),
          lat,
          lng,
          timestamp: now,
          date: now.toISOString().split("T")[0],
          month: now.toISOString().slice(0, 7),
        });

        console.log(`⚠️ Overspeed | ${busId} | ${speed}`);
      }
    }
  });

  console.log("🚀 Speed monitoring started");
};

// ================= API =================
exports.getSpeedEvents = async (req, res) => {
  try {
    const snap = await firestore
      .collection("speed_events")
      .orderBy("timestamp", "desc")
      .get();

    const events = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ events });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch speed events" });
  }
};
