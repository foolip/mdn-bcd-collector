//
// mdn-bcd-collector: unittest/puppeteer/harness.ts
// Unittest for testing harness.js in multiple browsers
//
// © Google LLC, Gooborg Studios, Mozilla Corporation
// See the LICENSE file for copyright details
//

import {fileURLToPath} from 'node:url';

import {assert} from 'chai';
import fs from 'fs-extra';
import puppeteer from 'puppeteer';

import {app} from '../../app.js';

describe('harness.js', () => {
  const port = process.env.PORT || 8081;
  let server;
  before(() => {
    server = app.listen(port);
  });
  after(() => server.close());

  it('Puppeteer coverage', async () => {
    const browser = await puppeteer.launch();
    after(() => browser.close());

    const page = await browser.newPage();
    await page.coverage.startJSCoverage({includeRawScriptCoverage: true});

    const reportPromise = new Promise((resolve, reject) => {
      page.on('console', (msg) => {
        if (msg.type() === 'log') {
          resolve(JSON.parse(msg.text()));
        }
      });
      page.on('error', reject);
    });

    await page.goto(`http://localhost:${port}/unittest/#reporter=json`);
    const report: any = await reportPromise;

    const jsCoverage = await page.coverage.stopJSCoverage();

    // Adjust coverage reports to point to original files
    // and filter for non-generated files
    const coverage = jsCoverage
      .map(
        ({rawScriptCoverage: it}) =>
          it && {
            ...it,
            scriptId: String(it.scriptId),
            url: it.url.replace(
              `http://localhost:${port}/`,
              new URL('../../static/', import.meta.url).toString()
            )
          }
      )
      .filter((it) => it && fs.existsSync(fileURLToPath(it.url)));

    coverage.forEach((it, idx) =>
      fs.writeFileSync(
        `${process.env.NODE_V8_COVERAGE}/coverage-${Date.now()}-${idx}.json`,
        JSON.stringify({result: [it]})
      )
    );

    assert.equal(report.stats.failures, 0);
  })
    .slow(10000)
    .timeout(30000);
});
