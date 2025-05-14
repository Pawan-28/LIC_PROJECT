import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import './AgentForm.css';

function AgentForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    licenseNumber: "",
  });

  const navigate = useNavigate(); // useNavigate hook

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/add-agent", formData);
      alert("Agent added!");
      setFormData({ name: "", email: "", phone: "", licenseNumber: "" });

      // After submitting, navigate to AgentList page
      navigate("/agents");
    } catch (error) {
      console.error("Error adding agent:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
      <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
      <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} required />
      <input name="licenseNumber" placeholder="License Number" value={formData.licenseNumber} onChange={handleChange} required />
      <button type="submit">Add Agent</button>
    </form>
  );
}

export default AgentForm;
