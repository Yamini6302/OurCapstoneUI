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
    <div className="tutor-details-page">
      <div className="tutor-details-logo-container">
        <img src="/logo.png" alt="Logo" className="tutor-details-logo" />
      </div>

      <div className="tutor-details-form-container">
        <h4 className="tutor-details-heading">Complete Your Tutor Profile</h4>
        
        <form onSubmit={handleNext}>
          <div className="tutor-details-input-container">
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

          <div className="tutor-details-input-container">
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

          <button type="submit" className="tutor-details-btn" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Next"}
          </button>
        </form>
      </div>

      <div className="tutor-details-image-container">
        <div className="tutor-details-animation-wrapper">
          <Lottie
            options={{
              loop: true,
              autoplay: true,
              path: "https://lottie.host/e35ec040-4458-4998-abe4-6bef6095409e/s55gBLhCYN.json",
            }}
            height={400}
            width={400}
          />
        </div>
      </div>
    </div>
  );
}

export default TutorDetails;