import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/analytics.css"; // Or any clean table UI you prefer
import { createStudentAPI, getStudentsAPI, getEntryLogsAPI } from "../services/studentApi";

export default function Students() {
  const [activeTab, setActiveTab] = useState("students"); // students | logs
  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    regNo: "",
    phone: "",
    password: "",
    rfid_id: "",
  });

  // Load Students
  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const data = await getStudentsAPI();
    setStudents(data || []);
  };

  // Load Entry Logs
  const loadLogs = async () => {
    const data = await getEntryLogsAPI();
    setLogs(data || []);
  };

  // Handle Add Student form input
  const handleInput = (e) => {
    setNewStudent({ ...newStudent, [e.target.name]: e.target.value });
  };

  // Submit new student
  const submitStudent = async () => {
    try {
      await createStudentAPI(newStudent);
      setShowModal(false);
      loadStudents();

      alert("Student created successfully ✔");
      setNewStudent({
        name: "",
        email: "",
        regNo: "",
        phone: "",
        password: "",
        rfid_id: "",
      });
    } catch (err) {
      alert(err.response?.data?.message || "Error creating student");
    }
  };

  // Filter Students
  const filteredStudents = students.filter((s) =>
    `${s.name} ${s.regNo} ${s.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />

      <div className="page-container">
        <h2 className="page-title">Student Management</h2>

        {/* -------------------- TABS -------------------- */}
        <div className="tabs-container">
          <button
            className={activeTab === "students" ? "tab active" : "tab"}
            onClick={() => setActiveTab("students")}
          >
            Registered Students
          </button>

          <button
            className={activeTab === "logs" ? "tab active" : "tab"}
            onClick={() => {
              setActiveTab("logs");
              loadLogs();
            }}
          >
            Students Entry/Exit Log
          </button>
        </div>

        {/* -------------------- STUDENT LIST TAB -------------------- */}
        {activeTab === "students" && (
          <>
            <div className="top-bar">
              <input
                type="text"
                placeholder="Search by Name, ID, Email..."
                className="search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button className="add-btn" onClick={() => setShowModal(true)}>
                + Add Student
              </button>
            </div>

            <table className="styled-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Reg No</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>RFID</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, index) => (
                  <tr key={index}>
                    <td>{s.name}</td>
                    <td>{s.regNo}</td>
                    <td>{s.email}</td>
                    <td>{s.phone}</td>
                    <td>{s.rfid_id || "Not Assigned"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* -------------------- ENTRY / EXIT LOG TAB -------------------- */}
        {activeTab === "logs" && (
          <table className="styled-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Reg No</th>
                <th>RFID</th>
                <th>Bus</th>
                <th>Date/Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index}>
                  <td>{log.name}</td>
                  <td>{log.regNo}</td>
                  <td>{log.rfid}</td>
                  <td>{log.busNumber}</td>
                  <td>{log.timestamp}</td>
                  <td>{log.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* -------------------- ADD STUDENT MODAL -------------------- */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3>Add New Student</h3>

              <input
                name="name"
                placeholder="Full Name"
                onChange={handleInput}
              />

              <input
                name="email"
                placeholder="Email"
                onChange={handleInput}
              />

              <input
                name="regNo"
                placeholder="Registration Number"
                onChange={handleInput}
              />

              <input
                name="phone"
                placeholder="Phone Number"
                onChange={handleInput}
              />

              <input
                name="password"
                placeholder="Password"
                onChange={handleInput}
              />

              <input
                name="rfid_id"
                placeholder="Assign RFID"
                onChange={handleInput}
              />

              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className="submit-btn" onClick={submitStudent}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
