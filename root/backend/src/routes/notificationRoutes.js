//backend/src/routes/notificationRoutes.js
const express = require("express");
const router = express.Router();
const {
  sendNotification,
  getAllNotifications
} = require("../controllers/notificationController");

router.post("/send", sendNotification);
router.get("/", getAllNotifications);

module.exports = router;
