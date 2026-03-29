const express = require('express');   //backend/src/routes/route.js
const router = express.Router();
const { addRoute, getRoutes, updateRoute, deleteRoute } = require('../controllers/routeController');


router.get('/all', getRoutes);
router.post('/add', addRoute);
router.put('/update', updateRoute);
// router.delete('/delete', deleteRoute);
router.post('/delete', deleteRoute);

module.exports = router;
