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

// TODO: IE and pre-Blink Edge have issues with automated runtime
let browsersToTest = {
  chrome: filterVersions(bcd.browsers.chrome.releases, 40),
  edge: filterVersions(bcd.browsers.edge.releases, 12),
  firefox: filterVersions(bcd.browsers.firefox.releases, 35),
  ie: filterVersions(bcd.browsers.ie.releases, 11),
  safari: filterVersions(bcd.browsers.safari.releases, 9)
};

if (process.env.BROWSER) {
  browsersToTest = {[process.env.BROWSER]: browsersToTest[process.env.BROWSER]};
}

const secrets = require('./secrets.json');

const host = process.env.NODE_ENV === 'test' ?
      `http://localhost:8080` :
      'https://mdn-bcd-collector.appspot.com';

const seleniumUrl = secrets.selenium.url && secrets.selenium.url
    .replace('$USERNAME$', secrets.selenium.username)
    .replace('$ACCESSKEY$', secrets.selenium.accesskey);

const setSafariOS = (version, capabilities) => {
  // Sauce Labs differentiates 10.0 vs. 10.1 in the OS version. This
  // function sets the appropriate OS version accordingly.

  let platform;
  switch (version) {
    case '10':
      platform = "OS X 10.11";
      break;
    case '11':
      platform = "macOS 10.12";
      break;
    case '12':
      platform = "macOS 10.13";
      break;
    case '13':
      platform = "macOS 10.14";
      break;
  };

  if (platform) {
    capabilities.set(Capability.PLATFORM_NAME, platform);
  }
};

const run = async (browser, version) => {
  const capabilities = new Capabilities();
  capabilities.set(
      Capability.BROWSER_NAME,
      Browser[browser.toUpperCase()]
  );
  capabilities.set(
      'name',
      `mdn-bcd-collector: ${bcd.browsers[browser].name} ${version}`
  );

  if (browser === 'safari') setSafariOS(version, capabilities);

  const prefs = new logging.Preferences();
  prefs.setLevel(logging.Type.BROWSER, logging.Level.SEVERE);

  capabilities.set(Capability.VERSION, version);
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
    await driver.wait(until.elementTextContains(statusEl, 'upload'), 30000);
    if ((await statusEl.getText()).search('Failed') !== -1) {
      throw new Error('Results failed to upload');
    }
    await driver.findElement(By.id('submit')).click();

    await driver.wait(until.urlIs(`${host}/results`));
    statusEl = await driver.findElement(By.id('status'));
    await driver.wait(until.elementTextContains(statusEl, 'to'));
    if ((await statusEl.getText()).search('Failed') !== -1) {
      throw new Error('Pull request failed to submit');
    }
  } catch (e) {
    console.error(e);
  }

  driver.manage().logs().get(logging.Type.BROWSER)
      .then((entries) => {
        entries.forEach((entry) => {
          console.log('[Browser Logger: %s] %s', entry.level.name, entry.message);
        });
      });

  await driver.quit();
};

const runAll = async () => {
  if (!seleniumUrl) {
    console.error('A Selenium remote WebDriver URL is not defined in secrets.json.  Please define your Selenium remote.');
    return false;
  }

  // eslint-disable-next-line guard-for-in
  for (const browser in browsersToTest) {
    for (const version of browsersToTest[browser]) {
      console.log(`Running ${bcd.browsers[browser].name} ${version}...`);
      try {
        await run(browser, version);
      } catch (e) {
        console.error(e);
      }
    }
  }
  return true;
};

/* istanbul ignore if */
if (require.main === module) {
  if (runAll() === false) {
    process.exit(1);
  };
} else {
  module.exports = {
    run,
    runAll
  };
}
