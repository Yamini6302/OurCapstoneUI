import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "react-lottie";
import "./css/StudentDetails.css"; // Reusing CSS for consistency
import animationData from "./animations/login.json"; // Lottie animation

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [usernameError, setUsernameError] = useState(""); // Track username-specific errors
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const navigate = useNavigate();

  // Handle register logic
  const handleRegister = async (e) => {
    e.preventDefault();

    const requestBody = { username, password, role };

    try {
      const response = await fetch("http://localhost:7779/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccessMessage("Registration successful. Please log in."); // Set success message

        // Clear any previous error messages
        setErrorMessage("");

        // Redirect to login page after 2 seconds
        setTimeout(() => navigate("/login"), 2000); // After 2 seconds, navigate to login page
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);

        let errorData = {};

        try {
          errorData = JSON.parse(errorText);  // Attempt to parse error message as JSON
        } catch (error) {
          errorData.message = errorText;  // Fallback to raw error text
        }

        const errorMessage = errorData.message || "Error during registration.";

        if (errorMessage.includes("Username already exists")) {
          setUsernameError("This email is already registered. Please choose another one.");
          setErrorMessage(""); // Clear general error message
        } else {
          setErrorMessage(errorMessage);
          setUsernameError(""); // Reset username error if it's another issue
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setErrorMessage("An error occurred. Please try again later.");
      setUsernameError("");  // Reset username error if there's a network error
    }
  };

  // Lottie animation options for registration
  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
  };

  return (
    <div className="register-container">
      {/* Logo and App Name */}
      <div className="logo-container">
        <img src="/logo.png" alt="App Logo" className="app-logo" />
      </div>

      <div className="form-container">
        <h4 className="form-heading">Register for Quick Learn</h4>
        <form onSubmit={handleRegister}>
          <div className="input-container">
            <input
              type="email"
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder=" "
            />
            <label htmlFor="username">Email</label>
            {/* Display username-specific error message if it exists */}
            {usernameError && <div className="input-error">{usernameError}</div>}
          </div>

          <div className="input-container">
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

          <div className="input-container">
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select a role</option>
              <option value="Student">Student</option>
              <option value="Tutor">Tutor</option>
            </select>
            <label htmlFor="role">Role</label>
          </div>

          <button type="submit" className="next-btn">
            Register
          </button>
        </form>

        {/* Display success message inside the form */}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* Error message display */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <div className="mt-3">
          <p>
            Already have an account?{" "}
            <a href="/login" className="btn btn-link">
              Login here
            </a>
          </p>
        </div>
      </div>

      <div className="image-container">
        <Lottie options={lottieOptions} height={400} width={400} />
      </div>
    </div>
  );
}

export default RegisterPage;
