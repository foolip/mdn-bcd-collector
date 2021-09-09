// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

import compareVersions from "compare-versions";
import fs from "fs-extra";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { parseUA } from "./ua-parser.js";
import { loadJsonFiles } from "./update-bcd.mjs";

const BCD_DIR = process.env.BCD_DIR || `../browser-compat-data`;
const {
  default: bcd
} = await import(`${BCD_DIR}/index.js`);
const {browsers} = bcd;

const appVersion = JSON.parse(await fs.readFile('./package.json')).version;

const generateReportMap = (allResults) => {
  const result = {};

  for (const [browserKey, browserData] of Object.entries(browsers)) {
    if (!allResults && browserKey == 'nodejs') {
      continue;
    }

    const releases = Object.entries(browserData.releases)
        .filter((r) => ['retired', 'current'].includes(r[1].status))
        .map((r) => r[0]);
    result[browserKey] = releases.sort(compareVersions);

    if (!allResults) {
      if (browserKey == 'ie') {
        // Ignore super old IE releases
        result[browserKey] = result[browserKey].filter((v) => v >= '6');
      } else if (browserKey == 'safari') {
        // Ignore super old Safari releases, and Safari 6.1
        result[browserKey] = result[browserKey].filter(
            (v) => v >= '4' && v != '6.1'
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

const findMissingResults = async (reportPaths, allResults, version) => {
  if (version == 'current') {
    version = appVersion;
  }

  const reportMap = generateReportMap(allResults);
  const data = await loadJsonFiles(reportPaths);

  for (const report of Object.values(data)) {
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

/* istanbul ignore if */
if (import.meta.url === `file://${process.argv[1]}`) {
  const {argv} = yargs(hideBin(process.argv)).command(
      '$0 [reports..]',
      'Determine gaps in results',
      (yargs) => {
        yargs
            .positional('reports', {
              describe: 'The report files to update from (also accepts folders)',
              type: 'array',
              default: ['../mdn-bcd-results/']
            })
            .option('collector-version', {
              alias: 'c',
              describe: 'Limit the collector version (set to "all" to disable)',
              type: 'string',
              default: 'current'
            })
            .option('all', {
              describe: 'Include all results, including ignored ',
              alias: 'a',
              type: 'boolean',
              nargs: 0
            });
      }
  );

  main(argv);
}

export findMissingResults;
