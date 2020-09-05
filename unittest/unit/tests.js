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

const MANIFEST = {
  tests: {
    'api.AbortController': {
      'code': '"AbortController" in self',
      'scope': [
        'Window',
        'Worker'
      ]
    },
    'api.AbortController.signal': {
      'code': '"AbortController" in self && "signal" in AbortController',
      'scope': [
        'Window',
        'Worker'
      ]
    },
    'api.FooBar': null
  },
  endpoints: {
    main: {
      '/tests/api/interfaces': {
        scope: 'Window',
        httpsOnly: false,
        entries: [
          'api.AbortController',
          'api.AbortController.signal'
        ]
      },
      '/tests/api/workerinterfaces': {
        scope: 'Worker',
        httpsOnly: false,
        entries: [
          'api.AbortController'
        ]
      },
      '/tests/api/serviceworkerinterfaces': {
        scope: 'ServiceWorker',
        httpsOnly: true,
        entries: []
      },
      '/tests/css/properties': {
        scope: 'CSS',
        httpsOnly: false,
        entries: []
      }
    },
    individual: {
      '/tests/api/AbortController': [
        'api.AbortController',
        'api.AbortController.signal'
      ],
      '/tests/api/AbortController/signal': [
        'api.AbortController.signal'
      ]
    }
  }
};

describe('Tests', () => {
  const tests = new Tests({
    manifest: MANIFEST,
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
        manifest: MANIFEST,
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
      '/tests/api/interfaces',
      '/tests/api/workerinterfaces',
      '/tests/api/serviceworkerinterfaces',
      '/tests/css/properties'
    ]);
  });

  it('listIndividual', () => {
    assert.deepEqual(tests.listIndividual(), [
      ['api.AbortController', '/tests/api/AbortController'],
      ['api.AbortController.signal', '/tests/api/AbortController/signal']
    ]);
  });

  it('listAllEndpoints', () => {
    assert.deepEqual(tests.listAllEndpoints(), [
      '/tests/api/interfaces',
      '/tests/api/workerinterfaces',
      '/tests/api/serviceworkerinterfaces',
      '/tests/css/properties',
      '/tests/api/AbortController',
      '/tests/api/AbortController/signal'
    ]);
  });

  it('getTests', () => {
    assert.deepEqual(tests.getTests('/tests/api/interfaces'), {
      'api.AbortController': {
        'code': '"AbortController" in self',
        'scope': ['Window', 'Worker']
      },
      'api.AbortController.signal': {
        'code': '"AbortController" in self && "signal" in AbortController',
        'scope': ['Window', 'Worker']
      }
    });
    assert.deepEqual(tests.getTests('/tests/api/workerinterfaces'), {
      'api.AbortController': {
        'code': '"AbortController" in self',
        'scope': ['Window', 'Worker']
      }
    });
  });

  it('getScope', () => {
    assert.equal(tests.getScope('/tests/api/interfaces'), 'Window');
    assert.equal(tests.getScope('/tests/api/serviceworkerinterfaces'), 'ServiceWorker');
    assert.equal(tests.getScope('/tests/api/dummy'), '');
  });
});
