import React, { useEffect, useState } from "react";
import axios from "axios";    ///frontend//src//components//analytics//SpeedEventsTable.jsx
 
export default function SpeedEventsTable() {
  const [events, setEvents] = useState([]);          // ALL events
  const [filteredEvents, setFilteredEvents] = useState([]); // FILTERED
  const [search, setSearch] = useState("");

  // ================= LOAD DATA =================
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/speed/events");
        const data = res.data.events || [];
        setEvents(data);
        setFilteredEvents(data);
      } catch (err) {
        console.error("Failed to load speed events", err);
      }
    };

    loadEvents();
  }, []);

  // ================= SEARCH =================
  useEffect(() => {
    if (!search) {
      setFilteredEvents(events);
    } else {
      const q = search.toLowerCase();
      setFilteredEvents(
        events.filter(
          (e) =>
            e.busId?.toLowerCase().includes(q) ||
            e.roadName?.toLowerCase().includes(q)
        )
      );
    }
  }, [search, events]);

  // ================= UI =================
  return (
    <div style={{ background: "#fff", padding: "16px", borderRadius: "10px" }}>
      <h3 style={{ marginBottom: "12px" }}>Speed Events</h3>

      <input
        type="text"
        placeholder="Search by Bus ID or Road"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          marginBottom: "12px",
          padding: "8px",
          width: "100%",
        }}
      />

      <table width="100%" border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Date</th>
            <th>Road</th>
            <th>Bus</th>
            <th>Limit</th>
            <th>Speed</th>
          </tr>
        </thead>

        <tbody>
          {filteredEvents.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No speed events found
              </td>
            </tr>
          ) : (
            filteredEvents.map((e, i) => (
              <tr key={i}>
                <td>{new Date(e.timestamp?.toDate?.() || e.timestamp).toLocaleString()}</td>
                <td>{e.roadName}</td>
                <td>{e.busId}</td>
                <td>{e.speedLimit}</td>
                <td style={{ color: "red", fontWeight: "bold" }}>
                  {e.actualSpeed}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
