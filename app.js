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

import fs from 'fs-extra';
import querystring from 'querystring';
import bcd from '@mdn/browser-compat-data';
const bcdBrowsers = bcd.browsers;
import esMain from 'es-main';
import express from 'express';
import cookieParser from 'cookie-parser';
import https from 'https';
import http from 'http';
import uniqueString from 'unique-string';
import expressLayouts from 'express-ejs-layouts';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {Octokit} from '@octokit/rest';

import * as exporter from './exporter.js';
import logger from './logger.js';
import parseResults from './results.js';
import {getStorage} from './storage.js';
import {parseUA} from './ua-parser.js';
import Tests from './tests.js';

const storage = getStorage();

const appVersion =
  process.env.GAE_VERSION === 'production' ?
    (await fs.readJson(new URL('./package.json', import.meta.url))).version :
    'Dev';

/* c8 ignore start */
const secrets = await fs.readJson(
  new URL(
    process.env.NODE_ENV === 'test' ?
      './secrets.sample.json' :
      './secrets.json',
    import.meta.url
  )
);
/* c8 ignore stop */

const tests = new Tests({
  tests: await fs.readJson(new URL('./tests.json', import.meta.url)),
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
app.set('views', './views');
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

app.locals.appVersion = appVersion;

// Get user agent
app.use((req, res, next) => {
  res.locals.browser = parseUA(req.get('User-Agent'), bcdBrowsers);
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
  Object.keys(queryParams).forEach((key) => {
    if (!queryParams[key]) {
      delete queryParams[key];
    }
  });
  const query = querystring.encode(queryParams);

  res.redirect(`/tests/${testSelection}${query ? `?${query}` : ''}`);
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

  storage
    .put(req.sessionID, url, results)
    .then(() => {
      res.status(201).end();
    })
    .catch(next);
});

app.get('/api/results', (req, res, next) => {
  storage
    .getAll(req.sessionID)
    .then((results) => {
      res.status(200).json(createReport(results, req));
    })
    .catch(next);
});

// Test Resources

// api.EventSource
app.get('/eventstream', (req, res) => {
  res.header('Content-Type', 'text/event-stream');
  res.send(
    'event: ping\ndata: Hello world!\ndata: {"foo": "bar"}\ndata: Goodbye world!'
  );
});

// Views

app.get('/', (req, res) => {
  res.render('index', {
    tests: tests.listEndpoints('/tests'),
    selenium: req.query.selenium,
    ignore: req.query.ignore
  });
});

/* c8 ignore start */
app.get('/download/:filename', (req, res, next) => {
  storage
    .readFile(req.params.filename)
    .then((data) => {
      res.setHeader('content-type', 'application/json;charset=UTF-8');
      res.setHeader('content-disposition', 'attachment');
      res.send(data);
    })
    .catch(next);
});

// Accept both GET and POST requests. The form uses POST, but selenium.js
// instead simply navigates to /export.
app.all('/export', (req, res, next) => {
  const github = !!req.body.github;
  storage
    .getAll(req.sessionID)
    .then(async (results) => {
      const report = createReport(results, req);
      if (github) {
        const token = secrets.github.token;
        if (token) {
          const octokit = new Octokit({auth: `token ${token}`});
          const {url} = await exporter.exportAsPR(report, octokit);
          res.render('export', {
            title: 'Exported to GitHub',
            description: url,
            url
          });
        } else {
          res.render('export', {
            title: 'GitHub Export Disabled',
            description: '[No GitHub Token, GitHub Export Disabled]',
            url: '/'
          });
        }
      } else {
        const {filename, buffer} = exporter.getReportMeta(report);
        await storage.saveFile(filename, buffer);
        res.render('export', {
          title: 'Exported for download',
          description: filename,
          url: `/download/${filename}`
        });
      }
    })
    .catch(next);
});
/* c8 ignore stop */

app.all('/tests/*', (req, res) => {
  const ident = req.params['0'].replace(/\//g, '.');
  const ignoreIdents = req.query.ignore ?
    req.query.ignore.split(',').filter((s) => s) :
    [];
  const foundTests = tests.getTests(ident, req.query.exposure, ignoreIdents);
  if (foundTests && foundTests.length) {
    res.render('tests', {
      title: `${ident || 'All Tests'}`,
      tests: foundTests,
      selenium: req.query.selenium
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

/* c8 ignore start */
if (esMain(import.meta)) {
  const {argv} = yargs(hideBin(process.argv)).command(
    '$0',
    'Run the mdn-bcd-collector server',
    (yargs) => {
      yargs
        .option('https-cert', {
          describe: 'HTTPS cert chains in PEM format',
          type: 'string'
        })
        .option('https-key', {
          describe: 'HTTPS private keys in PEM format',
          type: 'string'
        })
        .option('https-port', {
          describe: 'HTTPS port (requires cert and key)',
          type: 'number',
          default: 8443
        })
        .option('port', {
          describe: 'HTTP port',
          type: 'number',
          default: process.env.PORT ? +process.env.PORT : 8080
        });
    }
  );

  http.createServer(app).listen(argv.port);
  logger.info(`Listening on port ${argv.port} (HTTP)`);
  if (argv.httpsCert && argv.httpsKey) {
    const options = {
      cert: fs.readFileSync(argv.httpsCert),
      key: fs.readFileSync(argv.httpsKey)
    };
    https.createServer(options, app).listen(argv.httpsPort);
    logger.info(`Listening on port ${argv.httpsPort} (HTTPS)`);
  }
  logger.info('Press Ctrl+C to quit.');
}
/* c8 ignore stop */

export {app, appVersion as version};
