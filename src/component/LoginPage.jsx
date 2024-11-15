import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import Lottie from "lottie-react"; 

function LoginPage() {
  const [animationData, setAnimationData] = useState(null);
  const [username, setUsername] = useState(""); // This will hold the email
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate(); 

  // Load the animation data using fetch on component mount
  useEffect(() => {
    const fetchAnimation = async () => {
      const response = await fetch('https://lottie.host/40d8f510-6d07-4562-b01d-696d2860ffcf/eG0n4SiEt6.json');
      const data = await response.json();
      setAnimationData(data);
    };

    fetchAnimation();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    const requestBody = {
        username, // This will be treated as an email
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
       {/* Lottie Animation Background */}

       <div className="logo-container">
        <img
          src="/logo.png" // Replace with your logo path
          alt="App Logo"
          className="app-logo"
        />
        
      </div>
      
      {animationData && (
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
          style={styles.lottieBackground}
        />
      )}

      {/* Form Container */}
      <div style={styles.formStyle}>
        <h3>Login To Quick Learn</h3>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Email</label>
            <input
              type="email" // Change to email type for validation
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
    overflow: "hidden", 
    display: 'flex',
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  lottieBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    zIndex: -1, 
  },
  formStyle: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",  
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    width: "100%",  
    maxWidth: "400px",  
    textAlign: "left", 
    position: "relative", 
    zIndex: 1,
  }
};

export default LoginPage;