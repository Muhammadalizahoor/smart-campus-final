const express = require("express");
const {
  createStudent,
  login,
  getAllStudents,
  assignRfid,
} = require("../controllers/authController");

const router = express.Router();

// Signup/Login
router.post("/signup", createStudent);
router.post("/create-student", createStudent);
router.post("/login", login);

// ✅ RFID ASSIGNMENT (Multiple Routes for Safety)
// Ye charo lines likh do, koi na koi toh frontend hit kar hi lega
router.post("/assign-rfid", assignRfid); 
router.put("/assign-rfid", assignRfid);
router.post("/students/assign-rfid", assignRfid); 
router.put("/students/assign-rfid", assignRfid); 

// Table Data
router.get("/students", getAllStudents);

module.exports = router;