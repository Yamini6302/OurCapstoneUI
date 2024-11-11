import React from 'react';
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './component/LoginPage';
import RegisterPage from './component/RegisterPage';
import HomePage from './component/HomePage';
import StudentDetails from './component/StudentDetails'; 
import TutorDetails from './component/TutorDetails'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/student-details" element={<StudentDetails />} />
        <Route path="/tutor-details" element={<TutorDetails />} />
      </Routes>
    </Router>
  );
}

export default App;