const admin = require("firebase-admin");
require("dotenv").config();

let serviceAccount;

try {
  // Pehle check karo kya Render ke Environment Variable mein JSON para hai?
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    console.log("✅ Using Firebase Service Account from Environment Variable");
  } else {
    // Agar nahi, toh purana tareeka (file wala) use karo
    serviceAccount = require("./serviceAccountKey.json");
    console.log("✅ Using Firebase Service Account from JSON file");
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: "https://locations-f7114-default-rtdb.asia-southeast1.firebasedatabase.app",
    });
  }
} catch (err) {
  console.error("❌ Firebase Initialization Failed:", err.message);
  // Hum exit nahi karein ge taake humein logs mein asli wajah nazar aaye
}

const firestore = admin.firestore ? admin.firestore() : null;
const rtdb = admin.database ? admin.database() : null;

module.exports = { admin, firestore, rtdb };
