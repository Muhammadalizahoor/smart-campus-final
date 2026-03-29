const nodemailer = require("nodemailer"); // ✅ YE LINE MISSING THI!

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,            // ✅ Render ke liye Port 465 best hai
  secure: true,         // ✅ Port 465 ke liye true hona lazmi hai
  auth: {
    // Render ke Environment Variables se values uthayega
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // ✅ Render ke connection timeout issues fix karta hai
    rejectUnauthorized: false 
  }
});

// Transporter ko export kar raha hai taake controller mein use ho sake
module.exports = transporter;