const { Pool } = require("pg")
require("dotenv").config()

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

// Only log once when pool is created, not on every connection
console.log("✅ Database connection pool created")

// Test connection once on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err)
  } else {
    console.log('✅ Database connection test successful')
    console.log('📍 Connected at:', res.rows[0].now)
  }
})

pool.on("error", (err) => {
  console.error("Database connection error:", err)
})

module.exports = pool