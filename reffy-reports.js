// Copyright 2020 Google LLC
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

'use strict';

const fs = require('fs');
const path = require('path');
const WebIDL2 = require('webidl2');

// Note: package.json is just a file that we know exists, it's not used.
const reportsDir = path.dirname(require.resolve('reffy-reports/package.json'));

// Load text (UTF-8) files from a directory and return an object mapping each
// name (sans extension) to the parsed result of that text.
function loadTextFiles(relativeDir, extension, parse) {
  const dir = path.join(reportsDir, relativeDir);
  const files = fs.readdirSync(dir);
  files.sort();
  const results = {};
  for (const file of files) {
    if (path.extname(file) !== extension) {
      continue;
    }
    const name = path.parse(file).name;
    const text = fs.readFileSync(path.join(dir, file), 'utf8');
    results[name] = parse(text);
  }
  return results;
}

module.exports = {
  css: loadTextFiles('ed/css', '.json', JSON.parse),
  idl: loadTextFiles('ed/idl', '.idl', WebIDL2.parse)
};
