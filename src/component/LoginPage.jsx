import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import Lottie from "lottie-react"; // Import Lottie
import animationData from './animations/login.json'; // Update with your local Lottie animation file or URL

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();

    const requestBody = {
        username,
        password,
        role
    };

    try {
        const response = await fetch("http://localhost:7779/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            navigate("/home"); // Redirect to home page after successful login
        } else {
            const errorData = await response.json();
            alert(errorData.message || "Invalid username or password.");
        }
    } catch (error) {
        console.error("Error during login:", error);
        alert("An error occurred. Please try again later.");
    }
};

  return (
    <div style={styles.container}>
      {/* Lottie Animation Background */}
      <Lottie
          animationData={animationData} // Path to the correct JSON animation
          loop={true}
          autoplay={true}
          style={styles.lottieBackground}
        />


      {/* Form Container */}
      <div style={styles.formStyle}>
        <h3>Login</h3>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select
              id="role"
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select a role</option>
              <option value="Student">Student</option>
              <option value="Tutor">Tutor</option>
            </select>
          </div>

          <button type="submit" className="btn btn-success mt-3">
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
    </div>
  );
}

// Styles for container and form
const styles = {
  container: {
    position: "relative",
    height: "100vh", 
    width: "100vw",   
    overflow: "hidden", // Prevent overflow of content
  },
  lottieBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -1, // Ensure the animation is in the background
  },
  formStyle: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",  
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    width: "100%",  
    maxWidth: "400px",  
    textAlign: "left", 
    position: "relative", // Ensure form is above the background animation
    zIndex: 1,
    margin: 'auto', // Center the form horizontally
  }
};

export default LoginPage;
