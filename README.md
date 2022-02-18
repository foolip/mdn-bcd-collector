# MDN browser-compat-data collector

Data collection service for MDN's [browser-compat-data](https://github.com/mdn/browser-compat-data). Live at https://mdn-bcd-collector.appspot.com/.

Feature detection tests are generated based on machine readable data (Web IDL and CSS definitions) from web standards, with support for custom tests where needed. Results are submitted to the [mdn-bcd-results](https://github.com/foolip/mdn-bcd-results) repository.

See [DESIGN.md](./DESIGN.md) for details of how this service works.

## Setup

This project requires Node.js 16 or greater.

This project uses `yarn` (Classic/v1) as its package manager. Please check out the [`yarn` installation guide](https://classic.yarnpkg.com/en/docs/install) if you have not already configured it.

```sh
yarn
```

## Updating BCD using the results

Given a checkout of [BCD](https://github.com/mdn/browser-compat-data) at `../browser-compat-data` and a checkout of [collector results](https://github.com/foolip/mdn-bcd-results) at `../mdn-bcd-results`, `yarn update-bcd` can be used to update existing BCD entries.

If you have results from a browser not yet in BCD, first add the release in `../browser-compat-data/browsers/`. This is because the full version (from the `User-Agent` header) is mapped to BCD browser release as part of the processing.

Updating all data:

```sh
yarn update-bcd
```

Updating a specific entry, e.g., the `appendChild()` method on `Node`:

```sh
yarn update-bcd -- --path=api.Node.appendChild
```

Updating paths matched with wildcards, e.g., everything related to WebRTC:

```sh
yarn update-bcd -- --path=api.RTC*
```

The `--browser` argument can be used to only update data for one or more browsers:

```sh
yarn update-bcd -- --browser=safari --browser=safari_ios
```

The `--release` arguments can be used to only update data for a specific browser release, e.g., Firefox 84:

```sh
yarn update-bcd -- --browser=firefox --release=84
```

This will only make changes that set either `version_added` or `version_removed` to "84".

### Custom ranged version format

When the results don't have enough data to determine an exact version, ranges which aren't valid in BCD may be added:

- "≤N" for any release, not just the ranged versions allowed by BCD.
- "M> ≤N" when a feature is _not_ in M and _is_ in N, but there are releases between the two for which support is unknown.

In both cases, the uncertainty has to be resolved by hand before submitting the data to BCD.

## Reviewing BCD changes

When reviewing [BCD pull requests](https://github.com/mdn/browser-compat-data/pulls) created using mdn-bcd-collector, it helps to have a high-level understanding of how it works and what kinds of errors are common.

Basically, feature tests are run on multiple versions of the same browser and support ranges are inferred. A test could be as simple as `'fetch' in window`. If that test returns false in Chrome 1-41 and returns true in Chrome 42 and later, `{ "version_added": 42 }` will be inferred.

These errors are worth looking out for:

- False negatives, where a test fails to detect support. This results in either an incorrect `false` or support actually going back further than inferred. Common causes are:

  - Missing [interface objects](https://webidl.spec.whatwg.org/#interface-object). For example, `crypto.subtle` was shipped long before the `SubtleCrypto` interface was [exposed](https://webkit.org/b/165629) in some browsers. Missing interface objects was common in the past, especially for events, but is quite _uncommon_ for APIs introduced after ~2020. See [#7963](https://github.com/mdn/browser-compat-data/pull/7963), [#7986](https://github.com/mdn/browser-compat-data/pull/7986) and [#10837](https://github.com/mdn/browser-compat-data/pull/10837) for examples.
  - [Attributes](https://webidl.spec.whatwg.org/#es-attributes) weren't on the prototypes in some older browsers, for example [before Chrome 43](https://github.com/mdn/browser-compat-data/issues/7843). See [#6568](https://github.com/mdn/browser-compat-data/pull/6568#discussion_r479039982) for an example.

  To guard against this, follow the link to the test and expand the code. A simple `'propertyName' in InterfaceName` test can yield false negatives, so an _instance_ of the type should be created and tested using the [custom tests](https://github.com/foolip/mdn-bcd-collector/blob/main/custom-tests.yaml) mechanism. Ask for this when reviewing, you don't need to create the tests yourself.

- Consistency with other parts of the same feature. Does it seem plausible that the feature was introduced earlier or later than other parts? Examples of consistency to look for:

  - Support for `navigator.gpu` implies support for the `GPU` interface, because `navigator.gpu` is an instance of that interface.
  - Support for `audioContext.createPanner()` implies support for `PannerNode`, because that is the return type.
  - Support for `AnalyserNode` implies support for `AudioNode`, because `AnalyserNode` inherits from `AudioNode`.

  Examples of consistency checks in review are [#10397](https://github.com/mdn/browser-compat-data/pull/10397), [#12028](https://github.com/mdn/browser-compat-data/pull/12028) and [#12033](https://github.com/mdn/browser-compat-data/pull/12033). [#6571](https://github.com/mdn/browser-compat-data/issues/6571) proposes automating many such consistency checks.

## Running the server locally

```sh
yarn start-dev
```

(`start-dev`, as opposed to `start`, will automatically rebuild the tests and reload the server on file changes.)

To also handle HTTPS traffic, use the `--https-cert` and `--https-key` arguments:

```sh
yarn start -- --https-cert=my-cert.pem --https-key=my-cert.key
```

Test certificates and instructions for generating certificates can be found in [web-platform-tests](https://github.com/web-platform-tests/wpt/tree/master/tools/certs).

## Deploying to App Engine

```sh
yarn deploy
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
yarn selenium
```

You can also limit the browsers to test by defining browsers as arguments:

```sh
yarn selenium chrome
yarn selenium edge ie
```

## Running the unit tests and linter

```sh
yarn test
```

Code coverage reports can be viewed in a browser by running:

```sh
yarn coverage
```

## Cleaning up generated files

```sh
yarn clean
```

## Release process

To create a release, run the following command:

```sh
yarn release
```
