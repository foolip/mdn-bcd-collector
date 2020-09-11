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
    bcd.run(function(results) {
      assert.isEmpty(results);
      done();
    });
  });

  it('return true', function(done) {
    bcd.addTest('name', [{code: 'true'}], 'Window');
    bcd.run(function(results) {
      assert.deepStrictEqual(results, [{
        name: 'name',
        result: true,
        info: {code: 'true', exposure: 'Window'}
      }]);
      done();
    });
  });

  it('return false', function(done) {
    bcd.addTest('name', [{code: 'false'}], 'Window');
    bcd.run(function(results) {
      assert.deepStrictEqual(results, [{
        name: 'name',
        result: false,
        info: {code: 'false', exposure: 'Window'}
      }]);
      done();
    });
  });

  it('return null', function(done) {
    bcd.addTest('name', [{code: 'null'}], 'Window');
    bcd.run(function(results) {
      assert.deepStrictEqual(results, [{
        name: 'name',
        result: null,
        message: 'returned null',
        info: {code: 'null', exposure: 'Window'}
      }]);
      done();
    });
  });

  it('return symbol', function(done) {
    if (typeof Symbol === 'undefined') {
      this.skip();
    }
    bcd.addTest('name', [{code: 'Symbol(\'bar\')'}], 'Window');
    bcd.run(function(results) {
      assert.deepStrictEqual(results, [{
        name: 'name',
        result: null,
        message: 'returned Symbol(bar)',
        info: {code: 'Symbol(\'bar\')', exposure: 'Window'}
      }]);
      done();
    });
  });

  it('return undefined', function(done) {
    bcd.addTest('name', [{code: 'undefined'}], 'Window');
    bcd.run(function(results) {
      assert.deepStrictEqual(results, [{
        name: 'name',
        result: null,
        message: 'returned undefined',
        info: {code: 'undefined', exposure: 'Window'}
      }]);
      done();
    });
  });

  it('throw error', function(done) {
    bcd.addTest('name', [{code: 'throw new Error(\'something went wrong\')'}], 'Window');
    bcd.run(function(results) {
      assert.deepStrictEqual(results, [{
        name: 'name',
        result: null,
        message: 'threw Error: something went wrong',
        info: {code: 'throw new Error(\'something went wrong\')', exposure: 'Window'}
      }]);
      done();
    });
  });

  it('include info', function(done) {
    bcd.addTest('ctx', [{code: 'true'}], 'Window', {'extra': 'stuff'});
    bcd.run(function(results) {
      assert.deepStrictEqual(results[0].info, {
        extra: 'stuff', code: 'true', exposure: 'Window'
      });
      done();
    });
  });

  it('two tests', function(done) {
    bcd.addTest('first', [{code: 'true'}], 'Window', {a: 1});
    bcd.addTest('second', [{code: 'false'}], 'Window', {b: 2});
    bcd.run(function(results) {
      assert.deepEqual(results, [{
        name: 'first',
        result: true,
        info: {code: 'true', exposure: 'Window', a: 1}
      }, {
        name: 'second',
        result: false,
        info: {code: 'false', exposure: 'Window', b: 2}
      }]);
      done();
    });
  });
});

mocha.run();
