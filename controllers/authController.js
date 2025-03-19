const mysql = require('mysql2/promise')
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const randomstring = require('randomstring');
const sendMail = require('../helpers/sendMail');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = process.env;

exports.register = async (req, res) => {
  try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
      }

      // Check if email already exists
      const [existingUsers] = await db.query(
          `SELECT * FROM users WHERE LOWER(email) = LOWER(?);`,
          [req.body.email]
      );

      if (existingUsers.length > 0) {
          return res.status(400).json({ msg: 'This email is already in use!' });
      }

      // Hash password
      const hash = await bcrypt.hash(req.body.password, 10);

      // Check if user is admin
      const adminEmail = 'poornimalakshmi807@gmail.com'; // Replace with your admin email
      const isAdmin = req.body.email.toLowerCase() === adminEmail.toLowerCase() ? 1 : 0;

      // Insert user into database
      const [insertResult] = await db.query(
          `INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?);`,
          [req.body.username, req.body.email, hash, isAdmin]
      );

      // Send verification mail
      const mailSubject = 'Mail Verification';
      const randomToken = randomstring.generate();
      const content = `<p>Hi ${req.body.username},</p>` +
          `<p>Please <a href="http://localhost:3000/mail-verification?token=${randomToken}">verify your email</a>.</p>`;

      await sendMail(req.body.email, mailSubject, content);

      // Store verification token in DB
      await db.query('UPDATE users SET token = ? WHERE email = ?', [randomToken, req.body.email]);

      const response = { msg: 'User has been registered successfully!' };
      if (isAdmin) response.isAdmin = true; // Add only for admin

      return res.status(200).json(response);

  } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ msg: "Internal Server Error", error });
  }
};

exports.verifyMail = (req, res) => {
  const token = req.query.token; // Extract the token from the query parameter
  
  db.query('SELECT * FROM users WHERE token=? LIMIT 1', token, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send({ msg: 'Internal Server Error' });
    }

    if (result.length > 0) {
      // If user found, update their email verification status
      db.query(
        `UPDATE users SET token=NULL, is_verified=1 WHERE id='${result[0].id}'`,
        (error) => {
          if (error) {
            return res.status(500).send({ msg: 'Database Error' });
          }
          return res.render('mail-verification', {
            message: 'Mail verified successfully!',
          });
        }
      );
    } else {
      return res.render('404', { message: 'Invalid verification token!' });
    }
  });
};


exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Get email from request
    const email = req.body.email;

    // Use async/await without callbacks
    const [result] = await db.query(
      `SELECT * FROM users WHERE email = ?`,
      [email]
    );

    if (result.length === 0) {
      return res.status(400).send({ msg: "Email or Password is incorrect!" });
    }

    // Compare password using bcrypt
    const isMatch = await bcrypt.compare(req.body.password, result[0].password);

    if (!isMatch) {
      return res.status(400).send({ msg: "Email or Password is incorrect!" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: result[0].id, is_admin: result[0].is_admin },
      JWT_SECRET,
      { expiresIn: "10d" }
    );

    return res.status(200).send({
      msg: "Logged in",
      token,
      user: result[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ msg: "Server error", error: err.message });
  }
};

exports.getUser = (req, res) => {
  const authToken = req.headers.authorization.split(' ')[1];
  const decode = jwt.verify(authToken, JWT_SECRET);

  db.query('SELECT name, age, address, photo FROM users WHERE id = ?', [decode.id], function (error, result) {
    if (error) throw error;

    return res.status(200).send({
      success: true,
      data: result[0],
      message: 'Fetched Successfully!',
    });
  });
};

exports.updateUser = (req, res) => {
  const { name, age, address } = req.body;
  const authToken = req.headers.authorization.split(' ')[1];
  const decode = jwt.verify(authToken, JWT_SECRET);

  // Check if the user uploaded a file
  const photo = req.file ? `uploads/${req.file.filename}` : null;

  if (!name || !age || !address) {
    return res.status(400).send({ success: false, message: 'All fields are required!' });
  }

  // Update query with photo
  const updateQuery = photo
    ? 'UPDATE users SET name = ?, age = ?, address = ?, photo = ? WHERE id = ?'
    : 'UPDATE users SET name = ?, age = ?, address = ? WHERE id = ?';

  const queryParams = photo ? [name, age, address, photo, decode.id] : [name, age, address, decode.id];

  db.query(updateQuery, queryParams, function (error, result) {
    if (error) throw error;

    if (result.affectedRows === 0) {
      return res.status(404).send({ success: false, message: 'User not found!' });
    }

    return res.status(200).send({ success: true, message: 'Profile updated successfully!' });
  });
};


exports.addTask = async (req, res) => {
  console.log("Received request:", req.body);  // ✅ Check if request is received

  try {
    const { task_name, description, due_date, status } = req.body;

    if (!task_name || !due_date) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ message: "Task name and due date are required" });
    }

    const sql = "INSERT INTO tasks (task_name, description, due_date, status) VALUES (?, ?, ?, ?)";

    const connection = await db.getConnection(); // ✅ Get connection from pool

    try {
      const [result] = await connection.query(sql, [task_name, description, due_date, status || "pending"]);
      

      return res.status(201).json({ message: "Task added successfully", taskId: result.insertId });
    } finally {
      connection.release(); // ✅ Release connection back to the pool
    }

  } catch (error) {
   
    return res.status(500).json({ message: "Internal server error" });
  }
};

