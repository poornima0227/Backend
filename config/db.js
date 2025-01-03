const mysql = require('mysql');

// Use environment variables for sensitive info
const db = mysql.createConnection({
  host: process.env.DB_HOST,  // Get database host from environment variable
  user: process.env.DB_USER,  // Get database username from environment variable
  password: process.env.DB_PASSWORD,  // Get database password from environment variable
  database: process.env.DB_NAME,  // Get database name from environment variable
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
    console.error('Stack Trace:', err.stack);
    process.exit(1); // Stop the server if connection fails
  }
  console.log('Connected to the database.');
});

module.exports = db;
