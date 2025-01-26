
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const randomstring = require('randomstring');
const sendMail = require('../helpers/sendMail');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = process.env;

// Register function
exports.register = (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  db.query(
    `SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(req.body.email)});`,
    (err, result) => {
      if (result && result.length) {
        return res.status(400).send({
          msg: 'This email is already in use!',
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(400).send({ msg: err });
          } else {
            const adminEmail = 'poornimalakshmi807@gmail.com'; // Replace with your admin email
            const isAdmin = req.body.email.toLowerCase() === adminEmail.toLowerCase() ? 1 : 0;


            db.query(
              `INSERT INTO users (username, email, password, is_admin) VALUES (?, ?, ?, ?);`,
              [req.body.username, req.body.email, hash, isAdmin],
              (err, result) => {
                if (err) {
                  console.error("DB Error:", err);
                  return res.status(400).send({ msg: err });
                }

                // Send verification mail
                const mailSubject = 'Mail Verification';
                const randomToken = randomstring.generate();
                const content =
                  `<p>Hi ${req.body.username},</p>` +
                  `<p>Please <a href="http://localhost:3000/mail-verification?token=${randomToken}">verify your email</a>.</p>`;
                sendMail(req.body.email, mailSubject, content);

                db.query(
                  'UPDATE users SET token = ? WHERE email = ?',
                  [randomToken, req.body.email],
                  (error) => {
                    if (error) {
                      return res.status(400).send({ msg: error });
                    }
                  }
                );

                const response = {
                  msg: 'User has been registered successfully!',
                };

                if (isAdmin) {
                  response.isAdmin = true; // Include only for admin
                }

                return res.status(200).send(response);
              }
            );
          }
        });
      }
    }
  );
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


exports.login = (req, res) =>{

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  db.query(
  
    `SELECT * FROM users WHERE email = ${db.escape(req.body.email)};`,
    (err, result)=>{
      if(err){
        return res.status(400).send({
          msg:err
        });
      }

      if(!result.length){
        return res.status(400).send({
          msg:'Email or Password is incorrect!'
        });

      }

      bcrypt.compare(
        req.body.password,
        result[0]['password'],
        (bErr, bResult)=>{
          if(bErr){
            return res.status(400).send({
              msg:err
            });
          }
          if(bResult){
            // console.log(JWT_SECRET);
            const token = jwt.sign({ id:result[0]['id'], is_admin:result[0]['is_admin'] }, JWT_SECRET, {expiresIn: '10d'});

            return res.status(200).send({
              msg:'Logged in',
              token,
              user: result[0]
            });

          }

          return res.status(400).send({
            msg:'Email or Password is incorrect!'
          });
    
        }
      );
    }
  );

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

