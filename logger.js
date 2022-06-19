//
// mdn-bcd-collector: logger.js
// Logging output module to log to either the console or GAE cloud
//
// © Google LLC, Gooborg Studios
// See LICENSE.txt for copyright details
//

import winston from 'winston';
import {LoggingWinston} from '@google-cloud/logging-winston';

const getTransport = () => {
  /* c8 ignore next 3 */
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return new LoggingWinston();
  }

  return new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  });
};

const logger = winston.createLogger({
  level: 'info',
  transports: [getTransport()],
  silent: process.env.NODE_ENV === 'test'
});

export default logger;
