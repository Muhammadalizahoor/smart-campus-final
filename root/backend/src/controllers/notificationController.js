const { firestore } = require("../config/firebase");
const transporter = require("../config/mailer");

exports.sendNotification = async (req, res) => {
  try {
    const { title, message } = req.body;

    // 1. Firebase se saare students ke emails uthao
    const snap = await firestore.collection("students").get();
    
    if (snap.empty) {
      console.log("❌ No students found in Firestore");
      return res.status(404).json({ message: "No students found in Database" });
    }

    const emails = snap.docs
      .map(doc => doc.data().gmail || doc.data().email)
      .filter(Boolean); // Khali fields nikal dega

    if (emails.length === 0) {
      return res.status(400).json({ message: "No valid emails found in students collection" });
    }

    console.log(`Attempting to send mail to ${emails.length} students...`);

    // 2. Email Options (Bcc use kar rahe hain taake sab ko aik saath jaye)
    const mailOptions = {
      from: `"Smart Campus Transit" <${process.env.EMAIL_USER}>`,
      bcc: emails, 
      subject: title,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #2563eb;">${title}</h2>
          <p>${message}</p>
          <hr/>
          <small>Smart Campus Transit System - Admin Update</small>
        </div>
      `
    };

    // 3. Email Send Karo
    await transporter.sendMail(mailOptions);

    // 4. Record ke liye notification Firestore mein bhi save kar lo
    await firestore.collection("notifications").add({
      title,
      message,
      createdAt: new Date().toISOString(),
      recipientsCount: emails.length
    });

    res.status(200).json({ success: true, message: `Notification sent to ${emails.length} students!` });

  } catch (err) {
    console.error("❌ NOTIFICATION ERROR:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send notification", 
      error: err.message 
    });
  }
};

// History dikhane ke liye
exports.getAllNotifications = async (req, res) => {
  try {
    const snap = await firestore.collection("notifications").orderBy("createdAt", "desc").get();
    res.json(snap.docs.map(d => d.data()));
  } catch (e) {
    res.json([]);
  }
};