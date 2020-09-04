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

/* global mocha, chai, describe, it, location */
/* global bcd */

'use strict';

mocha.setup({
  ui: 'bdd',
  reporter: location.hash === '#reporter=json' ? 'json' : 'html'
});

var assert = chai.assert;

describe('harness.js', function() {
  it('no tests', function(done) {
    bcd.run('Window', function(results) {
      assert.isEmpty(results);
      done();
    });
  });

  it('return true', function(done) {
    bcd.addTest('name', 'true', 'test');
    bcd.run('Window', function(results) {
      assert.deepStrictEqual(results, [{
        name: 'name',
        result: true,
        info: {code: 'true', scope: 'test'}
      }]);
      done();
    });
  });

  it('return false', function(done) {
    bcd.addTest('name', 'false', 'test');
    bcd.run('Window', function(results) {
      assert.deepStrictEqual(results, [{
        name: 'name',
        result: false,
        info: {code: 'false', scope: 'test'}
      }]);
      done();
    });
  });

  it('return null', function(done) {
    bcd.addTest('name', 'null', 'test');
    bcd.run('Window', function(results) {
      console.log(results);
      assert.deepStrictEqual(results, [{
        name: 'name',
        result: null,
        message: 'returned null',
        info: {code: 'null', scope: 'test'}
      }]);
      done();
    });
  });

  it('return symbol', function(done) {
    if (typeof Symbol === 'undefined') {
      this.skip();
    }
    bcd.addTest('name', 'Symbol(\'bar\')', 'test');
    bcd.run('Window', function(results) {
      assert.deepStrictEqual(results, [{
        name: 'name',
        result: null,
        message: 'returned Symbol(bar)',
        info: {code: 'Symbol(\'bar\')', scope: 'test'}
      }]);
      done();
    });
  });

  it('return undefined', function(done) {
    bcd.addTest('name', 'undefined', 'test');
    bcd.run('Window', function(results) {
      assert.deepStrictEqual(results, [{
        name: 'name',
        result: null,
        message: 'returned undefined',
        info: {code: 'undefined', scope: 'test'}
      }]);
      done();
    });
  });

  it('throw error', function(done) {
    bcd.addTest('name', 'throw new Error(\'something went wrong\')', 'test');
    bcd.run('Window', function(results) {
      assert.deepStrictEqual(results, [{
        name: 'name',
        result: null,
        message: 'threw Error: something went wrong',
        info: {code: 'throw new Error(\'something went wrong\')', scope: 'test'}
      }]);
      done();
    });
  });

  it('include info', function(done) {
    var info = {'extra': 'stuff'};
    bcd.addTest('ctx', 'true', 'test', info);
    bcd.run('Window', function(results) {
      assert.deepStrictEqual(results[0].info, {
        extra: 'stuff', code: 'true', scope: 'test'
      });
      done();
    });
  });

  it('two tests', function(done) {
    bcd.addTest('first', 'true', 'test', {a: 1});
    bcd.addTest('second', 'false', 'test', {b: 2});
    bcd.run('Window', function(results) {
      assert.deepEqual(results, [{
        name: 'first',
        result: true,
        info: {code: 'true', scope: 'test', a: 1}
      }, {
        name: 'second',
        result: false,
        info: {code: 'false', scope: 'test', b: 2}
      }]);
      done();
    });
  });
});

mocha.run();
