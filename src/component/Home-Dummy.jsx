import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 

function HomePage({ userId, roleId, roleType }) { 
  const [courses, setCourses] = useState([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
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

    // Fetch user details based on role (Student or Tutor)
    const fetchUserDetails = async () => {
      const url =
        roleType === "student"
          ? `http://localhost:7773/api/students/${roleId}`
          : `http://localhost:7773/api/tutors/${roleId}`;

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
  }, [roleId, roleType]);

  const toggleSidebar = () => {
    setSidebarExpanded((prev) => !prev);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <img src="./logo.png" alt="Logo" style={styles.logo} />
          <span style={styles.platformName}>
            <span className="quick">Quick</span> 
            <span className="quick">Learn</span> 
          </span>
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
                <img src="./user-avatar.png" alt="User Avatar" style={styles.avatar} />
                <p>{userDetails.name}</p>
                <p>{userDetails.email}</p>
              </div>
            )}
            <button style={styles.sidebarButton}>Option 1</button>
            <button style={styles.sidebarButton}>Option 2</button>
            {/* Additional sidebar options with icons */}
          </div>
        )}

        {/* Main Content */}
        <div style={{ ...styles.rightColumn, width: sidebarExpanded ? "70%" : "100%" }}>
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
    height: "80px", // Increased size for logo
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
    backgroundColor: "#FB773C", // Button color
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
    color: "#FFFFFF",
    cursor: "pointer",
    border: "none",
    marginBottom: "10px",
  },
  expandedSidebar: {
    width: "200px",
    backgroundColor: "#EB3678",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
  },
  userDetails: {
   textAlign:"center", 
   marginBottom:"20px", 
   color:"#FFFFFF"
},
  
avatar:{
   width:"60px", 
   height:"60px", 
   borderRadius:"50%", 
   marginBottom:"10px"
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
   border:"none", 
   textAlign:"left"
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
   boxShadow:"0 2px rgba(0,0,0,.1)"
},
};

export default HomePage;
