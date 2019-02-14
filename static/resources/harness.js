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

// This harness should work on as old browsers as possible and should't depend
// on any modern JavaScript features.

(function(global) {
  var results = [];

  function report(desc, value) {
    /*
    switch (typeof value) {
      case 'boolean':
      case 'number':
        break;
      case 'string':
        // "escape" strings so that string can be used for other values too
        value = 'string:' + value;
        break;
      case 'symbol':
        value = 'symbol';
        break;
      case 'function':
        value = 'function';
      case 'object':
        if (value === null) {
          // leave unchanged
        } else {
          value = 'object';
        }
        break;
      case 'undefined':
        value = 'undefined';
      default:
        value = 'UNKNOWN';
    }
    */
    var type = typeof value;
    if (type === 'object' && value === null) {
      type = 'null';
    }

    results.push([desc, type]);
  }

  function done() {
    console.log(results);
    // TODO: send the results somewhere
  }

  global.t = {
    report: report,
    done: done,
  };
})(this);
