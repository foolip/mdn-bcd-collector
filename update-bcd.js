'use strict';

const compareVersions = require('compare-versions');
const deepEqual = require('fast-deep-equal');
const fs = require('fs').promises;
const klaw = require('klaw');
const path = require('path');
const zlib = require('zlib');

const logger = require('./logger');
const overrides = require('./overrides').filter(Array.isArray);
const {parseUA} = require('./ua-parser');

const findEntry = (bcd, path) => {
  if (!path) {
    return null;
  }
  const keys = path.split('.');
  let entry = bcd;
  while (entry && keys.length) {
    entry = entry[keys.shift()];
  }
  return entry;
};

// Get support map from BCD path to test result(null/true/false) for a single
// report.
const getSupportMap = (report) => {
  // Transform `report` to map from test name (BCD path) to array of results.
  const testMap = new Map;
  for (const [url, results] of Object.entries(report.results)) {
    for (const test of results) {
      const tests = testMap.get(test.name) || [];
      tests.push({url, result: test.result, prefix: test.prefix});
      testMap.set(test.name, tests);
    }
  }

  if (testMap.size === 0) {
    throw new Error(`Report for "${report.userAgent}" has no results!`);
  }

  // Transform `testMap` to map from test name (BCD path) to flattened support.
  const supportMap = new Map;
  for (const [name, results] of testMap.entries()) {
    let supported = {result: null, prefix: ''};
    // eslint-disable-next-line no-unused-vars
    for (const {url, result, prefix} of results) {
      if (result === null) {
        const parentName = name.split('.').slice(0, -1).join('.');
        const parentSupport = supportMap.get(parentName);
        if (parentSupport && parentSupport.result === false) {
          supported.result = false;
        }
        continue;
      }
      if (supported.result === null) {
        supported = {result: result, prefix: prefix || ''};
        continue;
      }
      if (supported.result !== result) {
        // This will happen for [SecureContext] APIs and APIs under multiple
        // exposure scopes.
        // logger.warn(`Contradictory results for ${name}: ${JSON.stringify(
        //     results, null, '  '
        // )}`);
        supported.result = true;
        break;
      }
    }

    supportMap.set(name, supported);
  }
  return supportMap;
};

// Load all reports and build a map from BCD path to browser + version
// and test result (null/true/false) for that version.
const getSupportMatrix = (browsers, reports) => {
  const supportMatrix = new Map;

  for (const report of reports) {
    const {browser, version, inBcd} = parseUA(report.userAgent, browsers);
    if (!inBcd) {
      if (inBcd === false) {
        logger.warn(`Ignoring unknown ${browser.name} version ${version} (${report.userAgent})`);
      } else if (browser.name) {
        logger.warn(`Ignoring unknown browser ${browser.name} ${version} (${report.userAgent})`);
      } else {
        logger.warn(`Unable to parse browser from UA ${report.userAgent}`);
      }

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
      let versionMap = browserMap.get(browser.id);
      if (!versionMap) {
        versionMap = new Map;
        for (const browserVersion of
          Object.keys(browsers[browser.id].releases)
        ) {
          versionMap.set(browserVersion, {result: null, prefix: ''});
        }
        browserMap.set(browser.id, versionMap);
      }
      versionMap.set(version, supported);
    }
  }

  // apply manual overrides
  for (const [path, browser, version, supported, prefix] of overrides) {
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
        versionMap.set(v, {result: supported, prefix: prefix || ''});
      }
    } else {
      versionMap.set(version, {result: supported, prefix: prefix || ''});
    }
  }

  return supportMatrix;
};

const inferSupportStatements = (versionMap) => {
  const versions = Array.from(versionMap.keys()).sort(compareVersions);

  const statements = [];
  const lastKnown = {version: null, support: null, prefix: ''};
  let lastWasNull = false;

  for (const [_, version] of versions.entries()) {
    const {result: supported, prefix} = versionMap.get(version);
    const lastStatement = statements[statements.length - 1];

    if (supported === true) {
      if (!lastStatement) {
        statements.push({
          version_added: (
            (lastWasNull || lastKnown.support === false) ? '≤' : ''
          ) + version,
          ...(prefix && {prefix: prefix})
        });
      } else if (!lastStatement.version_added) {
        lastStatement.version_added = (lastWasNull ? '≤' : '') + version;
      } else if (lastStatement.version_removed) {
        // added back again
        statements.push({
          version_added: version,
          ...(prefix && {prefix: prefix})
        });
      } else if ((lastStatement.prefix || '') !== prefix) {
        // Prefix changed
        statements.push({
          version_added: version,
          ...(prefix && {prefix: prefix})
        });
      }

      lastKnown.version = version;
      lastKnown.support = true;
      lastKnown.prefix = prefix;
      lastWasNull = false;
    } else if (supported === false) {
      if (
        lastStatement &&
        lastStatement.version_added &&
        !lastStatement.version_removed
      ) {
        lastStatement.version_removed = (lastWasNull ? '≤' : '') + version;
      } else if (!lastStatement) {
        statements.push({version_added: false});
      }

      lastKnown.version = version;
      lastKnown.support = false;
      lastKnown.prefix = prefix;
      lastWasNull = false;
    } else if (supported === null) {
      lastWasNull = true;
      // TODO
    } else {
      throw new Error(`result not true/false/null; got ${supported}`);
    }
  }

  return statements;
};

const update = (bcd, supportMatrix) => {
  let modified = false;

  for (const [path, browserMap] of supportMatrix.entries()) {
    const entry = findEntry(bcd, path);
    if (!entry || !entry.__compat) {
      continue;
    }

    for (const [browser, versionMap] of browserMap.entries()) {
      const inferredStatements = inferSupportStatements(versionMap);
      if (inferredStatements.length !== 1) {
        // TODO: handle more complicated scenarios
        continue;
      }

      const inferredStatement = inferredStatements[0];

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
        const keys = Object.keys(statement)
            .filter((key) => !ignoreKeys.has(key));
        return keys.length === 1;
      });

      if (!simpleStatement) {
        // No simple statement probably means it's prefixed or under and
        // alternative name, but in any case implies that the main feature
        // is not supported. So only update in case new data contradicts that.
        if (inferredStatements.some((statement) => statement.version_added)) {
          supportStatement.unshift(...inferredStatements);
          supportStatement = supportStatement.filter((item, pos, self) => {
            return pos === self.findIndex((el) => deepEqual(el, item));
          });
          entry.__compat.support[browser] = supportStatement.length === 1 ?
            supportStatement[0] : supportStatement;
          modified = true;
        }
        continue;
      }

      if (typeof(simpleStatement.version_added) === 'string' &&
        typeof(inferredStatement.version_added) === 'string' &&
        inferredStatement.version_added.includes('≤')
      ) {
        if (compareVersions.compare(
            simpleStatement.version_added.replace('≤', ''),
            inferredStatement.version_added.replace('≤', ''),
            '>'
        )) {
          simpleStatement.version_added = inferredStatement.version_added;
          modified = true;
        }
      } else if (!(typeof(simpleStatement.version_added) === 'string' &&
            inferredStatement.version_added === true)) {
        simpleStatement.version_added = inferredStatement.version_added;
        modified = true;
      }

      if (inferredStatement.version_removed) {
        if (!(typeof(simpleStatement.version_removed) === 'string' &&
              inferredStatement.version_removed === true)) {
          simpleStatement.version_removed = inferredStatement.version_removed;
          modified = true;
        }
      }
    }
  }

  return modified;
};

// |paths| can be files or directories. Returns an object mapping
// from (absolute) path to the parsed file content.
/* istanbul ignore next */
const loadJsonFiles = async (paths) => {
  // Ignores .DS_Store, .git, etc.
  const dotFilter = (item) => {
    const basename = path.basename(item);
    return basename === '.' || basename[0] !== '.';
  };

  const jsonFiles = [];

  for (const p of paths) {
    await new Promise((resolve, reject) => {
      klaw(p, {filter: dotFilter})
          .on('data', (item) => {
            if (
              item.path.endsWith('.json') ||
              item.path.endsWith('.json.gz')
            ) {
              jsonFiles.push(item.path);
            }
          })
          .on('error', reject)
          .on('end', resolve);
    });
  }

  const entries = await Promise.all(
      jsonFiles.map(async (file) => {
        let filedata;
        if (file.endsWith('.json.gz')) {
          filedata = zlib.gunzipSync(await fs.readFile(file));
        } else {
          filedata = await fs.readFile(file);
        }
        const data = JSON.parse(filedata);
        return [file, data];
      }));

  return Object.fromEntries(entries);
};

/* istanbul ignore next */
const main = async (reportPaths, categories) => {
  const BCD_DIR = process.env.BCD_DIR || `../browser-compat-data`;
  // This will load and parse parts of BCD twice, but it's simple.
  const {browsers} = require(BCD_DIR);
  const bcdFiles = await loadJsonFiles(
      categories.map((cat) => path.join(BCD_DIR, ...cat.split('.')))
  );

  const reports = Object.values(await loadJsonFiles(reportPaths));
  const supportMatrix = getSupportMatrix(browsers, reports);

  // Should match https://github.com/mdn/browser-compat-data/blob/f10bf2cc7d1b001a390e70b7854cab9435ffb443/test/linter/test-style.js#L63
  // TODO: https://github.com/mdn/browser-compat-data/issues/3617
  for (const [file, data] of Object.entries(bcdFiles)) {
    const modified = update(data, supportMatrix);
    if (!modified) {
      continue;
    }
    logger.info(`Updating ${path.relative(BCD_DIR, file)}`);
    const json = JSON.stringify(data, null, '  ') + '\n';
    await fs.writeFile(file, json);
  }
};

module.exports = {
  findEntry,
  getSupportMap,
  getSupportMatrix,
  inferSupportStatements,
  update
};

/* istanbul ignore if */
if (require.main === module) {
  const {argv} = require('yargs').command(
      '$0 <reports..>',
      'Update BCD from a specified set of report files',
      (yargs) => {
        yargs
            .positional('reports', {
              describe: 'The report files to update from (also accepts folders)',
              type: 'string'
            })
            .option('category', {
              alias: 'c',
              describe: 'The BCD categories to update',
              type: 'array',
              choices: ['api', 'css.properties'],
              default: ['api', 'css.properties']
            });
      }
  );

  main(argv.reports, argv.category).catch((error) => {
    logger.error(error.stack);
    process.exit(1);
  });
}
