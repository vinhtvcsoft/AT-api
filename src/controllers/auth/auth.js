const { 
	fetchUser, 
	addRefreshToken, 
	getUserByOperatorId, 
	getRefeshToken, 
	deleteRefreshToken 
} = require('../../models/user')
const jwt = require('jsonwebtoken');
const promisify = require('util').promisify;
const randToken = require('rand-token');
const bcrypt = require('bcrypt');
const verifyToken = require('../../middleWares/verifyToken');
const {formatYMDHIS, getToday} = require('../../utils/common');
require('dotenv').config();

const sign = promisify(jwt.sign).bind(jwt);
const verify = promisify(jwt.verify).bind(jwt);
const secretKey = process.env.ACCESS_TOKEN_SECRET;
const timeLiveToken = process.env.ACCESS_TOKEN_LIFE;


const encryptPassword = (password) => {
	const saltRounds = 10;
	bcrypt.hash(password, saltRounds, function(err, hash) {
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
				algorithm: 'HS256',
				expiresIn: tokenLife, 
			},
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

const handleParamPost = (req) => {
	return req.body;
}

const login = async (req,res) => {
    const {operatorid,password} = handleParamPost(req);

	if(!operatorid || !password) return res.status(401).send('Chưa nhập Tên đăng nhập hoặc Mật khẩu.');

    const user = await getUserByOperatorId('AT', operatorid);

	if (!user) {
		return res.status(401).send('Tên đăng nhập không tồn tại.');
	} 
	
    const isPasswordValid = await decryptPassword(password,user[0].password);
	if (!isPasswordValid) {
		return res.status(401).send('Mật khẩu không chính xác.');
	}

    const dataForAccessToken = {
        username: operatorid,
	};

    const accessToken = await generateToken(
		dataForAccessToken,
		secretKey,
		timeLiveToken,
	);

    if (!accessToken) {
		return res
			.status(401)
			.send('Đăng nhập không thành công, vui lòng thử lại.');
	}

    const toDay = new Date();
	toDay.setDate(toDay.getDate() + 1);
	toDay.setMinutes(0);
	toDay.setSeconds(0);
	
	const oldTokens = await getRefeshToken(operatorid,'ERP');
	const refreshToken = randToken.generate(55);
	const ipAddresses = req.header('x-forwarded-for') || req.socket.remoteAddress;

	if(oldTokens.length > 0){
		console.log('>>>deleted',oldTokens[0].token)
		deleteRefreshToken(oldTokens[0].token);
		addRefreshToken({
			tvcdb: 'AT',
			operatorid: operatorid,
			appid: 'ERP',
			token: refreshToken,
			expires: formatYMDHIS(toDay),
			createdbyip: ipAddresses,
			created: getToday(),
		}) 
	}
	else {
		addRefreshToken({
			tvcdb: 'AT',
			operatorid: operatorid,
			appid: 'ERP',
			token: refreshToken,
			expires: formatYMDHIS(toDay),
			createdbyip: ipAddresses,
			created: getToday(),
		}) 
	}
	
    return res.json({
		msg: 'Đăng nhập thành công.',
		accessToken,
		refreshToken,
	});
}

const getList = async (req,res) => {
    // const result = await verifyToken(req.jwtToken,process.env.ACCESS_TOKEN_SECRET);
	const list = await fetchUser('AT');
	
	res.send(list);
	// return res.json(list);
}

const refreshToken = async (req,res) => { 
	const jwtToken = req.headers.x_authorization;
	if (!jwtToken) return res.sendStatus(401);
	
	const refreshToken = req.body.refreshToken;
	if (!refreshToken) return res.sendStatus(401);

	let verifyInfo = null;
	try {
		verifyInfo = await verify(jwtToken, secretKey,{
			ignoreExpiration: true
		});
	} 
	catch (error) {
		// resultVerify = error; 
	}

	if(!verifyInfo) return res.sendStatus(401);

	const operatorid = verifyInfo.payload.username;

	const oldTokens = await getRefeshToken(operatorid, 'ERP');

	if(!oldTokens || oldTokens.length === 0) return res.sendStatus(401);

	if(refreshToken !== oldTokens[0].token) return res.sendStatus(401);

	const accessToken = await generateToken(
		{
			username: operatorid
		},
		secretKey,
		timeLiveToken,
	);

	return res.json({
		msg: 'Refesh token successfull.',
		accessToken,
		refreshToken,
	});
}

module.exports = {
    login,
	getList,
	refreshToken,
}