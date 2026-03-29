// // frontend/src/pages/AdminNotifications.jsx
// import React, { useState } from "react";
// import axios from "axios";

// export default function AdminNotifications() {
//   const [title, setTitle] = useState("");
//   const [message, setMessage] = useState("");
//   const [target, setTarget] = useState("ALL");

//   const sendNotification = async () => {
//     await axios.post("http://localhost:5000/api/notifications/send", {
//       title,
//       message,
//       target:"ALL" // ALL / BUS / ROUTE
//     });

//     alert("Notification sent to students");
//     setTitle("");
//     setMessage("");
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h2>Send Notification</h2>

//       <input
//         placeholder="Title"
//         value={title}
//         onChange={e => setTitle(e.target.value)}
//       />

//       <textarea
//         placeholder="Message"
//         value={message}
//         onChange={e => setMessage(e.target.value)}
//       />

//       <select value={target} onChange={e => setTarget(e.target.value)}>
//         <option value="ALL">All Students</option>
//         <option value="BUS">Specific Bus (future)</option>
//         <option value="ROUTE">Specific Route (future)</option>
//       </select>

//       <button onClick={sendNotification}>Send</button>
//     </div>
//   );
// }
// frontend/src/pages/AdminNotifications.jsx
import React, { useState } from "react";
import axios from "axios";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("ALL");

  const sendNotification = async () => {
    await axios.post("http://localhost:5000/api/notifications/send", {
      title,
      message,
      target: "ALL",
    });

    alert("Notification sent to students");
    setTitle("");
    setMessage("");
  };

  return (
    <>
      {/* ✅ EXISTING HEADER */}
      <Header />

      <div style={{ display: "flex" }}>
        {/* ✅ EXISTING SIDEBAR */}
        <Sidebar />

        {/* ✅ YOUR EXISTING NOTIFICATION UI */}
        <div style={styles.page}>
          <div style={styles.card}>
            <h2 style={styles.heading}>📢 Send Notification</h2>
            <p style={styles.subheading}>
              Send important updates to students instantly
            </p>

            <div style={styles.field}>
              <label style={styles.label}>Title</label>
              <input
                style={styles.input}
                placeholder="e.g. Bus arriving soon"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Message</label>
              <textarea
                style={styles.textarea}
                placeholder="Write notification message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Target</label>
              <select
                style={styles.select}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                <option value="ALL">All Students</option>
                {/* <option value="BUS">Specific Bus (future)</option>
                <option value="ROUTE">Specific Route (future)</option> */}
              </select>
            </div>

            <button style={styles.button} onClick={sendNotification}>
              Send Notification
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
page: {
  flex: 1,
  background: "#f5f7fb",
  padding: 30,
  marginTop: 70,        // ✅ THIS FIXES IT
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
},



  card: {
    background: "#fff",
    width: "100%",
    maxWidth: 450,
    borderRadius: 14,
    padding: 25,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },

  heading: {
    marginBottom: 5,
    fontSize: 22,
    fontWeight: 600,
  },

  subheading: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },

  field: {
    marginBottom: 16,
  },

  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 6,
    color: "#374151",
  },

  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
  },

  textarea: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    minHeight: 90,
    resize: "none",
  },

  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    background: "#fff",
  },

  button: {
    width: "100%",
    padding: "12px",
    borderRadius: 10,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 10,
  },
};
