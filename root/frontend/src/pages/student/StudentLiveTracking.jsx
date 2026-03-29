// // frontend/src/pages/student/StudentLiveTracking.jsx
// import React, { useEffect, useState } from "react";
// import StudentSidebar from "../../components/StudentSidebar";
// import Header from "../../components/Header";
// import GoogleMapSection from "../../components/GoogleMap";
// import RoutesPanel from "../../components/RoutesPanel";
// import "../../styles/main.css";

// import { collection, query, where, onSnapshot } from "firebase/firestore";
// import { ref, onValue } from "firebase/database";
// import { firestore, rtdb } from "../../services/firebase";

// function StudentLiveTracking() {
//   const [etaInfo, setEtaInfo] = useState(null);
//   const [activeRoutes, setActiveRoutes] = useState([]);
//   const [liveLocations, setLiveLocations] = useState({});

//   // 1️⃣ ACTIVE ROUTES (Firestore – friend project)
//   useEffect(() => {
//     const q = query(
//       collection(firestore, "routes"),
//       where("status", "==", "active")
//     );

//     const unsub = onSnapshot(q, (snap) => {
//       const routes = snap.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setActiveRoutes(routes);
//     });

//     return () => unsub();
//   }, []);

//   // 2️⃣ LIVE GPS (RTDB – your project)
//   useEffect(() => {
//     const liveRef = ref(rtdb, "bus_data_v2");

//     const unsub = onValue(liveRef, (snap) => {
//       setLiveLocations(snap.val() || {});
//     });

//     return () => unsub();
//   }, []);

//   return (
//     <div className="live-layout">
//       <StudentSidebar />
//       <div className="live-main">
//         <Header />

//         <div className="live-content">
//           <main className="map-area">
//             <GoogleMapSection
//               routes={activeRoutes}
//               liveLocations={liveLocations}
//               onETASelect={setEtaInfo}
//             />

//             {etaInfo && (
//               <div className="eta-box">
//                 <button
//                   className="close-eta"
//                   onClick={() => setEtaInfo(null)}
//                 >
//                   ×
//                 </button>
//                 <strong>{etaInfo.busId}</strong> → {etaInfo.stopName}
//                 <br />
//                 <span className="eta-highlight">
//                   ETA: {etaInfo.etaMinutesLabel}
//                 </span>
//                 <br />
//                 <small>Distance: {etaInfo.distanceKm} km</small>
//               </div>
//             )}
//           </main>

//           <div className="routes-panel-wrapper">
//             <RoutesPanel
//               routes={activeRoutes}
//               liveLocations={liveLocations}
//               etaInfo={etaInfo}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default StudentLiveTracking;

// import React, { useEffect, useState } from "react";
// import StudentSidebar from "../../components/StudentSidebar";
// import Header from "../../components/Header";
// import GoogleMapSection from "../../components/GoogleMap";
// import RoutesPanel from "../../components/RoutesPanel";
// import "../../styles/main.css";

// import { collection, query, where, onSnapshot } from "firebase/firestore";
// import { ref, onValue } from "firebase/database";
// import { firestore, rtdb } from "../../services/firebase";

// function StudentLiveTracking() {
//   const [etaInfo, setEtaInfo] = useState(null);
//   const [activeRoutes, setActiveRoutes] = useState([]);
//   const [liveLocations, setLiveLocations] = useState({});
//   const [selectedBusId, setSelectedBusId] = useState("ALL");

//   /* =========================
//      1️⃣ ACTIVE ROUTES
//   ========================= */
//   useEffect(() => {
//     const q = query(
//       collection(firestore, "routes"),
//       where("status", "==", "active")
//     );

//     const unsub = onSnapshot(q, (snap) => {
//       const routes = snap.docs.map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }));
//       setActiveRoutes(routes);
//     });

//     return () => unsub();
//   }, []);

//   /* =========================
//      2️⃣ LIVE GPS (RTDB)
//   ========================= */
//   useEffect(() => {
//     const liveRef = ref(rtdb, "bus_data_v2");

//     const unsub = onValue(liveRef, (snap) => {
//       setLiveLocations(snap.val() || {});
//     });

//     return () => unsub();
//   }, []);

//   /* =========================
//      3️⃣ FILTER ROUTES ONLY
//      (NEVER FILTER liveLocations)
//   ========================= */
//   const filteredRoutes =
//     selectedBusId === "ALL"
//       ? activeRoutes
//       : activeRoutes.filter(
//           (r) =>
//             r.busId === selectedBusId ||
//             r.id === selectedBusId
//         );

//   return (
//     <div className="live-layout">
//       <StudentSidebar />

//       <div className="live-main">
//         <Header />

//         {/* 🔽 BUS FILTER */}
//         <div style={{ padding: "10px 20px" }}>
//           <label style={{ fontWeight: 600, marginRight: 10 }}>
//             Filter Bus:
//           </label>

//           <select
//             value={selectedBusId}
//             onChange={(e) => setSelectedBusId(e.target.value)}
//             style={{
//               padding: "6px 10px",
//               borderRadius: "6px",
//               border: "1px solid #ccc",
//             }}
//           >
//             <option value="ALL">All buses</option>
//             {activeRoutes.map((r) => (
//               <option key={r.id} value={r.busId || r.id}>
//                 {r.busId || r.id}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="live-content">
//           <main className="map-area">
//             <GoogleMapSection
//               routes={filteredRoutes}     // ✅ filtered
//               liveLocations={liveLocations} // ✅ full data
//               onETASelect={setEtaInfo}
//             />

//             {etaInfo && (
//               <div className="eta-box">
//                 <button
//                   className="close-eta"
//                   onClick={() => setEtaInfo(null)}
//                 >
//                   ×
//                 </button>
//                 <strong>{etaInfo.busId}</strong> → {etaInfo.stopName}
//                 <br />
//                 <span className="eta-highlight">
//                   ETA: {etaInfo.etaMinutesLabel}
//                 </span>
//                 <br />
//                 <small>Distance: {etaInfo.distanceKm} km</small>
//               </div>
//             )}
//           </main>

//           {/* ✅ RESTORED ROUTES PANEL */}
//           <div className="routes-panel-wrapper">
//             <RoutesPanel
//               routes={filteredRoutes}     // ✅ synced with filter
//               liveLocations={liveLocations}
//               etaInfo={etaInfo}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default StudentLiveTracking;




import React, { useEffect, useState } from "react";
import StudentSidebar from "../../components/StudentSidebar";
//import Header from "../../components/stdHeader";
import GoogleMapSection from "../../components/GoogleMap";
import RoutesPanel from "../../components/RoutesPanel";
import "../../styles/main.css";

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { ref, onValue } from "firebase/database";
import { firestore, rtdb } from "../../services/firebase";

function StudentLiveTracking() {
  const [etaInfo, setEtaInfo] = useState(null);
  const [activeRoutes, setActiveRoutes] = useState([]);
  const [liveLocations, setLiveLocations] = useState({});

  // 🔍 SEARCH (now replaced by dropdown)
  const [searchBus, setSearchBus] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(""); // 🆕 dropdown selected routeId

  /* =========================
     1️⃣ ACTIVE ROUTES
  ========================= */
  useEffect(() => {
    const q = query(
      collection(firestore, "routes"),
      where("status", "==", "active")
    );

    const unsub = onSnapshot(q, (snap) => {
      const routes = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setActiveRoutes(routes);
    });

    return () => unsub();
  }, []);

  /* =========================
     2️⃣ LIVE GPS (RTDB)
  ========================= */
  useEffect(() => {
    const liveRef = ref(rtdb, "bus_data_v2");

    const unsub = onValue(liveRef, (snap) => {
      setLiveLocations(snap.val() || {});
    });

    return () => unsub();
  }, []);

  /* =========================
     3️⃣ FILTER LOGIC (SAFE)
     - dropdown selectedRoute → show only that route
     - empty selection → ALL
     - NEVER filter liveLocations
  ========================= */
  const normalizedSearch = searchBus.trim().toLowerCase();

  const filteredRoutes = selectedRoute
    ? activeRoutes.filter((r) => r.id === selectedRoute)
    : !normalizedSearch
    ? activeRoutes
    : activeRoutes.filter(
        (r) =>
          (r.busId || r.id)?.toLowerCase().includes(normalizedSearch)
      );

  return (
    <div className="live-layout">
      <StudentSidebar />

      <div className="live-main">
     {/*    <Header /> */}

        {/* 🔽 DROPDOWN */}
        <div style={{ padding: "10px 20px" }}>
          <label style={{ fontWeight: 600, marginRight: 10 }}>
            Select Route:
          </label>

          <select
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              width: "250px",
            }}
          >
            <option value="">All Routes</option> {/* default */}
            {activeRoutes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.routeName}
              </option>
            ))}
          </select>
        </div>

        <div className="live-content">
          <main className="map-area">
            <GoogleMapSection
  routes={filteredRoutes}       // ✅ filtered routes
  liveLocations={liveLocations} // ✅ full GPS
  onETASelect={setEtaInfo}

  /* 🆕 ENHANCEMENT: selected route for zoom */
  zoomRouteId={selectedRoute || null} // ← NEW prop
/>


            {etaInfo && (
              <div className="eta-box">
                <button
                  className="close-eta"
                  onClick={() => setEtaInfo(null)}
                >
                  ×
                </button>
                <strong>{etaInfo.busId}</strong> → {etaInfo.stopName}
                <br />
                <span className="eta-highlight">
                  ETA: {etaInfo.etaMinutesLabel}
                </span>
                <br />
                <small>Distance: {etaInfo.distanceKm} km</small>
              </div>
            )}
          </main>

          {/* ✅ ROUTES PANEL (UNCHANGED, WORKING) */}
          <div className="routes-panel-wrapper">
            <RoutesPanel
              routes={filteredRoutes}
              liveLocations={liveLocations}
              etaInfo={etaInfo}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentLiveTracking;
