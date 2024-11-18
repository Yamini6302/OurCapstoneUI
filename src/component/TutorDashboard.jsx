import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './css/TutorDashboard.css';  // Import the CSS file

// Add this component before the TutorDashboard function
const CourseCard = ({ course, tutorId, onJoin, onView, courseCreator }) => {
    const [isMapped, setIsMapped] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkMapping = async () => {
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
                    setIsMapped(data.tutorIds.includes(tutorId));
                }
            } catch (error) {
                console.error(`Error checking course mapping for ${course.id}:`, error);
            } finally {
                setIsLoading(false);
            }
        };
        
        if (tutorId) {
            checkMapping();
        }
    }, [course.id, tutorId]);

    if (isLoading) {
        return <div className="courseCard"><p>Loading...</p></div>;
    }

    return (
        <div className="courseCard">
            <h3>{course.courseName}</h3>
            <p>{course.description}</p>
            <p className="courseCreator">
                Created by: {courseCreator || 'Loading...'}
            </p>
            {isMapped ? (
                <>
                    <p className="joinedStatus">You have already joined this course</p>
                    <button 
                        className="viewButton"
                        onClick={() => onView(course.id)}
                    >
                        View Course
                    </button>
                </>
            ) : (
                <button 
                    className="joinButton"
                    onClick={() => onJoin(course.id)}
                >
                    Join Course
                </button>
            )}
        </div>
    );
};

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
    
    try {
        // Fetch all course-tutor mappings first
        const courseTutorResponse = await fetch(`http://localhost:7772/api/course-tutors`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            credentials: 'include'
        });

        if (courseTutorResponse.ok) {
            const courseTutorData = await courseTutorResponse.json();
            
            // Check which courses the current tutor is part of
            courseTutorData.forEach(mapping => {
                if (mapping.tutorIds.includes(tutorId) && mapping.courseId) {
                    joined.add(mapping.courseId);
                }
            });

            // Set joined courses
            setJoinedCourses(joined);
            
            // Fetch creator details for each course
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
                        if (data.tutorIds && data.tutorIds.length > 0) {
                            // Fetch the creator's (first tutor) details
                            const creatorResponse = await fetch(`http://localhost:7777/api/tutor/${data.tutorIds[0]}`, {
                                method: "GET",
                                headers: {
                                    "Accept": "application/json",
                                    "Content-Type": "application/json"
                                },
                                credentials: 'include'
                            });

                            if (creatorResponse.ok) {
                                const creatorData = await creatorResponse.json();
                                creators[course.id] = creatorData.tutorName;
                            }
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching creator for course ${course.id}:`, error);
                }
            }
        }
    } catch (error) {
        console.error("Error in fetchCourseCreators:", error);
    }
    
    setCourseCreators(creators);
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
      console.log("Created course:", courseData);

      // Create course-tutor association
      const courseTutorData = {
        courseId: courseData.id || courseData.courseId, // Handle both possible field names
        tutorIds: [tutorId.toString()], // Ensure tutorId is a string
        _class: "com.demo.course_tutor.model.CourseTutor" // Add the class identifier
      };

      console.log("Sending course-tutor data:", courseTutorData); // Debug log

      const tutorResponse = await fetch("http://localhost:7772/api/course-tutors", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify(courseTutorData)
      });
      
      if (!tutorResponse.ok) {
        const errorText = await tutorResponse.text();
        console.error("Tutor association failed:", errorText);
        throw new Error(`Failed to associate tutor: ${errorText}`);
      }

      const tutorAssociationResult = await tutorResponse.json();
      console.log("Course-tutor association created:", tutorAssociationResult);

      setIsModalOpen(false);
      setCourseName("");
      setCourseDescription("");
      alert("Course created successfully!");
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
        setLoading(true);
        console.log("Fetching courses for tutorId:", tutorId);

        // Get all course-tutor mappings
        const response = await fetch(`http://localhost:7772/api/course-tutors`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            credentials: 'include'
        });
        
        if (response.ok) {
            const courseTutorData = await response.json();
            console.log("Course-tutor mappings:", courseTutorData);

            // Filter mappings for the current tutor using complete tutorId
            const relevantMappings = courseTutorData.filter(mapping => 
                mapping.tutorIds.includes(tutorId.toString()) && mapping.courseId // Ensure courseId exists
            );
            console.log("Relevant mappings:", relevantMappings);

            if (relevantMappings.length > 0) {
                // Fetch course details for each mapping
                const courseDetailsPromises = relevantMappings.map(mapping =>
                    fetch(`http://localhost:7773/api/courses/${mapping.courseId}`, {
                        method: "GET",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        },
                        credentials: 'include'
                    })
                    .then(res => res.ok ? res.json() : null)
                    .catch(err => {
                        console.error(`Error fetching course ${mapping.courseId}:`, err);
                        return null;
                    })
                );

                const courseDetails = (await Promise.all(courseDetailsPromises))
                    .filter(course => course !== null); // Remove any failed fetches
                
                console.log("Fetched course details:", courseDetails);
                setMyCourses(courseDetails);
            } else {
                setMyCourses([]);
            }
        }
    } catch (error) {
        console.error("Error fetching my courses:", error);
        setError("Failed to fetch courses");
    } finally {
        setLoading(false);
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

  // Add this new function to check joined courses
  const checkJoinedCourses = async () => {
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
            const courseTutorData = await response.json();
            console.log("Course-tutor mappings:", courseTutorData);
            console.log("Current tutorId:", tutorId);

            // Find all courses where this tutor is mapped
            const joinedCourseIds = new Set(
                courseTutorData
                    .filter(mapping => 
                        mapping.tutorIds.includes(tutorId) && 
                        mapping.courseId
                    )
                    .map(mapping => mapping.courseId)
            );

            console.log("Joined course IDs:", joinedCourseIds);
            setJoinedCourses(joinedCourseIds);
        }
    } catch (error) {
        console.error("Error checking joined courses:", error);
    }
  };

  // Update the useEffect to call checkJoinedCourses when tutorId is available
  useEffect(() => {
    if (tutorId) {
        checkJoinedCourses();
    }
  }, [tutorId]);

  // Add this new function to check if tutor is mapped to a course
  const checkTutorCourseMapping = async (courseId) => {
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
            return data.tutorIds.includes(tutorId);
        }
        return false;
    } catch (error) {
        console.error(`Error checking course mapping for ${courseId}:`, error);
        return false;
    }
  };

  useEffect(() => {
    if (tutorId) {
        setLoading(true);
        fetchMyCourses()
            .finally(() => setLoading(false));
    }
  }, [tutorId]);

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
          <h2 className="sectionTitle">My Courses</h2>
          <div className="courseList">
            {loading ? (
                <p className="loading">Loading your courses...</p>
            ) : error ? (
                <p className="error">{error}</p>
            ) : myCourses.length > 0 ? (
                myCourses.map((course) => (
                    <div key={course.id} className="courseCard">
                        <h3>{course.courseName}</h3>
                        <p>{course.description}</p>
                        <p className="courseCreator">
                            Created by: {courseCreators[course.id] || 'Loading...'}
                        </p>
                        <button 
                            className="viewButton"
                            onClick={() => navigate(`/course/${course.id}`)}
                        >
                            View Course
                        </button>
                    </div>
                ))
            ) : (
                <p className="noCourses">You haven't joined any courses yet.</p>
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
                {loading ? (
                    <p className="loading">Loading your courses...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : myCourses.length > 0 ? (
                    myCourses.map((course) => (
                        <div key={course.id} className="myCourseCard">
                            <h4>{course.courseName}</h4>
                            <p>{course.description}</p>
                            <button 
                                className="viewButton" 
                                onClick={() => { 
                                    setIsMyCoursesModalOpen(false); 
                                    navigate(`/course/${course.id}`); 
                                }}
                            >
                                View Course
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="noCourses">You haven't joined any courses yet.</p>
                )}
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