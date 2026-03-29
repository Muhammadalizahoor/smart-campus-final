// frontend/src/pages/StudentComplaints.jsx
import React, { useEffect, useState } from "react";
import StudentSidebar from "../components/StudentSidebar";
import { useAuth } from "../contexts/AuthContext";
import {
  createComplaint,
  fetchStudentComplaints,
} from "../api/complaintApi";

import "../styles/student-sidebar.css";
import "../styles/std-complaint.css";

export default function StudentComplaints() {
  const { user } = useAuth();

  const [category, setCategory] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const email = user?.email;
  const name = user?.name;
  const regNo = user?.regNo;

  const studentRfid =
    complaints.length > 0 ? complaints[0].rfid_id : null;

  const loadMyComplaints = async () => {
    if (!email) return;

    setLoadingList(true);
    try {
      const res = await fetchStudentComplaints(email);
      setComplaints(res.data || []);
    } catch (err) {
      console.error("fetchStudentComplaints error:", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadMyComplaints();
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!category) {
      alert("Please select a complaint category.");
      return;
    }
    if (!complaintText.trim()) {
      alert("Please enter a complaint.");
      return;
    }
    if (!email || !name || !regNo) {
      alert("User info missing. Please re-login.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        email,
        name,
        regNo,
        category,
        description: complaintText.trim(),
      };

      await createComplaint(payload);

      setComplaintText("");
      setCategory("");
      await loadMyComplaints();

      alert("Complaint submitted successfully!");
    } catch (err) {
      console.error("createComplaint error:", err);
      alert(
        err.response?.data?.message ||
          "Failed to submit complaint. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#f59e0b";
      case "Resolved":
        return "#16a34a";
      case "In Progress":
        return "#3b82f6";
      case "Dismissed":
        return "#dc2626";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";

    const seconds = value.seconds ?? value._seconds;
    if (typeof seconds === "number") {
      return new Date(seconds * 1000).toLocaleString();
    }

    const parsed = new Date(value);
    return isNaN(parsed) ? "-" : parsed.toLocaleString();
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar - Position Fixed hai */}
      <StudentSidebar />

      {/* ✅ MAIN WRAPPER: Sidebar ke liye 280px padding dedi hai */}
      <div 
        className="student-content-wrapper" 
        style={{ 
            flex: 1, 
            padding: "100px 40px 40px 300px", // Sidebar width + safety gap
            width: "100%",
            boxSizing: "border-box",
            background: "#f8fafc"
        }}
      >
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        
        <h1 style={{ marginBottom: "24px", color: "#1e293b" }}>Submit a Complaint</h1>

        <div
          style={{
            display: "flex",
            gap: "24px",
            marginBottom: "24px",
            flexWrap: "wrap",
          }}
        >
          {/* Complaint Form - LEFT */}
          <div
            style={{
              flex: "2",
              padding: "24px",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              minWidth: "350px",
            }}
          >
            <form onSubmit={handleSubmit}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>Complaint Category</label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "20px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1"
                }}
              >
                <option value="">Select category...</option>
                <option value="Bus Issue">Bus Issue</option>
                <option value="Bus Driver">Bus Driver</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Misbehavior/Harassment">Misbehavior</option>
                <option value="Other">Other</option>
              </select>

              <label style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>Your Complaint</label>
              <textarea
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                style={{ 
                    width: "100%", 
                    height: "150px", 
                    padding: "10px", 
                    borderRadius: "6px", 
                    border: "1px solid #cbd5e1",
                    boxSizing: "border-box" 
                }}
              />

              <button
                type="submit"
                disabled={submitting}
                style={{
                  marginTop: "16px",
                  padding: "12px 24px",
                  background: "#1e40af",
                  color: "white",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: "600",
                  cursor: submitting ? "not-allowed" : "pointer"
                }}
              >
                {submitting ? "Submitting..." : "Submit Complaint"}
              </button>
            </form>
          </div>

          {/* Auto-filled Student Info - RIGHT */}
          <div
            style={{
              flex: "1",
              padding: "24px",
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              minWidth: "250px",
              height: "fit-content",
            }}
          >
            <h3 style={{ marginBottom: "20px", fontWeight: 700 }}>Profile Details</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: 14 }}>
              <div><i className="fa-solid fa-user-circle" style={{marginRight: '10px', color: '#1e40af'}}></i> <strong>Name:</strong> {name || "-"}</div>
              <div><i className="fa-solid fa-envelope" style={{marginRight: '10px', color: '#1e40af'}}></i> <strong>Email:</strong> {email || "-"}</div>
              <div><i className="fa-solid fa-clipboard-list" style={{marginRight: '10px', color: '#1e40af'}}></i> <strong>Reg No:</strong> {regNo || "-"}</div>
              <div><i className="fa-solid fa-id-card" style={{marginRight: '10px', color: '#1e40af'}}></i> <strong>RFID:</strong> {studentRfid || "Not assigned"}</div>
            </div>
          </div>
        </div>

        {/* Complaint History Table */}
        <div
          style={{
            marginTop: "24px",
            padding: "24px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <h3 style={{ marginBottom: "16px" }}>Your Complaints & Status</h3>
          {loadingList ? (
            <p>Loading history...</p>
          ) : complaints.length === 0 ? (
            <p>No complaints submitted yet.</p>
          ) : (
            complaints.map((c) => (
              <div key={c.id} style={{ borderBottom: "1px solid #f1f5f9", padding: "16px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>{c.category}</strong>
                    <span style={{ color: statusColor(c.status), fontWeight: "bold" }}>{c.status}</span>
                </div>
                <p style={{ fontSize: "14px", margin: "8px 0", color: "#475569" }}>{c.description}</p>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>Submitted: {formatDate(c.submittedOn)}</div>
                
                {c.adminReply && (
                  <div style={{ marginTop: 12, padding: "10px", background: "#f8fafc", borderLeft: "4px solid #1e40af", borderRadius: 4 }}>
                    <strong>Admin Reply:</strong>
                    <div style={{ marginTop: 4 }}>{c.adminReply}</div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}