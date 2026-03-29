const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    // Isay verify karo ke Render par keys ka naam exactly yahi hai
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});
