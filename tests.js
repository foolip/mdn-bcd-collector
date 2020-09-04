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
    this.httpOnly = options.httpOnly;
  }

  next(after) {
    const afterURL = new URL(after);
    if (!this.httpOnly && afterURL.protocol === 'http:') {
      return `https://${this.host}${afterURL.pathname}`;
    } else {
      const endpoints = this.listEndpoints();
      const index = endpoints.findIndex((item) => {
        return item === afterURL.pathname;
      }) + 1;

      if (index >= endpoints.length) {
        return null;
      }

      if (this.endpoints[endpoints[index]].httpsOnly) {
        const newUrl = `https://${this.host}${endpoints[index]}`;
        if (this.httpOnly) {
          // Skip this endpoint and go to the next
          return this.next(newUrl);
        } else {
          return newUrl;
        }
      }

      return `http://${this.host}${endpoints[index]}`;
    }
  }

  getTests(endpoint) {
    const idents = this.endpoints[endpoint] ?
        this.endpoints[endpoint].entries :
        this.individualEndpoints[endpoint];
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

  generateTestPage(endpoint) {
    const theseTests = this.getTests(endpoint);
    let testScope = this.getScope(endpoint);
    let individual = false;

    const lines = [
      '<!DOCTYPE html>',
      '<html>',
      '<head>',
      '<meta charset="utf-8">',
      '<script src="/resources/json3.min.js"></script>',
      '<script src="/resources/harness.js"></script>',
      '<script src="/resources/core.js"></script>',
      '</head>',
      '<body>',
      '<p id="status">Running tests...</p>',
      '<script>'
    ];

    for (const [ident, test] of Object.entries(theseTests)) {
      for (const scope of test.scope) {
        if (!testScope) {
          // Set scope to the first found scope if it's an individual test
          testScope = scope;
          individual = true;
        }
        if (scope == testScope) {
          lines.push(`bcd.addTest("${ident}", ${JSON.stringify(test.code)}, "${scope}");`);
        }
      }
    }

    if (individual) {
      lines.push(`bcd.run('${testScope}', bcd.finishAndDisplay);`);
    } else {
      lines.push(`bcd.run('${testScope}');`);
    }

    lines.push('</script>', '</body>', '</html>');

    return lines.join('\n');
  }

  listEndpoints() {
    return Object.keys(this.endpoints);
  }

  listIndividual() {
    return Object.keys(this.individualEndpoints).map((item) => (
      [item.substr(1).replace('tests/', '').replace(/\//g, '.'), item]
    ));
  }
}

module.exports = Tests;
