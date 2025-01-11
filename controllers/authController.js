const userModel = require('../models/userModel');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const randomstring = require('randomstring');
const sendMail = require('../helpers/sendMail');

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
        return res.status(409).send({
          msg: 'This user is already in use!',
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(400).send({ msg: err });
          } else {
            db.query(
              `INSERT INTO users (username, email, password) VALUES ('${req.body.username}', ${db.escape(req.body.email)}, ${db.escape(hash)});`,
              (err, result) => {
                if (err) {
                  return res.status(400).send({ msg: err });
                }

                // Send verification mail
                const mailSubject = 'Mail Verification';
                const randomToken = randomstring.generate();
                const content =
                  '<p>Hi ' +
                  req.body.username +
                  ', Please <a href="http://localhost:3000/mail-verification?token=' +
                  randomToken +
                  '">Verify</a> your mail.</p>';
                sendMail(req.body.email, mailSubject, content);

                db.query(
                  'UPDATE users SET token=? WHERE email=?',
                  [randomToken, req.body.email],
                  (error) => {
                    if (error) {
                      return res.status(400).send({ msg: error });
                    }
                  }
                );

                return res.status(200).send({
                  msg: 'This user has been registered with us!',
                });
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
