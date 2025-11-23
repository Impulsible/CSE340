const { Pool } = require("pg")
require("dotenv").config()

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

// Test connection
pool.on("connect", () => {
  console.log("Database connected successfully")
})

pool.on("error", (err) => {
  console.error("Database connection error:", err)
})

module.exports = pool
