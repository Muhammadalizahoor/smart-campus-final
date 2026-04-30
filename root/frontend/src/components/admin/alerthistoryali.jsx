"use client";

import React, { useEffect, useState, useMemo } from "react";
import Sidebar from "../Sidebar"; 
import { collection, query, getDocs, orderBy, collectionGroup } from "firebase/firestore";
import { firestore } from "../../services/firebase"; 
import { Gauge, AlertTriangle, Users, MessageSquareWarning, Calendar, Filter, Bus, Clock, ChevronRight } from "lucide-react";

export default function AlertsHistoryAli() {
  const [rawAlerts, setRawAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busFilter, setBusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [timeFilter, setTimeFilter] = useState("All");

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        const speedSnap = await getDocs(query(collection(firestore, "alerts_history"), orderBy("createdAt", "desc")));
        const speedList = speedSnap.docs.map(d => ({
          id: d.id, ...d.data(), group: "speed",
          time: d.data().createdAt?.toDate() || new Date()
        }));

        const compSnap = await getDocs(query(collection(firestore, "complaints"), orderBy("submittedOn", "desc")));
        const compList = compSnap.docs.map(d => ({
          id: d.id, ...d.data(), group: "complaint",
          title: `Complaint: ${d.data().category}`,
          time: d.data().submittedOn?.toDate ? d.data().submittedOn.toDate() : new Date(d.data().submittedOn)
        }));

        const rfidSnap = await getDocs(query(collection(firestore, "entry_exit_logs"), orderBy("timestamp", "desc")));
        const rfidList = rfidSnap.docs.filter(d => d.data().error).map(d => ({
          id: d.id, ...d.data(), group: "rfid",
          title: `Security: ${d.data().error.replace(/_/g, ' ')} (RFID: ${d.data().rfid})`,
          time: new Date(d.data().timestamp)
        }));

        const crowdSnap = await getDocs(collectionGroup(firestore, "latest"));
        const crowdList = crowdSnap.docs.filter(d => d.data().currentPassengers > d.data().capacity).map(d => ({
          id: `crowd-${d.id}`, ...d.data(), group: "overcrowd",
          title: `Overcrowded: Bus ${d.data().busId} (${d.data().currentPassengers}/${d.data().capacity})`,
          time: new Date() 
        }));

        setRawAlerts([...speedList, ...compList, ...rfidList, ...crowdList]);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchAllData();
  }, []);

  const filteredAlerts = useMemo(() => {
    return rawAlerts.filter(a => {
      const matchesBus = busFilter === "All" || (a.title && a.title.toLowerCase().includes(busFilter.toLowerCase()));
      const matchesCategory = categoryFilter === "All" || a.group === categoryFilter;
      const now = new Date();
      let matchesTime = true;
      if (timeFilter === "Today") matchesTime = a.time.toDateString() === now.toDateString();
      else if (timeFilter === "Week") { const w = new Date(); w.setDate(now.getDate() - 7); matchesTime = a.time >= w; }
      else if (timeFilter === "Month") matchesTime = a.time.getMonth() === now.getMonth();
      return matchesBus && matchesCategory && matchesTime;
    }).sort((a, b) => b.time - a.time);
  }, [rawAlerts, busFilter, categoryFilter, timeFilter]);

  const groupedAlerts = useMemo(() => {
    const groups = {};
    filteredAlerts.forEach(a => {
      const monthYear = a.time.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) groups[monthYear] = [];
      groups[monthYear].push(a);
    });
    return groups;
  }, [filteredAlerts]);

  return (
    <div className="admin-page-container" style={{ display: "flex", background: "#f4f7fe", minHeight: "100vh" }}>
      <Sidebar />
      <div className="main-content-area" style={{ flex: 1 }}>
        <style>{`
          /* Laptop/Desktop view */
          .main-content-area { padding: 100px 40px 40px 300px; }
          .filter-bar { background: white; padding: 20px; border-radius: 15px; display: flex; gap: 20px; margin-bottom: 30px; }
          
          .history-card { background: white; border-radius: 12px; padding: 15px; margin-bottom: 12px; display: flex; align-items: center; gap: 15px; border-left: 5px solid #132677; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
          .filter-box { display: flex; align-items: center; gap: 8px; background: #f1f5f9; padding: 8px 15px; border-radius: 8px; flex: 1; }
          .filter-box select, .filter-box input { background: transparent; border: none; outline: none; width: 100%; color: #132677; font-weight: 600; }
          .month-label { color: #132677; font-size: 20px; font-weight: 800; margin: 30px 0 15px 0; border-bottom: 2px solid #e2e8f0; }
          .badge { padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
          .badge-speed { background: #fee2e2; color: #ef4444; }
          .badge-rfid { background: #ffedd5; color: #f97316; }
          .badge-complaint { background: #dbeafe; color: #1e40af; }
          .badge-overcrowd { background: #fef3c7; color: #b45309; }

          /* 📱 Mobile Specific Fixes */
          @media screen and (max-width: 768px) {
            .main-content-area { padding: 90px 15px 20px 15px !important; }
            .filter-bar { flex-direction: column !important; gap: 10px !important; padding: 15px !important; }
            .filter-box { width: 100% !important; }
            .history-card { gap: 10px !important; padding: 12px !important; }
            .history-card h4 { font-size: 14px !important; }
            h1 { font-size: 22px !important; text-align: center; }
          }
        `}</style>

        <h1 style={{ color: "#132677", fontWeight: "800", marginBottom: "20px" }}>Violation History Logs</h1>
        
        <div className="filter-bar">
          <div className="filter-box"><Bus size={18} color="#132677"/><input type="text" placeholder="Bus ID..." onChange={(e)=>setBusFilter(e.target.value || "All")}/></div>
          <div className="filter-box"><Filter size={18} color="#132677"/>
            <select onChange={(e)=>setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              <option value="speed">Overspeeding</option>
              <option value="overcrowd">Overcrowding</option>
              <option value="rfid">RFID Security</option>
              <option value="complaint">Complaints</option>
            </select>
          </div>
          <div className="filter-box"><Calendar size={18} color="#132677"/>
            <select onChange={(e)=>setTimeFilter(e.target.value)}>
              <option value="All">All Time</option>
              <option value="Today">Today</option>
              <option value="Week">This Week</option>
              <option value="Month">This Month</option>
            </select>
          </div>
        </div>

        {loading ? <p><b>Loading records...</b></p> : 
          Object.keys(groupedAlerts).map(month => (
            <div key={month}>
              <h2 className="month-label">{month}</h2>
              {groupedAlerts[month].map(a => (
                <div key={a.id} className="history-card">
                  <div style={{ background: '#f1f5f9', padding: '10px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {a.group === "speed" && <Gauge size={22} color="#ef4444"/>}
                    {a.group === "rfid" && <AlertTriangle size={22} color="#f97316"/>}
                    {a.group === "complaint" && <MessageSquareWarning size={22} color="#1e40af"/>}
                    {a.group === "overcrowd" && <Users size={22} color="#b45309"/>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, color: '#1e293b' }}>{a.title}</h4>
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12}/> {a.time.toLocaleString()}
                      </span>
                      <span className={`badge badge-${a.group}`}>{a.group}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        }
      </div>
    </div>
  );
}