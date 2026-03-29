//frontend//pages//student//profile.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Profile() {
  const [gmail, setGmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // 🔹 Load saved gmail once
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(
          "https://smart-campus-backend-iuqo.onrender.com/api/students/profile",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setGmail(res.data.gmail || "");
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // 🔹 Update gmail
  const updateGmail = async () => {
    try {
      await axios.put(
        "https://smart-campus-backend-iuqo.onrender.com/api/students/update-gmail",
        { gmail },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessage("✔ Notification email updated successfully");
    } catch (err) {
      console.error("Update failed", err);
      setMessage("❌ Failed to update email");
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Loading profile...</p>;

  return (
    <div style={{ padding: 30, maxWidth: 500 }}>
      <h2>Profile Settings</h2>

      <label style={{ fontWeight: "bold" }}>
        Notification Email (Gmail)
      </label>

      <input
        type="email"
        placeholder="example@gmail.com"
        value={gmail}
        onChange={(e) => setGmail(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginTop: 8,
          marginBottom: 16,
        }}
      />

      <button onClick={updateGmail} style={{ padding: "10px 20px" }}>
        Update Email
      </button>

      {message && (
        <p style={{ marginTop: 15, fontWeight: "bold" }}>{message}</p>
      )}
    </div>
  );
}
