"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "FavoriteRecipes",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        UserId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Users",
            key: "id"
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE"
        },
        RecipeId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Recipes",
            key: "id"
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE"
        }
      },
      {
        timestamps: false // createdAt ve updatedAt sütunlarını kullanmak istemediğiniz için bu ayarı ekliyoruz
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("FavoriteRecipes");
  }
};
