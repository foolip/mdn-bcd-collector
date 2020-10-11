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

const {
  Browser,
  Builder,
  By,
  Capabilities,
  Capability,
  logging,
  until
} = require('selenium-webdriver');
const bcd = require('@mdn/browser-compat-data');
const fs = require('fs-extra');
const ora = require('ora');
const path = require('path');

const github = require('./github')();
const logger = require('./logger');
const secrets = require('./secrets.json');

const resultsDir = path.join(__dirname, '..', 'mdn-bcd-results');

const host = process.env.NODE_ENV === 'test' ?
      `http://localhost:8080` :
      'https://mdn-bcd-collector.appspot.com';

const seleniumUrl = secrets.selenium.url && secrets.selenium.url
    .replace('$USERNAME$', secrets.selenium.username)
    .replace('$ACCESSKEY$', secrets.selenium.accesskey);

const spinner = ora();

const failSpinner = (e) => {
  spinner.fail(spinner.text + ' - ' + e.stack);
};

const filterVersions = (data, earliestVersion) => {
  const versions = [];

  for (const [version, versionData] of Object.entries(data)) {
    if (
      (versionData.status == 'current' || versionData.status == 'retired') &&
      version >= earliestVersion
    ) {
      versions.push(version);
    }
  }

  return versions;
};

const getSafariOS = (version) => {
  // Sauce Labs differentiates 10.0 vs. 10.1 in the OS version. This
  // function sets the appropriate OS version accordingly.

  switch (version) {
    case '10':
      return '10.11';
    case '11':
      return '10.12';
    case '12':
    case '13':
      return '10.13';
    default:
      return undefined;
  }
};

const awaitPageReady = async (driver) => {
  await driver.wait(() => {
    return driver.executeScript('return document.readyState')
        .then((readyState) => (readyState === 'complete'));
  });
  await driver.executeScript('return document.readyState');
};

const awaitPage = async (driver, page) => {
  await driver.wait(until.urlIs(page), 30000);
  await awaitPageReady(driver);
};

const goToPage = async (driver, page) => {
  await driver.get(page);
  await awaitPageReady(driver);
};

const run = async (browser, version, os) => {
  const capabilities = new Capabilities();
  capabilities.set(
      Capability.BROWSER_NAME,
      Browser[browser.toUpperCase()]
  );
  capabilities.set(Capability.VERSION, version.split('.')[0]);
  capabilities.set(
      'name',
      `mdn-bcd-collector: ${bcd.browsers[browser].name} ${version} on ${os}`
  );

  switch (os) {
    case 'Windows':
      capabilities.set('os', 'Windows');
      capabilities.set('os_version', '10');
      break;
    case 'macOS':
      capabilities.set('os', 'OS X');
      if (browser === 'safari' && 'saucelabs' in seleniumUrl) {
        capabilities.set('os_version', getSafariOS(version));
      }
      break;
  }

  const prefs = new logging.Preferences();
  prefs.setLevel(logging.Type.BROWSER, logging.Level.SEVERE);
  capabilities.setLoggingPrefs(prefs);

  const driverBuilder = new Builder().usingServer(seleniumUrl)
      .withCapabilities(capabilities);
  const driver = await driverBuilder.build();

  let statusEl;

  try {
    await goToPage(driver, host);
    await driver.findElement(By.id('start')).click();

    await awaitPage(driver, `${host}/tests/`);
    statusEl = await driver.findElement(By.id('status'));
    try {
      await driver.wait(until.elementTextContains(statusEl, 'upload'), 45000);
    } catch (e) {
      if (e.name == 'TimeoutError') {
        throw new Error('Timed out waiting for results to upload');
      }

      throw e;
    }
    if ((await statusEl.getText()).search('Failed') !== -1) {
      throw new Error('Results failed to upload');
    }

    try {
      if (browser === 'chrome' || browser === 'firefox' ||
        (browser === 'edge' && version >= 79)) {
        await goToPage(driver, `view-source:${host}/api/results`);
      } else {
        await goToPage(driver, `${host}/api/results`);
      }
      const reportBody = await driver.wait(until.elementLocated(By.css('body')));
      const reportString = await reportBody.getAttribute('textContent');
      const report = JSON.parse(reportString);
      const {filename} = github.getReportMeta(report);
      await fs.writeJson(path.join(resultsDir, filename), report, {spaces: 2});

      spinner.succeed();
    } catch (e) {
      // If we can't download the results, fallback to GitHub
      await goToPage(driver, `${host}/results`);
      statusEl = await driver.findElement(By.id('status'));
      await driver.wait(until.elementTextContains(statusEl, 'to'));
      if ((await statusEl.getText()).search('Failed') !== -1) {
        throw new Error('Pull request failed to submit');
      }

      spinner.warn(spinner.text + ' - Exported to GitHub');
    }
  } catch (e) {
    failSpinner(e);
  }

  try {
    const logs = await driver.manage().logs().get(logging.Type.BROWSER);
    logs.forEach((entry) => {
      logger.info(`[Browser Logger: ${entry.level.name}] ${entry.message}`);
    });
  } catch (e) {
    // If we couldn't get the browser logs, ignore and continue
  }

  await driver.quit();
};

const runAll = async (limitBrowsers, oses) => {
  if (!seleniumUrl) {
    logger.error('A Selenium remote WebDriver URL is not defined in secrets.json.  Please define your Selenium remote.');
    return false;
  }

  let browsersToTest = {
    chrome: filterVersions(bcd.browsers.chrome.releases, 40),
    edge: filterVersions(bcd.browsers.edge.releases, 12),
    firefox: filterVersions(bcd.browsers.firefox.releases, 35),
    ie: filterVersions(bcd.browsers.ie.releases, 11),
    safari: filterVersions(bcd.browsers.safari.releases, 9)
  };

  if (limitBrowsers) {
    browsersToTest = Object.fromEntries(Object.entries(browsersToTest)
        .filter(([k]) => (limitBrowsers.includes(k))));
  }

  // eslint-disable-next-line guard-for-in
  for (const browser in browsersToTest) {
    for (const version of browsersToTest[browser]) {
      for (const os of oses) {
        spinner.start(`${bcd.browsers[browser].name} ${version} on ${os}`);

        try {
          await run(browser, version, os);
        } catch (e) {
          failSpinner(e);
        }
      }
    }
  }

  spinner.stop();
  return true;
};

/* istanbul ignore if */
if (require.main === module) {
  const {argv} = require('yargs').command(
      '$0 [browser..]',
      'Run Selenium on several browser versions',
      (yargs) => {
        yargs
            .positional('browser', {
              describe: 'Limit the browser(s) to test',
              type: 'string',
              choices: ['chrome', 'edge', 'firefox', 'ie', 'safari']
            })
            .option('os', {
              describe: 'Limit the os(es) to test',
              type: 'array',
              choices: ['Windows', 'macOS'],
              default: ['Windows', 'macOS']
            });
      }
  );

  if (runAll(argv.browser, argv.os) === false) {
    process.exit(1);
  }
}
