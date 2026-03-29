
// backend/src/controllers/busController.js
const { firestore } = require("../config/firebase");

/**
 * GET /api/buses?status=assigned
 * Fetch buses (used in tables & dropdowns)
 */
exports.getBuses = async (req, res) => {
  try {
    const status = req.query.status;

    let query = firestore.collection("buses");
    if (status) {
      query = query.where("status", "==", status);
    }

    const snap = await query.get();

    const buses = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    return res.json({ buses });
  } catch (err) {
    console.error("getBuses error:", err);
    return res.status(500).json({ message: "Failed to load buses" });
  }
};

/**
 * POST /api/buses/create
 * Create new bus (capacity REQUIRED)
 */
exports.createBus = async (req, res) => {
  console.log("🚍 createBus API HIT", req.body);

  try {
    const {
      busId,
      plateNumber,
      capacity
    } = req.body;

    if (!busId || !plateNumber) {
      return res.status(400).json({
        message: "busId and plateNumber are required"
      });
    }

    if (!capacity || Number(capacity) <= 0) {
      return res.status(400).json({
        message: "Capacity is required and must be greater than 0"
      });
    }

    const busRef = firestore.collection("buses").doc(busId);

    if ((await busRef.get()).exists) {
      return res.status(400).json({ message: "Bus already exists" });
    }

    await busRef.set({
      busId,
      plateNumber,
      capacity: Number(capacity),
      status: "unassigned",
      routeId: "",
      driverId: "",
      createdAt: new Date()
    });

    return res.json({ success: true });
  } catch (err) {
    console.error("createBus error:", err);
    return res.status(500).json({ message: "Failed to create bus" });
  }
};

/**
 * PUT /api/buses/update/:busId
 * Update bus details (capacity editable)
 */
exports.updateBus = async (req, res) => {
  try {
    const { busId } = req.params;
    const { plateNumber, capacity, status } = req.body;

    if (!busId) {
      return res.status(400).json({ message: "busId is required" });
    }

    const busRef = firestore.collection("buses").doc(busId);
    const snap = await busRef.get();

    if (!snap.exists) {
      return res.status(404).json({ message: "Bus not found" });
    }

    const updateData = {};

    if (plateNumber) updateData.plateNumber = plateNumber;
    if (status) updateData.status = status;

    if (capacity !== undefined) {
      if (Number(capacity) <= 0) {
        return res.status(400).json({
          message: "Capacity must be greater than 0"
        });
      }
      updateData.capacity = Number(capacity);
    }

    updateData.updatedAt = new Date();

    await busRef.update(updateData);

    return res.json({ success: true });
  } catch (err) {
    console.error("updateBus error:", err);
    return res.status(500).json({ message: "Failed to update bus" });
  }
};

/**
 * DELETE /api/buses/delete/:busId
 * Delete bus (safe delete)
 */
exports.deleteBus = async (req, res) => {
  try {
    const { busId } = req.params;

    if (!busId) {
      return res.status(400).json({ message: "busId is required" });
    }

    const busRef = firestore.collection("buses").doc(busId);
    const snap = await busRef.get();

    if (!snap.exists) {
      return res.status(404).json({ message: "Bus not found" });
    }

    const bus = snap.data();

    if (bus.status === "assigned") {
      return res.status(400).json({
        message: "Cannot delete assigned bus. Unassign route first."
      });
    }

    await busRef.delete();

    return res.json({ success: true });
  } catch (err) {
    console.error("deleteBus error:", err);
    return res.status(500).json({ message: "Failed to delete bus" });
  }
};
