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

const express = require('express');
const cookieParser = require('cookie-parser');
const uniqueString = require('unique-string');

const logger = require('./logger');

const appversion = require('./package.json').version;

const PORT = process.env.PORT || 8080;

// TODO: none of this setup is pretty
const {CloudStorage, MemoryStorage} = require('./storage');
const storage = process.env.NODE_ENV === 'production' ?
   new CloudStorage :
   new MemoryStorage;

const secrets = process.env.NODE_ENV === 'test' ?
    require('./secrets.sample.json') :
    require('./secrets.json');

const github = require('./github')(
  secrets.github.token ?
  {auth: `token ${secrets.github.token}`} :
  {}
);

const Tests = require('./tests');
const tests = new Tests({
  manifest: require('./MANIFEST.json'),
  host: process.env.NODE_ENV === 'production' ?
      'mdn-bcd-collector.appspot.com' :
      `localhost:${PORT}`,
  httpOnly: process.env.NODE_ENV !== 'production'
});

function cookieSession(req, res, next) {
  req.sessionID = req.cookies.sid;
  if (!req.sessionID) {
    req.sessionID = uniqueString();
    res.cookie('sid', req.sessionID);
  }
  next();
}

/* istanbul ignore next */
function catchError(err, res) {
  logger.error(err);
  res.status(500).end();
}

const app = express();
app.use(cookieParser());
app.use(cookieSession);
app.use(express.json({limit: '32mb'}));
app.use(express.static('static'));
app.use(express.static('generated'));

app.get('/api/tests', (req, res) => {
  const {after, limit} = req.query;
  const list = tests.list(after, limit ? +limit : 0);
  const individualList = tests.listIndividual(after, limit ? +limit : 0);
  res.json([list, individualList]);
});

app.post('/api/results', (req, res) => {
  if (!req.is('json')) {
    res.status(400).end();
    return;
  }

  let forURL;
  try {
    forURL = new URL(req.query.for).toString();
  } catch (err) {
    res.status(400).end();
    return;
  }

  const response = {};

  // Include next test in response as a convenience.
  try {
    const next = tests.list(forURL, 1)[0];
    if (next) {
      response.next = next;
    }
  } catch (err) {
    logger.warn(`Results submitted for URL not in manifest: ${forURL}`);
    // note: indistinguishable from finishing last test to client
  }

  Promise.all([
    storage.put(req.sessionID, '__version', appversion),
    storage.put(req.sessionID, forURL, req.body)
  ]).then(() => {
    res.status(201).json(response);
  })
      .catch(/* istanbul ignore next */ (err) => catchError(err, res));
});

app.get('/api/results', (req, res) => {
  storage.getAll(req.sessionID)
      .then((results) => {
        res.status(200).json(results);
      })
      .catch(/* istanbul ignore next */ (err) => catchError(err, res));
});

/* istanbul ignore next: we don't want to create lots of dummy PRs */
app.post('/api/results/export/github', (req, res) => {
  storage.getAll(req.sessionID)
      .then(async (results) => {
        const userAgent = req.get('User-Agent');
        const report = {results, userAgent};
        const response = await github.exportAsPR(report);
        if (response) {
          res.json(response);
        } else {
          res.status(500).end();
        }
      })
      .catch(/* istanbul ignore next */ (err) => catchError(err, res));
});

/* istanbul ignore if */
if (require.main === module) {
  // Start the server
  app.listen(PORT, () => {
    logger.info(`App listening on port ${PORT}`);
    logger.info('Press Ctrl+C to quit.');
  });
} else {
  // Export for testing
  module.exports = {app: app, version: appversion};
}
