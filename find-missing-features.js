'use strict';

import fs from "fs-extra";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const BCD_DIR = process.env.BCD_DIR || `../browser-compat-data`;
const {
  default: bcd
} = await import(`${BCD_DIR}/index.js`);

const tests = JSON.parse(
  await fs.readFile(
    process.env.NODE_ENV === 'test' ?
      './unittest/unit/tests.test.json' :
      './tests.json',
    'utf8'
  )
);

const traverseFeatures = (obj, path, includeAliases) => {
  const features = [];

  for (const id of Object.keys(obj)) {
    if (!obj[id] || typeof obj[id] !== 'object') {
      continue;
    }

    const compat = obj[id].__compat;
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

const findMissing = (entries, allEntries) => {
  const missingEntries = [];

  for (const entry of allEntries) {
    if (!entries.includes(entry)) {
      missingEntries.push(entry);
    }
  }

  return {missingEntries, total: allEntries.length};
};

const getMissing = (
    direction = 'collector-from-bcd',
    category = [],
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

/* istanbul ignore next */
const main = () => {
  const {argv} = yargs(hideBin(process.argv)).command(
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
            'Which direction to find missing entries from ("a-from-b" will check what is in a that is missing from b)',
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

  const {missingEntries, total} = getMissing(
      argv.direction,
      argv.category,
      argv.includeAliases
  );
  console.log(missingEntries.join('\n'));
  console.log(
      `\n${missingEntries.length}/${total} (${(
        (missingEntries.length / total) *
      100.0
      ).toFixed(2)}%) missing`
  );
};

/* istanbul ignore if */
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  traverseFeatures,
  findMissing,
  getMissing
};