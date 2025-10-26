const db = require('../config/db');
const cloudinary = require("../config/cloudinaryConfig");

// ✅ Add Item (Image stored as BLOB)
exports.addItem = async (req, res) => {
  const { name, category, description, picture } = req.body; // `picture` should be Base64

  if (!name || !category || !description || !picture) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(picture, {
      folder: "garden_images", // Cloudinary folder
    });

    const imageUrl = result.secure_url; // Get Cloudinary Image URL

    // Store data in MySQL
    await db.query(
      "INSERT INTO garden (name, category, description, picture) VALUES (?, ?, ?, ?)",
      [name, category, description, imageUrl]
    );

    res.status(201).json({ message: "Item added successfully", imageUrl });
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ message: "Failed to add item" });
  }
};

// ✅ Get Items by Category
exports.getItem = async (req, res) => {
  const category = req.query.category ? req.query.category.trim() : null;

  try {
    let query = "SELECT id, name, category, description, picture, price, soil_type FROM garden";
    let params = [];

    if (category) {
      query += " WHERE category = ?";
      params.push(category);
    }

    const [rows] = await db.query(query, params);

    if (rows.length === 0) {
      return res.status(404).json({ message: "No items found" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Failed to fetch items" });
  }
};



// ✅ Add Crop Details
exports.addDetails = async (req, res) => {
  const { garden_id, price, soil_type, season, temperature_range, water_requirements } = req.body;

  if (!garden_id || !price || !soil_type || !season || !temperature_range || !water_requirements) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
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

// ✅ Fetch All Crop Details with Garden Info
exports.getDetails = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
          g.id AS garden_id, 
          g.name AS garden_name, 
          g.category, 
          g.description, 
          
          IFNULL(d.price, 0.00) AS price,  -- Ensure price is not NULL
          IFNULL(d.soil_type, 'Unknown') AS soil_type, 
          IFNULL(d.season, 'Not specified') AS season, 
          IFNULL(d.temperature_range, 'N/A') AS temperature_range, 
          IFNULL(d.water_requirements, 'Not available') AS water_requirements 
       FROM garden g
       LEFT JOIN details d ON g.id = d.garden_id`
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "No crop details found" });
    }

    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching crop details:", error);
    res.status(500).json({ message: "Failed to fetch crop details" });
  }
};
