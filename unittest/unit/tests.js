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

const assert = require('chai').assert;

const Tests = require('../../tests');

const testDatabase = {
  'api.AbortController': {
    tests: [{code: '"AbortController" in self'}],
    category: 'api',
    resources: {},
    exposure: ['Window', 'Worker', 'ServiceWorker']
  },
  'api.AbortController.signal': {
    tests: [{code: '"AbortController" in self && "signal" in AbortController.prototype'}],
    category: 'api',
    resources: {
      'audio-blip': {
        type: 'audio',
        src: '/media/blip.mp3'
      }
    },
    exposure: ['Window', 'Worker']
  },
  'css.properties.font-family': {
    tests: [{code: '"fontFamily" in document.body.style || CSS.supports("font-family", "inherit")'}],
    category: 'css',
    resources: {},
    exposure: ['Window']
  },
  'javascript.builtins.array': {
    tests: [{code: '[1, 2, 3]'}],
    category: 'javascript',
    resources: {},
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

    const endpoints = tests.buildEndpoints(tests);

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
        {ident: 'api.AbortController', tests: [{code: '"AbortController" in self'}], exposure: 'Window', resources: {}},
        {ident: 'api.AbortController', tests: [{code: '"AbortController" in self'}], exposure: 'Worker', resources: {}},
        {ident: 'api.AbortController', tests: [{code: '"AbortController" in self'}], exposure: 'ServiceWorker', resources: {}},
        {ident: 'api.AbortController.signal', tests: [{code: '"AbortController" in self && "signal" in AbortController.prototype'}], exposure: 'Window', resources: {'audio-blip': {type: 'audio', src: '/media/blip.mp3'}}},
        {ident: 'api.AbortController.signal', tests: [{code: '"AbortController" in self && "signal" in AbortController.prototype'}], exposure: 'Worker', resources: {'audio-blip': {type: 'audio', src: '/media/blip.mp3'}}}
      ]);
    });

    it('limited scope', () => {
      assert.deepEqual(tests.getTests('api.AbortController', 'Window'), [
        {ident: 'api.AbortController', tests: [{code: '"AbortController" in self'}], exposure: 'Window', resources: {}},
        {ident: 'api.AbortController.signal', tests: [{code: '"AbortController" in self && "signal" in AbortController.prototype'}], exposure: 'Window', resources: {'audio-blip': {type: 'audio', src: '/media/blip.mp3'}}}
      ]);
    });
  });
});
