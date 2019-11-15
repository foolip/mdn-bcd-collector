// Copyright 2019 Google LLC
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

/* eslint no-undef: 0 */

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
    bcd.test('name', function() {
      return true;
    });
    bcd.run(function(results) {
      assert.deepStrictEqual(results, [{
        name: 'name',
        result: true
      }]);
      done();
    });
  });

  it('return false', function(done) {
    bcd.test('name', function() {
      return false;
    });
    bcd.run(function(results) {
      assert.deepStrictEqual(results, [{
        name: 'name',
        result: false
      }]);
      done();
    });
  });

  it('return null', function(done) {
    bcd.test('name', function() {
      return null;
    });
    bcd.run(function(results) {
      assert.deepStrictEqual(results, [{
        name: 'name',
        result: null,
        message: 'returned null'
      }]);
      done();
    });
  });

  it('return object', function(done) {
    bcd.test('name', function() {
      return {};
    });
    bcd.run(function(results) {
      assert.deepStrictEqual(results, [{
        name: 'name',
        result: null,
        message: 'returned [object Object]'
      }]);
      done();
    });
  });

  it('return symbol', function(done) {
    if (typeof Symbol === 'undefined') {
      this.skip();
    }
    bcd.test('name', function() {
      return Symbol('bar');
    });
    bcd.run(function(results) {
      assert.deepStrictEqual(results, [{
        name: 'name',
        result: null,
        message: "returned Symbol(bar)"
      }]);
      done();
    });
  });

  it('return undefined', function(done) {
    bcd.test('name', function() {
      return undefined;
    });
    bcd.run(function(results) {
      assert.deepStrictEqual(results, [{
        name: 'name',
        result: null,
        message: 'returned undefined'
      }]);
      done();
    });
  });

  it('throw error', function(done) {
    bcd.test('name', function() {
      throw new Error('something went wrong');
    });
    bcd.run(function(results) {
      assert.deepStrictEqual(results, [{
        name: 'name',
        result: null,
        message: 'threw Error: something went wrong'
      }]);
      done();
    });
  });

  it('include info', function(done) {
    var info = { 'extra': 'stuff' };
    bcd.test('ctx', function() {}, info);
    bcd.run(function(results) {
      assert.strictEqual(results[0].info, info);
      done();
    });
  });

  it('two tests', function(done) {
    bcd.test('first', function() {
      return true;
    }, {a: 1});
    bcd.test('second', function() {
      return false;
    }, {b: 2});
    bcd.run(function(results) {
      assert.deepEqual(results, [{
          name: 'first',
          result: true,
          info: {a: 1}
        }, {
          name: 'second',
          result: false,
          info: {b: 2}
      }]);
      done();
    });
  });
});

mocha.run();
