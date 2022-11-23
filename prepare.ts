//
// mdn-bcd-collector: prepare.ts
// A main entry point to run various scripts in a cross-platform friendly way
//
// © Gooborg Studios
// See the LICENSE file for copyright details
//

import fs from 'node:fs';

import esMain from 'es-main';

import exec from './lib/exec.js';

const prepare = async () => {
  // Copy secrets.sample.json to secrets.json if needed
  const secretsPath = new URL('./secrets.json', import.meta.url);
  const secretsSamplePath = new URL('./secrets.sample.json', import.meta.url);

  if (!fs.existsSync(secretsPath)) {
    fs.copyFileSync(secretsSamplePath, secretsPath);
  }

  if (process.env.NODE_ENV !== 'production') {
    // Install Firefox for Puppeteer
    try {
      process.chdir('node_modules/puppeteer');
    } catch (e) {
      return;
    }
    await exec('node install.js', {PUPPETEER_PRODUCT: 'firefox'}, false);
  }
};

if (esMain(import.meta)) {
  prepare();
}
