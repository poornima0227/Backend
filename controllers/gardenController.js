const db = require('../config/db');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

// Add Item
exports.addItem = async (req, res) => {
  const { name, category, description } = req.body;
  const picturePath = req.file ? req.file.path : null; // Uploaded file's path

  // Validate inputs
  if (!name) return res.status(400).json({ message: 'Name is required' });
  if (!category) return res.status(400).json({ message: 'Category is required' });
  if (!description) return res.status(400).json({ message: 'Description is required' });
  if (!picturePath) return res.status(400).json({ message: 'Picture is required' });

  // Generate a unique ID and construct the picture URL
  const id = uuidv4();
  const pictureUrl = `${req.protocol}://${req.get('host')}/${picturePath}`; // Full URL for the image

  try {
    // Insert item into the database
    const result = await db.query(
      'INSERT INTO garden (id, name, category, description, picture) VALUES (?, ?, ?, ?, ?)',
      [id, name, category, description, pictureUrl]
    );

    // Respond with the inserted item details
    res.status(201).json({
      id,
      name,
      category,
      description,
      picture: pictureUrl,
    });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ message: 'Failed to add item' });
  }
};

// Get Items by Category
exports.getItem = async (req, res) => {
  const { category } = req.params;

  try {
    const [rows] = await db.query(
      'SELECT id, name, category, description, picture FROM garden WHERE category = ?',
      [category]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Failed to fetch items' });
  }
};

