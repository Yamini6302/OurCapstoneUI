import React, { useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import './NoteForm.css';

const NoteForm = ({ onClose, onSubmit, forumId }) => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  
  // Get userId from sessionStorage
  const userId = sessionStorage.getItem('userId');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !file) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('file', file);
      formData.append('forumId', forumId);
      formData.append('userId', userId);

      const response = await fetch('http://localhost:7767/api/notes/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('Note uploaded:', {
          title,
          fileName: file.name,
          forumId,
          userId,
        });
        onSubmit();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to upload note');
      }
    } catch (error) {
      console.error('Error uploading note:', error);
      setError('Error uploading note');
    }
  };

  if (!userId) {
    return (
      <div className="note-form-overlay">
        <div className="note-form-container">
          <div className="error-message">User session not found. Please log in again.</div>
          <button className="cancel-button" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="note-form-overlay">
      <div className="note-form-container">
        <div className="note-form-header">
          <h2>Upload Note</h2>
          <button className="close-button" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="file">File</label>
            <input
              type="file"
              id="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="file-input"
              required
              accept=".pdf,.doc,.docx"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="form-buttons">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteForm; 