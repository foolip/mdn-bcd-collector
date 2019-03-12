// Copyright 2019 Google LLC
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
const session = require('express-session');

const logger = require('./logger');

const secrets = process.env.NODE_ENV === 'test'
    ? require('./secrets.sample.json')
    : require('./secrets.json');
const github = require('./github')({
  auth: `token ${secrets.github.token}`,
});
const Tests = require('./tests');

const tests = new Tests({
  manifest: require('./MANIFEST.json'),
  host: process.env.NODE_ENV === 'production'
      ? 'mdn-bcd-collector.appspot.com'
      : 'localhost:8080',
});

const app = express();
app.use(session({
  secret: 'not a secret',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false},
}));
app.use(express.json({limit: '32mb'}));
app.use(express.static('static'));
app.use(express.static('generated'));

app.get('/api/tests', (req, res) => {
  const {after, limit} = req.query;
  const list = tests.list(after, limit ? +limit : 0);
  res.json(list);
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

  const results = req.session.results || {};

  if (forURL in results) {
    res.status(409).json(response);
    return;
  }

  results[forURL] = req.body;

  req.session.results = results;
  req.session.save((err) => {
    if (err) {
      logger.error(err);
      res.status(500).end();
    } else {
      res.status(201).json(response);
    }
  });
});

app.get('/api/results', (req, res) => {
  const results = req.session.results || {};
  res.json(results);
});

app.post('/api/results/export/github', (req, res) => {
  const results = req.session.results;
  if (!results) {
    res.status(400).end();
    return;
  }

  const userAgent = req.get('User-Agent');

  const report = {results, userAgent};

  github.exportAsPR(report)
      .then((result) => {
        res.json(result);
      })
      .catch((err) => {
        logger.error(err);
        res.status(500).end();
      });
});

if (process.env.NODE_ENV === 'test') {
  // Export for testing
  module.exports = app;
} else {
  // Start the server
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    logger.info(`App listening on port ${PORT}`);
    logger.info('Press Ctrl+C to quit.');
  });
}
