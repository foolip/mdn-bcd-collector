# MDN browser-compat-data collector

This service is part of an effort to
[assist BCD updates with automation](https://github.com/mdn/browser-compat-data/issues/3308),
and exists to run lots of small tests in browsers to determine the support
status of a feature in a browser, and export those results to the
[mdn-bcd-results](https://github.com/foolip/mdn-bcd-results) repository.

See [DESIGN.md](./DESIGN.md) for details of how this service works.

## Setup

    npm install
    npm run build

Before you can run or deploy, copy `secrets.sample.json` to `secrets.json`.

(The tests can be run without a `secrets.json`.)

## Running locally

    npm start

## Deploying to App Engine

    npm run deploy

(This is performed automatically when a commit is pushed to `main`.)

## Run tests via Selenium WebDriver

To test using the latest deployed version, run:

    npm run selenium

You must configure your Selenium remote in `secrets.json`; local environments
are not supported.  You may use any testing service, such as SauceLabs,
BrowserStack, LambdaTest, etc. -- please check with your provider on how to
configure your WebDriver URL.

You can also test just a single browser by defining the `BROWSER` environment variable:

    BROWSER=chrome npm run selenium

## Running the unit tests and linter

    npm test
