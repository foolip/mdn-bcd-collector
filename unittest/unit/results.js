// Copyright 2021 Google LLC
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

const {parseResults} = require('../../results');

describe('results', () => {
  describe('parseResults', () => {
    it('happy path', () => {
      const [url, results] = parseResults('http://localhost', [
        {
          exposure: 'Window',
          name: 'api.Attr.name',
          result: true,
          message: 'ignored',
          extra_stuff: 'ignored'
        }
      ]);
      assert.equal(url, 'http://localhost/'); // normalized
      assert.deepEqual(results, [
        {
          exposure: 'Window',
          name: 'api.Attr.name',
          result: true
        }
      ]);
    });

    it('flattening of exposure', () => {
      const [_, results] = parseResults('http://localhost', [
        {
          info: {
            code: 'ignored',
            exposure: 'Window'
          },
          name: 'api.Attr.localName',
          result: false,
          message: 'ignored'
        }
      ]);
      assert.deepEqual(results, [
        {
          exposure: 'Window',
          name: 'api.Attr.localName',
          result: false
        }
      ]);
    });

    it('with message', () => {
      const [_, results] = parseResults('http://localhost', [
        {
          exposure: 'Window',
          name: 'api.Attr.name',
          result: null,
          message: 'bad thing happened'
        }
      ]);
      assert.deepEqual(results, [
        {
          exposure: 'Window',
          name: 'api.Attr.name',
          result: null,
          message: 'bad thing happened'
        }
      ]);
    });

    it('invalid URL', () => {
      assert.throws(
        () => {
          parseResults('not a URL', []);
        },
        Error,
        'invalid URL'
      );
    });

    it('invalid results', () => {
      assert.throws(
        () => {
          parseResults('http://localhost', null);
        },
        Error,
        'results should be an array'
      );
    });

    it('invalid results entry', () => {
      assert.throws(
        () => {
          parseResults('http://localhost', [null]);
        },
        Error,
        'results[0] should be an object'
      );
    });

    it('invalid name', () => {
      assert.throws(
        () => {
          parseResults('http://localhost', [
            {
              exposure: 'Window',
              name: 42,
              result: true
            }
          ]);
        },
        Error,
        'results[0].name should be a string; got number'
      );
    });

    it('invalid result', () => {
      assert.throws(
        () => {
          parseResults('http://localhost', [
            {
              exposure: 'Window',
              name: 'api.Attr.name',
              result: 42
            }
          ]);
        },
        Error,
        'results[0].result (api.Attr.name) should be true/false/null; got 42'
      );
    });

    it('invalid exposure', () => {
      assert.throws(
        () => {
          parseResults('http://localhost', [
            {
              exposure: 42,
              name: 'api.Attr.name',
              result: true
            }
          ]);
        },
        Error,
        'results[0].exposure (api.Attr.name) should be a string; got number'
      );
    });
  });
});
