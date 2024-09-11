import path from 'path';
import { createLogger, format, transports } from 'winston';

const logFilePath = path.join(__dirname, 'logs', 'info.log');

const infoLogger = createLogger({
  level: 'info', // Alterado de 'error' para 'info'
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [
    new transports.File({ filename: logFilePath })
  ]
});

export default infoLogger;