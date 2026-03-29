"use client";

import { useEffect, useState } from "react";
import { firestore } from "../services/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import "../styles/dashboard-stats.css";

// ICON ASSETS (src/assets folder ke andar)
import BusIcon from "../assets/bus.png";
import StudentsIcon from "../assets/students.png";
import DriversIcon from "../assets/drivers.png";
import AlertIcon from "../assets/alert.png";
import ComplaintIcon from "../assets/msg.png";

// Custom Icon Component
const CardIcon = ({ src, alt, className }) => (
  <div className={`stat-icon-img-container ${className}`}>
    <img src={src} alt={alt} className="stat-icon-img" />
  </div>
);

export default function StatsCards() {
  const [activeBuses, setActiveBuses] = useState(0);
  const [travellingStudents, setTravellingStudents] = useState(0);
  const [driversOnDuty, setDriversOnDuty] = useState(0);
  const [complaintsCount, setComplaintsCount] = useState(0);
  const [overcrowdedBusesToday, setOvercrowdedBusesToday] = useState(0);

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

  // ========== ACTIVE BUSES ==========
  useEffect(() => {
    const q = query(collection(firestore, "buses"), where("status", "==", "assigned"));
    const unsub = onSnapshot(q, (snapshot) => setActiveBuses(snapshot.size));
    return () => unsub();
  }, []);

  // ========== STUDENTS TRAVELLING ==========
  useEffect(() => {
    const q = query(collection(firestore, "students"), where("rfid_id", "!=", null));
    const unsub = onSnapshot(q, (snapshot) => setTravellingStudents(snapshot.size));
    return () => unsub();
  }, []);

  // ========== DRIVERS ON DUTY ==========
  useEffect(() => {
    const q = query(collection(firestore, "drivers"), where("status", "==", "assigned"));
    const unsub = onSnapshot(q, (snapshot) => setDriversOnDuty(snapshot.size));
    return () => unsub();
  }, []);

  // ========== COMPLAINTS RECEIVED ==========
  useEffect(() => {
    const unsub = onSnapshot(collection(firestore, "complaints"), (snapshot) =>
      setComplaintsCount(snapshot.size)
    );
    return () => unsub();
  }, []);

  // ========== DAILY OVERCROWDED BUSES ==========
  useEffect(() => {
    const q = query(collection(firestore, "occupancy_events"));
    const unsub = onSnapshot(q, (snapshot) => {
      let count = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        // today + high overcrowding
        if (data.date === todayStr && (data.status === "High" || data.percentOvercrowded > 0)) {
          count += 1;
        }
      });
      setOvercrowdedBusesToday(count);
    });
    return () => unsub();
  }, [todayStr]);

  // ========== STATS ARRAY ==========
  const stats = [
    { label: "Total Active Buses", value: activeBuses, IconSrc: BusIcon, IconClass: "icon-bus" },
    { label: "Students Travelling", value: travellingStudents, IconSrc: StudentsIcon, IconClass: "icon-students" },
    { label: "Drivers on Duty", value: driversOnDuty, IconSrc: DriversIcon, IconClass: "icon-drivers" },
    { label: "Overcrowded Buses Today", value: overcrowdedBusesToday, IconSrc: AlertIcon, IconClass: "icon-alert" },
    { label: "Complaints Received", value: complaintsCount, IconSrc: ComplaintIcon, IconClass: "icon-complaint" },
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, idx) => (
        <div key={idx} className="stat-card">
          {/* Icon */}
          <div className="stat-icon-wrapper">
            <CardIcon src={stat.IconSrc} alt={stat.label} className={stat.IconClass} />
          </div>

          {/* Label & Value */}
          <div className="card-content">
            <p className="stat-label">{stat.label}</p>
            <p className="stat-value">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
