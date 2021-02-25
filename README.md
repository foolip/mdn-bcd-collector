# MDN browser-compat-data collector

Data collection service for MDN's [browser-compat-data](https://github.com/mdn/browser-compat-data). Live at https://mdn-bcd-collector.appspot.com/.

Feature detection tests are generated based on machine readable data (Web IDL and CSS definitions) from web standards, with support for custom tests where needed. Results are submitted to the [mdn-bcd-results](https://github.com/foolip/mdn-bcd-results) repository.

See [DESIGN.md](./DESIGN.md) for details of how this service works.

## Setup

```sh
npm install
```

## Updating BCD using the results

Given some results and a checkout of BCD at `../browser-compat-data` and collector results in `../mdn-bcd-results`, `npm run update-bcd` can be used to update existing BCD entries.

If you have results from a browser not yet in BCD, first add the release in `../browser-compat-data/browsers/`. This is because the full version (from the `User-Agent` header) is mapped to BCD browser release as part of the processing.

Updating all data:

```sh
npm run update-bcd ../mdn-bcd-results/
```

The `--browser` argument can be used to only update data for one or more browsers:

```sh
npm run update-bcd ../mdn-bcd-results/ -- --browser=safari --browser=safari_ios
```

### Custom ranged version format

When the results don't have enough data to determine an exact version, ranges which aren't valid in BCD may be added:
- "≤N" for any release, not just the ranged versions allowed by BCD.
- "M> ≤N" when a feature is *not* in M and *is* in N, but there are releases between the two for which support is unknown.

In both cases, the uncertainty has to be resolved by hand before submitting the data to BCD.

## Running the server locally

```sh
npm run start-dev
```

(`start-dev`, as opposed to `start`, will automatically rebuild the tests and reload the server on file changes.)

## Deploying to App Engine

```sh
npm run deploy
```

This step is performed automatically when the `main` branch is updated:

- https://staging-dot-mdn-bcd-collector.appspot.com/ is always deployed.
- https://mdn-bcd-collector.appspot.com/ is deployed when the version in `package.json` is bumped

## Running tests via Selenium WebDriver

To test using the latest deployed version, run:

```sh
npm run selenium
```

In `secrets.json`, configure your Selenium remote(s) by the service name as the key, and the URL as the value (ex. `"browserstack": "https://USERNAME:KEY@hub-cloud.browserstack.com/wd/hub"`). Please check with your CT on how to configure your WebDriver URL.

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

## Cleaning up generated files

```sh
npm run clean
```
