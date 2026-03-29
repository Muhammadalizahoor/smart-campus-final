const { rtdb, firestore } = require("../config/firebase");
const { updateOccupancy } = require("../services/occupancyEngine");

/**
 * 🔁 Rebuild occupancy from ALL historical scan_events
 * Can run for one bus or all buses
 * RUN THIS ONLY WHEN NEEDED (manual trigger)
 */
exports.rebuildOccupancy = async (req, res) => {
  try {
    const { busId } = req.query; // optional

    const rootRef = rtdb.ref("scan_events");
    const snapshot = await rootRef.get();

    if (!snapshot.exists()) {
      return res.status(404).json({ message: "No scan_events found" });
    }

    const allBuses = snapshot.val();

    const busesToProcess = busId
      ? { [busId]: allBuses[busId] }
      : allBuses;

    for (const bus in busesToProcess) {
      const dates = busesToProcess[bus];
      if (!dates) continue;

      console.log(`🔁 Rebuilding occupancy for ${bus}`);

      for (const date in dates) {
        const scans = dates[date];
        if (!scans) continue;

        // 🔥 RESET THIS DAY (CRITICAL FIX)
        await firestore
          .collection("occupancy_logs")
          .doc(bus)
          .collection(date)
          .doc("latest")
          .delete()
          .catch(() => {});

        // Sort scans by time (chronological)
        const orderedTimes = Object.keys(scans).sort();

        for (const time of orderedTimes) {
          const scan = scans[time];

          if (!scan.rfid || !scan.createdAt || !scan.direction) continue;

          const direction =
            scan.direction === "enter" || scan.direction === "Entry"
              ? "Entry"
              : "Exit";

          await updateOccupancy({
            busId: bus,
            direction,
            timestamp: scan.createdAt,
            rfid: scan.rfid, // ✅ REQUIRED
          });
        }
      }
    }

    return res.json({
      success: true,
      message: "Occupancy rebuilt successfully",
    });
  } catch (err) {
    console.error("❌ Rebuild error:", err);
    return res.status(500).json({ message: err.message });
  }
};
