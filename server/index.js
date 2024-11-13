// index.js or your main app file
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const PORT = process.env.PORT || 5001;


require('dotenv').config();

const app = express();
app.use(logger('dev'));
app.use(cors({ origin: 'http://localhost:3000' },
    {methods: ['GET', 'POST', 'PUT', 'DELETE']},
));

app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));

app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({}));
app.use(cookieParser());

// Use the API routes
app.use('/api/user', require('./routes/users'));
app.use('/api/banner', require('./routes/banners'))
app.use('/api/meatJerk', require('./routes/meatJerks'))
app.use('/api/packing', require('./routes/packings'))
app.use('/api/pigJerk', require('./routes/pigJerk'))
app.use('/api/sausage', require('./routes/sausage'))

app.get('/', (req, res) => {
    res.send("Welcome to the API!");
});

const start = async () => {
    try {
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (e) {
        console.log(e);
    }
};

start();

module.exports = app;
