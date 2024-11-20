import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ForumIcon from "@mui/icons-material/Forum";
import DescriptionIcon from "@mui/icons-material/Description";
import LogoutIcon from "@mui/icons-material/Logout";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import DownloadIcon from "@mui/icons-material/Download";
import AddIcon from "@mui/icons-material/Add";
import DashboardIcon from "@mui/icons-material/Dashboard";
import IconButton from "@mui/material/IconButton";
import AssignmentForm from "./AssignmentForm";
import VisibilityIcon from "@mui/icons-material/Visibility";
import "./Forum.css";
import NoteForm from "./NoteForm";
import CircularProgress from "@mui/material/CircularProgress";

const ForumPage = () => {
  const navigate = useNavigate();
  const { forumId } = useParams();
  const userId = sessionStorage.getItem("userId");
  const userRole = sessionStorage.getItem("userRole")?.toLowerCase();

  const [activeSection, setActiveSection] = useState("assignments");
  const [forumDetails, setForumDetails] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [newAssignment, setNewAssignment] = useState(null);
  const [newNote, setNewNote] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [viewingAssignment, setViewingAssignment] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [usernames, setUsernames] = useState({});
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  const handleLogout = () => {
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userRole");
    navigate("/");
  };

  const handleDashboard = () => {
    navigate(userRole === "tutor" ? "/tutor" : "/student");
  };

  useEffect(() => {
    const fetchForumData = async () => {
      try {
        const forumResponse = await fetch(
          `http://localhost:7771/api/forum/${forumId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );
        const forumData = await forumResponse.json();
        setForumDetails(forumData);

        const assignmentsResponse = await fetch(
          `http://localhost:7769/api/assignments/forum/${forumId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );
        const assignmentsData = await assignmentsResponse.json();
        setAssignments(assignmentsData);

        const notesResponse = await fetch(
          `http://localhost:7767/api/notes/forum/${forumId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );
        const notesData = await notesResponse.json();
        setNotes(notesData);

        const postsResponse = await fetch(
          `http://localhost:7768/api/posts/forum/${forumId}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );
        const postsData = await postsResponse.json();
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching forum data:", error);
        setErrorMessage("Failed to load forum data.");
      }
    };

    fetchForumData();
  }, [forumId]);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:7769/api/assignments/forum/${forumId}`
      );
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to fetch assignments");
      }
    } catch (err) {
      setError("Error fetching assignments");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (forumId) {
      fetchAssignments();
    }
  }, [forumId]);

  const handleAssignmentSubmit = async (assignmentId) => {
    if (!newAssignment) return;

    try {
      const formData = new FormData();
      formData.append("file", newAssignment);

      const response = await fetch(
        `http://localhost:7769/api/assignments/submit/${assignmentId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const updatedAssignment = await response.json();
        setAssignments(
          assignments.map((assignment) =>
            assignment.id === assignmentId ? updatedAssignment : assignment
          )
        );
        setNewAssignment(null);
      } else {
        setErrorMessage("Failed to submit assignment.");
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      setErrorMessage("Error submitting assignment.");
    }
  };

  const handleAssignmentUpdate = async (assignmentId) => {
    if (!newAssignment) return;

    try {
      const formData = new FormData();
      formData.append("file", newAssignment);

      const response = await fetch(
        `http://localhost:7769/api/assignments/update/${assignmentId}`,
        {
          method: "PUT",
          body: formData,
        }
      );

      if (response.ok) {
        const updatedAssignment = await response.json();
        setAssignments(
          assignments.map((assignment) =>
            assignment.id === assignmentId ? updatedAssignment : assignment
          )
        );
        setNewAssignment(null);
      } else {
        setErrorMessage("Failed to update assignment.");
      }
    } catch (error) {
      console.error("Error updating assignment:", error);
      setErrorMessage("Error updating assignment.");
    }
  };

  const handlePostSubmit = async () => {
    if (!newPost.trim()) return;

    try {
      const timestamp = new Date().toISOString();
      const response = await fetch(`http://localhost:7768/api/posts`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          forumId: forumId,
          userId: userId,
          content: newPost,
          timestamp: timestamp,
        }),
      });

      if (response.ok) {
        const newPostData = await response.json();
        setPosts([...posts, newPostData]);
        setNewPost("");

        const messagesContainer = document.querySelector(".messages-container");
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      } else {
        setErrorMessage("Failed to post message.");
      }
    } catch (error) {
      console.error("Error posting message:", error);
      setErrorMessage("Error posting message.");
    }
  };

  const handleNoteUpload = async () => {
    if (!newNote) return;

    try {
      const formData = new FormData();
      formData.append("file", newNote);

      const response = await fetch(
        `http://localhost:7767/api/notes/upload/${forumId}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        const newNoteData = await response.json();
        setNotes([...notes, newNoteData]);
        setNewNote(null);
      } else {
        setErrorMessage("Failed to upload note.");
      }
    } catch (error) {
      console.error("Error uploading note:", error);
      setErrorMessage("Error uploading note.");
    }
  };

  const handleCreateAssignment = () => {
    setEditingAssignment(null);
    setShowAssignmentForm(true);
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    setShowAssignmentForm(true);
  };

  const handleAssignmentSubmitSuccess = async () => {
    await fetchAssignments();
    setShowAssignmentForm(false);
  };

  const handleViewAssignment = (assignment) => {
    setViewingAssignment(assignment);
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm("Are you sure you want to delete this assignment?")) {
      try {
        const response = await fetch(
          `http://localhost:7769/api/assignments/${assignmentId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          await fetchAssignments();
        } else {
          const errorData = await response.json();
          alert(errorData.message || "Failed to delete assignment");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error deleting assignment");
      }
    }
  };

  const fetchUsername = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:7779/api/auth/user/${userId}`
      );
      if (response.ok) {
        const userData = await response.json();
        setUsernames((prev) => ({
          ...prev,
          [userId]: userData.username,
        }));
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    }
  };

  const renderChatSection = () => {
    return (
      <div className="chat-container">
        <div className="messages-container">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className={`message-bubble ${
                  post.userId === userId ? "sent" : "received"
                }`}
              >
                <div className="message-info">
                  <span className="username">{usernames[post.userId] || "Loading..."}</span>
                  <span className="timestamp">
                    {new Date(post.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                </div>
                <div className="message-text">{post.content}</div>
              </div>
            ))
          ) : (
            <div className="no-messages">
              <span>No messages yet. Start the conversation!</span>
            </div>
          )}
        </div>
        <div className="message-input-container">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Type your message here..."
            className="message-input"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handlePostSubmit();
              }
            }}
          />
          <button
            className="send-message-button"
            onClick={handlePostSubmit}
            disabled={!newPost.trim()}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    );
  };

  const renderSection = () => {
    console.log(notes);

    switch (activeSection) {
      case "assignments":
        return (
          <section className="forum-section assignments-section">
            <div className="section-header">
              <h2>Assignments</h2>
              {userRole === "tutor" && (
                <button
                  className="create-button"
                  onClick={handleCreateAssignment}
                >
                  <AddIcon fontSize="small" />
                  Add
                </button>
              )}
            </div>
            <div className="assignments-list">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="assignment-card">
                  <h3>{assignment.title}</h3>
                  <p>{assignment.description}</p>
                  <p className="due-date">
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                  <div className="assignment-controls">
                    <button
                      onClick={() => handleViewAssignment(assignment)}
                      title="View"
                      className="view-button"
                    >
                      <VisibilityIcon />
                    </button>
                    {userRole === "tutor" && (
                      <>
                        <button
                          onClick={() => handleEditAssignment(assignment)}
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => handleDeleteAssignment(assignment.id)}
                          title="Delete"
                          className="delete-button"
                        >
                          <DeleteIcon />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );

      case "chat":
        return renderChatSection();

      case "notes":
        return (
          <section className="forum-section notes-section">
            <div className="section-header">
              <h2>Notes</h2>
              {userRole === "tutor" && (
                <button
                  className="create-button"
                  onClick={() => setShowNoteForm(true)}
                >
                  <AddIcon fontSize="small" /> Add Note
                </button>
              )}
            </div>
            <div className="notes-grid">
              {notes.map((note) => (
                <div key={note.notesId} className="note-card">
                  <h3 className="note-title">{note.title}</h3>
                  <div className="note-controls">
                    <button 
                      className="download-button"
                      onClick={() => handleDownload(note)}
                      disabled={deletingNoteId === note.notesId}
                      title="Download"
                    >
                      {deletingNoteId === note.notesId ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <DownloadIcon />
                      )}
                    </button>
                    {userRole === "tutor" && (
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteNote(note.notesId)}
                        disabled={deletingNoteId === note.notesId}
                        title="Delete"
                      >
                        {deletingNoteId === note.notesId ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <DeleteIcon />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {notes.length === 0 && (
                <div className="no-notes-message">No notes available</div>
              )}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(
        `http://localhost:7768/api/posts/forum/${forumId}`
      );
      if (response.ok) {
        const postsData = await response.json();
        setPosts(postsData);

        const uniqueUserIds = [
          ...new Set(postsData.map((post) => post.userId)),
        ];
        uniqueUserIds.forEach((userId) => {
          if (!usernames[userId]) {
            fetchUsername(userId);
          }
        });
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      setErrorMessage("Failed to load messages.");
    }
  };

  useEffect(() => {
    if (activeSection === "chat") {
      fetchPosts();
      const interval = setInterval(fetchPosts, 5000);
      return () => clearInterval(interval);
    }
  }, [activeSection, forumId]);

  const fetchNotes = async () => {
    try {
      const response = await fetch(
        `http://localhost:7767/api/notes/forum/${forumId}`
      );
      if (response.ok) {
        const notesData = await response.json();
        console.log("Fetched notes:", notesData);
        setNotes(notesData);
      } else {
        console.error("Failed to fetch notes");
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const handleNoteUploadSuccess = () => {
    fetchNotes(); // Refresh the notes list after successful upload
  };

  useEffect(() => {
    if (activeSection === "notes") {
      fetchNotes();
    }
  }, [activeSection, forumId]);

  const handleDownload = async (note) => {
    try {
      const downloadUrl = `http://localhost:7767/api/notes/download/${note.notesName}`;
      
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Download failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const fileName = note.originalName || note.notesName;
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      // You might want to show an error message to the user
    }
  };

  const handleDeleteNote = async (notesId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }
    setDeletingNoteId(notesId);
    try {
      const response = await fetch(`http://localhost:7767/api/notes/${notesId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        throw new Error('Note not found');
      } else if (response.status === 403) {
        throw new Error('You do not have permission to delete this note');
      } else if (!response.ok) {
        throw new Error('Failed to delete note');
      }

      setNotes(notes.filter(note => note.notesId !== notesId));
      alert('Note deleted successfully');

    } catch (error) {
      console.error('Error deleting note:', error);
      alert(error.message);
    } finally {
      setDeletingNoteId(null);
    }
  };

  return (
    <div className="forum-page">
      <header className="forum-header">
        <div className="header-content">
          <div className="header-left">
            <img src="/logo.png" alt="Logo" className="logo" />
            <span className="platform-name">QuickLearn</span>
          </div>
          <div className="header-buttons">
            <button className="dashboard-button" onClick={handleDashboard}>
              <DashboardIcon fontSize="small" /> Dashboard
            </button>
            <button className="logout-button" onClick={handleLogout}>
              <LogoutIcon fontSize="small" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="forum-main">
        <aside className="forum-sidebar">
          <nav className="sidebar-nav">
            <div
              className={`nav-item ${
                activeSection === "assignments" ? "active" : ""
              }`}
              onClick={() => setActiveSection("assignments")}
            >
              <AssignmentIcon />
              <span>Assignments</span>
            </div>
            <div
              className={`nav-item ${activeSection === "chat" ? "active" : ""}`}
              onClick={() => setActiveSection("chat")}
            >
              <ForumIcon />
              <span>Discussion</span>
            </div>
            <div
              className={`nav-item ${
                activeSection === "notes" ? "active" : ""
              }`}
              onClick={() => setActiveSection("notes")}
            >
              <DescriptionIcon />
              <span>Notes</span>
            </div>
          </nav>
        </aside>

        <main className="forum-content">
          {activeSection === "assignments" && (
            <section className="forum-section">
              <div className="section-header">
                <h2>Assignments</h2>
                {userRole === "tutor" && (
                  <button
                    className="create-button"
                    onClick={handleCreateAssignment}
                  >
                    <AddIcon fontSize="small" /> Add
                  </button>
                )}
              </div>
              <div className="assignments-list">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="assignment-card">
                    <h3>{assignment.title}</h3>
                    <p>{assignment.description}</p>
                    <p className="due-date">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                    <div className="assignment-controls">
                      <button
                        onClick={() => handleViewAssignment(assignment)}
                        title="View"
                        className="view-button"
                      >
                        <VisibilityIcon />
                      </button>
                      {userRole === "tutor" && (
                        <>
                          <button
                            onClick={() => handleEditAssignment(assignment)}
                            title="Edit"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteAssignment(assignment.id)
                            }
                            title="Delete"
                            className="delete-button"
                          >
                            <DeleteIcon />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeSection === "chat" && renderChatSection()}

          {activeSection === "notes" && (
            <section className="forum-section notes-section">
              <div className="section-header">
                <h2>Notes</h2>
                {userRole === "tutor" && (
                  <button
                    className="create-button"
                    onClick={() => setShowNoteForm(true)}
                  >
                    <AddIcon fontSize="small" /> Add Note
                  </button>
                )}
              </div>
              <div className="notes-grid">
                {notes.map((note) => (
                  <div key={note.notesId} className="note-card">
                    <h3 className="note-title">{note.title}</h3>
                    <div className="note-controls">
                      <button 
                        className="download-button"
                        onClick={() => handleDownload(note)}
                        disabled={deletingNoteId === note.notesId}
                        title="Download"
                      >
                        {deletingNoteId === note.notesId ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <DownloadIcon />
                        )}
                      </button>
                      {userRole === "tutor" && (
                        <button
                          className="delete-button"
                          onClick={() => handleDeleteNote(note.notesId)}
                          disabled={deletingNoteId === note.notesId}
                          title="Delete"
                        >
                          {deletingNoteId === note.notesId ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <DeleteIcon />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {notes.length === 0 && (
                  <div className="no-notes-message">No notes available</div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
      {showAssignmentForm && (
        <AssignmentForm
          isEdit={!!editingAssignment}
          assignmentData={editingAssignment}
          onClose={() => {
            setShowAssignmentForm(false);
            setEditingAssignment(null);
          }}
          forumId={forumId}
          onSubmitSuccess={handleAssignmentSubmitSuccess}
        />
      )}
      {viewingAssignment && (
        <AssignmentForm
          isView={true}
          assignmentData={viewingAssignment}
          onClose={() => setViewingAssignment(null)}
          forumId={forumId}
        />
      )}
      {showNoteForm && (
        <NoteForm
          onClose={() => setShowNoteForm(false)}
          onSubmit={handleNoteUploadSuccess}
          forumId={forumId}
        />
      )}
    </div>
  );
};

export default ForumPage;
