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

const childProcess = require('child_process');

const exec = (cmd, env) => {
  env = {...process.env, ...env};
  console.log(`> ${cmd}`);
  return childProcess.execSync(cmd, {env, stdio: 'inherit'});
};

const prepare = () => {
  try {
    process.chdir('node_modules/puppeteer');
  } catch {
    return;
  }
  exec('node install.js', {PUPPETEER_PRODUCT: 'firefox'});
};

const command = process.argv[2];
if (command === 'prepare') {
  prepare();
} else if (command === 'unittest') {
  exec('nyc mocha --recursive unittest', {NODE_ENV: 'test'});
}
