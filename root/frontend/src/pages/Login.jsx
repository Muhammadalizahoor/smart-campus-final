import React, { useState } from "react";
import { loginUser } from "../api/authApi";
import { useNavigate } from "react-router-dom"; // Link ki ab zaroorat nahi
import { useAuth } from "../contexts/AuthContext";
import "../styles/auth.css";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // ✅ Direct email/pass bhej rahe hain
      const data = await loginUser(form);

      login(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 🎯 AUTO REDIRECT BASED ON BACKEND ROLE
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

  return (
    <div className="auth-container">
      <div className="auth-image-section"></div>

      <div className="auth-form-section">
        <div className="auth-form-card glass">
          <h2 className="auth-title">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="auth-form">
            
            {/* EMAIL ADDRESS */}
            <div className="form-group">
              <label>Email Address</label>
              <input
                name="email"
                type="email"
                placeholder="e.g. name@student.uet.edu.pk"
                onChange={handleChange}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label>Password</label>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                onChange={handleChange}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button className="submit-btn">Login</button>
          </form>

          {/* ❌ Signup link yahan se hata diya gaya hai taake sirf login hi rahay */}
        </div>
      </div>
    </div>
  );
}