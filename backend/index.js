const express = require("express");
const { Client } = require("pg");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables

const app = express();
const port = process.env.PORT || 5000;

// PostgreSQL client setup
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

client.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch(err => console.error("Connection error", err.stack));

// Example route
app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

