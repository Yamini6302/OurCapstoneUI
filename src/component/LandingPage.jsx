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
      window.location.href = "/login";
    } else {
      console.log("Course clicked by user:", userId);
    }
  };

  return (
    <div className="landing-page">
      {/* Header Section */}
      <header className="header" key="header">
        <div className="headerLeft" key="header-left">
          <img src="/logo.png" alt="QuickLearn Logo" className="logo" />
          <div className="platformName">
            <span className="quick" key="quick">Quick</span>
            <span className="learn" key="learn">Learn</span>
          </div>
        </div>
        <div className="cta-buttons" key="cta-buttons">
          <button className="btn primary" key="signup-btn" onClick={() => window.location.href = '/register'}>
            Sign Up
          </button>
          <button className="btn secondary" key="signin-btn" onClick={() => window.location.href = '/login'}>
            Sign In
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" key="hero">
        <div className="hero-text" key="hero-text">
          <h1>Unlock Your Learning Potential</h1>
          <p>Explore courses, connect with tutors, and grow your skills.</p>
          <div className="hero-buttons" key="hero-buttons">
            <button className="btn secondary" key="get-started-btn" onClick={() => window.location.href = '/login'}>
              Get Started
            </button>
          </div>
        </div>
        <div className="hero-visual" key="hero-visual">
          <div className="circle circle-1" key="circle-1"></div>
          <div className="circle circle-2" key="circle-2"></div>
          <div className="circle circle-3" key="circle-3"></div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="courses" id="courses" key="courses-section">
        <h2>Popular Courses</h2>
        {loading ? (
          <p key="loading">Loading courses...</p>
        ) : courses.length > 0 ? (
          <div className="course-carousel" key="course-carousel">
            {courses.map((course, index) => (
              <div
                className="course-card"
                key={`course-${course.ctId}-${index}`}
                onClick={handleCourseClick}
              >
                <h3>{course.courseName}</h3>
                <p>{course.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <p key="no-courses">No courses available right now.</p>
        )}
      </section>

      {/* Footer */}
      <footer className="footer" key="footer">
        <div className="footer-content" key="footer-content">
          {[
            <div className="footer-section" key="about-section">
              <h3>About QuickLearn</h3>
              <p>Empowering learners worldwide with quality education and innovative learning solutions.</p>
            </div>,
            
            <div className="footer-section" key="links-section">
              <h3>Quick Links</h3>
              <ul>
                <li key="courses-link"><a href="#courses">Browse Courses</a></li>
                <li key="login-link"><a href="/login">Login</a></li>
              </ul>
            </div>,
            
            <div className="footer-section" key="social-section">
              <div className="social-icons">
                {[
                  <a href="#" aria-label="Facebook" key="facebook">
                    <i className="fab fa-facebook-f"></i>
                  </a>,
                  <a href="#" aria-label="X" key="twitter">
                    <i className="fab fa-x-twitter"></i>
                  </a>,
                  <a href="mailto:contact@quicklearn.com" aria-label="Email" key="email">
                    <i className="far fa-envelope"></i>
                  </a>
                ]}
              </div>
            </div>
          ]}
        </div>
        
        <div className="footer-bottom" key="footer-bottom">
          <p>&copy; 2024 QuickLearn. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};


export default LandingPage;