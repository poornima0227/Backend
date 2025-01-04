const mysql = require('mysql');
require('dotenv').config(); // Load environment variables from .env file

// Create MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('⚠️ Database connection failed:');
    console.error(`Error Code: ${err.code}`);
    console.error(`Error Message: ${err.message}`);
    console.error('Stack Trace:', err.stack);
    process.exit(1); // Exit process on connection failure
  }
  console.log('✅ Successfully connected to the MySQL database.');
});

module.exports = db;
