'use strict';

const compareVersions = require('compare-versions');
const uaParser = require('ua-parser-js');

const getMajorMinorVersion = (version) => {
  const [major, minor] = version.split('.');
  return `${major}.${minor || 0}`;
};

const parseUA = (userAgent, browsers) => {
  // XXX Removal of .NET is for Firefox 3.6.17 on BrowserStack
  // See https://github.com/faisalman/ua-parser-js/issues/461
  const ua = uaParser(userAgent.replace(' (.NET CLR 3.5.21022)', ''));
  const data = {
    browser: {id: null, name: null},
    version: null,
    fullVersion: null,
    os: {name: null, version: null},
    inBcd: undefined
  };

  if (!ua.browser.name) {
    return data;
  }

  data.browser.id = ua.browser.name.toLowerCase().replace(/ /g, '_');
  data.browser.name = ua.browser.name;
  data.os.name = ua.os.name;
  data.os.version = ua.os.version;

  switch (data.browser.id) {
    case 'mobile_safari':
      data.browser.id = 'safari_ios';
      break;
    case 'samsung_browser':
      data.browser.id = 'samsunginternet';
      break;
    case 'android_browser':
    case 'chrome_webview':
      data.browser.id = 'webview';
      break;
  }

  const os = data.os.name.toLowerCase();
  if (os === 'android') {
    data.browser.id += '_android';
    data.browser.name += ' Android';
  }

  data.fullVersion = ua.browser.version;
  
  if (data.browser.id === 'safari_ios') {
    // https://github.com/mdn/browser-compat-data/blob/main/docs/data-guidelines.md#safari-for-ios-versioning
    data.fullVersion = ua.os.version;
  } else if (ua.browser.name === 'Android Browser') {
    data.fullVersion = compareVersions.compare(ua.os.version, '5.0', '<')
      ? ua.os.version
      : ua.engine.version;
  }

  data.version = getMajorMinorVersion(data.fullVersion);

  if (!(data.browser.id in browsers)) {
    return data;
  }

  data.browser.name = browsers[data.browser.id].name;
  data.inBcd = false;

  const versions = Object.keys(browsers[data.browser.id].releases);
  versions.sort(compareVersions);

  // The |version| from the UA string is typically more precise than |versions|
  // from BCD, and some "uninteresting" releases are missing from BCD. To deal
  // with this, find the pair of versions in |versions| that sandwiches
  // |version|, and use the first of this pair. For example, given |version|
  // "10.1" and |versions| entries "10.0" and "10.2", return "10.0".
  for (let i = 0; i < versions.length - 1; i++) {
    const current = versions[i];
    const next = versions[i + 1];
    if (compareVersions.compare(data.version, current, '>=') &&
        compareVersions.compare(data.version, next, '<')) {
      data.inBcd = true;
      data.version = current;
      break;
    }
  }

  // This is the last entry in |versions|. With no |next| to compare against
  // we have to check that the major versions match. Given |version| "10.3"
  // and |versions| entries "10.0" and "10.2", return "10.2". Given |version|
  // "11.0", skip.
  if (data.inBcd == false && data.version.split('.')[0] === versions[versions.length-1].split('.')[0]) {
    data.inBcd = true;
    data.version = versions[versions.length-1];
  }

  return data;
};

module.exports = {
  getMajorMinorVersion,
  parseUA
};
