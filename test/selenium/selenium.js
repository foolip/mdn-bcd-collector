const { Builder, By, Key, until } = require('selenium-webdriver');
const assert = require('assert');
const bcd = require('mdn-browser-compat-data');

const secrets = require('../../secrets.json');

const host = process.env.NODE_ENV === 'test' ?
      `http://localhost:8080` :
      'http://mdn-bcd-collector.appspot.com';

// TODO filter for specific releases
const browsersToTest = {
  'chrome': bcd.browsers.chrome.releases,
  'edge': bcd.browsers.edge.releases,
  'firefox': bcd.browsers.firefox.releases,
  'ie': bcd.browsers.ie.releases,
  'safari': bcd.browsers.safari.releases,
};

for (const browser in browsersToTest) {
  for (const version in browsersToTest[browser]) {
    describe(`${bcd.browsers[browser].name} ${version}`, function() {
      this.timeout(30000);
      this.slow(15000);
      let driver;

      beforeEach(function() {
        driver = new Builder().usingServer(
          `https://${secrets.saucelabs.username}:${secrets.saucelabs.access_key}@ondemand.us-west-1.saucelabs.com:443/wd/hub`
          ).forBrowser(browser, version).build();
      });

      afterEach(async function() {
        await driver.quit();
      });

      it('run', async function() {
        await driver.get(host);
        await driver.wait(until.elementIsEnabled(await driver.findElement(By.id("start")), 'Run'), 30000);
        await driver.findElement(By.id("start")).click();
        await driver.wait(until.urlIs(`${host}/results/`), 30000);
        await driver.wait(until.elementTextContains(await driver.findElement(By.id("status")), 'to'), 30000);
      });
    })
  };
};
