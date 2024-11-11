import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 

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
        
        navigate("/dashboard");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Invalid username or password.");
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  // Inline styles for the full-page background image
  const pageStyle = {
    height: "100vh", 
    width: "100vw",   
    backgroundImage: "url('https://media.istockphoto.com/id/1460007178/photo/library-books-on-table-and-background-for-studying-learning-and-research-in-education-school.webp?a=1&b=1&s=612x612&w=0&k=20&c=QsnFz7rujdYTsK1Ts5IpkyTHCWb_ZtJONvTOAW2hPCI=')",
    backgroundSize: "cover",  
    backgroundPosition: "center", 
    display: "flex", 
    justifyContent: "center",
    alignItems: "center",  
    margin: "0",  
    padding: "0", 
  };

  // Form container styles
  const formStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.9)",  
    padding: "30px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    width: "100%",  
    maxWidth: "400px",  
    textAlign: "left", 
  };

  return (
    <div style={pageStyle}>
      <div style={formStyle}>
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

export default LoginPage;