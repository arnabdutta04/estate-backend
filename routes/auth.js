const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const { protect } = require("../middleware/auth");

const router = express.Router();

/**
 * Generate JWT with role
 */
const generateToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

/**
 * ===================== REGISTER =====================
 * role can be: customer | broker
 */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields required" });
    }

    // 🔒 Normalize & secure role
    let finalRole = "CUSTOMER";
    if (role === "broker") {
      finalRole = "PENDING_BROKER"; // broker needs profile verification
    }

    // Check existing user
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role`,
      [name, email, phone, hashedPassword, finalRole]
    );

    const user = result.rows[0];

    res.status(201).json({
      user,
      token: generateToken(user),
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});

/**
 * ===================== LOGIN =====================
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    delete user.password;

    res.json({
      user,
      token: generateToken(user),
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

/**
 * ===================== ME =====================
 */
router.get("/me", protect, async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, email, phone, role FROM users WHERE id = $1",
    [req.user.id]
  );

  res.json(result.rows[0]);
});

module.exports = router;
