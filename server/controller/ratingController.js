const favoriteRecipe = require("../models/FavoriteRecipe");
const Rating = require("../models/Rating");
const recipe = require("../models/recipe");

const addRating = async (req, res) => {
  try {
    const {userId} = req.params;
    const { recipeId, rating } = req.body;
    const existingUserFavoriteList = await favoriteRecipe.findOne({
      where: {
        UserId: userId,
        RecipeId: recipeId,
      },
    });

    if (!existingUserFavoriteList) {
      return res.status(404).send({
        message: "Recipe is not in the user's favorite list.",
      });
    }

    const existingRating = await Rating.findOne({
      where: {
        UserId: userId,
        RecipeId: recipeId,
      },
    });

    if (existingRating) {
      return res.status(400).send({
        message: "User has already rated this recipe.",
      });
    }

    const ratingFood = await Rating.create({
      UserId: userId,
      RecipeId: recipeId,
      Rating: rating,
    });

    return res.status(201).send({
      message: "Rating added successfully!",
      ratingFood,
    });
  } catch (error) {
    return res.status(500).send({
      message: `${error}`,
      error: error.message,
    });
  }
};

const getRating = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const ratings = await Rating.findAll({
      where: {
        UserId: userId,
      },
      attributes: ["RecipeId", "Rating"],
    });

    if (ratings.length === 0) {
      return res.status(200).json([]);
    }

    const recipeIds = ratings.map((rating) => rating.RecipeId);

    // Fetch the recipes based on RecipeIds
    const recipes = await recipe.findAll({
      where: {
        id: recipeIds,
      },
      attributes: [
        "id",
        "name",
        "ingredients",
        "instructions",
        "cookTime",
        "imageUrl",
        "calories",
        "avgRate",
      ],
    });

    const recipesWithRating = recipes.map((recipe) => {
      const rating = ratings.find((r) => r.RecipeId === recipe.id);
      return {
        ...recipe.toJSON(),
        userRating: rating ? rating.Rating : null,
      };
    });

    return res.status(200).json(recipesWithRating);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch ratings and recipes.",
      error: error.message,
    });
  }
};

module.exports = {
  addRating,
  getRating,
};
