const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test the connection
pool.on('connect', () => {
  console.log('✅ PostgreSQL connection established');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
});

module.exports = pool;