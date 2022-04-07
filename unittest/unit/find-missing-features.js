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

import {assert} from 'chai';
import sinon from 'sinon';
import fs from 'fs-extra';

import {traverseFeatures, getMissing} from '../../find-missing-features.js';

import bcd from './bcd.test.js';
const tests = await fs.readJson(new URL('./tests.test.json', import.meta.url));

describe('find-missing-features', () => {
  describe('traverseFeatures', () => {
    it('normal', () => {
      assert.deepEqual(traverseFeatures(bcd, ''), [
        'api.AbortController',
        'api.AbortController.AbortController',
        'api.AbortController.abort',
        'api.AbortController.dummy',
        'api.AbortController.signal',
        'api.AudioContext',
        'api.AudioContext.close',
        'api.DeprecatedInterface',
        'api.DummyAPI',
        'api.DummyAPI.dummy',
        'api.ExperimentalInterface',
        'api.NullAPI',
        'api.RemovedInterface',
        'css.properties.font-family',
        'css.properties.font-face',
        'javascript.builtins.Array',
        'javascript.builtins.Date'
      ]);
    });

    it('include aliases', () => {
      assert.deepEqual(traverseFeatures(bcd, '', true), [
        'api.AbortController',
        'api.AbortController.AbortController',
        'api.AbortController.abort',
        'api.AbortController.dummy',
        'api.AbortController.signal',
        'api.AudioContext',
        'api.webkitAudioContext',
        'api.AudioContext.close',
        'api.DeprecatedInterface',
        'api.DummyAPI',
        'api.DummyAPI.dummy',
        'api.ExperimentalInterface',
        'api.TryingOutInterface',
        'api.NullAPI',
        'api.RemovedInterface',
        'css.properties.font-family',
        'css.properties.font-face',
        'javascript.builtins.Array',
        'javascript.builtins.Date'
      ]);
    });
  });

  describe('getMissing', () => {
    beforeEach(() => {
      sinon.stub(console, 'log');
    });

    it('collector <- bcd', () => {
      assert.deepEqual(getMissing(bcd, tests), {
        missingEntries: [
          'api.AbortController.AbortController',
          'api.AbortController.abort',
          'api.AbortController.dummy',
          'api.AudioContext',
          'api.AudioContext.close',
          'api.DeprecatedInterface',
          'api.DummyAPI',
          'api.DummyAPI.dummy',
          'api.ExperimentalInterface',
          'api.NullAPI',
          'api.RemovedInterface',
          'css.properties.font-face',
          'javascript.builtins.Date'
        ],
        total: 17
      });
    });

    it('bcd <- collector', () => {
      assert.deepEqual(getMissing(bcd, tests, 'bcd-from-collector'), {
        missingEntries: ['javascript.builtins.Error'],
        total: 5
      });
    });

    it('filter category', () => {
      assert.deepEqual(getMissing(bcd, tests, 'collector-from-bcd', ['api']), {
        missingEntries: [
          'api.AbortController.AbortController',
          'api.AbortController.abort',
          'api.AbortController.dummy',
          'api.AudioContext',
          'api.AudioContext.close',
          'api.DeprecatedInterface',
          'api.DummyAPI',
          'api.DummyAPI.dummy',
          'api.ExperimentalInterface',
          'api.NullAPI',
          'api.RemovedInterface'
        ],
        total: 13
      });
    });

    it('unknown direction', () => {
      assert.deepEqual(getMissing(bcd, tests, 'foo-from-bar'), {
        missingEntries: [
          'api.AbortController.AbortController',
          'api.AbortController.abort',
          'api.AbortController.dummy',
          'api.AudioContext',
          'api.AudioContext.close',
          'api.DeprecatedInterface',
          'api.DummyAPI',
          'api.DummyAPI.dummy',
          'api.ExperimentalInterface',
          'api.NullAPI',
          'api.RemovedInterface',
          'css.properties.font-face',
          'javascript.builtins.Date'
        ],
        total: 17
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
