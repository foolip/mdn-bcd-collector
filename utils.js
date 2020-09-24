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

const fs = require('fs-extra');
const path = require('path');
const stringifyJSON = require('json-stable-stringify');

const stringify = (object, options = {}) => {
  const spacing = options.spacing !== undefined ? options.spacing : 2;

  if (options.sort) {
    return stringifyJSON(object, {space: spacing});
  }
  
  return JSON.stringify(object, null, spacing);
};

const writeFile = async (filename, content, options = {}) => {
  if (Array.isArray(content)) {
    content = content.join('\n');
  } else if (typeof content === 'object') {
    content = stringify(content, options);
  }
  content = content.trimEnd() + '\n';

  await fs.ensureDir(path.dirname(filename));
  await fs.writeFile(filename, content, 'utf8');
};

const isDirectory = (fp) => {
  try {
    return fs.statSync(fp).isDirectory();
  } catch (e) {
    return false;
  }
};

const isEquivalent = (a, b) => {
  // Create arrays of property names
  const aProps = Object.getOwnPropertyNames(a);
  const bProps = Object.getOwnPropertyNames(b);

  // If number of properties is different,
  // objects are not equivalent
  if (aProps.length != bProps.length) {
    return false;
  }

  for (const propName of aProps) {
    // If values of same property are not equal,
    // objects are not equivalent
    if (a[propName] !== b[propName]) {
      return false;
    }
  }

  // If we made it this far, objects
  // are considered equivalent
  return true;
};

module.exports = {
  stringify,
  writeFile,
  isDirectory,
  isEquivalent
};
