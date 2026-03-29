// backend/src/config/firebase.js
const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config(); // ✅ MUST be here

let serviceAccount;

// 🔎 ENV CHECK (SAFE)
console.log("🔥 ENV PROJECT:", process.env.FIREBASE_PROJECT_ID);

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    serviceAccount = require(
      path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    );
  } else {
    serviceAccount = require(
      path.resolve(__dirname, "serviceAccountKey.json")
    );
  }
} catch (err) {
  console.error("❌ Service account load failed:", err);
  process.exit(1);
}

// ✅ INIT ONLY ONCE
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      "https://locations-f7114-default-rtdb.asia-southeast1.firebasedatabase.app",
  });
}

// 🔎 SAFE LOG AFTER INIT
console.log("🔥 ADMIN PROJECT:", admin.app().options.projectId);

const firestore = admin.firestore();
const rtdb = admin.database();

module.exports = { admin, firestore, rtdb };
