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

const chai = require('chai');
const chaiSubset = require('chai-subset');
const chaiFs = require('chai-fs');
chai.use(chaiSubset).use(chaiFs);
const assert = chai.assert;

const mockFs = require('mock-fs');

const {writeFile} = require('../../utils');

describe('build', () => {
  describe('writeFile', () => {
    const filepath = '.testtmp';

    beforeEach(() => {
      mockFs({
        '.testtmp': '',
        './custom-tests.json': {api: {}, css: {}}
      });
    });

    it('simple supported', async () => {
      await writeFile(filepath, 'foo\nbar');
      assert.fileContent(filepath, 'foo\nbar\n');
    });

    it('array', async () => {
      await writeFile(filepath, ['foo', 'bar', 'baz']);
      assert.fileContent(filepath, 'foo\nbar\nbaz\n');
    });

    it('dictionary', async () => {
      await writeFile(filepath, {foo: ['bar', 'baz']});
      assert.fileContent(filepath, '{"foo":["bar","baz"]}\n');
    });

    afterEach(() => {
      mockFs.restore();
    });
  });
});
