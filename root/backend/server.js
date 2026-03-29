const { firestore, rtdb } = require("./src/config/firebase"); // backend//server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./src/routes/auth");
const overcrowdingRoutes = require("./src/routes/overcrowding");
const routeRoutes = require("./src/routes/route.js");
const driverRoutes = require("./src/routes/drivers.js");
const stopsRouter = require("./src/routes/stops");
const notificationRoutes = require("./src/routes/notificationRoutes");
const complaintRoutes = require("./src/routes/complaintRoutes");
const studentRoutes = require("./src/routes/studentRoutes"); // ✅ Purani file hi use hogi

const { startScanner } = require("./src/scanProcessor/index");
const { startMonthlyReportJob } = require("./src/jobs/monthlyReportJob");

const app = express();

/* ================== MIDDLEWARE ================== */
app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

/* ================== ROUTES ================== */
// ✅ 1. Auth (Signup/Login)
app.use("/api/auth", authRoutes);

// ✅ 2. Students (List show karna aur RFID assign karna)
// Humne studentRoutes mein hi assign-rfid ka naya rasta bana diya hai
app.use("/api/students", studentRoutes);

app.use("/api/overcrowding", overcrowdingRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/stops", stopsRouter);
app.use("/api/notifications", notificationRoutes);
app.use("/api/complaints", complaintRoutes);

/* ================== ROOT ================== */
app.get("/", (req, res) => {
  res.status(200).send("Backend running ✔");
});

/* ================== EXTRA SERVICES ================== */
const { startSpeedListener } = require("./src/services/speedListener");
startSpeedListener();

const { startSpeedMonitoring } = require("./src/controllers/speedController");
startSpeedMonitoring();

const speedRoutes = require("./src/routes/speedRoutes");
app.use("/api/speed", speedRoutes);

const busRoutes = require("./src/routes/busRoutes");
app.use("/api/buses", busRoutes);

/* ================== ERROR HANDLING ================== */
process.on("uncaughtException", err => {
  console.error("UNCAUGHT ERROR:", err);
});

process.on("unhandledRejection", err => {
  console.error("PROMISE ERROR:", err);
});

/* ================== START SERVER ================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
});

/* ================== START RFID ENGINE ================== */
startScanner();
startMonthlyReportJob();