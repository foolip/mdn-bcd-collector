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
    code: '"AbortController" in self',
    scope: [
      'Window',
      'Worker'
    ]
  },
  'api.AbortController.signal': {
    code: '"AbortController" in self && "signal" in AbortController',
    scope: [
      'Window',
      'Worker'
    ]
  },
  'api.FooBar': null
};
const MANIFEST = {
  main: {
    '/api/interfaces': {
      scope: 'Window',
      httpsOnly: false,
      entries: [
        'api.AbortController',
        'api.AbortController.signal'
      ]
    },
    '/api/workerinterfaces': {
      scope: 'Worker',
      httpsOnly: false,
      entries: [
        'api.AbortController'
      ]
    },
    '/api/serviceworkerinterfaces': {
      scope: 'ServiceWorker',
      httpsOnly: true,
      entries: []
    },
    '/css/properties': {
      scope: 'CSS',
      httpsOnly: false,
      entries: []
    }
  },
  individual: {
    '/api/AbortController': [
      'api.AbortController',
      'api.AbortController.signal'
    ],
    '/api/AbortController/signal': [
      'api.AbortController.signal'
    ]
  }
};

describe('Tests', () => {
  const tests = new Tests({
    tests: testDatabase,
    endpoints: MANIFEST,
    host: 'host.test'
  });

  describe('next', () => {
    it('normal', () => {
      assert.equal(
          tests.next('http://host.test/tests/api/interfaces'),
          'https://host.test/tests/api/interfaces'
      );
      assert.equal(
          tests.next('https://host.test/tests/api/interfaces'),
          'http://host.test/tests/api/workerinterfaces'
      );
      assert.equal(
          tests.next('https://host.test/tests/api/workerinterfaces'),
          'https://host.test/tests/api/serviceworkerinterfaces'
      );

      assert.equal(
          tests.next('https://host.test/tests/css/properties'),
          null
      );
    });

    it('HTTP only', () => {
      const theseTests = new Tests({
        endpoints: MANIFEST,
        host: 'host.test',
        httpOnly: true
      });

      assert.equal(
          theseTests.next('http://host.test/tests/api/interfaces'),
          'http://host.test/tests/api/workerinterfaces'
      );
      assert.equal(
          theseTests.next('http://host.test/tests/api/workerinterfaces'),
          'http://host.test/tests/css/properties'
      );

      assert.equal(
          theseTests.next('http://host.test/tests/css/properties'),
          null
      );
    });
  });

  it('listMainEndpoints', () => {
    assert.deepEqual(tests.listMainEndpoints(), [
      '/api/interfaces',
      '/api/workerinterfaces',
      '/api/serviceworkerinterfaces',
      '/css/properties'
    ]);
  });

  it('listIndividual', () => {
    assert.deepEqual(tests.listIndividual(), [
      ['api.AbortController', '/api/AbortController'],
      ['api.AbortController.signal', '/api/AbortController/signal']
    ]);
  });

  it('listAllEndpoints', () => {
    assert.deepEqual(tests.listAllEndpoints(), [
      '/api/interfaces',
      '/api/workerinterfaces',
      '/api/serviceworkerinterfaces',
      '/css/properties',
      '/api/AbortController',
      '/api/AbortController/signal'
    ]);
  });

  it('getTests', () => {
    assert.deepEqual(tests.getTests('/api/interfaces'), {
      'api.AbortController': {
        code: '"AbortController" in self',
        scope: ['Window', 'Worker']
      },
      'api.AbortController.signal': {
        code: '"AbortController" in self && "signal" in AbortController',
        scope: ['Window', 'Worker']
      }
    });
    assert.deepEqual(tests.getTests('/api/workerinterfaces'), {
      'api.AbortController': {
        code: '"AbortController" in self',
        scope: ['Window', 'Worker']
      }
    });
  });

  it('getScope', () => {
    assert.equal(tests.getScope('/api/interfaces'), 'Window');
    assert.equal(tests.getScope('/api/serviceworkerinterfaces'), 'ServiceWorker');
    assert.equal(tests.getScope('/api/dummy'), '');
  });
});
