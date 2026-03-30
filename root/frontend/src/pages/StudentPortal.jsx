"use client";
import React, { useEffect, useState } from "react";
import StudentSidebar from "../components/StudentSidebar";
import { firestore } from "../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext"; 
import "../styles/std-dashboard-welcome.css"; 

export default function StudentPortal() {
  const { user, loading: authLoading } = useAuth(); // AuthContext se loading bhi nikaal lein
  const [studentName, setStudentName] = useState("");
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      // Agar auth abhi load ho raha hai ya user nahi hai toh wait karein
      if (authLoading) return;
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
        setDataLoading(false); // Data mil gaya ya error aaya, loading khatam
      }
    };

    fetchStudent();
  }, [user, authLoading]); // Dono par nazar rakhein

  // Jab tak user confirm nahi hota, loading screen dikhaein
  if (authLoading || dataLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f7fa' }}>
        <h2 style={{ color: '#132677' }}>Loading Dashboard...</h2>
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