const express = require('express');
const app = express();
const db = require('./config/db'); // Database configuration file
const bodyParser = require('body-parser');
const path = require('path');
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));


//error handling
app.use((err, re, res, next)=>{
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";
  res.status(err.statusCode).json({
    message:err.message,
  });
})
// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/', require('./routes/webRoutes'));


// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get('/', (req, res) => {
  res.send('Welcome');
});

// Define configurations directly in code
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running....`);
});
