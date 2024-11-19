import React, { useState, useEffect } from 'react';
import './Notes.css';

const Notes = ({ forumId, userRole }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`http://localhost:7771/api/forums/${forumId}/notes`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch notes');
        
        const data = await response.json();
        setNotes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [forumId]);

  // Upload note
  const handleUploadNote = async (formData) => {
    try {
      const response = await fetch(`http://localhost:7771/api/forums/${forumId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Failed to upload note');

      const newNote = await response.json();
      setNotes(prev => [...prev, newNote]);
      setShowUploadModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Download note
  const handleDownload = async (noteId, noteName) => {
    try {
      const response = await fetch(`http://localhost:7767/api/notes/${noteId}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to download note');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = noteName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading notes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="notes-container">
      {/* ... existing JSX ... */}
    </div>
  );
};

export default Notes;