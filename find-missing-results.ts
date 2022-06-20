//
// mdn-bcd-collector: find-missing-results.ts
// Script to find browser versions that don't have a result file in mdn-bcd-results
//
// © Gooborg Studios
// See LICENSE.txt for copyright details
//

import {CompatData} from '@mdn/browser-compat-data/types';
import {Report} from './types/types.js';

interface ReportMap {
  [k: string]: string[];
}

import compareVersions from 'compare-versions';
import esMain from 'es-main';
import fs from 'fs-extra';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

import {parseUA} from './ua-parser.js';
import {loadJsonFiles} from './update-bcd.js';

const BCD_DIR = process.env.BCD_DIR || `../browser-compat-data`;
const {default: bcd}: {default: CompatData} = await import(
  `${BCD_DIR}/index.js`
);
const {browsers} = bcd;

const appVersion = (await fs.readJson('./package.json'))?.version;

const generateReportMap = (allResults: boolean) => {
  const result: ReportMap = {};

  for (const [browserKey, browserData] of Object.entries(browsers)) {
    if (!allResults && ['nodejs', 'deno'].includes(browserKey)) {
      continue;
    }

    const releases = Object.entries(browserData.releases)
      .filter((r) => ['retired', 'current'].includes(r[1].status))
      .map((r) => r[0]);
    result[browserKey] = releases.sort(compareVersions);

    if (!allResults) {
      if (browserKey == 'ie') {
        // Ignore super old IE releases
        result[browserKey] = result[browserKey].filter((v) =>
          compareVersions.compare(v, '6', '>=')
        );
      } else if (browserKey == 'safari') {
        // Ignore super old Safari releases
        result[browserKey] = result[browserKey].filter((v) =>
          compareVersions.compare(v, '4', '>=')
        );
      } else if (browserKey == 'opera') {
        // Ignore all Opera versions besides 12.1, 15, and the latest stable
        result[browserKey] = result[browserKey].filter(
          (v) =>
            v == '12.1' ||
            v == '15' ||
            v == result[browserKey][result[browserKey].length - 1]
        );
      } else if (
        browserKey.includes('_android') ||
        browserKey.includes('_ios')
      ) {
        // Ignore all mobile browser releases besides the most current
        result[browserKey] = result[browserKey].filter(
          (v) => v == result[browserKey][result[browserKey].length - 1]
        );
      }
    }
  }

  return result;
};

const findMissingResults = async (
  reportPaths: string[],
  allResults: boolean,
  version: string
) => {
  if (version == 'current') {
    version = appVersion;
  }

  const reportMap = generateReportMap(allResults);
  const data = await loadJsonFiles(reportPaths);

  for (const report of Object.values(data) as Report[]) {
    if (version != 'all') {
      if (report.__version != version) {
        continue;
      }
    }

    const ua = parseUA(report.userAgent, browsers);
    const browserKey = ua.browser.id;
    const browserVersion = ua.version;

    if (browserKey in reportMap) {
      if (reportMap[browserKey].includes(browserVersion)) {
        reportMap[browserKey] = reportMap[browserKey].filter(
          (v) => v !== browserVersion
        );
      }
    }
  }

  return reportMap;
};

/* c8 ignore start */
const main = async (argv) => {
  const missingResults = await findMissingResults(
    argv.reports,
    argv.all,
    argv.collectorVersion
  );

  for (const [browser, releases] of Object.entries(missingResults)) {
    if (releases.length) {
      console.log(`${browsers[browser].name}: ${releases.join(', ')}`);
    }
  }
};

if (esMain(import.meta)) {
  const {argv} = yargs(hideBin(process.argv)).command(
    '$0 [reports..]',
    'Determine gaps in results',
    (yargs) => {
      yargs
        .positional('reports', {
          describe: 'The report files to update from (also accepts folders)',
          type: 'string',
          array: true,
          default: ['../mdn-bcd-results/']
        })
        .option('collector-version', {
          alias: 'c',
          describe: 'Limit the collector version (set to "all" to disable)',
          type: 'string',
          default: 'current'
        })
        .option('all', {
          describe: 'Include all results, including ignored',
          alias: 'a',
          type: 'boolean',
          nargs: 0
        });
    }
  );

  await main(argv);
}
/* c8 ignore stop */

export default findMissingResults;
