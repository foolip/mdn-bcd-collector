//
// mdn-bcd-collector: scripts.js
// A main entry point to run various scripts in a cross-platform friendly way
//
// © Mozilla Corporation, Google LLC, Gooborg Studios
// See the LICENSE file for copyright details
//

import fs from 'node:fs';

import childProcess from 'child_process';
import esMain from 'es-main';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

export const exec = (cmd, env?: any, pipe = true) => {
  env = {...process.env, ...env};
  if (!pipe) {
    console.log(`> ${cmd}`);
  }
  return childProcess.execSync(cmd, {env, stdio: pipe ? 'pipe' : 'inherit'});
};

const prepare = () => {
  // Copy secrets.sample.json to secrets.json if needed
  const secretsPath = new URL('./secrets.json', import.meta.url);
  const secretsSamplePath = new URL('./secrets.sample.json', import.meta.url);

  if (!fs.existsSync(secretsPath)) {
    fs.copyFileSync(secretsSamplePath, secretsPath);
  }

  // Install Firefox for Puppeteer
  try {
    process.chdir('node_modules/puppeteer');
  } catch (e) {
    return;
  }
  exec('node install.js', {PUPPETEER_PRODUCT: 'firefox'}, false);
};

if (esMain(import.meta)) {
  const {argv} = yargs(hideBin(process.argv)).command(
    '$0 <command>',
    'Run an action',
    (yargs) => {
      yargs.positional('command', {
        describe: 'What command to run',
        type: 'string',
        choices: ['unittest', 'prepare']
      });
    }
  );

  switch ((argv as any).command) {
    case 'prepare':
      prepare();
      break;
    case 'unittest':
      exec(
        'c8 mocha --recursive "unittest/**/*.ts"',
        {NODE_ENV: 'test'},
        false
      );
      break;
    default:
      console.error(`Unknown command ${(argv as any).command}!`);
  }
}
