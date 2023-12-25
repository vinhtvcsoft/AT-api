const { error } = require("console");
const jwt = require("jsonwebtoken");
const promisify = require("util").promisify;
const verify = promisify(jwt.verify).bind(jwt);
require("dotenv").config();

const secretKey = process.env.ACCESS_TOKEN_SECRET;

module.exports = async (req, res, next) => {
  const bearerHeader = req.headers["authorization"];

  if (typeof bearerHeader !== "undefined") {
    const bearer = bearerHeader.split(" ");
    const bearerToken = bearer[1];

    req.jwtToken = bearerToken;
    let result;
    let anyError = false;

    try {
      result = await verify(bearerToken, secretKey);
    } catch (error) {
      anyError = true;
      console.log(">>>tokenError", error);
    }

    if (!anyError) {
      req.authData = result;

      if (!userState) {
        console.log(">>>userState", req.authData);
        global.userState = {
          DB: req.authData.payload.db,
          USER: req.authData.payload.username,
        };
      }

      next();
    } else {
      res.sendStatus(401);
    }
  } else {
    res.sendStatus(401);
  }
};
