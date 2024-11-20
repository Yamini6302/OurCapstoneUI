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
  const [usernameError, setUsernameError] = useState(""); // Track username-specific errors
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const navigate = useNavigate();

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

  // Handle register logic
  const handleRegister = async (e) => {
    e.preventDefault();

    // Check if email already exists
    const emailExists = await validateEmail(username);
    if (emailExists) {
      setUsernameError("Invalid email. This email is already registered.");
      return;
    }

    const requestBody = { username, password, role };

    try {
      const response = await fetch("http://localhost:7779/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage("Registration successful!"); // Set success message
        
        // Store userId in session storage
        sessionStorage.setItem("userId", data.userId);

        // Clear any previous error messages
        setErrorMessage("");
        setUsernameError("");

        // Redirect based on role after 1 second
        setTimeout(() => {
          if (role === "Student") {
            navigate("/student-details");
          } else if (role === "Tutor") {
            navigate("/tutor-details");
          }
        }, 1000);
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);

        let errorData = {};
        try {
          errorData = JSON.parse(errorText);
        } catch (error) {
          errorData.message = errorText;
        }

        const errorMessage = errorData.message || "Error during registration.";

        if (errorMessage.includes("Username already exists")) {
          setUsernameError("This email is already registered. Please choose another one.");
          setErrorMessage("");
        } else {
          setErrorMessage(errorMessage);
          setUsernameError("");
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setErrorMessage("An error occurred. Please try again later.");
      setUsernameError("");
    }
  };

  // Add email validation on input change
  const handleEmailChange = (e) => {
    const email = e.target.value;
    setUsername(email);
    
    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setUsernameError("Please enter a valid email address");
    } else {
      setUsernameError("");
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
      <div className="register-logo-container">
        <img src="/logo.png" alt="App Logo" className="register-logo" />
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