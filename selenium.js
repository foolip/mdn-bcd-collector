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
const bcd = require('mdn-browser-compat-data');
const ora = require('ora');
const path = require('path');

const github = require('./github')();
const {stringify, writeFile} = require('./utils');
const secrets = require('./secrets.json');

const resultsDir = path.join(__dirname, '..', 'mdn-bcd-results');

const host = process.env.NODE_ENV === 'test' ?
      `http://localhost:8080` :
      'https://mdn-bcd-collector.appspot.com';

const seleniumUrl = secrets.selenium.url && secrets.selenium.url
    .replace('$USERNAME$', secrets.selenium.username)
    .replace('$ACCESSKEY$', secrets.selenium.accesskey);

const spinner = ora();

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

const run = async (browser, version) => {
  const capabilities = new Capabilities();
  capabilities.set(
      Capability.BROWSER_NAME,
      Browser[browser.toUpperCase()]
  );
  capabilities.set(Capability.VERSION, version);
  capabilities.set(
      'name',
      `mdn-bcd-collector: ${bcd.browsers[browser].name} ${version}`
  );

  if (browser === 'safari') {
    const platform = getSafariOS(version);
    capabilities.set('platform', platform);
  }

  const prefs = new logging.Preferences();
  prefs.setLevel(logging.Type.BROWSER, logging.Level.SEVERE);
  capabilities.setLoggingPrefs(prefs);

  const driverBuilder = new Builder().usingServer(seleniumUrl)
      .withCapabilities(capabilities);
  const driver = await driverBuilder.build();

  let statusEl;

  try {
    await driver.get(`${host}`);
    await driver.wait(() => {
      return driver.executeScript('return document.readyState')
          .then((readyState) => (readyState === 'complete'));
    });
    await driver.executeScript('return document.readyState');
    await driver.findElement(By.id('start')).click();

    await driver.wait(until.urlIs(`${host}/tests/`));
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

    await driver.get(`${host}/api/results`);
    const report = JSON.parse(
      await driver.wait(until.elementLocated(By.css('body')))
        .getAttribute('innerText')
    );
    const {filename} = github.getReportMeta(report);
    await writeFile(path.join(resultsDir, filename), report, {spacing: 2});

    spinner.succeed();
  } catch (e) {
    spinner.fail(spinner.text + ' - ' + e);
  }

  try {
    const logs = await driver.manage().logs().get(logging.Type.BROWSER);
    logs.forEach((entry) => {
      console.log('[Browser Logger: %s] %s', entry.level.name, entry.message);
    });
  } catch (e) {
    // If we couldn't get the browser logs, ignore and continue
  }

  await driver.quit();
};

const runAll = async (limitBrowser) => {
  if (!seleniumUrl) {
    console.error('A Selenium remote WebDriver URL is not defined in secrets.json.  Please define your Selenium remote.');
    return false;
  }

  let browsersToTest = {
    chrome: filterVersions(bcd.browsers.chrome.releases, 40),
    edge: filterVersions(bcd.browsers.edge.releases, 12),
    firefox: filterVersions(bcd.browsers.firefox.releases, 35),
    ie: filterVersions(bcd.browsers.ie.releases, 11),
    safari: filterVersions(bcd.browsers.safari.releases, 9)
  };

  if (limitBrowser) {
    browsersToTest = {[limitBrowser]: browsersToTest[limitBrowser]};
  }

  // eslint-disable-next-line guard-for-in
  for (const browser in browsersToTest) {
    for (const version of browsersToTest[browser]) {
      spinner.start(`${bcd.browsers[browser].name} ${version}`);

      try {
        await run(browser, version);
      } catch (e) {
        spinner.fail(spinner.text + ' - ' + e);
      }
    }
  }

  spinner.stop();
  return true;
};

/* istanbul ignore if */
if (require.main === module) {
  if (runAll(process.env.BROWSER) === false) {
    process.exit(1);
  }
} else {
  module.exports = {
    run,
    runAll
  };
}
