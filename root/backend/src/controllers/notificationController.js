const { firestore } = require("../config/firebase");

// 🚀 Notification bhejney ka record save karne ke liye
exports.sendNotification = async (req, res) => {
  try {
    const { title, message } = req.body;

    // Students count fetch karna (Record keeping ke liye)
    const snap = await firestore.collection("students").get();
    const emailsCount = snap.docs.length;

    // Notification history mein save karo
    const newDoc = await firestore.collection("notifications").add({
      title,
      message,
      createdAt: new Date().toISOString(),
      recipientsCount: emailsCount
    });

    res.status(200).json({ 
      success: true, 
      message: "Notification record saved successfully",
      id: newDoc.id 
    });

  } catch (err) {
    console.error("❌ BACKEND ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// History fetch karne ke liye
exports.getAllNotifications = async (req, res) => {
  try {
    const snap = await firestore.collection("notifications").orderBy("createdAt", "desc").get();
    res.json(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  } catch (e) {
    res.json([]);
  }
};