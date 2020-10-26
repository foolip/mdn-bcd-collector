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

  return versions.sort((a, b) => (a - b));
};

const getSafariOS = (version) => {
  // Sauce Labs differentiates 10.0 vs. 10.1 in the OS version. This
  // function sets the appropriate OS version accordingly.

  switch (version) {
    case '10':
      return 'OS X 10.11';
    case '11':
      return 'macOS 10.12';
    case '12':
    case '13':
      return 'macOS 10.13';
    default:
      return undefined;
  }
};

const buildDriver = async (browser, version, os) => {
  for (const [service, seleniumUrl] of Object.entries(secrets.selenium)) {
    if (service === 'browserstack') {
      if (browser === 'edge' && ['12', '13', '14'].includes(version)) {
        // BrowserStack remaps Edge 12-14 as Edge 15
        continue;
      }

      if (browser === 'safari' && ['10', '11', '12', '13'].includes(version)) {
        // BrowserStack doesn't support the Safari x.0 versions
        continue;
      }
    }

    let osesToTest = [];

    switch (os) {
      case 'Windows':
        osesToTest = [
          ['Windows', '10'],
          ['Windows', '8.1'],
          ['Windows', '8'],
          ['Windows', '7'],
          ['Windows', 'XP']
        ];
        break;
      case 'macOS':
        osesToTest = service === 'saucelabs' ?
                     [['macOS', '10.14']] :
                     [['OS X', 'Mojave'], ['OS X', 'El Capitan']];
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

      if (service === 'saucelabs') {
        if (browser === 'safari') {
          capabilities.set('platform', getSafariOS(version));
        } else {
          capabilities.set('platform', `${osName} ${osVersion}`);
        }
      } else {
        capabilities.set('os', osName);
        if (browser !== 'safari') {
          capabilities.set('os_version', osVersion);
        }
      }

      const prefs = new logging.Preferences();
      prefs.setLevel(logging.Type.BROWSER, logging.Level.SEVERE);
      capabilities.setLoggingPrefs(prefs);
      if (service === 'browserstack') {
        capabilities.set('browserstack.console', 'errors');
      }

      try {
        const driverBuilder = new Builder().usingServer(seleniumUrl)
            .withCapabilities(capabilities);
        const driver = await driverBuilder.build();

        return driver;
      } catch (e) {
        if (
          e.message.startsWith('Misconfigured -- Unsupported OS/browser/version/device combo') ||
          e.message.startsWith('OS/Browser combination invalid') ||
          e.message.startsWith('Browser/Browser_Version not supported')
        ) {
          // If unsupported config, continue to the next grid configuration
          continue;
        } else {
          throw e;
        }
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

const changeProtocol = (browser, version, page) => {
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

const awaitPage = async (driver, browser, version, page) => {
  await driver.wait(until.urlIs(changeProtocol(browser, version, page)), 30000);
  await awaitPageReady(driver);
};

const goToPage = async (driver, browser, version, page) => {
  await driver.get(changeProtocol(browser, version, page), 30000);
  await awaitPageReady(driver);
};

const click = async (driver, browser, elementId) => {
  if (browser === 'safari') {
    await driver.executeScript(`document.getElementById('${elementId}').click()`);
  } else {
    await driver.findElement(By.id(elementId)).click();
  }
};

const run = async (browser, version, os) => {
  log('Starting...');

  const driver = await buildDriver(browser, version, os);
  if (!driver) {
    throw new Error('Browser/OS config unsupported');
  }

  let statusEl;

  try {
    log('Loading homepage...');
    await goToPage(driver, browser, version, host);
    await click(driver, browser, 'hideResults');
    await click(driver, browser, 'start');

    log('Running tests...');
    await awaitPage(driver, browser, version, `${host}/tests/?hideResults=on`);

    await driver.wait(until.elementLocated(By.id('status')), 5000);
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
        await goToPage(driver, browser, version, `view-source:${host}/api/results`);
      } else {
        await goToPage(driver, browser, version, `${host}/api/results`);
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
      await goToPage(driver, browser, version, `${host}/results`);
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
  if (!Object.keys(secrets.selenium).length) {
    console.error('A Selenium remote WebDriver URL is not defined in secrets.json.  Please define your Selenium remote(s).');
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
        if (os === 'macOS' && ['edge', 'ie'].includes(browser) && version <= 18) {
          // Don't test Internet Explorer / EdgeHTML on macOS
          continue;
        }

        if (os === 'Windows' && browser === 'safari') {
          // Don't test Safari on Windows
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
