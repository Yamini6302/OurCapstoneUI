import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Assignments from './Assignments.jsx';
import Chat from './Chat.jsx';
import Notes from './Notes.jsx';
import logo from '../../assets/logo.png';
import './Forum.css';

const Forum = () => {
  const [activeTab, setActiveTab] = useState('assignments');
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { courseId } = useParams();
  const navigate = useNavigate();

  // Fetch course data
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/courses/${courseId}/forum`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch course data');
        }

        const data = await response.json();
        setCourseData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  // Simplified logout handler
  const handleLogout = () => {
    sessionStorage.removeItem('token'); // Remove token from session storage
    navigate('/'); // Redirect to home page
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!courseData) return <div className="error">Course not found</div>;

  return (
    <div className="forum-layout">
      <header className="forum-header">
        <div className="header-left">
          <img src={logo} alt="Logo" className="logo" />
          <div className="header-info">
            <h1>{courseData.courseName}</h1>
            <span className="tutor-info">
              Tutor: {courseData.tutor.tutorName}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="back-button"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
          <button 
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="forum-content">
        <aside className="forum-sidebar">
          <nav className="nav-menu">
            <button 
              className={`nav-item ${activeTab === 'assignments' ? 'active' : ''}`}
              onClick={() => setActiveTab('assignments')}
            >
              <span className="nav-icon">📚</span>
              <span className="nav-text">Assignments</span>
              <span className="nav-count">
                {courseData.forum.assignments.length}
              </span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <span className="nav-icon">💬</span>
              <span className="nav-text">Chat</span>
              <span className="nav-count">
                {courseData.forum.posts.length}
              </span>
            </button>
            <button 
              className={`nav-item ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notes')}
            >
              <span className="nav-icon">📝</span>
              <span className="nav-text">Notes</span>
              <span className="nav-count">
                {courseData.forum.notes.length}
              </span>
            </button>
          </nav>
        </aside>

        <main className="main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Forum;