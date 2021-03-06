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

// Load text (UTF-8) files from a directory and return an object mapping each
// name (sans extension) to the parsed result of that text.
const parseIDL = () => {
  const files = fs.readdirSync(__dirname);
  files.sort();
  const results = {};
  for (const file of files) {
    /* istanbul ignore next */
    if (path.extname(file) !== '.idl') {
      continue;
    }
    const name = path.parse(file).name;
    const text = fs.readFileSync(path.join(__dirname, file), 'utf8');
    results[name] = WebIDL2.parse(text);
  }
  return results;
};

module.exports = parseIDL();
