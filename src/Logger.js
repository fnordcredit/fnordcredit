// @flow
import winston from "winston";

export default winston.createLogger({
  level: process.argv.includes('--debug', 2) ? 'debug' : 'info',
  transports: [
    new winston.transports.File({ filename: 'credit.log' }),
  ],
});
