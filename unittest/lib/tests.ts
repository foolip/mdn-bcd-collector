//
// mdn-bcd-collector: unittest/unit/tests.ts
// Unittest for the Tests class
//
// © Google LLC, Gooborg Studios
// See the LICENSE file for copyright details
//

import {assert} from 'chai';

import Tests from '../../lib/tests.js';

const testDatabase = {
  'api.AbortController': {
    code: '"AbortController" in self',
    exposure: ['Window', 'Worker', 'ServiceWorker']
  },
  'api.AbortController.signal': {
    code: '"AbortController" in self && "signal" in AbortController.prototype',
    resources: {
      'audio-blip': {
        type: 'audio',
        src: '/media/blip.mp3'
      }
    },
    exposure: ['Window', 'Worker']
  },
  'css.properties.font-family': {
    code: '"fontFamily" in document.body.style || "font-family" in document.body.style',
    exposure: ['Window']
  },
  'javascript.builtins.array': {
    code: '[1, 2, 3]',
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
      '': [
        'api.AbortController',
        'api.AbortController.signal',
        'css.properties.font-family',
        'javascript.builtins.array'
      ],
      api: ['api.AbortController', 'api.AbortController.signal'],
      'api.AbortController': [
        'api.AbortController',
        'api.AbortController.signal'
      ],
      'api.AbortController.signal': ['api.AbortController.signal'],
      css: ['css.properties.font-family'],
      'css.properties': ['css.properties.font-family'],
      'css.properties.font-family': ['css.properties.font-family'],
      javascript: ['javascript.builtins.array'],
      'javascript.builtins': ['javascript.builtins.array'],
      'javascript.builtins.array': ['javascript.builtins.array']
    };

    const endpoints = tests.buildEndpoints();

    assert.deepEqual(endpoints, expectedEndpoints);
  });

  it('listEndpoints', () => {
    assert.deepEqual(tests.listEndpoints(), [
      '',
      'api',
      'api.AbortController',
      'api.AbortController.signal',
      'css',
      'css.properties',
      'css.properties.font-family',
      'javascript',
      'javascript.builtins',
      'javascript.builtins.array'
    ]);
  });

  describe('getTests', () => {
    it('individual endpoint', () => {
      assert.deepEqual(tests.getTests('api.AbortController'), [
        {
          ident: 'api.AbortController',
          tests: [{code: '"AbortController" in self'}],
          exposure: 'Window',
          resources: {}
        },
        {
          ident: 'api.AbortController',
          tests: [{code: '"AbortController" in self'}],
          exposure: 'Worker',
          resources: {}
        },
        {
          ident: 'api.AbortController',
          tests: [{code: '"AbortController" in self'}],
          exposure: 'ServiceWorker',
          resources: {}
        },
        {
          ident: 'api.AbortController.signal',
          tests: [
            {
              code: '"AbortController" in self && "signal" in AbortController.prototype'
            }
          ],
          exposure: 'Window',
          resources: {'audio-blip': {type: 'audio', src: '/media/blip.mp3'}}
        },
        {
          ident: 'api.AbortController.signal',
          tests: [
            {
              code: '"AbortController" in self && "signal" in AbortController.prototype'
            }
          ],
          exposure: 'Worker',
          resources: {'audio-blip': {type: 'audio', src: '/media/blip.mp3'}}
        }
      ]);
    });

    it('limited scope', () => {
      assert.deepEqual(tests.getTests('api.AbortController', 'Window'), [
        {
          ident: 'api.AbortController',
          tests: [{code: '"AbortController" in self'}],
          exposure: 'Window',
          resources: {}
        },
        {
          ident: 'api.AbortController.signal',
          tests: [
            {
              code: '"AbortController" in self && "signal" in AbortController.prototype'
            }
          ],
          exposure: 'Window',
          resources: {'audio-blip': {type: 'audio', src: '/media/blip.mp3'}}
        }
      ]);
    });

    it('filtering out ignored tests', () => {
      // Filter out a single test.
      assert.deepEqual(
        tests.getTests('api', 'Window', ['api.AbortController.signal']),
        [
          {
            ident: 'api.AbortController',
            tests: [{code: '"AbortController" in self'}],
            exposure: 'Window',
            resources: {}
          }
        ]
      );

      // Filter out a tests recursively.
      assert.deepEqual(
        tests.getTests('api', 'Window', ['api.AbortController']),
        []
      );

      // Matching prefix does not ignore a test.
      assert.deepEqual(tests.getTests('api', 'Window', ['api.Abort']), [
        {
          ident: 'api.AbortController',
          tests: [{code: '"AbortController" in self'}],
          exposure: 'Window',
          resources: {}
        },
        {
          ident: 'api.AbortController.signal',
          tests: [
            {
              code: '"AbortController" in self && "signal" in AbortController.prototype'
            }
          ],
          exposure: 'Window',
          resources: {'audio-blip': {type: 'audio', src: '/media/blip.mp3'}}
        }
      ]);
    });
  });
});
