const config = require('config');

module.exports = function () {
    if (!config.get('jwtPass')) {
        winston.log('go define your jwt password');
        throw new Error('go define your jwt password')
    }
}