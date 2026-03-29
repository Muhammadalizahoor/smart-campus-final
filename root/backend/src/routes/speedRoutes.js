// const express = require("express");
// const router = express.Router();
// const { getSpeedEvents, getSpeedStats } = require("../controllers/speedController");

// router.get("/events", getSpeedEvents);
// router.get("/stats", getSpeedStats);

// module.exports = router;
const express = require("express");
const router = express.Router();

const { getSpeedEvents } = require("../controllers/speedController");

router.get("/events", getSpeedEvents);

module.exports = router;
