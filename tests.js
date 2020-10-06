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

const didYouMean = require('didyoumean');

class Tests {
  constructor(options) {
    this.tests = options.tests;
    this.endpoints = this.buildEndpoints();
    this.httpOnly = options.httpOnly;
  }

  buildEndpoints() {
    const endpoints = {
      '': []
    };

    for (const ident of Object.keys(this.tests)) {
      endpoints[''].push(ident);

      let endpoint = '';
      for (const part of ident.split('.')) {
        endpoint += (endpoint ? '.' : '') + part;

        if (!(endpoint in endpoints)) {
          endpoints[endpoint] = [];
        }

        if (!endpoints[endpoint].includes(ident)) {
          endpoints[endpoint].push(ident);
        }
      }
    }

    return endpoints;
  }

  listEndpoints() {
    return Object.keys(this.endpoints);
  }

  didYouMean(input) {
    return didYouMean(input, this.listEndpoints());
  }

  getTests(endpoint, testExposure) {
    if (!(endpoint in this.endpoints)) {
      return [];
    }

    const idents = this.endpoints[endpoint];

    const tests = [];
    for (const ident of idents) {
      const test = this.tests[ident];
      for (const exposure of test.exposure) {
        if (!testExposure || exposure == testExposure) {
          tests.push({
            ident: ident,
            tests: test.tests,
            exposure: exposure,
            resources: test.resources
          });
        }
      }
    }

    return tests;
  }
}

module.exports = Tests;
