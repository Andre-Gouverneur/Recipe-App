//recipe.js// Recipe model definition using Mongoose

const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    prepTime: String,
    cookTime: String,
    servings: Number,
    ingredients: [{
        name: String,
        quantity: String,
        unit: String
    }],
    instructions: [String],
    imageURL: String,
    tags: [String],
    isFeatured: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Recipe', recipeSchema);