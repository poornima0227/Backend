const db = require('../config/db');

const cropData = {
    "Cereal": { "seeds": 50, "water": 4500, "fertilizer": 55, "yield": 2400, "costPerAcre": 14000 },
    "Pulse": { "seeds": 40, "water": 3000, "fertilizer": 45, "yield": 2000, "costPerAcre": 12000 },
    "Fruit": { "seeds": 10, "water": 10000, "fertilizer": 100, "yield": 5000, "costPerAcre": 25000 },
    "Vegetable": { "seeds": 30, "water": 7000, "fertilizer": 75, "yield": 3000, "costPerAcre": 20000 },
    "Spice": { "seeds": 20, "water": 5000, "fertilizer": 50, "yield": 1500, "costPerAcre": 18000 },
    "Fiber Crop": { "seeds": 25, "water": 6000, "fertilizer": 70, "yield": 3500, "costPerAcre": 22000 },
    "Oilseed": { "seeds": 35, "water": 4000, "fertilizer": 65, "yield": 2700, "costPerAcre": 16000 }
};

// Crop category mapping
const cropCategory = {
    "Rice": "Cereal",
    "Maize": "Cereal",
    "Ragi": "Cereal",
    "Sorghum": "Cereal",
    "Pearl Millet": "Cereal",
    "Black Gram": "Pulse",
    "Green Gram": "Pulse",
    "Red Gram": "Pulse",
    "Banana": "Fruit",
    "Mango": "Fruit",
    "Guava": "Fruit",
    "Jackfruit": "Fruit",
    "Pineapple": "Fruit",
    "Tomato": "Vegetable",
    "Brinjal": "Vegetable",
    "Onion": "Vegetable",
    "Tapioca": "Vegetable",
    "Turmeric": "Spice",
    "Black Pepper": "Spice",
    "Coriander": "Spice",
    "Cotton": "Fiber Crop",
    "Jute": "Fiber Crop",
    "Groundnut": "Oilseed",
    "Sunflower": "Oilseed"
};

exports.calculate = async (req, res) => {
    const { crops, landArea } = req.body;
    if (!crops || !landArea) {
        return res.status(400).json({ error: "Crops and land area are required." });
    }

    const landPerCrop = landArea / crops.length;
    let totalProfit = 0;
    let results = [];

    try {
        // Fetch crop details (name, price) from the garden table
        const sql = `SELECT name, price FROM garden WHERE name IN (?)`;
        const [gardenData] = await db.query(sql, [crops]); // Using async/await with mysql2

        if (gardenData.length === 0) {
            return res.status(404).json({ error: "Crops not found in the garden table." });
        }

        gardenData.forEach(crop => {
            const { name, price } = crop;
            const category = cropCategory[name]; // Get crop category

            if (!category || !cropData[category]) {
                console.warn(`Category data not found for crop: ${name}`);
                return;
            }

            const data = cropData[category];

            // Perform calculations
            const seeds = landPerCrop * data.seeds;
            const water = landPerCrop * data.water;
            const fertilizer = landPerCrop * data.fertilizer;
            const yieldAmount = landPerCrop * data.yield;
            const revenue = yieldAmount * price; // Use price from garden table
            const cost = landPerCrop * data.costPerAcre;
            const profit = revenue - cost;
            totalProfit += profit;

            results.push({
                crop: name,
                seeds: `${seeds.toFixed(2)} kg`,
                water: `${water.toFixed(2)} L`,
                fertilizer: `${fertilizer.toFixed(2)} kg`,
                yield: `${yieldAmount.toFixed(2)} kg`,
                revenue: `₹${revenue.toFixed(2)}`,
                cost: `₹${cost.toFixed(2)}`,
                profit: `₹${profit.toFixed(2)}`
            });
        });

        res.json({ results, totalProfit: `₹${totalProfit.toFixed(2)}` });

    } catch (error) {
        console.error("Database Query Error:", error.message);
        res.status(500).json({ error: "Database query failed." });
    }
};
