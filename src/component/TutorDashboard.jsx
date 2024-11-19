import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './css/TutorDashboard.css';  // Import the CSS file

// Add this component before the TutorDashboard function
const CourseCard = ({ course }) => {
    return (
        <div className="courseCard" key={course.courseId}>
            <h3>{course.courseName}</h3>
            <p>{course.description}</p>
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
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [forumName, setForumName] = useState('');
  const [isScheduledCoursesModalOpen, setIsScheduledCoursesModalOpen] = useState(false);
  const [scheduledCourses, setScheduledCourses] = useState([]);

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
    
    if (!courseName || !courseDescription) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
    }

    try {
        console.log("Creating course with tutorId:", tutorId);
        const courseResponse = await fetch("http://localhost:7773/api/courses", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({
                courseName: courseName,
                description: courseDescription,
                tutorId: tutorId
            })
        });

        if (!courseResponse.ok) {
            throw new Error("Failed to create course");
        }

        const courseData = await courseResponse.json();
        console.log("Course created:", courseData);

        setIsModalOpen(false);
        setCourseName("");
        setCourseDescription("");
        
        // Fetch updated courses
        await fetchCreatedCourses();
        
    } catch (error) {
        console.error("Error in course creation:", error);
        setError("Failed to create course. Please try again.");
    } finally {
        setLoading(false);
    }
  };
  

  const fetchMyCourses = async () => {
    if (!tutorId) return;
    
    try {
        const response = await fetch(`http://localhost:7772/api/course-tutors/tutor/${tutorId}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch mapped courses');
        }

        const data = await response.json();
        setMyCourses(data);
    } catch (error) {
        console.error("Error fetching mapped courses:", error);
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
        fetchMyCourses();
    }
  }, [tutorId]);

  // Add this function to handle course scheduling
  const handleScheduleCourse = async () => {
    if (!selectedCourseId || !startDate || !forumName) {
        setError("Please fill in all fields");
        return;
    }

    try {
        // First create course-tutor entry
        const courseTutorResponse = await fetch("http://localhost:7772/api/course-tutors", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify({
                courseId: selectedCourseId,
                tutorIds: [tutorId],
                startDate: new Date(startDate),
                _class: "com.demo.course_tutor.model.CourseTutor"
            })
        });

        if (!courseTutorResponse.ok) {
            const errorText = await courseTutorResponse.text();
            console.error("Course-tutor creation failed:", errorText);
            throw new Error("Failed to create course-tutor mapping");
        }

        const courseTutorData = await courseTutorResponse.json();
        console.log("Course-tutor mapping created:", courseTutorData);

        // Extract the correct ID from the response
        const ctId = courseTutorData.courseTutor.ctid;
        console.log("Using ctId for forum creation:", ctId);

        // Then create forum entry
        const forumResponse = await fetch("http://localhost:7771/api/forum", {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ctId: ctId,
                forumName: forumName,
                _class: "com.demo.forum.model.Forum"
            })
        });

        if (!forumResponse.ok) {
            console.error("Forum creation failed with status:", forumResponse.status);
            const errorText = await forumResponse.text();
            console.error("Forum error details:", errorText);
            throw new Error("Failed to create forum");
        }

        const forumData = await forumResponse.json();
        console.log("Forum created successfully:", forumData);

        // Success handling
        setIsScheduleModalOpen(false);
        setSelectedCourseId('');
        setStartDate('');
        setForumName('');
        setError('');
        alert("Course scheduled successfully with forum!");
        
        // Refresh the courses list
        await fetchMyCourses();

    } catch (error) {
        console.error("Error in course scheduling:", error);
        setError(`Failed to schedule course: ${error.message}`);
    }
  };

  // Update fetchCreatedCourses to only get courses created by the current tutor
  const fetchCreatedCourses = async () => {
    if (!tutorId) {
        console.log("No tutorId available");
        return;
    }
    
    try {
        console.log("Fetching courses for tutorId:", tutorId);
        const response = await fetch(`http://localhost:7773/api/courses/tutor/${tutorId}`, {
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
        console.log("Fetched courses:", data);
        setCourses(data);
    } catch (error) {
        console.error("Error fetching created courses:", error);
        setError("Failed to fetch courses");
    }
  };

  // Update useEffect to use the new fetch function
  useEffect(() => {
    if (tutorId) {
        fetchCreatedCourses();
    }
  }, [tutorId]);

  // Add function to fetch scheduled courses
  const fetchScheduledCourses = async () => {
    try {
        // First get all forums for this tutor
        const forumResponse = await fetch(`http://localhost:7771/api/forum/tutor/${tutorId}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (!forumResponse.ok) {
            throw new Error("Failed to fetch forums");
        }

        const forums = await forumResponse.json();
        
        // Get course details for each forum's course
        const coursesData = await Promise.all(
            forums.map(async (forum) => {
                const courseResponse = await fetch(`http://localhost:7773/api/courses/${forum.courseId}`, {
                    method: "GET",
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                    }
                });
                if (courseResponse.ok) {
                    const course = await courseResponse.json();
                    return {
                        ...course,
                        forumName: forum.forumName,
                        startDate: forum.startDate
                    };
                }
                return null;
            })
        );

        setScheduledCourses(coursesData.filter(course => course !== null));
    } catch (error) {
        console.error("Error fetching scheduled courses:", error);
        setError("Failed to fetch scheduled courses");
    }
  };

  // Add this function to fetch and display scheduled courses
  const handleViewScheduledCourses = async () => {
    if (!tutorId) {
        console.error("No tutor ID available");
        return;
    }

    try {
        console.log("Fetching scheduled courses for tutorId:", tutorId);
        
        // Fetch course-tutor mappings
        const courseTutorUrl = `http://localhost:7772/api/course-tutors/tutor/${tutorId}`;
        console.log("Fetching from URL:", courseTutorUrl);
        
        const courseTutorResponse = await fetch(courseTutorUrl, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (!courseTutorResponse.ok) {
            const errorText = await courseTutorResponse.text();
            console.error("Course-tutor response error:", errorText);
            throw new Error(`HTTP error! status: ${courseTutorResponse.status}`);
        }

        const courseTutorMappings = await courseTutorResponse.json();
        console.log("Course-tutor mappings received:", courseTutorMappings);

        if (!courseTutorMappings || courseTutorMappings.length === 0) {
            console.log("No scheduled courses found");
            setScheduledCourses([]);
            setIsScheduledCoursesModalOpen(true);
            return;
        }

        // Fetch course details for each mapping
        const scheduledCoursesData = await Promise.all(
            courseTutorMappings.map(async (mapping) => {
                try {
                    const courseUrl = `http://localhost:7773/api/courses/${mapping.courseId}`;
                    console.log("Fetching course details from:", courseUrl);
                    
                    const courseResponse = await fetch(courseUrl, {
                        method: "GET",
                        headers: {
                            "Accept": "application/json",
                            "Content-Type": "application/json"
                        }
                    });

                    if (!courseResponse.ok) {
                        throw new Error(`Failed to fetch course: ${courseResponse.status}`);
                    }

                    const courseData = await courseResponse.json();
                    console.log("Course data received for", mapping.courseId, ":", courseData);

                    return {
                        ctid: mapping.ctid,
                        startDate: mapping.startDate,
                        course: courseData
                    };
                } catch (error) {
                    console.error("Error fetching course details:", error);
                    return null;
                }
            })
        );

        const validCourses = scheduledCoursesData.filter(course => course !== null);
        console.log("Final scheduled courses data:", validCourses);

        setScheduledCourses(validCourses);
        setIsScheduledCoursesModalOpen(true);

    } catch (error) {
        console.error("Error in handleViewScheduledCourses:", error);
        setError(`Failed to fetch scheduled courses: ${error.message}`);
    }
  };

  // Add these handler functions at the top of your component
  const handleOpenForum = async (ctId) => {
    try {
        const response = await fetch(`http://localhost:7771/api/forum/ct/${ctId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch forum details");
        }
        const forumData = await response.json();
        // Navigate to forum page
        window.location.href = `/forum/${forumData.id}`;
    } catch (error) {
        console.error("Error opening forum:", error);
        setError("Failed to open forum");
    }
  };

  const handleDeleteForum = async (ctId) => {
    try {
        const confirmDelete = window.confirm("Are you sure you want to delete this forum?");
        if (!confirmDelete) return;

        const response = await fetch(`http://localhost:7771/api/forum/ct/${ctId}`, {
            method: 'DELETE',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to delete forum");
        }

        // Refresh the scheduled courses list
        await handleViewScheduledCourses();
        
        // Show success message
        alert("Forum deleted successfully!");
    } catch (error) {
        console.error("Error deleting forum:", error);
        setError("Failed to delete forum");
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
          <div className="sidebarButtons">
            <button className="sidebarButton" onClick={() => setIsModalOpen(true)}>
                Create Course
            </button>
            <button className="sidebarButton" onClick={() => setIsScheduleModalOpen(true)}>
                Schedule Course
            </button>
            <button className="sidebarButton" onClick={handleViewScheduledCourses}>
                View Scheduled Courses
            </button>
          </div>
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
            ) : courses && courses.length > 0 ? (
                courses.map((course) => (
                    <CourseCard 
                        key={course.courseId} 
                        course={course}
                    />
                ))
            ) : (
                <p className="noCourses">You haven't created any courses yet.</p>
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
      
      {/* Schedule Course Modal */}
      {isScheduleModalOpen && (
          <div className="modalOverlay">
              <div className="modalContent">
                  <h3>Schedule Course</h3>
                  <div className="modalInputGroup">
                      <select 
                          className="modalInput"
                          value={selectedCourseId}
                          onChange={(e) => setSelectedCourseId(e.target.value)}
                      >
                          <option value="">Select a Course</option>
                          {courses && courses.map(course => (
                              <option key={course.courseId} value={course.courseId}>
                                  {course.courseName}
                              </option>
                          ))}
                      </select>
                      {(!courses || courses.length === 0) && (
                          <p className="noCoursesMessage">No courses available. Create a course first.</p>
                      )}
                      <input 
                          type="date"
                          className="modalInput"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                      />
                      <input
                          type="text"
                          className="modalInput"
                          placeholder="Forum Name"
                          value={forumName}
                          onChange={(e) => setForumName(e.target.value)}
                      />
                  </div>
                  {error && <p className="error">{error}</p>}
                  <div className="modalButtons">
                      <button 
                          onClick={handleScheduleCourse}
                          disabled={courses.length === 0}
                      >
                          Schedule Course
                      </button>
                      <button onClick={() => {
                          setIsScheduleModalOpen(false);
                          setSelectedCourseId('');
                          setStartDate('');
                          setForumName('');
                          setError('');
                      }}>
                          Cancel
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Scheduled Courses Modal */}
      {isScheduledCoursesModalOpen && (
          <div className="modalOverlay">
              <div className="modalContent scheduledCoursesModal">
                  <h3>Scheduled Courses</h3>
                  <div className="scheduledCoursesList">
                      {scheduledCourses.length > 0 ? (
                          scheduledCourses.map((item) => (
                              <div key={item.ctid} className="scheduledCourseCard">
                                  <h4>{item.course.courseName}</h4>
                                  <p>{item.course.description || "No description available"}</p>
                                  <div className="courseDetails">
                                      <span className="startDate">
                                          Starts: {new Date(item.startDate).toLocaleDateString()}
                                      </span>
                                      <div className="cardButtons">
                                          <button 
                                              className="openForumButton"
                                              onClick={() => handleOpenForum(item.ctid)}
                                          >
                                              Open Forum
                                          </button>
                                          <button 
                                              className="deleteForumButton"
                                              onClick={() => handleDeleteForum(item.ctid)}
                                          >
                                              Delete Forum
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          ))
                      ) : (
                          <p className="noCoursesMessage">No scheduled courses found</p>
                      )}
                  </div>
                  <div className="modalButtons">
                      <button 
                          className="closeButton"
                          onClick={() => setIsScheduledCoursesModalOpen(false)}
                      >
                          Close
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

export default TutorDashboard;