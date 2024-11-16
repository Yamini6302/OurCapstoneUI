import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './css/TutorDashboard.css';  // Import the CSS file

function TutorDashboard() {
  const [courses, setCourses] = useState([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);  // For handling modal state
  const [courseName, setCourseName] = useState("");  // For storing course name
  const [courseDescription, setCourseDescription] = useState("");  // For storing course description
  const [loading, setLoading] = useState(false);  // For showing loading state
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

  // Function to handle course creation
  const handleCreateCourse = async () => {
    setLoading(true);
    setError("");  // Reset error

    const courseData = {
      name: courseName,
      description: courseDescription,
    };

    try {
      const response = await fetch("http://localhost:7773/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (response.ok) {
        setIsModalOpen(false);  // Close the modal on success
        alert("Course created successfully!");
        fetchCourses();  // Refresh the course list
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create course.");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      setError("An error occurred while creating the course.");
    } finally {
      setLoading(false);
    }
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
        <div className="smallSidebar">
          <button className="toggleButton" onClick={toggleSidebar}>
            ☰
          </button>
        </div>

        {sidebarExpanded && (
          <div className="mainContent">
          <div className="sidebar">
            {userDetails && (
              <div className="userSection">
                <div className="avatar">
                  {userDetails.tutorName ? userDetails.tutorName.charAt(0) : "?"}
                </div>
                <div className="tutorName"><bold>{userDetails.tutorName}</bold></div>
              </div>
            )}
            <button className="sidebarButton" onClick={() => navigate("/my-courses")}>
              My Courses
            </button>
            <button className="sidebarButton" onClick={() => setIsModalOpen(true)}>
              Create Course
            </button>
          </div>
          </div>
        )}

        <div className={`rightColumn ${sidebarExpanded ? "expanded" : ""}`}>
          {userDetails && (
            <div className="welcomeCard">
              <h2>👋 Hello, {userDetails.tutorName}!</h2>
            </div>
          )}

          <div className="courseList">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="courseCard" onClick={() => navigate(`/course/${course.id}`)}>
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

      {/* Modal for course creation */}
      {isModalOpen && (
        <div className="modalOverlay">
          <div className="modalContent">
            <h3>Create a New Course</h3>
            <input
              type="text"
              placeholder="Course Name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="modalInput"
            />
            <textarea
              placeholder="Course Description"
              value={courseDescription}
              onChange={(e) => setCourseDescription(e.target.value)}
              className="modalInput"
            />
            {error && <p className="error">{error}</p>}
            <div className="modalButtons">
              <button onClick={handleCreateCourse} disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </button>
              <button onClick={() => setIsModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default TutorDashboard;
