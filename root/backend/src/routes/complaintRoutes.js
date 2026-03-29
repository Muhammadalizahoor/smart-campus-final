// backend/src/routes/complaintRoutes.js

const express = require("express");
const router = express.Router();

const {
  createComplaint,
  getAllComplaints,
  getStudentComplaints,
  getComplaintById,   // ✅ REQUIRED
  updateStatus,
  deleteComplaint,
  addReply,
} = require("../controllers/complaintController");

// =========================
// STUDENT ROUTES
// =========================

// student creates complaint
router.post("/create", createComplaint);

// student: get own complaints by email
router.get("/student/:email", getStudentComplaints);

// =========================
// ADMIN ROUTES
// =========================

// admin: get ALL complaints
router.get("/", getAllComplaints);

// admin: get SINGLE complaint by ID  ✅ THIS FIXES THE BLACK SCREEN
router.get("/:id", getComplaintById);

// admin: update complaint status
router.put("/:id/status", updateStatus);

// admin: add reply (text + optional attachment url)
router.post("/:id/reply", addReply);

// admin: delete complaint
router.delete("/:id", deleteComplaint);

module.exports = router;
