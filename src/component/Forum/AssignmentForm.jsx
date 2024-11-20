import React, { useState, useEffect } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './AssignmentForm.css';

const AssignmentForm = ({ 
  isEdit = false, 
  isView = false, 
  assignmentData = null, 
  onClose, 
  forumId,
  onSubmitSuccess 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if ((isEdit || isView) && assignmentData) {
      setTitle(assignmentData.title);
      setDescription(assignmentData.description);
      setDueDate(assignmentData.dueDate?.split('T')[0] || '');
    }
  }, [isEdit, isView, assignmentData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const endpoint = isEdit 
        ? `http://localhost:7769/api/assignments/${assignmentData.id}`
        : `http://localhost:7769/api/assignments`;

      const requestBody = {
        title,
        description,
        dueDate: new Date(dueDate).toISOString(),
        forumId
      };

      const response = await fetch(endpoint, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        await onSubmitSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to submit assignment');
      }
    } catch (err) {
      console.error('Error submitting assignment:', err);
      setError('Failed to submit assignment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setError('');
  };

  return (
    <div className="assignment-form-overlay">
      <div className="assignment-form-container">
        <div className="form-header">
          <button className="back-button" onClick={onClose}>
            <ArrowBackIcon /> Back
          </button>
          <h2>{isView ? 'View Assignment' : isEdit ? 'Edit Assignment' : 'Create Assignment'}</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isView}
              className={isView ? 'view-only' : ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              disabled={isView}
              className={isView ? 'view-only' : ''}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              min={new Date().toISOString().split('T')[0]}
              disabled={isView}
              className={isView ? 'view-only' : ''}
            />
          </div>

          {!isView && (
            <div className="form-buttons">
              <button 
                type="button" 
                className="reset-button"
                onClick={handleReset}
              >
                Reset
              </button>
              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isEdit ? 'Update' : 'Submit'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AssignmentForm; 