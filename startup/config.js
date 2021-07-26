const config = require('config');
const winston = require('winston');

module.exports = function () {
    if (!config.get('jwtPass')) {
        winston.info('go define your jwt password');
        throw new Error('go define your jwt password')
    }
}