//frontend//src//pages//LiveTracking.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import GoogleMapSection from "../components/GoogleMap";
import RoutesPanel from "../components/RoutesPanel";
import "../styles/main.css";

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
// These now pull from two different projects thanks to your new firebase.js
import { firestore, rtdb } from "../services/firebase"; 

function LiveTracking() {
  const [etaInfo, setEtaInfo] = useState(null);
  const [activeRoutes, setActiveRoutes] = useState([]);
  const [liveLocations, setLiveLocations] = useState({});

  // ==========================================
  // 1️⃣ LISTEN TO FRIEND'S FIRESTORE (Routes)
  // ==========================================
  useEffect(() => {
    // Only fetch routes that are explicitly set to "active"
    const q = query(
      collection(firestore, "routes"),
      where("status", "==", "active")
    );

    const unsub = onSnapshot(q, (snap) => {
      const routes = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("Found Active Routes from Friend's DB:", routes);
      setActiveRoutes(routes);
    });

    return () => unsub();
  }, []);

  // ==========================================
  // 2️⃣ LISTEN TO YOUR REALTIME DB (GPS)
  // ==========================================
  useEffect(() => {
    // UPDATED: Now points to your "bus_data_v2" node
    const liveRef = ref(rtdb, "bus_data_v2"); 

    const unsub = onValue(liveRef, (snap) => {
      const data = snap.val() || {};
      console.log("Live GPS Data from Your DB:", data);
      setLiveLocations(data);
    });

    return () => unsub();
  }, []);

  // Note: Auto-create logic removed to prevent writing 
  // conflicting data while testing the dual-DB bridge.

  return (
    <div className="live-layout">
      <Sidebar />
      <div className="live-main">
        <Header />

        <div className="live-content">
          <main className="map-area">
            <GoogleMapSection
              routes={activeRoutes}
              liveLocations={liveLocations}
              onETASelect={setEtaInfo}
            />

            {etaInfo && (
              <div className="eta-box">
                <button className="close-eta" onClick={() => setEtaInfo(null)}>×</button>
                <strong>{etaInfo.busId}</strong> → {etaInfo.stopName}
                <br />
                <span className="eta-highlight">ETA: {etaInfo.etaMinutesLabel}</span>
                <br />
                <small>Distance: {etaInfo.distanceKm} km</small>
              </div>
            )}
          </main>

          <div className="routes-panel-wrapper">
            <RoutesPanel
              routes={activeRoutes}
              liveLocations={liveLocations}
              etaInfo={etaInfo}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveTracking;