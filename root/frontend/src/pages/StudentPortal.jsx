// import React from "react";
// //import Header from "../components/stdHeader";
// import StudentSidebar from "../components/StudentSidebar";
// import "../styles/admin-layout.css"; // IMPORTANT for layout spacing

// export default function StudentPortal() {
//   return (
//     <div>
//       {/* Top Header 
//       <Header /> */}

//       <div className="admin-content-wrapper">
//         {/* Student Sidebar */}
//         <StudentSidebar />

//         {/* Main content area */}
//         <div style={{ padding: "20px" }}>
//           <h1>Student Dashboard</h1>
//           <p>Welcome to the student portal.</p>
//         </div>
//       </div>
//     </div>
//   );
// }





"use client";
import React, { useEffect, useState } from "react";
import StudentSidebar from "../components/StudentSidebar";
import { firestore } from "../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext"; // get logged-in user
import "../styles/std-dashboard-welcome.css"; // student dashboard welcome styling


export default function StudentPortal() {
  const { user } = useAuth(); // get logged-in student info
  const [studentName, setStudentName] = useState("");

  useEffect(() => {
    const fetchStudent = async () => {
      if (!user?.email) return;

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
      }
    };

    fetchStudent();
  }, [user?.email]);

  return (
    <div className="std-portal-wrapper">
      <div className="std-content-wrapper">
        {/* Student Sidebar */}
        <StudentSidebar />

        {/* Main content area */}
        <div className="std-main-content">
          <h1 className="std-dashboard-title">Student Dashboard</h1>

          {/* Welcome Card */}
          <div className="std-welcome-card">
            <div className="std-welcome-content">
              <h2 className="std-welcome-title">Welcome Back!</h2>
              <p className="std-welcome-name">{studentName || "Student"}</p>
              <p className="std-welcome-text">
                Hope you’re having a great day. Keep exploring, learning, and making the most of your time here.
              </p>
            </div>

            <div className="std-welcome-illustration">
              {/* Optional: image/SVG illustration */}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
