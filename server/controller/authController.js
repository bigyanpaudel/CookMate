const user = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const tokenKey = "ai-based-food-recommendation-system";
const generateToken = (user) => {
  return jwt.sign({ id: user.id }, tokenKey, { expiresIn: "500h" });
};

const signup = async (req, res, next) => {
  const body = req.body;

  const newUser = await user.create({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    password: await bcrypt.hash(body.password, 10),
    height: body.height,
    weight: body.weight,
    age: body.age,
    gender: body.gender,
  });

  const result = newUser.toJSON();
  result.token = generateToken({
    id: result.id,
  });

  if (!newUser) {
    return res.status(400).json({
      status: "fail",
      message: "User not created",
    });
  }

  return res.status(201).json({
    status: "success",
    message: "User created successfully",
    data: result,
  });
};
const login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: "fail",
      message: "Email and password are required!",
    });
  }

  const loginResult = await user.findOne({ where: { email } });
  if (!loginResult) {
    return res.status(401).json({
      status: "fail",
      message: "Incorrect email or password",
    });
  }

  const passwordMatch = await bcrypt.compare(password, loginResult.password);
  if (!passwordMatch) {
    return res.status(401).json({
      status: "fail",
      message: "Incorrect email or password",
    });
  }

  const token = generateToken({
    id: loginResult.id,
  });

  return res.status(200).json({
    status: "success",
    message: "User logged in successfully",
    token,
  });
};

const getUserId = (token) => {
  try {
    const decoded = jwt.verify(token, tokenKey);
    return decoded.id;
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};

const tokenToId = async (req, res) => {
  try {
    if (
      !req.headers.authorization ||
      !req.headers.authorization.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authorization header is missing or invalid",
      });
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, tokenKey);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid or missing user ID",
      });
    }

    const userId = decoded.id;
    return res.status(200).json({
      success: true,
      userId,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

const signout = (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production",
    sameSite: "None",
  });

  return res.status(200).json({ message: "Signed out successfully" });
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.id;

    const user = await user.destroy({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { signup, login, getUserId, tokenToId, signout,deleteAccount };
