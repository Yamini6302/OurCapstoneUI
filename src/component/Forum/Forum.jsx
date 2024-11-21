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
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

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
  const [assignmentFiles, setAssignmentFiles] = useState({});
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [selectedAssignmentSubmissions, setSelectedAssignmentSubmissions] = useState(null);
  const [submissionsDropdownOpen, setSubmissionsDropdownOpen] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [studentSubmissions, setStudentSubmissions] = useState({});
  const [showStudentSubmissions, setShowStudentSubmissions] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [studentNames, setStudentNames] = useState({});
  const [gradeInput, setGradeInput] = useState('');
  const [gradingSubmissionId, setGradingSubmissionId] = useState(null);
  const [viewingPdf, setViewingPdf] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [numPages, setNumPages] = useState(null);

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

  const checkSubmissionStatus = async (assignmentId) => {
    try {
      const response = await fetch(
        `http://localhost:7770/api/submissions/assignment/${assignmentId}`
      );
      
      if (response.ok) {
        const submissions = await response.json();
        const userSubmission = submissions.find(sub => sub.studentId === userId);
        return {
          isSubmitted: !!userSubmission,
          submissionId: userSubmission?._id
        };
      }
      return {
        isSubmitted: false,
        submissionId: null
      };
    } catch (error) {
      console.error("Error checking submission status:", error);
      return {
        isSubmitted: false,
        submissionId: null
      };
    }
  };

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:7769/api/assignments/forum/${forumId}`
      );
      if (response.ok) {
        const data = await response.json();
        
        const assignmentsWithStatus = await Promise.all(
          data.map(async (assignment) => {
            const { isSubmitted, submissionId } = await checkSubmissionStatus(assignment.id);
            return {
              ...assignment,
              isSubmitted,
              submissionId
            };
          })
        );
        
        setAssignments(assignmentsWithStatus);
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

  const handleFileChange = (assignmentId, files) => {
    const file = files[0];
    
    if (file) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        alert(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        // Clear the input
        const fileInput = document.getElementById(`file-upload-${assignmentId}`);
        if (fileInput) fileInput.value = '';
        return;
      }
      
      setAssignmentFiles(prev => ({
        ...prev,
        [assignmentId]: file
      }));
    }
  };

  const handleAssignmentSubmit = async (assignmentId) => {
    const file = assignmentFiles[assignmentId];
    if (!file) {
      alert("Please select a file first");
      return;
    }

    try {
      const userId = sessionStorage.getItem("userId");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assignmentId", assignmentId);
      formData.append("studentId", userId);

      const response = await fetch(
        `http://localhost:7770/api/submissions/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (response.ok) {
        // Clear the file input
        const fileInput = document.getElementById(`file-upload-${assignmentId}`);
        if (fileInput) fileInput.value = '';
        
        // Clear the file from state
        setAssignmentFiles(prev => ({
          ...prev,
          [assignmentId]: null
        }));
        
        // Refresh assignments to update submission status
        await fetchAssignments();
        
        // Show success message
        setSubmitSuccess(true);
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 1000);
      } else {
        throw new Error("Failed to submit assignment");
      }
    } catch (error) {
      console.error("Error submitting assignment:", error);
      setErrorMessage("Error submitting assignment");
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

  

  const fetchStudentDetails = async (studentId) => {
    try {
      const response = await fetch(`http://localhost:7778/api/student/${studentId}`);
      if (response.ok) {
        const studentData = await response.json();
        return `${studentData.studenName}`; 
      }
      return "Unknown Student";
    } catch (error) {
      console.error("Error fetching student details:", error);
      return "Unknown Student";
    }
  };

  const handleViewSubmissions = async (assignment) => {
    try {
      const response = await fetch(
        `http://localhost:7770/api/submissions/assignment/${assignment.id}`
      );
      
      if (response.ok) {
        const submissions = await response.json();
        
        // Fetch student details for each submission
        const submissionsWithDetails = await Promise.all(
          submissions.map(async (submission) => {
            try {
              const studentResponse = await fetch(
                `http://localhost:7778/api/student/${submission.studentId}`
              );
              const studentData = await studentResponse.json();
              
              return {
                ...submission,
                studentName: studentData.studentName || 'Unknown Student'
              };
            } catch (error) {
              console.error('Error fetching student details:', error);
              return {
                ...submission,
                studentName: 'Unknown Student'
              };
            }
          })
        );
        
        setSelectedAssignmentSubmissions({
          assignmentTitle: assignment.name || 'Untitled Assignment',
          submissions: submissionsWithDetails
        });
        setShowSubmissions(true);
      } else {
        throw new Error('Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      alert('Error loading submissions');
    }
  };

  const fetchStudentName = async (studentId) => {
    try {
      if (response.ok) {
        const student = await response.json();
        setStudentNames(prev => ({
          ...prev,
          [studentId]: student.studentName
        }));
      }
    } catch (error) {
      console.error('Error fetching student name:', error);
      return 'Unknown Student';
    }
  };

  const handleGradeSubmission = async (submissionId, grade) => {
    try {
      const response = await fetch(
        `http://localhost:7770/api/submissions/${submissionId}/grade`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ grade: parseFloat(grade) })
        }
      );

      if (response.ok) {
        // Update the submission in the local state
        const updatedSubmissions = selectedAssignmentSubmissions.submissions.map(sub =>
          sub._id === submissionId ? { ...sub, grade: parseFloat(grade) } : sub
        );
        setSelectedAssignmentSubmissions({
          ...selectedAssignmentSubmissions,
          submissions: updatedSubmissions
        });
        setGradingSubmissionId(null);
        setGradeInput('');
      } else {
        throw new Error('Failed to update grade');
      }
    } catch (error) {
      console.error("Error updating grade:", error);
      alert("Failed to update grade");
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleViewSubmission = async (submissionId) => {
    console.log("Viewing submission ID:", submissionId);
    try {
      const response = await fetch(
        `http://localhost:7770/api/submissions/${submissionId}/file`,
        {
          method: 'GET',
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const pdfUrl = URL.createObjectURL(blob);
        setViewingPdf(pdfUrl);
      } else {
        throw new Error('Failed to fetch PDF file');
      }
    } catch (error) {
      console.error("Error viewing submission:", error);
      alert("Error loading submission file");
    }
  };

  const SubmissionsModal = ({ data, onClose }) => {
    if (!data) return null;

    return (
      <div className="modal-overlay">
        <div className="submissions-modal">
          <div className="modal-header">
            <h2>Submissions for: {data.assignmentTitle}</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="submissions-list">
            {data.submissions && data.submissions.length > 0 ? (
              data.submissions.map((submission) => (
                <div key={submission._id} className="submission-item">
                  <div className="submission-info">
                    <h3>{submission.studentName}</h3>
                    <p>Submitted: {new Date(submission.submissionDate).toLocaleDateString()}</p>
                    <div className="submission-actions">
                      {/* View PDF button */}
                      <button
                        className="view-button"
                        onClick={() => handleViewSubmission(submission._id)}
                      >
                        <VisibilityIcon /> View Submission
                      </button>

                      {/* Download button */}
                      <button
                        className="download-button"
                        onClick={() => handleDownloadSubmission(submission._id)}
                      >
                        <DownloadIcon /> Download
                      </button>
                      
                      {/* Grading section */}
                      <div className="grade-section">
                        {gradingSubmissionId === submission._id ? (
                          <div className="grade-input-group">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={gradeInput}
                              onChange={(e) => setGradeInput(e.target.value)}
                              placeholder="Enter grade"
                              className="grade-input"
                            />
                            <button 
                              className="submit-grade-btn"
                              onClick={() => handleGradeSubmission(submission._id, gradeInput)}
                              disabled={!gradeInput}
                            >
                              Submit
                            </button>
                            <button 
                              className="cancel-grade-btn"
                              onClick={() => {
                                setGradingSubmissionId(null);
                                setGradeInput('');
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="grade-button"
                            onClick={() => {
                              setGradingSubmissionId(submission._id);
                              setGradeInput(submission.grade?.toString() || '');
                            }}
                          >
                            {submission.grade !== undefined ? (
                              <span className="grade-value">Grade: {submission.grade}%</span>
                            ) : (
                              <>
                                <EditIcon /> Grade
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-submissions">No submissions yet</p>
            )}
          </div>
        </div>

        {/* PDF Viewer Modal */}
        {viewingPdf && (
          <div className="pdf-viewer-modal">
            <div className="pdf-viewer-header">
              <div className="page-navigation">
                <button 
                  onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}
                  disabled={pageNumber <= 1}
                >
                  Previous
                </button>
                <span>
                  Page {pageNumber} of {numPages}
                </span>
                <button 
                  onClick={() => setPageNumber(prev => Math.min(prev + 1, numPages))}
                  disabled={pageNumber >= numPages}
                >
                  Next
                </button>
              </div>
              <button className="close-button" onClick={() => setViewingPdf(null)}>×</button>
            </div>
            <div className="pdf-container">
              <Document
                file={viewingPdf}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<div className="pdf-loading">Loading PDF...</div>}
              >
                <Page pageNumber={pageNumber} />
              </Document>
            </div>
          </div>
        )}
      </div>
    );
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
                <div className="tutor-controls">
                  <button
                    className="create-button"
                    onClick={handleCreateAssignment}
                  >
                    <AddIcon fontSize="small" /> Add
                  </button>
                  <div className="submissions-dropdown-container">
                    <button
                      className="view-submissions-button"
                      onClick={() => setSubmissionsDropdownOpen(!submissionsDropdownOpen)}
                    >
                      <VisibilityIcon fontSize="small" /> View Submissions
                    </button>
                    {submissionsDropdownOpen && assignments.length > 0 && (
                      <div className="submissions-dropdown">
                        {assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="dropdown-item"
                            onClick={() => {
                              handleViewSubmissions(assignment);
                              setSubmissionsDropdownOpen(false);
                            }}
                          >
                            {assignment.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {userRole === "student" && (
                <button
                  className="view-submissions-button"
                  onClick={() => setShowStudentSubmissions(true)}
                >
                  <VisibilityIcon fontSize="small" />
                  View My Submissions
                </button>
              )}
            </div>
            <div className="assignments-list">
              {assignments.map((assignment) => {
                const hasSubmitted = isSubmitted(assignment);
                const isOverdue = new Date(assignment.dueDate) < new Date();

                return (
                  <div 
                    key={assignment.id} 
                    className={`assignment-card ${isOverdue && !hasSubmitted ? 'overdue' : ''}`}
                  >
                    <h3>{assignment.title}</h3>
                    <p>{assignment.description}</p>
                    <p className={`due-date ${isOverdue ? 'overdue-text' : ''}`}>
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                      {isOverdue && !hasSubmitted && " (Overdue)"}
                    </p>
                    <div className="assignment-controls">
                      <button
                        onClick={() => handleViewAssignment(assignment)}
                        title="View"
                        className="view-button"
                      >
                        <VisibilityIcon />
                      </button>
                      
                      {userRole === "student" && (
                        <div className="student-controls">
                          <input
                            type="file"
                            onChange={(e) => handleFileChange(assignment.id, e.target.files)}
                            style={{ display: 'none' }}
                            id={`file-upload-${assignment.id}`}
                          />
                          <>
                            <label 
                              htmlFor={`file-upload-${assignment.id}`} 
                              className="upload-button"
                              title={assignmentFiles[assignment.id] ? 
                                `Size: ${(assignmentFiles[assignment.id].size / (1024 * 1024)).toFixed(2)}MB` : 
                                "Choose File"}
                            >
                              {assignmentFiles[assignment.id]?.name || "Choose File"}
                            </label>
                            <button
                              className={`submit-button ${assignment.isSubmitted ? 'resubmit' : ''}`}
                              onClick={() => handleAssignmentSubmit(assignment.id)}
                              disabled={!assignmentFiles[assignment.id]}
                            >
                              {assignment.isSubmitted ? 'Resubmit Assignment' : 'Submit Assignment'}
                            </button>
                          </>
                        </div>
                      )}

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
                );
              })}
            </div>
            {submitSuccess && (
              <div className="success-popup">
                Assignment submitted successfully!
              </div>
            )}
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

  const handleDownloadSubmission = async (submissionId) => {
    try {
      const response = await fetch(
        `http://localhost:7770/api/submissions/${submissionId}/file`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `submission-${submissionId}.pdf`; // or whatever the file extension should be
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to download submission');
      }
    } catch (error) {
      console.error('Error downloading submission:', error);
    }
  };

  // Add this function at the component level (inside ForumPage but outside any other functions)
  const isSubmitted = (assignment) => {
    if (!assignment || !assignment.submissions) return false;
    return assignment.submissions.some(submission => submission.studentId === userId);
  };

  // Add this new function to fetch student submissions
  const fetchStudentSubmissions = async () => {
    try {
      const response = await fetch(
        `http://localhost:7770/api/submissions/student/${userId}`
      );
      if (response.ok) {
        const submissions = await response.json();
        // Organize submissions by assignment ID
        const submissionsByAssignment = submissions.reduce((acc, sub) => {
          acc[sub.assignmentId] = sub;
          return acc;
        }, {});
        setStudentSubmissions(submissionsByAssignment);
      }
    } catch (error) {
      console.error('Error fetching student submissions:', error);
    }
  };

  // Add to useEffect where you fetch assignments
  useEffect(() => {
    if (forumId && userRole === 'student') {
      fetchAssignments();
      fetchStudentSubmissions();
    }
  }, [forumId, userRole]);

  // Add this new component for viewing student submissions
  const StudentSubmissionsModal = ({ onClose }) => {
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    };

    return (
      <div className="modal-overlay">
        <div className="submissions-modal">
          <div className="modal-header">
            <h2>My Submissions</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="submissions-list">
            {assignments.map(assignment => {
              const submission = studentSubmissions[assignment.id];
              return (
                <div key={assignment.id} className="submission-item">
                  <div className="submission-info">
                    <h3>{assignment.title}</h3>
                    {submission ? (
                      <>
                        <p>Submitted: {formatDate(submission.submissionDate)}</p>
                        <div className="submission-details">
                          <button 
                            className="download-button"
                            onClick={() => handleDownloadSubmission(submission.submissionId)}
                          >
                            <DownloadIcon /> Download Submission
                          </button>
                          <div className="grade-display">
                            {submission.grade !== undefined ? (
                              <span className="grade">Grade: {submission.grade}%</span>
                            ) : (
                              <span className="pending">Grade Pending</span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <p>No submission yet</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="forum-page">
      <header className="forum-header">
        <div className="header-content">
          <div className="header-left">
            <img src="/logo.png" alt="Logo" className="logo" />
            <span className="platform-name">QuickLearn</span>
            {forumDetails && (
              <span className="forum-name">{forumDetails.forumName}</span>
            )}
          </div>
          <div className="header-buttons">
            <button className="dashboard-button" onClick={handleDashboard}>
              <DashboardIcon fontSize="small" />
              <span>Dashboard</span>
            </button>
            <button className="logout-button" onClick={handleLogout}>
              <LogoutIcon fontSize="small" />
              <span>Logout</span>
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
          {renderSection()}
        </main>
      </div>

      {showAssignmentForm && (
        <div className="assignment-form-overlay">
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
        </div>
      )}

      {viewingAssignment && (
        <div className="assignment-form-overlay">
          <AssignmentForm
            isView={true}
            assignmentData={viewingAssignment}
            onClose={() => setViewingAssignment(null)}
            forumId={forumId}
          />
        </div>
      )}

      {showNoteForm && (
        <div className="note-form-overlay">
          <NoteForm
            onClose={() => setShowNoteForm(false)}
            onSubmit={handleNoteUploadSuccess}
            forumId={forumId}
          />
        </div>
      )}

      {showSubmissions && (
        <SubmissionsModal
          data={selectedAssignmentSubmissions}
          onClose={() => {
            setShowSubmissions(false);
            setSelectedAssignmentSubmissions(null);
          }}
        />
      )}

      {showStudentSubmissions && (
        <StudentSubmissionsModal
          onClose={() => setShowStudentSubmissions(false)}
        />
      )}
    </div>
  );
};

export default ForumPage;
