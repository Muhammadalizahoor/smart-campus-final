const { firestore } = require("../config/firebase");
const transporter = require("../config/mailer");

exports.sendNotification = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title/Message missing" });
    }

    // 1️⃣ Save in Firestore (Admin panel ke liye)
    await firestore.collection("notifications").add({
      title,
      message,
      createdAt: new Date().toISOString(),
    });

    // 2️⃣ Get student emails (Safe Way)
    const snap = await firestore.collection("students").get();
    
    // Agar collection khali hai toh empty array ready rakho
    let emails = [];
    if (!snap.empty) {
      emails = snap.docs
        .map(doc => doc.data().gmail || doc.data().email) // gmail ya email dono check karega
        .filter(Boolean); // Khali values nikal dega
    }

    // 3️⃣ Send Gmail (Only if emails exist)
    if (emails.length > 0) {
      await transporter.sendMail({
        from: `"Smart Campus Transit" <${process.env.EMAIL_USER}>`,
        to: emails.join(","), // Saare students ko aik saath
        subject: title,
        html: `
          <div style="font-family: Arial; border: 1px solid #eee; padding: 20px;">
            <h2 style="color: #1e40af;">${title}</h2>
            <p>${message}</p>
            <hr/>
            <small>Smart Campus Transit System</small>
          </div>
        `,
      });
      return res.json({ message: `Success! Mail sent to ${emails.length} students.` });
    } else {
      // Agar Firebase mein koi student nahi mila toh error na do, message de do
      return res.status(200).json({ message: "Notification saved, but no student emails found in Firebase." });
    }

  } catch (err) {
    console.error("DETAILED ERROR:", err);
    res.status(500).json({ 
      message: "Server Error", 
      error: err.message,
      stack: err.stack // Taake humein pata chale kis line par masla hai
    });
  }
};

exports.getAllNotifications = async (req, res) => {
  try {
    const snap = await firestore.collection("notifications").orderBy("createdAt", "desc").get();
    res.json(snap.docs.map(d => d.data()));
  } catch (e) {
    res.json([]);
  }
};