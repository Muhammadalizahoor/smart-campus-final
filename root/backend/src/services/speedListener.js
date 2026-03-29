const { rtdb, firestore } = require("../config/firebase");

const SPEED_LIMIT = 40; // km/h (campus default)

function startSpeedListener() {
  const ref = rtdb.ref("live_locations");

  ref.on("value", async (snapshot) => {
    const buses = snapshot.val();
    if (!buses) return;

    for (const busId in buses) {
      const data = buses[busId]?.current;
      if (!data) continue;

      const { lat, lng, speed, timestamp } = data;

      if (speed > SPEED_LIMIT) {
        const now = new Date();
        const day = now.toISOString().slice(0, 10);
        const month = now.toISOString().slice(0, 7);

        await firestore.collection("speed_events").add({
          busId,
          lat,
          lng,
          actualSpeed: speed,
          speedLimit: SPEED_LIMIT,
          isOverspeed: true,
          timestamp: now.toISOString(),
          day,
          month,
        });

        console.log(`🚨 Overspeed detected: ${busId} → ${speed} km/h`);
      }
    }
  });
}

module.exports = { startSpeedListener };
