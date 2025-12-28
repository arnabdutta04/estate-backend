const express = require("express");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();
const { connectDB } = require("./config/db");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes FIRST
app.use("/api/auth", require("./routes/auth"));
app.use("/api/properties", require("./routes/properties"));
app.use("/api/brokers", require("./routes/brokers"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// SERVE FRONTEND
app.use(express.static(path.join(__dirname, "public")));

// React Router fallback — LAST
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await connectDB();
});
