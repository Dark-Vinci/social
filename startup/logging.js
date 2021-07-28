const winston = require('winston');
// require('winston-mongodb');

module.exports = function () {
    winston.exceptions.handle(
        new winston.transports.File({ filename: 'logger.log', level: "info" }),
        new winston.transports.Console({
            prettyPrint: true,
            colorize: true,
            level: 'info'
        })
    );
    
    process.on('unhandledRejection', (ex) => {
        throw ex;
    })
    
    winston.add(new winston.transports.File({ filename: 'logger.log', level: "info" }));
    
    winston.add(new winston.transports.Console({
        colorize: true,
        prettyPrint: true,
        level: "info"
    }));
    
    // winston.add(new winston.transports.MongoDB({
    //     db: 'mongodb://localhost/logger',
    //     level: "info"
    // }))
}