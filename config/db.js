const mysql = require('mysql');
require('dotenv').config(); // Load environment variables from the .env file

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    console.error('Error Code:', err.code);
    console.error('Error Message:', err.message);
    console.error('Stack Trace:', err.stack);
    process.exit(1); // Stop the server
  }
  console.log('Connected to the database.');
});

module.exports = db;
