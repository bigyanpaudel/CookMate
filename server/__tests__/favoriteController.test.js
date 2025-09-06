const favoriteController = require('../controller/favoriteController');
const favoriteRecipe = require('../models/FavoriteRecipe');
const recipe = require('../models/recipe');

jest.mock('../models/FavoriteRecipe', () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  findAll: jest.fn(),
  destroy: jest.fn(),
}));

jest.mock('../models/recipe', () => ({
  findAll: jest.fn(),
}));

describe('Favorite Controller', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addFavorite', () => {
    it('should add a recipe to favorites if not already added', async () => {
      favoriteRecipe.findOne.mockResolvedValue(null); // No existing favorite
      favoriteRecipe.create.mockResolvedValue({ UserId: 1, RecipeId: 2 });

      const req = { body: { userId: 1, recipeId: 2 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await favoriteController.addFavorite(req, res);

      expect(favoriteRecipe.findOne).toHaveBeenCalledWith({
        where: { UserId: 1, RecipeId: 2 },
      });
      expect(favoriteRecipe.create).toHaveBeenCalledWith({
        UserId: 1,
        RecipeId: 2,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Recipe added to favorites successfully!',
        favoriteFood: { UserId: 1, RecipeId: 2 },
      });
    });

    it('should return 400 if the recipe is already in favorites', async () => {
      favoriteRecipe.findOne.mockResolvedValue({ UserId: 1, RecipeId: 2 });

      const req = { body: { userId: 1, recipeId: 2 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await favoriteController.addFavorite(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'This recipe is already in the favorites.',
      });
    });
  });

  describe('getFavorites', () => {
    it('should retrieve all favorite recipes for a user', async () => {
      favoriteRecipe.findAll.mockResolvedValue([
        { RecipeId: 1 },
        { RecipeId: 2 },
      ]);

      const req = { params: { userId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await favoriteController.getFavorites(req, res);

      expect(favoriteRecipe.findAll).toHaveBeenCalledWith({
        where: { UserId: 1 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Favorite recipes retrieved successfully.',
        favorites: [{ RecipeId: 1 }, { RecipeId: 2 }],
      });
    });

    it('should return 404 if no favorites are found', async () => {
      favoriteRecipe.findAll.mockResolvedValue([]);

      const req = { params: { userId: 1 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await favoriteController.getFavorites(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: 'No favorite recipes found for this user.',
      });
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite recipe if it exists', async () => {
      favoriteRecipe.findOne.mockResolvedValue({ UserId: 1, RecipeId: 2 });
      favoriteRecipe.destroy.mockResolvedValue(1);

      const req = { params: { userId: 1, recipeId: 2 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await favoriteController.removeFavorite(req, res);

      expect(favoriteRecipe.findOne).toHaveBeenCalledWith({
        where: { UserId: 1, RecipeId: 2 },
      });
      expect(favoriteRecipe.destroy).toHaveBeenCalledWith({
        where: { UserId: 1, RecipeId: 2 },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Recipe removed from favorites successfully!',
      });
    });

    it('should return 404 if the favorite recipe does not exist', async () => {
      favoriteRecipe.findOne.mockResolvedValue(null);

      const req = { params: { userId: 1, recipeId: 2 } };
      const res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };

      await favoriteController.removeFavorite(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: "The recipe is not in the user's favorites.",
      });
    });
  });
});
