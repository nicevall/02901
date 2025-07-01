const { createLogger, format, transports } = require('winston');

const env = process.env.NODE_ENV || 'development';
const isDev = env === 'development';

const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ level, message, timestamp, label }) => 
        `${timestamp} [${label || 'APP'}] |${level}|: ${message}`
    )
);

const logger = createLogger({
    level: isDev ? 'debug' : 'info',
    format: logFormat,
    transports: [   
        new transports.Console({
            format: format.combine(
                format.colorize(), 
                logFormat   
            )
        })
    ]
});

logger.addLabel = (label) => ({
    info: (message) => logger.info(message, { label }),
    warn: (message) => logger.warn(message, { label }),
    error: (message) => logger.error(message, { label }),
    debug: (message) => logger.debug(message, { label })
});

if (isDev) logger.debug('Logger en modo desarrollo');

module.exports = logger;
