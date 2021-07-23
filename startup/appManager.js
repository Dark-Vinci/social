

module.exports = function (app) {
    require('./config')();
    require('./joi')();
    require('./db')();
    require('./logging')();
    require('./router')(app);
}