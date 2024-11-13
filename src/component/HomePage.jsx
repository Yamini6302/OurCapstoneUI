import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function HomePage() {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    // Fetch courses from the API
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:7773/api/courses"); // Adjust the URL as needed
        if (response.ok) {
          const data = await response.json();
          setCourses(data); // Assuming data is an array of course objects
        } else {
          console.error("Failed to fetch courses");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchCourses();
  }, []);

  return (
    <>
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          {/* Optional: Add logo here if needed */}
        </div>
        <div style={styles.headerCenter}>
          <input type="text" placeholder="Search..." style={styles.searchBar} />
        </div>
        <div style={styles.headerRight}>
          <button style={styles.button} onClick={() => navigate("/login")}>Login</button>
          <button style={styles.button} onClick={() => navigate("/register")}>Register</button>
        </div>
      </header>

      <div style={styles.mainContent}>
        <div style={styles.leftColumn}>
          {/* Left column for logo */}
          <div style={styles.logoCard}>
            <img src="./logo.png" alt="LMS Logo" style={styles.logoInColumn} />
          </div>
        </div>
        <div style={styles.rightColumn}>
          <div style={styles.welcomeCard}>
            <h2>Welcome to Quick Learn</h2>
          </div>

          <div style={styles.courseList}>
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} style={styles.courseCard}>
                  {course.name}
                </div>
              ))
            ) : (
              <p>No courses available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

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
      flexGrow: 1,
    },
    headerCenter: {
      flexGrow: 2,
      display: "flex",
      justifyContent: "center", // Center the search bar
    },
    headerRight: {
      display: "flex",
      alignItems: "center",
    },
    searchBar: {
      padding: "8px",
      marginRight: "10px",
      borderRadius: "4px",
      border: "1px solid #ccc",
      width: "300px", // Increase width as needed
    },
    button: {
      marginLeft: "10px",
      padding: "8px 12px",
      borderRadius: "4px",
      border: "none",
      backgroundColor: "#FB773C", // Button color
      color: "#FFFFFF",
      cursor: "pointer",
    },

  mainContent: {
    display: "flex",
    flexGrow: 1,
  },
  leftColumn: {
    width: "20%", // Left column width
    backgroundColor: "#EB3678", // Left column color
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start", // Align items to start
    paddingTop: "20px", // Add some padding to top
  },
  logoCard: {
    backgroundColor: "#FFFFFF", // White background for the logo card
    padding: "20px", // Padding around the logo
    borderRadius: "8px", // Rounded corners for the card
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)", // Shadow for depth
  },
  logoInColumn: {
    height: "120px", // Adjust size as needed for visibility in left column
  },
  rightColumn: {
    width: "80%", // Remaining width for right column
    padding: "20px",
    overflowY: "auto", // Allow scrolling if content overflows
  },
  welcomeCard: {
    backgroundColor: "#FFFFFF", // Card color
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    marginBottom: "20px",
  },
  courseList: {
    maxHeight: "400px", // Set max height for scrolling
    overflowY: "auto",   // Allow vertical scrolling
  },
  courseCard: {
    backgroundColor: "#F9F9F9", // Course card color
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "4px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
};

export default HomePage;