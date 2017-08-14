const log4js = require('log4js');

function logger() {
    const logDir = process.env.NODE_LOG_DIR !== undefined
        ? process.env.NODE_LOG_DIR
        : '.';

    const config = {
        appenders: {
            screen: { type: 'console' }
        },
        categories: {
            default: { appenders: ['screen'], level: 'debug' }
        }
    };

    log4js.configure(config);

    return {
        getLogger(category) {
            const instance = log4js.getLogger(category);
            instance.level = 'debug';

            return instance;
        }
    };
}

module.exports = logger;
