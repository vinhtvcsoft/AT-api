const express = require("express");
const router = express.Router();
const {
  login,
  refreshToken,
  getList,
} = require("../controllers/authController");
const verifyToken = require("../middleWares/verifyToken");
const bodyParser = require("body-parser");

const jsonParser = bodyParser.json();

//AuthController
router.post("/login", jsonParser, async (req, res) => {
  login(req, res);
});
router.post("/refresh", jsonParser, refreshToken);

//User Controller
router.get("/", verifyToken, getList);

module.exports = router;
