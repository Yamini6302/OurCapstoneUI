import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/StudentDetails.css";
import Lottie from "lottie-react";
import animationData from './animations/student-details.json'; 
// import 'react-calendar/dist/Calendar.css';

const baseUrl = "http://localhost:7778/api/student";

function StudentDetails() {
  const [student, setStudent] = useState({
    studentName: "",
    dob: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setStudent({ ...student, [name]: value });
  };

  const handleNext = async (event) => {
    event.preventDefault();

    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      console.error("User ID not found in sessionStorage");
      alert("User ID is missing. Please log in again.");
      return;
    }

    const studentWithUserId = { ...student, userId };
    setIsSubmitting(true);

    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        body: JSON.stringify(studentWithUserId),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.studentId) {
        sessionStorage.setItem("studentId", data.studentId);
        navigate("/login");
      } else {
        console.error("Student ID not found in response:", data);
        alert("Failed to register student. Please try again.");
      }
    } catch (error) {
      console.error("Error registering student:", error);
      alert("An error occurred while registering the student. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      {/* Logo and App Name Section */}
      <div className="logo-container">
        <img
          src="/logo.png" // Replace with your logo path
          alt="App Logo"
          className="app-logo"
        />
      </div>

      <div className="form-container">
        <h4 className="form-heading">Tell Us About Yourself <br />Future Scholar!!</h4>

        <form onSubmit={handleNext}>
          <div className="input-container">
            <input
              type="text"
              id="studentName"
              name="studentName"
              value={student.studentName}
              onChange={handleInputChange}
              required
              placeholder=" "
            />
            <label htmlFor="studentName">Student Name</label>
          </div>

          <div className="input-container">
            <input
              type="date"
              id="dob"
              name="dob"
              value={student.dob}
              onChange={handleInputChange}
              required
              placeholder=" "
            />
            <label htmlFor="dob">Date of Birth</label>
          </div>

          <button type="submit" className="next-btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Register"}
          </button>
        </form>
      </div>

      <div className="image-container">
        {animationData && (
          <Lottie
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{
              width: "100%",
              height: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: -1,
            }}
          />
        )}
      </div>
    </div>
  );
}

export default StudentDetails;
