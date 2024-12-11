import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/ChangePassword.css';

function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmNewPassword) {
            setError("New passwords do not match");
            return;
        }

        const userId = sessionStorage.getItem("userId");
        if (!userId) {
            setError("User not logged in");
            return;
        }

        try {
            const response = await fetch('http://localhost:7779/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId,
                    currentPassword,
                    newPassword
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            alert("Password updated successfully");
            redirectToDashboard();
        } catch (error) {
            setError(error.message);
        }
    };

    const redirectToDashboard = () => {
        const userRole = sessionStorage.getItem("userRole");
        console.log("Redirecting based on role:", userRole); // Debugging line
        if (userRole === 'tutor') {
            navigate("/tutor");
        } else if (userRole === 'student') {
            navigate("/student");
        } else {
            navigate("/"); // Default to home or login if role is not found
        }
    };

    return (
        <div style={{
            margin: 0,
            padding: 0,
            height: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-dark)'
        }}>
            <div className="cp-change-password-container">
                <h2>Change Password</h2>
                <input
                    type="password"
                    placeholder="Current Password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
                {error && <p className="cp-error">{error}</p>}
                <button onClick={handleUpdatePassword}>Update Password</button>
                <button onClick={redirectToDashboard}>Cancel</button>
            </div>
        </div>
    );
}

export default ChangePassword;