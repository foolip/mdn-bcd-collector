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

const {Storage} = require('@google-cloud/storage');

class CloudStorage {
  constructor(projectId, bucketName) {
    const storage = new Storage({projectId});
    this._bucket = storage.bucket(bucketName);
  }

  async put(sessionId, key, value) {
    assert(sessionId.length > 0);
    const name = `${sessionId}/${encodeURIComponent(key)}`;
    const file = this._bucket.file(name);
    const data = JSON.stringify(value);
    await file.save(data);
  }

  async getAll(sessionId) {
    assert(sessionId.length > 0);
    const prefix = `${sessionId}/`;
    const files = (await this._bucket.getFiles({prefix}))[0];
    const result = {};
    await Promise.all(files.map(async (file) => {
      assert(file.name.startsWith(prefix));
      const key = decodeURIComponent(file.name.substr(prefix.length));
      const data = (await file.download())[0];
      result[key] = JSON.parse(data);
    }));
    return result;
  }
}

class MemoryStorage {
  constructor() {
    this._data = new Map;
  }

  async put(sessionId, key, value) {
    let sessionData = this._data.get(sessionId);
    if (!sessionData) {
      sessionData = new Map;
      this._data.set(sessionId, sessionData);
    }
    sessionData.set(key, value);
  }

  async getAll(sessionId) {
    const result = {};
    const sessionData = this._data.get(sessionId);
    if (sessionData) {
      for (const [key, value] of sessionData) {
        result[key] = value;
      }
    }
    return result;
  }
}

module.exports = {CloudStorage, MemoryStorage};
