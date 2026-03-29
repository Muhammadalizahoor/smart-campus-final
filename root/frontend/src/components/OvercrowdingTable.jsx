// components/OvercrowdingTable.jsx
"use client";
import React, { useMemo } from "react";

export default function OvercrowdingTable({
  data = [],
  filters = { search: "", status: "all", date: "" }, // filters mein date ko include kiya
  setFilters,
  loading,
}) {
  /* ================= NORMALIZE API RESPONSE ================= */
  const rows = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : [];

  /* ================= SAFE FILTER (UPDATED) ================= */
  const filtered = useMemo(() => {
    const search = (filters?.search || "").toLowerCase().trim();
    const statusFilter = (filters?.status || "all").toLowerCase().trim();
    const dateFilter = filters?.date || ""; // ✅ NAYA DATE FILTER VALUE

    let currentData = rows;

    // 1. Apply Date Filter (Agar koi date select ki gayi hai)
    if (dateFilter) {
      currentData = currentData.filter((r) => {
        // Assuming r.date is in YYYY-MM-DD format, which is standard for <input type="date">
        const rowDate = String(r.date || "").slice(0, 10); // Ensure YYYY-MM-DD format
        return rowDate === dateFilter;
      });
    }

    // 2. Apply Search Filter
    if (search) {
      currentData = currentData.filter((r) => {
        const bus = String(r.busId || "").toLowerCase();
        // Route check removed from search logic as well
        return bus.includes(search);
      });
    }
    
    // 3. Apply Status Filter
    if (statusFilter !== "all") {
      currentData = currentData.filter((r) => {
        const rowStatus = String(r.status || "Normal").toLowerCase();
        return rowStatus.includes(statusFilter); 
      });
    }

    return currentData;
  }, [rows, filters]); // 🛑 filters dependency mein koi change nahi, bas value use ki

  // ✅ HELPER FUNCTION to get the CSS class for status (koi change nahi)
  const getStatusClass = (status) => {
    if (!status) return 'status-default';
    const s = String(status).toLowerCase();
    if (s.includes('normal')) return 'status-normal';
    if (s.includes('moderate')) return 'status-moderate';
    if (s.includes('high')) return 'status-high';
    return 'status-default';
  };

  return (
    <div className="analytics-table-content"> 
      {/* Search, Date, and Status Filters Container (UPDATED) */}
      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        
        {/* 1. Search Input */}
        <input
          value={filters.search}
          onChange={(e) =>
            setFilters({ ...filters, search: e.target.value })
          }
          placeholder="Search by Bus ID..."
          className="table-search"
          style={{ flexGrow: 1 }}
        />

        {/* 2. NAYA DATE FILTER INPUT */}
        <input
          type="date"
          value={filters.date}
          onChange={(e) => 
            setFilters({ ...filters, date: e.target.value })
          }
          className="analysis-select" 
          style={{ flexGrow: 1 }}
        />


        {/* 3. STATUS FILTER SELECT */}
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters({ ...filters, status: e.target.value })
          }
          className="analysis-select" 
          style={{ flexGrow: 1 }}
        >
          <option value="all">All Statuses</option>
          <option value="high">High</option>
          <option value="moderate">Moderate</option>
          <option value="normal">Normal</option>
        </select>
      </div>

      {/* ... rest of the table component ... */}
      {loading ? (
        <div style={{ padding: 18, textAlign: 'center' }}>Loading...</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="overcrowding-data-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>TIME</th>
                {/* ❌ ROUTE column removed from here */}
                <th>BUS ID</th>
                <th>CAPACITY</th>
                <th>ACTUAL</th>
                <th>% OVERCROWDED</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: 16 }}>
                    No data found
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => {
                  /* ================= FIELD MAPPING ================= */
                  const busId = row.busId || "-";
                  const capacity = row.capacity !== undefined ? row.capacity : "-";
                  const actual = row.currentPassengers !== undefined ? row.currentPassengers : row.actual !== undefined ? row.actual : 0;
                  const percent = row.percentOvercrowded !== undefined ? row.percentOvercrowded : row.overcrowdedPercent !== undefined ? row.overcrowdedPercent : 0;
                  const status = row.status || "Normal"; 
                  
                  // Date / Time (SAFE)
                  const date = row.date || "-";
                  const time = row.timestamp || "-";

                  // Get the CSS class for status pill
                  const statusClass = getStatusClass(status);
                  
                  return (
                    <tr key={i}>
                      <td>{date}</td>
                      <td>{time}</td>
                      {/* ❌ row.routeId cell removed from here */}
                      <td>{busId}</td>
                      <td>{capacity}</td>
                      <td>{actual}</td>
                      <td>{percent}</td>
                      <td>
                        <span className={`status-tag ${statusClass}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}