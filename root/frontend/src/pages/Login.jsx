import React, { useState, useEffect } from "react";
import { loginUser } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/auth.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Screen size track karne ke liye taake mobile ka pata chale
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await loginUser(form);
      login(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "student") {
        if (!data.user.gmail) {
          navigate("/student/notification-email");
        } else {
          navigate("/student/dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  // 🎨 Inline Responsive Styles (Override for Mobile)
  const containerStyle = {
    display: "flex",
    width: "100%",
    height: "100vh",
    margin: 0,
    padding: 0,
    overflow: "hidden",
    flexDirection: isMobile ? "column" : "row",
    backgroundColor: "#f4f7fe"
  };

  const formSectionStyle = {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: isMobile ? "10px" : "40px",
    width: "100%",
    zIndex: 2
  };

  return (
    <div style={containerStyle} className="auth-container">
      {/* 🖼️ Image Section: Mobile par hide ho jayegi automatically */}
      {!isMobile && (
        <div className="auth-image-section" style={{ flex: 1.2, height: "100%" }}>
          {/* Aapki CSS wali bus image yahan background mein khud hi aa jaye gi */}
        </div>
      )}

      <div style={formSectionStyle} className="auth-form-section">
        <div 
          className="auth-form-card glass" 
          style={{ 
            width: "90%", 
            maxWidth: "400px", 
            padding: "30px",
            borderRadius: "15px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            boxSizing: "border-box"
          }}
        >
          <h2 className="auth-title" style={{ textAlign: "center", marginBottom: "20px" }}>
            Welcome Back
          </h2>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group" style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="e.g. name@student.uet.edu.pk"
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "5px" }}>Password</label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }}
              />
            </div>

            {error && <div className="error-message" style={{ color: "red", marginBottom: "15px", textAlign: "center" }}>{error}</div>}

            <button 
              className="submit-btn" 
              style={{ 
                width: "100%", 
                padding: "12px", 
                backgroundColor: "#2563eb", 
                color: "white", 
                border: "none", 
                borderRadius: "8px", 
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}