'use strict';

const bcd = require('@mdn/browser-compat-data');
const tests = require('./tests.json');

const traverseFeatures = (obj, identifier) => {
  const features = [];

  for (const i in obj) {
    if (
      !!obj[i] &&
      typeof obj[i] == 'object' &&
      i !== '__compat'
    ) {
      if (obj[i].__compat) {
        features.push(`${identifier}${i}`);
      }

      features.push(...traverseFeatures(obj[i], identifier + i + '.'));
    }
  }

  return features;
};

const findMissing = (entries1, entries2) => {
  const missingEntries = [];

  for (const entry of entries1) {
    if (!entries2.includes(entry)) {
      missingEntries.push(entry);
    }
  }

  return {missingEntries, total: entries2.length};
};

const getMissing = (direction = 'collector-to-bcd') => {
  const bcdEntries = [
    ...traverseFeatures(bcd.api, 'api.'),
    ...traverseFeatures(bcd.css.properties, 'css.properties.')
  ];
  const collectorEntries = Object.keys(tests);

  switch (direction) {
    case 'bcd-to-collector':
      return findMissing(collectorEntries, bcdEntries);
    default:
      console.log(`Direction '${direction}' is unknown; defaulting to collector -> bcd`);
      // eslint-disable-next-line no-fallthrough
    case 'collector-to-bcd':
      return findMissing(bcdEntries, collectorEntries);
  }
};

/* istanbul ignore next */
const main = () => {
  const {argv} = require('yargs').command(
      '$0 [--direction]',
      'Find missing entries between BCD and the collector tests',
      (yargs) => {
        yargs
            .option('direction', {
              alias: 'd',
              describe: 'Which direction to find missing entries from ("a-to-b" will check what is in a that is missing from b)',
              choices: ['bcd-to-collector', 'collector-to-bcd'],
              nargs: 1,
              type: 'string',
              default: 'collector-to-bcd'
            });
      }
  );

  const {missingEntries, total} = getMissing(argv.direction);
  console.log(missingEntries.join('\n'));
  console.log(`\n${missingEntries.length}/${total} (${(missingEntries.length/total*100.0).toFixed(2)}%) missing`);
};

module.exports = {
  traverseFeatures,
  findMissing,
  getMissing
};

/* istanbul ignore if */
if (require.main === module) {
  main();
}
