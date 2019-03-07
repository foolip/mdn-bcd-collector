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
const bodyParser = require('body-parser');
const logger = require('./logger');
const Tests = require('./tests');

const tests = new Tests({
  manifest: require('./generated/MANIFEST.json'),
  host: 'localhost',
});

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static('static'));
app.use(express.static('generated'));

app.get('/api/tests', (req, res) => {
  const {after, limit} = req.query;
  const list = tests.list(after, limit ? +limit : 0);
  res.json(list);
});

app.post('/api/report', (req, res) => {
  res.send(`<pre>${JSON.stringify(req.body, null, '  ')}</pre>`)
      .end();
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  logger.info(`App listening on port ${PORT}`);
  logger.info('Press Ctrl+C to quit.');
});
