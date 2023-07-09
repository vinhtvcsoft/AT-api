require('dotenv').config();
const Connection = require('tedious').Connection;
const Request = require('tedious').Request;
const TYPES = require('tedious').TYPES;

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

const connection = new Connection(config);

// connection.on('connect', function (err) {
//     console.log("Connected");
//     queryExp();
// });


const execQuery = (sqlCommand) => {
    connection.connect((err) => {
        if (err) {
            console.log('Error ===>', err)
        }
        else {
            const request = new Request(sqlCommand, (err) => {
                if (err) {
                    console.log('>>>error', err);
                }
            });

            const resultData = [];
            request.on('row', (columns) => {
                const rowData = {};
                columns.forEach((column) => {
                    if (column.value === null) {
                        rowData[column.metadata.colName] = null;
                    } else {
                        rowData[column.metadata.colName] = column.value
                    }
                });
                resultData.push(rowData);
            });

            request.on('done', (rowCount, more, returnStatus, rows) => {
                console.log('>>> done', rowCount, more, returnStatus, rows);
            });

            // Close the connection after the final event emitted by the request, after the callback passes
            request.on("requestCompleted", (rowCount, more) => {
                connection.close();
                console.log('test>>>', resultData);
                return resultData;
            });
            connection.execSql(request);
        }
    });
}



const queryExp = () => {
    const request = new Request("SELECT * FROM csoperator", function (err) {
        if (err) {
            console.log('>>>error', err);
        }

    });
    const resultData = [];
    request.on('row', function (columns) {
        const rowData = {};
        columns.forEach(function (column) {
            if (column.value === null) {
                rowData[column.metadata.colName] = null;
            } else {
                rowData[column.metadata.colName] = column.value
            }
        });
        resultData.push(rowData);
    });

    request.on('done', function (rowCount, more, returnStatus, rows) {
        console.log('>>> done', rowCount, more, returnStatus, rows);
    });

    // Close the connection after the final event emitted by the request, after the callback passes
    request.on("requestCompleted", function (rowCount, more) {
        console.log('>>> completed', resultData);
        connection.close();
    });
    connection.execSql(request);
};

module.exports = {
    execQuery
};
