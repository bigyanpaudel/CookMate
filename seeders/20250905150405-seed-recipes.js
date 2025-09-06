"use strict";
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

module.exports = {
  async up(queryInterface, Sequelize) {
    const rows = [];
    const csvPath = path.join(__dirname, "../AI/utils/updatedRecipe.csv"); // adjust if needed

    return new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on("data", (row) => {
          rows.push({
            recipe_id: parseInt(row.RecipeId, 10),
            name: row.Name,
            ingredients: row.RecipeIngredientParts,
            instructions: row.RecipeInstructions || row.Description,
            totaltime: row.TotalTime,
            cooktime: row.CookTime,
            calories: row.Calories ? parseFloat(row.Calories) : null,
            images: row.Images,
          });
        })
        .on("end", async () => {
          if (rows.length) {
            await queryInterface.bulkInsert("recipes", rows, {});
          }
          resolve();
        })
        .on("error", reject);
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("recipes", null, {});
  },
};
