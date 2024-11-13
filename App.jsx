
import "../node_modules/bootstrap/dist/css/bootstrap.min.css"
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './component/HomePage'; 
import LoginPage from './component/LoginPage'; 
import RegisterPage from './component/RegisterPage'; 
import StudentDetails from './component/StudentDetails';
import TutorDetails from './component/TutorDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />}/>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/student-details" element={<StudentDetails />} />
        <Route path="/tutor-details" element={<TutorDetails />} />
      </Routes>
    </Router>
  );
}

export default App;