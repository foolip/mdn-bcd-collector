// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

import winston from "winston";
import { LoggingWinston } from "@google-cloud/logging-winston";


const getTransport = () => {
  /* istanbul ignore if */
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
