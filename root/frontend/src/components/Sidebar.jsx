import React, { useState } from "react";
import {
  LayoutDashboard,
  MapPin,
  BarChart3,
  Zap,
  TrendingUp,
  Users,
  Route,
  AlertCircle,
  Bell,
  ChevronDown,
  LogOut, // ✅ Logout icon
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/sidebar.css";
import { useAuth } from "../contexts/AuthContext"; // ✅ import context


function Sidebar() {
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { logout } = useAuth(); // ✅ get logout function

  const handleLogout = () => {
    logout(); // context + localStorage cleared
    navigate("/", { replace: true }); // correct login route
  };


  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>MENU</h2>
      </div>

      <nav className="sidebar-nav">
        {/* DASHBOARD */}
        <Link
          to="/admin/dashboard"
          className={`nav-item ${
            location.pathname === "/admin/dashboard" ? "active" : ""
          }`}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </Link>

        {/* LIVE TRACKING */}
        <Link
          to="/admin/live-tracking"
          className={`nav-item ${
            location.pathname === "/admin/live-tracking" ? "active" : ""
          }`}
        >
          <MapPin size={20} />
          <span>Live Tracking</span>
        </Link>

        {/* ANALYTICS DROPDOWN */}
        <div className="nav-group">
          <div
            className="nav-item"
            onClick={() => setAnalyticsOpen(!analyticsOpen)}
          >
            <BarChart3 size={20} />
            <span>Analytics</span>
            <ChevronDown
              size={16}
              style={{
                transform: analyticsOpen ? "rotate(180deg)" : "rotate(0deg)",
                marginLeft: "auto",
              }}
            />
          </div>

          {analyticsOpen && (
            <div className="nav-submenu">
              {/* ✅ Your new Speed Trend page link */}
              <Link to="/admin/analytics/speed" className="submenu-item">
                <Zap size={16} />
                <span>Speed Trend</span>
              </Link>

              <Link to="/admin/analytics/occupancy" className="submenu-item">
                <TrendingUp size={16} />
                <span>Occupancy Trends</span>
              </Link>

              <Link to="/admin/analytics/student" className="submenu-item">
                <Users size={16} />
                <span>Activity Log</span>
              </Link>
            </div>
          )}
        </div>

        {/* ROUTE CONTROL */}
        <Link
          to="/admin/routes"
          className={`nav-item ${
            location.pathname === "/admin/routes" ? "active" : ""
          }`}
        >
          <Route size={20} />
          <span>Route Control</span>
        </Link>

        {/* COMPLAINTS */}
        <Link
          to="/admin/complaints"
          className={`nav-item ${
            location.pathname === "/admin/complaints" ? "active" : ""
          }`}
        >
          <AlertCircle size={20} />
          <span>Complaints</span>
        </Link>

        {/* NOTIFICATIONS */}
        <Link
          to="/admin/notifications"
          className={`nav-item ${
            location.pathname === "/admin/notifications" ? "active" : ""
          }`}
        >
          <Bell size={20} />
          <span>Notifications</span>
        </Link>

        {/* ===================== LOGOUT ===================== */}
         <div className="nav-item logout-item" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </div> 
      </nav>
    </div>
  );
}

export default Sidebar;