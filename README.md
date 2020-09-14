# MDN browser-compat-data collector

Data collection service for MDN's [browser-compat-data](https://github.com/mdn/browser-compat-data). Live at https://mdn-bcd-collector.appspot.com/.

Feature detection tests are generated based on machine readable data (Web IDL and CSS definitions) from web standards, with support for custom tests where needed. Results are submitted to the [mdn-bcd-results](https://github.com/foolip/mdn-bcd-results) repository.

See [DESIGN.md](./DESIGN.md) for details of how this service works.

## Setup

```sh
npm install
npm run build
```

Before you can run or deploy, copy `secrets.sample.json` to `secrets.json`.

(The tests can be run without a `secrets.json`.)

## Running locally

```sh
npm run start-dev
```

(`start-dev` as opposed to `start` will automatically reload the server on file changes.)

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

You must configure your Selenium remote in `secrets.json`; local environments
are not supported.  You may use any testing service, such as SauceLabs,
BrowserStack, LambdaTest, etc. -- please check with your provider on how to
configure your WebDriver URL.

You can also test just a single browser by defining the `BROWSER` environment variable:

```sh
BROWSER=chrome npm run selenium
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
