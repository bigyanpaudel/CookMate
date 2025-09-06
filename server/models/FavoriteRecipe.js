const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

class FavoriteRecipe extends Model {
  static associate(models) {
    FavoriteRecipe.belongsTo(models.User, { foreignKey: "user_id" });
    FavoriteRecipe.belongsTo(models.Recipe, { foreignKey: "recipe_id" });
  }
}

FavoriteRecipe.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    recipe_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "FavoriteRecipe",
    tableName: "favorite_recipes",
    timestamps: false,
    underscored: true,
  }
);

module.exports = FavoriteRecipe;
