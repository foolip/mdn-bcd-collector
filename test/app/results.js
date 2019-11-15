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

'use strict';

const app = require('../../app');
const chai = require('chai');
const chaiHttp = require('chai-http');

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

  const testURL = 'https://host.test/foo.html';

  it('submit valid results', async () => {
    const res = await agent.post('/api/results')
        .query({for: testURL})
        .send({x: 1});
    assert.equal(res.status, 201);
    // TODO: mock manifest to allow testing `next`:
    assert.deepEqual(res.body, {});
  });

  it('list results after valid', async () => {
    const res = await agent.get('/api/results');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      'https://host.test/foo.html': {x: 1}
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
      'https://host.test/foo.html': {x: 2}
    });
  });
});

after(() => agent.close());
