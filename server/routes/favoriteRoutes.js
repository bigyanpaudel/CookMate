const express = require("express");
const router = express.Router();
const { addFavorite, removeFavorite } = require("../controller/favoriteController");
const { getFavorites } = require("../controller/favoriteController");
const { getFavoriteDetails } = require("../controller/favoriteController");

router.post("/addFavorite", addFavorite);
router.get("/getFavorites/:userId", getFavorites);
router.get("/getFavoriteDetails/:userId", getFavoriteDetails);
router.delete("/removeFavorite/:userId/:recipeId", removeFavorite);

module.exports = router;
