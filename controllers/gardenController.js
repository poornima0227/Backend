const db = require('../config/db');

exports.addItem = async (req, res) => {


  const { name, category } = req.body;
  const picture = req.file ? req.file.path : null; // Uploaded file's path

  // Validate inputs
  if (!name) return res.status(400).json({ message: 'Name is required' });
  if (!category) return res.status(400).json({ message: 'Category is required' });
  if (!picture) return res.status(400).json({ message: 'Picture is required' });

  try {
    // Insert item into the database
    const result = await db.query(
      'INSERT INTO garden (name, category, picture) VALUES (?, ?, ?)',
      [name, category, picture]
    );

    

    // Respond with the inserted item details, including the generated id
    res.status(201).json({
      id: result.insertId, // Assuming insertId is available
      name,
      category,
      picture,
    });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ message: 'Failed to add item' });
  }
};

// Get items by category
exports.getItem = async (req, res) => {
  const { category } = req.params;

  try {
    const [rows] = await db.query('SELECT * FROM garden WHERE category = ?', [category]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ message: 'Failed to fetch items' });
  }
};
