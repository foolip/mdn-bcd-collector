//
// mdn-bcd-collector: prepare-resources.js
// Script to prepare resources for the webserver, including SCSS compilation and
// copying files from node modules
//
// © Gooborg Studios
// See the LICENSE file for copyright details
//

import path from 'node:path';
import {fileURLToPath} from 'node:url';

import esMain from 'es-main';
import fs from 'fs-extra';
import sass from 'sass';

import type {
  Test,
  RawTest,
  RawTestCodeExpr,
  Exposure,
  Resources,
  IDLFiles
} from './types/types.js';

const generatedDir = fileURLToPath(new URL('./generated', import.meta.url));

/* c8 ignore start */
const copyResources = async () => {
  const resources = [
    ['json3/lib/json3.min.js', 'resources'],
    ['chai/chai.js', 'unittest'],
    ['mocha/mocha.css', 'unittest'],
    ['mocha/mocha.js', 'unittest'],
    ['mocha/mocha.js.map', 'unittest'],
    ['sinon/pkg/sinon.js', 'unittest'],
    ['@browser-logos/chrome/chrome_64x64.png', 'browser-logos', 'chrome.png'],
    ['@browser-logos/edge/edge_64x64.png', 'browser-logos', 'edge.png'],
    [
      '@browser-logos/firefox/firefox_64x64.png',
      'browser-logos',
      'firefox.png'
    ],
    [
      '@browser-logos/internet-explorer_9-11/internet-explorer_9-11_64x64.png',
      'browser-logos',
      'ie.png'
    ],
    ['@browser-logos/opera/opera_64x64.png', 'browser-logos', 'opera.png'],
    ['@browser-logos/safari/safari_64x64.png', 'browser-logos', 'safari.png'],
    ['@mdi/font/css/materialdesignicons.min.css', 'resources'],
    ['@mdi/font/fonts/materialdesignicons-webfont.eot', 'fonts'],
    ['@mdi/font/fonts/materialdesignicons-webfont.ttf', 'fonts'],
    ['@mdi/font/fonts/materialdesignicons-webfont.woff', 'fonts'],
    ['@mdi/font/fonts/materialdesignicons-webfont.woff2', 'fonts']
  ];
  for (const [srcInModules, destInGenerated, newFilename] of resources) {
    const src = fileURLToPath(
      new URL(`./node_modules/${srcInModules}`, import.meta.url)
    );
    const destDir = path.join(generatedDir, destInGenerated);
    const dest = path.join(destDir, path.basename(src));
    await fs.ensureDir(path.dirname(dest));
    await fs.copyFile(src, dest);
    if (newFilename) {
      await fs.rename(dest, path.join(destDir, newFilename));
    }
  }
};

const generateCSS = async () => {
  const scssPath = fileURLToPath(new URL('./style.scss', import.meta.url));
  const outPath = path.join(generatedDir, 'resources', 'style.css');
  const result = sass.renderSync({file: scssPath});
  await fs.writeFile(outPath, result.css.toString(), 'utf8');
};

const prepareResources = async () => {
  await copyResources();
  await generateCSS();
};

if (esMain(import.meta)) {
  await prepareResources();
}
/* c8 ignore stop */
