const db = require('../config/db');
const cloudinary = require("../config/cloudinaryConfig");

// ✅ Add an Article (Image stored in Cloudinary)
exports.addArticle = async (req, res) => {
    try {
        const { title, content, author, published_date, category, tags, image } = req.body; // `image` should be Base64

        if (!title || !image) {
            return res.status(400).json({ error: "Title and image are required!" });
        }

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(image, {
            folder: "articles_images", // Cloudinary folder
        });

        const imageUrl = result.secure_url; // Cloudinary Image URL

        // Store article in MySQL
        const [newArticle] = await db.query(
            'INSERT INTO articles (title, content, author, published_date, category, tags, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [title, content, author, published_date || null, category || null, tags || null, imageUrl]
        );

        res.status(201).json({ message: 'Article created successfully!', id: newArticle.insertId, imageUrl });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
};

// ✅ Get all Articles (or a single article by ID)
exports.getArticle = async (req, res) => {
    try {
        const { id } = req.params; // Get article ID from URL parameters

        let query = 'SELECT id, title, content, author, published_date, category, tags, image_url FROM articles';
        let values = [];

        if (id) {
            query += ' WHERE id = ?';
            values.push(id);
        }

        const [articles] = await db.query(query, values);

        if (!articles.length) {
            return res.status(404).json({ message: 'No articles found' });
        }

        res.status(200).json(id ? articles[0] : articles);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
};
