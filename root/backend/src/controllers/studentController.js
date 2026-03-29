const { firestore } = require("../config/firebase");

const usersCol = firestore.collection("Users");
const studentsCol = firestore.collection("students");
const rfidsCol = firestore.collection("available_rfids");
const logsCol = firestore.collection("entry_exit_logs");
const driversCol = firestore.collection("drivers");

// --- 1) GET ALL STUDENTS ---
exports.getAllStudents = async (req, res) => {
  try {
    const snap = await studentsCol.get();
    const students = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return res.status(200).json({ students });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch", error: err.message });
  }
};

// --- 2) CREATE STUDENT ---
exports.createStudent = async (req, res) => {
  try {
    const { name, email, regNo, phone, password, rfid_id } = req.body;
    if (!name || !email || !regNo || !password) return res.status(400).json({ message: "Missing fields" });

    const userDoc = await usersCol.doc(email).get();
    if (userDoc.exists) return res.status(409).json({ message: "Student already exists" });

    await usersCol.doc(email).set({ name, email, regNo, phone: phone || "", role: "student", password });
    await studentsCol.doc(email).set({ name, email, regNo, phone: phone || "", rfid_id: rfid_id || null });

    if (rfid_id) {
      const rSnap = await rfidsCol.where("value", "==", rfid_id).get();
      if (!rSnap.empty) await rSnap.docs[0].ref.update({ assigned: true, assignedTo: email });
    }
    return res.status(201).json({ message: "Student created" });
  } catch (err) { return res.status(500).json({ message: "Error", error: err.message }); }
};

// --- 3) UPDATE STUDENT ---
exports.updateStudent = async (req, res) => {
  try {
    const { email } = req.params;
    const { name, regNo, phone, password } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (regNo !== undefined) updates.regNo = regNo;
    if (phone !== undefined) updates.phone = phone;
    if (password) updates.password = password;

    await usersCol.doc(email).update(updates);
    const studUpdates = { ...updates }; delete studUpdates.password;
    await studentsCol.doc(email).update(studUpdates);
    return res.json({ message: "Student updated" });
  } catch (err) { return res.status(500).json({ message: "Error" }); }
};

// --- 4) DELETE STUDENT ---
exports.deleteStudent = async (req, res) => {
  try {
    const { email } = req.params;
    const studSnap = await studentsCol.doc(email).get();
    if (!studSnap.exists) return res.status(404).json({ message: "Not found" });
    const rfid = studSnap.data().rfid_id;
    await studentsCol.doc(email).delete();
    await usersCol.doc(email).delete();
    if (rfid) {
      const rSnap = await rfidsCol.where("value", "==", rfid).get();
      if (!rSnap.empty) await rSnap.docs[0].ref.update({ assigned: false, assignedTo: null });
    }
    return res.json({ message: "Deleted" });
  } catch (err) { return res.status(500).json({ message: "Error" }); }
};

// --- 5) GET AVAILABLE RFIDS ---
exports.getAvailableRFIDs = async (req, res) => {
  try {
    const used = new Set();
    const sSnap = await studentsCol.get();
    sSnap.docs.forEach(d => { if(d.data().rfid_id) used.add(d.data().rfid_id); });
    const dSnap = await driversCol.get();
    dSnap.docs.forEach(d => { if(d.data().rfid_id) used.add(d.data().rfid_id); });

    const ALL_RFIDS = ["C333890C", "439E94F7", "1D502E40", "A8302B40", "FBC82F40", "7FD72E40", "CA792A40"];
    const available = ALL_RFIDS
      .filter(r => !used.has(r))
      .map(r => ({ id: r, value: r }));

    res.json({ rfids: available });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// --- 6) ASSIGN RFID ---
exports.assignRFID = async (req, res) => {
  try {
    const { email } = req.params; const { rfid } = req.body;
    const studRef = studentsCol.doc(email);
    const studSnap = await studRef.get();
    if (!studSnap.exists) return res.status(404).json({ message: "Not found" });
    const oldRFID = studSnap.data().rfid_id || null;

    if (!rfid) {
      if (oldRFID) {
        const oldSnap = await rfidsCol.where("value", "==", oldRFID).get();
        if (!oldSnap.empty) await oldSnap.docs[0].ref.update({ assigned: false, assignedTo: null });
      }
      await studRef.update({ rfid_id: null });
      return res.json({ message: "Unassigned" });
    }

    await studRef.update({ rfid_id: rfid });
    const rSnap = await rfidsCol.where("value", "==", rfid).get();
    if (!rSnap.empty) await rSnap.docs[0].ref.update({ assigned: true, assignedTo: email });
    return res.json({ message: "Assigned" });
  } catch (err) { return res.status(500).json({ message: "Error" }); }
};

// --- 7) ENTRY / EXIT LOGS (FIXED: NAMES + ROLES + RFID INCLUDED) ---
exports.getEntryExitLogs = async (req, res) => {
  try {
    const [logsSnap, studentsSnap, driversSnap] = await Promise.all([
      logsCol.orderBy("timestamp", "desc").get(),
      studentsCol.get(),
      driversCol.get()
    ]);

    const rfidToPersonMap = {};

    // Map Students
    studentsSnap.docs.forEach(doc => {
      const s = doc.data();
      if (s.rfid_id) {
        rfidToPersonMap[s.rfid_id.trim()] = { 
          name: s.name, 
          id: s.regNo || "-",
          role: "Student"
        };
      }
    });

    // Map Drivers
    driversSnap.docs.forEach(doc => {
      const d = doc.data();
      if (d.rfid_id) {
        rfidToPersonMap[d.rfid_id.trim()] = { 
          name: d.driverName, 
          id: d.driverId || "DRIVER",
          role: "Driver"
        };
      }
    });

    const logs = logsSnap.docs.map(d => {
      const logData = d.data();
      const rawRfid = (logData.rfid || "").trim();
      const person = rfidToPersonMap[rawRfid] || { name: "-", id: "-", role: "Unknown" };
      
      return { 
        id: d.id, 
        ...logData, 
        rfid: rawRfid,            // ✅ RFID ID column ke liye
        studentName: person.name, 
        studentId: person.id,
        role: person.role         // ✅ Role (Student/Driver)
      };
    });

    return res.status(200).json({ logs });
  } catch (err) { 
    console.error("Log fetch error:", err);
    return res.status(500).json({ message: "Error fetching logs" }); 
  }
};

// --- 8) UPDATE GMAIL ---
exports.updateGmail = async (req, res) => {
  try {
    const { email, gmail } = req.body;
    await firestore.collection("students").doc(email).update({ gmail });
    res.json({ message: "Saved" });
  } catch (err) { res.status(500).json({ message: "Failed" }); }
};