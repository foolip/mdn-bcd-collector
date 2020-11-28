'use strict';

const fs = require('fs-extra');
const path = require('path');

const {getMissing} = require('./find-missing');
const {main: updateBcd} = require('./update-bcd');

const BCD_DIR = process.env.BCD_DIR || `../browser-compat-data`;
const filepath = path.resolve(path.join(BCD_DIR, '__missing', '__missing.json'));

const template = {
  __compat: {
    support: {
      chrome: { version_added: null },
      chrome_android: { version_added: null },
      edge: { version_added: null },
      firefox: { version_added: null },
      firefox_android: { version_added: null },
      ie: { version_added: null },
      opera: { version_added: null },
      opera_android: { version_added: null },
      safari: { version_added: null },
      safari_ios: { version_added: null },
      samsunginternet_android: { version_added: null },
      webview_android: { version_added: null },
    },
    status: { experimental: false, standard_track: true, deprecated: false },
  },
};

const traverseFeatures = (obj, identifier) => {
  const features = [];

  for (const i in obj) {
    if (
      !!obj[i] &&
      typeof obj[i] == 'object' &&
      i !== '__compat'
    ) {
      if (obj[i].__compat) {
        for (const support of Object.values(obj[i].__compat.support)) {
          if (!([false, null].includes(support.version_added))) {
            features.push(`${identifier}${i}`);
            break;
          }
        }
      }

      features.push(...traverseFeatures(obj[i], identifier + i + '.'));
    }
  }

  return features;
};

const recursiveAdd = (ident, i, data) => {
  const part = ident[i];
  const more = i + 1 < ident.length;

  if (!(part in data)) {
    data[part] = more ? {} : Object.assign({}, template);
  }

  if (more) {
    recursiveAdd(ident, i + 1, data[part]);
  }
}

const collectMissing = async () => {
  const missing = {api: {}};

  for (const entry of getMissing('bcd-from-collector', ['api']).missingEntries) {
    recursiveAdd(entry.split('.'), 0, missing);
  };

  const json = JSON.stringify(missing, null, '  ') + '\n';
  await fs.ensureDir(path.dirname(filepath));
  await fs.writeFile(filepath, json);
};

const main = async () => {
  if (!await fs.pathExists(filepath)) {
    console.log('Generating new file...');

    await collectMissing();
    await updateBcd(['../mdn-bcd-results/'], ['__missing'], []);

    console.log('');
  }

  const data = await fs.readJSON(filepath);

  console.log(traverseFeatures(data.api, 'api.').join('\n'));
}

main();
