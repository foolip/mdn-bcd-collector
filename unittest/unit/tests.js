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
    exposure: ['Window', 'Worker', 'ServiceWorker']
  },
  'api.AbortController.signal': {
    tests: [{code: '"AbortController" in self && "signal" in AbortController.prototype', prefix: ''}],
    exposure: ['Window', 'Worker']
  },
  'css.properties.font-family': {
    tests: [{code: '"fontFamily" in document.body.style || CSS.supports("font-family", "inherit")', prefix: ''}],
    exposure: ['CSS']
  },
  'javascript.builtins.array': {
    tests: [{code: '[1, 2, 3]', prefix: ''}],
    exposure: ['JavaScript']
  }
};
const endpoints = {
  '/api/interfaces': {
    exposure: 'Window',
    httpsOnly: false,
    entries: [
      'api.AbortController',
      'api.AbortController.signal'
    ]
  },
  '/api/workerinterfaces': {
    exposure: 'Worker',
    httpsOnly: false,
    entries: [
      'api.AbortController'
    ]
  },
  '/api/serviceworkerinterfaces': {
    exposure: 'ServiceWorker',
    httpsOnly: true,
    entries: []
  },
  '/css/properties': {
    exposure: 'CSS',
    httpsOnly: false,
    entries: []
  }
};

describe('Tests', () => {
  const tests = new Tests({
    tests: testDatabase,
    endpoints: endpoints,
    host: 'host.test'
  });

  it('buildEndpoints', () => {
    const expectedEndpoints = {
      '/api/interfaces': {
        entries: ['api.AbortController', 'api.AbortController.signal'],
        httpsOnly: false,
        exposure: 'Window'
      },
      '/api/serviceworkerinterfaces': {
        entries: ['api.AbortController'],
        httpsOnly: true,
        exposure: 'ServiceWorker'
      },
      '/api/workerinterfaces': {
        entries: ['api.AbortController', 'api.AbortController.signal'],
        httpsOnly: false,
        exposure: 'Worker'
      },
      '/css/properties': {
        entries: ['css.properties.font-family'],
        httpsOnly: false,
        exposure: 'CSS'
      }
    };

    const endpoints = tests.buildEndpoints(tests);

    assert.deepEqual(endpoints, expectedEndpoints);
  });

  it('listMainEndpoints', () => {
    assert.deepEqual(tests.listMainEndpoints(), [
      ['', '/api/interfaces'],
      ['', '/api/workerinterfaces'],
      ['', '/api/serviceworkerinterfaces'],
      ['', '/css/properties']
    ]);
  });

  it('listIndividual', () => {
    assert.deepEqual(tests.listIndividual(), [
      ['api.AbortController', '/api/AbortController'],
      ['api.AbortController.signal', '/api/AbortController/signal'],
      ['css.properties.font-family', '/css/properties/font-family'],
      ['javascript.builtins.array', '/javascript/builtins/array']
    ]);
  });

  it('listAllEndpoints', () => {
    assert.deepEqual(tests.listAllEndpoints(), [
      ['', '/api/interfaces'],
      ['', '/api/workerinterfaces'],
      ['', '/api/serviceworkerinterfaces'],
      ['', '/css/properties'],
      ['api.AbortController', '/api/AbortController'],
      ['api.AbortController.signal', '/api/AbortController/signal'],
      ['css.properties.font-family', '/css/properties/font-family'],
      ['javascript.builtins.array', '/javascript/builtins/array']
    ]);
  });

  describe('next', () => {
    it('normal', () => {
      assert.equal(
          tests.next('http://host.test/tests/api/interfaces'),
          'https://host.test/tests/api/interfaces?reportToServer'
      );
      assert.equal(
          tests.next('https://host.test/tests/api/interfaces'),
          'http://host.test/tests/api/workerinterfaces?reportToServer'
      );
      assert.equal(
          tests.next('https://host.test/tests/api/workerinterfaces'),
          'https://host.test/tests/api/serviceworkerinterfaces?reportToServer'
      );

      assert.equal(
          tests.next('https://host.test/tests/css/properties'),
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
          theseTests.next('http://host.test/tests/api/interfaces'),
          'http://host.test/tests/api/workerinterfaces?reportToServer'
      );
      assert.equal(
          theseTests.next('http://host.test/tests/api/workerinterfaces'),
          'http://host.test/tests/css/properties?reportToServer'
      );

      assert.equal(
          theseTests.next('http://host.test/tests/css/properties'),
          null
      );
    });
  });

  describe('getTests', () => {
    it('main endpoints', () => {
      assert.deepEqual(tests.getTests('/api/interfaces'), [
        {ident: 'api.AbortController', tests: [{code: '"AbortController" in self', prefix: ''}], exposure: 'Window'},
        {ident: 'api.AbortController.signal', tests: [{code: '"AbortController" in self && "signal" in AbortController.prototype', prefix: ''}], exposure: 'Window'}
      ]);

      assert.deepEqual(tests.getTests('/api/serviceworkerinterfaces'), [
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
    assert.equal(tests.getExposure('/api/interfaces'), 'Window');
    assert.equal(tests.getExposure('/api/serviceworkerinterfaces'), 'ServiceWorker');
    assert.equal(tests.getExposure('/api/dummy'), '');
  });
});
