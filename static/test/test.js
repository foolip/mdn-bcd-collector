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
  reporter: location.hash === '#reporter=json' ? 'json' : 'html',
});

var assert = chai.assert;

describe('harness.js', function() {
  it('no tests', function(done) {
    bcd.run(function(results) {
      assert.isEmpty(results);
      done();
    });
  });

  it('return function', function(done) {
    bcd.test('ctx', function() {
      function dostuff() {}
      return dostuff;
    });
    bcd.run(function(results) {
      assert.deepEqual(results[0].returns, {type:'function', length:0, name:'dostuff'});
      done();
    });
  });

  it('return null', function(done) {
    bcd.test('ctx', function() {
      return null;
    });
    bcd.run(function(results) {
      assert.deepEqual(results[0].returns, {type:'null'});
      done();
    });
  });

  it('return object', function(done) {
    bcd.test('ctx', function() {
      return {};
    });
    bcd.run(function(results) {
      assert.deepEqual(results[0].returns, {type:'object'});
      done();
    });
  });

  it('return string', function(done) {
    bcd.test('ctx', function() {
      return 'foo';
    });
    bcd.run(function(results) {
      assert.deepEqual(results[0].returns, {type:'string', value: 'foo'});
      done();
    });
  });

  it('return symbol', function(done) {
    if (typeof Symbol === 'undefined') {
      this.skip();
    }
    bcd.test('ctx', function() {
      return Symbol('bar');
    });
    bcd.run(function(results) {
      assert.deepEqual(results[0].returns, {type:'symbol'});
      done();
    });
  });

  it('return undefined', function(done) {
    bcd.test('ctx', function() {
      return undefined;
    });
    bcd.run(function(results) {
      assert.deepEqual(results[0].returns, {type:'undefined'});
      done();
    });
  });

  it('throw error', function(done) {
    bcd.test('ctx', function() {
      throw new Error('something went wrong');
    });
    bcd.run(function(results) {
      assert.deepEqual(results[0].throws, {type:'object'});
      done();
    });
  });

  it('throw string', function(done) {
    bcd.test('ctx', function() {
      throw 'oops';
    });
    bcd.run(function(results) {
      assert.deepEqual(results[0].throws, {type:'string', value:'oops'});
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
          context: 'first',
          returns: {type: 'boolean', value: true},
          info: {a: 1},
        }, {
          context: 'second',
          returns: {type: 'boolean', value: false},
          info: {b: 2},
      }]);
      done();
    });
  });
});

mocha.run();
