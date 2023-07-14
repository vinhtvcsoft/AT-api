const { connect } = require('../routes/user');

require('dotenv').config();
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

//Change mssql
const sql = require('mssql')
const sqlConfig = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_HOST,
  pool: {
    max: 1000,
    min: 0,
    idleTimeoutMillis: 30000
  },
  options: {
    // encrypt: true, // for azure
    trustServerCertificate: true // change to true for local dev / self-signed certs
  }
}

const config = {
    server: process.env.DB_HOST,
    authentication: {
        type: 'default',
        options: {
            userName: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
        }
    },
    options: {
        // If you are on Microsoft Azure, you need encryption:
        // encrypt: true,
        trustServerCertificate: true,
        database: process.env.DB_NAME,
        port: 1433
    }
};

// connection.on('')

class SqlCommand {
    constructor(queryStr) {
        this.queryStr = queryStr;
        this.parameters = [];
    }
    addParameter = (name, value) => {
        const me = this;
        if(this.parameters.indexOf(name) !== -1) return;

        if(typeof(value) === 'string') me.queryStr = me.queryStr.replace(name, `N'${value}'`);
        else if(typeof(value) === 'number') me.queryStr = me.queryStr.replace(name, value);

        
        this.parameters.push(name);
    }
    processParam = (param) => {

    }
}

const execQuery = async (queryStr) => {
    try {
     // make sure that any items are correctly URL encoded in the connection string
    let pool  = await sql.connect(sqlConfig);
    
    let result = await pool.request().query(queryStr);
    
    pool.close();

    // console.log('>>>command',result)
    
    return result.recordset;

    } catch (err) {
     // ... error checks
     console.log('>>>err', err);
    }
   }

module.exports = {
    SqlCommand,
    execQuery
};
