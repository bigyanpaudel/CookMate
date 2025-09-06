"use strict";
const sequelize = require("../config/database");
const { Model, DataTypes } = require("sequelize");

class Recipe extends Model {
  static associate(models) {
    Recipe.hasMany(models.Rating, { foreignKey: "recipe_id" }); // still fine
  }
}

Recipe.init(
  {
    recipe_id: {                // ✅ must match DB PK
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: "recipe_id",
    },
    name: DataTypes.TEXT,
    ingredients: DataTypes.TEXT,
    instructions: DataTypes.TEXT,
    totaltime: DataTypes.TEXT,
    cooktime: DataTypes.TEXT,
    calories: DataTypes.DOUBLE,
    images: DataTypes.TEXT,
  },
  {
    sequelize,
    modelName: "Recipe",
    tableName: "recipes",   // ✅ matches DB table
    timestamps: false,
  }
);

module.exports = Recipe;
