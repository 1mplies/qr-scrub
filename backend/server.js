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
  const { email, password, username, role } = req.body;

  if (!email || !password || !username || !role) {
    return res.status(400).json({ message: "Email, username, password, and role are required." });
  }

  try {
    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const userUUID = uuidv4();  // Generate UUID for the user
    console.log("Generated UUID:", userUUID);  // Log UUID for debugging

    // Insert user, role, and uuid into the database
    const result = await pool.query(
      'INSERT INTO users (username, email, password, role, uuid) VALUES ($1, $2, $3, $4, $5::uuid) RETURNING id, username, email, role, uuid',
      [username, email, hashedPassword, role, userUUID]
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

    // Generate JWT token and include role in the payload
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },  // Include role here
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: "Login successful!", token, role: user.role });  // Return role along with token
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
});

// QR Code API endpoint (fetch user data for QR screen)
app.get('/api/auth/qr', async (req, res) => {
  const token = req.headers['authorization'].split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const userId = decoded.id;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length > 0) {
      const { username, email, role, uuid } = userResult.rows[0];
      res.json({ fullName: username, uuid, role });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
