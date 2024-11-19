import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './css/StudentDashboard.css';

function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchCourseDetails = async () => {
      try {
        const ctResponse = await fetch("http://localhost:7772/api/course-tutors");
        if (!ctResponse.ok) throw new Error('Failed to fetch course-tutor data');
        const courseTutorData = await ctResponse.json();

        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        const detailedCourses = await Promise.all(
          courseTutorData
            .filter(ct => {
              const startDate = new Date(ct.startDate);
              startDate.setHours(0, 0, 0, 0);
              return startDate >= currentDate;
            })
            .map(async (ct) => {
              try {
                const tutorResponse = await fetch(`http://localhost:7777/api/tutor/${ct.tutorIds[0]}`);
                let tutorName = "Unknown Tutor";
                if (tutorResponse.ok) {
                  const tutorData = await tutorResponse.json();
                  tutorName = tutorData.tutorName;
                }

                const courseResponse = await fetch(`http://localhost:7773/api/courses/${ct.courseId}`);
                let courseName = "Unnamed Course";
                let description = "No description available";
                if (courseResponse.ok) {
                  const courseData = await courseResponse.json();
                  courseName = courseData.courseName;
                  description = courseData.description;
                }

                return {
                  ctId: ct.ctid,
                  courseId: ct.courseId,
                  courseName: courseName,
                  description: description,
                  startDate: ct.startDate,
                  tutorName: tutorName,
                  tutorId: ct.tutorIds?.[0]
                };
              } catch (error) {
                setError("Error loading course details");
                return null;
              }
            })
        );

        const sortedCourses = detailedCourses
          .filter(course => course !== null)
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        setCourses(sortedCourses);
      } catch (error) {
        setError("Failed to load courses");
      }
    };

    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://localhost:7778/api/student/user/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setUserDetails(data);
        } else {
          setError("Failed to fetch user details");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        setError("Error loading user details");
      }
    };

    fetchCourseDetails();
    fetchUserDetails();
  }, [userId, navigate]);

  const handleEnroll = async (ctId) => {
    try {
      const studentId = userDetails?.id;
      if (!studentId) {
        setError("User details not found");
        return;
      }

      const response = await fetch('http://localhost:7774/enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: studentId,
          ctId: ctId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to enroll');
      }

      const enrollmentData = await response.json();
      console.log("Enrollment successful:", enrollmentData);
      alert("Successfully enrolled in the course!");
      
    } catch (error) {
      console.error('Error enrolling:', error);
      setError("Failed to enroll in course");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("userId");
    navigate("/");
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
            {error && <div className="error">{error}</div>}
            {courses.length > 0 ? (
              courses.map((course) => (
                <div key={course.ctId} className="courseCard">
                  <h3>{course.courseName}</h3>
                  <p className="courseDescription">{course.description}</p>
                  <div className="courseDetails">
                    <div className="detailRow">
                      <span className="label">Start Date:</span>
                      <span className="value">
                        {new Date(course.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="detailRow">
                      <span className="label">Tutor:</span>
                      <span className="value">{course.tutorName}</span>
                    </div>
                  </div>
                  <button 
                    className="enrollButton"
                    onClick={() => handleEnroll(course.ctId)}
                  >
                    Enroll Now
                  </button>
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