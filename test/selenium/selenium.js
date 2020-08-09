const {Builder, By, until} = require('selenium-webdriver');
const bcd = require('mdn-browser-compat-data');

const secrets = require('../../secrets.json');

const host = process.env.NODE_ENV === 'test' ?
      `http://localhost:8080` :
      'http://mdn-bcd-collector.appspot.com';

// TODO filter for specific releases
const browsersToTest = {
  'chrome': Object.keys(bcd.browsers.chrome.releases).filter((k) => (k >= 26)),
  'edge': Object.keys(bcd.browsers.edge.releases).filter((k) => (k >= 13)),
  'firefox': Object.keys(bcd.browsers.firefox.releases).filter((k) => (k >= 4)),
  'ie': Object.keys(bcd.browsers.ie.releases).filter((k) => (k >= 9)),
  'safari': Object.keys(bcd.browsers.safari.releases)
      .filter((k) => (k >= 8 && !k.includes('.')))
};

// eslint-disable-next-line guard-for-in
for (const browser in browsersToTest) {
  for (const version of browsersToTest[browser]) {
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
        await driver.wait(
            until.elementIsEnabled(
                await driver.findElement(By.id('start')), 'Run'
            ),
            30000
        );
        await driver.findElement(By.id('start')).click();
        await driver.wait(until.urlIs(`${host}/results/`), 30000);
        await driver.wait(
            until.elementTextContains(
                await driver.findElement(By.id('status')), 'to'
            ),
            30000
        );
      });
    });
  }
}
