import React, { useState, useEffect } from "react";
import "./css/LandingPage.css";

const LandingPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch courses from backend API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:7773/api/courses");
        if (!response.ok) {
          throw new Error("Failed to fetch courses from the backend");
        }
        const data = await response.json();
        console.log("Fetched courses:", data);
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Handle course card click to check if the user is logged in
  const handleCourseClick = () => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      console.log("User not logged in, redirecting to login page");
      window.location.href = "/login";
    } else {
      console.log("Course clicked by user:", userId);
    }
  };

  return (
    <div className="landing-page">
      {/* Header Section - Updated */}
      <header className="header">
        <div className="logo">QuickLearn</div>
        <nav className="nav-links">
          <a href="#courses">Courses</a>
        </nav>
        <div className="cta-buttons">
          <button className="btn primary" onClick={() => window.location.href = '/register'}>
            Sign Up
          </button>
          <button className="btn secondary" onClick={() => window.location.href = '/login'}>
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section - Updated */}
      <section className="hero">
        <div className="hero-text">
          <h1>Unlock Your Learning Potential</h1>
          <p>Explore courses, connect with tutors, and grow your skills.</p>
          <div className="hero-buttons">
            <button className="btn primary"onClick={() => window.location.href = '#course'}>Explore Courses</button>
            <button className="btn secondary" onClick={() => window.location.href = '/login'}>Get Started</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="courses" id="courses" >
        <h2>Popular Courses</h2>
        {loading ? (
          <p>Loading courses...</p>
        ) : courses.length > 0 ? (
          <div className="course-carousel">
            {courses.map((course) => (
              <div
                className="course-card"
                key={course.id}
                onClick={handleCourseClick}
              >
                
                <h3>{course.courseName}</h3>
                <p>{course.description}</p>
                
              </div>
            ))}
          </div>
        ) : (
          <p>No courses available right now.</p>
        )}
      </section>

      {/* Footer - Updated */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About QuickLearn</h3>
            <p>Empowering learners worldwide with quality education and innovative learning solutions.</p>
          </div>
          
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#courses">Browse Courses</a></li>
              <li><a href="/login">Login</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h3>Contact Us</h3>
            <div className="social-icons">
              <a href="#" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" aria-label="X">
                <i className="fab fa-x-twitter"></i>
              </a>
              <a href="mailto:contact@quicklearn.com" aria-label="Email">
                <i className="far fa-envelope"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 QuickLearn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};



// Then in your course card, update the style prop:


export default LandingPage;
