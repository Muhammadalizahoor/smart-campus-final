
// // backend/src/controllers/notificationController.js
const { firestore } = require("../config/firebase");
const transporter = require("../config/mailer");


// // SEND NOTIFICATION + EMAIL
// exports.sendNotification = async (req, res) => {
//   try {
//     const { title, message, target } = req.body;

//     if (!title || !message) {
//       return res.status(400).json({ message: "Missing fields" });
//     }

//     // 1️⃣ Save notification in Firestore
//     await firestore.collection("notifications").add({
//       title,
//       message,
//       target,
//       createdBy: "admin",
//       createdAt: new Date().toISOString(),
//     });

//     // 2️⃣ Get ALL student gmails
//     const snap = await firestore.collection("students").get();

//     const emails = [];
//     snap.forEach(doc => {
//       const data = doc.data();
//       if (data.gmail) emails.push(data.gmail);
//     });

//     // 3️⃣ Send EMAILS
//     if (emails.length > 0) {
//       await transporter.sendMail({
//         from: `"Smart Campus Transit" <${process.env.EMAIL_USER}>`,
//         to: emails.join(","), // all students
//         subject: title,
//         html: `
//           <h2>${title}</h2>
//           <p>${message}</p>
//           <br/>
//           <small>Smart Campus Transit System</small>
//         `,
//       });
//     }

//     res.json({ message: "Notification sent + emails delivered" });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Email sending failed" });
//   }
// };




// SEND NOTIFICATION + EMAIL
exports.sendNotification = async (req, res) => {
  try {
    const { title, message, target } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 1️⃣ Save in Firestore
    await firestore.collection("notifications").add({
      title,
      message,
      target,
      createdBy: "admin",
      createdAt: new Date().toISOString(),
    });

    // 2️⃣ Get student emails
    const snap = await firestore.collection("students").get();
    const emails = snap.docs
      .map(doc => doc.data().gmail)
      .filter(Boolean);

    // 3️⃣ Send Gmail
    if (emails.length > 0) {
      await transporter.sendMail({
        from: `"Smart Campus Transit" <${process.env.EMAIL_USER}>`,
        to: emails.join(","),
        subject: title,
        html: `
          <h2>${title}</h2>
          <p>${message}</p>
          <hr/>
          <small>Smart Campus Transit System</small>
        `,
      });
    }

    res.json({ message: "Notification sent + emails delivered" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Email sending failed", error: err.message });
  }
};

exports.getAllNotifications = async (req, res) => {
  const snap = await firestore
    .collection("notifications")
    .orderBy("createdAt", "desc")
    .get();

  res.json(snap.docs.map(d => d.data()));
};