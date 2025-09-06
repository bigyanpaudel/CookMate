const { addRating } = require("../controller/ratingController");
const favoriteRecipe = require("../models/FavoriteRecipe");
const Rating = require("../models/Rating");

jest.mock("../models/FavoriteRecipe");
jest.mock("../models/Rating");

describe("addRating", () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {
        userId: 1,
      },
      body: {
        recipeId: 1,
        rating: 5,
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
  });

  it("should return 404 if recipe is not in the user's favorite list", async () => {
    favoriteRecipe.findOne.mockResolvedValue(null);

    await addRating(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({
      message: "Recipe is not in the user's favorite list.",
    });
  });

  it("should return 400 if user has already rated the recipe", async () => {
    favoriteRecipe.findOne.mockResolvedValue(true);
    Rating.findOne.mockResolvedValue(true);

    await addRating(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toHaveBeenCalledWith({
      message: "User has already rated this recipe.",
    });
  });

  it("should add a rating successfully", async () => {
    favoriteRecipe.findOne.mockResolvedValue(true);
    Rating.findOne.mockResolvedValue(null);
    Rating.create.mockResolvedValue({ UserId: 1, RecipeId: 1, Rating: 5 });

    await addRating(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.send).toHaveBeenCalledWith({
      message: "Rating added successfully!",
      ratingFood: { UserId: 1, RecipeId: 1, Rating: 5 },
    });
  });
});
