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
  const [myCourses, setMyCourses] = useState([]);
  const [isMyCoursesModalOpen, setIsMyCoursesModalOpen] = useState(false);
  const [courseCreators, setCourseCreators] = useState({});
  const [joinedCourses, setJoinedCourses] = useState(new Set());
  const [tutorId, setTutorId] = useState(null);

  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");

  // Move fetchCourses outside of useEffect and make it a component function
  const fetchCourses = async () => {
    try {
      const response = await fetch("http://localhost:7773/api/courses", {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    fetchCourses();
    
    const fetchUserDetails = async () => {
      const url = `http://localhost:7777/api/tutor/user/${userId}`;
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setUserDetails({
            ...data,
            fullName: data.tutorName,
            initial: data.tutorName ? data.tutorName.charAt(0).toUpperCase() : 'U'
          });
          setTutorId(data.tutorId);
        } else {
          // If first endpoint fails, try the direct tutor endpoint
          const tutorResponse = await fetch(`http://localhost:7777/api/tutor/${userId}`, {
            method: 'GET',
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
            credentials: 'include'
          });

          if (tutorResponse.ok) {
            const tutorData = await tutorResponse.json();
            setUserDetails({
              ...tutorData,
              fullName: tutorData.tutorName,
              initial: tutorData.tutorName ? tutorData.tutorName.charAt(0).toUpperCase() : 'U'
            });
            setTutorId(tutorData.tutorId);
          } else {
            console.error("Failed to fetch user details - Status:", response.status);
            setUserDetails({
              tutorName: "User",
              tutorId: userId,
              fullName: "User",
              initial: 'U'
            });
            setTutorId(userId);
          }
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        setUserDetails({
          tutorName: "User",
          tutorId: userId,
          fullName: "User",
          initial: 'U'
        });
        setTutorId(userId);
      }
    };

    fetchUserDetails();
  }, [userId, navigate]);

  const fetchCourseCreators = async () => {
    const creators = {};
    const joined = new Set();
    
    for (const course of courses) {
        try {
            const response = await fetch(`http://localhost:7772/api/course-tutors/${course.id}`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                const creatorId = data.tutorIds[0]; // Fetching first tutor ID
                if (data.tutorIds.includes(userId)) {
                    joined.add(course.id);
                }
                
                // Fetch tutor details
                const tutorResponse = await fetch(`http://localhost:7777/api/tutor/${creatorId}`, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    credentials: 'include'
                });
                
                if (tutorResponse.ok) {
                    const tutorData = await tutorResponse.json();
                    creators[course.id] = tutorData.tutorName; // Store tutor name
                }
            }
        } catch (error) {
            console.error("Error fetching course creator:", error);
        }
    }
    
    setCourseCreators(creators);
    setJoinedCourses(joined);
};

  const handleLogout = () => {
    sessionStorage.removeItem("userId");
    navigate("/"); // Redirect to landing page
  };

  // Update handleCreateCourse
  const handleCreateCourse = async () => {
    setLoading(true);
    setError("");
    
    if (!tutorId) {
      setError("Tutor ID not found. Please try again.");
      setLoading(false);
      return;
    }
    
    try {
      // First, create the course
      const courseResponse = await fetch("http://localhost:7773/api/courses", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({
          courseName: courseName,
          description: courseDescription
        })
      });

      if (!courseResponse.ok) {
        throw new Error("Failed to create course");
      }

      const courseData = await courseResponse.json();

      try {
        // Then, create the course-tutor association
        const tutorResponse = await fetch("http://localhost:7772/api/course-tutors", {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          credentials: 'include',
          body: JSON.stringify({
            courseId: courseData.id,
            tutorIds: [parseInt(tutorId)]
          })
        });
        
        // Don't throw error even if tutorResponse is not ok
        console.log("Tutor association response:", tutorResponse.status);
        
      } catch (tutorError) {
        console.warn("Warning: Tutor association might have failed:", tutorError);
        // Continue execution even if this fails
      }

      // Success handling
      setIsModalOpen(false);
      setCourseName("");
      setCourseDescription("");
      alert("Course created successfully!");
      
      // Refresh the course list
      await fetchCourses();
      
    } catch (error) {
      console.error("Error in course creation process:", error);
      setError("Failed to create course. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const fetchMyCourses = async () => {
    try {
        const response = await fetch(`http://localhost:7772/api/course-tutors`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            credentials: 'include'
        });
        if (response.ok) {
            const data = await response.json();
            const myCourseIds = data
                .filter(ct => ct.tutorIds.includes(userId))
                .map(ct => ct.courseId);
            const coursesPromises = myCourseIds.map(courseId =>
                fetch(`http://localhost:7773/api/courses/${courseId}`, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    },
                    credentials: 'include'
                }).then(res => res.json())
            );
            const myCoursesList = await Promise.all(coursesPromises);
            setMyCourses(myCoursesList); // Store fetched courses
        }
    } catch (error) {
        console.error("Error fetching my courses:", error);
    }
};

  const handleJoinCourse = async (courseId) => {
    if (!tutorId) {
      alert("Tutor ID not found. Please try again.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:7772/api/course-tutors/${courseId}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const updatedTutorIds = [...data.tutorIds, tutorId]; // Use tutorId instead of userId

        const updateResponse = await fetch(`http://localhost:7772/api/course-tutors/${courseId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            "Accept": "application/json"
          },
          credentials: 'include',
          body: JSON.stringify({
            courseId: courseId,
            tutorIds: updatedTutorIds
          })
        });

        if (updateResponse.ok) {
          setJoinedCourses(prev => new Set([...prev, courseId]));
          alert("Successfully joined the course!");
        }
      }
    } catch (error) {
      console.error("Error joining course:", error);
      alert("Failed to join course");
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
        <div className="sidebar">
          <div className="userSection">
            <div className="avatar">
              {userDetails?.initial || 'U'}
            </div>
            <div className="userInfo">
              <div className="tutorName">
                <strong>{userDetails?.fullName || 'User'}</strong>
              </div>
              <div className="tutorRole">
                Tutor
              </div>
            </div>
          </div>
          <button 
            className="sidebarButton" 
            onClick={() => {
              fetchMyCourses();
              setIsMyCoursesModalOpen(true);
            }}
          >
            My Courses
          </button>
          <button className="sidebarButton" onClick={() => setIsModalOpen(true)}>
            Create Course
          </button>
        </div>

        <div className="rightColumn">
          {userDetails && (
            <div className="welcomeCard">
              <h2>👋 Hello, {userDetails.tutorName}!</h2>
            </div>
          )}
          <div className="courseList">
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.id} className="courseCard">
                  <h3>{course.courseName}</h3>
                  <p>{course.description}</p>
                  <p className="courseCreator">
                    Created by: {courseCreators[course.id] || 'Loading...'}
                  </p>
                  {joinedCourses.has(course.id) ? (
                    <button 
                      className="viewButton"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      View Course
                    </button>
                  ) : (
                    <button 
                      className="joinButton"
                      onClick={() => handleJoinCourse(course.id)}
                    >
                      Join Course
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>No courses available.</p>
            )}
          </div>
        </div>
      </div>

      {/* My Courses Modal */}
      {isMyCoursesModalOpen && (
    <div className="modalOverlay">
        <div className="modalContent">
            <h3>My Courses</h3>
            <div className="myCoursesList">
                {myCourses.map((course) => (
                    <div key={course.id} className="myCourseCard">
                        <h4>{course.courseName}</h4>
                        <p>{course.description}</p>
                        <button className="viewButton" onClick={() => { 
                            setIsMyCoursesModalOpen(false); 
                            navigate(`/course/${course.id}`); 
                        }}>
                            View Course
                        </button>
                    </div>
                ))}
            </div>
            <div className="modalButtons">
                <button onClick={() => setIsMyCoursesModalOpen(false)}>Close</button>
            </div>
        </div>
    </div>
)}

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