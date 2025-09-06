await queryInterface.createTable("favorite_recipes", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  recipe_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: "recipes",   // ✅ must match your table
      key: "recipe_id",   // ✅ must match PK column
    },
    onDelete: "CASCADE",
  },
});
