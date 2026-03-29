// //backend//src//controllers//complaintController.js
const { firestore } = require("../config/firebase");
const { Timestamp } = require("firebase-admin/firestore");

/* ======================================================
   STUDENT: CREATE COMPLAINT
====================================================== */
exports.createComplaint = async (req, res) => {
  try {
    const { email, name, regNo, category, description } = req.body;

    if (!email || !name || !regNo || !category || !description) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // 🔐 SOURCE OF TRUTH: students collection
    let rfid_id = null;
    const studentSnap = await firestore
      .collection("students")
      .doc(email)
      .get();

    if (studentSnap.exists) {
      rfid_id = studentSnap.data().rfid_id || null;
    }

    const complaint = {
      email,
      name,
      regNo,
      rfid_id, // ✅ correct RFID
      category,
      description,

      status: "Pending",

      // ✅ FORCE Firestore Timestamp (NOT string)
      submittedOn: Timestamp.now(),
      statusUpdatedAt: Timestamp.now(),
      resolvedAt: null,

      adminReply: null,
      adminReplyAt: null,
      adminAttachmentUrl: null,
    };

    const docRef = await firestore
      .collection("complaints")
      .add(complaint);

    res.status(201).json({
      message: "Complaint submitted successfully",
      id: docRef.id,
    });
  } catch (err) {
    console.error("createComplaint error:", err);
    res.status(500).json({
      message: "Failed to submit complaint",
      error: err.message,
    });
  }
};

/* ======================================================
   STUDENT: GET OWN COMPLAINTS
====================================================== */
exports.getStudentComplaints = async (req, res) => {
  const { email } = req.params;

  try {
    const snap = await firestore
      .collection("complaints")
      .where("email", "==", email)
      .orderBy("submittedOn", "desc")
      .get();

    const list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(list);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch student complaints",
      error: err.message,
    });
  }
};

/* ======================================================
   ADMIN: GET ALL COMPLAINTS
====================================================== */
exports.getAllComplaints = async (req, res) => {
  try {
    const snap = await firestore
      .collection("complaints")
      .orderBy("submittedOn", "desc")
      .get();

    const list = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(list);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch complaints",
      error: err.message,
    });
  }
};

/* ======================================================
   ADMIN: UPDATE STATUS
====================================================== */
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  try {
    const updates = {
      status,
      statusUpdatedAt: Timestamp.now(),
    };

    if (status === "Resolved") {
      updates.resolvedAt = Timestamp.now();
    }

    await firestore.collection("complaints").doc(id).update(updates);

    res.json({ message: "Status updated", status });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update status",
      error: err.message,
    });
  }
};

/* ======================================================
   ADMIN: DELETE COMPLAINT
====================================================== */
exports.deleteComplaint = async (req, res) => {
  const { id } = req.params;

  try {
    await firestore.collection("complaints").doc(id).delete();
    res.json({ message: "Complaint deleted" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete complaint",
      error: err.message,
    });
  }
};

/* ======================================================
   ADMIN: ADD REPLY
====================================================== */
exports.addReply = async (req, res) => {
  const { id } = req.params;
  const { replyText, attachmentUrl } = req.body;

  if (!replyText && !attachmentUrl) {
    return res
      .status(400)
      .json({ message: "Reply text or attachment is required" });
  }

  try {
    await firestore.collection("complaints").doc(id).update({
      adminReply: replyText || null,
      adminReplyAt: Timestamp.now(),
      adminAttachmentUrl: attachmentUrl || null,
    });

    res.json({ message: "Reply saved" });
  } catch (err) {
    res.status(500).json({
      message: "Failed to save reply",
      error: err.message,
    });
  }
};


/* ======================================================
   ADMIN: GET SINGLE COMPLAINT BY ID
====================================================== */
exports.getComplaintById = async (req, res) => {
  const { id } = req.params;

  try {
    const doc = await firestore
      .collection("complaints")
      .doc(id)
      .get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (err) {
    console.error("getComplaintById error:", err);
    res.status(500).json({
      message: "Failed to load complaint",
      error: err.message,
    });
  }
};