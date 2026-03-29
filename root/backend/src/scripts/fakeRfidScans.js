/**
 * FAST & REALISTIC FAKE RFID SCANS (LAST 10 DAYS)
 * ----------------------------------------------
 * ✔ Last 10 days only
 * ✔ Creates OVERCROWDING peaks
 * ✔ One RFID → one bus at a time
 * ✔ Very fast execution
 */

const admin = require("firebase-admin");
const serviceAccount = require("../config/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://locations-f7114-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const rtdb = admin.database();

/* ================= CONFIG ================= */

const buses = [
  { busId: "bus727", capacity: 12 },
  { busId: "bus_143", capacity: 15 },
];

const rfids = [
  "A1B2C3D4",
  "B4C5D6E7",
  "C33389OC",
  "439E94F7",
  "D9E8F7A6",
  "F1E2D3C4",
  "AA12BB34",
  "CC56DD78",
  "EE90FF12",
  "1234ABCD",
  "FACEB00C",
  "DEADBEEF",
  "CAFEBABE",
];

/* ================= HELPERS ================= */

function lastNDays(n) {
  const days = [];
  const today = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function time(h, m) {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

/* ================= MAIN ================= */

async function run() {
  const dates = lastNDays(10); // 🔥 ONLY LAST 10 DAYS

  for (const date of dates) {
    const activeRFIDs = new Set(); // GLOBAL RFID LOCK

    for (const bus of buses) {
      // 🔥 force overcrowding on some days
      const targetPassengers =
        Math.random() > 0.5
          ? bus.capacity + 2 // OVERCROWD
          : Math.floor(bus.capacity * 0.8);

      for (let i = 0; i < targetPassengers; i++) {
        const rfid = rfids[i % rfids.length];
        if (activeRFIDs.has(rfid)) continue;

        const enterTime = time(8, i * 2);
        const exitTime = time(9, i * 2);

        // ENTRY
        await rtdb
          .ref(`scan_events/${bus.busId}/${date}/${enterTime}`)
          .set({
            rfid,
            direction: "enter",
            processed: true,
            createdAt: `${date}T${enterTime}Z`,
          });

        activeRFIDs.add(rfid);

        // EXIT
        await rtdb
          .ref(`scan_events/${bus.busId}/${date}/${exitTime}`)
          .set({
            rfid,
            direction: "exit",
            processed: true,
            createdAt: `${date}T${exitTime}Z`,
          });

        activeRFIDs.delete(rfid);
      }
    }
  }

  console.log("✅ LAST 10 DAYS REALISTIC SCANS GENERATED");
  process.exit(0);
}

run();
