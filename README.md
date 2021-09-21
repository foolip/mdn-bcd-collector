# MDN browser-compat-data collector

Data collection service for MDN's [browser-compat-data](https://github.com/mdn/browser-compat-data). Live at https://mdn-bcd-collector.appspot.com/.

Feature detection tests are generated based on machine readable data (Web IDL and CSS definitions) from web standards, with support for custom tests where needed. Results are submitted to the [mdn-bcd-results](https://github.com/foolip/mdn-bcd-results) repository.

See [DESIGN.md](./DESIGN.md) for details of how this service works.

## Setup

```sh
npm install
```

## Updating BCD using the results

Given a checkout of [BCD](https://github.com/mdn/browser-compat-data) at `../browser-compat-data` and a checkout of [collector results](https://github.com/foolip/mdn-bcd-results) at `../mdn-bcd-results`, `npm run update-bcd` can be used to update existing BCD entries.

If you have results from a browser not yet in BCD, first add the release in `../browser-compat-data/browsers/`. This is because the full version (from the `User-Agent` header) is mapped to BCD browser release as part of the processing.

Updating all data:

```sh
npm run update-bcd
```

Updating a specific entry, e.g., the `appendChild()` method on `Node`:

```sh
npm run update-bcd -- --path=api.Node.appendChild
```

Updating paths matched with wildcards, e.g., everything related to WebRTC:

```sh
npm run update-bcd -- --path=api.RTC*
```

The `--browser` argument can be used to only update data for one or more browsers:

```sh
npm run update-bcd -- --browser=safari --browser=safari_ios
```

The `--release` arguments can be used to only update data for a specific browser release, e.g., Firefox 84:

```sh
npm run update-bcd -- --browser=firefox --release=84
```

This will only make changes that set either `version_added` or `version_removed` to "84".

### Custom ranged version format

When the results don't have enough data to determine an exact version, ranges which aren't valid in BCD may be added:

- "≤N" for any release, not just the ranged versions allowed by BCD.
- "M> ≤N" when a feature is _not_ in M and _is_ in N, but there are releases between the two for which support is unknown.

In both cases, the uncertainty has to be resolved by hand before submitting the data to BCD.

## Running the server locally

```sh
npm run start-dev
```

(`start-dev`, as opposed to `start`, will automatically rebuild the tests and reload the server on file changes.)

To also handle HTTPS traffic, use the `--https-cert` and `--https-key` arguments:

```sh
npm start -- --https-cert=my-cert.pem --https-key=my-cert.key
```

Test certificates and instructions for generating certificates can be found in [web-platform-tests](https://github.com/web-platform-tests/wpt/tree/master/tools/certs).

## Deploying to App Engine

```sh
npm run deploy
```

This step is performed automatically when the `main` branch is updated:

- https://staging-dot-mdn-bcd-collector.appspot.com/ is always deployed.
- https://mdn-bcd-collector.appspot.com/ is deployed when the version in `package.json` is bumped

## Running tests via Selenium WebDriver

A script has been provided which will collect all of the results for nearly all of the browsers, using the Selenium WebDriver to control your CTs, and download them to your computer (which can then be submitted as a PR). To run this script, you'll need a few prerequisites:

- A clone of [mdn-bcd-results](https://github.com/foolip/mdn-bcd-results) adjacent to this folder's repository (or at least a folder at `../mdn-bcd-results`)
- At least one Selenium remote (ex. BrowserStack, SauceLabs, etc.)

### Define Selenium Hosts

In `secrets.json`, you'll need to add your Selenium remote(s). In the `selenium` object, define your remote(s) by setting the key as the service name (ex. "browserstack", "saucelabs", "lambdatest", "custom", etc.) and the value as either an object containing the username and key for known remotes, or simply a string of the remote URL. Your `secrets.json` should look something like this:

```json
{
  "github": {...},
  "selenium": {
    "browserstack": {
      "username": "example",
      "key": "some-API-key-goes-here"
    },
    "saucelabs": {
      "username": "example",
      "key": "some-API-key-goes-here",
      "region": "us-west-1"
    },
    "custom": "https://my.example.page.org/selenium/wd"
  }
}
```

Currently, the Selenium hosts known to the script are:

- BrowserStack - requires `username` and `key`
- SauceLabs - requires `username`, `key`, and `region`

You may use other Selenium hosts, but please be aware that they have not been tested and you may experience unexpected results.

### Run the script

To test using the latest deployed version, run:

```sh
npm run selenium
```

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

## Release process

These are the manual steps to release and deploy a new version on https://mdn-bcd-collector.appspot.com/:

- Check out the previously tagged commit
- Run `npm install; npm run build`
- Run `mv tests.json tests.json.orig`
- Run `git checkout -b release-x.y.z origin/main`
- Run `npm install; npm run build`
- List added tests: `comm -13 <(jq -r 'keys[]' tests.json.orig) <(jq -r 'keys[]' tests.json)`
- List removed tests: `comm -23 <(jq -r 'keys[]' tests.json.orig) <(jq -r 'keys[]' tests.json)`
- Look for test changes: `diff -u <(python3 -m json.tool tests.json.orig) <(python3 -m json.tool tests.json)`
- Bump the version in `package.json` and run `npm install` to update `package-lock.json`
- Commit the result with a commit message similar to the last release and create a pull request
- Once the pull request is merged, tag the result as `vx.y.z` and push the tag
