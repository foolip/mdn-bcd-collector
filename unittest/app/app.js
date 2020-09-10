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

const {app, version, getHost} = require('../../app');
const chai = require('chai');
const chaiHttp = require('chai-http');

const tests = Object.entries(require('../../tests.json'));

chai.use(chaiHttp);
const agent = chai.request.agent(app);
const assert = chai.assert;

describe('/api/results', () => {
  it('missing `Content-Type` header', async () => {
    const res = await agent.post('/api/results')
        .set('Content-Type', 'text/plain')
        .send('string');
    assert.equal(res.status, 400);
  });

  it('missing `for` param', async () => {
    const res = await agent.post('/api/results')
        .send({});
    assert.equal(res.status, 400);
  });

  it('list results before', async () => {
    const res = await agent.get('/api/results');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {});
  });

  const testURL = `http://localhost:8080/tests/api/interfaces`;
  const testURL2 = `https://host.test/tests/css/properties`;

  it('submit valid results', async () => {
    const res = await agent.post('/api/results')
        .query({for: testURL})
        .send({x: 1});
    assert.equal(res.status, 201);
    assert.deepEqual(res.body, {
      next: `http://localhost:8080/tests/api/workerinterfaces?reportToServer`
    });
  });

  it('list results after valid', async () => {
    const res = await agent.get('/api/results');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      __version: version,
      [testURL]: {x: 1}
    });
  });

  it('submit duplicate results', async () => {
    const res = await agent.post('/api/results')
        .query({for: testURL})
        .send({x: 2});
    assert.equal(res.status, 201);
  });

  it('list results after duplicate', async () => {
    const res = await agent.get('/api/results');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      __version: version,
      [testURL]: {x: 2}
    });
  });

  it('submit results for new/last manifest', async () => {
    const res = await agent.post('/api/results')
        .query({for: testURL2})
        .send({y: 3});
    assert.equal(res.status, 201);
    assert.deepEqual(res.body, {});
  });

  it('list results after new/last manifest', async () => {
    const res = await agent.get('/api/results');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      __version: version,
      [testURL]: {x: 2},
      [testURL2]: {y: 3}
    });
  });

  it('submit invalid results', async () => {
    const res = await agent.post('/api/results')
        .query({for: testURL})
        .send('my bad results');
    assert.equal(res.status, 400);
  });
});

describe('rendered pages', () => {
  it('/', async () => {
    const res = await agent.get(`/`);
    assert.equal(res.status, 200);
  });

  it('/results', async () => {
    const res = await agent.get(`/results`);
    assert.equal(res.status, 200);
  });
});

describe('/tests/', () => {
  it('get a main test', async () => {
    const res = await agent.get(`/tests/api/interfaces`);
    assert.equal(res.status, 200);
  });

  it('get an individual test', async () => {
    const res = await agent.get(`/tests/${
      tests[1][0].replace(/\./g, '/')
    }`);
    assert.equal(res.status, 200);
  });

  it('get a non-existent tests', async () => {
    const res = await agent.get(`/tests/dummy/test`);
    assert.equal(res.status, 404);
  });
});

describe('getHost', () => {
  it('testing', () => {
    process.env.GOOGLE_CLOUD_PROJECT = '';
    process.env.GAE_VERSION = '';

    assert.equal(getHost(), 'localhost:8080');
  });

  it('production', () => {
    process.env.GOOGLE_CLOUD_PROJECT = 'testing-project';
    process.env.GAE_VERSION = 'production';

    assert.equal(getHost(), 'testing-project.appspot.com');
  });

  it('staging', () => {
    process.env.GOOGLE_CLOUD_PROJECT = 'testing-project';
    process.env.GAE_VERSION = 'staging';

    assert.equal(getHost(), 'staging-dot-testing-project.appspot.com');
  });

  afterEach(() => {
    delete process.env.GOOGLE_CLOUD_PROJECT;
    delete process.env.GAE_VERSION;
  });
});

after(() => agent.close());
