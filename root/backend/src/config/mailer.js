const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,            // 587 ki jagah 465 use karo, ye Render par chalta hai
  secure: true,         // Port 465 ke liye true hona lazmi hai
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // Ye line Render ke connection issues fix karti hai
    rejectUnauthorized: false 
  }
});

module.exports = transporter;