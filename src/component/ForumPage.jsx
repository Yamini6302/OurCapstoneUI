import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/ForumPage.css";

const ForumPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("chat");
  const [currentCourse, setCurrentCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  const [posts, setPosts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState("");

  const authToken = localStorage.getItem("authToken");

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Fetch forum data when course changes or tab changes
  useEffect(() => {
    if (currentCourse) {
      fetchForumData();
    }
  }, [currentCourse, activeTab]);

  const fetchCourses = async () => {
    try {
      const response = await fetch("http://localhost:7773/api/courses", {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();
      setCourses(data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch courses");
      setLoading(false);
    }
  };

  const fetchForumData = async () => {
    setLoading(true);
    try {
      const forumResponse = await fetch(
        `http://localhost:7771/api/forums/${currentCourse.ctid}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      const forum = await forumResponse.json();

      switch (activeTab) {
        case "chat":
          const postsResponse = await fetch(
            `http://localhost:7777/api/forums/${forum.forumid}/posts`,
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );
          const postsData = await postsResponse.json();
          setPosts(postsData);
          break;

        case "assignments":
          const assignmentsResponse = await fetch(
            `http://localhost:7777/api/forums/${forum.forumid}/assignments`,
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );
          const assignmentsData = await assignmentsResponse.json();
          setAssignments(assignmentsData);
          break;

        case "notes":
          const notesResponse = await fetch(
            `http://localhost:7777/api/forums/${forum.forumid}/notes`,
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );
          const notesData = await notesResponse.json();
          setNotes(notesData);
          break;
      }
    } catch (err) {
      setError(`Failed to fetch ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const forumResponse = await fetch(
        `http://localhost:7777/api/forums/${currentCourse.ctid}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      const forum = await forumResponse.json();

      const postData = {
        context: newMessage,
        userid: sessionStorage.getItem("userId"), // Retrieve user ID from session storage
      };

      const postResponse = await fetch(
        `http://localhost:7777/api/forums/${forum.forumid}/posts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(postData),
        }
      );
      const newPost = await postResponse.json();
      setPosts((prev) => [...prev, newPost]);
      setNewMessage("");
    } catch (err) {
      setError("Failed to send message");
    }
  };

  const renderHeader = () => (
    <header className="forum-header">
      <div className="logo">QuickLearn</div>
      <input
        type="search"
        className="search-bar"
        placeholder="Search courses or forums..."
      />
      <div className="profile-section">
        <span className="user-name">John Doe</span>
        <button className="profile-btn" onClick={() => navigate("/profile")}>
          Profile
        </button>
      </div>
    </header>
  );

  const renderSidebar = () => (
    <aside className="sidebar">
      <button className="dashboard-btn" onClick={() => navigate("/dashboard")}>
        Dashboard
      </button>
      <div className="courses-list">
        {courses.map((course) => (
          <div
            key={course.id}
            className="course-item"
            onClick={() => setCurrentCourse(course)}
          >
            <h3>{course.courseName}</h3>
            <p>{course.description}</p>
          </div>
        ))}
      </div>
    </aside>
  );

  const renderChatSection = () => (
    <div className="chat-section">
      {loading ? (
        <div className="loading">Loading...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="message-feed">
            {posts.map((post) => (
              <div key={post.postid} className={`message ${post.isTeacher ? "teacher" : ""}`}>
                <strong>{post.username}:</strong> {post.context}
              </div>
            ))}
          </div>
          <div className="message-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <button className="btn-primary" onClick={handleSendMessage}>
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );

  const renderMainContent = () => (
    <main className="main-content">
      {currentCourse && (
        <div className="course-header">
          <h2 className="course-title">
            {currentCourse.name} - {currentCourse.tutor}
          </h2>
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          Chat Forum
        </button>
        <button
          className={`tab ${activeTab === "assignments" ? "active" : ""}`}
          onClick={() => setActiveTab("assignments")}
        >
          Assignments
        </button>
        <button
          className={`tab ${activeTab === "notes" ? "active" : ""}`}
          onClick={() => setActiveTab("notes")}
        >
          Notes
        </button>
      </div>

      {activeTab === "chat" && renderChatSection()}
    </main>
  );

  const renderFooter = () => (
    <footer className="forum-footer">
      
      <p>© 2024 QuickLearn. All rights reserved.</p>
    </footer>
  );

  return (
    <div className="forum-container">
      {renderHeader()}
      {renderSidebar()}
      {renderMainContent()}
      {renderFooter()}
    </div>
  );
};

export default ForumPage;
