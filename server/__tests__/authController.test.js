const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");
const authController = require("../controller/authController");
const { Sequelize } = require("sequelize");
const User = require("../models/user");

jest.mock("../models/user");

const app = express();
app.use(bodyParser.json());

app.post("/signup", authController.signup);
app.post("/login", authController.login);

describe("Auth Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /signup", () => {
    it("should create a new user and return a token", async () => {
      User.create.mockResolvedValue({
        id: 1,
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "hashedpassword",
        height: 180,
        weight: 75,
        age: 25,
        gender: "male",
        toJSON: function () {
          return { id: this.id, email: this.email };
        },
      });

      const response = await request(app).post("/signup").send({
        firstName: "John",
        lastName: "Doe",
        email: "johndoe@example.com",
        password: "password123",
        height: 180,
        weight: 75,
        age: 25,
        gender: "male",
      });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data.token).toBeDefined();
    });
  });

  describe("POST /login", () => {
    it("should log in a user and return a token", async () => {
      User.findOne.mockResolvedValue({
        id: 1,
        email: "johndoe@example.com",
        password: await require("bcrypt").hash("password123", 10),
      });

      const response = await request(app).post("/login").send({
        email: "johndoe@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.token).toBeDefined();
    });

    it("should return 401 for invalid credentials", async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app).post("/login").send({
        email: "invalid@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe("fail");
      expect(response.body.message).toBe("Incorrect email or password");
    });
  });
});
