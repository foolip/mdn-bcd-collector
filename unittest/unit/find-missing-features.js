//
// mdn-bcd-collector: unittest/unit/find-missing-features.js
// Unittest for the missing features finder script
//
// © Gooborg Studios, Google LLC
// See the LICENSE file for copyright details
//

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
        'api.SuperNewInterface',
        'css.properties.font-family',
        'css.properties.font-face',
        'css.properties.font-style',
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
        'api.SuperNewInterface',
        'css.properties.font-family',
        'css.properties.font-face',
        'css.properties.font-style',
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
      const expected = {
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
          'api.SuperNewInterface',
          'css.properties.font-face',
          'css.properties.font-style',
          'javascript.builtins.Date'
        ],
        total: 19
      };

      assert.deepEqual(getMissing(bcd, tests), expected);

      assert.isTrue(console.log.notCalled);

      // Unknown direction defaults to collector <- bcd
      assert.deepEqual(getMissing(bcd, tests, 'foo-from-bar'), expected);

      assert.isTrue(
        console.log.calledWith(
          "Direction 'foo-from-bar' is unknown; defaulting to collector <- bcd"
        )
      );
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
          'api.RemovedInterface',
          'api.SuperNewInterface'
        ],
        total: 14
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
          'api.SuperNewInterface',
          'css.properties.font-face',
          'css.properties.font-style',
          'javascript.builtins.Date'
        ],
        total: 19
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
