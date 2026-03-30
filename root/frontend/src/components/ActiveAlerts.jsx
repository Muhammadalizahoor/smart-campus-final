"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Users,
  MessageSquareWarning,
  Gauge,
  Clock,
  Calendar,
  ChevronRight
} from "lucide-react";

import {
  collection,
  query,
  where,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  orderBy,
  collectionGroup,
} from "firebase/firestore";

import { ref, onValue } from "firebase/database";
import { firestore, rtdb } from "../services/firebase"; 
import "../styles/active-alerts.css";

export default function ActiveAlerts() {
  const [allAlerts, setAllAlerts] = useState({
    history: [],    
    rfid: [],       
    complaints: [], 
    capacity: []    
  });
  
  const SPEED_THRESHOLD = 80;

  const formatDateTime = (date) => {
    const d = date instanceof Date ? date : new Date();
    return {
      dateText: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      timeText: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    };
  };

  useEffect(() => {
    const unsubscribers = [];

    // 1️⃣ RFID ERRORS (Updated with OrderBy to match History page)
    const rfidQuery = query(
      collection(firestore, "entry_exit_logs"),
      orderBy("timestamp", "desc"),
      limit(10)
    );
    unsubscribers.push(onSnapshot(rfidQuery, (snap) => {
      const list = snap.docs.filter(d => d.data().error).map(d => {
        const x = d.data();
        const dt = new Date(x.timestamp);
        return {
          id: d.id,
          group: "rfid",
          type: "danger",
          title: `Security: ${x.error.replace(/_/g, ' ')} (RFID: ${x.rfid})`,
          timeObj: dt,
          ...formatDateTime(dt),
          icon: <AlertTriangle size={20} />
        };
      });
      setAllAlerts(prev => ({ ...prev, rfid: list }));
    }));

    // 2️⃣ COMPLAINTS (Removed status filter & added OrderBy to match History page)
    const compQuery = query(
      collection(firestore, "complaints"), 
      orderBy("submittedOn", "desc"), 
      limit(10)
    );
    unsubscribers.push(onSnapshot(compQuery, (snap) => {
      const list = snap.docs.map(d => {
        const x = d.data();
        const dt = x.submittedOn?.toDate ? x.submittedOn.toDate() : new Date(x.submittedOn);
        return {
          id: d.id,
          group: "complaint",
          type: "warning",
          title: `Complaint: ${x.category}`,
          timeObj: dt,
          ...formatDateTime(dt),
          icon: <MessageSquareWarning size={20} />
        };
      });
      setAllAlerts(prev => ({ ...prev, complaints: list }));
    }));

    // 3️⃣ LIVE OVERCROWDING
    const occupancyQuery = collectionGroup(firestore, "latest");
    unsubscribers.push(onSnapshot(occupancyQuery, (snap) => {
      const list = snap.docs
        .filter(d => d.data().currentPassengers > d.data().capacity)
        .map(d => {
            const x = d.data();
            return {
                id: `cap-${d.id}`,
                group: "capacity",
                type: "danger",
                title: `Overcrowded: Bus ${x.busId} (${x.currentPassengers}/${x.capacity})`,
                timeObj: new Date(), 
                dateText: "Today",
                timeText: "Live",
                icon: <Users size={20} />
            };
        });
      setAllAlerts(prev => ({ ...prev, capacity: list }));
    }));

    // 4️⃣ SPEED HISTORY
    const historyQuery = query(collection(firestore, "alerts_history"), orderBy("createdAt", "desc"), limit(10));
    unsubscribers.push(onSnapshot(historyQuery, (snap) => {
      const list = snap.docs.map(d => {
        const x = d.data();
        const dt = x.createdAt?.toDate ? x.createdAt.toDate() : new Date();
        return {
          id: d.id,
          group: "speed",
          type: "danger",
          title: x.title,
          timeObj: dt,
          ...formatDateTime(dt),
          icon: <Gauge size={20} />
        };
      });
      setAllAlerts(prev => ({ ...prev, history: list }));
    }));

    // 5️⃣ LIVE SPEED MONITORING
    const speedRef = ref(rtdb, 'bus_data_v2');
    unsubscribers.push(onValue(speedRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        Object.entries(data).forEach(async ([busKey, busValue]) => {
          const speed = busValue?.current?.speed || 0;
          if (speed > SPEED_THRESHOLD) {
            await addDoc(collection(firestore, "alerts_history"), {
              group: "speed",
              type: "danger",
              title: `Bus ${busKey} Overspeeding: ${speed} km/h`,
              createdAt: serverTimestamp(),
            });
          }
        });
      }
    }));

    return () => unsubscribers.forEach(u => typeof u === 'function' && u());
  }, []);

  const displayAlerts = useMemo(() => {
    return [
      ...allAlerts.rfid, 
      ...allAlerts.complaints, 
      ...allAlerts.history, 
      ...allAlerts.capacity
    ].sort((a, b) => b.timeObj - a.timeObj).slice(0, 15);
  }, [allAlerts]);

  return (
    <div className="active-alerts-container">
      <div 
        className="alerts-header" 
        onClick={() => window.location.href = '/admin/alerts-history'}
        style={{ 
          cursor: 'pointer', 
          transition: 'all 0.3s ease',
          display: 'flex',
          flexDirection: 'column'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <h2 className="alerts-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            Active Alerts <ChevronRight size={18} strokeWidth={3} color="#132677" />
          </h2>
          <span style={{ 
            fontSize: '10px', 
            fontWeight: '800', 
            background: '#132677', 
            color: 'white', 
            padding: '2px 8px', 
            borderRadius: '20px' 
          }}>
            HISTORY
          </span>
        </div>
        <p className="alerts-subtitle">Click to view complete violation records</p>
      </div>

      <div className="alerts-list" style={{ maxHeight: "250px", overflowY: "auto" }}>
        {displayAlerts.length === 0 ? (
          <p className="no-alerts">✅ System Normal</p>
        ) : (
          displayAlerts.map((a) => (
            <div key={a.id} className={`alert-item alert-${a.type}`}>
              <div className="alert-icon">{a.icon}</div>
              <div className="alert-content">
                <h3 className="alert-title-text">{a.title}</h3>
                <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
                    <Calendar size={12} /> {a.dateText}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
                    <Clock size={12} /> {a.timeText}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}