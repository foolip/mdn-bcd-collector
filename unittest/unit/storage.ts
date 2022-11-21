//
// mdn-bcd-collector: unittest/unit/storage.js
// Unittest for the temporary storage handler
//
// © Google LLC, Gooborg Studios
// See the LICENSE file for copyright details
//

import {assert} from 'chai';

import {CloudStorage, MemoryStorage, getStorage} from '../../storage.js';

const SESSION_ID = 'testsessionid';

class FakeFile {
  _bucket: FakeBucket;
  _name: string;
  _data: any;

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
  _files: Map<string, any>;

  constructor() {
    this._files = new Map();
  }

  file(name) {
    const existing = this._files.get(name);
    if (existing) {
      return existing;
    }
    return new FakeFile(this, name);
  }

  async getFiles(options) {
    const files: any[] = [];
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
      let storage: any = null;

      beforeEach(() => {
        if (StorageClass === CloudStorage) {
          storage = new CloudStorage('fake-project', 'fake-bucket', '');
          storage._bucket = new FakeBucket();
        } else {
          storage = new MemoryStorage();
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

      it('saveFile + readFile', async () => {
        const filename = 'test.json';
        const bytes = Buffer.from('{}');
        await storage.saveFile(filename, bytes);
        const readBytes = await storage.readFile(filename);
        assert.instanceOf(readBytes, Buffer);
        assert.equal(readBytes.toString(), '{}');
      });
    });
  }

  describe('getStorage', () => {
    it('testing', () => {
      const storage = getStorage('test-version');
      assert(storage instanceof MemoryStorage);
    });

    it('production', () => {
      process.env.GOOGLE_CLOUD_PROJECT = 'test-project';
      process.env.GCLOUD_STORAGE_BUCKET = 'test-bucket';

      const storage = getStorage('test-version');
      assert(storage instanceof CloudStorage);
      assert.equal((storage as CloudStorage)._bucket.name, 'test-bucket');
      assert.equal((storage as CloudStorage)._version, 'test-version');
    });

    afterEach(() => {
      delete process.env.GOOGLE_CLOUD_PROJECT;
      delete process.env.GCLOUD_STORAGE_BUCKET;
    });
  });
});
