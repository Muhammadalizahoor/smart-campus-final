const { firestore } = require("../config/firebase");
const db = firestore;

// --- 1. GET ALL DRIVERS ---
const getDrivers = async (req, res) => {
    try {
        const snapshot = await db.collection('drivers').get();
        const drivers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: "Fetch failed" });
    }
};

// --- 2. ADD NEW DRIVER ---
const addDriver = async (req, res) => {
    const { driverId, driverName, phoneNumber, rfid_id } = req.body;
    if (!driverId || !driverName || !phoneNumber) {
        return res.status(400).json({ message: "Missing fields" });
    }
    try {
        const docRef = db.collection('drivers').doc(driverId);
        const existing = await docRef.get();
        if (existing.exists) return res.status(400).json({ message: "ID already exists" });

        const driverData = {
            driverId, driverName, phoneNumber,
            busId: '', routeId: '', rfid_id: rfid_id || null,
            status: 'unassigned', createdAt: new Date()
        };
        await docRef.set(driverData);

        if (rfid_id) {
            const rSnap = await db.collection("available_rfids").where("value", "==", rfid_id).get();
            if (!rSnap.empty) await rSnap.docs[0].ref.update({ assigned: true, assignedTo: `driver_${driverId}` });
        }
        res.status(201).json({ message: "Created", driver: driverData });
    } catch (error) { res.status(500).json({ message: "Add failed" }); }
};

// --- 3. UPDATE DRIVER ---
const updateDriver = async (req, res) => {
    const { driverId, driverName, phoneNumber, status, routeId, busId, rfid_id } = req.body;
    if (!driverId) return res.status(400).json({ message: "driverId is required" });

    try {
        const driverRef = db.collection('drivers').doc(driverId);
        const doc = await driverRef.get();
        if (!doc.exists) return res.status(404).json({ message: "Driver not found" });

        const driverData = doc.data();

        if (status === 'unassigned' || status === 'on leave') {
            if (driverData.routeId) {
                const routeRef = db.collection('routes').doc(driverData.routeId);
                const routeDoc = await routeRef.get();
                if (routeDoc.exists && routeDoc.data().driverId === driverId) {
                    await routeRef.update({ driverId: null, updatedAt: new Date() });
                }
            }
            await driverRef.update({
                driverName: driverName || driverData.driverName,
                phoneNumber: phoneNumber || driverData.phoneNumber,
                status: status, routeId: '', busId: '',
                rfid_id: rfid_id !== undefined ? rfid_id : (driverData.rfid_id || null),
                updatedAt: new Date()
            });
            return res.json({ message: "Unassigned success" });
        }

        if (routeId) {
            const routeRef = db.collection('routes').doc(routeId);
            const routeDoc = await routeRef.get();
            if (!routeDoc.exists) return res.status(404).json({ message: "Route not found" });

            const oldDriverId = routeDoc.data().driverId;
            if (oldDriverId && oldDriverId !== driverId) {
                await db.collection('drivers').doc(oldDriverId).update({ status: 'unassigned', routeId: '', busId: '' });
            }

            await routeRef.update({ driverId, updatedAt: new Date() });
            await driverRef.update({
                driverName: driverName || driverData.driverName,
                phoneNumber: phoneNumber || driverData.phoneNumber,
                status: 'assigned', routeId, busId: busId || '',
                rfid_id: rfid_id !== undefined ? rfid_id : (driverData.rfid_id || null),
                updatedAt: new Date()
            });
            return res.json({ message: "Route assigned" });
        }

        const updates = { updatedAt: new Date() };
        if (driverName) updates.driverName = driverName;
        if (phoneNumber) updates.phoneNumber = phoneNumber;
        if (status) updates.status = status;
        if (busId !== undefined) updates.busId = busId;
        if (rfid_id !== undefined) updates.rfid_id = rfid_id;

        await driverRef.update(updates);
        res.json({ message: "Updated" });
    } catch (error) { res.status(500).json({ message: "Update failed" }); }
};

// --- 4. ASSIGN / UNASSIGN RFID (Logic Updated) ---
const assignDriverRfid = async (req, res) => {
    const { driverId, rfid_id } = req.body;
    try {
        const driverRef = db.collection('drivers').doc(driverId);
        const driverSnap = await driverRef.get();
        const oldRFID = driverSnap.data().rfid_id;

        // Agar rfid_id empty hai, matlab UNASSIGN karna hai
        if (!rfid_id || rfid_id === "") {
            await driverRef.update({ rfid_id: null, updatedAt: new Date() });
            if (oldRFID) {
                const oldSnap = await db.collection("available_rfids").where("value", "==", oldRFID).get();
                if (!oldSnap.empty) await oldSnap.docs[0].ref.update({ assigned: false, assignedTo: null });
            }
            return res.json({ message: "RFID Unassigned" });
        }

        // Naya card assign karna
        await driverRef.update({ rfid_id, updatedAt: new Date() });
        const rfidPool = await db.collection("available_rfids").where("value", "==", rfid_id).get();
        if (!rfidPool.empty) await rfidPool.docs[0].ref.update({ assigned: true, assignedTo: `driver_${driverId}` });
        
        if (oldRFID && oldRFID !== rfid_id) {
            const oldSnap = await db.collection("available_rfids").where("value", "==", oldRFID).get();
            if (!oldSnap.empty) await oldSnap.docs[0].ref.update({ assigned: false, assignedTo: null });
        }
        res.json({ message: "RFID success" });
    } catch (e) { res.status(500).json({ message: "RFID error" }); }
};

// --- 5. DELETE DRIVER ---
const deleteDriver = async (req, res) => {
    const { driverId } = req.body;
    try {
        const driverRef = db.collection('drivers').doc(driverId);
        const doc = await driverRef.get();
        if (!doc.exists) return res.status(404).json({ message: "Not found" });
        const d = doc.data();
        if (d.routeId) await db.collection('routes').doc(d.routeId).update({ driverId: null });
        if (d.rfid_id) {
            const rSnap = await db.collection("available_rfids").where("value", "==", d.rfid_id).get();
            if (!rSnap.empty) await rSnap.docs[0].ref.update({ assigned: false, assignedTo: null });
        }
        await driverRef.delete();
        res.json({ message: "Deleted" });
    } catch (e) { res.status(500).json({ message: "Delete failed" }); }
};

module.exports = { addDriver, getDrivers, updateDriver, deleteDriver, assignDriverRfid };