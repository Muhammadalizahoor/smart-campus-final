import React, { useEffect, useState, useRef } from "react";
import { Menu, ChevronDown } from "lucide-react";
import { getDocs, collection, query, where } from "firebase/firestore";
import { firestore } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/header.css";

function Header() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [userData, setUserData] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { logout, currentUser } = useAuth(); // use currentUser from AuthContext
  const navigate = useNavigate();
  const dropdownRef = useRef();

  // 🔥 Fetch student user from Firestore
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
      } catch (err) {
        console.error("Error fetching student:", err);
      }
    };
    fetchStudent();
  }, [currentUser]);

  // 🔥 Update time every second
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      );
      setTime(
        now.toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 Handle logout
  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  // 🔥 Handle profile settings
  const handleProfileSettings = () => navigate("/profile-settings");

  // 🔥 Get initials
  const getInitials = (name) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // 🔹 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="header">
      <div className="header-left">
        <Menu size={24} />
      </div>

      <div className="header-right">
        {/* DATE & TIME */}
        <div className="datetime">
          <p className="date">{date}</p>
          <p className="time">{time}</p>
        </div>

        {/* USER INFO */}
        <div className="user-dropdown" ref={dropdownRef}>
          <div
            className="user-avatar-name"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="user-avatar">
              {getInitials(userData?.name)}
            </div>
            <p className="user-name-header">{userData?.name}</p>
            <ChevronDown size={16} />
          </div>

          {dropdownOpen && (
            <div className="dropdown-menu">
              <button onClick={handleProfileSettings} className="dropdown-btn">
                Profile Settings
              </button>
              <button onClick={handleLogout} className="dropdown-btn logout">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Header;
