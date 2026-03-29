// backend/controllers/stopsController.js
//const db = require('../config/firebase.js');
const { firestore } = require("../config/firebase");
const db = firestore;
// Get all stops
const getStops = async (req, res) => {
    try {
        const stopsSnapshot = await db.collection('stops').get();
        const stops = stopsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(stops);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch stops' });
    }
};

module.exports = { getStops };
