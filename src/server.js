const express = require('express');
const path = require('path');
const {
    userRoutes,
    testRoutes,
} = require('./routes');
require('dotenv').config();
const Recaptcha = require('express-recaptcha').RecaptchaV3;
const cors = require('cors');


const app = express();
const port = process.env.PORT;

//Recaptcha
const recaptcha = new Recaptcha('6Le-sBwnAAAAAKXmVKCfCth_X_ydZfXlXIVswRyA', '6Le-sBwnAAAAAIVZWKt20RjubZfjzuCt64FCwpsz');
// const options = { hl: 'de' };
// const recaptcha = new Recaptcha('SITE_KEY', 'SECRET_KEY', options);

app.use(cors());

//Declare routes
app.get('/', (req, res) => {
    // res.send('login', { captcha: res.recaptcha })
    // console.log('>>>test')
    res.send('test')
})

// app.post('/', recaptcha.middleware.verify, function (req, res) {
//     if (!req.recaptcha.error) {
//         // success code
//         console.log('>>>',{ captcha: res.recaptcha })
//     } else {
//         // error code
//         console.log('>>>',success)
//     }
//     res.send('test')
// })

app.use('/user', userRoutes);

//Static Files
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, (error) => {
    if (error) console.log('Something went wrong...');
    console.log('serve is running port: ', port);
})