const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://pawankumardev28:mongo@first.apbbt2s.mongodb.net/qrgenerator?retryWrites=true&w=majority&appName=first");
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ DB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
