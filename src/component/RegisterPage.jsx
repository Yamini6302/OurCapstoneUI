import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "react-lottie";
import "./css/RegisterPage.css";
import animationData from "./animations/login.json"; // Lottie animation

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  // Simplified handleEmailChange - just update the state
  const handleEmailChange = (e) => {
    const email = e.target.value;
    setUsername(email);
    // Remove immediate validation
    setUsernameError(""); // Clear any existing errors when typing
  };

  // Handle register logic with validation
  const handleRegister = async (e) => {
    e.preventDefault();

    // Email validation on form submission
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      setUsernameError("Please enter a valid email address");
      return; // Stop form submission if email is invalid
    }

    // Check if email already exists
    try {
      const emailExists = await validateEmail(username);
      if (emailExists) {
        setUsernameError("This email is already registered");
        return;
      }

      const response = await fetch("http://localhost:7779/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage("Registration successful!");
        sessionStorage.setItem("userId", data.userId);
        setErrorMessage("");
        setUsernameError("");

        setTimeout(() => {
          if (role === "Student") {
            navigate("/student-details");
          } else if (role === "Tutor") {
            navigate("/tutor-details");
          }
        }, 1000);
      } else {
        const errorText = await response.text();
        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (error) {
          errorData.message = errorText;
        }

        const errorMessage = errorData.message || "Error during registration.";
        setErrorMessage(errorMessage);
        setUsernameError("");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setErrorMessage("An error occurred. Please try again later.");
      setUsernameError("");
    }
  };

  // Add email validation function
  const validateEmail = async (email) => {
    try {
      const response = await fetch(`http://localhost:7779/api/auth/user-id/${email}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        return true; // Email exists
      }
      return false; // Email does not exist
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  // Lottie animation options for registration
  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
  };

  return (
    <div className="register-page">
      <div className="register-header">
        <div className="register-header-content">
          <div className="register-logo-container">
            <img src="/logo.png" alt="App Logo" className="register-logo" />
          </div>
          <nav className="register-nav">
            <a href="/home" className="register-nav-link">Home</a>
          </nav>
        </div>
      </div>

      <div className="register-form-container">
        <h4 className="register-heading">Register for Quick Learn</h4>
        <form onSubmit={handleRegister}>
          <div className="register-input-containers">
            <input
              type="email"
              id="username"
              name="username"
              value={username}
              onChange={handleEmailChange}
              required
              placeholder=" "
            />
            <label htmlFor="username">Email</label>
            {usernameError && <div className="register-error-message">{usernameError}</div>}
          </div>

          <div className="register-input-containers">
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder=" "
            />
            <label htmlFor="password">Password</label>
          </div>

          <div className="select-container">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              style={{ backgroundColor: '#121212', color: '#E0E0E0' }}
            >
              <option value="" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>Select a role</option>
              <option value="Student" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>Student</option>
              <option value="Tutor" style={{ backgroundColor: '#121212', color: '#E0E0E0' }}>Tutor</option>
            </select>
          </div>

          <button type="submit" className="register-btn register-btn-success">
            Next
          </button>
        </form>

        {successMessage && <div className="register-success-message">{successMessage}</div>}
        {errorMessage && <div className="register-error-message">{errorMessage}</div>}

        <div className="mt-3">
          <p>
            Already have an account?{" "}
            <a href="/login" className="register-btn-link">
              Login here
            </a>
          </p>
        </div>
      </div>

      <div className="register-image-container">
        <Lottie options={lottieOptions} height={400} width={400} />
      </div>
    </div>
  );
}

export default RegisterPage;