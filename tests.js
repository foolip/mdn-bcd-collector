//
// mdn-bcd-collector: tests.js
// Module for handling the tests for the web app
//
// © Google LLC, Gooborg Studios
// See the LICENSE file for copyright details
//

import didYouMean from 'didyoumean';

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

  getTests(endpoint, testExposure, ignoreIdents = []) {
    if (!(endpoint in this.endpoints)) {
      return [];
    }

    const idents = this.endpoints[endpoint];

    const tests = [];
    for (const ident of idents) {
      const ignore = ignoreIdents.some((ignoreIdent) => {
        return ident === ignoreIdent || ident.startsWith(`${ignoreIdent}.`);
      });
      if (ignore) {
        continue;
      }
      const test = this.tests[ident];
      for (const exposure of test.exposure) {
        if (!testExposure || exposure == testExposure) {
          tests.push({
            ident: ident,
            // TODO: Simplify this to just a code string.
            tests: [{code: test.code}],
            exposure: exposure,
            resources: test.resources || {}
          });
        }
      }
    }

    return tests;
  }
}

export default Tests;
