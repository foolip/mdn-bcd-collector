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
const querystring = require('querystring');

const express = require('express');
const cookieParser = require('cookie-parser');
const uniqueString = require('unique-string');
const expressLayouts = require('express-ejs-layouts');

const logger = require('./logger');
const storage = require('./storage').getStorage();

const appversion = require('./package.json').version;

const PORT = process.env.PORT || 8080;

/* istanbul ignore next */
const secrets = process.env.NODE_ENV === 'test' ?
    require('./secrets.sample.json') :
    require('./secrets.json');

/* istanbul ignore next */
const github = require('./github')(
  secrets.github.token ?
  {auth: `token ${secrets.github.token}`} :
  {}
);

const Tests = require('./tests');
const tests = new Tests({
  tests: require('./tests.json'),
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
const catchError = (err, res, method) => {
  logger.error(err);
  res.status(500);

  let errorToDisplay = err;
  if (process.env.NODE_ENV === 'production') {
    errorToDisplay = 'Server error';
  }

  if (method === 'json') {
    res.json({error: errorToDisplay});
  } else {
    res.text(errorToDisplay);
  }
};

const createReport = (results, req) => {
  return {__version: appversion, results, userAgent: req.get('User-Agent')};
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
app.use(express.urlencoded({extended: true}));
app.use(express.json({limit: '32mb'}));
app.use(express.static('static'));
app.use(express.static('generated'));

// Backend API

app.post('/api/get', (req, res) => {
  const testSelection = (req.body.testSelection || '').replace(/\./g, '/');
  const queryParams = {
    ...(req.body.limitExposure && {exposure: req.body.limitExposure})
  };
  const query = querystring.encode(queryParams);

  res.redirect(`/tests/${testSelection}${query ? `?${query}`: ''}`);
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

  storage.put(req.sessionID, forURL, req.body).then(() => {
    res.status(201).json(response);
  }).catch(/* istanbul ignore next */ (err) => catchError(err, res));
});

app.get('/api/results', (req, res) => {
  storage.getAll(req.sessionID)
      .then((results) => {
        res.status(200).json(createReport(results, req));
      })
      .catch(/* istanbul ignore next */ (err) => catchError(err, res));
});

app.post('/api/results/export/github', (req, res) => {
  storage.getAll(req.sessionID)
      .then(async (results) => {
        if (Object.entries(results).length === 0) {
          res.json({error: 'No results to export'});
          return;
        }

        const report = createReport(results, req);
        const response = await github.exportAsPR(report);
        if (response) {
          res.json(response);
        } else {
          res.status(500).json({error: 'Server error'});
        }
      })
      .catch(/* istanbul ignore next */ (err) => catchError(err, res, 'json'));
});

// Views

app.get('/', (req, res) => {
  res.render('index', {
    tests: tests.listEndpoints('/tests')
  });
});

app.get('/results', (req, res) => {
  res.render('results', {
    title: 'Test Results'
  });
});

app.all('/tests/*', (req, res) => {
  const ident = req.params['0'].replace(/\//g, '.');
  const foundTests = tests.getTests(ident, req.query.exposure);
  if (foundTests && foundTests.length) {
    res.render('tests', {
      title: `${ident || 'All Tests'}`,
      layout: false,
      tests: foundTests
    });
  } else {
    res.status(404).render('testnotfound', {
      ident: ident,
      suggestion: tests.didYouMean(ident)
    });
  }
});

// Page Not Found Handler
app.use((req, res) => {
  res.status(404).render('error', {
    title: `Page Not Found`,
    message: 'The requested page was not found.',
    url: req.url
  });
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
    version: appversion
  };
}
