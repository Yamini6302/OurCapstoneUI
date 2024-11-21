import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './component/LandingPage'; 
import LoginPage from './component/LoginPage'; 
import RegisterPage from './component/RegisterPage'; 
import StudentDetails from './component/StudentDetails';
import TutorDetails from './component/TutorDetails';
import TutorDashboard from "./component/TutorDashboard";
import StudentDashboard from "./component/StudentDashboard";
import Forum from './component/Forum'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/student-details" element={<StudentDetails />} />
        <Route path="/tutor-details" element={<TutorDetails />} />
        <Route path="/tutor" element={<TutorDashboard />} /> 
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/forum/:forumId" element={<Forum />} />
        

      </Routes>
    </Router>
  );``
}

export default App;
