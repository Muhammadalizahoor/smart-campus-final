"use client";

import { useEffect, useState } from "react";
import { firestore } from "../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import "../styles/dashboard-welcome.css";

export default function WelcomeCard() {
  const [adminName, setAdminName] = useState(""); // dynamic name

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const q = query(collection(firestore, "Users"), where("role", "==", "admin"));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const adminData = querySnapshot.docs[0].data();
          setAdminName(adminData.name); // set admin name from DB
        }
      } catch (error) {
        console.error("Error fetching admin:", error);
      }
    };

    fetchAdmin();
  }, []);

  return (
    <div className="welcome-card">
      <div className="welcome-content">
        <h2 className="welcome-title">Welcome Back!</h2>
        <p className="welcome-name">{adminName || "Admin"}</p>
        <p className="welcome-text">
          Here's what's happening in your transport network today.
        </p>
      </div>

      <div className="welcome-illustration">
        
      </div>
    </div>
  );
}
