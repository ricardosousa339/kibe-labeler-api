import { createLogger, format, transports } from 'winston';
import path from 'path';

const logFilePath = path.join(__dirname, 'logs', 'error.log');

const errorLogger = createLogger({
  level: 'error',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [
    new transports.File({ filename: logFilePath })
  ]
});

export default errorLogger;