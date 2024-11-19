import React, { useState, useEffect } from 'react';
import './Assignments.css';

const Assignments = ({ forumId, userRole }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Fetch assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const response = await fetch(`http://localhost:7771/api/forums/${forumId}/assignments`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch assignments');
        
        const data = await response.json();
        setAssignments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [forumId]);

  // Create new assignment
  const handleCreateAssignment = async (assignmentData) => {
    try {
      const response = await fetch(`http://localhost:7771/api/forums/${forumId}/assignments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assignmentData)
      });

      if (!response.ok) throw new Error('Failed to create assignment');

      const newAssignment = await response.json();
      setAssignments(prev => [...prev, newAssignment]);
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Submit assignment
  const handleSubmitAssignment = async (assignmentId, formData) => {
    try {
      const response = await fetch(`http://localhost:7769/api/assignments/${assignmentId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData // FormData for file upload
      });

      if (!response.ok) throw new Error('Failed to submit assignment');

      const updatedAssignment = await response.json();
      setAssignments(prev => 
        prev.map(a => a.assignmentId === assignmentId ? updatedAssignment : a)
      );
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Grade submission
  const handleGradeSubmission = async (submissionId, grade) => {
    try {
      const response = await fetch(`http://localhost:7770/api/submissions/${submissionId}/grade`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ grade })
      });

      if (!response.ok) throw new Error('Failed to grade submission');

      const updatedSubmission = await response.json();
      // Update assignments state with new grade
      setAssignments(prev => 
        prev.map(a => {
          if (a.submissions.some(s => s.submissionId === submissionId)) {
            return {
              ...a,
              submissions: a.submissions.map(s => 
                s.submissionId === submissionId ? updatedSubmission : s
              )
            };
          }
          return a;
        })
      );
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading assignments...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="assignments-container">
      {/* ... existing JSX ... */}
    </div>
  );
};

export default Assignments;