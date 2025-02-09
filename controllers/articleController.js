const db = require('../config/db');

// Get all articles
exports.getArticles = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM articles');
       

        const [articles] = result; // Destructure rows
        res.status(200).json(articles);
    } catch (err) {
      
        res.status(500).json({ error: 'Database error', details: err.message });
    }
};

// Add a new article
exports.addArticle = async (req, res) => {
    const { title, content, author } = req.body;
    try {
        const result = await db.query('INSERT INTO articles (title, content, author) VALUES (?, ?, ?)', [title, content, author]);
        res.status(201).json({ message: 'Article created', id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: 'Database error', details: err });
    }
};
