'use strict';

import fs from 'fs-extra';
import path from 'path';
import esMain from 'es-main';

import {getMissing} from './find-missing-features.js';
import {main as updateBcd} from './update-bcd.js';

const BCD_DIR = process.env.BCD_DIR || `../browser-compat-data`;
const {default: compareFeatures} = await import(
  `${BCD_DIR}/scripts/compare-features.js`
);

const template = {
  __compat: {
    support: {
      chrome: {version_added: null},
      chrome_android: {version_added: null},
      edge: {version_added: null},
      firefox: {version_added: null},
      firefox_android: {version_added: null},
      ie: {version_added: null},
      opera: {version_added: null},
      opera_android: {version_added: null},
      safari: {version_added: null},
      safari_ios: {version_added: null},
      samsunginternet_android: {version_added: null},
      webview_android: {version_added: null}
    },
    status: {experimental: false, standard_track: true, deprecated: false}
  }
};

const recursiveAdd = (ident, i, data, obj) => {
  const part = ident[i];

  data[part] =
    i + 1 < ident.length ?
      recursiveAdd(ident, i + 1, part in data ? data[part] : {}, obj) :
      Object.assign({}, obj);

  return data;
};

const orderFeatures = (key, value) => {
  if (value instanceof Object && '__compat' in value) {
    value = Object.keys(value)
      .sort(compareFeatures)
      .reduce((result, key) => {
        result[key] = value[key];
        return result;
      }, {});
  }
  return value;
};

const writeFile = async (ident, obj) => {
  const filepath = path.resolve(
    path.join(BCD_DIR, ident[0], `${ident[1]}.json`)
  );

  let data = {api: {}};
  if (await fs.pathExists(filepath)) {
    data = await fs.readJSON(filepath);
  }

  await fs.writeJSON(
    filepath,
    recursiveAdd(ident.concat(['__compat']), 0, data, obj.__compat),
    {spaces: 2, replacer: orderFeatures}
  );
};

const traverseFeatures = async (obj, identifier) => {
  for (const i in obj) {
    if (!!obj[i] && typeof obj[i] == 'object' && i !== '__compat') {
      const thisIdent = identifier.concat([i]);
      if (obj[i].__compat) {
        for (const support of Object.values(obj[i].__compat.support)) {
          if (![false, null].includes(support.version_added)) {
            await writeFile(thisIdent, obj[i]);
            break;
          }
        }
      }

      await traverseFeatures(obj[i], thisIdent);
    }
  }
};

const collectMissing = async (filepath) => {
  const missing = {api: {}};

  for (const entry of getMissing('bcd-from-collector', ['api'])
    .missingEntries) {
    recursiveAdd(entry.split('.'), 0, missing, template);
  }

  const json = JSON.stringify(missing, null, '  ') + '\n';
  await fs.ensureDir(path.dirname(filepath));
  await fs.writeFile(filepath, json);
};

const main = async () => {
  const filepath = path.resolve(
    path.join(BCD_DIR, '__missing', '__missing.json')
  );

  console.log('Generating missing BCD...');
  await collectMissing(filepath);
  await updateBcd(['../mdn-bcd-results/'], {category: ['__missing']});

  console.log('Injecting BCD...');
  const data = await fs.readJSON(filepath);
  await traverseFeatures(data.api, ['api']);

  console.log('Cleaning up...');
  await fs.remove(filepath);

  console.log('Done!');
};

/* istanbul ignore if */
if (esMain(import.meta)) {
  await main();
}
