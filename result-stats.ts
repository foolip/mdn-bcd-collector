//
// mdn-bcd-collector: result-stats.ts
// Script to print statistics about a results file
//
// © Gooborg Studios
// See LICENSE.txt for copyright details
//

import path from 'node:path';
import {Stats} from 'node:fs';

import chalk from 'chalk-template';
import esMain from 'es-main';
import fs from 'fs-extra';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import {CompatData} from '@mdn/browser-compat-data/types';

import {Report} from './types/types.js';
import {findMissing} from './find-missing-features.js';
import {parseUA} from './ua-parser.js';

const BCD_DIR = process.env.BCD_DIR || `../browser-compat-data`;
const {default: bcd}: {default: CompatData} = await import(
  `${BCD_DIR}/index.js`
);

const tests = Object.keys(
  await fs.readJson(new URL('./tests.json', import.meta.url))
);

const dedupeArray = (array: Array<any>): Array<any> => {
  return array.filter((item, index) => array.indexOf(item) === index);
};

const percentage = (value: number, total: number): string => {
  return `${((value / total) * 100).toFixed(2)}%`;
};

const loadFile = async (file: string): Promise<Report | undefined> => {
  // Check file argument to ensure it's a valid JSON file
  if (!file) {
    console.error(chalk`{red No file has been specified!}`);
    return;
  }

  let fsStats: Stats;

  // Check if path exists
  try {
    fsStats = await fs.stat(file);
  } catch (e) {
    console.error(chalk`{red File {bold ${file}} doesn't exist!}`);
    return;
  }

  // Check if file is a file and ends in .json
  if (!(fsStats.isFile() && path.extname(file) === '.json')) {
    console.error(chalk`{red File {bold ${file}} is not a JSON file!}`);
    return;
  }

  let data: any;

  // Try to read the JSON data from the file
  try {
    data = await fs.readJson(file);
  } catch (e) {
    console.error(chalk`{red Could not parse JSON from {bold ${file}}!}`);
    return;
  }

  // Check to make sure it's a valid results file
  if (!('__version' in data && 'results' in data && 'userAgent' in data)) {
    console.error(
      chalk`{red File {bold ${file}} does not seem to be a collector results file!  Expected "__version", "results" and "userAgent" keys.}`
    );
  }

  // Finally, return the data
  return data;
};

const getStats = (data: Report): any => {
  const testResults = Object.values(data.results).flat();
  const testedFeatures = dedupeArray(testResults.map((r) => r.name));

  const supportedFeatures = dedupeArray(
    testResults.filter((r) => r.result).map((r) => r.name)
  );
  const unsupportedFeatures = dedupeArray(
    testResults
      .filter((r) => r.result === false && !supportedFeatures.includes(r.name))
      .map((r) => r.name)
  );
  const unknownFeatures = dedupeArray(
    testResults
      .filter((r) => r.result === null && !unsupportedFeatures.includes(r.name))
      .map((r) => r.name)
  );

  return {
    version: data.__version,
    browser: parseUA(data.userAgent, bcd.browsers),
    urls: Object.keys(data.results),
    testResults: {
      total: testedFeatures.length,
      supported: supportedFeatures,
      unsupported: unsupportedFeatures,
      unknown: unknownFeatures,
      missing: findMissing(testedFeatures, tests).missingEntries
    }
  };
};

const printStats = (stats: any): void => {
  console.log(stats);

  console.log(
    chalk` -=- Statistics for {bold ${stats.browser.browser.name} ${stats.browser.version}} (${stats.browser.os.name} ${stats.browser.os.version}) -=-`
  );

  if (!stats.browser.inBcd) {
    if (stats.browser.inBCD === false) {
      console.log(chalk`{red Warning: browser version is {bold not} in BCD.}`);
    } else {
      console.log(chalk`{red Warning: browser is {bold not} in BCD.}`);
    }
  }

  if (stats.urls.length == 0) {
    console.log(chalk`{yellow Results file has no results!}\n`);
    return;
  }

  console.log(
    chalk`{bold URLs Run:}\n${stats.urls.map((u) => ` - ${u}`).join('\n')}`
  );

  const totalTests = stats.testResults.total;
  console.log(chalk`Tests Run: {bold ${totalTests}}`);

  for (const statusName of ['Supported', 'Unsupported', 'Unknown']) {
    const status = statusName.toLowerCase();
    const testResults = stats.testResults[status].length;
    console.log(
      chalk` - ${statusName}: {bold ${testResults}} features ({bold ${percentage(
        testResults,
        totalTests
      )}} of tested / {bold ${percentage(testResults, tests.length)}} of total)`
    );
  }

  console.log(
    chalk` - Missing: {bold ${
      stats.testResults.missing.length
    }} features ({bold ${percentage(
      stats.testResults.missing.length,
      tests.length
    )}})`
  );

  console.log('\n');
};

const main = async (files: string[]): Promise<void> => {
  for (const file of files) {
    const data = await loadFile(file);
    if (!data) {
      continue;
    }

    const stats = getStats(data);
    printStats(stats);
  }
};

/* c8 ignore start */
if (esMain(import.meta)) {
  const {argv}: {argv: any} = yargs(hideBin(process.argv)).command(
    '$0 <files..>',
    '',
    (yargs) => {
      yargs.positional('files', {
        describe: 'The result file(s) to generate statistics for',
        type: 'string',
        array: true
      });
    }
  );

  await main(argv.files);
}
/* c8 ignore stop */
