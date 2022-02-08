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

import {assert} from 'chai';
import fs from 'fs-extra';
import {fileURLToPath} from 'url';
import puppeteer from 'puppeteer';

import {app} from '../../app.js';

const pkg = await fs.readJson(new URL('../../package.json', import.meta.url));

// Firefox is temporarily disabled due to issues on CI
const products = ['chrome']; // ['chrome', 'firefox'];

// Workaround for https://github.com/puppeteer/puppeteer/issues/6255
const consoleLogType = {
  chrome: 'log',
  firefox: 'verbose'
};

describe('harness.js', () => {
  const port = process.env.PORT || 8081;
  let server;
  before(() => {
    server = app.listen(port);
  });
  after(() => server.close());

  for (const product of products) {
    it(product, async () => {
      if (
        product === 'firefox' &&
        process.platform === 'win32' &&
        pkg.devDependencies.puppeteer === '5.4.1'
      ) {
        // Browser.close() Firefox support is broken on Windows and causes hang
        // https://github.com/puppeteer/puppeteer/issues/5673
        /* eslint-disable no-invalid-this */
        this.skip();
        return;
      }
      const browser = await puppeteer.launch({product});
      after(() => browser.close());

      const page = await browser.newPage();
      if (product == 'chrome') {
        await page.coverage.startJSCoverage({includeRawScriptCoverage: true});
      }

      const reportPromise = new Promise((resolve, reject) => {
        page.on('console', (msg) => {
          if (msg.type() === consoleLogType[product]) {
            resolve(JSON.parse(msg.text()));
          }
        });
        page.on('error', reject);
      });

      await page.goto(`http://localhost:${port}/unittest/#reporter=json`);
      const report = await reportPromise;

      if (product == 'chrome') {
        const jsCoverage = await page.coverage.stopJSCoverage();

        // Adjust coverage reports to point to original files
        // and filter for non-generated files
        const coverage = jsCoverage
          .map(({rawScriptCoverage: it}) => ({
            ...it,
            scriptId: String(it.scriptId),
            url: it.url.replace(
              `http://localhost:${port}/`,
              new URL('../../static/', import.meta.url)
            )
          }))
          .filter((it) => fs.existsSync(fileURLToPath(it.url)));

        coverage.forEach((it, idx) =>
          fs.writeFileSync(
            `${
              process.env.NODE_V8_COVERAGE
            }/coverage-${Date.now()}-${idx}.json`,
            JSON.stringify({result: [it]})
          )
        );
      }

      assert.equal(report.stats.failures, 0);
    })
      .slow(10000)
      .timeout(30000);
  }
});
