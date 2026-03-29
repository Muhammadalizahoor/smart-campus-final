import React, { useState, useEffect } from "react"; // frontend//src//components//AssignRFIDModal.jsx
import "../styles/analytics.css"; // for modal styles we'll add

export default function AssignRFIDModal({
  isOpen,
  onClose,
  student,
  rfids,
  onSave,
}) {
  const [selectedRFID, setSelectedRFID] = useState("");

  useEffect(() => {
    if (student) {
      setSelectedRFID(student.rfid_id || "");
    }
  }, [student]);

  if (!isOpen || !student) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3 className="modal-title">
          {student.rfid_id ? "Edit RFID" : "Assign RFID"}
        </h3>

        <p className="modal-subtitle">
          Student: <strong>{student.name}</strong> ({student.regNo})
        </p>

        <label className="modal-label">Select RFID</label>
        <select
          className="modal-select"
          value={selectedRFID}
          onChange={(e) => setSelectedRFID(e.target.value)}
        >
          <option value="">— Unassign RFID —</option>
          {rfids.map((r) => (
            <option key={r.id} value={r.value}>
              {r.value}
            </option>
          ))}
        </select>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() => onSave(selectedRFID || null)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
