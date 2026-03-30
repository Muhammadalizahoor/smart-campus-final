"use client";
import React, { useEffect, useState } from "react";
import StudentSidebar from "../components/StudentSidebar";
import { firestore } from "../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext"; 
import "../styles/std-dashboard-welcome.css"; 

export default function StudentPortal() {
  const { user, loading: authLoading } = useAuth(); 
  const [studentName, setStudentName] = useState("");
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      // 🚨 Sab se zaroori: Jab tak Auth load ho raha hai, rukh jao
      if (authLoading) return;
      
      // Agar loading khatam ho gayi aur user nahi mila
      if (!user?.email) {
        setDataLoading(false);
        return;
      }

      try {
        const q = query(
          collection(firestore, "Users"),
          where("role", "==", "student"),
          where("email", "==", user.email)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const studentData = querySnapshot.docs[0].data();
          setStudentName(studentData.name);
        }
      } catch (error) {
        console.error("Error fetching student:", error);
      } finally {
        setDataLoading(false);
      }
    };

    fetchStudent();
  }, [user, authLoading]);

  // ✅ REFRESH GUARD: Jab tak data nahi aata, ye screen nazar aayegi
  if (authLoading || dataLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f7fa', flexDirection: 'column' }}>
        <h2 style={{ color: '#132677' }}>Loading Dashboard...</h2>
        <p style={{ color: '#64748b' }}> please wait.</p>
      </div>
    );
  }

  return (
    <div className="std-portal-wrapper">
      <div className="std-content-wrapper">
        <StudentSidebar />
        <div className="std-main-content">
          <h1 className="std-dashboard-title">Student Dashboard</h1>
          <div className="std-welcome-card">
            <div className="std-welcome-content">
              <h2 className="std-welcome-title">Welcome Back!</h2>
              <p className="std-welcome-name">{studentName || "Student"}</p>
              <p className="std-welcome-text">
                Hope you’re having a great day. Keep exploring, learning, and making the most of your time here.
              </p>
            </div>
            <div className="std-welcome-illustration"></div>
          </div>
        </div>
      </div>
    </div>
  );
}