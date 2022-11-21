//
// mdn-bcd-collector: selenium.js
// Script to collect results from various browsers using Selenium webdriver
//
// © Gooborg Studios, Google LLC
// See the LICENSE file for copyright details
//

import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  Browser,
  Builder,
  By,
  Capabilities,
  Capability,
  logging,
  until
} from 'selenium-webdriver';
import bcd from '@mdn/browser-compat-data' assert {type: 'json'};
import type {ReleaseStatement} from '@mdn/browser-compat-data';
const bcdBrowsers = bcd.browsers;
import {
  compare as compareVersions,
  compareVersions as compareVersionsSort
} from 'compare-versions';
import fetch from 'node-fetch';
import esMain from 'es-main';
import fs from 'fs-extra';
import chalk from 'chalk-template';
import {Listr, ListrTask} from 'listr2';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

import './selenium-keepalive.js';

const secrets = await fs.readJson(new URL('./secrets.json', import.meta.url));

const resultsDir = fileURLToPath(
  new URL('../mdn-bcd-results', import.meta.url)
);

const testenv = process.env.NODE_ENV === 'test';
const host = `https://${
  testenv ? 'staging-dot-' : ''
}mdn-bcd-collector.gooborg.com`;

const seleniumUrls = {
  browserstack: 'https://${username}:${key}@hub-cloud.browserstack.com/wd/hub',
  saucelabs:
    'https://${username}:${key}@ondemand.${region}.saucelabs.com:443/wd/hub',
  lambdatest: 'https://${username}:${key}@hub.lambdatest.com/wd/hub'
};

// Custom tests that use getUserMedia() make Edge 12-18 and Firefox 34-53 block.
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
    15: ['api.SecurityPolicyViolationEvent', ...gumTests],
    16: gumTests,
    17: gumTests,
    18: gumTests
  },
  firefox: {
    34: gumTests,
    35: gumTests,
    36: gumTests,
    37: gumTests,
    38: gumTests,
    39: gumTests,
    40: gumTests,
    41: gumTests,
    42: gumTests,
    43: gumTests,
    44: gumTests,
    45: gumTests,
    46: gumTests,
    47: gumTests,
    48: gumTests,
    49: gumTests,
    50: gumTests,
    51: gumTests,
    52: gumTests
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

const filterVersions = (
  data: {[version: string]: ReleaseStatement},
  earliestVersion,
  reverse
) => {
  const versions: string[] = [];

  for (const [version, versionData] of Object.entries(data)) {
    if (
      (versionData.status == 'current' || versionData.status == 'retired') &&
      compareVersions(version, earliestVersion, '>=')
    ) {
      versions.push(version);
    }
  }

  return versions.sort((a, b) =>
    reverse ? compareVersionsSort(a, b) : compareVersionsSort(b, a)
  );
};

const getBrowsersToTest = (limitBrowsers, limitVersion, reverse) => {
  let browsersToTest: {[browser: string]: string[]} = {
    chrome: filterVersions(bcdBrowsers.chrome.releases, '15', reverse),
    edge: filterVersions(bcdBrowsers.edge.releases, '12', reverse),
    firefox: filterVersions(bcdBrowsers.firefox.releases, '4', reverse),
    ie: filterVersions(bcdBrowsers.ie.releases, '6', reverse),
    safari: filterVersions(bcdBrowsers.safari.releases, '5.1', reverse)
  };

  if (limitBrowsers) {
    browsersToTest = Object.fromEntries(
      Object.entries(browsersToTest).filter(([k]) => limitBrowsers.includes(k))
    );
  }

  if (limitVersion) {
    for (const browser of Object.keys(browsersToTest)) {
      browsersToTest[browser] = browsersToTest[browser].filter(
        (v) => v == limitVersion
      );
    }
  }

  return browsersToTest;
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

const getOsesToTest = (service, os) => {
  let osesToTest: [string, string][] = [];

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
      osesToTest =
        service === 'saucelabs'
          ? [['macOS', '10.14']]
          : service === 'lambdatest'
          ? [
              ['macOS', 'Monterey'],
              ['macOS', 'Big Sur'],
              ['macOS', 'Mojave'],
              ['OS X', 'El Capitan']
            ]
          : [
              ['OS X', 'Monterey'],
              ['OS X', 'Big Sur'],
              ['OS X', 'Mojave'],
              ['OS X', 'El Capitan']
            ];
      break;
    default:
      throw new Error(`Unknown/unsupported OS: ${os}`);
  }

  return osesToTest;
};

const getSeleniumUrl = (service, credentials) => {
  // If credentials object is just a string, treat it as the URL
  if (typeof credentials === 'string') {
    return credentials;
  }

  if (!(service in seleniumUrls)) {
    if ('url' in credentials) {
      seleniumUrls[service] = credentials.url;
    } else {
      throw new Error(
        `Couldn't compile Selenium URL for ${service}: service is unknown and URL not specified`
      );
    }
  }

  const re = /\${([^}]+)?}/g;
  const missingVars: string[] = [];

  // Replace variables in pre-defined Selenium URLs
  const seleniumUrl = seleniumUrls[service].replace(re, ($1, $2) => {
    if ($2 in credentials) {
      return credentials[$2];
    }
    missingVars.push($2);
    return $1;
  });

  // Check for any unfilled variables
  if (missingVars.length) {
    throw new Error(
      `Couldn't compile Selenium URL for ${service}: missing required variables: ${missingVars.join(
        ', '
      )}`
    );
  }

  return seleniumUrl;
};

const buildDriver = async (browser, version, os) => {
  for (const [service, credentials] of Object.entries(secrets.selenium)) {
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

    // eslint-disable-next-line guard-for-in
    for (const [osName, osVersion] of getOsesToTest(service, os)) {
      const capabilities = new Capabilities();

      // Set test name
      capabilities.set(
        'name',
        `mdn-bcd-collector: ${prettyName(browser, version, os)}`
      );
      if (service === 'saucelabs') {
        capabilities.set('sauce:options', {
          name: `mdn-bcd-collector: ${prettyName(browser, version, os)}`
        });
      }

      capabilities.set(Capability.BROWSER_NAME, Browser[browser.toUpperCase()]);
      capabilities.set(Capability.BROWSER_VERSION, version.split('.')[0]);

      // Remap target OS for Safari x.0 vs. x.1 on SauceLabs
      if (service === 'saucelabs') {
        if (browser === 'safari') {
          capabilities.set('platformName', getSafariOS(version));
        } else {
          capabilities.set('platformName', `${osName} ${osVersion}`);
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
        let firefoxPrefs: {[pref: string]: any} = {
          'media.navigator.streams.fake': true
        };
        if (version >= 53) {
          firefoxPrefs = {
            ...firefoxPrefs,
            'media.navigator.permission.disabled': 1,
            'permissions.default.camera': 1,
            'permissions.default.microphone': 1,
            'permissions.default.geo': 1
          };
        }
        if (version >= 54) {
          firefoxPrefs['permissions.default.desktop-notification'] = 1;
        }

        capabilities.set('moz:firefoxOptions', {
          prefs: firefoxPrefs
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
        const seleniumUrl = getSeleniumUrl(service, credentials);

        // Build Selenium driver
        const driverBuilder = new Builder()
          .usingServer(seleniumUrl)
          .withCapabilities(capabilities);
        const driver = await driverBuilder.build();

        return {driver, service, osName, osVersion};
      } catch (e) {
        const messages = [
          'Misconfigured -- Unsupported',
          'OS/Browser combination invalid',
          'Browser/Browser_Version not supported',
          'The Browser/Os combination is not supported',
          "Couldn't compile Selenium URL",
          'Unsupported platform'
        ];
        if (messages.some((m) => (e as Error).message.includes(m))) {
          // If unsupported config, continue to the next grid configuration
          continue;
        } else {
          throw e;
        }
      }
    }
  }

  return {driver: undefined};
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

  if (
    (browser === 'edge' && version <= 18) ||
    (browser === 'firefox' && version <= 52)
  ) {
    page = page.replace(/,/g, '%2C');
  }

  if (useHttp) {
    return page.replace('https://', 'http://');
  }

  return page;
};

const awaitPageReady = async (driver) => {
  await driver.wait(() => {
    return driver
      .executeScript('return document.readyState')
      .then((readyState) => readyState === 'complete');
  }, 30000);
  await driver.executeScript('return document.readyState');
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
    await driver.executeScript(
      `document.getElementById('${elementId}').click()`
    );
  } else {
    await driver.findElement(By.id(elementId)).click();
  }
};

const run = async (browser, version, os, ctx, task) => {
  log(task, 'Starting...');

  const {driver, ...service} = await buildDriver(browser, version, os);

  if (!driver) {
    throw new Error(task.title + ' - ' + 'Browser/OS config unsupported');
  }

  log(
    task,
    `Selected ${service.service} on ${service.osName} ${service.osVersion}`
  );

  let statusEl;

  const ignorelist = ignore[browser] && ignore[browser][version];
  const getvars = `?selenium=true${
    ignorelist ? `&ignore=${ignorelist.join(',')}` : ''
  }`;

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
      if ((e as Error).name == 'TimeoutError') {
        throw new Error(
          task.title + ' - ' + 'Timed out waiting for results to upload'
        );
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

const runAll = async (
  limitBrowsers,
  limitVersion,
  oses,
  concurrent,
  reverse
) => {
  if (!Object.keys(secrets.selenium).length) {
    console.error(
      chalk`{red.bold A Selenium remote WebDriver URL is not defined in secrets.json.  Please define your Selenium remote(s).}`
    );
    return false;
  }

  if (testenv) {
    console.warn(chalk`{yellow.bold Test mode: results are not saved.}`);
  }

  const browsersToTest = getBrowsersToTest(
    limitBrowsers,
    limitVersion,
    reverse
  );
  const tasks: ListrTask[] = [];

  // eslint-disable-next-line guard-for-in
  for (const browser in browsersToTest) {
    const browsertasks: ListrTask[] = [];

    for (const version of browsersToTest[browser]) {
      for (const os of oses) {
        if (
          os === 'macOS' &&
          ['edge', 'ie'].includes(browser) &&
          version <= '18'
        ) {
          // Don't test Internet Explorer / EdgeHTML on macOS
          continue;
        }

        if (os === 'Windows' && browser === 'safari') {
          // Don't test Safari on Windows
          continue;
        }

        browsertasks.push({
          title: prettyName(browser, version, os),
          task: (ctx, task) => run(browser, version, os, ctx, task),
          retry: 3
        });
      }
    }

    tasks.push({
      title: bcdBrowsers[browser].name,
      task: () =>
        new Listr(browsertasks, {
          concurrent,
          exitOnError: false
        })
    });
  }

  // TODO remove verbose when https://github.com/SamVerschueren/listr/issues/150 fixed
  const taskrun = new Listr(tasks, {
    exitOnError: false,
    renderer: 'verbose',
    rendererOptions: {
      collapseSkips: false,
      collapseErrors: false
    } as any
  });

  await taskrun.run({testenv});
};

if (esMain(import.meta)) {
  const {argv}: {argv: any} = yargs(hideBin(process.argv)).command(
    '$0 [browser..]',
    'Run Selenium on several browser versions',
    (yargs) => {
      (yargs as any)
        .positional('browser', {
          describe: 'Limit the browser(s) to test',
          alias: 'b',
          type: 'string',
          choices: ['chrome', 'edge', 'firefox', 'ie', 'safari']
        })
        .option('browser-version', {
          describe:
            'The specific browser version to test (useful for testing purposes)',
          alias: 'e',
          type: 'string',
          nargs: 1
        })
        .option('os', {
          describe: 'Specify OS to test',
          alias: 's',
          type: 'array',
          choices: ['Windows', 'macOS'],
          default: ['Windows', 'macOS']
        })
        .option('concurrent', {
          describe: 'Define the number of concurrent jobs to run',
          alias: 'j',
          type: 'integer',
          nargs: 1,
          default: 5
        })
        .option('reverse', {
          describe: 'Run browser versions oldest-to-newest',
          alias: 'r',
          type: 'boolean',
          nargs: 0
        });
    }
  );

  await runAll(
    argv.browser,
    argv.browserVersion,
    argv.os,
    argv.concurrent,
    argv.reverse
  );
}
