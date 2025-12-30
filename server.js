const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const { connectDB } = require("./config/db");

dotenv.config();

const app = express();

/* =======================
   ✅ CORS CONFIG (FIX)
======================= */
app.use(
  cors({
    origin: [
      "https://estate-backend-oun8.onrender.com/api", // frontend Render URL
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

/* =======================
   BODY PARSERS
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   API ROUTES FIRST
======================= */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/properties", require("./routes/properties"));
app.use("/api/brokers", require("./routes/brokers"));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* =======================
   (OPTIONAL) Serve frontend
   ONLY if backend + frontend
   are in SAME service
======================= */
// app.use(express.static(path.join(__dirname, "public")));
// app.get("*", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

/* =======================
   START SERVER
======================= */
const PORT = process.env.PORT || 10000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Server running on port ${PORT}`);
});
