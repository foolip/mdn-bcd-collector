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
    const endpoints = {};

    for (const [ident, test] of Object.entries(this.tests)) {
      for (const scope of test.scope) {
        let endpoint = '';
        let httpsOnly = false;
        switch (scope) {
          case 'Window':
            endpoint = '/api/interfaces';
            break;
          case 'Worker':
          case 'DedicatedWorker':
            endpoint = '/api/workerinterfaces';
            break;
          case 'ServiceWorker':
            endpoint = '/api/serviceworkerinterfaces';
            httpsOnly = true;
            break;
          case 'CSS':
            endpoint = '/css/properties';
            break;
        }

        if (endpoint) {
          if (!(endpoint in endpoints)) {
            endpoints[endpoint] = {
              scope: scope,
              httpsOnly: httpsOnly,
              entries: []
            };
          }
          if (!(ident in endpoints[endpoint].entries)) {
            endpoints[endpoint].entries.push(ident);
          }
        }
      }
    }

    return endpoints;
  }

  listMainEndpoints(urlPrefix = '') {
    return Object.keys(this.endpoints).map((item) => (
      ['', `${urlPrefix}${item}`]
    ));
  }

  listIndividual(urlPrefix = '') {
    return Object.keys(this.tests).map((item) => (
      [item, `${urlPrefix}/${item.replace(/\./g, '/')}`]
    ));
  }

  listAllEndpoints(urlPrefix = '') {
    return [
      ...this.listMainEndpoints(urlPrefix),
      ...this.listIndividual(urlPrefix)
    ];
  }

  next(after) {
    const afterURL = new URL(after);
    if (!this.httpOnly && afterURL.protocol === 'http:') {
      return `https://${this.host}${afterURL.pathname}`;
    }
    const endpoints = this.listMainEndpoints('/tests');
    const index = endpoints.findIndex((item) => {
      return item[1] === afterURL.pathname;
    }) + 1;

    if (index >= endpoints.length) {
      return null;
    }

    const endpoint = endpoints[index][1];

    if (this.endpoints[endpoint.replace('/tests', '')].httpsOnly) {
      const newUrl = `https://${this.host}${endpoint}`;
      if (this.httpOnly) {
        // Skip this endpoint and go to the next
        return this.next(newUrl);
      }
      return newUrl;
    }

    return `http://${this.host}${endpoint}`;
  }

  getTests(endpoint) {
    let idents = [];
    if (endpoint in this.endpoints) {
      idents = this.endpoints[endpoint].entries;
    } else {
      idents = Object.keys(this.tests).filter(
          (ident) => ident.startsWith(endpoint.substr(1).replace(/\//g, '.'))
      );
    }

    const tests = {};

    for (const ident of idents) {
      tests[ident] = this.tests[ident];
    }

    return tests;
  }

  getScope(endpoint) {
    const e = this.endpoints[endpoint];
    return e ? e.scope : '';
  }

  generateTestPage(endpoint, testScope) {
    const theseTests = this.getTests(endpoint);
    const individual = !(endpoint in this.endpoints);

    if (!testScope) {
      testScope = individual ? '' : this.getScope(endpoint);
    }

    const lines = [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '<meta charset="utf-8">',
      '<script src="/resources/json3.min.js"></script>',
      '<script src="/resources/harness.js"></script>',
      '<script src="/resources/core.js"></script>',
      '<style>',
      '@media (prefers-color-scheme: dark) {',
      'body {',
      'background-color: #111;',
      'color: white;',
      '}',
      '}',
      '</style>',
      '</head>',
      '<body>',
      '<p id="status">Running tests...</p>',
      '<script>'
    ];

    for (const [ident, test] of Object.entries(theseTests)) {
      for (const scope of test.scope) {
        if (!testScope || scope == testScope) {
          lines.push(`bcd.addTest("${ident}", ${JSON.stringify(test.tests)}, "${scope}");`);
        }
      }
    }

    lines.push(individual ? 'bcd.runAndDisplay();' : 'bcd.runAndReport();');
    lines.push('</script>', '</body>', '</html>');

    return lines.join('\n');
  }
}

module.exports = Tests;
