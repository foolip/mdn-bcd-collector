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
    this.tests = options.tests;
    this.endpoints = this.buildEndpoints();
    this.host = options.host;
    this.httpOnly = options.httpOnly;
  }

  buildEndpoints() {
    const endpoints = {
      '/': {
        httpsOnly: false,
        entries: []
      }
    };

    for (const [ident, test] of Object.entries(this.tests)) {
      if (!endpoints['/'].entries.includes(ident)) {
        endpoints['/'].entries.push(ident);
      }

      let endpoint = '';
      for (const part of ident.split('.')) {
        endpoint += '/' + part;
        if (!(endpoint in endpoints)) {
          endpoints[endpoint] = {
            httpsOnly: false,
            entries: []
          };
        }

        if (!endpoints[endpoint].entries.includes(ident)) {
          endpoints[endpoint].entries.push(ident);
        }
      }

      // Main endpoints (removal expected soon)
      for (const exposure of test.exposure) {
        let endpoint = '';
        let httpsOnly = false;
        switch (test.category) {
          case 'api':
            switch (exposure) {
              case 'Window':
                endpoint = '/main/api/interfaces';
                break;
              case 'Worker':
              case 'DedicatedWorker':
                endpoint = '/main/api/workerinterfaces';
                break;
              case 'ServiceWorker':
                endpoint = '/main/api/serviceworkerinterfaces';
                httpsOnly = true;
                break;
            }
            break;
          case 'css':
            endpoint = '/main/css/properties';
            break;
        }

        if (endpoint) {
          if (!(endpoint in endpoints)) {
            endpoints[endpoint] = {
              exposure: exposure,
              httpsOnly: httpsOnly,
              entries: []
            };
          }

          endpoints[endpoint].entries.push(ident);
        }
      }
    }

    return endpoints;
  }

  listMainEndpoints(urlPrefix = '') {
    return Object.keys(this.endpoints).filter((item) => (
      item.startsWith('/main')
    )).map((item) => (
      // The empty string is to tell the frontend this is a main test,
      // and label the first one as "All Tests"
      ['', `${urlPrefix}${item}`]
    ));
  }

  listIndividualEndpoints(urlPrefix = '') {
    return Object.keys(this.endpoints).filter((item) => (
      !item.startsWith('/main')
    )).map((item) => (
      [item.substr(1).replace(/\//g, '.'), `${urlPrefix}${item}`]
    ));
  }

  listAllEndpoints(urlPrefix = '') {
    return [
      ...this.listMainEndpoints(urlPrefix),
      ...this.listIndividualEndpoints(urlPrefix)
    ];
  }

  next(after) {
    const afterURL = new URL(after);
    if (!this.httpOnly && afterURL.protocol === 'http:') {
      return `https://${this.host}${afterURL.pathname}?reportToServer`;
    }
    const endpoints = this.listMainEndpoints('/tests');
    const index = endpoints.findIndex((item) => {
      return item[1] === afterURL.pathname;
    }) + 1;

    if (index == 0 || index >= endpoints.length) {
      return null;
    }

    const endpoint = endpoints[index][1];

    if (this.endpoints[endpoint.replace('/tests', '')].httpsOnly) {
      const newUrl = `https://${this.host}${endpoint}?reportToServer`;
      if (this.httpOnly) {
        // Skip this endpoint and go to the next
        return this.next(newUrl);
      }
      return newUrl;
    }

    return `http://${this.host}${endpoint}?reportToServer`;
  }

  getExposure(endpoint) {
    const e = this.endpoints[endpoint];
    return e ? e.exposure : '';
  }

  isIndividual(endpoint) {
    return !(endpoint in this.endpoints);
  }

  getTests(endpoint, testExposure) {
    let idents;
    const individual = this.isIndividual(endpoint);

    if (individual) {
      idents = Object.keys(this.tests).filter(
          (ident) => ident.startsWith(endpoint.substr(1).replace(/\//g, '.'))
      );
    } else {
      idents = this.endpoints[endpoint].entries;
    }

    if (!testExposure) {
      testExposure = individual ? '' : this.getExposure(endpoint);
    }

    const tests = [];

    for (const ident of idents) {
      const test = this.tests[ident];
      for (const exposure of test.exposure) {
        if (!testExposure || exposure == testExposure) {
          tests.push({ident: ident, tests: test.tests, exposure: exposure});
        }
      }
    }

    return tests;
  }
}

module.exports = Tests;
