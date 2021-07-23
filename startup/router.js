const express = require('express');
const cors = require('cors');
const compression = require('compression');
const xss = require('xss-clean');
const helmet = require('helmet');
const morgan = require('morgan');

const register = require('../routes/register');
const login = require('../routes/login');
const user = require('../routes/user');
const post = require('../routes/post');
const search = require('../routes/search');
const error = require('../middleware/error');
const admin = require('../routes/admin');

module.exports = function (app) {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(helmet());
    app.use(morgan('tiny'));
    app.use(cors());
    app.use(compression());
    app.use(xss());

    app.use('/api/register', register);
    app.use('/api/login', login);
    app.use('/api/user', user);
    app.use('/api/post', post);
    app.use('/api/search', search);
    app.use('/api/admin', admin);

    app.use(error);
}