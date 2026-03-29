import React, { useEffect, useState } from "react";
import Sidebar from "../components/StudentSidebar";
import Header from "../components/stdHeader";
import { firestore } from "../services/firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext"; // For current user
import "../styles/ProfileSettings.css";

function ProfileSettings() {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth(); // get current logged-in student

  // 🔥 Fetch student user
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        if (!currentUser?.email) return;

        const q = query(
          collection(firestore, "Users"),
          where("email", "==", currentUser.email),
          where("role", "==", "student")
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setUserData(snapshot.docs[0].data());
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching student:", err);
        setLoading(false);
      }
    };
    fetchStudent();
  }, [currentUser]);

  // 🔥 Handle form change
  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  // 🔥 Save changes to Firestore
  const handleSave = async () => {
    try {
      if (!currentUser?.email) return;

      const q = query(
        collection(firestore, "Users"),
        where("email", "==", currentUser.email),
        where("role", "==", "student")
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const docRef = doc(firestore, "Users", snapshot.docs[0].id);
        await updateDoc(docRef, {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          password: userData.password,
        });
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("Failed to update profile!");
    }
  };

  if (loading) return <p style={{ padding: "24px" }}>Loading...</p>;

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="main-content">
        {/* Header */}
        <Header />

        {/* Profile Form */}
        <div className="profile-settings-wrapper">
          <div className="profile-container">
            <h2>Student Profile Settings</h2>
            <div className="profile-form">
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleChange}
              />

              <label>Email</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
              />

              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={userData.phone}
                onChange={handleChange}
              />

              <label>Password</label>
              <input
                type="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
              />

              <button className="save-btn" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;
