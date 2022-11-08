require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const uploadRouter = require('./routes/upload');
const statusRouter = require('./routes/status');
const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('../client/build'))

app.use('/api/upload', uploadRouter);
app.use('/api/status', statusRouter);

app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
})

module.exports = app;
