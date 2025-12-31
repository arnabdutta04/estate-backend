const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connectDB } = require("./config/db");

dotenv.config();

const app = express();

/* ===== CORS ===== */
app.use(
  cors({
    origin: "https://estate-frontend-62p7.onrender.com",
    credentials: true,
  })
);
app.options("*", cors());

/* ===== BODY ===== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===== ROUTES ===== */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/properties", require("./routes/properties"));
app.use("/api/brokers", require("./routes/brokers"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* ===== START ===== */
const PORT = process.env.PORT || 10000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running on port ${PORT}`);
});
