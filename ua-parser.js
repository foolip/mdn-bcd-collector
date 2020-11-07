'use strict';

const compareVersions = require('compare-versions');
const uaParser = require('ua-parser-js');
const bcd = require('@mdn/browser-compat-data');

const getMajorMinorVersion = (version) => {
  const [major, minor] = version.split('.');
  return `${major}.${minor || 0}`;
};

const getBrowserAndVersion = (userAgent, browsers = bcd.browsers) => {
  const ua = uaParser(userAgent);

  let browser = ua.browser.name.toLowerCase();
  const os = ua.os.name.toLowerCase();
  if (browser === 'mobile safari') {
    browser = 'safari_ios';
  }
  if (browser === 'samsung browser') {
    browser = 'samsunginternet';
  }
  if (os === 'android') {
    browser += '_android';
  }
  if (!(browser in browsers)) {
    return [null, null];
  }

  // https://github.com/mdn/browser-compat-data/blob/master/docs/data-guidelines.md#safari-for-ios-versioning
  const version = browser === 'safari_ios' ?
      ua.os.version : ua.browser.version;

  const versions = Object.keys(browsers[browser].releases);
  versions.sort(compareVersions);

  // The |version| from the UA string is typically more precise than |versions|
  // from BCD, and some "uninteresting" releases are missing from BCD. To deal
  // with this, find the pair of versions in |versions| that sandwiches
  // |version|, and use the first of this pair. For example, given |version|
  // "10.1" and |versions| entries "10.0" and "10.2", return "10.0".
  for (let i = 0; i < versions.length; i++) {
    const current = versions[i];
    const next = versions[i + 1];
    if (next) {
      if (compareVersions.compare(version, current, '>=') &&
          compareVersions.compare(version, next, '<')) {
        return [browser, current];
      }
    } else {
      // This is the last entry in |versions|. With no |next| to compare against
      // we have to match the version more conservatively, requiring major and
      // minor versions to match. "10.0" and "10" are seen as equivalent.
      if (getMajorMinorVersion(version) === getMajorMinorVersion(current)) {
        return [browser, current];
      }
    }
  }

  return [browser, null];
};

module.exports = {
  getMajorMinorVersion,
  getBrowserAndVersion
};
