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

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const uniqueString = require('unique-string');
const expressLayouts = require('express-ejs-layouts');

const logger = require('./logger');

const appversion = require('./package.json').version;

const PORT = process.env.PORT || 8080;

/* istanbul ignore next */
const secrets = process.env.NODE_ENV === 'test' ?
    require('./secrets.sample.json') :
    require('./secrets.json');

const getHost = () => {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  if (project) {
    const version = process.env.GAE_VERSION;
    if (version === 'production') {
      return `${project}.appspot.com`;
    }
    return `${version}-dot-${project}.appspot.com`;
  }
  return `localhost:${PORT}`;
};

const {CloudStorage, MemoryStorage} = require('./storage');
/* istanbul ignore next */
const storage = process.env.NODE_ENV === 'production' ?
   new CloudStorage(process.env.GOOGLE_CLOUD_PROJECT) :
   new MemoryStorage;

/* istanbul ignore next */
const github = require('./github')(
  secrets.github.token ?
  {auth: `token ${secrets.github.token}`} :
  {}
);

const Tests = require('./tests');
const tests = new Tests({
  tests: require('./tests.json'),
  host: getHost(),
  httpOnly: process.env.NODE_ENV !== 'production'
});

const cookieSession = (req, res, next) => {
  req.sessionID = req.cookies.sid;
  if (!req.sessionID) {
    req.sessionID = uniqueString();
    res.cookie('sid', req.sessionID);
  }
  next();
};

/* istanbul ignore next */
const catchError = (err, res) => {
  logger.error(err);
  res.status(500).end();
};

const app = express();

// Layout config
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout extractScripts', true);

// Additional config
app.use(cookieParser());
app.use(cookieSession);
app.use(express.json({limit: '32mb'}));
app.use(express.static('static'));
app.use(express.static('generated'));

// Backend API

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
  const next = tests.next(forURL);
  if (next) {
    response.next = next;
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

// Views

app.get('/', (req, res) => {
  res.render('index', {
    title: 'mdn-bcd-collector',
    tests: [
      tests.listMainEndpoints('/tests')[0],
      ...tests.listIndividual('/tests')
    ]
  });
});

app.get('/results', (req, res) => {
  res.render('results', {
    title: 'Test Results | mdn-bcd-collector'
  });
});

app.all('/tests/*', (req, res) => {
  const endpoint = `/${req.params['0']}`;
  const ident = req.params['0'].replace(/\//g, '.');

  if (tests.listAllEndpoints().some((item) => (item[1] === endpoint))) {
    res.render('tests', {
      title: `${ident} | mdn-bcd-collector`,
      layout: false,
      tests: tests.getTests(endpoint, req.query.exposure),
      individual: tests.getIsIndividual(endpoint)
    });
  } else {
    res.status(404).send(`Could not find tests for ${endpoint}`);
  }
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
  module.exports = {
    app: app,
    version: appversion,
    getHost: getHost
  };
}
