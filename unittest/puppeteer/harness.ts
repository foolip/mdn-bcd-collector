//
// mdn-bcd-collector: unittest/puppeteer/harness.js
// Unittest for testing harness.js in multiple browsers
//
// © Google LLC, Gooborg Studios, Mozilla Corporation
// See the LICENSE file for copyright details
//

import {fileURLToPath} from 'node:url';

import {assert} from 'chai';
import fs from 'fs-extra';
import puppeteer, {Product} from 'puppeteer';

import {app} from '../../app.js';

const pkg = await fs.readJson(new URL('../../package.json', import.meta.url));

// Firefox is temporarily disabled due to issues on CI
const products: Product[] = ['chrome']; // ['chrome', 'firefox'];

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
        (this as any).skip();
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
      const report: any = await reportPromise;

      if (product == 'chrome') {
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
