const transporter = require("../config/mailer");

exports.sendNotification = async (req, res) => {
  try {
    const { title, message } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and Message are required" });
    }

    console.log("Sending Direct Email...");

    // Firebase ko bypass kar ke direct is email par bhej rahe hain
    await transporter.sendMail({
      from: `"Smart Campus Transit" <${process.env.EMAIL_USER}>`,
      to: "maafkro37@gmail.com", // 👈 YAHAN WO EMAIL DALO JIS PAR DEMO DIKHANA HAI
      subject: title,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #2563eb;">${title}</h2>
          <p>${message}</p>
          <hr/>
          <small>Sent via Smart Campus Transit System</small>
        </div>
      `,
    });

    res.json({ message: "Notification Delivered Successfully!" });

  } catch (err) {
    console.error("DEBUG ERROR:", err);
    res.status(500).json({ 
        message: "Email failed", 
        error: err.message 
    });
  }
};

// Frontend list ke liye khali array bhej do taake page crash na ho
exports.getAllNotifications = async (req, res) => {
  res.json([]);
};