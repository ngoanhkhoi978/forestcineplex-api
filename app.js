const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const db = require('./config/db');

const app = express();
app.use(cookieParser());
// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    cors({
        origin: ['http://localhost:4000', 'http://localhost:5173'],
        credentials: true,
    }),
);

app.use('/public', express.static(path.join(__dirname, 'public')));

// Connect database
db.connect();

// Setup route
const route = require('./routes');
route(app);

module.exports = app;
