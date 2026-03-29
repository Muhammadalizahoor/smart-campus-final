import React, { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import {
  createStudent,
  fetchStudents,
  fetchEntryExitLogs,
  fetchAvailableRFIDs,
  assignRFID,
  updateStudent,
  deleteStudent,
} from "../api/studentApi";
import AssignRFIDModal from "../components/AssignRFIDModal";
import EditStudentModal from "../components/EditStudentModal";
import "../styles/analytics.css";

export default function StudentActivityLog() {
  const [activeTab, setActiveTab] = useState("registered");

  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    regNo: "",
    phone: "",
    password: "",
    rfid_id: "",
  });

  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [rfids, setRfids] = useState([]);

  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [search, setSearch] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showRFIDModal, setShowRFIDModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [logSort, setLogSort] = useState("date_desc");

  /* ---------------- LOAD DATA ---------------- */
  const loadStudents = async () => {
    setLoadingStudents(true);
    try {
      const res = await fetchStudents();
      setStudents(res.data.students || []);
    } catch (e) { console.error(e); }
    setLoadingStudents(false);
  };

  const loadRFIDs = async () => {
    try {
      const res = await fetchAvailableRFIDs();
      setRfids(res.data.rfids || []);
    } catch (e) { console.error(e); }
  };

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetchEntryExitLogs();
      setLogs(res.data.logs || []);
    } catch (e) { console.error(e); }
    setLoadingLogs(false);
  };

  useEffect(() => {
    loadStudents();
    loadRFIDs();
  }, []);

  useEffect(() => {
    if (activeTab === "logs") loadLogs();
  }, [activeTab]);

  /* ---------------- ADD STUDENT ---------------- */
  const handleNewChange = (e) => {
    setNewStudent({ ...newStudent, [e.target.name]: e.target.value });
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    await createStudent({
      ...newStudent,
      confirmPassword: newStudent.password,
    });
    setNewStudent({
      name: "",
      email: "",
      regNo: "",
      phone: "",
      password: "",
      rfid_id: "",
    });
    loadStudents();
    loadRFIDs();
  };

  /* ---------------- DELETE STUDENT ---------------- */
  const handleDelete = async (email) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await deleteStudent(email);
        loadStudents();
        loadRFIDs();
      } catch (error) {
        console.error("Delete failed", error);
      }
    }
  };

  /* ---------------- SEARCH & SORT LOGIC (FIXED) ---------------- */
  const filteredItems = useMemo(() => {
    const lowerSearch = search.toLowerCase();

    // Agar Registered Students wala tab hai
    if (activeTab === "registered") {
      return students.filter(s => 
        (s.name || "").toLowerCase().includes(lowerSearch) ||
        (s.email || "").toLowerCase().includes(lowerSearch) ||
        (s.regNo || "").toLowerCase().includes(lowerSearch)
      );
    }

    // Agar Logs wala tab hai
    if (activeTab === "logs") {
      let list = logs.filter(log => 
        (log.studentName || "").toLowerCase().includes(lowerSearch) ||
        (log.busNumber || "").toLowerCase().includes(lowerSearch)
      );

      list.sort((a, b) =>
        logSort === "date_desc"
          ? new Date(b.timestamp) - new Date(a.timestamp)
          : new Date(a.timestamp) - new Date(b.timestamp)
      );
      return list;
    }

    return [];
  }, [logs, students, search, logSort, activeTab]);

  /* ---------------- RENDER ---------------- */
  return (
    <div>
      <Header />
      <Sidebar />

      <div className="admin-content-wrapper">
        <div className="analysis-topbar">
          <div className="analysis-tabs">
            <button
              className={`analysis-tab ${activeTab === "registered" ? "analysis-tab-active" : ""}`}
              onClick={() => setActiveTab("registered")}
            >
              Registered Students
            </button>
            <button
              className={`analysis-tab ${activeTab === "logs" ? "analysis-tab-active" : ""}`}
              onClick={() => setActiveTab("logs")}
            >
              Students Entry/Exit Log
            </button>
          </div>

          <input
            className="analysis-search"
            placeholder="Search by name, email, bus..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ================= REGISTERED STUDENTS ================= */}
        {activeTab === "registered" && (
          <>
            <div className="card add-student-card">
              <h3 className="card-title">Add / Register Student</h3>
              <form className="student-form" onSubmit={handleCreateStudent}>
                <input className="student-input" placeholder="Student Name" name="name" value={newStudent.name} onChange={handleNewChange} />
                <input className="student-input" placeholder="Email" name="email" value={newStudent.email} onChange={handleNewChange} />
                <input className="student-input" placeholder="Registration No" name="regNo" value={newStudent.regNo} onChange={handleNewChange} />
                <input className="student-input" placeholder="Phone" name="phone" value={newStudent.phone} onChange={handleNewChange} />
                <input className="student-input" placeholder="Password" name="password" type="password" value={newStudent.password} onChange={handleNewChange} />

                <select className="student-input" name="rfid_id" value={newStudent.rfid_id} onChange={handleNewChange}>
                  <option value="">(Optional) Assign RFID</option>
                  {rfids.map((r) => (
                    <option key={r.id} value={r.value}>{r.value}</option>
                  ))}
                </select>

                <button className="btn-primary">Save Student</button>
              </form>
            </div>

            <div className="card">
              <h3 className="card-title">Registered Students</h3>
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Name</th><th>Reg No</th><th>Email</th><th>Phone</th><th>RFID</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td><td>{s.regNo}</td><td>{s.email}</td><td>{s.phone || "-"}</td><td>{s.rfid_id || "Not assigned"}</td>
                      <td>
                        <button onClick={() => { setSelectedStudent(s); setShowRFIDModal(true); }}>Edit RFID</button>
                        <button onClick={() => { setSelectedStudent(s); setShowEditModal(true); }}>Edit</button>
                        <button onClick={() => handleDelete(s.email)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ================= ENTRY / EXIT LOGS ================= */}
        {activeTab === "logs" && (
          <div className="card">
            <h3 className="card-title">Routes Log</h3>
            <table className="analytics-table">
              <thead>
                <tr>
                  {/* ✅ HEADING CHANGED TO NAMES */}
                  <th>Names</th>
                  <th>Bus Number</th>
                  <th>Date / Time</th>
                  <th>Entry / Exit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((log) => (
                  <tr key={log.id}>
                    <td>{log.studentName || "-"}</td>
                    <td>{log.busNumber}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>{log.status}</td>
                    <td>
                      {log.error ? (
                        <span style={{ color: "red", fontWeight: "bold" }}>
                          ❌ {log.error.replaceAll("_", " ")}
                        </span>
                      ) : (
                        <span style={{ color: "green", fontWeight: "bold" }}>
                          ✔ Valid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AssignRFIDModal
        isOpen={showRFIDModal}
        onClose={() => setShowRFIDModal(false)}
        student={selectedStudent}
        rfids={rfids}
        onSave={async (rfid) => {
          await assignRFID(selectedStudent.email, rfid);
          setShowRFIDModal(false);
          loadStudents();
          loadRFIDs();
        }}
      />

      <EditStudentModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        student={selectedStudent}
        onSave={async (updates) => {
          await updateStudent(selectedStudent.email, updates);
          setShowEditModal(false);
          loadStudents();
        }}
      />
    </div>
  );
}