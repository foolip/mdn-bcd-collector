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
  let versions = [];

  for (const [version, versionData] of Object.entries(data)) {
    if (
      (versionData.status == 'current' || versionData.status == 'retired') &&
      version >= earliestVersion
    ) {
      versions += version;
    }
  }

  return versions;
};

// TODO: define target browsers
let browsersToTest = {
  'chrome': filterVersions(bcd.browsers.chrome.releases, 26),
  'edge': filterVersions(bcd.browsers.edge.releases, 13),
  'firefox': filterVersions(bcd.browsers.firefox.releases, 4),
  'ie': filterVersions(bcd.browsers.ie.releases, 9),
  'safari': filterVersions(bcd.browsers.safari.releases, 8)
};

if (process.env.BROWSER) {
  browsersToTest = {[process.env.BROWSER]: browsersToTest[process.env.BROWSER]};
}

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
      this.timeout(60000);
      this.slow(30000);
      let driver;

      beforeEach(function() {
        const capabilities = new Capabilities();
        capabilities.set(
            Capability.BROWSER_NAME,
            Browser[browser.toUpperCase()]
        );
        capabilities.set(Capability.VERSION, version);

        driver = new Builder().usingServer(seleniumUrl)
            .withCapabilities(capabilities).build();
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
        await driver.wait(until.urlIs(`${host}/results/`), 60000);
        await driver.wait(
            until.elementTextContains(
                await driver.findElement(By.id('status')), 'to'
            ),
            15000
        );
      });
    });
  }
}
