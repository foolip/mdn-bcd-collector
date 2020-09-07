'use strict';

const bcd = require('mdn-browser-compat-data');
const tests = require('./generated/tests.json');

const traverseFeatures = (obj, identifier) => {
  const features = [];

  for (const i in obj) {
    if (
      !!obj[i] &&
      typeof obj[i] == 'object' &&
      i !== '__compat'
    ) {
      if (obj.__compat) {
        features.push(`${identifier}${i}`);
      }

      features.push(...traverseFeatures(obj[i], identifier + i + '.'));
    }
  }

  return features;
};

const findMissing = () => {
  const bcdEntries = [
    ...traverseFeatures(bcd.api, 'api.'),
    ...traverseFeatures(bcd.css, 'css.')
  ];
  const collectorEntries = Object.keys(tests);
  const missingEntries = [];

  for (const entry of bcdEntries) {
    if (!collectorEntries.includes(entry)) {
      missingEntries.push(entry);
    }
  }

  return missingEntries;
};

const main = () => {
  console.log(findMissing().join('\n'));
};

/* istanbul ignore if */
if (require.main === module) {
  main();
} else {
  module.exports = {
    traverseFeatures,
    findMissing
  };
}
