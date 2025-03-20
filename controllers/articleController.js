const db = require('../config/db');

// Get all articles
exports.getArticle= async (req, res) => {
    try {
        const { id } = req.params; // Get the article ID from URL parameters

        const [article] = await db.query('SELECT * FROM articles WHERE id = ?', [id]);

        if (!article.length) {
            return res.status(404).json({ message: 'Article not found' });
        }

        res.status(200).json(article[0]); // Return the found article
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Database error', details: err.message });
    }
};


// Add a new article
exports.addArticle = async (req, res) => {
    try {
        const { title, content, author, published_date, category, tags } = req.body;
        const image_url = req.file ? `/uploads/${req.file.filename}` : null; // Get file path

        if (!title) {
            return res.status(400).json({ error: "Title is required!" });
        }

        const [result] = await db.query(
            'INSERT INTO articles (title, content, author, published_date, category, tags, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [title, content, author, published_date || null, category || null, tags || null, image_url]
        );

        res.status(201).json({ message: 'Article created successfully!', id: result.insertId, image_url });
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err.message });
    }
};
