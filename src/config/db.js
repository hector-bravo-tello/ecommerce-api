const { Pool } = require('pg');
require('dotenv').config();

// Configure the database connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  // Enable SSL connection for PostgreSQL, required especially for remote databases
  //ssl: {
  //  rejectUnauthorized: false
  //},
  // Additional pooling options
  max: 20, // set pool max size to 20
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // return an error after 2 seconds if connection could not be established
});

// Query method for use in your app
exports.query = async (text, params) => {
  try {
    const result = await pool.query(text, params);
    return result;
    
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
};
