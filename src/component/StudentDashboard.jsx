import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './css/StudentDashboard.css';

function StudentDashboard() {
  const [courses, setCourses] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState(new Set());
  const [studentDetails, setStudentDetails] = useState(null);
  const [showEnrolledModal, setShowEnrolledModal] = useState(false);
  const [enrolledCourseDetails, setEnrolledCourseDetails] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const fetchAllData = async () => {
      try {
        const authUserResponse = await fetch(`http://localhost:7779/api/auth/user/${userId}`);
        if (!authUserResponse.ok) throw new Error('Failed to fetch user details');
        const authUserData = await authUserResponse.json();
        setUserRole(authUserData.role);

        const userResponse = await fetch(`http://localhost:7778/api/student/user/${userId}`);
        if (!userResponse.ok) throw new Error('Failed to fetch user details');
        const userData = await userResponse.json();
        setUserDetails(userData);

        const studentResponse = await fetch(`http://localhost:7778/api/student/user/${userId}`);
        if (!studentResponse.ok) throw new Error('Failed to fetch student details');
        const studentData = await studentResponse.json();
        setStudentDetails(studentData);

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

                const forumResponse = await fetch(`http://localhost:7771/api/forum/ct/${ct.ctid}`);
                let forumId = null;
                if (forumResponse.ok) {
                  const forumData = await forumResponse.json();
                  forumId = forumData.forumId;
                }

                return {
                  ctId: ct.ctid,
                  courseId: ct.courseId,
                  courseName: courseName,
                  description: description,
                  startDate: ct.startDate,
                  tutorName: tutorName,
                  tutorId: ct.tutorIds?.[0],
                  forumId: forumId
                };
              } catch (error) {
                return null;
              }
            })
        );

        const sortedCourses = detailedCourses
          .filter(course => course !== null)
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

        setCourses(sortedCourses);

        if (userData?.id) {
          const enrollResponse = await fetch(`http://localhost:7774/api/enrollment/student/${userData.id}`);
          if (enrollResponse.ok) {
            const enrollments = await enrollResponse.json();
            setEnrolledCourses(new Set(enrollments.map(e => e.ctId)));
          }
        }

      } catch (error) {
        console.error("Error:", error);
        setError("Failed to load data");
      }
    };

    fetchAllData();
  }, [userId, navigate]);

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        if (!studentDetails?.studentId) return;
        
        const response = await fetch(`http://localhost:7774/api/enrollment/student/${studentDetails.studentId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch enrollments');
        }
        
        const enrollments = await response.json();
        const enrolledCtIds = new Set(enrollments.map(enrollment => enrollment.ctId));
        setEnrolledCourses(enrolledCtIds);
        
      } catch (error) {
        console.error("Error fetching enrollments:", error);
      }
    };

    if (studentDetails) {
      fetchEnrollments();
    }
  }, [studentDetails]);

  const handleEnroll = async (ctId) => {
    try {
      const userId = sessionStorage.getItem("userId");
      if (!userId) {
        setError("Please login to enroll");
        return;
      }

      const studentResponse = await fetch(`http://localhost:7778/api/student/user/${userId}`);
      if (!studentResponse.ok) {
        throw new Error('Failed to fetch student details');
      }
      const studentData = await studentResponse.json();
      const studentId = studentData.studentId;

      const enrollmentRequest = {
        studentId: studentId,
        ctId: ctId,
        enrollmentDate: new Date().toISOString(),
        status: "ENROLLED"
      };

      console.log("Enrollment Request:", enrollmentRequest);

      const response = await fetch('http://localhost:7774/api/enrollment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(enrollmentRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Enrollment Error:", errorText);
        throw new Error('Failed to enroll');
      }

      const enrollmentData = await response.json();
      console.log("Enrollment Success:", enrollmentData);

      setEnrolledCourses(prev => new Set([...prev, ctId]));
      alert("Successfully enrolled in the course!");

    } catch (error) {
      console.error("Error details:", error);
      setError("Failed to enroll in course");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("userId");
    navigate("/");
  };

  const handleOpenForum = (forumId) => {
    navigate(`/forum/${forumId}`);
  };

  const fetchEnrollments = async () => {
    try {
      if (!studentDetails?.studentId) {
        return;
      }

      const response = await fetch(`http://localhost:7774/api/enrollment/student/${studentDetails.studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch enrollments');
      }

      const enrollments = await response.json();
      setEnrolledCourses(new Set(enrollments.map(enrollment => enrollment.ctId)));
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    }
  };

  const handleEnrolledCourses = async () => {
    try {
      if (!studentDetails?.studentId) return;

      const response = await fetch(`http://localhost:7774/api/enrollment/student/${studentDetails.studentId}`);
      if (!response.ok) throw new Error('Failed to fetch enrollments');
      
      const enrollments = await response.json();
      
      // Get details for each enrolled course
      const enrolledDetails = await Promise.all(
        enrollments.map(async (enrollment) => {
          const course = courses.find(c => c.ctId === enrollment.ctId);
          return course ? {
            courseName: course.courseName,
            description: course.description,
            forumId: course.forumId
          } : null;
        })
      );

      setEnrolledCourseDetails(enrolledDetails.filter(course => course !== null));
      setShowEnrolledModal(true);
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      setError('Failed to load enrolled courses');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="student-dash-container">
      <header className="student-dash-header">
        <div className="student-dash-header-left">
          <img src="/logo.png" alt="Logo" className="student-dash-logo" />
          <span className="student-dash-platform-name">
            <span className="student-dash-quick">Quick</span> 
            <span className="student-dash-learn">Learn</span> 
          </span>
        </div>
        <div className="student-dash-header-center">
          <input 
            type="text" 
            placeholder="Search courses..." 
            className="student-dash-search-bar"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="student-dash-header-right">
          <button className="student-dash-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="student-dash-main-content">
        <div className="student-dash-sidebar">
          {userDetails && (
            <div className="student-dash-user-section">
              <div className="student-dash-avatar">
                {userDetails.studentName ? userDetails.studentName.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="student-dash-student-name">
                <strong>{userDetails.studentName}</strong>
              </div>
              <div className="student-dash-user-role">
                {userRole || 'Student'}
              </div>
            </div>
          )}
          <button className="student-dash-sidebar-button" onClick={handleEnrolledCourses}>
            Courses Enrolled
          </button>
        </div>

        <div className="student-dash-right-column">
          {userDetails && (
            <div className="student-dash-welcome-card">
              <h2>👋 Hello, {userDetails.studentName}!</h2>
            </div>
          )}
          
          <div className="student-dash-section-divider">
            <h2 className="student-dash-section-title">Upcoming Courses</h2>
          </div>

          <div className="student-dash-course-list">
            {error && <div className="student-dash-error">{error}</div>}
            {courses
              .filter(course => 
                course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.tutorName.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((course) => (
                <div key={course.ctId} className="student-dash-course-card">
                  <h3>{course.courseName}</h3>
                  <p className="student-dash-course-description">{course.description}</p>
                  <div className="student-dash-course-details">
                    <div className="student-dash-detail-row">
                      <span className="student-dash-label">Start Date:</span>
                      <span className="student-dash-value">
                        {new Date(course.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="student-dash-detail-row">
                      <span className="student-dash-label">Tutor:</span>
                      <span className="student-dash-value">{course.tutorName}</span>
                    </div>
                  </div>
                  {enrolledCourses.has(course.ctId) ? (
                    <button 
                      className="student-dash-open-forum-button"
                      onClick={() => handleOpenForum(course.forumId)}
                    >
                      Open Forum
                    </button>
                  ) : (
                    <button 
                      className="student-dash-enroll-button"
                      onClick={() => handleEnroll(course.ctId)}
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              ))}
            {courses.filter(course => 
              course.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
              course.tutorName.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 && (
              <div className="student-dash-no-results">
                <p>No courses found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showEnrolledModal && (
        <div className="student-dash-modal-overlay" onClick={() => setShowEnrolledModal(false)}>
          <div className="student-dash-modal-content" onClick={e => e.stopPropagation()}>
            <div className="student-dash-modal-header">
              <h2>Enrolled Courses</h2>
              <button className="student-dash-modal-close" onClick={() => setShowEnrolledModal(false)}>×</button>
            </div>
            {enrolledCourseDetails.map((course, index) => (
              <div key={index} className="student-dash-enrolled-course-card">
                <h3>{course.courseName}</h3>
                <p>{course.description}</p>
                <button 
                  className="student-dash-open-forum-button"
                  onClick={() => handleOpenForum(course.forumId)}
                >
                  Open Forum
                </button>
              </div>
            ))}
            {enrolledCourseDetails.length === 0 && (
              <p>No enrolled courses found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;