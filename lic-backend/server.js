import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import agentRoutes from "./routes/agentRoutes.js";  // Ya jahan bhi aapke routes hain

// Load environment variables
dotenv.config();


const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// MongoDB Connect
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Error: ", err));

// Use agent routes
app.use("/api", agentRoutes);

// Routes
app.get("/", (req, res) => {
    res.send("API is running...");
});

app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
