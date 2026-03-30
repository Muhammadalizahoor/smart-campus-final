"use client";
import React, { useEffect, useState } from "react";
import StudentSidebar from "../components/StudentSidebar";
import { useAuth } from "../contexts/AuthContext";
import { createComplaint, fetchStudentComplaints } from "../api/complaintApi";
import "../styles/student-sidebar.css";
import "../styles/std-complaint.css";

export default function StudentComplaints() {
  const { user, loading: authLoading } = useAuth();

  const [category, setCategory] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [complaints, setComplaints] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const email = user?.email;
  const name = user?.name;
  const regNo = user?.regNo;

  // ✅ MAZBOOT DATE FORMATTER: "Invalid Date" ko khatam karne ke liye
  const formatDate = (value) => {
    if (!value) return "Just now";

    try {
      // 1. Agar Firebase Timestamp hai (seconds wala format)
      const seconds = value.seconds || value._seconds;
      if (typeof seconds === "number") {
        return new Date(seconds * 1000).toLocaleString();
      }

      // 2. Agar value direct Date object ya valid date string hai
      const parsed = new Date(value);
      if (!isNaN(parsed.getTime())) {
        return parsed.toLocaleString();
      }
    } catch (e) {
      console.error("Date formatting error:", e);
    }

    return "Recent"; // Fallback agar kuch bhi kaam na kare
  };

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
    if (!authLoading && email) {
      loadMyComplaints();
    }
  }, [email, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !complaintText.trim()) {
      alert("Please fill all fields.");
      return;
    }
    if (!email || !name || !regNo) {
      alert("Session expired. Please re-login.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = { email, name, regNo, category, description: complaintText.trim() };
      await createComplaint(payload);
      setComplaintText("");
      setCategory("");
      await loadMyComplaints();
      alert("Complaint submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h2>Loading Profile Details...</h2>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <StudentSidebar />
      <div className="student-content-wrapper" style={{ flex: 1, padding: "100px 40px 40px 300px", background: "#f8fafc" }}>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
        <h1 style={{ marginBottom: "24px", color: "#1e293b" }}>Submit a Complaint</h1>

        <div style={{ display: "flex", gap: "24px", marginBottom: "24px", flexWrap: "wrap" }}>
          {/* Form Section */}
          <div style={{ flex: "2", padding: "24px", background: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", minWidth: "350px" }}>
            <form onSubmit={handleSubmit}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>Complaint Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "20px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                <option value="">Select category...</option>
                <option value="Bus Issue">Bus Issue</option>
                <option value="Bus Driver">Bus Driver</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Misbehavior/Harassment">Misbehavior</option>
                <option value="Other">Other</option>
              </select>

              <label style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>Your Complaint</label>
              <textarea value={complaintText} onChange={(e) => setComplaintText(e.target.value)} style={{ width: "100%", height: "150px", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
              <button type="submit" disabled={submitting} style={{ marginTop: "16px", padding: "12px 24px", background: "#1e40af", color: "white", borderRadius: "8px", border: "none", fontWeight: "600", cursor: submitting ? "not-allowed" : "pointer" }}>
                {submitting ? "Submitting..." : "Submit Complaint"}
              </button>
            </form>
          </div>

          {/* Profile Section */}
          <div style={{ flex: "1", padding: "24px", background: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", minWidth: "250px", height: "fit-content" }}>
            <h3 style={{ marginBottom: "20px", fontWeight: 700 }}>Profile Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: 14 }}>
              <div><i className="fa-solid fa-user-circle" style={{marginRight: '10px', color: '#1e40af'}}></i> <strong>Name:</strong> {name || "Muhammad Ali"}</div>
              <div><i className="fa-solid fa-envelope" style={{marginRight: '10px', color: '#1e40af'}}></i> <strong>Email:</strong> {email || "-"}</div>
              <div><i className="fa-solid fa-clipboard-list" style={{marginRight: '10px', color: '#1e40af'}}></i> <strong>Reg No:</strong> {regNo || "-"}</div>
              <div><i className="fa-solid fa-id-card" style={{marginRight: '10px', color: '#1e40af'}}></i> <strong>RFID:</strong> {complaints[0]?.rfid_id || "Not assigned"}</div>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div style={{ marginTop: "24px", padding: "24px", background: "white", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <h3 style={{ marginBottom: "16px" }}>Your Complaints & Status</h3>
          {loadingList ? <p>Loading history...</p> : complaints.length === 0 ? <p>No complaints submitted yet.</p> : 
            complaints.map((c) => (
              <div key={c.id} style={{ borderBottom: "1px solid #f1f5f9", padding: "16px 0" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <strong>{c.category}</strong>
                    <span style={{ color: "#f59e0b", fontWeight: "bold" }}>{c.status}</span>
                </div>
                <p style={{ fontSize: "14px", margin: "8px 0", color: "#475569" }}>{c.description}</p>
                {/* ✅ UPDATED DATE CALL */}
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                  Submitted: {formatDate(c.submittedOn || c.createdAt)}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}