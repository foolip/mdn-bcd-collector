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
const path = require('path');
const zlib = require('zlib');
const chalk = require('chalk');
const Listr = require('listr');
const stringify = require('json-stable-stringify');

// TODO temporary until https://github.com/SamVerschueren/listr/issues/150 fixed
const ListrRenderer = require('listr-verbose-renderer');

const github = require('./github')();
const secrets = require('./secrets.json');

const resultsDir = path.join(__dirname, '..', 'mdn-bcd-results');

const testenv = process.env.NODE_ENV === 'test';
const host = `https://${testenv ? 'staging-dot-' : ''}mdn-bcd-collector.appspot.com`;

const ignore = {
  chrome: {
    25: 'api.MediaStreamAudioDestinationNode',
    26: 'api.MediaStreamAudioDestinationNode'
  }
};

const prettyName = (browser, version, os) => {
  return `${bcd.browsers[browser].name} ${version} on ${os}`;
};

const log = (task, message) => {
  // TODO temporary until https://github.com/SamVerschueren/listr/issues/150 fixed
  task.output = task.output = task.title + ' - ' + message;

  // eslint-disable-next-line max-len
  // task.output = new Date(Date.now()).toLocaleTimeString(undefined, {hour12: false}) + ': ' + message;
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

  return versions.sort((a, b) => (b - a));
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

      if (
        service === 'browserstack' &&
        browser === 'safari' &&
        version === '6.1'
      ) {
        capabilities.set(Capability.VERSION, '6.2');
      } else {
        capabilities.set(Capability.VERSION, version.split('.')[0]);
      }

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

      capabilities.set(
          'name', `mdn-bcd-collector: ${prettyName(browser, version, os)}`
      );

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

const run = async (browser, version, os, ctx, task) => {
  log(task, 'Starting...');

  const driver = await buildDriver(browser, version, os);
  if (!driver) {
    throw new Error('Browser/OS config unsupported');
  }

  let statusEl;

  const ignorelist = ignore[browser] && ignore[browser][version];
  const getvars = `?selenium=true${ignorelist ? `&ignore=${ignorelist}` : ''}`;

  try {
    log(task, 'Loading homepage...');
    await goToPage(driver, browser, version, `${host}/${getvars}`);
    await click(driver, browser, 'start');

    log(task, 'Running tests...');
    await awaitPage(driver, browser, version, `${host}/tests/${getvars}`);

    await driver.wait(until.elementLocated(By.id('status')), 5000);
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
      log(task, 'Attempting to download results...');
      if (browser === 'chrome' || browser === 'firefox' ||
        (browser === 'edge' && version >= 79)) {
        await goToPage(driver, browser, version, `view-source:${host}/api/results`);
      } else {
        await goToPage(driver, browser, version, `${host}/api/results`);
      }
      const reportBody = await driver.wait(until.elementLocated(By.css('body')), 10000);
      const reportString = await reportBody.getAttribute('textContent');
      log(task, 'Saving results...');

      if (!ctx.testenv) {
        const report = JSON.parse(reportString);
        const {filename} = github.getReportMeta(report);
        const filedata = zlib.gzipSync(stringify(report));
        await fs.writeFile(path.join(resultsDir, filename), filedata);
      }
    } catch (e) {
      // If we can't download the results, fallback to GitHub
      log(task, 'Uploading results to GitHub...');
      await goToPage(driver, browser, version, `${host}/export${ctx.testenv ? '?mock=true' : ''}`);
      statusEl = await driver.findElement(By.id('status'));
      await driver.wait(until.elementTextContains(statusEl, 'to'));

      if ((await statusEl.getText()).search('Failed') !== -1) {
        throw new Error('Pull request failed to submit');
      }

      // warn('Exported to GitHub');
    }
  } finally {
    driver.quit().catch(() => {});
  }
};

const runAll = async (limitBrowsers, oses, nonConcurrent) => {
  if (!Object.keys(secrets.selenium).length) {
    console.error(chalk`{red.bold A Selenium remote WebDriver URL is not defined in secrets.json.  Please define your Selenium remote(s).}`);
    return false;
  }

  if (testenv) {
    console.warn(chalk`{yellow.bold Test mode: results are not saved.}`);
  }

  let browsersToTest = {
    chrome: filterVersions(bcd.browsers.chrome.releases, 15),
    edge: filterVersions(bcd.browsers.edge.releases, 12),
    firefox: filterVersions(bcd.browsers.firefox.releases, 4),
    ie: filterVersions(bcd.browsers.ie.releases, 6),
    safari: filterVersions(bcd.browsers.safari.releases, 4)
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
      title: bcd.browsers[browser].name,
      task: () => {
        return new Listr(browsertasks, {
          concurrent: nonConcurrent ? false : 5, exitOnError: false
        });
      }
    });
  }

  const taskrun = new Listr(tasks, {
    renderer: ListrRenderer, exitOnError: false
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
            });
      }
  );

  if (runAll(argv.browser, argv.os, argv.nonConcurrent) === false) {
    process.exit(1);
  }
}
