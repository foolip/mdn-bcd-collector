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

const compareVersions = require('compare-versions');

const {parseUA} = require('./ua-parser');
const {loadJsonFiles} = require('./update-bcd');

const BCD_DIR = process.env.BCD_DIR || `../browser-compat-data`;
const {browsers} = require(BCD_DIR);

const generateReportMap = (allResults) => {
  const result = {};

  for (const [browserKey, browserData] of Object.entries(browsers)) {
    if (!allResults && browserKey == 'nodejs') continue;

    const releases = Object.entries(browserData.releases).filter(
      r => ['retired', 'current'].includes(r[1].status)
    ).map(r => r[0]);
    result[browserKey] = releases.sort(compareVersions);

    if (!allResults) {
      // Ignore super old browser releases
      if (browserKey == 'ie') {
        result[browserKey] = result[browserKey].filter(v => v >= '6');
      } else if (browserKey == 'safari') {
        result[browserKey] = result[browserKey].filter(v => v >= '4' && v != '6.1');
      } else if (browserKey == 'opera') {
        // Ignore all Opera versions besides 12.1, 15, and the latest stable
        result[browserKey] = result[browserKey].filter(v => 
          v == '12.1' ||
          v == '15' ||
          v == result[browserKey][result[browserKey].length - 1]
          );
      }
    }
  }

  return result;
};

const findMissingResults = async (reportPaths, allResults) => {
  const reportMap = generateReportMap(allResults);

  const data = await loadJsonFiles(reportPaths);
  const uaStrings = Object.values(data).map(v => v.userAgent);

  for (const uaString of uaStrings) {
    const ua = parseUA(uaString, browsers);
    const browserKey = ua.browser.id;
    const browserVersion = ua.version;

    if (browserKey in reportMap) {
      if (reportMap[browserKey].includes(browserVersion)) {
        if (!allResults && (browserKey.includes('_android') || browserKey.includes('_ios'))) {
          // We only really care about getting only the latest iOS/Android browser results
          reportMap[browserKey] = [];
        } else {
          reportMap[browserKey] = reportMap[browserKey].filter(v => v !== browserVersion);
        }
      }
    }
  }

  return reportMap;
};

const main = async (reportPaths, allResults) => {
  const missingResults = await findMissingResults(reportPaths, allResults);

  for (const [browser, releases] of Object.entries(missingResults)) {
    if (releases.length) {
      console.log(`${browsers[browser].name}: ${releases.join(', ')}`);
    }
  }
}

if (require.main === module) {
  const {argv} = require('yargs').command(
      '$0 [reports..]',
      'Determine gaps in results',
      (yargs) => {
        yargs
            .positional('reports', {
              describe: 'The report files to update from (also accepts folders)',
              type: 'array',
              default: ['../mdn-bcd-results/']
            })
            .option('all', {
              describe: 'Include all results, including ignored ',
              alias: 'a',
              type: 'boolean',
              nargs: 0
            });;
      }
  );

  main(argv.reports, argv.all).catch((error) => {
    logger.error(error.stack);
    process.exit(1);
  });
}

module.exports = {findMissingResults};
