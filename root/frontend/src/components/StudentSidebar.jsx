import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { MapPin, AlertCircle, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import "../styles/student-sidebar.css";

export default function StudentSidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Mobile Menu Button - Sirf mobile par nazar aayega */}
      <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`student-sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>MENU</h2>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/student/dashboard"
            onClick={() => setIsOpen(false)}
            className={`nav-item ${location.pathname === "/student/dashboard" ? "active" : ""}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/student/live-tracking"
            onClick={() => setIsOpen(false)}
            className={`nav-item ${location.pathname === "/student/live-tracking" ? "active" : ""}`}
          >
            <MapPin size={20} />
            <span>Live Tracking</span>
          </Link>

          <Link
            to="/student/complaints"
            onClick={() => setIsOpen(false)}
            className={`nav-item ${location.pathname === "/student/complaints" ? "active" : ""}`}
          >
            <AlertCircle size={20} />
            <span>Complaints</span>
          </Link>

          <div className="nav-item logout-nav" onClick={handleLogout} style={{ cursor: "pointer" }}>
            <LogOut size={20} />
            <span>Logout</span>
          </div>
        </nav>
      </div>
      
      {/* Overlay - Sidebar khulne par background blur/dark karne ke liye */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
}