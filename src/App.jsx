// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Firebase Auth (optional here, just for access if needed globally)
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "./services/firebase";
const auth = getAuth(app); // you can use this if needed globally

// Pages
import Signup from "./pages/signup";
import Login from "./pages/login";
import Landing from "./pages/landing";
import ExperimentForm from "./pages/experimentForm";
import ExperimentList from "./pages/experimentList";
import ExperimentDetail from "./pages/experimentDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/experiment-form" element={<ExperimentForm />} />
        <Route path="/experiment-list" element={<ExperimentList />} />
        <Route path="/experiment/:id" element={<ExperimentDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
