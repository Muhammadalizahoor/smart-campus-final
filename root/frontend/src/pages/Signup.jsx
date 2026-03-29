import React, { useState } from "react";
import { signupUser } from "../api/authApi";
import { Link, useNavigate } from "react-router-dom";
import "../styles/auth.css";  


export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    regNo: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  const nameRegex = /^[a-zA-Z\s]{4,}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@student\.uet\.edu\.pk$/;
  const regRegex = /^[0-9]{2}-[A-Z]{2,3}-[0-9]{3}$/; // example: 22-CS-123
  const phoneRegex = /^[0-9]{11}$/;

  // ---------------- VALIDATION ----------------
  if (!form.name || !form.email || !form.password || !form.confirmPassword || !form.phone || !form.regNo) {
    return setError("All fields are required.");
  }

  if (!nameRegex.test(form.name)) {
    return setError("Name must be minimum 4 characters, alphabets only.");
  }

  if (!emailRegex.test(form.email)) {
    return setError("Email must be @student.uet.edu.pk");
  }

  if (!regRegex.test(form.regNo)) {
    return setError("Registration No format invalid (e.g. 22-CS-123)");
  }

  if (!phoneRegex.test(form.phone)) {
    return setError("Phone must be 11 digits.");
  }

  if (form.password.length < 8) {
    return setError("Password must be at least 8 characters.");
  }

  if (form.password !== form.confirmPassword) {
    return setError("Passwords do not match.");
  }

  // ---------------- API CALL ----------------
  try {
    await signupUser(form);
    navigate("/");
  } catch (err) {
    setError(err.response?.data?.message || "Signup failed");
  }
};


  return (
    <div className="auth-container">

      {/* LEFT SIDE – FULL SCREEN BUS IMAGE */}
      <div className="auth-image-section">
   
      </div>

      {/* RIGHT SIDE – GLASS CARD */}
      <div className="auth-form-section">
        <div className="auth-form-card glass">

          <h2 className="auth-title">Create Account</h2>

          <form onSubmit={handleSubmit} className="auth-form">
            
            <div className="form-group">
              <label>Name</label>
              <input name="name" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input name="email" onChange={handleChange} type="email" />
            </div>

            <div className="form-group">
              <label>Registration Number</label>
              <input name="regNo" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input name="phone" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input name="password" type="password" onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input name="confirmPassword" type="password" onChange={handleChange} />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button className="submit-btn">Sign Up</button>
          </form>

          {/* GOOGLE SIGN IN BUTTON */}
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button className="social-btn google">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg"
                   alt="Google" width="22" />
            </button>
          </div>

          <p className="auth-footer">
            Already have an account?{" "}
            <Link to="/" className="auth-link">Sign In</Link>
          </p>

        </div>
      </div>

    </div>
  );
}
