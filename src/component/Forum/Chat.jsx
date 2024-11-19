import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

const Chat = ({ forumId }) => {
  const [posts, setPosts] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`http://localhost:7771/api/forums/${forumId}/posts`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch posts');
        
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    // Set up polling for new messages
    const interval = setInterval(fetchPosts, 5000);
    return () => clearInterval(interval);
  }, [forumId]);

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`http://localhost:7771/api/forums/${forumId}/posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ context: newMessage })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const newPost = await response.json();
      setPosts(prev => [...prev, newPost]);
      setNewMessage('');
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading chat...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="chat-container">
      <div className="messages-container">
        {posts.map((post) => (
          <div 
            key={post.postId} 
            className={`message ${post.userId === currentUser.userId ? 'own-message' : ''}`}
          >
            <div className="message-header">
              <span className="user-name">{post.userName}</span>
              <span className="user-role">{post.userRole}</span>
            </div>
            <div className="message-content">
              {post.context}
            </div>
            <div className="message-time">
              {new Date(post.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          rows="3"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat; 