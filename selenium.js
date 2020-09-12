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

if (!seleniumUrl) {
  console.error('A Selenium remote WebDriver URL is not defined in secrets.json.  Please define your Selenium remote.');
  process.exit(1);
}

const run = async (browser, version) => {
  const capabilities = new Capabilities();
  capabilities.set(
      Capability.BROWSER_NAME,
      Browser[browser.toUpperCase()]
  );
  capabilities.set(Capability.VERSION, version);

  const driver = new Builder().usingServer(seleniumUrl)
      .withCapabilities(capabilities).build();

  try {
    await driver.get(`${host}`);
    await driver.wait(() => {
      return driver.executeScript('return document.readyState')
          .then((readyState) => (readyState === 'complete'));
    });
    await driver.executeScript('return document.readyState');
    await driver.findElement(By.id('start')).click();
    await driver.wait(
        until.elementTextContains(
            await driver.findElement(By.id('status')), 'uploaded'
        ),
        30000
    );
    await driver.findElement(By.id('submit')).click();
    await driver.wait(
        until.elementTextContains(
            await driver.findElement(By.id('status')), 'to'
        ),
        30000
    );
  } catch (e) {
    console.error(e);
  }

  await driver.quit();
};

const runAll = async () => {
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
};

/* istanbul ignore if */
if (require.main === module) {
  runAll();
} else {
  module.exports = {
    run,
    runAll
  };
}
