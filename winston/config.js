var winston = require('winston');
var appRoot = require('app-root-path');

const options = {
    file: {
        level: 'info',
        filename: `${appRoot}/logs/app.log`,
        handleExceptions: true,
        format: winston.format.simple(),
        maxsize: 5242880,
        maxFiles: 5,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        format: winston.format.simple(),
    }
};

let logger;

if(process.env.logging === 'off') {
    logger = winston.createLogger({
        transports: [
            new winston.transports.File({filename: 'error.log', level: 'error'}),
            new winston.transports.File(options.file),
        ],
        exitOnError: false
    });
} else {
    logger = winston.createLogger({
        transports: [
            new winston.transports.File(options.file),
            new winston.transports.Console(options.console)
        ],
        ExitOnError: false
    });
}

logger.stream = {
    write(message) {
        logger.info(message);
    },

};

module.exports = logger;