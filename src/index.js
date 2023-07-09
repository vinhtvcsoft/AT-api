const express = require('express');
const path = require('path')
const webRoutes = require('./routes/web')
require('dotenv').config();
const { execQuery } = require('./config/database');

const app = express();
const port = process.env.PORT;

app.use('/', webRoutes);

//Static Files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, (error) => {
    if (error) console.log('Something went wrong...');
    console.log('serve is running port: ', port);

    execQuery('SELECT * FROM csoperator');
})