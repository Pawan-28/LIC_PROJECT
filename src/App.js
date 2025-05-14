import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AgentForm from "./components/AgentForm";
import AgentList from "./components/AgentList";
import RegisterForm from './components/RegisterForm';
import LoginForm from './components/LoginForm';
import './App.css';

function App() {
  return (
    <Router>
      <div>
        <h1>LIC Agent Management</h1>
        <Routes>
          <Route path="/form" element={<AgentForm />} />
          <Route path="/agents" element={<AgentList />} />
          <Route path="/" element={<RegisterForm />} />  {/* Register route */}
          <Route path="/login" element={<LoginForm />} />  {/* Login route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
