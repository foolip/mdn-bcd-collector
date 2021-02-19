// Copyright 2021 Google LLC
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

const parseShortString = (value, desc) => {
  if (typeof value !== 'string' || value.length > 1000) {
    throw new Error(`${desc} should be a short string`);
  }
  return value;
};

// Parse a results payload from the client into a structure that only contains
// the expected data and does not contain any long strings.
const parseResults = (url, results) => {
  try {
    url = new URL(url).toString();
  } catch (e) {
    throw new Error('invalid URL');
  }

  if (!Array.isArray(results)) {
    throw new Error('results should be an array');
  }

  results = results.map((v, i) => {
    if (!v || typeof v !== 'object') {
      throw new Error(`results[${i}] should be an object`);
    }
    const copy = {};
    copy.name = parseShortString(v.name, `results[${i}].name`);
    if (![true, false, null].includes(v.result)) {
      throw new Error(`results[${i}].result should be true/false/null`);
    }
    copy.result = v.result;
    if (v.result === null) {
      copy.message = parseShortString(v.message, `results[${i}].message`);
    }
    // Copy exposure either from |v.exposure| or |v.info.exposure|.
    if (v.info) {
      copy.exposure = parseShortString(v.info.exposure, `results[${i}].info.exposure`);
      // Don't copy |v.info.code|.
    } else {
      copy.exposure = parseShortString(v.exposure, `results[${i}].exposure`);
    }
    return copy;
  });

  return [url, results];
};

module.exports = {parseResults};
