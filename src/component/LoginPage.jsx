import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "react-lottie";
import "./css/StudentDetails.css"; // Reusing CSS from StudentDetails for styling consistency
import animationData from "./animations/login.json"; // Importing Lottie animation

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const requestBody = { username, password, role };

    try {
      const response = await fetch("http://localhost:7779/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      // Check if the response is a plain text token
      const textResponse = await response.text();

      if (response.ok) {
        // If the response is the token (plain text)
        localStorage.setItem("authToken", textResponse);

        // Assuming the response contains user information (including user ID)
        const userData = JSON.parse(textResponse); // Assuming this returns a JSON with user details
        sessionStorage.setItem("userId", userData.userId); // Store userId in sessionStorage

        // Redirect based on the role
        if (role === "Student") {
          navigate("/student-dashboard");
        } else if (role === "Tutor") {
          navigate("/tutor-dashboard");
        }
      } else {
        // Handle server-side error responses
        const errorData = JSON.parse(textResponse); // Parse error message from response text
        setErrorMessage(errorData.message || "Invalid username, password, or role.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("An error occurred. Please try again later.");
    }
  };

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
        <h4 className="form-heading">Login To Quick Learn</h4>

        {/* Error message display inside form container */}
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <form onSubmit={handleLogin}>
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
            Login
          </button>
        </form>

        <div className="mt-3">
          <p>
            Don't have an account?{" "}
            <a href="/register" className="btn btn-link">
              Register here
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

export default LoginPage;
