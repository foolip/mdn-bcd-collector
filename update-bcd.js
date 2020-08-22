'use strict';

const compareVersions = require('compare-versions');
const fs = require('fs');
const path = require('path');
const uaParser = require('ua-parser-js');

const overrides = require('./overrides').filter(Array.isArray);

function findEntry(bcd, path) {
  const keys = path.split('.');
  let entry = bcd;
  while (entry && keys.length) {
    entry = entry[keys.shift()];
  }
  return entry;
}

function isDirectory(fp) {
  try {
    return fs.statSync(fp).isDirectory();
  } catch (e) {
    return false;
  }
}

// https://github.com/mdn/browser-compat-data/issues/3617
function save(bcd, bcdDir) {
  function processObject(object, keypath) {
    if (keypath.length && !['api', 'css'].includes(keypath[0])) {
      return;
    }
    for (const [key, value] of Object.entries(object)) {
      const candidate = path.join(bcdDir, ...keypath, key);

      if (isDirectory(candidate)) {
        // If the path is a directory, recurse.
        processObject(value, keypath.concat(key));
      } else {
        // Otherwise, write data to file.
        const filepath = `${candidate}.json`;
        // Add wrapping objects with keys as in keypath.
        let wrappedValue = value;
        const keys = keypath.concat(key).reverse();
        for (const key of keys) {
          const wrapper = {};
          wrapper[key] = wrappedValue;
          wrappedValue = wrapper;
        }
        const json = JSON.stringify(wrappedValue, null, '  ') + '\n';
        fs.writeFileSync(filepath, json);
      }
    }
  }

  processObject(bcd, []);
}

function getBrowserAndVersion(userAgent, browsers) {
  const ua = uaParser(userAgent);

  let browser = ua.browser.name.toLowerCase();
  const os = ua.os.name.toLowerCase();
  if (browser === 'mobile safari') {
    browser = 'safari_ios';
  }
  if (os === 'android') {
    browser += '_android';
  }
  if (!(browser in browsers)) {
    return [null, null];
  }

  // Trim last component of the version until there's a match, if any.
  let version = ua.browser.version;
  const parts = version.split('.');
  while (parts.length && !(version in browsers[browser].releases)) {
    parts.pop();
    version = parts.join('.');
  }

  return [browser, version];
}

// Get support map from BCD path to test result(null/true/false) for a single
// report.
function getSupportMap(report) {
  // Transform `report` to map from test name (BCD path) to array of results.
  const testMap = new Map;
  for (const [url, results] of Object.entries(report.results)) {
    if (url === '__version') continue;
    for (const test of results) {
      const tests = testMap.get(test.name) || [];
      tests.push({url, result: test.result});
      testMap.set(test.name, tests);
    }
  }

  if (testMap.size === 0) {
    throw new Error('No results!');
  }

  // Transform `testMap` to map from test name (BCD path) to flattened support.
  const supportMap = new Map;
  for (const [name, results] of testMap.entries()) {
    let supported = null;
    // eslint-disable-next-line no-unused-vars
    for (const {url, result} of results) {
      if (result === null) {
        continue;
      }
      if (supported === null) {
        supported = result;
        continue;
      }
      if (supported !== result) {
        // This will happen for [SecureContext] APIs and APIs under multiple
        // scopes.
        // console.log(`Contradictory results for ${name}: ${JSON.stringify(
        //     results, null, '  '
        // )}`);
        supported = true;
        break;
      }

      // XXX Check against HTTP vs. HTTPS
    }
    supportMap.set(name, supported);
  }
  return supportMap;
}

// Load all reports and build a map from BCD path to browser + version
// and test result (null/true/false) for that version.
function getSupportMatrix(bcd, reports) {
  const supportMatrix = new Map;

  for (const report of reports) {
    const [browser, version] = getBrowserAndVersion(
        report.userAgent, bcd.browsers
    );
    if (!browser || !version) {
      console.warn(`Ignoring unknown browser/version: ${report.userAgent}`);
      continue;
    }

    const supportMap = getSupportMap(report);

    // Merge `supportMap` into `supportMatrix`.
    for (const [name, supported] of supportMap.entries()) {
      let browserMap = supportMatrix.get(name);
      if (!browserMap) {
        browserMap = new Map;
        supportMatrix.set(name, browserMap);
      }
      let versionMap = browserMap.get(browser);
      if (!versionMap) {
        versionMap = new Map;
        browserMap.set(browser, versionMap);
      }
      versionMap.set(version, supported);
    }
  }

  // apply manual overrides
  for (const [path, browser, version, supported] of overrides) {
    const browserMap = supportMatrix.get(path);
    if (!browserMap) {
      continue;
    }
    const versionMap = browserMap.get(browser);
    if (!versionMap) {
      continue;
    }
    if (version === '*') {
      for (const v of versionMap.keys()) {
        versionMap.set(v, supported);
      }
    } else {
      versionMap.set(version, supported);
    }
  }

  return supportMatrix;
}

function inferSupportStatements(versionMap) {
  const versions = Array.from(versionMap.keys());
  versions.sort(compareVersions);

  const statements = [];
  for (const [i, version] of versions.entries()) {
    const supported = versionMap.get(version);
    if (i === 0) {
      // TODO: exact version if it's the first version in browser.json
      statements.push({version_added: supported});
      continue;
    }
    const lastStatement = statements[statements.length - 1];
    if (supported === true) {
      if (!lastStatement.version_added) {
        lastStatement.version_added = version;
      } else if (lastStatement.version_removed) {
        // added back again
        statements.push({version_added: version});
      } else {
        // leave `lastStatement.version_added` as is
      }
    } else if (supported === false) {
      if (lastStatement.version_added) {
        lastStatement.version_removed = version;
      }
    } else if (supported === null) {
      // TODO
    } else {
      throw new Error('result not true/false/null');
    }
  }
  return statements;
}

function update(bcd, supportMatrix) {
  for (const [path, browserMap] of supportMatrix.entries()) {
    const entry = findEntry(bcd, path);
    if (!entry || !entry.__compat) {
      continue;
    }

    for (const [browser, versionMap] of browserMap.entries()) {
      const inferredStatments = inferSupportStatements(versionMap);
      if (inferredStatments.length !== 1) {
        // TODO: handle more complicated scenarios
        continue;
      }

      let supportStatement = entry.__compat.support[browser];
      if (!supportStatement) {
        // TODO: add a support statement
        continue;
      }
      if (!Array.isArray(supportStatement)) {
        supportStatement = [supportStatement];
      }

      const simpleStatement = supportStatement.find((statement) => {
        const ignoreKeys = new Set(['notes', 'partial_implementation']);
        const keys = Object.keys(statement).filter(
            (key) => !ignoreKeys.has(key)
        );
        return keys.length === 1;
      });
      if (!simpleStatement) {
        // No simple statement probably means it's prefixed or under and
        // alternative name, but in any case implies that the main feature
        // is not supported. So only update in case new data contracts that.
        if (inferredStatments.some((statement) => statement.version_added)) {
          supportStatement.unshift(...inferredStatments);
          entry.__compat.support[browser] = supportStatement;
        }
        continue;
      }

      console.log(`Updating ${path}`);

      if (
        !(typeof(simpleStatement.version_added) === 'string' &&
        inferredStatments[0].version_added === true)
      ) {
        simpleStatement.version_added = inferredStatments[0].version_added;
      }

      if (
        inferredStatments[0].version_removed &&
        !(typeof(simpleStatement.version_removed) === 'string' &&
          inferredStatments[0].version_removed === true)
      ) {
        simpleStatement.version_removed = inferredStatments[0].version_removed;
      }
    }
  }
}

function loadFiles(reportFiles) {
  const reports = [];
  for (const reportFile of reportFiles) {
    const report = JSON.parse(fs.readFileSync(reportFile));
    reports.push(report);
  }

  return reports;
}

function main(reportFiles) {
  const BCD_DIR = process.env.BCD_DIR || `../browser-compat-data`;
  const bcd = require(BCD_DIR);

  const reports = loadFiles(reportFiles);
  const supportMatrix = getSupportMatrix(bcd, reports);
  update(bcd, supportMatrix);
  save(bcd, BCD_DIR);
}

/* istanbul ignore if */
if (require.main === module) {
  main(process.argv.slice(2));
} else {
  module.exports = {
    findEntry,
    isDirectory,
    getBrowserAndVersion,
    getSupportMap,
    getSupportMatrix,
    inferSupportStatements,
    update,
    loadFiles
  };
}
