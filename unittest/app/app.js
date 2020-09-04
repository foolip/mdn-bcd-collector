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

const {app, version} = require('../../app');
const chai = require('chai');
const chaiHttp = require('chai-http');

const manifest = require('../../MANIFEST.json');
const mainEndpoints = Object.entries(manifest.endpoints.main);
const individualEndpoints = Object.entries(manifest.endpoints.individual);

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

  const testURL = `http://localhost:8080${mainEndpoints[0][0]}`;
  const testURL2 = `https://host.test${mainEndpoints[mainEndpoints.length - 1][0]}`;

  it('submit valid results', async () => {
    const res = await agent.post('/api/results')
        .query({for: testURL})
        .send({x: 1});
    assert.equal(res.status, 201);
    assert.deepEqual(res.body, {
      'next': `http://localhost:8080${mainEndpoints[1][0]}`
    });
  });

  it('list results after valid', async () => {
    const res = await agent.get('/api/results');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      '__version': version,
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
      '__version': version,
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
      '__version': version,
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

describe('/api/tests', () => {
  it('list tests', async () => {
    const res = await agent.get('/api/tests');
    assert.equal(res.status, 200);
    assert.isArray(res.body);
    assert.isArray(res.body[0]);
    assert.isArray(res.body[1]);
    assert.equal(res.body.length, 2);
  });
});

describe('/tests/', () => {
  it('get a main test', async () => {
    const res = await agent.get(mainEndpoints[0][0]);
    assert.equal(res.status, 200);
  });

  it('get an individual test', async () => {
    const res = await agent.get(individualEndpoints[0][0]);
    assert.equal(res.status, 200);
  });
});

after(() => agent.close());
