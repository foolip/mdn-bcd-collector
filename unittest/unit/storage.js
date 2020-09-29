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

const assert = require('chai').assert;

const {CloudStorage, MemoryStorage, getStorage} = require('../../storage');

const SESSION_ID = 'testsessionid';

class FakeFile {
  constructor(bucket, name) {
    this._bucket = bucket;
    this._name = name;
    this._data = null;
  }

  get name() {
    return this._name;
  }

  async save(data) {
    this._data = data;
    this._bucket._files.set(this._name, this);
  }

  async download() {
    return [this._data];
  }
}

class FakeBucket {
  constructor() {
    this._files = new Map;
  }

  file(name) {
    return new FakeFile(this, name);
  }

  async getFiles(options) {
    const files = [];
    for (const [name, file] of this._files) {
      if (name.startsWith(options.prefix)) {
        files.push(file);
      }
    }
    return [files];
  }
}

describe('storage', () => {
  for (const StorageClass of [CloudStorage, MemoryStorage]) {
    describe(StorageClass.name, () => {
      let storage = null;

      beforeEach(() => {
        if (StorageClass === CloudStorage) {
          storage = new CloudStorage('fake-project', 'fake-bucket');
          storage._bucket = new FakeBucket;
        } else {
          storage = new StorageClass;
        }
      });

      afterEach(() => {
        storage = null;
      });

      it('put', async () => {
        await storage.put(SESSION_ID, '/a/test.html', {x: 1});

        const data = await storage.getAll(SESSION_ID);
        assert.deepStrictEqual(data, {'/a/test.html': {x: 1}});
      });

      it('put twice', async () => {
        await storage.put(SESSION_ID, '/a/test.html', {x: 1});
        await storage.put(SESSION_ID, '/b/test.html', {x: 2});

        const data = await storage.getAll(SESSION_ID);
        assert.deepStrictEqual(data, {
          '/a/test.html': {x: 1},
          '/b/test.html': {x: 2}
        });
      });

      it('put same pathname twice', async () => {
        await storage.put(SESSION_ID, '/a/test.html', {x: 1});
        await storage.put(SESSION_ID, '/a/test.html', {x: 2});

        // the data from the second put is used
        const data = await storage.getAll(SESSION_ID);
        assert.deepStrictEqual(data, {'/a/test.html': {x: 2}});
      });

      it('put with URL as key', async () => {
        const url = 'https://host.test/a/test.html?foo#bar';
        const value = {x: 3};
        await storage.put(SESSION_ID, url, value);

        const data = await storage.getAll(SESSION_ID);
        const expected = {};
        expected[url] = value;
        assert.deepStrictEqual(data, expected);
      });

      it('getAll without put', async () => {
        const data = await storage.getAll(SESSION_ID);
        assert.deepStrictEqual(data, {});
      });
    });
  }

  describe('getStorage', () => {
    it('testing', () => {
      const storage = getStorage();
      assert(storage instanceof MemoryStorage);
    });

    it('production', () => {
      process.env.GOOGLE_CLOUD_PROJECT = 'testing-project';
      process.env.GAE_VERSION = 'production';
      process.env.GCLOUD_STORAGE_BUCKET = 'prod-bucket';
      process.env.GCLOUD_STORAGE_BUCKET_STAGING = 'staging-bucket';

      const storage = getStorage();
      assert(storage instanceof CloudStorage);
      assert.equal(storage._bucket.name, 'prod-bucket');
    });

    it('staging', () => {
      process.env.GOOGLE_CLOUD_PROJECT = 'testing-project';
      process.env.GAE_VERSION = 'staging';
      process.env.GCLOUD_STORAGE_BUCKET = 'prod-bucket';
      process.env.GCLOUD_STORAGE_BUCKET_STAGING = 'staging-bucket';

      const storage = getStorage();
      assert(storage instanceof CloudStorage);
      assert.equal(storage._bucket.name, 'staging-bucket');
    });

    afterEach(() => {
      delete process.env.GOOGLE_CLOUD_PROJECT;
      delete process.env.GAE_VERSION;
      delete process.env.GCLOUD_STORAGE_BUCKET;
      delete process.env.GCLOUD_STORAGE_BUCKET_STAGING;
    });
  });
});
