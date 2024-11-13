import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/StudentDetails.css"; 

const baseUrl = "http://localhost:7778/api/student";


function StudentDetails() {
  const [student, setStudent] = useState({
    studentName: "",
    dob: "",
  });

  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setStudent({ ...student, [name]: value });
  };

  const handleNext = (event) => {
    event.preventDefault();
    
    // Retrieve userId from sessionStorage
    const userId = sessionStorage.getItem("userId");
    
    if (!userId) {
      console.error("User ID not found in sessionStorage");
      return;
    }
    
    // Add userId to the student object
    const studentWithUserId = { ...student, userId };
  
    console.log(studentWithUserId); // Log student data with userId
  
    // Send the student data (with userId) to the backend
    fetch(baseUrl, {
      method: "POST",
      body: JSON.stringify(studentWithUserId),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.studentId) { // Assuming data.studentId is the student ID returned by the backend
          sessionStorage.setItem("studentId", data.studentId); // Store studentId in sessionStorage
          navigate("/Dashboard");
        } else {
          console.error("Student ID not found in response:", data);
        }
      })
      .catch((error) => {
        console.error("Error registering student:", error);
      });
  };
  
    

  return (
    <div className="register-container">
      {/* Form Container */}
      <div className="form-container">
        <h3 className="form-heading">Student Registration</h3>
        <div className="details-text">Please enter the details</div>

        <form onSubmit={(e)=>handleNext(e)}>
          {/* Student Name Input */}
          <div className="input-container">
            <input
              type="text"
              id="studentName"
              name="studentName"  
              value={student.studentName}
              onChange={(e)=>handleInputChange(e)}
              required
              placeholder=" " // Placeholder remains empty to show floating label
            />
            <label htmlFor="studentName">Student Name</label>
          </div>

          {/* Date of Birth Input */}
          <div className="input-container">
            <input
              type="date"
              id="dob"
              name="dob" 
              value={student.dob}
              onChange={(e)=>handleInputChange(e)}
              required
              placeholder="" // Show placeholder initially
            />
            <label htmlFor="dob">Date of Birth</label>
          </div>

          <button type="submit" className="next-btn">
            Next
          </button>
        </form>
      </div>

      {/* Image Container */}
      <div className="image-container">
        <img
          src="https://images.unsplash.com/photo-1622673038079-de1ddac26c16?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Ym9va3N8ZW58MHwxfDB8fHww"
          alt="Student"
        />
      </div>
    </div>
  );
}

export default StudentDetails;