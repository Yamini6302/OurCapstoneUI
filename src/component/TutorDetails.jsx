import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/TutorDetails.css";
import Lottie from "react-lottie";

const baseUrl = "http://localhost:7777/api/tutor";

function TutorDetails() {
  const [tutor, setTutor] = useState({
    tutorName: "",
    details: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setTutor({ ...tutor, [name]: value });
  };

  const handleNext = async (event) => {
    event.preventDefault();

    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      console.error("User ID not found in sessionStorage");
      alert("User ID is missing. Please log in again.");
      return;
    }

    const tutorWithUserId = { ...tutor, userId };
    setIsSubmitting(true);

    try {
      const response = await fetch(baseUrl, {
        method: "POST",
        body: JSON.stringify(tutorWithUserId),
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.tutorId) {
        sessionStorage.setItem("tutorId", data.tutorId);
        navigate("/Dashboard");
      } else {
        console.error("Tutor ID not found in response:", data);
        alert("Failed to register tutor. Please try again.");
      }
    } catch (error) {
      console.error("Error registering tutor:", error);
      alert("An error occurred while registering the tutor. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-container">
      <div className="form-container">
        <h3 className="form-heading">Tutor Registration</h3>
        <div className="details-text">Please enter the details</div>

        <form onSubmit={handleNext}>
          <div className="input-container">
            <input
              type="text"
              id="tutorName"
              name="tutorName"
              value={tutor.tutorName}
              onChange={handleInputChange}
              required
              placeholder=" "
            />
            <label htmlFor="tutorName">Tutor Name</label>
          </div>

          <div className="input-container">
            <textarea
              id="details"
              name="details"
              value={tutor.details}
              onChange={handleInputChange}
              required
              placeholder=" "
            />
            <label htmlFor="details">Details</label>
          </div>

          <button type="submit" className="next-btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Next"}
          </button>
        </form>
      </div>

      <div className="image-container">
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            path: "https://lottie.host/730c08e2-45e3-44fe-81bb-e9fc40db8f4c/dOsP3Ryq0e.json",
          }}
          height={400}
          width={400}
        />
      </div>
    </div>
  );
}

export default TutorDetails;
