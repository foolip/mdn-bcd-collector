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

const app = require('../../app');
const puppeteers = {
  'Chrome': require('puppeteer'),
  'Firefox': require('puppeteer-firefox'),
};

const assert = require('assert');

describe('/resources/harness.js', () => {
  const port = process.env.PORT || 8081;
  let server;
  before(() => {
    server = app.listen(port);
  });
  after(() => server.close());

  for (const [browserName, puppeteer] of Object.entries(puppeteers)) {
    it(browserName, async () => {
      const browser = await puppeteer.launch();
      after(() => browser.close());

      const page = await browser.newPage();
      const reportPromise = new Promise((resolve, reject) => {
        page.on('console', (msg) => {
          if (msg.type() === 'log') {
            resolve(JSON.parse(msg.text()));
          }
        });
        page.on('error', reject);
      });
      await page.goto(`http://localhost:${port}/test/#reporter=json`);
      const report = await reportPromise;
      assert.equal(report.stats.failures, 0);
    });
  }
});
