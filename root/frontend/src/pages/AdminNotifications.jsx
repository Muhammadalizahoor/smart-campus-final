import React, { useState } from "react";
import axios from "axios";
import emailjs from '@emailjs/browser'; // ✅ Don't forget: npm install @emailjs/browser
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../services/firebase"; 

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [target, setTarget] = useState("ALL");
  const [loading, setLoading] = useState(false);

  const sendNotification = async () => {
    if (!title || !message) return alert("Please fill all fields");
    
    setLoading(true);
    try {
      // 1️⃣ FIREBASE SE STUDENTS KE EMAILS FETCH KARNA
      const querySnapshot = await getDocs(collection(firestore, "students"));
      const emailList = querySnapshot.docs
        .map(doc => doc.data().gmail || doc.data().email)
        .filter(Boolean);

      if (emailList.length === 0) {
        alert("No registered students found!");
        setLoading(false);
        return;
      }

      // 2️⃣ EMAILJS SE DIRECT MAIL BHEJNA (Zero Port Issues)
      const templateParams = {
        subject: title,
        message: message,
        to_email: emailList.join(", "), 
      };

      await emailjs.send(
        'service_s0jvqh8', 
        'template_50805mr', 
        templateParams, 
        'WE99s_yXbnd8wdIBK'
      );

      // 3️⃣ BACKEND PAR RECORD SAVE KARNA (History ke liye)
      await axios.post("https://smart-campus-backend-iuqo.onrender.com/api/notifications/send", {
        title,
        message,
        target: "ALL",
      });

      alert(`✅ Success! Notification sent to ${emailList.length} students.`);
      setTitle("");
      setMessage("");

    } catch (error) {
      console.error("Error sending notification:", error);
      alert("❌ Failed to send notification. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div style={{ display: "flex" }}>
        <Sidebar />
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
              </select>
            </div>

            <button 
              style={{...styles.button, opacity: loading ? 0.7 : 1}} 
              onClick={sendNotification}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Notification"}
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
    marginTop: 70, 
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    minHeight: "100vh"
  },
  card: {
    background: "#fff",
    width: "100%",
    maxWidth: 450,
    borderRadius: 14,
    padding: 25,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  heading: { marginBottom: 5, fontSize: 22, fontWeight: 600 },
  subheading: { fontSize: 14, color: "#6b7280", marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6, color: "#374151" },
  input: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14 },
  textarea: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, minHeight: 90, resize: "none" },
  select: { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, background: "#fff" },
  button: { width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "#2563eb", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 10 },
};