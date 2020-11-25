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

const findMissing = (entries, allEntries) => {
  const missingEntries = [];

  for (const entry of allEntries) {
    if (!entries.includes(entry)) {
      missingEntries.push(entry);
    }
  }

  return {missingEntries, total: allEntries.length};
};

const getMissing = (direction = 'collector-from-bcd') => {
  const bcdEntries = [
    ...traverseFeatures(bcd.api, 'api.'),
    ...traverseFeatures(bcd.css.properties, 'css.properties.')
  ];
  const collectorEntries = Object.keys(tests);

  switch (direction) {
    case 'bcd-from-collector':
      return findMissing(bcdEntries, collectorEntries);
    default:
      console.log(`Direction '${direction}' is unknown; defaulting to collector <- bcd`);
      // eslint-disable-next-line no-fallthrough
    case 'collector-from-bcd':
      return findMissing(collectorEntries, bcdEntries);
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
              describe: 'Which direction to find missing entries from ("a-from-b" will check what is in a that is missing from b)',
              choices: ['bcd-from-collector', 'collector-from-bcd'],
              nargs: 1,
              type: 'string',
              default: 'collector-from-bcd'
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
