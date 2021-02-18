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
const bcdBrowsers = require('@mdn/browser-compat-data').browsers;

const express = require('express');
const cookieParser = require('cookie-parser');
const uniqueString = require('unique-string');
const expressLayouts = require('express-ejs-layouts');

const logger = require('./logger');
const storage = require('./storage').getStorage();
const {parseUA} = require('./ua-parser');

const PORT = process.env.PORT || 8080;

const appVersion = process.env.GAE_VERSION === 'production' ? require('./package.json').version : 'Dev';

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

const createReport = (results, req) => {
  return {__version: appVersion, results, userAgent: req.get('User-Agent')};
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

app.use((req, res, next) => {
  app.locals.appVersion = appVersion;
  app.locals.browser = parseUA(req.get('User-Agent'), bcdBrowsers);
  next();
});

// Backend API

app.post('/api/get', (req, res) => {
  const testSelection = (req.body.testSelection || '').replace(/\./g, '/');
  const queryParams = {
    selenium: req.body.selenium,
    ignore: req.body.ignore,
    exposure: req.body.limitExposure
  };
  Object.keys(queryParams).forEach(
      (key) => !queryParams[key] && delete queryParams[key]
  );
  const query = querystring.encode(queryParams);

  res.redirect(`/tests/${testSelection}${query ? `?${query}`: ''}`);
});

app.post('/api/results', (req, res, next) => {
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
  }).catch(next);
});

app.get('/api/results', (req, res, next) => {
  storage.getAll(req.sessionID)
      .then((results) => {
        res.status(200).json(createReport(results, req));
      }).catch(next);
});

app.post('/api/results/export/github', (req, res, next) => {
  storage.getAll(req.sessionID)
      .then(async (results) => {
        if (Object.entries(results).length === 0) {
          res.status(412).end();
          return;
        }

        const report = createReport(results, req);

        if (req.query.mock) {
          res.send('DISABLED');
          return;
        }

        /* istanbul ignore next */
        const response = await github.exportAsPR(report);
        /* istanbul ignore next */
        if (!response || !response.html_url) {
          throw new Error('No pull request URL in GitHub response');
        }
        /* istanbul ignore next */
        res.send(response.html_url);
      }).catch(next);
});

// Test Resources

// api.EventSource
app.get('/eventstream', (req, res) => {
  res.header('Content-Type', 'text/event-stream');
  res.send('event: ping\ndata: Hello world!\ndata: {"foo": "bar"}\ndata: Goodbye world!');
});

// Views

app.get('/', (req, res) => {
  res.render('index', {
    tests: tests.listEndpoints('/tests'),
    selenium: req.query.selenium,
    ignore: req.query.ignore
  });
});

app.get('/export', (req, res) => {
  res.render('export', {
    title: 'Export Results',
    mock: req.query.mock
  });
});

app.all('/tests/*', (req, res) => {
  const ident = req.params['0'].replace(/\//g, '.');
  const foundTests = tests.getTests(ident, req.query.exposure);
  if (foundTests && foundTests.length) {
    res.render('tests', {
      title: `${ident || 'All Tests'}`,
      tests: foundTests,
      selenium: req.query.selenium,
      ignore: (req.query.ignore ? req.query.ignore.split(',') : [])
    });
  } else {
    res.status(404).render('testnotfound', {
      ident,
      suggestion: tests.didYouMean(ident),
      query: querystring.encode(req.query)
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

module.exports = {
  app,
  version: appVersion
};

/* istanbul ignore if */
if (require.main === module) {
  // Start the server
  app.listen(PORT, () => {
    logger.info(`App listening on port ${PORT}`);
    logger.info('Press Ctrl+C to quit.');
  });
}
