//
// mdn-bcd-collector: find-missing-features.ts
// Script to find features that are in the collector or BCD but not the other
//
// © Gooborg Studios, Google LLC
// See the LICENSE file for copyright details
//

import {CompatData, CompatStatement} from '@mdn/browser-compat-data/types';
import {Tests} from './types/types.js';

import {fileURLToPath} from 'node:url';

import chalk from 'chalk-template';
import esMain from 'es-main';
import fs from 'fs-extra';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

const traverseFeatures = (obj: any, path: string, includeAliases?: boolean) => {
  const features: string[] = [];

  for (const id of Object.keys(obj)) {
    if (!obj[id] || typeof obj[id] !== 'object') {
      continue;
    }

    const compat: CompatStatement = obj[id].__compat;
    if (compat) {
      features.push(`${path}${id}`);

      if (includeAliases && !id.endsWith('_event')) {
        const aliases = new Set();
        for (let statements of Object.values(compat.support)) {
          if (!Array.isArray(statements)) {
            statements = [statements];
          }
          for (const statement of statements) {
            if (statement.flags) {
              continue;
            }
            if (statement.alternative_name) {
              aliases.add(statement.alternative_name);
            }
            if (statement.prefix) {
              let name = id;
              if (path.startsWith('api.')) {
                name = name[0].toUpperCase() + name.substr(1);
              }
              aliases.add(statement.prefix + name);
            }
          }
        }

        for (const alias of aliases) {
          features.push(`${path}${alias}`);
        }
      }
    }

    features.push(
      ...traverseFeatures(obj[id], path + id + '.', includeAliases)
    );
  }

  return features;
};

const findMissing = (entries: string[], allEntries: string[]) => {
  const missingEntries: string[] = [];

  for (const entry of allEntries) {
    if (!entries.includes(entry)) {
      missingEntries.push(entry);
    }
  }

  return {missingEntries, total: allEntries.length};
};

const getMissing = (
  bcd: CompatData,
  tests: Tests,
  direction = 'collector-from-bcd',
  category: string[] = [],
  includeAliases = false
) => {
  const filterCategory = (item) => {
    return (
      !category.length || category.some((cat) => item.startsWith(`${cat}.`))
    );
  };

  const bcdEntries = [
    ...traverseFeatures(bcd.api, 'api.', includeAliases),
    ...traverseFeatures(bcd.css.properties, 'css.properties.', includeAliases),
    ...traverseFeatures(
      bcd.javascript.builtins,
      'javascript.builtins.',
      includeAliases
    )
  ].filter(filterCategory);
  const collectorEntries = Object.keys(tests).filter(filterCategory);

  switch (direction) {
    case 'bcd-from-collector':
      return findMissing(bcdEntries, collectorEntries);
    default:
      console.log(
        `Direction '${direction}' is unknown; defaulting to collector <- bcd`
      );
    // eslint-disable-next-line no-fallthrough
    case 'collector-from-bcd':
      return findMissing(collectorEntries, bcdEntries);
  }
};

/* c8 ignore start */
const main = (bcd: CompatData, tests: Tests) => {
  const {argv}: any = yargs(hideBin(process.argv)).command(
    '$0 [--direction]',
    'Find missing entries between BCD and the collector tests',
    (yargs) => {
      yargs
        .option('include-aliases', {
          alias: 'a',
          describe: 'Include BCD entries using prefix or alternative_name',
          type: 'boolean',
          default: false
        })
        .option('direction', {
          alias: 'd',
          describe:
            'Which direction to find missing entries from ("a-from-b" will check what is missing in a but present in b)',
          choices: ['bcd-from-collector', 'collector-from-bcd'],
          nargs: 1,
          type: 'string',
          default: 'collector-from-bcd'
        })
        .option('category', {
          alias: 'c',
          describe: 'The BCD categories to filter',
          type: 'array',
          choices: ['api', 'css.properties', 'javascript.builtins'],
          default: ['api', 'css.properties', 'javascript.builtins']
        });
    }
  );

  const direction = argv.direction.split('-from-');
  console.log(
    chalk`{yellow Finding entries that are missing in {bold ${direction[0]}} but present in {bold ${direction[1]}}...}\n`
  );

  const {missingEntries, total} = getMissing(
    bcd,
    tests,
    argv.direction,
    argv.category,
    argv.includeAliases
  );
  console.log(missingEntries.join('\n'));
  console.log(
    chalk`\n{cyan ${missingEntries.length}/${total} (${(
      (missingEntries.length / total) *
      100.0
    ).toFixed(2)}%)} {yellow entries missing from {bold ${
      direction[0]
    }} that are in {bold ${direction[1]}}}`
  );
};

if (esMain(import.meta)) {
  const BCD_DIR = fileURLToPath(
    new URL(process.env.BCD_DIR || `../browser-compat-data`, import.meta.url)
  );
  const {default: bcd} = await import(`${BCD_DIR}/index.js`);
  const tests = await fs.readJson(new URL('./tests.json', import.meta.url));

  main(bcd, tests);
}
/* c8 ignore stop */

export {traverseFeatures, findMissing, getMissing};
