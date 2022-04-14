// See https://github.com/foolip/mdn-bcd-collector/blob/main/DESIGN.md#updating-bcd
// for documentation on the approach taken in this script.

'use strict';

import assert from 'assert';
import compareVersions from 'compare-versions';
import esMain from 'es-main';
import fs from 'fs-extra';
import klaw from 'klaw';
import minimatch from 'minimatch';
const {Minimatch} = minimatch;
import path from 'path';
import {fileURLToPath} from 'url';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

import logger from './logger.js';
import {parseUA} from './ua-parser.js';

const BCD_DIR = fileURLToPath(
  new URL(process.env.BCD_DIR || `../browser-compat-data`, import.meta.url)
);

const findEntry = (bcd, ident) => {
  if (!ident) {
    return null;
  }
  const keys = ident.split('.');
  let entry = bcd;
  while (entry && keys.length) {
    entry = entry[keys.shift()];
  }
  return entry;
};

const combineResults = (results) => {
  let supported = null;
  for (const result of results) {
    if (result === true) {
      // If any result is true, the flattened support should be true. There
      // can be contradictory results with multiple exposure scopes, but here
      // we treat support in any scope as support of the feature.
      return true;
    } else if (result === false) {
      // This may yet be overruled by a later result (above).
      supported = false;
    } else if (result === null) {
      // Leave supported as it is.
    } else {
      throw new Error(`result not true/false/null; got ${result}`);
    }
  }
  return supported;
};

// Get support map from BCD path to test result (null/true/false) for a single
// report.
const getSupportMap = (report) => {
  // Transform `report` to map from test name (BCD path) to array of results.
  const testMap = new Map();
  for (const tests of Object.values(report.results)) {
    for (const test of tests) {
      // TODO: If test.exposure.endsWith('Worker'), then map this to a
      // worker_support feature.
      const tests = testMap.get(test.name) || [];
      tests.push(test.result);
      testMap.set(test.name, tests);
    }
  }

  if (testMap.size === 0) {
    throw new Error(`Report for "${report.userAgent}" has no results!`);
  }

  // Transform `testMap` to map from test name (BCD path) to flattened support.
  const supportMap = new Map();
  for (const [name, results] of testMap.entries()) {
    let supported = combineResults(results);

    if (supported === null) {
      // If the parent feature support is false, copy that.
      // TODO: This  assumes that the parent feature came first when iterating
      // the report, which isn't guaranteed. Move this to a second phase.
      const parentName = name.split('.').slice(0, -1).join('.');
      const parentSupport = supportMap.get(parentName);
      if (parentSupport === false) {
        supported = false;
      }
    }

    supportMap.set(name, supported);
  }
  return supportMap;
};

// Load all reports and build a map from BCD path to browser + version
// and test result (null/true/false) for that version.
const getSupportMatrix = (reports, browsers, overrides) => {
  const supportMatrix = new Map();

  for (const report of reports) {
    const {browser, version, inBcd} = parseUA(report.userAgent, browsers);
    if (!inBcd) {
      if (inBcd === false) {
        logger.warn(
          `Ignoring unknown ${browser.name} version ${version} (${report.userAgent})`
        );
      } else if (browser.name) {
        logger.warn(
          `Ignoring unknown browser ${browser.name} ${version} (${report.userAgent})`
        );
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
        browserMap = new Map();
        supportMatrix.set(name, browserMap);
      }
      let versionMap = browserMap.get(browser.id);
      if (!versionMap) {
        versionMap = new Map();
        for (const browserVersion of Object.keys(
          browsers[browser.id].releases
        )) {
          versionMap.set(browserVersion, null);
        }
        browserMap.set(browser.id, versionMap);
      }
      assert(versionMap.has(version), `${browser.id} ${version} missing`);

      // In case of multiple reports for a single version it's possible we
      // already have (non-null) support information. Combine results to deal
      // with this possibility.
      const combined = combineResults([supported, versionMap.get(version)]);
      versionMap.set(version, combined);
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
};

const inferSupportStatements = (versionMap) => {
  const versions = Array.from(versionMap.keys()).sort(compareVersions);

  const statements = [];
  const lastKnown = {version: '0', support: null};
  let lastWasNull = false;

  for (const [_, version] of versions.entries()) {
    const supported = versionMap.get(version);
    const lastStatement = statements[statements.length - 1];

    if (supported === true) {
      if (!lastStatement) {
        statements.push({
          version_added:
            lastWasNull || lastKnown.support === false ?
              `${lastKnown.version}> ≤${version}` :
              version
        });
      } else if (!lastStatement.version_added) {
        lastStatement.version_added = lastWasNull ?
          `${lastKnown.version}> ≤${version}` :
          version;
      } else if (lastStatement.version_removed) {
        // added back again
        statements.push({
          version_added: version
        });
      }

      lastKnown.version = version;
      lastKnown.support = true;
      lastWasNull = false;
    } else if (supported === false) {
      if (
        lastStatement &&
        lastStatement.version_added &&
        !lastStatement.version_removed
      ) {
        lastStatement.version_removed = lastWasNull ?
          `${lastKnown.version}> ≤${version}` :
          version;
      } else if (!lastStatement) {
        statements.push({version_added: false});
      }

      lastKnown.version = version;
      lastKnown.support = false;
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

const update = (bcd, supportMatrix, filter) => {
  let modified = false;

  for (const [path, browserMap] of supportMatrix.entries()) {
    if (filter.path && !filter.path.match(path)) {
      continue;
    }

    const entry = findEntry(bcd, path);
    if (!entry || !entry.__compat) {
      continue;
    }

    for (const [browser, versionMap] of browserMap.entries()) {
      if (
        filter.browser &&
        filter.browser.length &&
        !filter.browser.includes(browser)
      ) {
        continue;
      }
      const inferredStatements = inferSupportStatements(versionMap);
      if (inferredStatements.length !== 1) {
        // TODO: handle more complicated scenarios
        continue;
      }

      const inferredStatement = inferredStatements[0];

      if (
        filter.release &&
        filter.release !== inferredStatement.version_added &&
        filter.release !== inferredStatement.version_removed
      ) {
        continue;
      }

      let allStatements = entry.__compat.support[browser];
      if (!allStatements) {
        allStatements = [];
      } else if (!Array.isArray(allStatements)) {
        allStatements = [allStatements];
      }

      // Filter to the statements representing the feature being enabled by
      // default under the default name and no flags.
      const defaultStatements = allStatements.filter((statement) => {
        if ('flags' in statement) {
          return false;
        }
        if ('prefix' in statement || 'alternative_name' in statement) {
          // TODO: map the results for aliases to these statements.
          return false;
        }
        return true;
      });

      if (defaultStatements.length === 0) {
        // Prepend |inferredStatement| to |allStatements|, since there were no
        // relevant statements to begin with...
        if (inferredStatement.version_added === false) {
          // ... but not if the new statement just claims no support, since
          // that is implicit in no statement.
          continue;
        }
        if (typeof inferredStatement.version_added === 'string') {
          inferredStatement.version_added =
            inferredStatement.version_added.replace('0> ', '');
        }
        allStatements.unshift(inferredStatement);
        entry.__compat.support[browser] =
          allStatements.length === 1 ? allStatements[0] : allStatements;
        modified = true;
        continue;
      }

      if (defaultStatements.length !== 1) {
        // TODO: handle more complicated scenarios
        continue;
      }

      const simpleStatement = defaultStatements[0];

      if (simpleStatement.version_removed) {
        // TODO: handle updating existing added+removed entries.
        continue;
      }

      let dataIsOlder = false;
      if (
        inferredStatement.version_added === false &&
        typeof simpleStatement.version_added === 'string'
      ) {
        // Make sure not to update BCD if it is set to a version newer than we have in our data

        for (const [version, result] of Array.from(
          versionMap.entries()
        ).reverse()) {
          if (
            result !== null &&
            simpleStatement.version_added !== 'preview' &&
            compareVersions.compare(
              version,
              simpleStatement.version_added.replace('≤', ''),
              '<='
            )
          ) {
            // A version we have data for is the same or newer than the version in BCD
            dataIsOlder = true;
            break;
          }
        }
      }

      if (dataIsOlder) {
        continue;
      } else if (
        typeof simpleStatement.version_added === 'string' &&
        typeof inferredStatement.version_added === 'string' &&
        inferredStatement.version_added.includes('≤')
      ) {
        const range = inferredStatement.version_added.split('> ≤');
        if (
          compareVersions.compare(
            simpleStatement.version_added.replace('≤', ''),
            range[0],
            '<='
          ) ||
          compareVersions.compare(
            simpleStatement.version_added.replace('≤', ''),
            range[1],
            '>'
          )
        ) {
          simpleStatement.version_added =
            inferredStatement.version_added.replace('0> ', '');
          modified = true;
        }
      } else if (
        !(
          typeof simpleStatement.version_added === 'string' &&
          inferredStatement.version_added === true
        )
      ) {
        simpleStatement.version_added =
          typeof inferredStatement.version_added === 'string' ?
            inferredStatement.version_added.replace('0> ', '') :
            inferredStatement.version_added;
        modified = true;
      }

      if (typeof inferredStatement.version_removed === 'string') {
        simpleStatement.version_removed = inferredStatement.version_removed;
        modified = true;
      }
    }
  }

  return modified;
};

// |paths| can be files or directories. Returns an object mapping
// from (absolute) path to the parsed file content.
/* c8 ignore start */
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
          if (item.path.endsWith('.json')) {
            jsonFiles.push(item.path);
          }
        })
        .on('error', reject)
        .on('end', resolve);
    });
  }

  const entries = await Promise.all(
    jsonFiles.map(async (file) => {
      const data = await fs.readJson(file);
      return [file, data];
    })
  );

  return Object.fromEntries(entries);
};

const main = async (reportPaths, filter, browsers, overrides) => {
  // Replace filter.path with a minimatch object.
  if (filter.path) {
    filter.path = new Minimatch(filter.path);
  }

  const bcdFiles = await loadJsonFiles(
    filter.category.map((cat) => path.join(BCD_DIR, ...cat.split('.')))
  );

  const reports = Object.values(await loadJsonFiles(reportPaths));
  const supportMatrix = getSupportMatrix(
    reports,
    browsers,
    overrides.filter(Array.isArray)
  );

  // Should match https://github.com/mdn/browser-compat-data/blob/f10bf2cc7d1b001a390e70b7854cab9435ffb443/test/linter/test-style.js#L63
  // TODO: https://github.com/mdn/browser-compat-data/issues/3617
  for (const [file, data] of Object.entries(bcdFiles)) {
    const modified = update(data, supportMatrix, filter);
    if (!modified) {
      continue;
    }
    logger.info(`Updating ${path.relative(BCD_DIR, file)}`);
    const json = JSON.stringify(data, null, '  ') + '\n';
    await fs.writeFile(file, json);
  }
};

if (esMain(import.meta)) {
  const {
    default: {browsers}
  } = await import(`${BCD_DIR}/index.js`);
  const overrides = await fs.readJson(
    new URL('./overrides.json', import.meta.url)
  );

  const {argv} = yargs(hideBin(process.argv)).command(
    '$0 [reports..]',
    'Update BCD from a specified set of report files',
    (yargs) => {
      yargs
        .positional('reports', {
          describe: 'The report files to update from (also accepts folders)',
          type: 'array',
          default: ['../mdn-bcd-results/']
        })
        .option('category', {
          alias: 'c',
          describe: 'The BCD categories to update',
          type: 'array',
          choices: ['api', 'css.properties', 'javascript.builtins'],
          default: ['api', 'css.properties', 'javascript.builtins']
        })
        .option('path', {
          alias: 'p',
          describe:
            'The BCD path to update (interpreted as a minimatch pattern)',
          type: 'string',
          default: null
        })
        .option('browser', {
          alias: 'b',
          describe: 'The browser to update',
          type: 'array',
          choices: Object.keys(browsers),
          default: []
        })
        .option('release', {
          alias: 'r',
          describe:
            'Only update when version_added or version_removed is set to the given value',
          type: 'string',
          default: null
        });
    }
  );

  await main(argv.reports, argv, browsers, overrides);
}
/* c8 ignore stop */

export {
  findEntry,
  getSupportMap,
  getSupportMatrix,
  inferSupportStatements,
  update,
  loadJsonFiles,
  main
};
