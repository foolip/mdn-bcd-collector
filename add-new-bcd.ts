//
// mdn-bcd-collector: add-new-bcd.ts
// Adds missing entries to BCD that have support in some browser version
//
// © Gooborg Studios, Google LLC
// See LICENSE.txt for copyright details
//

import {Identifier} from '@mdn/browser-compat-data/types';

import path from 'node:path';

import fs from 'fs-extra';
import esMain from 'es-main';

import {getMissing} from './find-missing-features.js';
import {main as updateBcd} from './update-bcd.js';

const tests = await fs.readJson(new URL('./tests.json', import.meta.url));
const overrides = await fs.readJson(
  new URL('./overrides.json', import.meta.url)
);

const BCD_DIR = process.env.BCD_DIR || `../browser-compat-data`;
const {default: bcd} = await import(`${BCD_DIR}/index.js`);
const {default: compareFeatures} = await import(
  `${BCD_DIR}/scripts/lib/compare-features.js`
);

const template = {
  __compat: {
    support: {
      chrome: {version_added: null},
      chrome_android: 'mirror',
      edge: 'mirror',
      firefox: {version_added: null},
      firefox_android: 'mirror',
      ie: {version_added: false},
      oculus: 'mirror',
      opera: 'mirror',
      opera_android: 'mirror',
      safari: {version_added: null},
      safari_ios: 'mirror',
      samsunginternet_android: 'mirror',
      webview_android: 'mirror'
    },
    status: {experimental: false, standard_track: true, deprecated: false}
  }
};

export const recursiveAdd = (
  ident: string[],
  i: number,
  data: Identifier,
  obj: any
): Identifier => {
  const part = ident[i];

  data[part] =
    i + 1 < ident.length
      ? recursiveAdd(ident, i + 1, part in data ? data[part] : {}, obj)
      : Object.assign({}, obj);

  return data;
};

export const orderFeatures = (key: string, value: Identifier): Identifier => {
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

/* c8 ignore start */
const writeFile = async (ident: string[], obj: any): Promise<void> => {
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
/* c8 ignore stop */

export const traverseFeatures = async (
  obj: Identifier,
  identifier: string[]
): Promise<any> => {
  for (const i in obj) {
    if (!!obj[i] && typeof obj[i] == 'object' && i !== '__compat') {
      const thisIdent = identifier.concat([i]);
      const support = obj[i]?.__compat?.support;
      if (support) {
        for (const statements of Object.values(support)) {
          const supported = (
            Array.isArray(statements) ? statements : [statements]
          ).some((s) => s.version_added && !s.version_removed);
          if (supported) {
            await writeFile(thisIdent, obj[i]);
            break;
          }
        }
      }

      await traverseFeatures(obj[i], thisIdent);
    }
  }
};

export const collectMissing = async (filepath: string): Promise<void> => {
  const missing = {api: {}};

  for (const entry of getMissing(
    bcd,
    tests,
    'bcd-from-collector',
    ['api'],
    false
  ).missingEntries) {
    recursiveAdd(entry.split('.'), 0, missing, template);
  }

  const json = JSON.stringify(missing, null, '  ') + '\n';
  await fs.ensureDir(path.dirname(filepath));
  await fs.writeFile(filepath, json);
};

/* c8 ignore start */
const main = async (): Promise<void> => {
  const filepath = path.resolve(
    path.join(BCD_DIR, '__missing', '__missing.json')
  );

  console.log('Generating missing BCD...');
  await collectMissing(filepath);
  await updateBcd(
    ['../mdn-bcd-results/'],
    {category: ['__missing']},
    bcd.browsers,
    overrides
  );

  console.log('Injecting BCD...');
  const data = await fs.readJSON(filepath);
  await traverseFeatures(data.api, ['api']);

  console.log('Cleaning up...');
  await fs.remove(filepath);

  console.log('Done!');
};

if (esMain(import.meta)) {
  await main();
}
/* c8 ignore stop */
