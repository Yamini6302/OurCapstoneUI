import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "react-lottie";
import "./css/LoginPage.css";
import animationData from "./animations/login.json";

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
      // Step 1: Login request to get the token
      const loginResponse = await fetch("http://localhost:7779/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
  
      const loginTextResponse = await loginResponse.text(); // Get the token as plain text
  
      if (loginResponse.ok) {
        // Step 2: After successful login, fetch the userId from the backend
        const userIdResponse = await fetch(`http://localhost:7779/api/auth/user-id/${username}`);
  
        if (userIdResponse.ok) {
          const userId = await userIdResponse.text();
          sessionStorage.setItem("userId", userId);  // Store userId in sessionStorage
          localStorage.setItem("authToken", loginTextResponse);  // Store JWT token
  
          console.log("JWT Token:", loginTextResponse);
          console.log("User ID:", userId);
  
          // Redirect based on role
          if (role === "Student") {
            navigate("/student");
          } else if (role === "Tutor") {
            navigate("/tutor");
          }
        } else {
          setErrorMessage("Unable to fetch user ID.");
        }
      } else {
        // Handle invalid login response
        const errorData = await loginResponse.json();
        setErrorMessage(errorData.message || "Invalid email, password, or role.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("Invalid email, password, or role.");
    }
  };
  
  const lottieOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
  };

  return (
    <div className="login-page">
      <div className="login-logo-container">
        <img src="/logo.png" alt="App Logo" className="login-logo" />
      </div>

      <div className="login-form-container">
        <h4 className="login-heading">Login To Quick Learn</h4>

        {errorMessage && <div className="login-error-message">{errorMessage}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="login-input-container">
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

          <div className="login-input-container">
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

          <div className="login-input-container select-container">
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

          <button type="submit" className="login-btn login-btn-success">
            Login
          </button>
        </form>

        <div className="login-mt-3">
          <p>
            Don't have an account?{" "}
            <a href="/register" className="login-btn-link">
              Register here
            </a>
          </p>
        </div>
      </div>

      <div className="login-image-container">
        <Lottie options={lottieOptions} height={400} width={400} />
      </div>
    </div>
  );
}

export default LoginPage;