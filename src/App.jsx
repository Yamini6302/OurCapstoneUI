import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import LoginPage from "./component/LoginPage";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css"


function App() {
  return (
    <Router> 
      <Routes>
      
        <Route path="/login" element={<LoginPage />}> </Route> 
        <Route path="/*" element={<LoginPage />}></Route>
      </Routes>
    </Router>
  );
}

export default App;
