// backend/src/routes/studentRoutes.js
const express = require("express");
const {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getAvailableRFIDs,
  assignRFID, // Ye studentController wala hai
  getEntryExitLogs,
  updateGmail,
} = require("../controllers/studentController");

const authController = require("../controllers/authController"); // ✅ Link with authController

const router = express.Router();

/* ------------------------------------------
   1) SPECIFIC ROUTES (Sabse Pehle)
------------------------------------------ */
router.put("/update-gmail", updateGmail);

// 🔥 FIX FOR RFID: Frontend hits /api/students/assign-rfid
// Humne authController wala assignRfid yahan map kar diya hai
router.post("/assign-rfid", authController.assignRfid);
router.put("/assign-rfid", authController.assignRfid);

/* ------------------------------------------
   2) STUDENT CRUD
------------------------------------------ */
router.get("/", getAllStudents);
router.post("/", createStudent);

// ❗ GENERIC ROUTES (Email wale raste hamesha niche)
router.put("/:email", updateStudent);
router.delete("/:email", deleteStudent);

/* ------------------------------------------
   3) RFID & LOGS
------------------------------------------ */
router.get("/available-rfids", getAvailableRFIDs);
router.get("/logs", getEntryExitLogs);

// Purana rasta (safety ke liye rehne dein)
router.post("/:email/rfid", assignRFID);

module.exports = router;