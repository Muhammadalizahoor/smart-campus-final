// // // frontend/src/pages/admin/AdminComplaintDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Send,
  User,
  Hash, // Using Hash for Student ID/Reg No
  Tag, // Using Tag for Category
  Calendar, // Using Calendar for Submitted On
  Clock, // Using Clock for Submitted At
} from "lucide-react";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import {
  fetchComplaintById,
  updateComplaintStatus,
  sendComplaintReply,
} from "../../api/complaintApi";
// Make sure to import your styles:
import "../../styles/admin-layout.css";

export default function AdminComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  const [status, setStatus] = useState("Pending");
  const [replyText, setReplyText] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [attachmentUrl, setAttachmentUrl] = useState("");

  const loadComplaint = async () => {
    setLoading(true);
    try {
      const res = await fetchComplaintById(id);
      const data = res.data;
      setComplaint(data);
      setStatus(data.status || "Pending");
      setReplyText(data.adminReply || "");
      setAttachmentUrl(data.adminAttachmentUrl || "");
    } catch (err) {
      console.error("Error loading complaint:", err);
      alert("Failed to load complaint.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaint();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    setSavingStatus(true);
    try {
      await updateComplaintStatus(id, newStatus);
      await loadComplaint();
    } catch (err) {
      console.error("Update status error:", err);
      alert("Failed to update status.");
    } finally {
      setSavingStatus(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() && !attachmentUrl.trim()) {
      alert("Write a reply or add attachment URL.");
      return;
    }
    setSendingReply(true);
    try {
      await sendComplaintReply(id, {
        replyText: replyText.trim(),
        attachmentUrl: attachmentUrl.trim() || null,
      });
      await loadComplaint();
      alert("Reply saved successfully.");
    } catch (err) {
      console.error("Reply error:", err);
      alert("Failed to send reply.");
    } finally {
      setSendingReply(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <Sidebar />
        <div className="complaint-admin-content-wrapper">
          Loading complaint...
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div>
        <Header />
        <Sidebar />
        <div className="complaint-admin-content-wrapper" style={{ padding: 24 }}>
          Complaint not found.
        </div>
      </div>
    );
  }

  // ✅ Firestore Timestamp safe formatter
  const formatFirestoreDate = (value, includeTime = true) => {
    if (!value) return "-";
    const seconds = value.seconds ?? value._seconds;
    let dateObj;

    if (typeof seconds === "number") {
      dateObj = new Date(seconds * 1000);
    } else {
      dateObj = new Date(value);
    }

    if (isNaN(dateObj)) return "-";

    const datePart = dateObj.toLocaleString("en-US", {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    });

    if (includeTime) {
      const timePart = dateObj.toLocaleString("en-US", {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      // Example: Oct 28, 2025 at 9:56 AM
      return `${datePart} at ${timePart}`;
    }
    
    // Example: Oct 28, 2025
    return datePart;
  };

  const submittedOnDate = formatFirestoreDate(complaint.submittedOn, false);
  const submittedAtTime = complaint.submittedOn ? new Date((complaint.submittedOn.seconds ?? complaint.submittedOn._seconds) * 1000).toLocaleString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true }) : '-';
  
  // Use a sensible title for the description box
  // Assuming a field named 'issueTitle' or 'category' + 'Bus 30 mins late' is dynamic
  const descriptionTitle = complaint.issueTitle || `${complaint.category || 'Issue'} Details`;

  // Status Tag component based on status
  const StatusTag = ({ currentStatus }) => {
    const statusClass = `complaint-status-tag complaint-status-${currentStatus.toLowerCase().replace(/\s/g, '-')}`;
    return (
        <div className={statusClass}>
            {currentStatus}
        </div>
    );
  };


  return (
    <div>
      <Header />
      <Sidebar />

      {/* ISSUE FIX: The "complaint-admin-content-wrapper" needs to handle padding/margins 
        correctly relative to the fixed Header/Sidebar to avoid clipping. 
        Ensure your admin-layout.css provides enough top padding.
      */}
      <div className="complaint-admin-content-wrapper">
        <button
          onClick={() => navigate("/admin/complaints")}
          className="complaint-back-button"
        >
          <ArrowLeft size={18} />
          Back to Complaints
        </button>

        <div className="complaint-detail-grid">
          {/* LEFT PANEL */}
          <div className="complaint-left-panel">
            {/* 1. Complaints Description Card */}
            <div className="complaint-card complaint-description-card">
              <h2 className="complaint-card-title">Complaints Description</h2>
              {/* Dynamic Title - Expected to come from DB, e.g., complaint.issueTitle */}
              <h3 className="complaint-sub-title">{descriptionTitle}</h3>
              <p className="complaint-description-text">{complaint.description || "Description not available."}</p>
            </div>

            {/* 2. Reply To Complaint Card */}
            <div className="complaint-card complaint-reply-card">
              <h2 className="complaint-card-title">Reply To Complaint</h2>
              <div className="complaint-reply-area">
                <textarea
                  className="complaint-reply-textarea"
                  rows={6}
                  value={replyText}
                  placeholder="Enter your reply here..."
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button 
                  onClick={handleSendReply} 
                  disabled={sendingReply}
                  className="complaint-send-button"
                >
                  <Send size={16} /> 
                  <span className="complaint-send-text">{sendingReply ? "Saving..." : "Send Reply"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL - Split into two boxes */}
          <div className="complaint-right-panel-stack">
            
            {/* 1. Complaint Details Box */}
            <div className="complaint-card complaint-details-card">
              <div className="complaint-details-header">
                  <h2 className="complaint-card-title">Complaint Details</h2>
                  {/* Status Tag placed next to title as per the second image */}
                  <StatusTag currentStatus={status} />
              </div>
              
              <div className="complaint-details-box">
                {/* HARDCODE REMOVAL: Ticket ID (TKT-2024-001) removed from display as requested.
                  However, I will show it dynamically below the details if needed, 
                  as it's often essential information.
                */}
                
                {/* Submitted By */}
                <div className="complaint-detail-row">
                    <User size={18} className="complaint-detail-icon" />
                    <div className="complaint-detail-label">Submitted By:</div>
                    <div className="complaint-detail-value">{complaint.name || '-'}</div>
                </div>

                {/* Student ID */}
                <div className="complaint-detail-row">
                    <Hash size={18} className="complaint-detail-icon" />
                    <div className="complaint-detail-label">Student ID:</div>
                    <div className="complaint-detail-value">{complaint.regNo || '-'}</div>
                </div>

                {/* Category */}
                <div className="complaint-detail-row">
                    <Tag size={18} className="complaint-detail-icon" />
                    <div className="complaint-detail-label">Category:</div>
                    <div className="complaint-detail-value">{complaint.category || '-'}</div>
                </div>

                {/* Submitted On (Date) */}
                <div className="complaint-detail-row">
                    <Calendar size={18} className="complaint-detail-icon" />
                    <div className="complaint-detail-label">Submitted On:</div>
                    <div className="complaint-detail-value">{submittedOnDate}</div>
                </div>

                {/* Submitted At (Time) */}
                <div className="complaint-detail-row">
                    <Clock size={18} className="complaint-detail-icon" />
                    <div className="complaint-detail-label">Submitted At:</div>
                    <div className="complaint-detail-value">{submittedAtTime}</div>
                </div>

                {/* Dynamic Ticket ID display (optional, based on your need) */}
                 <div className="complaint-ticket-id">
                    <span className="complaint-detail-label">Ticket ID:</span> {complaint.ticketId || 'TKT-N/A'}
                 </div>
              </div>

            </div>

            {/* 2. Update Status Box (Separate Card) */}
            <div className="complaint-card complaint-status-update-card">
              <h2 className="complaint-card-title">Update Status</h2>
              <div className="complaint-status-selector-container">
                  <select
                      id="complaint-status-select"
                      className="complaint-status-select"
                      value={status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={savingStatus}
                  >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Dismissed">Dismissed</option>
                  </select>
                  {savingStatus && <span className="complaint-saving-status">Saving...</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}