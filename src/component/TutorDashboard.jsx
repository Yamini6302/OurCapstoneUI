import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import Lottie from "lottie-react"; 

function TutorDashboard({ userId, roleId, roleType }) { 
  const [courses, setCourses] = useState([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(true); // Start with sidebar expanded
  const [userDetails, setUserDetails] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch courses
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

    // Fetch user details based on role (Tutor)
    const fetchUserDetails = async () => {
      const url = `http://localhost:7773/api/tutors/${roleId}`;

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
  }, [roleId]);

  const toggleSidebar = () => {
    setSidebarExpanded((prev) => !prev);
  };

  const handleLogout = () => {
    // Clear sessionStorage or any authentication tokens if needed
    sessionStorage.removeItem("userId"); // Example of clearing userId
    navigate("/"); // Redirect to landing page
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src="./logo.png" alt="Logo" style={styles.logo} />
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
        {/* Fixed Sidebar with Toggle Button at the Top */}
        <div style={styles.smallSidebar}>
          <button style={styles.toggleButton} onClick={toggleSidebar}>
            ☰
          </button>
        </div>

        {/* Expandable Sidebar */}
        {sidebarExpanded && (
          <div style={styles.expandedSidebar}>
            {userDetails && (
              <div style={styles.userDetails}>
                <div style={styles.avatar}>{userDetails.name.charAt(0)}</div>
                <p>{userDetails.name}</p>
              </div>
            )}
            <button style={styles.sidebarButton} onClick={() => navigate("/my-courses")}>My Courses</button>
            <button style={styles.sidebarButton} onClick={() => navigate("/create-course")}>Create Course</button>
          </div>
        )}

        {/* Main Content */}
        <div style={{ ...styles.rightColumn, width: sidebarExpanded ? "70%" : "100%" }}>
          {userDetails && (
            <div style={styles.welcomeCard}>
              <h2>👋 Hello, {userDetails.name}!</h2> {/* Greeting with emoji */}
            </div>
          )}

          {/* Course List Section */}
          <div style={styles.courseList}>
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} style={styles.courseCard} onClick={() => navigate(`/course/${course.id}`)}>
                  <h4>{course.name}</h4>
                  <p>Taught by: {course.tutorName}</p> {/* Assuming course object has tutorName */}
                </div>
              ))
            ) : (
              <p>No courses available.</p>
            )}
          </div>
        </div>
      </div>
   
  {/* CSS for Animation */}
      <style>{`
        .quick {
          display: inline-block;
          animation: dance 1s infinite alternate;
        }

        @keyframes dance {
          0% { transform: translateX(6); }
          50% { transform: translateX(4px); }
          100% { transform: translateX(-4px); }
        }
      `}</style>

    </div>
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
    width: "50px",
    backgroundColor: "#EB3678",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "10px",
  },
  toggleButton: {
    width: "40px",
    height: "40px",
    borderRadius: "4px",
    backgroundColor: "#FB773C", 
    color:"#FFFFFF", 
     cursor:"pointer", 
     border:"none", 
     marginBottom:"10px"
   },
   expandedSidebar:{
     width:"200px", 
     backgroundColor:"#EB3678", 
     display:"flex", 
     flexDirection:"column", 
     padding:"20px", 
     boxShadow:"0 4px rgba(0,0,0,.3)"
   },
   userDetails:{
     textAlign:"center", 
     marginBottom:"20px", 
     color:"#FFFFFF"
   },
   avatar:{
     width:"60px", 
     height:"60px", 
     borderRadius:"50%", 
     marginBottom:"10px", 
     display:"flex", 
     justifyContent:"center", 
     alignItems:"center", 
     fontSize:"24px", 
     fontWeight:"bold", 
     backgroundColor:"#FB773C"
   },
   sidebarButton:{
     display:"flex", 
     alignItems:"center", 
     margin:"10px", 
     padding:"10px", 
     borderRadius:"4px", 
     backgroundColor:"#FB773C", 
     color:"#FFFFFF", 
     cursor:"pointer", 
     border:"none"
   },
   rightColumn:{
     padding:"20px", 
     overflowY:"auto"
   },
   welcomeCard:{
     backgroundColor:"rgba(255,255,255,0.8)", 
     padding:"20px", 
     borderRadius:"8px", 
     boxShadow:"0 4px rgba(0,0,0,.1)", 
     marginBottom:"20px"
   },
   courseList:{
       maxHeight:"400px", 
       overflowY:"auto"
   },
   courseCard:{
       backgroundColor:"#F9F9F9",  
       padding:"15px",  
       marginBottom:"10px",  
       borderRadius:"4px",  
       boxShadow:"0 2px rgba(0,0,0,.1)",
       cursor:'pointer'
   }
};

export default TutorDashboard;