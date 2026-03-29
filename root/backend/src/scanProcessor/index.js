
// backend/src/scanProcessor/index.js

// const { rtdb, firestore } = require("../config/firebase");    THIS ALSO WORKS RIGHT BUT ONLY EXIT ISSUE
// const { updateOccupancy } = require("../services/occupancyEngine");

// const wait = (ms) => new Promise((res) => setTimeout(res, ms));

// /**
//  * Process a single RFID scan
//  * Uses active_rfid_sessions as the ONLY state source
//  */
// async function processScan({ rfid, timestamp, busId, direction }) {
//   const normalizedDirection =
//     direction === "enter" || direction === "Entry" ? "Entry" : "Exit";

//   const normalizedBus =
//     busId.toString().toLowerCase().startsWith("bus")
//       ? busId.toLowerCase()
//       : `bus${busId}`;

//   let error = null;

//   try {
//     // 🔐 ACTIVE SESSION CHECK (THE REAL SOURCE OF TRUTH)
//     const sessionRef = firestore.collection("active_rfid_sessions").doc(rfid);
//     const sessionSnap = await sessionRef.get();

//     // ❌ ENTRY while already inside another bus
//     if (normalizedDirection === "Entry") {
//       if (sessionSnap.exists) {
//         const activeBus = sessionSnap.data().busId;
//         if (activeBus !== normalizedBus) {
//           error = "ALREADY_INSIDE_OTHER_BUS";
//         }
//       }
//     }

//     // ❌ EXIT without ENTRY or wrong bus
//     if (normalizedDirection === "Exit") {
//       if (!sessionSnap.exists) {
//         error = "EXIT_WITHOUT_ENTRY";
//       } else if (sessionSnap.data().busId !== normalizedBus) {
//         error = "BUS_MISMATCH";
//       }
//     }

//     // 🧾 ALWAYS WRITE ENTRY/EXIT LOG (valid or invalid)
//     const dateOnly = new Date(timestamp).toISOString().split("T")[0];

//     await firestore.collection("entry_exit_logs").add({
//       rfid,
//       busId: normalizedBus,
//       busNumber: normalizedBus,
//       status: normalizedDirection,
//       timestamp,
//       date: dateOnly,
//       error: error || null,
//       createdAt: new Date(),
//     });

//     // ✅ APPLY STATE + OCCUPANCY ONLY IF VALID
//     if (!error) {
//       if (normalizedDirection === "Entry") {
//         await sessionRef.set({
//           rfid,
//           busId: normalizedBus,
//           enteredAt: timestamp,
//         });
//       }

//       if (normalizedDirection === "Exit") {
//         await sessionRef.delete();
//       }

//       await updateOccupancy({
//         busId: normalizedBus,
//         direction: normalizedDirection,
//         timestamp,
//         rfid,
//       });
//     }

//     console.log(
//       error
//         ? `❌ RFID ${rfid} ${normalizedDirection} ERROR: ${error}`
//         : `✔ ${normalizedBus} | RFID ${rfid} → ${normalizedDirection}`
//     );
//   } catch (err) {
//     console.error("❌ processScan error:", err.message);
//   }
// }

// /**
//  * Poll RTDB for new scans
//  * RTDB = raw source (never trusted for logic)
//  */
// async function pollNewScans() {
//   try {
//     const snapshot = await rtdb.ref("scan_events").get();
//     if (!snapshot.exists()) return;

//     const buses = snapshot.val();

//     for (const busId in buses) {
//       for (const date in buses[busId]) {
//         for (const time in buses[busId][date]) {
//           const scan = buses[busId][date][time];

//           if (scan.processed) continue;
//           if (!scan.rfid || !scan.createdAt || !scan.direction) continue;

//           await processScan({
//             rfid: scan.rfid,
//             timestamp: scan.createdAt,
//             busId,
//             direction: scan.direction,
//           });

//           // ✅ mark RTDB scan as processed
//           await rtdb
//             .ref(`scan_events/${busId}/${date}/${time}/processed`)
//             .set(true);
//         }
//       }
//     }
//   } catch (err) {
//     console.error("❌ Scan polling error:", err.message);
//   }
// }

// /**
//  * Start scanner loop
//  */
// async function startScanner() {
//   console.log("🚀 Entry/Exit Engine Started (every 5s)");
//   while (true) {
//     await pollNewScans();
//     await wait(5000);
//   }
// }

// module.exports = { startScanner };


// backend/src/scanProcessor/index.js
const { rtdb, firestore } = require("../config/firebase");
const { updateOccupancy } = require("../services/occupancyEngine");

const wait = (ms) => new Promise((res) => setTimeout(res, ms));

/**
 * Process a single RFID scan
 * Uses active_rfid_sessions as the ONLY state source
 */
async function processScan({ rfid, timestamp, busId, direction }) {
  const normalizedDirection =
    direction === "enter" || direction === "Entry" ? "Entry" : "Exit";

  const normalizedBus =
    busId.toString().toLowerCase().startsWith("bus")
      ? busId.toLowerCase()
      : `bus${busId}`;

  let error = null;

  try {
    // 🔐 ACTIVE SESSION CHECK (THE REAL SOURCE OF TRUTH)
    const sessionRef = firestore.collection("active_rfid_sessions").doc(rfid);
    const sessionSnap = await sessionRef.get();

    // ❌ ENTRY while already inside another bus
    if (normalizedDirection === "Entry") {
      if (sessionSnap.exists) {
        const activeBus = sessionSnap.data().busId;
        if (activeBus !== normalizedBus) {
          error = "ALREADY_INSIDE_OTHER_BUS";
        }
      }
    }

    // ❌ EXIT logic
    if (normalizedDirection === "Exit") {
      // ✅ IGNORE duplicate / late EXIT safely
      if (!sessionSnap.exists) {
        console.log(`⚠️ Duplicate EXIT ignored for RFID ${rfid}`);
        return;
      }

      // ❌ EXIT from wrong bus
      if (sessionSnap.data().busId !== normalizedBus) {
        error = "BUS_MISMATCH";
      }
    }

    // 🧾 ALWAYS WRITE ENTRY/EXIT LOG (valid or invalid)
    const dateOnly = new Date(timestamp).toISOString().split("T")[0];

    await firestore.collection("entry_exit_logs").add({
      rfid,
      busId: normalizedBus,
      busNumber: normalizedBus,
      status: normalizedDirection,
      timestamp,
      date: dateOnly,
      error: error || null,
      createdAt: new Date(),
    });

    // ✅ APPLY STATE + OCCUPANCY ONLY IF VALID
    if (!error) {
      if (normalizedDirection === "Entry") {
        await sessionRef.set({
          rfid,
          busId: normalizedBus,
          enteredAt: timestamp,
        });
      }

      if (normalizedDirection === "Exit") {
        await sessionRef.delete();
      }

      await updateOccupancy({
        busId: normalizedBus,
        direction: normalizedDirection,
        timestamp,
        rfid,
      });
    }

    console.log(
      error
        ? `❌ RFID ${rfid} ${normalizedDirection} ERROR: ${error}`
        : `✔ ${normalizedBus} | RFID ${rfid} → ${normalizedDirection}`
    );
  } catch (err) {
    console.error("❌ processScan error:", err.message);
  }
}

/**
 * Poll RTDB for new scans
 * RTDB = raw source (never trusted for logic)
 */
async function pollNewScans() {
  try {
    const snapshot = await rtdb.ref("scan_events").get();
    if (!snapshot.exists()) return;

    const buses = snapshot.val();

    for (const busId in buses) {
      for (const date in buses[busId]) {
        for (const time in buses[busId][date]) {
          const scan = buses[busId][date][time];

          if (scan.processed) continue;
          if (!scan.rfid || !scan.createdAt || !scan.direction) continue;

          await processScan({
            rfid: scan.rfid,
            timestamp: scan.createdAt,
            busId,
            direction: scan.direction,
          });

          // ✅ mark RTDB scan as processed
          await rtdb
            .ref(`scan_events/${busId}/${date}/${time}/processed`)
            .set(true);
        }
      }
    }
  } catch (err) {
    console.error("❌ Scan polling error:", err.message);
  }
}

/**
 * Start scanner loop
 */
async function startScanner() {
  console.log("🚀 Entry/Exit Engine Started (every 5s)");
  while (true) {
    await pollNewScans();
    await wait(5000);
  }
}

module.exports = { startScanner };
