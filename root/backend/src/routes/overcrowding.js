//backend//src//routes//overcrowding.js
const express = require("express");
const router = express.Router();

const { rebuildOccupancy } = require("../controllers/occupancyRebuildController");

const {
  finalizeTrip,
  getOvercrowdingTable,
  getOvercrowdingChart,
  getDailyStats,
  getMonthlyStats,
  getOvercrowdingReport,
} = require("../controllers/overcrowdingController");

// Trip finalize (optional)
router.post("/finalize-trip", finalizeTrip);

// Main analytics APIs
router.get("/table", getOvercrowdingTable);
router.get("/chart", getOvercrowdingChart);
router.get("/daily-stats", getDailyStats);
router.get("/monthly-stats", getMonthlyStats);
router.get("/report", getOvercrowdingReport);

// one-time rebuild from RTDB -> Firestore
router.post("/rebuild", rebuildOccupancy);

module.exports = router;
