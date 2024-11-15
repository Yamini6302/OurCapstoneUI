import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './css/TutorDashboard.css';  // Import the CSS file

function TutorDashboard() {
  const [courses, setCourses] = useState([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [userDetails, setUserDetails] = useState(null);

  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId"); // Get userId from sessionStorage

  useEffect(() => {
    if (!userId) {
      navigate("/login"); // Redirect to login if no userId in sessionStorage
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:7773/api/courses");
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        } else {
          console.error("Failed to fetch courses");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    const fetchUserDetails = async () => {
      const url = `http://localhost:7777/api/tutor/user/${userId}`;
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setUserDetails(data);
        } else {
          console.error("Failed to fetch user details");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchCourses();
    fetchUserDetails();
  }, [userId, navigate]);

  const toggleSidebar = () => {
    setSidebarExpanded((prev) => !prev);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("userId");
    navigate("/"); // Redirect to landing page
  };

  return (
    <div className="container">
      <header className="header">
        <div className="headerLeft">
          <img src="/logo.png" alt="Logo" className="logo" />
          <span className="platformName">
            <span className="quick">Quick </span>
            <span className="quick">Learn</span>
          </span>
        </div>
        <div className="headerCenter">
          <input type="text" placeholder="Search..." className="searchBar" />
        </div>
        <div className="headerRight">
          <button className="button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="mainContent">
        <div className="smallSidebar">
          <button className="toggleButton" onClick={toggleSidebar}>
            ☰
          </button>
        </div>

        {sidebarExpanded && (
          <div className="expandedSidebar">
            {userDetails && (
              <div className="userDetails">
                <div className="avatar">
                  {userDetails.tutorName ? userDetails.tutorName.charAt(0) : "?"}
                </div>
                <div className="tutorName">{userDetails.tutorName}</div>
              </div>
            )}
            <button className="sidebarButton" onClick={() => navigate("/my-courses")}>
              My Courses
            </button>
            <button className="sidebarButton" onClick={() => navigate("/create-course")}>
              Create Course
            </button>
          </div>
        )}

        <div className={`rightColumn ${sidebarExpanded ? 'expanded' : ''}`}>
          {userDetails && (
            <div className="welcomeCard">
              <h2>👋 Hello, {userDetails.tutorName}!</h2>
            </div>
          )}

          <div className="courseList">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="courseCard" onClick={() => navigate(`/course/${course.id}`)}>
                  <h3>{course.name}</h3>
                  <p>{course.description}</p>
                </div>
              ))
            ) : (
              <p>No courses available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorDashboard;
