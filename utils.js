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

const writeFile = async (filename, content) => {
  if (Array.isArray(content)) {
    content = content.join('\n');
  } else if (typeof content === 'object') {
    content = JSON.stringify(content);
  }
  content = content.trimEnd() + '\n';

  await fs.ensureDir(path.dirname(filename));
  await fs.writeFile(filename, content, 'utf8');
};

module.exports = {writeFile};
