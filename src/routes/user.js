const express = require('express');
const router = express.Router();
const { login, refreshToken, getList } = require('../controllers/auth/auth');
const verifyToken = require('../middleWares/verifyToken');
const bodyParser = require('body-parser');

const jsonParser = bodyParser.json();

router.post('/login', jsonParser, async (req, res) => {
    login(req, res);
});

router.get('/', verifyToken, getList)

router.post('/refresh', jsonParser, refreshToken);

module.exports = router;