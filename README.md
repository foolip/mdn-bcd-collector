# MDN browser-compat-data collector

Data collection service for MDN's [browser-compat-data](https://github.com/mdn/browser-compat-data). Live at https://mdn-bcd-collector.appspot.com/.

Feature detection tests are generated based on machine readable data (Web IDL and CSS definitions) from web standards, with support for custom tests where needed. Results are submitted to the [mdn-bcd-results](https://github.com/foolip/mdn-bcd-results) repository.

See [DESIGN.md](./DESIGN.md) for details of how this service works.

## Setup

```sh
npm install
```

## Running locally

```sh
npm run start-dev
```

(`start-dev`, as opposed to `start`, will automatically rebuild the tests and reload the server on file changes.)

## Deploying to App Engine

```sh
npm run deploy
```

This step is performed automatically when the `main` or `prod` branches are pushed:

- `main` deploys to https://staging-dot-mdn-bcd-collector.appspot.com/
- `prod` deploys to https://mdn-bcd-collector.appspot.com/

## Run tests via Selenium WebDriver

To test using the latest deployed version, run:

```sh
npm run selenium
```

In `secrets.json`, configure your Selenium remote(s) by the service name as the key, and the URL as the value (ex. `"browserstack": "https://USERNAME:KEY@hub-cloud.browserstack.com/wd/hub"`).  Please check with your CT on how to configure your WebDriver URL.

You can also limit the browsers to test by defining browsers as arguments:

```sh
npm run selenium chrome
npm run selenium edge ie
```

## Running the unit tests and linter

```sh
npm test
```

Code coverage reports can be viewed in a browser by running:

```sh
npm run coverage
```

## Cleanup generated files

```sh
npm run clean
```
