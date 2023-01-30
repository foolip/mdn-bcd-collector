//
// mdn-bcd-collector: results.ts
// Module to parse and handle test results
//
// © Gooborg Studios, Google LLC
// See the LICENSE file for copyright details
//

import type {TestResult, Exposure} from './types/types.js';

const parseShortString = (value, desc) => {
  if (typeof value !== 'string') {
    throw new Error(`${desc} should be a string; got ${typeof value}`);
  }
  if (value.length > 1000) {
    throw new Error(`${desc} should be a short string; string is too long`);
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

  results = results
    .map((v, i) => {
      if (!v || typeof v !== 'object') {
        throw new Error(`results[${i}] should be an object; got ${v}`);
      }
      const copy: any = {};
      copy.name = parseShortString(v.name, `results[${i}].name`);
      if (![true, false, null].includes(v.result)) {
        throw new Error(
          `results[${i}].result (${v.name}) should be true/false/null; got ${v.result}`
        );
      }
      copy.result = v.result;
      if (v.result === null) {
        copy.message = parseShortString(
          v.message,
          `results[${i}].message (${v.name})`
        );
      }
      // Copy exposure either from |v.exposure| or |v.info.exposure|.
      if (v.info) {
        copy.exposure = parseShortString(
          v.info.exposure,
          `results[${i}].info.exposure (${v.name})`
        ) as Exposure;
        // Don't copy |v.info.code|.
      } else {
        copy.exposure = parseShortString(
          v.exposure,
          `results[${i}].exposure (${v.name})`
        ) as Exposure;
      }
      return copy as TestResult;
    })
    .sort((a, b) => (a.name + a.exposure).localeCompare(b.name + b.exposure));

  return [url, results];
};

export default parseResults;
