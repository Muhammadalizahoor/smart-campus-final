
// // // // // backend/src/controllers/overcrowdingController.js


const { firestore, rtdb } = require("../config/firebase");

/* ============================
   HELPERS
============================ */
function computeStatus(percentOvercrowded) {
  if (percentOvercrowded > 20) return "High";
  if (percentOvercrowded > 5) return "Moderate";
  return "Normal";
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function monthStr() {
  return new Date().toISOString().slice(0, 7);
}

// 🔧 SAFETY FIX — handles bus143 → bus_143
async function getBusCapacity(busId) {
  if (!busId) throw new Error("busId missing");

  const normalized = busId.replace("-", "_");

  const tryIds = [
    normalized,
    normalized.replace("_", ""),
    busId,
  ];

  for (const id of tryIds) {
    const snap = await firestore.collection("buses").doc(id).get();
    if (snap.exists) {
      const capacity = Number(snap.data().capacity);
      if (!capacity || capacity <= 0) {
        throw new Error(`Invalid capacity for ${id}`);
      }
      return capacity;
    }
  }

  throw new Error(`Bus not found: ${busId}`);
}

/* ============================
   1) FINALIZE TRIP
============================ */
exports.finalizeTrip = async (req, res) => {
  try {
    const { busId, date } = req.body;
    if (!busId) {
      return res.status(400).json({ message: "busId is required" });
    }

    const tripDate = date || todayStr();
    const capacity = await getBusCapacity(busId);

    const snap = await rtdb.ref(`scan_events/${busId}/${tripDate}`).get();
    if (!snap.exists()) {
      return res.status(404).json({ message: "No scan data for trip" });
    }

    const scans = snap.val();
    const unique = new Set();

    Object.values(scans).forEach((s) => {
      if (s?.rfid) unique.add(s.rfid);
    });

    const actual = unique.size;
    const percent =
      actual > capacity
        ? Math.round(((actual - capacity) / capacity) * 100)
        : 0;

    const status = computeStatus(percent);

    await firestore
      .collection("overcrowding_summary")
      .doc(`${busId}_${tripDate}`)
      .set({
        busId,
        tripDate,
        capacity,
        actual,
        percentOvercrowded: percent,
        status,
        finalizedAt: new Date().toISOString(),
      });

    res.json({
      busId,
      tripDate,
      capacity,
      actual,
      percentOvercrowded: percent,
      status,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================
   2) OVERCROWDING TABLE
============================ */



exports.getOvercrowdingTable = async (req, res) => {
  try {
    const snap = await rtdb.ref("scan_events").get();
    if (!snap.exists()) return res.json([]);

    const rows = [];

    // 🔹 Load all bus capacities ONCE
    const busesSnap = await firestore.collection("buses").get();
    const capacityMap = {};

    busesSnap.forEach(doc => {
      capacityMap[doc.id] = Number(doc.data().capacity || 0);
    });

    Object.entries(snap.val()).forEach(([busId, dates]) => {
      const capacity = capacityMap[busId] || 0;

      Object.entries(dates).forEach(([date, scans]) => {
        let current = 0;

        // 🔒 sort by time
        const times = Object.keys(scans).sort();

        times.forEach((t) => {
          const s = scans[t];
          if (!s?.direction) return;

          if (s.direction === "enter") current++;
          if (s.direction === "exit") current = Math.max(0, current - 1);

          const percentOvercrowded =
            capacity > 0 && current > capacity
              ? Math.round(((current - capacity) / capacity) * 100)
              : 0;

          rows.push({
            busId,
            date,
            timestamp: t, // ✅ FIXED
            currentPassengers: current,
            capacity,
            percentOvercrowded,
            status: computeStatus(percentOvercrowded),
            direction: s.direction,
            rfid: s.rfid || null,
          });
        });
      });
    });

    res.json(rows.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getOvercrowdingChart = async (req, res) => {
  try {
    const { type = "daily", month, date, busId } = req.query;

    if (!busId) {
      return res.status(400).json({ message: "busId required" });
    }

    // 🚫 NO NORMALIZATION — trust input
    const capacity = await getBusCapacity(busId);

    /* ================= DAILY (RTDB) ================= */
    if (type === "daily") {
      // 🇵🇰 Pakistan date (VERY IMPORTANT)
      const todayPK = new Date().toLocaleDateString("en-CA", {
        timeZone: "Asia/Karachi",
      });

      let day = date || todayPK;

      // 🔹 Try today
      let snap = await rtdb.ref(`scan_events/${busId}/${day}`).get();

      // 🔥 Fallback → latest available date
      if (!snap.exists()) {
        const busSnap = await rtdb.ref(`scan_events/${busId}`).get();
        if (!busSnap.exists()) return res.json([]);

        const dates = Object.keys(busSnap.val()).sort();
        day = dates[dates.length - 1];
        snap = await rtdb.ref(`scan_events/${busId}/${day}`).get();
      }

      if (!snap.exists()) return res.json([]);

      const scans = snap.val();
      const times = Object.keys(scans).sort();

      let current = 0;
      const timeline = [];

      for (const t of times) {
        const s = scans[t];
        if (!s?.direction) continue;

        if (s.direction === "enter") current++;
        if (s.direction === "exit") current = Math.max(0, current - 1);

        const percentOvercrowded =
          current > capacity
            ? Math.round(((current - capacity) / capacity) * 100)
            : 0;

        timeline.push({
          busId,
          date: day,
          timestamp: `${day}T${t}`,
          capacity,
          currentPassengers: current,
          percentOvercrowded,
          status: computeStatus(percentOvercrowded),
        });
      }

      return res.json(timeline);
    }

    /* ================= MONTHLY (FIRESTORE) ================= */
    const targetMonth =
      month ||
      new Date().toISOString().slice(0, 7); // YYYY-MM

    const snap = await firestore
      .collection("occupancy_events")
      .where("busId", "==", busId)
      .get();

    if (snap.empty) return res.json([]);

    const peakByDate = {};

    snap.docs.forEach(doc => {
      const d = doc.data();
      if (!d.date || !d.date.startsWith(targetMonth)) return;

      if (
        !peakByDate[d.date] ||
        Number(d.currentPassengers) >
          Number(peakByDate[d.date].currentPassengers)
      ) {
        peakByDate[d.date] = d;
      }
    });

    const result = Object.values(peakByDate)
      .map(d => ({
        ...d,
        currentPassengers: Number(d.currentPassengers || 0),
        weekday: new Date(d.date).toLocaleDateString("en-US", {
          weekday: "short",
        }),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return res.json(result);
  } catch (err) {
    console.error("❌ Overcrowding chart error:", err);
    res.status(500).json({ message: err.message });
  }
};








exports.getDailyStats = async (req, res) => {
  try {
    const { busId, date } = req.query;
    if (!busId) return res.status(400).json({ message: "busId required" });

    const day = date || todayStr();
    const snap = await rtdb.ref(`scan_events/${busId}/${day}`).get();

    if (!snap.exists()) {
      return res.json({
        busId,
        date: day,
        capacity: await getBusCapacity(busId),
        currentPassengers: 0,
      });
    }

    let current = 0;
    Object.values(snap.val()).forEach(s => {
      if (s.direction === "enter") current++;
      if (s.direction === "exit") current = Math.max(0, current - 1);
    });

    res.json({
      busId,
      date: day,
      capacity: await getBusCapacity(busId),
      currentPassengers: current,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================
   5) MONTHLY STATS
============================ */
exports.getMonthlyStats = async (req, res) => {
  try {
    const { busId } = req.query;
    if (!busId) {
      return res.status(400).json({ message: "busId required" });
    }

    const capacity = await getBusCapacity(busId);
    const month = req.query.month || monthStr();

    const cols = await firestore
      .collection("occupancy_logs")
      .doc(busId)
      .listCollections();

    let total = 0;
    let days = 0;

    for (const col of cols) {
      if (!col.id.startsWith(month)) continue;

      const snap = await col.doc("latest").get();
      if (!snap.exists) continue;

      total += snap.data().currentPassengers || 0;
      days++;
    }

    res.json({
      busId,
      month,
      capacity,
      activeDays: days,
      avgPassengersPerDay: days ? Math.round(total / days) : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================
   6) REPORT
============================ */
exports.getOvercrowdingReport = async (req, res) => {
  try {
    const rawBusId = req.query.busId;
    if (!rawBusId) {
      return res.status(400).json({ message: "busId required" });
    }

    const busId = rawBusId
      .toLowerCase()
      .replace(/-/g, "_")
      .replace(/^bus(\d+)/, "bus_$1");

    const month = req.query.month || monthStr();
    const capacity = await getBusCapacity(busId);

    const snap = await firestore
      .collection("occupancy_events")
      .where("busId", "in", [busId, busId.replace("_", "")])
      .get();

    if (snap.empty) {
      return res.json({
        reportType: "MONTHLY_OVERCROWDING_REPORT",
        busId,
        analysisMonth: month,
        busCapacity: capacity,
        peakPassengers: 0,
        peakDay: null,
        overcrowdingStatus: "NO DATA",
        recommendation: "No data available for selected month.",
      });
    }

    let peak = 0;
    let peakDay = null;

    snap.docs.forEach(doc => {
      const d = doc.data();
      if (!d.date || !d.date.startsWith(month)) return;

      const passengers = Number(d.currentPassengers || 0);
      if (passengers > peak) {
        peak = passengers;
        peakDay = d.date;
      }
    });

    const overcrowded = peak > capacity;

    res.json({
      reportType: "MONTHLY_OVERCROWDING_REPORT",
      busId,
      analysisMonth: month,
      busCapacity: capacity,
      peakPassengers: peak,
      peakDay,
      overcrowdingStatus: overcrowded ? "OVERCROWDED" : "NOT OverCrowded",
      recommendation: overcrowded
        ? "Overcrowding detected on peak day. Increase bus frequency."
        : "Bus capacity was sufficient throughout the month. No overcrowding detected.",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



























