"use client";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { firestore, rtdb } from "../services/firebase";

import GoogleMapSection from "./GoogleMap";

export default function DashboardLiveMap() {
  const [routes, setRoutes] = useState([]);
  const [liveLocations, setLiveLocations] = useState({});

  // 🔹 Fetch ACTIVE routes (Firestore)
  useEffect(() => {
    const q = query(
      collection(firestore, "routes"),
      where("status", "==", "active")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRoutes(data);
    });

    return () => unsub();
  }, []);

  // 🔹 Fetch LIVE bus GPS (Realtime DB)
  useEffect(() => {
    const liveRef = ref(rtdb, "bus_data_v2");

    const unsub = onValue(liveRef, (snap) => {
      setLiveLocations(snap.val() || {});
    });

    return () => unsub();
  }, []);

  return (
    <GoogleMapSection
      routes={routes}
      liveLocations={liveLocations}
    />
  );
}
