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

const exporter = require('./exporter');
const logger = require('./logger');
const {parseResults} = require('./results');
const storage = require('./storage').getStorage();
const {parseUA} = require('./ua-parser');

const PORT = process.env.PORT || 8080;

const appVersion = process.env.GAE_VERSION === 'production' ? require('./package.json').version : 'Dev';

/* istanbul ignore next */
const secrets = process.env.NODE_ENV === 'test' ?
    require('./secrets.sample.json') :
    require('./secrets.json');

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
    res.status(400).send('body should be JSON');
    return;
  }

  let url;
  let results;
  try {
    [url, results] = parseResults(req.query.for, req.body);
  } catch (e) {
    res.status(400).send(e.message);
    return;
  }

  storage.put(req.sessionID, url, results).then(() => {
    res.status(201).end();
  }).catch(next);
});

app.get('/api/results', (req, res, next) => {
  storage.getAll(req.sessionID)
      .then((results) => {
        res.status(200).json(createReport(results, req));
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

app.get('/download/:filename', (req, res, next) => {
  storage.readFile(req.params.filename)
      .then((data) => {
        res.setHeader('content-type', 'application/json;charset=UTF-8');
        res.setHeader('content-disposition', 'attachment');
        res.send(data);
      }).catch(next);
});

app.post('/export', (req, res, next) => {
  const github = !!req.body.github;
  storage.getAll(req.sessionID)
      .then(async (results) => {
        const report = createReport(results, req);
        if (github) {
          const token = secrets.github.token;
          const {url} = await exporter.exportAsPR(report, token);
          res.render('export', {
            title: 'Exported to GitHub',
            description: url,
            url
          });
        } else {
          const {filename, buffer} = exporter.getReportMeta(report);
          await storage.saveFile(filename, buffer);
          res.render('export', {
            title: 'Exported for download',
            description: filename,
            url: `/download/${filename}`
          });
        }
      }).catch(next);
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
