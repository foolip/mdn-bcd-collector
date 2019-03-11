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

## Running the tests

    npm test
