const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("cookmate", "cookmate_user", "cookmate_pass", {
  host: "localhost",
  port: 5432,
  dialect: "postgres",
  logging: false
});

module.exports = sequelize;
