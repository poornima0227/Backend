// const db = require('../config/db'); // Your database connection

// // Find user by username
// exports.findUserByUsername = (username, callback) => {
//   const query = 'SELECT * FROM users WHERE username = ?';
//   db.query(query, [username], (err, results) => {
//     if (err) return callback(err, null);

//     // If no user found, return null
//     if (results.length === 0) return callback(null, null);

//     callback(null, results[0]); // Return the user object
//   });
// };

// // Create a new user
// exports.createUser = ({ username, password, email, role }, callback) => {
//   const query = 'INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)';
//   db.query(query, [username, password, email, role], (err, result) => {
//     if (err) return callback(err);

//     callback(null, result); // Return the result of the query
//   });
// };
