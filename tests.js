// Copyright 2019 Google LLC
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

class Tests {
  constructor(options) {
    this.items = options.manifest.items
        .filter((item) => !options.httpOnly || item.protocol === 'http');
    this.host = options.host;
  }

  list(after, limit) {
    let begin; let end;
    if (after) {
      const afterURL = new URL(after);
      const afterIndex = this.items.findIndex((item) => {
        const itemURL = new URL(`${item.protocol}://${this.host}${item.pathname}`);
        return itemURL.pathname === afterURL.pathname &&
            itemURL.protocol === afterURL.protocol;
      });

      if (afterIndex === -1) {
        throw new Error(`${after} not found in test manifest`);
      }

      begin = afterIndex + 1;
      if (limit) {
        end = afterIndex + 1 + limit;
      }
    } else {
      begin = 0;
      if (limit) {
        end = limit;
      }
    }

    return this.items.slice(begin, end).map((item) => {
      return `${item.protocol}://${this.host}${item.pathname}`;
    });
  }
}

module.exports = Tests;
