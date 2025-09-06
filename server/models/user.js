("use strict");
const sequelize = require("../config/database");
const { Model, DataTypes } = require("sequelize");
class User extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    User.hasMany(models.Rating, { foreignKey: "UserId" });
    User.hasMany(models.FavoriteRecipe, { foreignKey: "UserId" });
  }
}
User.init(
  {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    height: DataTypes.FLOAT,
    weight: DataTypes.FLOAT,
    age: DataTypes.INTEGER,
    gender: DataTypes.STRING,
  },
  {
    sequelize,
    modelName: "User",
    timestamps: false,
  }
);
module.exports = User;
