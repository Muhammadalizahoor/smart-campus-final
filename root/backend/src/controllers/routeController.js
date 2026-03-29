
// backend/src/controllers/routeController.js

const { firestore, rtdb } = require("../config/firebase");
const admin = require("firebase-admin");

const db = firestore;

/* =====================================================
   HELPER: CREATE NOTIFICATION
===================================================== */
async function createNotification({
  type,
  routeId = null,
  meta = {},
  providedMessage = null,
  style = "style1",
  adminEmail = null,
}) {
  try {
    const createdBy = adminEmail || "system@school.local";

    let message = providedMessage;
    if (!message) {
      if (type === "route_add") message = `New route ${routeId} has been added.`;
      if (type === "route_update") message = `Route ${routeId} has been updated.`;
      if (type === "route_delete") message = `Route ${routeId} has been deleted.`;
    }

    await db.collection("notifications").add({
      title:
        type === "route_add"
          ? "New Route"
          : type === "route_update"
          ? "Route Updated"
          : "Route Deleted",
      message,
      type,
      routeId,
      meta,
      style,
      createdBy,
      createdAt: new Date(),
      readBy: [],
    });
  } catch (err) {
    console.error("Notification error:", err);
  }
}

/* =====================================================
   ADD ROUTE (NO STOPS HERE)
===================================================== */
const addRoute = async (req, res) => {
  try {
    const { routeId, routeName, busId, driverId } = req.body;

    if (!routeName || !busId || !driverId) {
      return res.status(400).json({
        message: "routeName, busId and driverId are required",
      });
    }

    /* 🔒 VALIDATE BUS FIRST */
    const busSnap = await db.collection("buses").doc(busId).get();

    if (!busSnap.exists) {
      return res.status(400).json({
        message: "Bus does not exist. Please add bus first.",
      });
    }

    if (!busSnap.data().capacity) {
      return res.status(400).json({
        message: "Bus capacity missing. Please edit bus and add capacity.",
      });
    }

    /* CREATE ROUTE */
    const newRouteId = routeId || db.collection("routes").doc().id;
    const routeRef = db.collection("routes").doc(newRouteId);

    if ((await routeRef.get()).exists) {
      return res.status(400).json({ message: "routeId already exists" });
    }

    const routeData = {
      routeId: newRouteId,
      routeName,
      busId,
      driverId,
      status: "active",
      createdAt: new Date(),
    };

    await routeRef.set(routeData);

    /* ASSIGN BUS */
    await db.collection("buses").doc(busId).set(
      {
        status: "assigned",
        routeId: newRouteId,
        driverId,
      },
      { merge: true }
    );

    /* ASSIGN DRIVER */
    await db.collection("drivers").doc(driverId).set(
      {
        status: "assigned",
        routeId: newRouteId,
        busId,
      },
      { merge: true }
    );

    /* START GPS (RTDB) */
    await rtdb.ref(`live_locations/Bus_${busId}`).set({
      busId,
      routeId: newRouteId,
      lat: 0,
      lng: 0,
      speed: 0,
      lastUpdated: Date.now(),
    });

    await createNotification({ type: "route_add", routeId: newRouteId });

    res.status(201).json({
      message: "Route created successfully",
      route: routeData,
    });
  } catch (error) {
    console.error("Add Route Error:", error);
    res.status(500).json({ message: "Failed to create route" });
  }
};

/* =====================================================
   GET ROUTES
===================================================== */
const getRoutes = async (req, res) => {
  try {
    const snap = await db.collection("routes").get();
    res.json(snap.docs.map((d) => d.data()));
  } catch {
    res.status(500).json({ message: "Failed to fetch routes" });
  }
};

/* =====================================================
   UPDATE ROUTE (STOPS + ACTIVATION)
===================================================== */
const updateRoute = async (req, res) => {
  try {
    const { routeId, routeName, busId, driverId, status, stops, deletedStops } =
      req.body;

    if (!routeId) {
      return res.status(400).json({ message: "routeId is required" });
    }

    const routeRef = db.collection("routes").doc(routeId);
    const oldSnap = await routeRef.get();

    if (!oldSnap.exists) {
      return res.status(404).json({ message: "Route not found" });
    }

    const oldRoute = oldSnap.data();

    /* UNASSIGN OLD BUS / DRIVER */
    if (oldRoute.busId && oldRoute.busId !== busId) {
      await db.collection("buses").doc(oldRoute.busId).set(
        { status: "unassigned", routeId: "", driverId: "" },
        { merge: true }
      );
    }

    if (oldRoute.driverId && oldRoute.driverId !== driverId) {
      await db.collection("drivers").doc(oldRoute.driverId).set(
        { status: "unassigned", routeId: "", busId: "" },
        { merge: true }
      );
    }

    /* UPDATE ROUTE */
    await routeRef.update({
      routeName,
      busId: status === "active" ? busId : "",
      driverId: status === "active" ? driverId : "",
      status,
      updatedAt: new Date(),
    });

    /* ACTIVATE ROUTE */
    if (status === "active") {
      const busSnap = await db.collection("buses").doc(busId).get();

      if (!busSnap.exists || !busSnap.data().capacity) {
        return res.status(400).json({
          message: "Bus must exist and have capacity before activation.",
        });
      }

      await db.collection("buses").doc(busId).set(
        { status: "assigned", routeId, driverId },
        { merge: true }
      );

      await db.collection("drivers").doc(driverId).set(
        { status: "assigned", routeId, busId },
        { merge: true }
      );

      await rtdb.ref(`live_locations/Bus_${busId}`).set({
        busId,
        routeId,
        lat: 0,
        lng: 0,
        speed: 0,
        lastUpdated: Date.now(),
      });
    }

    /* UPSERT STOPS */
    if (Array.isArray(stops)) {
      for (const s of stops) {
        const stopId = s.stopId || db.collection("stops").doc().id;
        await db.collection("stops").doc(stopId).set(
          {
            stopId,
            name: s.name,
            lat: Number(s.lat),
            lng: Number(s.lng),
            targetTime: s.targetTime,
            order: Number(s.order),
            routeId,
            status: "active",
            updatedAt: new Date(),
          },
          { merge: true }
        );
      }
    }

    /* DELETE REMOVED STOPS */
    if (Array.isArray(deletedStops)) {
      for (const id of deletedStops) {
        await db.collection("stops").doc(id).delete();
      }
    }

    await createNotification({ type: "route_update", routeId });

    res.json({ message: "Route updated successfully" });
  } catch (error) {
    console.error("Update Route Error:", error);
    res.status(500).json({ message: "Failed to update route" });
  }
};

/* =====================================================
   DELETE ROUTE
===================================================== */
const deleteRoute = async (req, res) => {
  try {
    const { routeId } = req.body;

    if (!routeId) {
      return res.status(400).json({ message: "routeId is required" });
    }

    const routeRef = db.collection("routes").doc(routeId);
    const snap = await routeRef.get();

    if (!snap.exists) {
      return res.status(404).json({ message: "Route not found" });
    }

    const route = snap.data();

    if (route.busId) {
      await db.collection("buses").doc(route.busId).set(
        { status: "unassigned", routeId: "", driverId: "" },
        { merge: true }
      );
    }

    if (route.driverId) {
      await db.collection("drivers").doc(route.driverId).set(
        { status: "unassigned", routeId: "", busId: "" },
        { merge: true }
      );
    }

    await routeRef.delete();
    await createNotification({ type: "route_delete", routeId });

    res.json({ message: "Route deleted successfully" });
  } catch (error) {
    console.error("Delete Route Error:", error);
    res.status(500).json({ message: "Failed to delete route" });
  }
};

module.exports = {
  addRoute,
  getRoutes,
  updateRoute,
  deleteRoute,
};

