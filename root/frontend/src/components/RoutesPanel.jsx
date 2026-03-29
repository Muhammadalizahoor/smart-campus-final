import React, { useEffect, useState } from "react";
import BusCard from "./BusCard";
import { collection, onSnapshot } from "firebase/firestore";
import { firestore } from "../services/firebase";
import "../styles/routes-panel.css";

export default function RoutesPanel({ routes = [], liveLocations = {}, etaInfo }) {
  const [allStops, setAllStops] = useState([]);

  useEffect(() => {
    // Real-time listener for all stops
    const unsub = onSnapshot(collection(firestore, "stops"), (snap) => {
      const stopsData = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        lat: Number(doc.data().lat),
        lng: Number(doc.data().lng),
        order: Number(doc.data().order)
      }));
      setAllStops(stopsData);
    });
    return () => unsub();
  }, []);

  return (
    <div className="routes-panel">
      {routes.map((route) => {
        // Filter stops belonging to this specific route
        const routeStops = allStops.filter(s => s.routeId === route.routeId);
        const live = liveLocations[route.busId]?.current || null;

        return (
          <BusCard
            key={route.id || route.routeId}
            route={route}
            liveLocation={live}
            stops={routeStops}
          />
        );
      })}
    </div>
  );
}