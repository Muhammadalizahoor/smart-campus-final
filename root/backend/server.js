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
const studentRoutes = require("./src/routes/studentRoutes");

const { startScanner } = require("./src/scanProcessor/index");
const { startMonthlyReportJob } = require("./src/jobs/monthlyReportJob");

const app = express();

/* ================== MIDDLEWARE (31 March Fix) ================== */
// Sab ko ijazat de di hai taake demo mein masla na ho
app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

/* ================== ROUTES ================== */
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/overcrowding", overcrowdingRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/stops", stopsRouter);
app.use("/api/notifications", notificationRoutes);
app.use("/api/complaints", complaintRoutes);

/* ================== ROOT ================== */
app.get("/", (req, res) => {
  res.status(200).send("Smart Campus Backend is LIVE ✔");
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
