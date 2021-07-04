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
const bcdBrowsers = require('@mdn/browser-compat-data').browsers;
const compareVersions = require('compare-versions');
const fetch = require('node-fetch');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const {Listr} = require('listr2');

const secrets = require('./secrets.json');

const resultsDir = path.join(__dirname, '..', 'mdn-bcd-results');

const testenv = process.env.NODE_ENV === 'test';
const host = `https://${testenv ? 'staging-dot-' : ''}mdn-bcd-collector.appspot.com`;

// Custom tests that use getUserMedia() make Edge 12-18 block.
const gumTests = [
  'ImageCapture',
  'MediaStream',
  'MediaStreamAudioSourceNode',
  'MediaStreamTrack',
  'MediaStreamTrackAudioSourceNode'
].map((iface) => `api.${iface}`);

const ignore = {
  chrome: {
    25: ['api.MediaStreamAudioDestinationNode'],
    26: ['api.MediaStreamAudioDestinationNode']
  },
  edge: {
    12: gumTests,
    13: gumTests,
    14: gumTests,
    15: gumTests,
    16: gumTests,
    17: gumTests,
    18: gumTests
  }
};

const prettyName = (browser, version, os) => {
  return `${bcdBrowsers[browser].name} ${version} on ${os}`;
};

const log = (task, message) => {
  // TODO temporary until https://github.com/SamVerschueren/listr/issues/150 fixed
  task.output = task.title + ' - ' + message;

  // eslint-disable-next-line max-len
  // task.output = new Date(Date.now()).toLocaleTimeString(undefined, {hour12: false}) + ': ' + message;
};

const filterVersions = (data, earliestVersion, reverse) => {
  const versions = [];

  for (const [version, versionData] of Object.entries(data)) {
    if ((versionData.status == 'current' || versionData.status == 'retired') &&
        compareVersions.compare(version, earliestVersion, '>=')) {
      versions.push(version);
    }
  }

  return versions.sort((a, b) => compareVersions(...(reverse ? [a, b] : [b, a])));
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
      return 'macOS 10.14';
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

      if (
        browser === 'safari' &&
        version >= 10 &&
        Math.round(version) == version
      ) {
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
                     [['OS X', 'Big Sur'], ['OS X', 'Mojave'], ['OS X', 'El Capitan']];
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

      capabilities.set(
          'name', `mdn-bcd-collector: ${prettyName(browser, version, os)}`
      );

      capabilities.set(Capability.VERSION, version.split('.')[0]);

      // Remap target OS for Safari x.0 vs. x.1 on SauceLabs
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

      // Allow mic, camera, geolocation and notifications permissions
      if (browser === 'chrome' || (browser === 'edge' && version >= 79)) {
        capabilities.set('goog:chromeOptions', {
          args: [
            '--use-fake-device-for-media-stream',
            '--use-fake-ui-for-media-stream'
          ],
          prefs: {
            'profile.managed_default_content_settings.geolocation': 1,
            'profile.managed_default_content_settings.notifications': 1
          }
        });
      } else if (browser === 'firefox') {
        // XXX macOS Big Sur requires microphone permission via the OS...
        // BrowserStack bug?
        capabilities.set('moz:firefoxOptions', {
          prefs: {
            'media.navigator.permission.disabled': 1,
            'permissions.default.microphone': 1,
            'permissions.default.camera': 1,
            'permissions.default.geo': 1,
            'permissions.default.desktop-notification': 1
          }
        });
      }

      // Get console errors from browser
      const loggingPrefs = new logging.Preferences();
      loggingPrefs.setLevel(logging.Type.BROWSER, logging.Level.SEVERE);
      capabilities.setLoggingPrefs(loggingPrefs);
      if (service === 'browserstack') {
        capabilities.set('browserstack.console', 'errors');
      }

      try {
        // Build Selenium driver
        const driverBuilder = new Builder().usingServer(seleniumUrl)
            .withCapabilities(capabilities);
        const driver = await driverBuilder.build();

        return driver;
      } catch (e) {
        if (e.message.startsWith('Misconfigured -- Unsupported OS/browser/version/device combo') ||
            e.message.startsWith('OS/Browser combination invalid') ||
            e.message.startsWith('Browser/Browser_Version not supported')) {
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
  }, 30000);
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

  if (browser === 'edge' && version <= 18) {
    page = page.replace(/,/g, '%2C');
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

const run = async (browser, version, os, ctx, task) => {
  log(task, 'Starting...');

  const driver = await buildDriver(browser, version, os);
  if (!driver) {
    throw new Error(task.title + ' - ' + 'Browser/OS config unsupported');
  }

  let statusEl;

  const ignorelist = ignore[browser] && ignore[browser][version];
  const getvars = `?selenium=true${ignorelist ? `&ignore=${ignorelist.join(',')}` : ''}`;

  try {
    log(task, 'Loading homepage...');
    await goToPage(driver, browser, version, `${host}/${getvars}`);
    await click(driver, browser, 'start');

    log(task, 'Loading test page...');
    await awaitPage(driver, browser, version, `${host}/tests/${getvars}`);

    log(task, 'Running tests...');
    await driver.wait(until.elementLocated(By.id('status')), 30000);
    statusEl = await driver.findElement(By.id('status'));
    try {
      await driver.wait(until.elementTextContains(statusEl, 'upload'), 60000);
    } catch (e) {
      if (e.name == 'TimeoutError') {
        throw new Error(task.title + ' - ' + 'Timed out waiting for results to upload');
      }

      throw e;
    }

    const statusText = await statusEl.getText();

    if (statusText.includes('Failed')) {
      throw new Error(task.title + ' - ' + statusText);
    }

    log(task, 'Exporting results...');
    await goToPage(driver, browser, version, `${host}/export`);
    const downloadEl = await driver.findElement(By.id('download'));
    const downloadUrl = await downloadEl.getAttribute('href');

    if (!ctx.testenv) {
      const filename = path.basename(new URL(downloadUrl).pathname);
      log(task, `Downloading ${filename} ...`);
      const report = await (await fetch(downloadUrl)).buffer();
      await fs.writeFile(path.join(resultsDir, filename), report);
    }
  } finally {
    driver.quit().catch(() => {});
  }
};

const runAll = async (limitBrowsers, oses, nonConcurrent, reverse) => {
  if (!Object.keys(secrets.selenium).length) {
    console.error(chalk`{red.bold A Selenium remote WebDriver URL is not defined in secrets.json.  Please define your Selenium remote(s).}`);
    return false;
  }

  if (testenv) {
    console.warn(chalk`{yellow.bold Test mode: results are not saved.}`);
  }

  let browsersToTest = {
    chrome: filterVersions(bcdBrowsers.chrome.releases, '15', reverse),
    edge: filterVersions(bcdBrowsers.edge.releases, '12', reverse),
    firefox: filterVersions(bcdBrowsers.firefox.releases, '4', reverse),
    ie: filterVersions(bcdBrowsers.ie.releases, '6', reverse),
    safari: filterVersions(bcdBrowsers.safari.releases, '5.1', reverse)
  };

  if (limitBrowsers) {
    browsersToTest = Object.fromEntries(Object.entries(browsersToTest)
        .filter(([k]) => (limitBrowsers.includes(k))));
  }

  const tasks = [];

  // eslint-disable-next-line guard-for-in
  for (const browser in browsersToTest) {
    const browsertasks = [];

    for (const version of browsersToTest[browser]) {
      for (const os of oses) {
        if (os === 'macOS' && ['edge', 'ie'].includes(browser) && version <= 18) {
          // Don't test Internet Explorer / EdgeHTML on macOS
          continue;
        }

        if (os === 'Windows' && browser === 'safari') {
          // Don't test Safari on Windows
          continue;
        }

        browsertasks.push({
          title: prettyName(browser, version, os),
          task: (ctx, task) => run(browser, version, os, ctx, task)
        });
      }
    }

    tasks.push({
      title: bcdBrowsers[browser].name,
      task: () => {
        return new Listr(browsertasks, {
          concurrent: nonConcurrent ? false : 5, exitOnError: false
        });
      }
    });
  }

  // TODO remove verbose when https://github.com/SamVerschueren/listr/issues/150 fixed
  const taskrun = new Listr(tasks, {exitOnError: false, renderer: 'verbose',
    rendererOptions: {
      collapseSkips: false, collapseErrors: false
    }
  });

  try {
    await taskrun.run({testenv});
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
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
            })
            .option('non-concurrent', {
              describe: 'Run browsers sequentially (one at a time)',
              alias: 's',
              type: 'boolean',
              nargs: 0
            })
            .option('reverse', {
              describe: 'Run browser versions oldest-to-newest',
              alias: 'r',
              type: 'boolean',
              nargs: 0
            });
      }
  );

  if (runAll(argv.browser, argv.os, argv.nonConcurrent, argv.reverse) === false) {
    process.exit(1);
  }
}
