const userModel = require('../models/userModel');

// Login function
exports.login = (req, res) => {
  const { username, password } = req.body;

  // Find user by username
  userModel.findUserByUsername(username, (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    // Check if user exists and if the password matches
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Return user details excluding password
    res.json({ 
      message: 'Login successful', 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role // include the role if needed
      }
    });
  });
};

// Register function
exports.register = (req, res) => {
  const { username, password, email, role = 'farmer' } = req.body; // default role to 'farmer'

  // Check if the username already exists
  userModel.findUserByUsername(username, (err, existingUser) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Create a new user
    userModel.createUser({ username, password, email, role }, (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'User registered successfully' });
    });
  });
};
