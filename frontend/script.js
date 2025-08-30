// =======================
// Main Page Functions
// =======================

// New function to display a single recipe
async function setupViewRecipePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');
    const container = document.getElementById('recipe-details-container');

    if (!recipeId || !container) {
        container.innerHTML = '<p>Recipe not found.</p>';
        return;
    }

    try {
        const response = await fetch(`/api/recipes/${recipeId}`);
        const recipe = await response.json();
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        container.innerHTML = `
            <h2>${recipe.name}</h2>
            ${recipe.imageURL ? `<img src="${recipe.imageURL}" alt="${recipe.name}">` : ''}
            <p><strong>Description:</strong> ${recipe.description}</p>
            <p><strong>Prep Time:</strong> ${recipe.prepTime} | <strong>Cook Time:</strong> ${recipe.cookTime} | <strong>Servings:</strong> ${recipe.servings}</p>
            <p><strong>Ingredients:</strong></p>
            <ul>
                ${recipe.ingredients.map(i => `<li>${i.name} (${i.quantity})</li>`).join('')}
            </ul>
            <p><strong>Instructions:</strong></p>
            <ol>
                ${recipe.instructions.map(instruction => `<li>${instruction}</li>`).join('')}
            </ol>
            ${recipe.tags && recipe.tags.length > 0 ? `<p><strong>Tags:</strong> ${recipe.tags.join(', ')}</p>` : ''}
        `;

    } catch (error) {
        console.error('Error fetching recipe:', error);
        container.innerHTML = '<p>Error loading recipe details.</p>';
    }
}

// Function to handle search bar and button events
function setupSearch() {
    const searchBtn = document.getElementById('search-btn');
    const searchBar = document.getElementById('search-bar');
    const featuredBtn = document.getElementById('featured-btn');

    if (searchBtn && searchBar && featuredBtn) {
        searchBtn.addEventListener('click', () => {
            fetchRecipes(searchBar.value);
        });

        searchBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                fetchRecipes(searchBar.value);
            }
        });

        featuredBtn.addEventListener('click', () => {
            searchBar.value = '';
            fetchRecipes('', true);
        });
    }
}

// Function to fetch and display recipes with an optional search term
async function fetchRecipes(searchTerm = '', isFeatured = false) {
    const recipesContainer = document.getElementById('recipes-container');
    const heading = document.getElementById('recipe-list-heading');
    if (!recipesContainer || !heading) return;

    recipesContainer.innerHTML = '';

    try {
        let url = '/api/recipes';
        if (searchTerm) {
            url += `?search=${encodeURIComponent(searchTerm)}`;
            heading.textContent = `Search Results for "${searchTerm}"`;
        } else if (isFeatured) {
            url += `?featured=true`;
            heading.textContent = 'Featured Recipes';
        } else {
            heading.textContent = 'All Available Recipes';
        }

        const response = await fetch('/api/recipes');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const recipes = await response.json();

        if (recipes.length === 0) {
            recipesContainer.innerHTML = '<p>No recipes found. Try a different search.</p>';
            return;
        }

        recipes.forEach(recipe => {
            console.log("Recipe ID:", recipe._id);
            const recipeCard = document.createElement('div');
            recipeCard.classList.add('recipe-card');
            recipeCard.innerHTML = `
                <h3>${recipe.name}</h3>
                ${recipe.imageURL ? `<img src="${recipe.imageURL}" alt="${recipe.name}">` : ''}
                <p><strong>Description:</strong> ${recipe.description}</p>
                <div class="card-buttons">
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;

            // Add an event listener to the card itself
            recipeCard.addEventListener('click', (event) => {
                // Prevent the click from triggering the edit/delete buttons
                if (!event.target.classList.contains('edit-btn') && !event.target.classList.contains('delete-btn')) {
                    window.location.href = `view.html?id=${recipe._id}`;
                }
            });
            
            const editBtn = recipeCard.querySelector('.edit-btn');
            editBtn.addEventListener('click', () => {
                editRecipe(recipe._id);
            });
            const deleteBtn = recipeCard.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                deleteRecipe(recipe._id);
            });

            recipesContainer.appendChild(recipeCard);
        });
    } catch (error) {
        console.error('Error fetching recipes:', error);
        recipesContainer.innerHTML = '<p>Error loading recipes. Please try again later.</p>';
    }
}

// Function to delete a recipe
async function deleteRecipe(recipeId) {
    if (confirm('Are you sure you want to delete this recipe?')) {
        try {
            const response = await fetch(`/api/recipes/${recipeId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchRecipes();
            } else {
                console.error('Failed to delete recipe.');
            }
        } catch (error) {
            console.error('Error deleting recipe:', error);
        }
    }
}

// =======================
// Add/Edit Page Functions
// =======================

// MODIFIED: Function to handle the dynamic form fields (for add.html and edit.html)
function addIngredientInput(container, name = '', quantity = '') {
    const newGroup = document.createElement('div');
    newGroup.classList.add('ingredient-input-group');
    newGroup.innerHTML = `
        <input type="text" name="ingredientName[]" placeholder="Ingredient Name" value="${name}">
        <input type="text" name="ingredientQuantity[]" placeholder="Quantity (e.g., 250g)" value="${quantity}">
        <button type="button" class="remove-btn" onclick="this.parentNode.remove()">-</button>
    `;
    container.appendChild(newGroup);
}

// MODIFIED: Function to handle the dynamic instruction fields
function addInstructionInput(container, instruction = '') {
    const newTextarea = document.createElement('textarea');
    newTextarea.name = 'instruction[]';
    newTextarea.placeholder = 'Enter instruction here';
    newTextarea.value = instruction;
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.classList.add('remove-btn');
    removeBtn.textContent = '-';
    removeBtn.onclick = () => newTextarea.remove();
    
    container.appendChild(newTextarea);
    container.appendChild(removeBtn);
}


// Function to set up the 'Add Recipe' page
function setupAddRecipePage() {
    const addRecipeForm = document.getElementById('add-recipe-form');
    if (!addRecipeForm) return;
    
    // Add default empty fields
    addIngredientInput(document.getElementById('ingredients-container'));
    addInstructionInput(document.getElementById('instructions-container'));

    addRecipeForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        
        const ingredientNames = formData.getAll('ingredientName[]');
        const ingredientQuantities = formData.getAll('ingredientQuantity[]');
        const ingredients = ingredientNames.map((name, index) => {
            return {
                name: name.trim(),
                quantity: ingredientQuantities[index].trim(),
            };
        }).filter(item => item.name); // Filter out empty entries

        const instructions = formData.getAll('instruction[]').map(item => item.trim()).filter(Boolean);
        const tags = formData.get('tags').split(',').map(tag => tag.trim()).filter(Boolean);

        formData.set('ingredients', JSON.stringify(ingredients));
        formData.set('instructions', JSON.stringify(instructions));
        formData.set('tags', JSON.stringify(tags));
        formData.set('isFeatured', document.getElementById('isFeatured').checked);
        
        try {
            const response = await fetch('/api/recipes', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Recipe added successfully!');
                window.location.href = 'index.html';
            } else {
                console.error('Failed to add recipe. Status:', response.status);
                alert('Failed to add recipe. Check the console for details.');
            }
        } catch (error) {
            console.error('Error adding recipe:', error);
            alert('An error occurred. Check the console for details.');
        }
    });

    setupDynamicButtons();
    setupSecondaryPageNav();
}


// MODIFIED: Function to set up the 'Edit Recipe' page
async function setupEditRecipePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');

    if (!recipeId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`/api/recipes/${recipeId}`);
        const recipe = await response.json();

        if (response.ok) {
            // Populate the main form fields
            document.getElementById('id').value = recipe._id;
            document.getElementById('name').value = recipe.name;
            document.getElementById('description').value = recipe.description;
            document.getElementById('prepTime').value = recipe.prepTime;
            document.getElementById('cookTime').value = recipe.cookTime;
            document.getElementById('servings').value = recipe.servings;
            document.getElementById('tags').value = recipe.tags.join(', ');
            document.getElementById('isFeatured').checked = recipe.isFeatured || false;

            // New code to display the current image
            const currentImage = document.getElementById('current-recipe-image');
            const currentImageContainer = document.getElementById('current-image-container');

            if (recipe.imageURL) {
                currentImage.src = recipe.imageURL;
                currentImageContainer.style.display = 'block'; // Show the container
            } else {
                currentImageContainer.style.display = 'none'; // Hide the container if no image
            }

            // Populate the image URL field
            const existingImageURLInput = document.getElementById('existingImageURL');
            if (existingImageURLInput) {
                existingImageURLInput.value = recipe.imageURL || '';
            }

            // Populate dynamic ingredient fields
            const ingredientsContainer = document.getElementById('ingredients-container');
            ingredientsContainer.innerHTML = ''; // Clear old fields
            recipe.ingredients.forEach(ingredient => {
                addIngredientInput(ingredientsContainer, ingredient.name, ingredient.quantity);
            });
            if (recipe.ingredients.length === 0) {
                addIngredientInput(ingredientsContainer);
            }

            // Populate dynamic instruction fields
            const instructionsContainer = document.getElementById('instructions-container');
            instructionsContainer.innerHTML = ''; // Clear old fields
            recipe.instructions.forEach(instruction => {
                addInstructionInput(instructionsContainer, instruction);
            });
            if (recipe.instructions.length === 0) {
                addInstructionInput(instructionsContainer);
            }

            // Set up event listeners after the form is populated
            setupDynamicButtons();
            setupEditFormSubmission();
            setupSecondaryPageNav();

        } else {
            console.error('Error fetching recipe:', recipe.message);
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Network error fetching recipe:', error);
        window.location.href = 'index.html';
    }
}


// =======================
// Helper Functions
// =======================

// MODIFIED: Function to redirect to the edit page with the recipe ID
function editRecipe(recipeId) {
    if (!recipeId) {
        console.error('Error: No recipe ID provided to editRecipe function.');
        return; 
    }
    const newUrl = `edit.html?id=${encodeURIComponent(recipeId)}`;
    console.log("Attempting to navigate to:", newUrl);
    window.location.href = `edit.html?id=${encodeURIComponent(recipeId)}`;
}

// Function to set up dynamic add/remove buttons
function setupDynamicButtons() {
    const addIngredientBtn = document.getElementById('add-ingredient-btn');
    const addInstructionBtn = document.getElementById('add-instruction-btn');

    if (addIngredientBtn) {
        addIngredientBtn.addEventListener('click', () => {
            addIngredientInput(document.getElementById('ingredients-container'));
        });
    }

    if (addInstructionBtn) {
        addInstructionBtn.addEventListener('click', () => {
            addInstructionInput(document.getElementById('instructions-container'));
        });
    }
}

// Function to set up form submission logic for editing
function setupEditFormSubmission() {
    const editRecipeForm = document.getElementById('edit-recipe-form');
    if (!editRecipeForm) return;

    editRecipeForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(event.target);
        const recipeId = formData.get('id');

        const ingredients = formData.getAll('ingredientName[]').map((name, index) => {
            if (name.trim()) {
                return { name: name.trim(), quantity: formData.getAll('ingredientQuantity[]')[index].trim() };
            }
        }).filter(Boolean);

        const instructions = formData.getAll('instruction[]').map(item => item.trim()).filter(Boolean);
        const tags = formData.get('tags').split(',').map(tag => tag.trim()).filter(Boolean);

        formData.set('ingredients', JSON.stringify(ingredients));
        formData.set('instructions', JSON.stringify(instructions));
        formData.set('tags', JSON.stringify(tags));
        formData.set('isFeatured', document.getElementById('isFeatured').checked);
        
        const recipeImageFile = document.getElementById('recipeImage').files[0];
        if (!recipeImageFile) {
            formData.delete('recipeImage');
        }

        try {
            const response = await fetch(`/api/recipes/${recipeId}`, {
                method: 'PUT',
                body: formData
            });

            if (response.ok) {
                alert('Recipe updated successfully!');
                window.location.href = 'index.html';
            } else {
                console.error('Failed to update recipe. Status:', response.status);
                alert('Failed to update recipe. Check the console for details.');
            }
        } catch (error) {
            console.error('Error updating recipe:', error);
            alert('An error occurred. Check the console for details.');
        }
    });
}

// Function to set up navigation buttons on the main page
function setupMainPageNav() {
    const addRecipeBtn = document.getElementById('add-recipe-btn');
    if (addRecipeBtn) {
        addRecipeBtn.addEventListener('click', () => {
            window.location.href = 'add.html';
        });
    }
}

// Function to set up navigation buttons on the add/edit pages
function setupSecondaryPageNav() {
    const viewRecipesBtn = document.getElementById('view-recipes-btn');
    if (viewRecipesBtn) {
        viewRecipesBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
}

// Call the appropriate function based on the current page
document.addEventListener('DOMContentLoaded', () => {
    const bodyId = document.body.id;

    if (bodyId === 'add-page') {
        setupAddRecipePage();
        setupSecondaryPageNav();
    } else if (bodyId === 'edit-page') {
        setupEditRecipePage();
    } else if (bodyId === 'view-page') {
        setupViewRecipePage();
        setupSecondaryPageNav();
    } else if (bodyId === 'index-page') {
        setupSearch(); 
        fetchRecipes();
        setupMainPageNav();
    }
});