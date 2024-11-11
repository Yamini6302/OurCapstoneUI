import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import LoginPage from "./component/LoginPage";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css"


function App() {
  return (
    <Router> 
      <Routes>
      
        <Route path="/login" element={<LoginPage />}> </Route> 
        
        <Route path="student-register" element={<StudentRegister></StudentRegister>}></Route>
        <Route path="dashboard" element={<Dashboard></Dashboard>}></Route>
        <Route path="/*" element={<LoginPage />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
