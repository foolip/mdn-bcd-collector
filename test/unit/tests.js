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
    'api.AbortController': true,
    'api.AbortController.controller': false,
    'api.FooBar': null
  },
  endpoints: {
    main: {
      '/api/interfaces': {
        scope: 'Window',
        httpsOnly: false,
        entries: [
          'api.AbortController',
          'api.AbortController.controller'
        ]
      },
      '/api/serviceworkerinterfaces': {
        scope: 'ServiceWorker',
        httpsOnly: true,
        entries: [
          'api.AbortController'
        ]
      }
    },
    individual: {
      '/api/AbortController': [
        'api.AbortController',
        'api.AbortController.controller'
      ],
      '/api/AbortController/controller': [
        'api.AbortController.controller'
      ]
    }
  }
};

describe('Tests', () => {
  const tests = new Tests({
    manifest: MANIFEST,
    host: 'host.test'
  });

  it('getTests', () => {
    assert.deepEqual(tests.getTests('/api/interfaces'), {
      'api.AbortController': true,
      'api.AbortController.controller': false
    });
    assert.deepEqual(tests.getTests('/api/serviceworkerinterfaces'), {
      'api.AbortController': true
    });
  });

  it('getScope', () => {
    assert.equal(tests.getScope('/api/interfaces'), 'Window');
    assert.equal(tests.getScope('/api/serviceworkerinterfaces'), 'ServiceWorker');
    assert.equal(tests.getScope('/api/dummy'), '');
  });

  it('listEndpoints', () => {
    assert.deepEqual(tests.listEndpoints(), [
      '/api/interfaces',
      '/api/serviceworkerinterfaces'
    ]);
  });

  it('listIndividual', () => {
    assert.deepEqual(tests.listIndividual(), [
      ['api.AbortController', '/api/AbortController'],
      ['api.AbortController.controller', '/api/AbortController/controller']
    ]);
  });
});
