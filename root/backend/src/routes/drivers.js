const express = require('express');
const router = express.Router();
const { addDriver, getDrivers, updateDriver, deleteDriver, assignDriverRfid } = require('../controllers/driversController');

router.get('/all', getDrivers);
router.post('/add', addDriver);
router.put('/update', updateDriver);
router.delete('/delete', deleteDriver);
router.put('/assign-rfid', assignDriverRfid); // ✅ Sync feature

module.exports = router;