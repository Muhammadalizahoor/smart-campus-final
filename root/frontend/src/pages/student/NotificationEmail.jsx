// //frontend//src//pages//student//NotificationEmail.jsx
// import { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function NotificationEmail() {
//   const [gmail, setGmail] = useState("");
//   const [saved, setSaved] = useState(false);
//   const navigate = useNavigate();

//   // ✅ Get logged-in user safely
//   const storedUser = JSON.parse(localStorage.getItem("user"));

//   useEffect(() => {
//     if (!storedUser || !storedUser.email) {
//       navigate("/");
//     }
//   }, []);

//   const saveGmail = async () => {
//     try {
//       await axios.put("https://smart-campus-backend-iuqo.onrender.com/api/students/update-gmail", {
//         email: storedUser.email,
//         gmail,
//       });

//       setSaved(true);

//       // ⏳ small delay then redirect
//       setTimeout(() => {
//         navigate("/student/dashboard");
//       }, 1000);
//     } catch (err) {
//       console.error(err);
//       alert("Failed to save email");
//     }
//   };

//   return (
//     <div style={{ padding: "40px" }}>
//       <h2>Notification Email</h2>

//       <p>
//         Please enter a personal Gmail to receive important notifications
//         (route changes, delays, announcements).
//       </p>

//       <input
//         type="email"
//         placeholder="example@gmail.com"
//         value={gmail}
//         onChange={(e) => setGmail(e.target.value)}
//         style={{ padding: "8px", width: "300px" }}
//       />

//       <br /><br />

//       <button onClick={saveGmail}>Save Email</button>

//       {saved && <p style={{ color: "green" }}>✔ Email saved successfully</p>}
//     </div>
//   );
// }



import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function NotificationEmail() {
  const [gmail, setGmail] = useState("");
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!storedUser || !storedUser.email) {
      navigate("/");
    }
  }, []);

  const saveGmail = async () => {
    try {
      await axios.put("https://smart-campus-backend-iuqo.onrender.com/api/students/update-gmail", {
        email: storedUser.email,
        gmail,
      });

      setSaved(true);

      setTimeout(() => {
        navigate("/student/dashboard");
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Failed to save email");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.heading}>📧 Notification Email</h2>

        <p style={styles.text}>
          Please enter your personal Gmail to receive important notifications
          such as route changes, delays, and announcements.
        </p>

        <input
          type="email"
          placeholder="example@gmail.com"
          value={gmail}
          onChange={(e) => setGmail(e.target.value)}
          style={styles.input}
        />

        <button style={styles.button} onClick={saveGmail}>
          Save Email
        </button>

        {saved && (
          <p style={styles.success}>✔ Email saved successfully</p>
        )}
      </div>
    </div>
  );
}
const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    background: "#fff",
    width: "100%",
    maxWidth: 420,
    padding: 30,
    borderRadius: 14,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    textAlign: "center",
  },

  heading: {
    fontSize: 22,
    fontWeight: 600,
    marginBottom: 10,
  },

  text: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },

  input: {
    width: "100%",
    padding: "12px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    fontSize: 14,
    marginBottom: 16,
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
  },

  success: {
    marginTop: 15,
    color: "#16a34a",
    fontSize: 14,
    fontWeight: 500,
  },
};
