const {Builder, By, until} = require('selenium-webdriver');
const bcd = require('mdn-browser-compat-data');

// TODO: define target browsers
const browsersToTest = {
  'chrome': Object.keys(bcd.browsers.chrome.releases).filter((k) => (k >= 26)),
  'edge': Object.keys(bcd.browsers.edge.releases).filter((k) => (k >= 13)),
  'firefox': Object.keys(bcd.browsers.firefox.releases).filter((k) => (k >= 4)),
  'ie': Object.keys(bcd.browsers.ie.releases).filter((k) => (k >= 9)),
  'safari': Object.keys(bcd.browsers.safari.releases).filter((k) => (k >= 8))
};

const secrets = require('../../secrets.json');

const host = process.env.NODE_ENV === 'test' ?
      `http://localhost:8080` :
      'http://mdn-bcd-collector.appspot.com';

const seleniumUrl = secrets.selenium.url && secrets.selenium.url
    .replace('$USERNAME$', secrets.selenium.username)
    .replace('$ACCESSKEY$', secrets.selenium.accesskey);

if (!seleniumUrl) {
  // eslint-disable-next-line max-len
  console.error('A Selenium remote WebDriver URL is not defined in secrets.json.  Please define your Selenium remote.');
  process.exit(1);
}

// eslint-disable-next-line guard-for-in
for (const browser in browsersToTest) {
  for (const version of browsersToTest[browser]) {
    describe(`${bcd.browsers[browser].name} ${version}`, function() {
      this.timeout(30000);
      this.slow(15000);
      let driver;

      beforeEach(function() {
        driver = new Builder().usingServer(seleniumUrl)
            .forBrowser(browser, version).build();
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
