// backend/src/controllers/authController.js
const { firestore } = require("../config/firebase");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

// -----------------------------
// LOGIN (ONLY EMAIL & PASSWORD)
// -----------------------------
exports.login = async (req, res) => {
  const { email, password } = req.body; 
  try {
    const userRef = firestore.collection("Users").doc(email);
    const userDoc = await userRef.get();

    if (!userDoc.exists) return res.status(401).json({ message: "Invalid credentials" });

    const user = userDoc.data();
    if (password !== user.password) return res.status(401).json({ message: "Invalid credentials" });

    let gmail = null;
    if (user.role === "student") {
      const studRef = firestore.collection("students").doc(email);
      const studDoc = await studRef.get();
      if (studDoc.exists) {
        gmail = studDoc.data().gmail || null;
      }
    }

    const token = jwt.sign({ email, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      message: "Login successful",
      token,
      user: { ...user, gmail }
    });
  } catch (error) {
    res.status(500).json({ message: "Internal error" });
  }
};

// -----------------------------
// SIGNUP / CREATE STUDENT
// -----------------------------
exports.createStudent = async (req, res) => {
  let { name, email, regNo, phone, password, confirmPassword, rfid_id } = req.body;

  if (email && !email.endsWith("@student.uet.edu.pk")) {
    email = email.replace("@uet.edu.pk", "@student.uet.edu.pk");
  }

  try {
    if (!name || !email || !regNo || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const userRef = firestore.collection("Users").doc(email);
    const userDoc = await userRef.get();

    if (userDoc.exists) return res.status(409).json({ message: "Student already exists" });

    const userData = { name, email, role: "student", regNo, phone: phone || "", password };
    const studentData = { name, email, regNo, phone: phone || "", rfid_id: rfid_id || null };

    await userRef.set(userData);
    await firestore.collection("students").doc(email).set(studentData);

    res.status(201).json({ message: "Student created successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -----------------------------
// GET ALL STUDENTS
// -----------------------------
exports.getAllStudents = async (req, res) => {
  try {
    const snap = await firestore.collection("students").get();
    const students = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ students });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students" });
  }
};

// -----------------------------
// ASSIGN RFID (FIXED FOR MUSA KHAN)
// -----------------------------
exports.assignRfid = async (req, res) => {
  const { email, rfid_id } = req.body;
  if (!email || !rfid_id) return res.status(400).json({ message: "Email and RFID are required" });

  try {
    // 1. Update Students Table
    const studRef = firestore.collection("students").doc(email);
    const studDoc = await studRef.get();
    if (!studDoc.exists) return res.status(404).json({ message: "Student not found" });

    await studRef.update({ rfid_id });

    // 2. Update Users Table (for consistency)
    const userRef = firestore.collection("Users").doc(email);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      await userRef.update({ rfid_id });
    }

    res.json({ message: "RFID updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update RFID", error: error.message });
  }
};