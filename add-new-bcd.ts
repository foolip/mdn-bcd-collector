//
// mdn-bcd-collector: add-new-bcd.ts
// Adds missing entries to BCD that have support in some browser version
//
// © Gooborg Studios, Google LLC
// See the LICENSE file for copyright details
//

import {Identifier} from '@mdn/browser-compat-data/types';

import path from 'node:path';
import {execSync} from 'node:child_process';

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
    status: {experimental: true, standard_track: true, deprecated: false}
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

const startsWithLowerCase = (s: string): boolean => {
  return s[0] === s[0].toLowerCase();
};

const startsWithUpperCase = (s: string): boolean => {
  return s[0] === s[0].toUpperCase();
};

export const getFilePath = (ident: string[]): string => {
  // Shorten or modify the path depending on the section of BCD. Make a copy
  // of ident so that it can be freely modified.
  let parts = ident.slice();
  if (parts.length >= 2 && parts[0] === 'api') {
    // Assume a global if it starts with a lower case character, otherwise
    // an interface with members.
    if (startsWithLowerCase(parts[1])) {
      parts = [parts[0], '_globals', parts[1]];
    } else {
      parts.length = 2;
    }
  } else if (parts.length >= 3 && parts[0] === 'css') {
    parts.length = 3;
  } else if (
    parts.length >= 3 &&
    parts[0] === 'javascript' &&
    parts[1] === 'builtins'
  ) {
    if (startsWithLowerCase(parts[2])) {
      return 'javascript/builtins/globals.json';
    }
    // For cases that look like namespaces like Intl and WebAssembly there
    // should be an additional level or directory.
    if (
      parts.length >= 4 &&
      parts[2] !== parts[3] &&
      startsWithUpperCase(parts[2]) &&
      startsWithUpperCase(parts[3])
    ) {
      parts.length = 4;
    } else {
      parts.length = 3;
    }
  } else {
    throw new Error(
      `Cannot determine file path from BCD path: ${ident.join('.')}`
    );
  }
  parts[parts.length - 1] += '.json';
  return path.join(...parts);
};

/* c8 ignore start */
const writeFile = async (ident: string[], obj: any): Promise<void> => {
  // The file path is slightly different in different parts of BCD.
  // As a catch-all case. TODO
  const filepath = path.resolve(BCD_DIR, getFilePath(ident));

  let data = {};
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
  const missing = {};

  for (const entry of getMissing(bcd, tests, 'bcd-from-collector')
    .missingEntries) {
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
  await traverseFeatures(data, []);

  console.log('Cleaning up...');
  await fs.remove(filepath);
  execSync('npm run fix', {cwd: BCD_DIR});

  console.log('Done!');
};

if (esMain(import.meta)) {
  await main();
}
/* c8 ignore stop */
