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

const proxyquire = require('proxyquire');

const tests = {
  'api.AbortController': {
    tests: [{code: '"AbortController" in self', prefix: ''}],
    category: 'api',
    resources: {},
    exposure: ['Window', 'Worker', 'ServiceWorker']
  },
  'api.AbortController.signal': {
    tests: [{code: '"AbortController" in self && "signal" in AbortController.prototype', prefix: ''}],
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
    tests: [{code: '"fontFamily" in document.body.style || CSS.supports("font-family", "inherit")', prefix: ''}],
    category: 'css',
    resources: {},
    exposure: ['Window']
  },
  'javascript.builtins.array': {
    tests: [{code: '[1, 2, 3]', prefix: ''}],
    category: 'javascript',
    resources: {},
    exposure: ['JavaScript']
  }
};
const bcd = {
  api: {
    AbortController: {
      __compat: {},
      dummy: {
        __compat: {}
      },
      signal: {
        __compat: {}
      }
    },
    DummyAPI: {
      __compat: {},
      dummy: {
        __compat: {}
      }
    }
  },
  css: {
    properties: {
      'font-family': {
        __compat: {}
      },
      'font-face': {
        __compat: {}
      }
    }
  }
};

const {traverseFeatures, findMissing} = proxyquire('../../find-missing', {
  './tests.json': Object.assign({}, tests),
  '@mdn/browser-compat-data': Object.assign({}, bcd)
});

describe('find-missing', () => {
  it('traverseFeatures', () => {
    assert.deepEqual(traverseFeatures(bcd, ''), [
      'api.AbortController',
      'api.AbortController.dummy',
      'api.AbortController.signal',
      'api.DummyAPI',
      'api.DummyAPI.dummy',
      'css.properties.font-family',
      'css.properties.font-face'
    ]);
  });

  it('findMissing', () => {
    assert.deepEqual(findMissing(bcd, ''), [
      'api.AbortController.dummy',
      'api.DummyAPI',
      'api.DummyAPI.dummy',
      'css.properties.font-face'
    ]);
  });
});
