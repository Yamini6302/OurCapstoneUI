import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
    margin: 0,
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#180161",
    padding: "10px 20px",
    color: "#FFFFFF",
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
  },
  logo: {
    height: "60px", // Increased size for logo
    marginRight: "10px",
  },
  platformName: {
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
  },
  button: {
    marginLeft: "10px",
    padding: "8px 12px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: "#FB773C",
    color: "#FFFFFF",
    cursor: "pointer",
  },
  headerCenter: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },
  searchBar: {
    padding: "8px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    width: "300px",
  },
  mainContent: {
    display: "flex",
    flexGrow: 1,
  },
  smallSidebar: {
    width: "60px",
    backgroundColor: "#EB3678", // Pink color for the small sidebar
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "10px",
    transition: "width 0.3s ease",
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)", // Subtle shadow for small sidebar
  },
  toggleButton: {
    width: "40px", // Set width of the button
    height: "40px", // Set height of the button
    borderRadius: "4px", // Rounded corners
    backgroundColor: "#FB773C", // Orange color for the button
    color: "#FFFFFF", // White color for the symbol
    cursor: "pointer", // Pointer cursor on hover
    border: "none", // No border
    marginBottom: "10px", // Space below the button
    display: "flex", // Use flexbox to center the content
    justifyContent: "center", // Center horizontally
    alignItems: "center", // Center vertically
    fontSize: "24px", // Set the font size for the symbol
    textAlign: "center", // Ensure text is centered
  },
  expandedSidebar: {
    width: "250px", // Expanded width
    backgroundColor: "#EB3678", // Pink
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.3)", // Stronger shadow for expanded sidebar
    transition: "width 0.3s ease",
  },
  userDetails: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    width: "70px", // Slightly larger avatar
    height: "70px",
    borderRadius: "50%",
    marginBottom: "10px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "24px",
    fontWeight: "bold",
    backgroundColor: "#FB773C", // Orange avatar background
    color: "#FFFFFF",
  },
  tutorName: {
    fontSize: "16px", // Adjusted font size for the name
    fontWeight: "bold",
    color: "#FFFFFF",
    marginTop: "8px", // Space between avatar and name
  },
  sidebarButton: {
    display: "flex",
    alignItems: "center",
    margin: "10px",
    padding: "10px",
    borderRadius: "4px",
    backgroundColor: "#FFFFF", 
    color: "1A1A1D", 
    cursor: "pointer",
    border: "none",
    width: "100%",
    justifyContent: "flex-start", // Align text to the left
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)", // Subtle shadow for sidebar buttons
  },
  rightColumn: {
    padding: "20px",
    overflowY: "auto",
    flexGrow: 1,
  },
  welcomeCard: {
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px rgba(0,0,0,.1)",
    marginBottom: "20px",
  },
  courseList: {
    maxHeight: "400px",
    overflowY: "auto",
  },
  courseCard: {
    backgroundColor: "#F9F9F9",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "4px",
    boxShadow: "0 2px rgba(0,0,0,.1)",
    cursor: "pointer",
  },
};

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
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src="/logo.png" alt="Logo" style={styles.logo} />
          <span style={styles.platformName}>
            <span className="quick">Quick </span>
            <span className="quick">Learn</span>
          </span>
        </div>
        <div style={styles.headerCenter}>
          <input type="text" placeholder="Search..." style={styles.searchBar} />
        </div>
        <div style={styles.headerRight}>
          <button style={styles.button} onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div style={styles.mainContent}>
        <div style={styles.smallSidebar}>
          <button style={styles.toggleButton} onClick={toggleSidebar}>
            ☰
          </button>
        </div>

        {sidebarExpanded && (
          <div style={styles.expandedSidebar}>
            {userDetails && (
              <div style={styles.userDetails}>
                <div style={styles.avatar}>
                  {userDetails.tutorName ? userDetails.tutorName.charAt(0) : "?"}
                </div>
                <div style={styles.tutorName}>{userDetails.tutorName}</div>
              </div>
            )}
            <button style={styles.sidebarButton} onClick={() => navigate("/my-courses")}>
              My Courses
            </button>
            <button style={styles.sidebarButton} onClick={() => navigate("/create-course")}>
              Create Course
            </button>
          </div>
        )}

        <div style={{ ...styles.rightColumn, width: sidebarExpanded ? "70%" : "100%" }}>
          {userDetails && (
            <div style={styles.welcomeCard}>
              <h2>👋 Hello, {userDetails.tutorName}!</h2>
            </div>
          )}

          <div style={styles.courseList}>
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} style={styles.courseCard} onClick={() => navigate(`/course/${course.id}`)}>
                  <h4>{course.name}</h4>
                  <p>Taught by: {course.tutorName}</p>
                </div>
              ))
            ) : (
              <p>No courses available.</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .quick {
          display: inline-block;
          animation: dance 1s infinite alternate;
        }

        @keyframes dance {
          0% { transform: translateX(6px); }
          50% { transform: translateX(4px); }
          100% { transform: translateX(-4px); }
        }
      `}</style>
    </div>
  );
}

export default TutorDashboard;
