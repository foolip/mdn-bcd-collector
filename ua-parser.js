'use strict';

const compareVersions = require('compare-versions');
const uaParser = require('ua-parser-js');

const getMajorMinorVersion = (version) => {
  const [major, minor] = version.split('.');
  return `${major}.${minor || 0}`;
};

const parseUA = (userAgent, browsers) => {
  const ua = uaParser(userAgent);

  if (!ua.browser.name) {
    return null;
  }

  const browser = {
    id: ua.browser.name.toLowerCase().replace(/ /g, '_'),
    name: ua.browser.name
  };

  const os = ua.os.name.toLowerCase();
  if (browser.id === 'mobile_safari') {
    browser.id = 'safari_ios';
  }
  if (browser.id === 'samsung_browser') {
    browser.id = 'samsunginternet';
  }
  if (os === 'android') {
    browser.id += '_android';
    browser.name += ' Android';
  }

  // https://github.com/mdn/browser-compat-data/blob/master/docs/data-guidelines.md#safari-for-ios-versioning
  const version = getMajorMinorVersion(
    browser.id === 'safari_ios' ? ua.os.version : ua.browser.version
  );

  if (!(browser.id in browsers)) {
    return {browser, version, inBcd: undefined};
  }

  browser.name = browsers[browser.id].name;

  const versions = Object.keys(browsers[browser.id].releases);
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
        return {browser, version: current, inBcd: true};
      }
    } else {
      // This is the last entry in |versions|. With no |next| to compare against
      // we have to match the version more conservatively, requiring major and
      // minor versions to match. "10.0" and "10" are seen as equivalent.
      if (getMajorMinorVersion(version) === getMajorMinorVersion(current)) {
        return {browser, version: current, inBcd: true};
      }
    }
  }

  return {browser, version, inBcd: false};
};

module.exports = {
  getMajorMinorVersion,
  parseUA
};
