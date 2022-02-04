// Copyright 2020 Mozilla Corporation
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import childProcess from 'child_process';
import esMain from 'es-main';
import fs from 'fs';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

export const exec = (cmd, env, pipe = true) => {
  env = {...process.env, ...env};
  if (!pipe) {
    console.log(`> ${cmd}`);
  }
  return childProcess.execSync(cmd, {env, stdio: pipe ? 'pipe' : 'inherit'});
};

/* c8 ignore start */
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

  switch (argv.command) {
    case 'prepare':
      prepare();
      break;
    case 'unittest':
      exec(
        'c8 mocha --reporter dot --recursive unittest',
        {NODE_ENV: 'test'},
        false
      );
      break;
    default:
      console.error(`Unknown command ${argv.command}!`);
  }
}
/* c8 ignore stop */
