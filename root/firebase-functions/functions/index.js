const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const firestore = admin.firestore();

// -------------------------------
// CLEAN DATE FORMATTER
// -------------------------------
function extractDate(ts) {
  // input: "2025-12-02 19:55:20"
  return ts.split(" ")[0]; // "2025-12-02"
}

// -------------------------------
// ENTRY / EXIT ENGINE
// -------------------------------
async function processScan(rfid, timestamp, busNumber) {
  const today = extractDate(timestamp);   // FIXED

  const logsRef = firestore.collection("entry_exit_logs");

  // Get all scans today for this RFID
  const existing = await logsRef
    .where("rfid", "==", rfid)
    .where("date", "==", today)
    .get();

  const count = existing.size;

  // EVEN = ENTRY, ODD = EXIT
  const status = count % 2 === 0 ? "Entry" : "Exit";

  await logsRef.add({
    rfid,
    timestamp,
    busNumber,
    status,
    date: today,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`RFID ${rfid} => ${status}`);

  return status;
}

// -------------------------------------------
// TRIGGER: RUN WHEN NEW SCAN ADDED TO RTDB
// -------------------------------------------
exports.onNewScan = functions.database
  .ref("/scan_events/{bus}/{date}/{time}")
  .onCreate(async (snapshot, context) => {

    const data = snapshot.val();

    const rfid = data.rfid;
    const timestamp = data.createdAt;        // "2025-12-02 19:55:20"
    const busParam = context.params.bus;     // e.g. "Bus_143"

    // Extract only number from "Bus_143"
    const busNumber = busParam.replace("Bus_", "");

    await processScan(rfid, timestamp, busNumber);
  });
