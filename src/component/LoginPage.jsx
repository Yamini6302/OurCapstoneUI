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
            navigate("/student-dashboard");
          } else if (role === "Tutor") {
            navigate("/tutor-dashboard");
          }
        } else {
          setErrorMessage("Unable to fetch user ID.");
        }
      } else {
        // Handle invalid login response
        const errorData = await loginResponse.json();
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
      <div className="logo-container">
        <img src="src/logo.png" alt="App Logo" className="app-logo" />
      </div>

      <div className="form-container">
        <h4 className="form-heading">Login To Quick Learn</h4>

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
