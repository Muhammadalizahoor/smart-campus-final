import React, { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { Bus, Clock, ArrowRightLeft } from "lucide-react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get } from "firebase/database";

const myConfig = {
  apiKey: "AIzaSyCN5j1uG14ca37yU3vK4AI0QJL8MswNMLk",
  authDomain: "smart-campus-7e161.firebaseapp.com",
  databaseURL: "https://smart-campus-7e161-default-rtdb.firebaseio.com",
  projectId: "smart-campus-7e161",
  storageBucket: "smart-campus-7e161.firebasestorage.app",
  messagingSenderId: "203474285052",
  appId: "1:203474285052:web:35cddaababa820db250279"
};

const myApp = initializeApp(myConfig, "myApp");
const rtdb = getDatabase(myApp);

const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

// 🕒 HELPER: Format timestamp to readable time
const formatTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function BusCard({ route, liveLocation, stops = [] }) {
  const { lat, lng, speed, eta } = liveLocation || {};
  
  const [currentOrder, setCurrentOrder] = useState(0);
  const [isReturning, setIsReturning] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 🟢 NEW STATE: Store timestamps for each stop
  const [stopTimes, setStopTimes] = useState({});
  
  // Refs for stable values
  const currentOrderRef = useRef(0);
  const isReturningRef = useRef(false);
  const stopTimesRef = useRef({}); // Stable ref for stop times
  const lastProcessedStopRef = useRef(null);
  const updateTimeoutRef = useRef(null);
  const isProcessingRef = useRef(false);
  const locationHistoryRef = useRef([]);

  const sortedStops = useMemo(() => [...stops].sort((a, b) => a.order - b.order), [stops]);
  const maxOrder = sortedStops.length > 0 ? sortedStops[sortedStops.length - 1].order : 0;
  const minOrder = sortedStops.length > 0 ? sortedStops[0].order : 0;

  // 1️⃣ LOAD SAVED STATUS
  useEffect(() => {
    const statusPath = `bus_data_v2/${route.busId}/status`;
    const statusRef = ref(rtdb, statusPath);
    
    console.log("📡 Loading status from:", statusPath);
    
    get(statusRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const savedStatus = snapshot.val();
          console.log("✅ Loaded status:", savedStatus);
          
          const order = savedStatus.currentOrder || 0;
          const direction = savedStatus.isReturning || false;
          const times = savedStatus.stopTimes || {}; // 🟢 Load saved stop times
          
          setCurrentOrder(order);
          setIsReturning(direction);
          setStopTimes(times);
          
          currentOrderRef.current = order;
          isReturningRef.current = direction;
          stopTimesRef.current = times;
        } else {
          console.log("🆕 Creating default status");
          return set(statusRef, {
            currentOrder: 0,
            isReturning: false,
            stopTimes: {},
            lastUpdated: new Date().toISOString()
          });
        }
      })
      .catch((error) => {
        console.error("❌ Error loading status:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [route.busId]);

  // 2️⃣ STABILIZED SAVE FUNCTION
  const saveStatusToFirebase = useCallback((order, direction, updatedStopTimes) => {
    const statusPath = `bus_data_v2/${route.busId}/status`;
    const statusRef = ref(rtdb, statusPath);
    
    const dataToSave = {
      currentOrder: order,
      isReturning: direction,
      stopTimes: updatedStopTimes, // 🟢 Save stop times
      lastUpdated: new Date().toISOString()
    };
    
    console.log("💾 Saving to Firebase:", dataToSave);
    
    return set(statusRef, dataToSave)
      .then(() => {
        console.log("✅ Firebase status saved!");
        return true;
      })
      .catch((error) => {
        console.error("❌ Firebase save error:", error);
        return false;
      });
  }, [route.busId]);

  // 3️⃣ STABILIZED STATE UPDATE FUNCTION
  const updateBusStatus = useCallback((newOrder, newDirection, currentStopId) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    currentOrderRef.current = newOrder;
    isReturningRef.current = newDirection;
    
    // 🟢 Record the time for the specific stop that was just reached
    const timestamp = new Date().toISOString();
    const updatedStopTimes = { ...stopTimesRef.current };
    
    // If direction changes, optionally clear old times so they don't carry over to the return trip
    if (newDirection !== isReturningRef.current) {
        // Clear times if you want fresh timestamps for the return journey
        // Object.keys(updatedStopTimes).forEach(k => delete updatedStopTimes[k]);
    }

    if (currentStopId) {
       updatedStopTimes[currentStopId] = timestamp;
       stopTimesRef.current = updatedStopTimes;
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      setCurrentOrder(newOrder);
      setIsReturning(newDirection);
      setStopTimes(updatedStopTimes);
      
      saveStatusToFirebase(newOrder, newDirection, updatedStopTimes);
      console.log(`🚌 Status updated: Order ${newOrder}, Direction ${newDirection ? 'INBOUND' : 'OUTBOUND'}`);
    }, 100);
  }, [saveStatusToFirebase]);

  // 4️⃣ GPS STABILIZATION - Average last positions
  const getStableLocation = useCallback(() => {
    if (!lat || !lng) return null;
    
    // Add current position to history
    locationHistoryRef.current.push({ lat, lng, timestamp: Date.now() });
    
    // Keep only last 3 seconds of data
    const threeSecondsAgo = Date.now() - 3000;
    locationHistoryRef.current = locationHistoryRef.current.filter(
      loc => loc.timestamp > threeSecondsAgo
    );
    
    if (locationHistoryRef.current.length === 0) return { lat, lng };
    
    // Calculate weighted average (recent positions have more weight)
    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLng = 0;
    
    locationHistoryRef.current.forEach((loc, index) => {
      const weight = (index + 1) / locationHistoryRef.current.length; // Recent = higher weight
      weightedLat += loc.lat * weight;
      weightedLng += loc.lng * weight;
      totalWeight += weight;
    });
    
    return {
      lat: weightedLat / totalWeight,
      lng: weightedLng / totalWeight
    };
  }, [lat, lng]);

  // 5️⃣ IMPROVED STOP DETECTION WITH DIRECTIONAL VALIDATION
  useEffect(() => {
    if (!lat || !lng || !stops.length || loading || isProcessingRef.current) {
      return;
    }
    
    isProcessingRef.current = true;
    
    try {
      const stableLoc = getStableLocation();
      if (!stableLoc) return;
      
      const currentOrderVal = currentOrderRef.current;
      const isReturningVal = isReturningRef.current;
      
      // Find stops in PROGRESSIVE order based on direction
      let candidateStops = [];
      
      if (!isReturningVal) {
        // OUTBOUND: Look for stops with order > currentOrder
        candidateStops = stops.filter(stop => stop.order > currentOrderVal);
      } else {
        // INBOUND: Look for stops with order < currentOrder
        candidateStops = stops.filter(stop => stop.order < currentOrderVal);
      }
      
      // If no progressive stops, check for direction change
      if (candidateStops.length === 0) {
        if (!isReturningVal) {
          // Check if we're at last stop
          candidateStops = stops.filter(stop => stop.order === maxOrder);
        } else {
          // Check if we're at first stop
          candidateStops = stops.filter(stop => stop.order === minOrder);
        }
      }
      
      // Find the closest candidate stop
      let closestStop = null;
      let minDistance = Infinity;
      
      candidateStops.forEach((stop) => {
        const distance = getDistance(stableLoc.lat, stableLoc.lng, stop.lat, stop.lng);
        if (distance < minDistance) {
          minDistance = distance;
          closestStop = stop;
        }
      });
      
      // DYNAMIC THRESHOLD BASED ON SPEED
      // Slower speed = smaller trigger radius
      const currentSpeed = speed || 0;
      let triggerDistance = 80; // Default 80m
      
      if (currentSpeed > 40) triggerDistance = 100; // Fast: 100m
      else if (currentSpeed > 20) triggerDistance = 80; // Medium: 80m
      else triggerDistance = 50; // Slow: 50m
      
      // Check if we're VERY close to a stop
      if (closestStop && minDistance <= triggerDistance) {
        const lastProcessed = lastProcessedStopRef.current;
        
        // Skip if this is the same stop we just processed
        if (lastProcessed === closestStop.id) {
          console.log(`⏭️ Skip: Already at ${closestStop.name} (${minDistance.toFixed(1)}m)`);
          return;
        }
        
        console.log(`📍 Very close to ${closestStop.name} (${minDistance.toFixed(1)}m < ${triggerDistance}m)`);
        
        // Check if we should actually trigger this stop
        let newOrder = currentOrderVal;
        let newDirection = isReturningVal;
        let shouldUpdate = false;
        
        // VALIDATE MOVEMENT DIRECTION
        if (!isReturningVal) {
          // OUTBOUND: Must be moving to higher order
          if (closestStop.order > currentOrderVal) {
            newOrder = closestStop.order;
            shouldUpdate = true;
            console.log(`➡️ Confirmed: Moving to ${closestStop.name} (order ${newOrder})`);
          }
          
          // Check for terminus
          if (closestStop.order === maxOrder && !isReturningVal) {
            newDirection = true;
            shouldUpdate = true;
            console.log("🔄 Reached terminus, switching to INBOUND");
          }
        } else {
          // INBOUND: Must be moving to lower order
          if (closestStop.order < currentOrderVal) {
            newOrder = closestStop.order;
            shouldUpdate = true;
            console.log(`⬅️ Confirmed: Moving to ${closestStop.name} (order ${newOrder})`);
          }
          
          // Check for origin
          if (closestStop.order === minOrder && isReturningVal) {
            newDirection = false;
            shouldUpdate = true;
            console.log("🔄 Reached origin, switching to OUTBOUND");
          }
        }
        
        if (shouldUpdate) {
          lastProcessedStopRef.current = closestStop.id;
          updateBusStatus(newOrder, newDirection, closestStop.id); // 🟢 Pass the stop ID to record the time
        }
      } else if (minDistance > 200) {
        // Reset when far from any stop
        lastProcessedStopRef.current = null;
      }
    } finally {
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 800); // Longer cooldown to prevent rapid triggering
    }
  }, [lat, lng, stops, loading, maxOrder, minOrder, updateBusStatus, speed, getStableLocation]);

  // 6️⃣ Cleanup
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Next stop logic
  const nextStopObj = isReturning 
    ? [...sortedStops].reverse().find(s => s.order < currentOrder) 
    : sortedStops.find(s => s.order > currentOrder);

  if (loading) {
    return (
      <div className="bus-card-pro">
        <div className="card-header">
          <div className="bus-identity">
            <div className="bus-icon-circle"><Bus size={18} color="white" /></div>
            <div className="title-stack">
              <h3>Bus- {route.busId}</h3>
              <p>{route.routeName}</p>
            </div>
          </div>
        </div>
        <div className="loading-message">Loading trip status...</div>
      </div>
    );
  }

  return (
    <div className="bus-card-pro">
      <div className="card-header">
        <div className="bus-identity">
          <div className="bus-icon-circle"><Bus size={18} color="white" /></div>
          <div className="title-stack">
            <h3>Bus- {route.busId}</h3>
            <p>{route.routeName}</p>
          </div>
        </div>
        <div className={`trip-badge ${isReturning ? 'inbound' : 'outbound'}`}>
          <ArrowRightLeft size={12} />
          {isReturning ? "INBOUND TRIP" : "OUTBOUND TRIP"}
        </div>
      </div>

      <div className="info-main-grid">
        <div className="info-left">
          <div className="mini-row">
            <span className="label">Driver:</span>
            <span className="value">{route.driverId || "Ahmed Khan"}</span>
          </div>
          <div className="mini-row">
            <span className="label">Next Stop:</span>
            <span className="value blue-text">{nextStopObj?.name || "Terminal"}</span>
          </div>
        </div>

        <div className="info-right">
          <div className="mini-row">
            <span className="label">Speed:</span>
            <span className="value">{speed || 0} km/h</span>
          </div>
          <div className="eta-capsule">
            <Clock size={14} />
            <span>ETA: {eta || "N/A"}</span>
          </div>
        </div>
      </div>

      <div className="progress-pro-container">
        <p className="section-label">Route Progress:</p>
        <div className="horizontal-track">
          {sortedStops.map((stop, index) => {
            const isPassed = isReturning ? stop.order >= currentOrder : stop.order <= currentOrder;
            const isLast = index === sortedStops.length - 1;
            const crossedTime = stopTimes[stop.id]; // 🟢 Get the time for this specific stop

            return (
              <div key={stop.id} className="track-node">
                <div className="node-bar">
                  <div className={`dot-core ${isPassed ? "active" : ""}`}></div>
                  {!isLast && <div className={`line-segment ${isPassed ? "active" : ""}`}></div>}
                </div>
                {/* 🟢 Render the label and the time right below it */}
                <div className="stop-info-column">
                    <span className={`stop-label-text ${isPassed ? "active" : ""}`}>{stop.name}</span>
                    {isPassed && crossedTime && (
                        <span className="stop-time-text" style={{ fontSize: '0.7rem', color: '#6b7280', marginTop: '2px', display: 'block' }}>
                            {formatTime(crossedTime)}
                        </span>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}