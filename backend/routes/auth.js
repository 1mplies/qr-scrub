const express = require("express");
const bcrypt = require("bcryptjs");
const { Pool } = require("pg");
require("dotenv").config();

const router = express.Router();
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Basic test route
router.get("/test", (req, res) => {
  res.send("Auth route is working!");
});


// Register new user with password hashing
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  if (userExists.rows.length > 0) {
    return res.status(400).json({ message: "User already exists" });
  }

   // Hash the password
   const salt = await bcrypt.genSalt(10);
   const hashedPassword = await bcrypt.hash(password, salt);
 

  // Insert new user
  const newUser = await pool.query(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
    [username, email, password]
  );

  res.status(201).json({ message: "User registered successfully", user: newUser.rows[0] });
});


module.exports = router;
