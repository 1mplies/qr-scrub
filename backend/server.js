require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const authRoutes = require("./routes/auth");  // Import authentication routes
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 5000;

// PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Test connection to the database
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('Error connecting to database:', err);
  } else {
    console.log('Connected to database:', res.rows[0]);
  }
});


// Middleware
app.use(cors());
app.use(bodyParser.json());  // Middleware to parse JSON request bodies

// Routes
app.use("/api/auth", authRoutes);  // Authentication routes (from `authRoutes`)

// Test route to verify server is running
app.get("/", (req, res) => {
  res.send("Welcome to the Auth API!");
});

// Register Endpoint (used for demo purposes, you can remove if needed)
app.post('/api/auth/register', async (req, res) => {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return res.status(400).json({ message: "Email, username, and password are required." });
  }

  try {
    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userUUID = uuidv4();  // generate UUID for the user
    console.log("Generated UUID:", userUUID);  // log uuid

    // Insert user & uuid into the database
    const result = await pool.query(
      'INSERT INTO users (username, email, password, uuid) VALUES ($1, $2, $3, $4::uuid) RETURNING id, username, email, uuid',
      [username, email, hashedPassword, userUUID]
    );

    console.log('Inserted User:', result.rows[0]); // Log the inserted user for debugging
    res.status(201).json({ message: "Registration successful!", user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});


// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // Check if user exists in the database
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = result.rows[0];

    // Compare password with hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: "Login successful!", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// Start server
app.listen(5000, '0.0.0.0', () => {
  console.log("Server running on port 5000");
});