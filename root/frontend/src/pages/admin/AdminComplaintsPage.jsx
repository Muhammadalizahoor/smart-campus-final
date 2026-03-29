// // frontend/src/pages/admin/AdminComplaintsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
// Added Clock and CheckCircle for more relevant icons
import { Search, Eye, Trash2, AlertTriangle, Clock, CheckCircle, Bus } from "lucide-react"; 
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import { fetchAllComplaints, deleteComplaint } from "../../api/complaintApi";
import "../../styles/admin-layout.css";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading, setLoading] = useState(true);

  // All unique categories for the filter
  const allCategories = useMemo(() => {
    const categories = new Set((complaints || []).map((c) => c.category).filter(Boolean));
    return ["All Categories", ...Array.from(categories)];
  }, [complaints]);

  // All available statuses for the filter (as requested: Resolved, Pending, In Progress, Dismissed)
  const allStatuses = ["All Status", "Resolved", "Pending", "In Progress", "Dismissed"];

  // ✅ FIX: Firestore Timestamp-safe formatter (ONLY DATE FIX)
  const formatFirestoreDate = (value) => {
    if (!value) return "-";

    const seconds = value.seconds ?? value._seconds;
    if (typeof seconds === "number") {
      return new Date(seconds * 1000).toLocaleString();
    }

    const parsed = new Date(value);
    return isNaN(parsed) ? "-" : parsed.toLocaleString();
  };

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetchAllComplaints();
      setComplaints(res.data || []);
    } catch (err) {
      console.error("Error fetching complaints:", err);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const filteredComplaints = useMemo(() => {
    return (complaints || []).filter((c) => {
      const term = searchTerm.toLowerCase();
      
      // ✅ LOGIC UNCHANGED: Filtering by name, regNo, or category (for search bar)
      const matchesSearch =
        c.name?.toLowerCase().includes(term) ||
        c.regNo?.toLowerCase().includes(term) ||
        c.category?.toLowerCase().includes(term);

      // ✅ LOGIC UNCHANGED: Filtering by category dropdown
      const matchesCategory =
        categoryFilter === "All Categories" || c.category === categoryFilter;

      // ✅ LOGIC UNCHANGED: Filtering by status dropdown
      const matchesStatus =
        statusFilter === "All Status" || c.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [complaints, searchTerm, categoryFilter, statusFilter]);

  const getStatusBadgeClass = (status) => {
    // ✅ LOGIC UNCHANGED: Only class names are updated to use 'com-' prefix
    switch (status) {
      case "Pending":
        return "com-status-pill com-status-pending";
      case "In Progress":
        return "com-status-pill com-status-inprogress";
      case "Resolved":
        return "com-status-pill com-status-resolved";
      case "Dismissed":
        return "com-status-pill com-status-dismissed";
      default:
        return "com-status-pill";
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this complaint?")) return;
    try {
      await deleteComplaint(id);
      await loadComplaints();
    } catch (err) {
      console.error("Delete complaint error:", err);
      alert("Failed to delete complaint.");
    }
  };

  // ✅ KPIs updated with relevant icons and icon classes for CSS coloring
  const speedStats = [
    {
      icon: <AlertTriangle className="w-8 h-8" />,
      iconClass: "total",
      title: "Total Complaints",
      value: complaints.length.toString(),
      
    },
    {
      icon: <Clock className="w-8 h-8" />,
      iconClass: "pending",
      title: "Pending Complaints",
      value: complaints.filter((c) => c.status === "Pending").length.toString(),
      
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      iconClass: "resolved",
      title: "Resolved Complaints",
      value: complaints.filter((c) => c.status === "Resolved").length.toString(),
      
    },
    {
      icon: <Bus className="w-8 h-8" />,
      iconClass: "bus",
      title: "Bus-related",
      value: complaints.filter((c) =>
        (c.category || "").toLowerCase().includes("bus")
      ).length.toString(),
      
    },
  ];

  return (
    <div>
      <Header />
      <Sidebar />

      {/* ✅ CLASS CHANGE */}
      <div className="com-admin-content-wrapper">

        {/* Stats cards */}
        {/* ✅ CLASS CHANGE and inline styles removed */}
        <div className="com-kpi-cards-row">
          {speedStats.map((stat, idx) => (
            <div className="com-kpi-card" key={idx}>
              {/* ✅ CLASS CHANGE for icon container */}
              <div className={`com-kpi-card-icon ${stat.iconClass}`}>{stat.icon}</div>
              <p className="com-kpi-card-title">
                {stat.title}
              </p>
              <p className="com-kpi-card-value">{stat.value}</p>
              <p className="com-kpi-card-subtitle">
                {stat.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* Complaints Log */}
        {/* ✅ CLASS CHANGE and inline styles removed */}
        <div className="com-complaints-log-container">
          {/* ✅ CLASS CHANGE */}
          <h2 className="com-complaints-log-header">
            Complaints Log
          </h2>

          {/* New Search and Filters Row */}
          {/* ✅ NEW JSX ADDED, connects to EXISTING state/handlers */}
          <div className="com-filter-controls-row">
            <div className="com-search-input-group">
              <Search className="com-search-icon" size={18} />
              <input
                type="text"
                placeholder="Search by Student Name, ID, or Category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="com-filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <select
              className="com-filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {allStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          {/* End Search and Filters */}

          {loading ? (
            <div style={{ padding: "20px 10px" }}>Loading complaints...</div>
          ) : filteredComplaints.length === 0 ? (
            <div style={{ padding: "20px 10px", fontSize: 14, color: "#6b7280" }}>
              No complaints found.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              {/* ✅ CLASS CHANGE */}
              <table className="com-analytics-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Category</th>
                    <th>Submitted On</th>
                    <th>Status</th>
                    <th style={{ textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((c) => (
                    <tr key={c.id}>
                      {/* ✅ CLASS CHANGE */}
                      <td className="com-student-info">
                        <div>{c.name || 'N/A'}</div>
                        <div>{c.regNo || 'N/A'}</div>
                      </td>
                      <td>{c.category || 'Other'}</td>

                      {/* ✅ ONLY FIXED LINE */}
                      <td>{formatFirestoreDate(c.submittedOn)}</td>

                      <td>
                        {/* ✅ CLASS CHANGE: using getStatusBadgeClass which returns 'com-status-pill...' */}
                        <span className={getStatusBadgeClass(c.status || 'Pending')}>
                          {c.status || "Pending"}
                        </span>
                      </td>
                      {/* ✅ CLASS CHANGE and inline styles removed */}
                      <td className="com-action-buttons" style={{ textAlign: "center" }}>
                        <button
                          onClick={() =>
                            (window.location.href = `/admin/complaints/${c.id}`)
                          }
                          title="View / update"
                        >
                          <Eye size={18} color="#4f46e5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          title="Delete"
                        >
                          <Trash2 size={18} color="#dc2626" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}