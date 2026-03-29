// =====================================================
// Create scan_events structure for Bus_143 and Bus_148
// =====================================================

const admin = require("firebase-admin");
const serviceAccount = require("../config/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://locations-f7114-default-rtdb.asia-southeast1.firebasedatabase.app",
});

const rtdb = admin.database();

// =====================================================
// CORRECT FORMAT: ONLY RFID (NO studentId, NO direction)
// =====================================================

const today = "2025-11-29";

// Mock RFID values (hex format just for demo)
const mockScans = {
  Bus_143: {
    [today]: {
      "08:01:23": { rfid: "63A422B9" },
      "08:01:40": { rfid: "D2F4A117" },
      "08:02:10": { rfid: "A7C1D930" }
    }
  },

  Bus_148: {
    [today]: {
      "07:31:10": { rfid: "63A422B9" },
      "07:32:12": { rfid: "98FF11CC" }
    }
  }
};

// =====================================================
// UPLOAD FUNCTION
// =====================================================
async function upload() {
  try {
    await rtdb.ref("scan_events").set(mockScans);
    console.log("✔ scan_events (correct RFID format) created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err);
    process.exit(1);
  }
}

upload();
