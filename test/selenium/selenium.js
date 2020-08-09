const { Builder, By, Key, until } = require('selenium-webdriver');
const assert = require('assert');

const secrets = require('../../secrets.json');

const host = process.env.NODE_ENV === 'test' ?
      `http://localhost:8080` :
      'http://mdn-bcd-collector.appspot.com';

const browsersToTest = {
  'chrome': [undefined]
};

describe('selenium', function() {
  this.timeout(30000);
  this.slow(15000);
  let driverBuilder, vars;

  const run = async (driver) => {
    await driver.get(host);
    await driver.wait(until.elementIsEnabled(await driver.findElement(By.id("start")), 'Run'), 30000);
    await driver.findElement(By.id("start")).click();
    await driver.wait(until.urlIs(`${host}/results/`), 30000);
    await driver.wait(until.elementTextContains(await driver.findElement(By.id("status")), 'to'), 30000);
    await driver.quit();
  }

  beforeEach(async function() {
    driverBuilder = await new Builder().usingServer(
      `https://${secrets.saucelabs.username}:${secrets.saucelabs.access_key}@ondemand.us-west-1.saucelabs.com:443/wd/hub`
      );
    vars = {};
  })

  for (const browser in browsersToTest) {
    for (const version of browsersToTest[browser]) {
      it(`${browser} ${version}`, async function() {
        run(driverBuilder.forBrowser(browser, version).build());
      });
    }
  };
})
