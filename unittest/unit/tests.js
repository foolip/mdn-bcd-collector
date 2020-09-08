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

const assert = require('assert');
const Tests = require('../../tests');

const MANIFEST = {
  items: [{
    pathname: '/a/test.html',
    protocol: 'http'
  }, {
    pathname: '/b/test.html',
    protocol: 'http'
  }, {
    pathname: '/b/test.html',
    protocol: 'https'
  }, {
    pathname: '/c/test.html',
    protocol: 'https'
  }]
};

describe('Tests', () => {
  const tests = new Tests({
    manifest: MANIFEST,
    host: 'host.test'
  });

  it('list all tests', () => {
    assert.deepEqual(tests.list(), [
      'http://host.test/a/test.html',
      'http://host.test/b/test.html',
      'https://host.test/b/test.html',
      'https://host.test/c/test.html'
    ]);
  });

  it('list first test', () => {
    assert.deepEqual(tests.list(undefined, 1), [
      'http://host.test/a/test.html'
    ]);
  });

  it('list middle two tests', () => {
    assert.deepEqual(tests.list('http://host.test/a/test.html', 2), [
      'http://host.test/b/test.html',
      'https://host.test/b/test.html'
    ]);
  });

  it('list last two tests', () => {
    assert.deepEqual(tests.list('http://host.test/b/test.html'), [
      'https://host.test/b/test.html',
      'https://host.test/c/test.html'
    ]);
  });

  it('list after last test', () => {
    assert.deepEqual(tests.list('https://host.test/c/test.html'), []);
  });

  it('list after non-existent test', () => {
    assert.throws(() => {
      tests.list('https://host.test/not/a/test.html');
    }, Error);
  });

  it('list HTTP-only tests', () => {
    const httpTests = new Tests({
      manifest: MANIFEST,
      host: 'host.test',
      httpOnly: true
    });
    assert.deepEqual(httpTests.list(), [
      'http://host.test/a/test.html',
      'http://host.test/b/test.html'
    ]);
  });
});
