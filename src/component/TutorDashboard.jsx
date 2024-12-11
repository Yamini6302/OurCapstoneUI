import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './css/TutorDashboard.css';  // Import the CSS file

// Add this component before the TutorDashboard function
const CourseCard = ({ course }) => {
    return (
        <div className="tutor-dash-course-card" key={course.courseId}>
            <h3 className="tutor-dash-course-title">{course.courseName}</h3>
            <p className="tutor-dash-course-description">{course.description}</p>
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
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('myCourses'); // 'myCourses' or 'scheduledCourses'
  const [forumData, setForumData] = useState({});

  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    const userRole = sessionStorage.getItem("userRole");
    if (!userRole) {
        sessionStorage.setItem("userRole", "tutor");
        console.log("Role set in TutorDashboard: tutor"); // Debugging line
    }
  }, []);

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
        const courseTutorResponse = await fetch(`http://localhost:7772/api/course-tutors/tutor/${tutorId}`);
        if (!courseTutorResponse.ok) {
            throw new Error(`HTTP error! status: ${courseTutorResponse.status}`);
        }

        const courseTutorMappings = await courseTutorResponse.json();
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
        setScheduledCourses(validCourses);

    } catch (error) {
        console.error("Error in handleViewScheduledCourses:", error);
        setError(`Failed to fetch scheduled courses: ${error.message}`);
    }
  };

  // Add these handler functions at the top of your component
  const handleOpenForum = async (ctId) => {
    try {
        // First, fetch the forum details using the ctId
        const response = await fetch(`http://localhost:7771/api/forum/ct/${ctId}`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error("Failed to fetch forum details");
        }

        const forumData = await response.json();
        
        // Check if we got valid forum data
        if (!forumData || !forumData.forud) {
            console.error("Invalid forum data received:", forumData);
            alert("Forum not found");
            return;
        }

        // Navigate to the forum page with the correct ID
        navigate(`/forum/${forumData.forumid}`);
    } catch (error) {
        console.error("Error opening forum:", error);
        alert("Failed to open forum: " + error.message);
    }
  };

  const handleDeleteForum = async (ctId) => {
    try {
        const confirmDelete = window.confirm("Are you sure you want to delete this forum and its associated course-tutor mapping?");
        if (!confirmDelete) return;

        console.log("Attempting to delete forum with ctId:", ctId);

        const response = await fetch(`http://localhost:7771/api/forum/ct/${ctId}`, {
            method: 'DELETE',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            credentials: 'include'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to delete forum: ${errorText}`);
        }

        // Update local state to remove the deleted forum
        setForumData(prev => {
            const updated = { ...prev };
            delete updated[ctId];
            return updated;
        });

        // Remove from scheduled courses
        setScheduledCourses(prev => 
            prev.filter(course => course.ctid !== ctId)
        );

        // Show success message
        setError('Forum and course-tutor mapping deleted successfully');
        setTimeout(() => setError(''), 3000);

        // Refresh the scheduled courses list
        await fetchScheduledCourses();

    } catch (error) {
        console.error("Error deleting forum:", error);
        setError(`Failed to delete forum: ${error.message}`);
    }
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter((course) =>
    course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChangePassword = () => {
    sessionStorage.setItem("userRole", "tutor");
    navigate("/change-password");
  };

  return (
    <div className="tutor-dash-container">
      <header className="tutor-dash-header">
        <div className="tutor-dash-header-left">
          <img src="/logo.png" alt="Logo" className="tutor-dash-logo" />
          <span className="tutor-dash-platform-name">
            <span className="tutor-dash-quick">Quick</span>
            <span className="tutor-dash-learn">Learn</span>
          </span>
        </div>
        <div className="tutor-dash-header-center">
          <input
            type="text"
            className="tutor-dash-search-bar"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="tutor-dash-header-right">
          <button className="tutor-dash-button" onClick={handleChangePassword}>
            Change Profile Password
          </button>
          <button className="tutor-dash-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="tutor-dash-main-content">
        <div className="tutor-dash-sidebar">
            <div className="tutor-dash-user-section">
                <div className="tutor-dash-avatar">
                    {userDetails?.tutorName?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="tutor-dash-tutor-name">
                    {userDetails?.tutorName || "Tutor"}
                </div>
                <div className="tutor-dash-user-role">
                    Tutor
                </div>
            </div>
            <div className="tutor-dash-sidebar-menu">
                <button className="tutor-dash-sidebar-button" onClick={() => setIsModalOpen(true)}>
                    Create Course
                </button>
                <button className="tutor-dash-sidebar-button" onClick={() => setIsScheduleModalOpen(true)}>
                    Schedule Course
                </button>
            </div>
        </div>
        
        <div className="tutor-dash-content">
            <div className="tutor-dash-welcome-card">
                <div className="tutor-dash-welcome-header">
                    
                    <div className="tutor-dash-welcome-text">
                        <h1>👋 Hello, {userDetails?.fullName}!</h1>
                        <p>Manage your courses and schedule from here</p>
                    </div>
                </div>
            </div>

            <div className="tutor-dash-divider"></div>

            <div className="tutor-dash-nav-tabs">
                <button 
                    className={`tutor-dash-nav-tab ${activeTab === 'myCourses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('myCourses')}
                >
                    My Courses
                </button>
                <button 
                    className={`tutor-dash-nav-tab ${activeTab === 'scheduledCourses' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('scheduledCourses');
                        handleViewScheduledCourses();
                    }}
                >
                    View Scheduled Courses
                </button>
            </div>

            <div className="tutor-dash-tab-content">
                {activeTab === 'myCourses' ? (
                    <div className="tutor-dash-course-grid">
                        {filteredCourses.map((course) => (
                            <CourseCard key={course.courseId} course={course} />
                        ))}
                    </div>
                ) : (
                    <div className="tutor-dash-course-grid">
                        {scheduledCourses.map((item) => (
                            <div key={item.ctid} className="tutor-dash-scheduled-course-card">
                                <h4>{item.course.courseName}</h4>
                                <p>{item.course.description || "No description available"}</p>
                                <div className="tutor-dash-course-details">
                                    <span className="tutor-dash-start-date">
                                        Starts: {new Date(item.startDate).toLocaleDateString()}
                                    </span>
                                    <div className="tutor-dash-card-buttons">
                                        <button 
                                            className="tutor-dash-open-forum-button"
                                            onClick={() => navigate(`/forum/${item.forumId}`)}
                                        >
                                            <span className="button-icon">📝</span>
                                            Open Forum
                                        </button>
                                        <button 
                                            className="tutor-dash-delete-forum-button"
                                            onClick={() => handleDeleteForum(item.ctid)}
                                        >
                                            <span className="button-icon">🗑️</span>
                                            Delete Forum
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* My Courses Modal */}
      {isMyCoursesModalOpen && (
    <div className="tutor-dash-modal-overlay">
        <div className="tutor-dash-modal-content">
            <h3>My Courses</h3>
            <div className="tutor-dash-my-courses-list">
                {loading ? (
                    <p className="tutor-dash-loading">Loading your courses...</p>
                ) : error ? (
                    <p className="tutor-dash-error">{error}</p>
                ) : myCourses.length > 0 ? (
                    myCourses.map((course) => (
                        <div key={course.id} className="tutor-dash-my-course-card">
                            <h4>{course.courseName}</h4>
                            <p>{course.description}</p>
                            <button 
                                className="tutor-dash-view-button" 
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
                    <p className="tutor-dash-no-courses">You haven't joined any courses yet.</p>
                )}
            </div>
            <div className="tutor-dash-modal-buttons">
                <button onClick={() => setIsMyCoursesModalOpen(false)}>Close</button>
            </div>
        </div>
    </div>
)}

      {/* Modal for course creation */}
      {isModalOpen && (
        <div className="tutor-dash-modal-overlay">
            <div className="tutor-dash-modal-content">
                <h2 className="tutor-dash-modal-title">Create New Course</h2>
                <div className="tutor-dash-input-group">
                    <input
                        type="text"
                        placeholder=" "
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                    />
                    <label>Course Name</label>
                </div>
                <div className="tutor-dash-input-group">
                    <textarea
                        placeholder=" "
                        value={courseDescription}
                        onChange={(e) => setCourseDescription(e.target.value)}
                    />
                    <label>Course Description</label>
                </div>
                {error && <div className="tutor-dash-error-message">{error}</div>}
                <div className="tutor-dash-modal-buttons">
                    <button 
                        className="tutor-dash-modal-button tutor-dash-modal-button-secondary"
                        onClick={() => setIsModalOpen(false)}
                    >
                        Cancel
                    </button>
                    <button 
                        className="tutor-dash-modal-button tutor-dash-modal-button-primary"
                        onClick={handleCreateCourse}
                        disabled={loading}
                    >
                        {loading ? "Creating..." : "Create Course"}
                    </button>
                </div>
            </div>
        </div>
      )}
      
      {/* Schedule Course Modal */}
      {isScheduleModalOpen && (
          <div className="tutor-dash-modal-overlay">
              <div className="tutor-dash-modal-content">
                  <h2 className="tutor-dash-modal-title">Schedule Course</h2>
                  <div className="tutor-dash-input-group">
                      <select 
                          value={selectedCourseId}
                          onChange={(e) => setSelectedCourseId(e.target.value)}
                          className="tutor-dash-select"
                          style={{
                              backgroundColor: '#1a1a1a',
                              color: '#ffffff',
                              border: '1px solid #333'
                          }}
                      >
                          <option value="" style={{backgroundColor: '#1a1a1a', color: '#ffffff'}}>Select a Course</option>
                          {courses && courses.map(course => (
                              <option 
                                  key={course.courseId} 
                                  value={course.courseId}
                                  style={{backgroundColor: '#1a1a1a', color: '#ffffff'}}
                              >
                                  {course.courseName}
                              </option>
                          ))}
                      </select>
                      <label>Select Course</label>
                  </div>
                  <div className="tutor-dash-input-group">
                      <input 
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          placeholder=" "
                          className="tutor-dash-date-input"
                      />
                      <label>Start Date</label>
                  </div>
                  <div className="tutor-dash-input-group">
                      <input
                          type="text"
                          placeholder=" "
                          value={forumName}
                          onChange={(e) => setForumName(e.target.value)}
                      />
                      <label>Forum Name</label>
                  </div>
                  {error && <div className="tutor-dash-error-message">{error}</div>}
                  <div className="tutor-dash-modal-buttons">
                      <button 
                          className="tutor-dash-modal-button tutor-dash-modal-button-secondary"
                          onClick={() => {
                              setIsScheduleModalOpen(false);
                              setSelectedCourseId('');
                              setStartDate('');
                              setForumName('');
                              setError('');
                          }}
                      >
                          Cancel
                      </button>
                      <button 
                          className="tutor-dash-modal-button tutor-dash-modal-button-primary"
                          onClick={handleScheduleCourse}
                          disabled={courses.length === 0}
                      >
                          Schedule Course
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Scheduled Courses Modal */}
      {isScheduledCoursesModalOpen && (
          <div className="tutor-dash-modal-overlay">
              <div className="tutor-dash-modal-content tutor-dash-scheduled-courses-modal">
                  <button 
                      className="tutor-dash-modal-close-button"
                      onClick={() => setIsScheduledCoursesModalOpen(false)}
                  >
                      ✕
                  </button>
                  <h2 className="tutor-dash-modal-title">Scheduled Courses</h2>
                  <div className="tutor-dash-scheduled-courses-list">
                      {scheduledCourses.length > 0 ? (
                          scheduledCourses.map((item) => (
                              <div key={item.ctid} className="tutor-dash-scheduled-course-card">
                                  <h4>{item.course.courseName}</h4>
                                  <p>{item.course.description || "No description available"}</p>
                                  <div className="tutor-dash-course-details">
                                      <span className="tutor-dash-start-date">
                                          Starts: {new Date(item.startDate).toLocaleDateString()}
                                      </span>
                                      <div className="tutor-dash-card-buttons">
                                          <button 
                                              className="tutor-dash-open-forum-button"
                                              onClick={() => navigate(`/forum/${item.forumId}`)}
                                          >
                                              <span className="button-icon">📝</span>
                                              Open Forum
                                          </button>
                                          <button 
                                              className="tutor-dash-delete-forum-button"
                                              onClick={() => handleDeleteForum(item.ctid)}
                                          >
                                              <span className="button-icon">🗑️</span>
                                              Delete Forum
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          ))
                      ) : (
                          <p className="tutor-dash-no-courses-message">No scheduled courses found</p>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

export default TutorDashboard;