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

import { assert } from 'chai';

import sinon from 'sinon';

import mockBcd from './bcd.test.js';

describe('find-missing', () => {
  const {traverseFeatures, getMissing} = esmock('../../find-missing-features.js', {
    '../../../browser-compat-data/index.js': {
      default: () => mockBcd
  });

  it('traverseFeatures', () => {
    assert.deepEqual(traverseFeatures(bcd, ''), [
      'api.AbortController',
      'api.AbortController.dummy',
      'api.AbortController.signal',
      'api.DummyAPI',
      'api.DummyAPI.dummy',
      'css.properties.font-family',
      'css.properties.font-face',
      'javascript.builtins.Array',
      'javascript.builtins.Date'
    ]);
  });

  describe('getMissing', () => {
    beforeEach(() => {
      sinon.stub(console, 'log');
    });

    it('collector <- bcd', () => {
      assert.deepEqual(getMissing(), {
        missingEntries: [
          'api.AbortController.dummy',
          'api.DummyAPI',
          'api.DummyAPI.dummy',
          'css.properties.font-face',
          'javascript.builtins.Date'
        ],
        total: 9
      });
    });

    it('bcd <- collector', () => {
      assert.deepEqual(getMissing('bcd-from-collector'), {
        missingEntries: ['javascript.builtins.Error'],
        total: 5
      });
    });

    it('filter category', () => {
      assert.deepEqual(getMissing('collector-from-bcd', ['api']), {
        missingEntries: [
          'api.AbortController.dummy',
          'api.DummyAPI',
          'api.DummyAPI.dummy'
        ],
        total: 5
      });
    });

    it('unknown direction', () => {
      assert.deepEqual(getMissing('foo-from-bar'), {
        missingEntries: [
          'api.AbortController.dummy',
          'api.DummyAPI',
          'api.DummyAPI.dummy',
          'css.properties.font-face',
          'javascript.builtins.Date'
        ],
        total: 9
      });

      assert.isTrue(
        console.log.calledWith(
          "Direction 'foo-from-bar' is unknown; defaulting to collector <- bcd"
        )
      );
    });

    afterEach(() => {
      console.log.restore();
    });
  });
});
