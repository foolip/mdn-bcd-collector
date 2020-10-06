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

  return missingEntries;
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
    case 'collector-to-bcd':
    default:
      return findMissing(bcdEntries, collectorEntries);
  }
};

/* istanbul ignore next */
const main = () => {
  console.log(getMissing().join('\n'));
};

/* istanbul ignore if */
if (require.main === module) {
  main();
} else {
  module.exports = {
    traverseFeatures,
    findMissing,
    getMissing
  };
}
