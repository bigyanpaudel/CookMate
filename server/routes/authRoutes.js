const { signup } = require("../controller/authController");
const { login } = require("../controller/authController");
const { getUserId } = require("../controller/authController");
const { tokenToId } = require("../controller/authController");
const { signout } = require("../controller/authController");
const { deleteAccount } = require("../controller/authController");
const router = require("express").Router();

router.post("/signup", signup);

router.post("/login", login);
router.get("/getUserId", getUserId);
router.get("/tokenToId", tokenToId);
router.post("/signout", signout);
router.delete("/deleteAccount", deleteAccount);

module.exports = router;
