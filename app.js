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
const Tests = require('./tests');

const tests = new Tests({
  manifest: require('./generated/MANIFEST.json'),
  host: 'localhost',
});

const app = express();
app.use(session({
  secret: 'not a secret',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false},
}));
app.use(express.json());
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

  const results = req.session.results || {};

  if (forURL in results) {
    res.status(409).end();
    return;
  }

  results[forURL] = req.body;

  req.session.results = results;
  req.session.save((err) => {
    if (err) {
      logger.error(err);
      res.status(500).end();
    } else {
      res.status(201).end();
    }
  });
});

app.get('/api/results', (req, res) => {
  const results = req.session.results || {};
  res.json(results);
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
