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
const secrets = require('./secrets.json');

const resultsDir = path.join(__dirname, '..', 'mdn-bcd-results');

const host = process.env.NODE_ENV === 'test' ?
      `http://localhost:8080` :
      'https://mdn-bcd-collector.appspot.com';

const seleniumUrl = secrets.selenium.url && secrets.selenium.url
    .replace('$USERNAME$', secrets.selenium.username)
    .replace('$ACCESSKEY$', secrets.selenium.accesskey);

const spinner = ora();

const prettyName = (browser, version, os) => {
  return `${bcd.browsers[browser].name} ${version} on ${os}`;
};

const timestamp = () => {
  const now = new Date(Date.now());
  return now.toLocaleTimeString(undefined, {hour12: false});
};

const error = (e) => {
  spinner.fail(spinner.text.split(' - ')[0] + ' - ' + timestamp() + ': ' +
    (e.name === 'Error' ? e.message : e.stack));
};

const warn = (message) => {
  spinner.warn(spinner.text.split(' - ')[0] + ' - ' + message);
};

const log = (message) => {
  spinner.text = spinner.text.split(' - ')[0] + ' - ' + timestamp() + ': ' + message;
};

const succeed = () => {
  spinner.succeed(spinner.text.split(' - ')[0]);
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

const buildDriver = async (browser, version, os) => {
  let osesToTest = [];
  const safariOnSauceLabs = browser === 'safari' && seleniumUrl.includes('saucelabs');

  switch (os) {
    case 'Windows':
      osesToTest = [
        ['Windows', '10'], ['Windows', '8.1'], ['Windows', '8'], ['Windows', '7'], ['Windows', 'XP']
      ];
      break;
    case 'macOS':
      osesToTest = [['OS X', safariOnSauceLabs && getSafariOS(version)]
      ];
      break;
    default:
      throw new Error(`Unknown/unsupported OS: ${os}`);
  }

  // eslint-disable-next-line guard-for-in
  for (const [osName, osVersion] of osesToTest) {
    const capabilities = new Capabilities();
    capabilities.set(
        Capability.BROWSER_NAME,
        Browser[browser.toUpperCase()]
    );
    capabilities.set(Capability.VERSION, version.split('.')[0]);
    capabilities.set(
        'name', `mdn-bcd-collector: ${prettyName(browser, version, os)}`
    );

    capabilities.set('os', osName);
    if (osVersion) {
      capabilities.set('os_version', osVersion);
    }

    const prefs = new logging.Preferences();
    prefs.setLevel(logging.Type.BROWSER, logging.Level.SEVERE);
    capabilities.setLoggingPrefs(prefs);

    try {
      const driverBuilder = new Builder().usingServer(seleniumUrl)
          .withCapabilities(capabilities);
      const driver = await driverBuilder.build();

      return driver;
    } catch (e) {
      if ((e.name == 'UnsupportedOperationError' &&
        e.message.startsWith('Misconfigured -- Unsupported OS/browser/version/device combo')) ||
        (e.name == 'WebDriverError' &&
        e.message.startsWith('OS/Browser combination invalid'))
      ) {
        // If unsupported config, continue to the next grid configuration
        continue;
      } else {
        throw e;
      }
    }
  }

  return undefined;
};

const awaitPageReady = async (driver) => {
  await driver.wait(() => {
    return driver.executeScript('return document.readyState')
        .then((readyState) => (readyState === 'complete'));
  }, 15000);
  await driver.executeScript('return document.readyState');
};

const changeProtocol = (page, browser, version) => {
  let useHttp = false;
  switch (browser) {
    case 'chrome':
      useHttp = version <= 15;
      break;
    case 'firefox':
      useHttp = version <= 4;
      break;
  }

  if (useHttp) {
    return page.replace('https://', 'http://');
  }

  return page;
};

const awaitPage = async (driver, page, browser, version) => {
  await driver.wait(until.urlIs(changeProtocol(page, browser, version)), 30000);
  await awaitPageReady(driver);
};

const goToPage = async (driver, page, browser, version) => {
  await driver.get(changeProtocol(page, browser, version), 30000);
  await awaitPageReady(driver);
};

const run = async (browser, version, os) => {
  log('Starting...');

  const driver = await buildDriver(browser, version, os);
  if (!driver) {
    throw new Error('Selenium grid does not support browser/OS config');
  }

  let statusEl;

  try {
    log('Loading homepage...');
    await goToPage(driver, host, browser, version);
    await driver.findElement(By.id('hideResults')).click();
    await driver.findElement(By.id('start')).click();

    log('Running tests...');
    await awaitPage(driver, `${host}/tests/?hideResults=on`, browser, version);
    statusEl = await driver.findElement(By.id('status'));
    try {
      await driver.wait(until.elementTextContains(statusEl, 'upload'), 30000);
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
      log('Attempting to download results...');
      if (browser === 'chrome' || browser === 'firefox' ||
        (browser === 'edge' && version >= 79)) {
        await goToPage(driver, `view-source:${host}/api/results`, browser, version);
      } else {
        await goToPage(driver, `${host}/api/results`, browser, version);
      }
      const reportBody = await driver.wait(until.elementLocated(By.css('body')), 10000);
      const reportString = await reportBody.getAttribute('textContent');
      log('Saving results...');
      const report = JSON.parse(reportString);
      const {filename} = github.getReportMeta(report);
      await fs.writeJson(path.join(resultsDir, filename), report, {spaces: 2});

      succeed();
    } catch (e) {
      // If we can't download the results, fallback to GitHub
      log('Uploading results to GitHub...');
      await goToPage(driver, `${host}/results`, browser, version);
      statusEl = await driver.findElement(By.id('status'));
      await driver.wait(until.elementTextContains(statusEl, 'to'));
      if ((await statusEl.getText()).search('Failed') !== -1) {
        throw new Error('Pull request failed to submit');
      }

      warn('Exported to GitHub');
    }
  } catch (e) {
    error(e);
  }

  try {
    const logs = await driver.manage().logs().get(logging.Type.BROWSER);
    logs.forEach((entry) => {
      console.info(`[Browser Logger: ${entry.level.name}] ${entry.message}`);
    });
  } catch (e) {
    // If we couldn't get the browser logs, ignore and continue
  }

  await driver.quit();
};

const runAll = async (limitBrowsers, oses) => {
  if (!seleniumUrl) {
    console.error('A Selenium remote WebDriver URL is not defined in secrets.json.  Please define your Selenium remote.');
    return false;
  }

  let browsersToTest = {
    chrome: filterVersions(bcd.browsers.chrome.releases, 15),
    edge: filterVersions(bcd.browsers.edge.releases, 12),
    firefox: filterVersions(bcd.browsers.firefox.releases, 4),
    ie: filterVersions(bcd.browsers.ie.releases, 6),
    safari: filterVersions(bcd.browsers.safari.releases, 5.1)
  };

  if (limitBrowsers) {
    browsersToTest = Object.fromEntries(Object.entries(browsersToTest)
        .filter(([k]) => (limitBrowsers.includes(k))));
  }

  // eslint-disable-next-line guard-for-in
  for (const browser in browsersToTest) {
    for (const version of browsersToTest[browser].reverse()) {
      for (const os of oses) {
        if (browser === 'safari' && os === 'Windows') {
          // Don't test Safari on Windows
          continue;
        }

        if (browser === 'edge' && os === 'macOS' && version <= 18) {
          // Don't test EdgeHTML on macOS
          continue;
        }

        if (browser === 'ie' && os === 'macOS') {
          // Don't test Internet Explorer on macOS
          continue;
        }

        spinner.start(prettyName(browser, version, os));

        try {
          await run(browser, version, os);
        } catch (e) {
          error(e);
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
              describe: 'Specify OS to test',
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
