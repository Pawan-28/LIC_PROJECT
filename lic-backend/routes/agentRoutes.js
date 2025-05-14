import express from "express";
import Agent from "../models/Agent.js";  // 👈 ये लाइन सही है

const router = express.Router();

// Add new agent
router.post("/add-agent", async (req, res) => {
    const { name, email, phone, licenseNumber } = req.body;

    try {
        const newAgent = new Agent({ name, email, phone, licenseNumber });
        await newAgent.save();
        res.status(201).json(newAgent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all agents
router.get("/agents", async (req, res) => {
    try {
        const agents = await Agent.find();
        res.json(agents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
