const nodemailer = require("nodemailer");

// 1. Pehle check karo ke environment variables mil rahe hain ya nahi
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ ERROR: EMAIL_USER or EMAIL_PASS is missing in Render Environment Variables!");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,            // Render ke liye 465 best hai
  secure: true,         // Port 465 ke liye true hona lazmi hai
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // Ye line Render/Cloud environments par connection timeouts fix karti hai
    rejectUnauthorized: false 
  }
});

// 2. Connection verify karne ke liye console log (Render logs mein nazar aayega)
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Mailer Verification Error:", error);
  } else {
    console.log("✅ Mailer is ready to send notifications!");
  }
});

module.exports = transporter;
