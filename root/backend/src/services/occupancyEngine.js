// // backend/src/services/occupancyEngine.js
// const { firestore } = require("../config/firebase");  MY WORKING ENGINE JSUT FOR STUDENTS CODE CHANGE

// async function updateOccupancy({ busId, direction, timestamp, rfid }) {
//   const date = timestamp.split("T")[0];

//   // 1️⃣ BUS CHECK
//   const busRef = firestore.collection("buses").doc(busId);
//   const busSnap = await busRef.get();
//   if (!busSnap.exists) return;

//   const capacity = Number(busSnap.data().capacity || 0);
//   if (!capacity) return;

//   // 2️⃣ RFID GLOBAL LOCK
//   const sessionRef = firestore.collection("active_rfid_sessions").doc(rfid);
//   const sessionSnap = await sessionRef.get();

//   if (direction === "Entry") {
//     if (sessionSnap.exists && sessionSnap.data().busId !== busId) return;
//     await sessionRef.set({ rfid, busId, enteredAt: timestamp });
//   }

//   if (direction === "Exit") {
//     await sessionRef.delete().catch(() => {});
//   }

//   // 3️⃣ OCCUPANCY STATE
//   const latestRef = firestore
//     .collection("occupancy_logs")
//     .doc(busId)
//     .collection(date)
//     .doc("latest");

//   const prev = await latestRef.get();
//   let activeRFIDs = prev.exists ? prev.data().activeRFIDs || [] : [];

//   if (direction === "Entry" && !activeRFIDs.includes(rfid))
//     activeRFIDs.push(rfid);

//   if (direction === "Exit")
//     activeRFIDs = activeRFIDs.filter((x) => x !== rfid);

//   const currentPassengers = activeRFIDs.length;

//   // 4️⃣ SAVE LATEST SNAPSHOT (for dashboard counters)
//   await latestRef.set({
//     busId,
//     date,
//     timestamp,
//     capacity,
//     activeRFIDs,
//     currentPassengers,
//     overcrowded: currentPassengers > capacity,
//     percentOvercrowded:
//       currentPassengers > capacity
//         ? Math.round(((currentPassengers - capacity) / capacity) * 100)
//         : 0,
//     status:
//       currentPassengers > capacity
//         ? "High"
//         : currentPassengers > capacity * 0.95
//         ? "Moderate"
//         : "Normal",
//   });

//   // 🔥🔥🔥 5️⃣ SAVE EVENT (THIS WAS MISSING)
//   await firestore.collection("occupancy_events").add({
//     busId,
//     date,
//     timestamp,
//     capacity,
//     currentPassengers,
//     percentOvercrowded:
//       currentPassengers > capacity
//         ? Math.round(((currentPassengers - capacity) / capacity) * 100)
//         : 0,
//     status:
//       currentPassengers > capacity
//         ? "High"
//         : currentPassengers > capacity * 0.95
//         ? "Moderate"
//         : "Normal",
//   });
// }

// module.exports = { updateOccupancy };
const { firestore } = require("../config/firebase");

// 🔵 FEATURE FLAG
// false = allow fake RFIDs (testing / Postman / old data safe)
// true  = only allow RFIDs assigned to students (production)
const ENFORCE_STUDENT_RFID = false;

async function updateOccupancy({ busId, direction, timestamp, rfid }) {
  const date = timestamp.split("T")[0];

  // 1️⃣ BUS CHECK
  const busRef = firestore.collection("buses").doc(busId);
  const busSnap = await busRef.get();
  if (!busSnap.exists) return;

  const capacity = Number(busSnap.data().capacity || 0);
  if (!capacity) return;

  // 2️⃣ OPTIONAL: STUDENT ↔ RFID VALIDATION (SAFE)
  if (ENFORCE_STUDENT_RFID) {
    const studentSnap = await firestore
      .collection("students")
      .where("rfid_id", "==", rfid)
      .limit(1)
      .get();

    // ❌ RFID not assigned to any student → reject NEW scan only
    if (studentSnap.empty) return;
  }

  // 3️⃣ RFID GLOBAL LOCK (PREVENT MULTI-BUS ENTRY)
  const sessionRef = firestore.collection("active_rfid_sessions").doc(rfid);
  const sessionSnap = await sessionRef.get();

  if (direction === "Entry") {
    // ❌ RFID already inside another bus
    if (sessionSnap.exists && sessionSnap.data().busId !== busId) return;

    await sessionRef.set({
      rfid,
      busId,
      enteredAt: timestamp,
    });
  }

  if (direction === "Exit") {
    await sessionRef.delete().catch(() => {});
  }

  // 4️⃣ OCCUPANCY STATE PER BUS
  const latestRef = firestore
    .collection("occupancy_logs")
    .doc(busId)
    .collection(date)
    .doc("latest");

  const prev = await latestRef.get();
  let activeRFIDs = prev.exists ? prev.data().activeRFIDs || [] : [];

  if (direction === "Entry" && !activeRFIDs.includes(rfid)) {
    activeRFIDs.push(rfid);
  }

  if (direction === "Exit") {
    activeRFIDs = activeRFIDs.filter((x) => x !== rfid);
  }

  const currentPassengers = activeRFIDs.length;

  // 5️⃣ SAVE LATEST SNAPSHOT (DASHBOARD)
  await latestRef.set({
    busId,
    date,
    timestamp,
    capacity,
    activeRFIDs,
    currentPassengers,
    overcrowded: currentPassengers > capacity,
    percentOvercrowded:
      currentPassengers > capacity
        ? Math.round(((currentPassengers - capacity) / capacity) * 100)
        : 0,
    status:
      currentPassengers > capacity
        ? "High"
        : currentPassengers > capacity * 0.95
        ? "Moderate"
        : "Normal",
  });

  // 6️⃣ SAVE EVENT (ANALYTICS / CHARTS)
  await firestore.collection("occupancy_events").add({
    busId,
    date,
    timestamp,
    capacity,
    currentPassengers,
    percentOvercrowded:
      currentPassengers > capacity
        ? Math.round(((currentPassengers - capacity) / capacity) * 100)
        : 0,
    status:
      currentPassengers > capacity
        ? "High"
        : currentPassengers > capacity * 0.95
        ? "Moderate"
        : "Normal",
  });
}

module.exports = { updateOccupancy };
