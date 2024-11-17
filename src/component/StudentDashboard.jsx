import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './css/StudentDashboard.css';  // Import the new CSS for the student dashboard

function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");  // For showing error message if any

  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:7773/api/courses", {
          method: "GET",
          headers: {
            "Accept": "application/json"
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch courses: ${response.statusText}`);
        }

        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    const fetchUserDetails = async () => {
      const url = `http://localhost:7778/api/student/user/${userId}`;
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
            <span className="quick">Quick</span> 
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
        <div className="sidebar">
          {userDetails && (
            <div className="userSection">
              <div className="avatar">
                {userDetails.studentName ? userDetails.studentName.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="studentName">
                <strong>{userDetails.studentName}</strong>
              </div>
            </div>
          )}
          <button className="sidebarButton" onClick={() => navigate("/enrolled-courses")}>
            Courses Enrolled
          </button>
        </div>

        <div className="rightColumn">
          {userDetails && (
            <div className="welcomeCard">
              <h2>👋 Hello, {userDetails.studentName}!</h2>
            </div>
          )}
          <div className="courseList">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="courseCard">
                  <h3>{course.courseName}</h3>
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

export default StudentDashboard;
