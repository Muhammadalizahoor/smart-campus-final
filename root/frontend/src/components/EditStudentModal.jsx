import React, { useEffect, useState } from "react";
import "../styles/analytics.css"; // frontend//src//components//EditStudentModal.jsx

export default function EditStudentModal({ isOpen, onClose, student, onSave }) {
  const [form, setForm] = useState({
    name: "",
    regNo: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    if (student) {
      setForm({
        name: student.name || "",
        regNo: student.regNo || "",
        phone: student.phone || "",
        password: "",
      });
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form); // parent will send to backend
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3 className="modal-title">Edit Student</h3>

        <form onSubmit={handleSubmit} className="modal-form">
          <label className="modal-label">Name</label>
          <input
            className="modal-input"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <label className="modal-label">Registration No</label>
          <input
            className="modal-input"
            name="regNo"
            value={form.regNo}
            onChange={handleChange}
          />

          <label className="modal-label">Phone</label>
          <input
            className="modal-input"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />

          <label className="modal-label">
            Password (leave blank to keep same)
          </label>
          <input
            className="modal-input"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
