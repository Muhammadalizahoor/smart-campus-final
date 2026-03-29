const express = require('express');//backend/src/routes/stops.js
const router = express.Router();
const { getStops } = require('../controllers/stopsController');

router.get('/all', getStops);

module.exports = router;
