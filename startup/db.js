const mongoose = require('mongoose');
const winston = require('winston');

module.exports = function () {
    mongoose.connect('mongodb://localhost/social', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(() => winston.info('connected to the database'))
}