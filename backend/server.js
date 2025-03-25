require("dotenv").config();
const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

app.use(express.json()); // Middleware to parse JSON

// Test route
app.get("/", (req, res) => {
  res.send("Welcome to the Auth API!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
