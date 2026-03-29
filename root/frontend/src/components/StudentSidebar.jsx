import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MapPin, AlertCircle, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import "../styles/student-sidebar.css";

export default function StudentSidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="student-sidebar">
      <div className="sidebar-header">
        <h2>MENU</h2>
      </div>

      <nav className="sidebar-nav">
        <Link
          to="/student/dashboard"
          className={`nav-item ${
            location.pathname === "/student/dashboard" ? "active" : ""
          }`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>

        <Link
          to="/student/live-tracking"
          className={`nav-item ${
            location.pathname === "/student/live-tracking" ? "active" : ""
          }`}
        >
          <MapPin size={20} />
          <span>Live Tracking</span>
        </Link>

        <Link
          to="/student/complaints"
          className={`nav-item ${
            location.pathname === "/student/complaints" ? "active" : ""
          }`}
        >
          <AlertCircle size={20} />
          <span>Complaints</span>
        </Link>

        {/* Logout as nav item */}
        <div
          className="nav-item logout-nav"
          onClick={handleLogout}
          style={{ cursor: "pointer" }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </div>
      </nav>
    </div>
  );
}
