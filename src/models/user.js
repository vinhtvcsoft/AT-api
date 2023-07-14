const { execQuery, SqlCommand } = require('../config/database');
const {getToday} = require('../utils/common');

const addRefreshToken = async (data) => {
    let sqlFields = ' INSERT INTO csrefreshtoken (tvcdb,token,';
    let sqlValues = ' VALUES(@tvcdb,@token,';

    if(data.operatorid) { sqlFields += 'operatorid,'; sqlValues += '@operatorid,'; }
    if(data.appid) { sqlFields += 'appid,'; sqlValues += '@appid,'; }
    if(data.expires) { sqlFields += 'expires,'; sqlValues += '@expires,'; }
    if(data.created) { sqlFields += 'created,'; sqlValues += '@created,'; }
    if(data.createdbyip) { sqlFields += 'createdbyip,'; sqlValues += '@createdbyip,'; }
    if(data.revoked) { sqlFields += 'revoked,'; sqlValues += '@revoked,'; }
    if(data.revokedbyip) { sqlFields += 'revokedbyip,'; sqlValues += '@revokedbyip,'; }
    if(data.replacedbytoken) { sqlFields += 'replacedbytoken,'; sqlValues += '@replacedbytoken,'; }
    if(data.reasonrevoked) { sqlFields += 'reasonrevoked,'; sqlValues += '@reasonrevoked,'; }

    sqlFields = sqlFields.slice(0, sqlFields.length - 1) + ")";
    sqlValues = sqlValues.slice(0, sqlValues.length - 1) + ")";

    let sql = sqlFields + sqlValues;

    const sqlCmd = new SqlCommand(sql);

    sqlCmd.addParameter('@tvcdb', data.tvcdb);
    sqlCmd.addParameter('@token', data.token);
    
    if (data.operatorid != null) sqlCmd.addParameter('@operatorid', data.operatorid);
    if (data.appid != null) sqlCmd.addParameter('@appid', data.appid);
    if (data.expires != null) sqlCmd.addParameter('@expires', data.expires);
    if (data.created != null) sqlCmd.addParameter('@created', data.created);
    if (data.createdbyip != null) sqlCmd.addParameter('@createdbyip', data.createdbyip);
    if (data.revoked != null) sqlCmd.addParameter('@revoked', data.revoked);
    if (data.revokedbyip != null) sqlCmd.addParameter('@revokedbyip', data.revokedbyip);
    if (data.replacedbytoken != null) sqlCmd.addParameter('@replacedbytoken', data.replacedbytoken);
    if (data.reasonrevoked != null) sqlCmd.addParameter('@reasonrevoked', data.reasonrevoked);
    
    return await execQuery(sqlCmd.queryStr);
};

const deleteRefreshToken = async (token) => {
    let sql = 'DELETE csrefreshtoken WHERE token = @token'
    
    const sqlCmd = new SqlCommand(sql);

    sqlCmd.addParameter('@token', token);

    return await execQuery(sqlCmd.queryStr);
}

const getUserByOperatorId = async (db, operatorid) => {
    const queryStr = 'SELECT * FROM csoperator WHERE tvcdb = @tvcdb AND operatorid = @operatorid';

    const sqlCommand = new SqlCommand(queryStr);

    sqlCommand.addParameter('@tvcdb',db)
    sqlCommand.addParameter('@operatorid',operatorid)
        
    return await execQuery(sqlCommand.queryStr);
}

const fetchUser = async (db) => {
    const queryStr = 'SELECT * FROM csoperator WHERE tvcdb = @tvcdb ';

    const sqlCommand = new SqlCommand(queryStr);
    sqlCommand.addParameter('@tvcdb',db);
        
    return await execQuery(sqlCommand.queryStr);
}

const getRefeshToken = async (operatorid, appid) => {
    const toDay = getToday();
    const queryStr = `SELECT TOP 1 * FROM csrefreshtoken 
        WHERE operatorid = @operatorid AND appid = @appid AND expires > @toDay `;

    const sqlCommand = new SqlCommand(queryStr);
    sqlCommand.addParameter('@operatorid',operatorid);
    sqlCommand.addParameter('@appid',appid);
    sqlCommand.addParameter('@toDay',toDay);
    return await execQuery(sqlCommand.queryStr);
}

module.exports = {
    fetchUser,
    getUserByOperatorId,
    addRefreshToken,
    deleteRefreshToken,
    getRefeshToken,
}