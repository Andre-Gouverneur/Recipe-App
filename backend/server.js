// Main server file for the backend using Express and Mongoose

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const cors = require('cors'); 
const Recipe = require('./models/recipe');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors()); 

// Serve static files from the 'frontend' directory first
app.use(express.static('/frontend'));
// Also serve image uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up storage for uploaded images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

// API Routes (These are now below the static file serving)

// GET a single recipe by ID
app.get('/api/recipes/:id', async (req, res) => {
    try {
        const recipeId = req.params.id;
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json(recipe);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET all recipes with optional search filter
app.get('/api/recipes', async (req, res) => {
    try {
        const { search, featured } = req.query;
        let query = {};
        let limit = 0;

        if (search) {
            const searchPattern = new RegExp(search, 'i');
            query = {
                $or: [
                    { name: { $regex: searchPattern } },
                    { description: { $regex: searchPattern } },
                    { 'ingredients.name': { $regex: searchPattern } },
                    { tags: { $regex: searchPattern } }
                ]
            };
        } else if (featured === 'true') {
            query = { isFeatured: true };
            limit = 5;
        }

        const recipes = await Recipe.find(query).limit(limit);
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new recipe
app.post('/api/recipes', upload.single('recipeImage'), async (req, res) => {
    try {
        const ingredients = JSON.parse(req.body.ingredients || '[]');
        const instructions = JSON.parse(req.body.instructions || '[]');
        const tags = JSON.parse(req.body.tags || '[]');
        
        const recipeData = {
            name: req.body.name,
            description: req.body.description,
            prepTime: req.body.prepTime,
            cookTime: req.body.cookTime,
            servings: req.body.servings,
            ingredients: ingredients,
            instructions: instructions,
            tags: tags,
        };

        if (req.file) {
            recipeData.imageURL = `/uploads/${req.file.filename}`;
        }

        const newRecipe = new Recipe(recipeData);
        await newRecipe.save();
        res.status(201).json(newRecipe);
    } catch (err) {
        console.error("Error adding recipe:", err);
        res.status(400).json({ message: err.message });
    }
});

// PUT a recipe by ID
app.put('/api/recipes/:id', upload.single('recipeImage'), async (req, res) => {
    try {
        const recipeId = req.params.id;
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        
        const ingredients = JSON.parse(req.body.ingredients || '[]');
        const instructions = JSON.parse(req.body.instructions || '[]');
        const tags = JSON.parse(req.body.tags || '[]');

        const updatedData = {
            name: req.body.name,
            description: req.body.description,
            prepTime: req.body.prepTime,
            cookTime: req.body.cookTime,
            servings: req.body.servings,
            ingredients: ingredients,
            instructions: instructions,
            tags: tags
        };

        if (req.file) {
            if (recipe.imageURL && recipe.imageURL.startsWith('/uploads/')) {
                const oldImagePath = path.join(__dirname, recipe.imageURL);
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error('Error deleting old image:', err);
                });
            }
            updatedData.imageURL = `/uploads/${req.file.filename}`;
        } else if (req.body.imageURL === '') {
            updatedData.imageURL = '';
        } else if (req.body.imageURL) {
            updatedData.imageURL = req.body.imageURL;
        }

        Object.assign(recipe, updatedData);
        const updatedRecipe = await recipe.save();
        res.json(updatedRecipe);
    } catch (err) {
        console.error("Error updating recipe:", err);
        res.status(400).json({ message: err.message });
    }
});

// DELETE a recipe by ID
app.delete('/api/recipes/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findByIdAndDelete(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        res.json({ message: 'Recipe successfully deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});