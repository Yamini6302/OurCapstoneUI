import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/StudentDetails.css";

const baseUrl = "http://localhost:7777/api/tutor";

function TutorDetails() {
  const [tutor, setTutor] = useState({
    tutorName: "",
    details: "",
  });

  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setTutor({ ...tutor, [name]: value });
  };

  const handleNext = (event) => {
    event.preventDefault();
    
    // Retrieve userId from sessionStorage
    const userId = sessionStorage.getItem("userId");
    
    if (!userId) {
      console.error("User ID not found in sessionStorage");
      return;
    }
    
    // Add userId to the tutor object
    const tutorWithUserId = { ...tutor, userId };
  
    console.log(tutorWithUserId); // Log tutor data with userId
  
    // Send the tutor data (with userId) to the backend
    fetch(baseUrl, {
      method: "POST",
      body: JSON.stringify(tutorWithUserId),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.tutorId) { // Assuming data.tutorId is the tutor ID returned by the backend
          sessionStorage.setItem("tutorId", data.tutorId); // Store tutorId in sessionStorage
          navigate("/Dashboard");
        } else {
          console.error("Tutor ID not found in response:", data);
        }
      })
      .catch((error) => {
        console.error("Error registering tutor:", error);
      });
  };

  return (
    <div className="register-container">
      {/* Form Container */}
      <div className="form-container">
        <h3 className="form-heading">Tutor Registration</h3>
        <div className="details-text">Please enter the details</div>

        <form onSubmit={(e) => handleNext(e)}>
          {/* Tutor Name Input */}
          <div className="input-container">
            <input
              type="text"
              id="tutorName"
              name="tutorName"
              value={tutor.tutorName}
              onChange={(e) => handleInputChange(e)}
              required
              placeholder=" " // Placeholder remains empty to show floating label
            />
            <label htmlFor="tutorName">Tutor Name</label>
          </div>

          {/* Tutor Details Input */}
          <div className="input-container">
            <textarea
              id="details"
              name="details"
              value={tutor.details}
              onChange={(e) => handleInputChange(e)}
              required
              placeholder=" " // Placeholder remains empty to show floating label
            />
            <label htmlFor="details">Details</label>
          </div>

          <button type="submit" className="next-btn">
            Next
          </button>
        </form>
      </div>

      {/* Image Container */}
      <div className="image-container">
        <img
          src="https://images.unsplash.com/photo-1592357041689-774489460617?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHV0b3J8ZW58MHwxfDB8fHww"
          alt="Tutor"
        />
      </div>
    </div>
  );
}

export default TutorDetails;
