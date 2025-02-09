const mysql = require('mysql2/promise');
require('dotenv').config(); // Load environment variables from the .env file

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.getConnection()
  .then(() => {
    console.log('Connected to the ' + process.env.DB_NAME + ' database.');
  })
  .catch((err) => {
    console.error(process.env.DB_NAME + ' Database connection failed:', err.message);
    process.exit(1); // Stop the server
  });

module.exports = db;
