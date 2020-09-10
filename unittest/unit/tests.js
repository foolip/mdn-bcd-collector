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

const assert = require('assert');
const Tests = require('../../tests');

const testDatabase = {
  'api.AbortController': {
    tests: [{code: '"AbortController" in self', prefix: ''}],
    category: 'api',
    exposure: ['Window', 'Worker', 'ServiceWorker']
  },
  'api.AbortController.signal': {
    tests: [{code: '"AbortController" in self && "signal" in AbortController.prototype', prefix: ''}],
    category: 'api',
    exposure: ['Window', 'Worker']
  },
  'css.properties.font-family': {
    tests: [{code: '"fontFamily" in document.body.style || CSS.supports("font-family", "inherit")', prefix: ''}],
    category: 'css',
    exposure: ['Window']
  },
  'javascript.builtins.array': {
    tests: [{code: '[1, 2, 3]', prefix: ''}],
    category: 'javascript',
    exposure: ['JavaScript']
  }
};

describe('Tests', () => {
  const tests = new Tests({
    tests: testDatabase,
    host: 'host.test'
  });

  it('buildEndpoints', () => {
    const expectedEndpoints = {
      '/': {
        entries: [
          'api.AbortController',
          'api.AbortController.signal',
          'css.properties.font-family',
          'javascript.builtins.array'
        ],
        httpsOnly: false
      },
      '/api': {
        entries: ['api.AbortController', 'api.AbortController.signal'],
        httpsOnly: false
      },
      '/api/AbortController': {
        entries: ['api.AbortController', 'api.AbortController.signal'],
        httpsOnly: false
      },
      '/api/AbortController/signal': {
        entries: ['api.AbortController.signal'],
        httpsOnly: false
      },
      '/css': {
        entries: ['css.properties.font-family'],
        httpsOnly: false
      },
      '/css/properties': {
        entries: ['css.properties.font-family'],
        httpsOnly: false
      },
      '/css/properties/font-family': {
        entries: ['css.properties.font-family'],
        httpsOnly: false
      },
      '/javascript': {
        entries: ['javascript.builtins.array'],
        httpsOnly: false
      },
      '/javascript/builtins': {
        entries: ['javascript.builtins.array'],
        httpsOnly: false
      },
      '/javascript/builtins/array': {
        entries: ['javascript.builtins.array'],
        httpsOnly: false
      },
      '/main/api/interfaces': {
        entries: ['api.AbortController', 'api.AbortController.signal'],
        httpsOnly: false,
        exposure: 'Window'
      },
      '/main/api/serviceworkerinterfaces': {
        entries: ['api.AbortController'],
        httpsOnly: true,
        exposure: 'ServiceWorker'
      },
      '/main/api/workerinterfaces': {
        entries: ['api.AbortController', 'api.AbortController.signal'],
        httpsOnly: false,
        exposure: 'Worker'
      },
      '/main/css/properties': {
        entries: ['css.properties.font-family'],
        httpsOnly: false,
        exposure: 'Window'
      }
    };

    const endpoints = tests.buildEndpoints(tests);

    assert.deepEqual(endpoints, expectedEndpoints);
  });

  it('listMainEndpoints', () => {
    assert.deepEqual(tests.listMainEndpoints(), [
      ['', '/main/api/interfaces'],
      ['', '/main/api/workerinterfaces'],
      ['', '/main/api/serviceworkerinterfaces'],
      ['', '/main/css/properties']
    ]);
  });

  it('listIndividualEndpoints', () => {
    assert.deepEqual(tests.listIndividualEndpoints(), [
      ['', '/'],
      ['api', '/api'],
      ['api.AbortController', '/api/AbortController'],
      ['api.AbortController.signal', '/api/AbortController/signal'],
      ['css', '/css'],
      ['css.properties', '/css/properties'],
      ['css.properties.font-family', '/css/properties/font-family'],
      ['javascript', '/javascript'],
      ['javascript.builtins', '/javascript/builtins'],
      ['javascript.builtins.array', '/javascript/builtins/array']
    ]);
  });

  it('listAllEndpoints', () => {
    assert.deepEqual(tests.listAllEndpoints(), [
      ['', '/main/api/interfaces'],
      ['', '/main/api/workerinterfaces'],
      ['', '/main/api/serviceworkerinterfaces'],
      ['', '/main/css/properties'],
      ['', '/'],
      ['api', '/api'],
      ['api.AbortController', '/api/AbortController'],
      ['api.AbortController.signal', '/api/AbortController/signal'],
      ['css', '/css'],
      ['css.properties', '/css/properties'],
      ['css.properties.font-family', '/css/properties/font-family'],
      ['javascript', '/javascript'],
      ['javascript.builtins', '/javascript/builtins'],
      ['javascript.builtins.array', '/javascript/builtins/array']
    ]);
  });

  describe('next', () => {
    it('normal', () => {
      assert.equal(
          tests.next('http://host.test/tests/main/api/interfaces'),
          'https://host.test/tests/main/api/interfaces?reportToServer'
      );
      assert.equal(
          tests.next('https://host.test/tests/main/api/interfaces'),
          'http://host.test/tests/main/api/workerinterfaces?reportToServer'
      );
      assert.equal(
          tests.next('https://host.test/tests/main/api/workerinterfaces'),
          'https://host.test/tests/main/api/serviceworkerinterfaces?reportToServer'
      );

      assert.equal(
          tests.next('https://host.test/tests/main/css/properties'),
          null
      );
    });

    it('HTTP only', () => {
      const theseTests = new Tests({
        tests: testDatabase,
        host: 'host.test',
        httpOnly: true
      });

      assert.equal(
          theseTests.next('http://host.test/tests/main/api/interfaces'),
          'http://host.test/tests/main/api/workerinterfaces?reportToServer'
      );
      assert.equal(
          theseTests.next('http://host.test/tests/main/api/workerinterfaces'),
          'http://host.test/tests/main/css/properties?reportToServer'
      );

      assert.equal(
          theseTests.next('http://host.test/tests/main/css/properties'),
          null
      );
    });
  });

  describe('getTests', () => {
    it('main endpoints', () => {
      assert.deepEqual(tests.getTests('/main/api/interfaces'), [
        {ident: 'api.AbortController', tests: [{code: '"AbortController" in self', prefix: ''}], exposure: 'Window'},
        {ident: 'api.AbortController.signal', tests: [{code: '"AbortController" in self && "signal" in AbortController.prototype', prefix: ''}], exposure: 'Window'}
      ]);

      assert.deepEqual(tests.getTests('/main/api/serviceworkerinterfaces'), [
        {ident: 'api.AbortController', tests: [{code: '"AbortController" in self', prefix: ''}], exposure: 'ServiceWorker'}
      ]);
    });

    it('individual endpoint', () => {
      assert.deepEqual(tests.getTests('/api/AbortController'), [
        {ident: 'api.AbortController', tests: [{code: '"AbortController" in self', prefix: ''}], exposure: 'Window'},
        {ident: 'api.AbortController', tests: [{code: '"AbortController" in self', prefix: ''}], exposure: 'Worker'},
        {ident: 'api.AbortController', tests: [{code: '"AbortController" in self', prefix: ''}], exposure: 'ServiceWorker'},
        {ident: 'api.AbortController.signal', tests: [{code: '"AbortController" in self && "signal" in AbortController.prototype', prefix: ''}], exposure: 'Window'},
        {ident: 'api.AbortController.signal', tests: [{code: '"AbortController" in self && "signal" in AbortController.prototype', prefix: ''}], exposure: 'Worker'}
      ]);
    });

    it('limited scope', () => {
      assert.deepEqual(tests.getTests('/api/AbortController', 'Window'), [
        {ident: 'api.AbortController', tests: [{code: '"AbortController" in self', prefix: ''}], exposure: 'Window'},
        {ident: 'api.AbortController.signal', tests: [{code: '"AbortController" in self && "signal" in AbortController.prototype', prefix: ''}], exposure: 'Window'}
      ]);
    });
  });

  it('getExposure', () => {
    assert.equal(tests.getExposure('/main/api/interfaces'), 'Window');
    assert.equal(tests.getExposure('/main/api/serviceworkerinterfaces'), 'ServiceWorker');
    assert.equal(tests.getExposure('/api/dummy'), '');
  });
});
