const fs = require('fs');
const path = require('path');

// Simple file-based storage for favorites (replace your current favoriteController.js with this)
const FAVORITES_FILE = path.join(__dirname, '../data/favorites.json');

// Ensure data directory exists
const dataDir = path.dirname(FAVORITES_FILE);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize favorites file if it doesn't exist
if (!fs.existsSync(FAVORITES_FILE)) {
  fs.writeFileSync(FAVORITES_FILE, JSON.stringify({}));
}

// Helper functions
const loadFavorites = () => {
  try {
    const data = fs.readFileSync(FAVORITES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
};

const saveFavorites = (favorites) => {
  fs.writeFileSync(FAVORITES_FILE, JSON.stringify(favorites, null, 2));
};

// ✅ Add a recipe to favorites (NO DATABASE REQUIRED)
const addFavorite = async (req, res) => {
  try {
    const { userId, recipeId } = req.body;

    const favorites = loadFavorites();
    
    // Initialize user favorites if doesn't exist
    if (!favorites[userId]) {
      favorites[userId] = [];
    }

    // Check if already in favorites
    const existingFavorite = favorites[userId].find(fav => fav.recipe_id === recipeId);
    
    if (existingFavorite) {
      return res.status(400).send({
        message: "This recipe is already in the favorites.",
      });
    }

    // Create new favorite entry
    const favoriteFood = {
      id: Date.now(), // Simple ID generation
      user_id: userId,
      recipe_id: recipeId,
      dateAdded: new Date().toISOString()
    };

    favorites[userId].push(favoriteFood);
    saveFavorites(favorites);

    return res.status(201).send({
      message: "Recipe added to favorites successfully!",
      favoriteFood,
    });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return res.status(500).send({
      message: "An error occurred while adding to favorites.",
      error: error.message,
    });
  }
};

// ✅ Get all favorites for a user
const getFavorites = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).send({ message: "userId is required." });
  }

  try {
    const favorites = loadFavorites();
    const userFavorites = favorites[userId] || [];

    if (userFavorites.length === 0) {
      return res.status(404).send({
        message: "No favorite recipes found for this user.",
      });
    }

    return res.status(200).send({
      message: "Favorite recipes retrieved successfully.",
      favorites: userFavorites,
    });
  } catch (error) {
    console.error("Error retrieving favorites:", error.message);
    return res.status(500).send({
      message: "An error occurred while retrieving favorite recipes.",
      error: error.message,
    });
  }
};

// ✅ Get details of favorite recipes for a user (mock recipe data)
const getFavoriteDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const favorites = loadFavorites();
    const userFavorites = favorites[userId] || [];

    if (userFavorites.length === 0) {
      return res.status(200).json([]);
    }

    // Mock recipe details (since we're not using database)
    const recipes = userFavorites.map(fav => ({
      recipe_id: fav.recipe_id,
      name: `Recipe ${fav.recipe_id}`,
      ingredients: `Sample ingredients for recipe ${fav.recipe_id}`,
      instructions: `Sample instructions for recipe ${fav.recipe_id}`,
      cooktime: "20 mins",
      images: `recipe${fav.recipe_id}.jpg`,
      calories: 300 + (fav.recipe_id % 200),
      aggregatedrating: 4.0 + (fav.recipe_id % 10) / 10
    }));

    return res.status(200).json(recipes);
  } catch (error) {
    console.error("Error fetching favorite details:", error);
    return res.status(500).json({
      message: "Failed to fetch favorite details.",
      error: error.message,
    });
  }
};

// ✅ Remove a recipe from favorites
const removeFavorite = async (req, res) => {
  try {
    const { userId, recipeId } = req.params;

    const favorites = loadFavorites();
    
    if (!favorites[userId]) {
      return res.status(404).send({
        message: "The recipe is not in the user's favorites.",
      });
    }

    const initialLength = favorites[userId].length;
    favorites[userId] = favorites[userId].filter(fav => fav.recipe_id != recipeId);

    if (favorites[userId].length === initialLength) {
      return res.status(404).send({
        message: "The recipe is not in the user's favorites.",
      });
    }

    saveFavorites(favorites);

    return res.status(200).send({
      message: "Recipe removed from favorites successfully!",
    });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return res.status(500).send({
      message: "An error occurred while removing the recipe from favorites.",
      error: error.message,
    });
  }
};

module.exports = {
  addFavorite,
  getFavorites,
  getFavoriteDetails,
  removeFavorite,
};