//
// mdn-bcd-collector: prepare.ts
// A main entry point to run various scripts in a cross-platform friendly way
//
// © Gooborg Studios
// See the LICENSE file for copyright details
//

import fs from 'node:fs';

import esMain from 'es-main';

const prepare = async () => {
  // Copy secrets.sample.json to secrets.json if needed
  const secretsPath = new URL('./secrets.json', import.meta.url);
  const secretsSamplePath = new URL('./secrets.sample.json', import.meta.url);

  if (!fs.existsSync(secretsPath)) {
    fs.copyFileSync(secretsSamplePath, secretsPath);
  }
};

if (esMain(import.meta)) {
  prepare();
}
