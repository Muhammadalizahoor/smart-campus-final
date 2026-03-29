// import React, { useEffect, useState } from "react";
// import { collection, getDocs, query, where } from "firebase/firestore";
// import { firestore } from "../../services/firebase";// ///frontend//src//components//analytics//SpeedStatsCards.jsx

// export default function SpeedStatsCards() {
//   const [todayCount, setTodayCount] = useState(0);
//   const [monthCount, setMonthCount] = useState(0);

//   useEffect(() => {
//     const loadStats = async () => {
//       const snap = await getDocs(collection(firestore, "speed_events"));

//       const today = new Date().toDateString();
//       const month = new Date().getMonth();
//       const year = new Date().getFullYear();

//       let todayTotal = 0;
//       let monthTotal = 0;

//       snap.forEach(doc => {
//         const d = doc.data();
//         if (!d.timestamp) return;

//         const t = d.timestamp.toDate();
//         if (t.toDateString() === today) todayTotal++;
//         if (t.getMonth() === month && t.getFullYear() === year) {
//           monthTotal++;
//         }
//       });

//       setTodayCount(todayTotal);
//       setMonthCount(monthTotal);
//     };

//     loadStats();
//   }, []);

//   return (
//     <div style={{ display: "flex", gap: "20px", marginBottom: "24px" }}>
//       <div style={cardStyle}>
//         <h3>Today's Overspeed</h3>
//         <p style={numStyle}>{todayCount}</p>
//       </div>

//       <div style={cardStyle}>
//         <h3>This Month</h3>
//         <p style={numStyle}>{monthCount}</p>
//       </div>
//     </div>
//   );
// }

// const cardStyle = {
//   background: "#fff",
//   padding: "16px",
//   borderRadius: "10px",
//   width: "200px",
//   boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
// };

// const numStyle = {
//   fontSize: "28px",
//   fontWeight: "bold"
// };




import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../services/firebase";

export default function SpeedStatsCards() {
  const [todayCount, setTodayCount] = useState(0);
  const [monthCount, setMonthCount] = useState(0);

  useEffect(() => {
    const loadStats = async () => {
      const snap = await getDocs(collection(firestore, "speed_events"));

      const today = new Date().toDateString();
      const month = new Date().getMonth();
      const year = new Date().getFullYear();

      let todayTotal = 0;
      let monthTotal = 0;

      snap.forEach(doc => {
        const d = doc.data();
        if (!d.timestamp) return;

        const t = d.timestamp.toDate();
        if (t.toDateString() === today) todayTotal++;
        if (t.getMonth() === month && t.getFullYear() === year) {
          monthTotal++;
        }
      });

      setTodayCount(todayTotal);
      setMonthCount(monthTotal);
    };

    loadStats();
  }, []);

  return (
    <div className="stats-grid">
      <div className="stat-card highlighted">
        <div className="stat-content">
          <span className="stat-label">Today's Overspeed</span>
          <span className="stat-value">{todayCount}</span>
          <span className="stat-subtitle">incidents recorded</span>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-content">
          <span className="stat-label">This Month</span>
          <span className="stat-value">{monthCount}</span>
          <span className="stat-subtitle">incidents this month</span>
        </div>
      </div>
    </div>
  );
}
