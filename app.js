const express = require('express');
const app = express();
const db = require('./config/db'); // Database configuration file

app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

// Define configurations directly in code
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running....`);
});
