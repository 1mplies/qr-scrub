const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");
require("dotenv").config();
const { v4: uuidv4 } = require('uuid');


const router = express.Router();

// Middleware to verify token
const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access Denied" });

  if (!token.startsWith("Bearer ")) {
    return res.status(400).json({ message: "Token format is incorrect" });
  }

  const tokenWithoutBearer = token.split(" ")[1];

  jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });
    req.user = user;
    next();
  });
};

// protected route for qr page
router.get("/qr", authenticateToken, async (req, res) => {
  try {
    // fetch the authenticated user's data
    const user = await pool.query("SELECT full_name, uuid FROM users WHERE id = $1", [req.user.id]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // respond with the user's full_name and uuid
    res.json({ fullName: user.rows[0].full_name, uuid: user.rows[0].uuid });
  } catch (err) {
    console.error("Error fetching user data:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { email, password, username, fullName } = req.body;

    // Check if user already exists
    const userExists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //generate UUID
    const userUUID = uuidv4();

    // Insert user & uuid into the database
    const result = await pool.query(
      'INSERT INTO users (username, email, password, uuid, full_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, uuid, full_name',
      [username, email, hashedPassword, userUUID, fullName]
    );

    res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
  } catch (err) {
    console.error("Error during registration: ", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// User login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await pool.query("SELECT id, username, email, password FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Error during login: ", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Protected route
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await pool.query("SELECT id, username, email FROM users WHERE id = $1", [req.user.id]);
    if (user.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user.rows[0]);
  } catch (err) {
    console.error("Error fetching user profile: ", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
