const {
  fetchUser,
  addRefreshToken,
  getUserByOperatorId,
  getRefeshToken,
  deleteRefreshToken,
} = require("../models/user");
const jwt = require("jsonwebtoken");
const promisify = require("util").promisify;
const randToken = require("rand-token");
const bcrypt = require("bcrypt");
const request = require("request");
const verifyToken = require("../middleWares/verifyToken");
const { formatYMDHIS, getToday } = require("../utils/common");
require("dotenv").config();

const sign = promisify(jwt.sign).bind(jwt);
const verify = promisify(jwt.verify).bind(jwt);
const secretKey = process.env.ACCESS_TOKEN_SECRET;
const timeLiveToken = process.env.ACCESS_TOKEN_LIFE;
const captchaKey = process.env.RECAPTCHA_SECRET_KEY;

const encryptPassword = (password) => {
  const saltRounds = 10;
  bcrypt.hash(password, saltRounds, function (err, hash) {
    // Store hash in your password DB.
    return hash;
  });
};
const decryptPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateToken = async (payload, secretSignature, tokenLife) => {
  try {
    return await sign(
      {
        payload,
      },
      secretSignature,
      {
        algorithm: "HS256",
        expiresIn: tokenLife,
      }
    );
  } catch (error) {
    console.log(`Error in generate access token:  + ${error}`);
    return null;
  }
};

// const verifyToken = async (token, secretKey) => {
// 	try {
// 		return await verify(token, secretKey);
// 	} catch (error) {
// 		console.log(`Error in verify access token:  + ${error}`);
// 		return null;
// 	}
// };

const requestPromise = promisify(request);
const handleCaptcha = async (captcha) => {
  const verificationURL =
    "https://www.google.com/recaptcha/api/siteverify?secret=" +
    captchaKey +
    "&response=" +
    captcha +
    "&remoteip=127.0.0.1";
  const result = await requestPromise(verificationURL);
  return {
    body: result.body ? JSON.parse(result.body) : {},
    response: result.response,
    error: result.error,
  };
};

const handleParamPost = (req) => {
  return req.body;
};

const login = async (req, res) => {
  const { operatorid, password, captcha } = handleParamPost(req);

  //Check exists operatorid, password
  if (!operatorid || !password)
    return res.status(401).send("Chưa nhập Tên đăng nhập hoặc Mật khẩu.");

  //Google ReCaptcha Check
  if (!captcha) return res.status(401).send("Robot detected.");
  const resultCaptcha = await handleCaptcha(captcha);
  if (resultCaptcha.body.success !== undefined && !resultCaptcha.body.success)
    return res.status(401).send("Robot detected.");

  //Check exits User
  const userInf = await getUserByOperatorId(operatorid);
  if (!userInf) {
    return res.status(401).send("Tên đăng nhập không tồn tại.");
  }

  const db = userInf[0].tvcdb;
  const user = userInf[0].operatorid;
  const userPassword = userInf[0].password;
  const roleid = userInf[0].roleid;

  const isPasswordValid = await decryptPassword(password, userPassword);
  if (!isPasswordValid) {
    return res.status(401).send("Mật khẩu không chính xác.");
  }

  const dataForAccessToken = {
    username: user,
    db,
  };

  const accessToken = await generateToken(
    dataForAccessToken,
    secretKey,
    timeLiveToken
  );

  if (!accessToken) {
    return res
      .status(401)
      .send("Đăng nhập không thành công, vui lòng thử lại.");
  }

  const toDay = new Date();
  toDay.setDate(toDay.getDate() + 1);
  toDay.setMinutes(0);
  toDay.setSeconds(0);

  const oldTokens = await getRefeshToken(user, "ERP");
  const refreshToken = randToken.generate(55);
  const ipAddresses = req.header("x-forwarded-for") || req.socket.remoteAddress;

  if (oldTokens.length > 0) {
    console.log(">>>deleted", oldTokens[0].token);
    deleteRefreshToken(oldTokens[0].token);
    addRefreshToken({
      tvcdb: db,
      operatorid: user,
      appid: "ERP",
      token: refreshToken,
      expires: formatYMDHIS(toDay),
      createdbyip: ipAddresses,
      created: getToday(),
    });
  } else {
    addRefreshToken({
      tvcdb: db,
      operatorid: user,
      appid: "ERP",
      token: refreshToken,
      expires: formatYMDHIS(toDay),
      createdbyip: ipAddresses,
      created: getToday(),
    });
  }
  global.userState = {
    DB: db,
    USER: user,
  };

  return res.json({
    result: {
      data: {
        operatorid: user,
        roleid: "",
        accessToken,
        refreshToken,
      },
    },
  });
};

const refreshToken = async (req, res) => {
  const jwtToken = req.headers.x_authorization;
  if (!jwtToken) return res.sendStatus(401);

  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  let verifyInfo = null;
  try {
    verifyInfo = await verify(jwtToken, secretKey, {
      ignoreExpiration: true,
    });
  } catch (error) {
    // resultVerify = error;
  }

  if (!verifyInfo) return res.sendStatus(401);

  const username = verifyInfo.payload.username;
  const db = verifyInfo.payload.db;

  const oldTokens = await getRefeshToken(username, "ERP");

  if (!oldTokens || oldTokens.length === 0) return res.sendStatus(401);

  if (refreshToken !== oldTokens[0].token) return res.sendStatus(401);

  const accessToken = await generateToken(
    {
      username,
      db,
    },
    secretKey,
    timeLiveToken
  );

  global.userState = {
    DB: db,
    USER: username,
  };

  return res.json({
    message: "Refesh token successfull.",
    accessToken,
    refreshToken,
  });
};

module.exports = {
  login,
  refreshToken,
};
