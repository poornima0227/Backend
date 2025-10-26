const fs = require('fs');
const path = require('path');
const db = require('../config/db'); // Adjust based on your DB config file location

async function convertImagesToBlob(tableName, idColumn, imageColumn) {
    try {
        console.log(`Converting images in table: ${tableName}...`);
        
        // Get existing image paths
        const [rows] = await db.query(`SELECT ${idColumn}, ${imageColumn} FROM ${tableName} WHERE ${imageColumn} IS NOT NULL`);

        for (let row of rows) {
            const imagePath = path.join(__dirname, "..", row[imageColumn]); // Adjust based on storage location
            
            if (fs.existsSync(imagePath)) {
                const imageBuffer = fs.readFileSync(imagePath);
                await db.query(`UPDATE ${tableName} SET ${imageColumn} = ? WHERE ${idColumn} = ?`, [imageBuffer, row[idColumn]]);
                console.log(`Updated ${tableName}: ID ${row[idColumn]}`);
            }
        }

        console.log(`Images converted successfully in table: ${tableName}`);
    } catch (error) {
        console.error(`Error converting images in table: ${tableName}`, error);
    }
}

// Run migration for both tables
(async () => {
    await convertImagesToBlob("garden", "id", "picture");  // Garden table
    await convertImagesToBlob("article", "id", "image");   // Article table (change 'image' if column name differs)
    
    console.log("All image paths converted to BLOB successfully.");
    process.exit();
})();
