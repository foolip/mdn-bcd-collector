//
// mdn-bcd-collector: storage.js
// Module to handle temporary storage for the web app, locally or in GAE
//
// © Google LLC, Gooborg Studios
// See the LICENSE file for copyright details
//

import assert from 'node:assert/strict';

import fs from 'fs-extra';
import {Storage, Bucket} from '@google-cloud/storage';

class CloudStorage {
  _bucket: Bucket;
  _version: string;

  constructor(projectId: string, bucketName: string, appVersion: string) {
    const storage = new Storage({projectId});
    this._bucket = storage.bucket(bucketName);
    // appVersion is used as a prefix for all paths, so that multiple
    // deployments can use the same bucket without risk of collision.
    this._version = appVersion;
  }

  async put(sessionId, key, value) {
    assert(sessionId.length > 0);
    const name = `${this._version}/sessions/${sessionId}/${encodeURIComponent(
      key
    )}`;
    const file = this._bucket.file(name);
    const data = JSON.stringify(value);
    await file.save(data);
  }

  async getAll(sessionId) {
    assert(sessionId.length > 0);
    const prefix = `${this._version}/sessions/${sessionId}/`;
    const files = (await this._bucket.getFiles({prefix}))[0];
    const result = {};
    await Promise.all(
      files.map(async (file) => {
        assert(file.name.startsWith(prefix));
        const key = decodeURIComponent(file.name.substr(prefix.length));
        const data = (await file.download())[0];
        result[key] = JSON.parse(data.toString());
      })
    );
    return result;
  }

  async saveFile(filename, data) {
    assert(!filename.includes('..'));
    const name = `${this._version}/files/${filename}`;
    const file = this._bucket.file(name);
    await file.save(data);
  }

  async readFile(filename) {
    assert(!filename.includes('..'));
    const name = `${this._version}/files/${filename}`;
    const file = this._bucket.file(name);
    return (await file.download())[0];
  }
}

class MemoryStorage {
  _data: Map<string, any>;

  constructor() {
    this._data = new Map();
  }

  async put(sessionId, key, value) {
    let sessionData: Map<string, any>;
    if (this._data.has(sessionId)) {
      sessionData = this._data.get(sessionId);
    } else {
      sessionData = new Map();
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

  async saveFile(filename, data) {
    assert(!filename.includes('..'));
    await fs.writeFile(
      new URL(`./download/${filename}`, import.meta.url),
      data
    );
  }

  async readFile(filename) {
    assert(!filename.includes('..'));
    return await fs.readFile(
      new URL(`./download/${filename}`, import.meta.url)
    );
  }
}

const getStorage = (appVersion) => {
  // Use CloudStorage on Google AppEngine.
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  if (project) {
    // Use GCLOUD_STORAGE_BUCKET from app.yaml.
    const bucketName = process.env.GCLOUD_STORAGE_BUCKET || '';
    return new CloudStorage(project, bucketName, appVersion);
  }

  // Use MemoryStorage storage for local deployment and testing.
  return new MemoryStorage();
};

export {CloudStorage, MemoryStorage, getStorage};
