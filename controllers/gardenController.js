const db = require('../config/db');

// Add Item
exports.addItem = async (req, res) => {
  const { id, name, category, description } = req.body;
  const picturePath = req.file ? req.file.path : null; // Uploaded file's path

  // Validate inputs
  if (!id) return res.status(400).json({ message: 'ID is required' });
  if (!name) return res.status(400).json({ message: 'Name is required' });
  if (!category) return res.status(400).json({ message: 'Category is required' });
  if (!description) return res.status(400).json({ message: 'Description is required' });
  if (!picturePath) return res.status(400).json({ message: 'Picture is required' });

  // Construct the picture URL
  const pictureUrl = `${req.protocol}://${req.get('host')}/${picturePath}`; // Full URL for the image

  try {
    // Insert item into the database
    await db.query(
      'INSERT INTO garden (id, name, category, description, picture) VALUES (?, ?, ?, ?, ?)',
      [id, name, category, description, pictureUrl]
    );

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
    // Fetch items by category
    const [rows] = await db.query(
      'SELECT id, name, category, description, picture FROM garden WHERE category = ?',
      [category]
    );

    // Respond with the fetched items
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Failed to fetch items' });
  }
};
