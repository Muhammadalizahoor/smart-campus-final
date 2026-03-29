// backend/src/routes/busRoutes.js
const express = require("express");
const router = express.Router();
const {
  getBuses,
  createBus,
  updateBus,
  deleteBus
} = require("../controllers/busController");

router.get("/", getBuses);
router.post("/create", createBus);   // ✅ ADD THIS
router.put("/update", updateBus);    // optional
router.delete("/delete", deleteBus); // optional

module.exports = router;
