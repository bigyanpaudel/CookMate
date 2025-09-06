const express = require("express");
const router = express.Router();
const { addRating, getRating } = require("../controller/ratingController");

router.post("/addRating/:userId", addRating);
router.get("/getRating/:userId", getRating);

module.exports = router;