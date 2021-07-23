const winston = require('winston');
require('winston-mongodb');

module.exports = function () {
    winston.exceptions.handle(
        new winston.transports.File({ filename: 'logger.log', level: "info" })
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
    
    winston.add(new winston.transports.MongoDB({
        db: 'mongodb://localhost/logger',
        level: "info"
    }))
}