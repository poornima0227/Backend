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


exports.addDetails = async (req, res) => {
  const { garden_id, price, soil_type, season, temperature_range, water_requirements } = req.body;

  // Validate input
  if (!garden_id) return res.status(400).json({ message: "Garden ID is required" });
  if (!price) return res.status(400).json({ message: "Price is required" });
  if (!soil_type) return res.status(400).json({ message: "Soil type is required" });
  if (!season) return res.status(400).json({ message: "Season is required" });
  if (!temperature_range) return res.status(400).json({ message: "Temperature range is required" });
  if (!water_requirements) return res.status(400).json({ message: "Water requirements are required" });

  try {
    // Insert details into the database
    await db.query(
      "INSERT INTO details (garden_id, price, soil_type, season, temperature_range, water_requirements) VALUES (?, ?, ?, ?, ?, ?)",
      [garden_id, price, soil_type, season, temperature_range, water_requirements]
    );

    res.status(201).json({ message: "Crop details added successfully" });
  } catch (error) {
    console.error("Error adding crop details:", error);
    res.status(500).json({ message: "Failed to add crop details" });
  }
};

// Fetch All Crop Details with Garden Info
exports.getDetails = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT g.id, g.name, g.category, g.description, g.picture,
              d.price, d.soil_type, d.season, d.temperature_range, d.water_requirements
       FROM garden g
       LEFT JOIN details d ON g.id = d.garden_id`
    );

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching crop details:", error);
    res.status(500).json({ message: "Failed to fetch crop details" });
  }
};
