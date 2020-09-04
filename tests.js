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

class Tests {
  constructor(options) {
    this.tests = options.manifest.tests;
    this.endpoints = options.manifest.endpoints.main;
    this.individualEndpoints = options.manifest.endpoints.individual;
    this.host = options.host;
  }

  next(after) {
    const afterURL = new URL(after);
    if (afterURL.protocol === 'http') {
      return `https://${this.host}${afterURL.pathname}`;
    } else {
      const endpoints = Object.keys(this.endpoints);
      const endpoint = endpoints[endpoints.findIndex((item) => {
        return item === afterURL.pathname;
      })];

      return `http://${this.host}${endpoint}`;
    }
  }

  getTests(endpoint) {
    return this.endpoints[endpoint] || this.individualEndpoints[endpoint];
  }

  listEndpoints() {
    return Object.keys(this.endpoints);
  }

  listIndividual() {
    return Object.keys(this.individualEndpoints).map((item) => {
      return [item.substr(1).replace(/\//g, '.'), item];
    });
  }
}

module.exports = Tests;
