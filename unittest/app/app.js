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
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const assert = chai.assert;
const expect = chai.expect;

const {app, version} = require('../../app');
const agent = chai.request.agent(app);

const tests = Object.entries(require('../../tests.json'));

const userAgent = `node-superagent/${
  require('../../package-lock.json').dependencies.superagent.version
}`;

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
    assert.deepEqual(res.body, {
      __version: version,
      results: {},
      userAgent: userAgent
    });
  });

  const testURL = `http://localhost:8080/tests/api`;
  const testURL2 = `https://host.test/tests/css`;

  it('GitHub export, no results', async () => {
    const res = await agent.post('/api/results/export/github').send();
    assert.equal(res.status, 412);
  });

  it('submit valid results', async () => {
    const res = await agent.post('/api/results')
        .query({for: testURL})
        .send({x: 1});
    assert.equal(res.status, 201);
    assert.deepEqual(res.body, {});
  });

  it('list results after valid', async () => {
    const res = await agent.get('/api/results');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      __version: version,
      results: {[testURL]: {x: 1}},
      userAgent: userAgent
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
      results: {[testURL]: {x: 2}},
      userAgent: userAgent
    });
  });

  it('submit valid results for new URL', async () => {
    const res = await agent.post('/api/results')
        .query({for: testURL2})
        .send({y: 3});
    assert.equal(res.status, 201);
    assert.deepEqual(res.body, {});
  });

  it('list results after new valid', async () => {
    const res = await agent.get('/api/results');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      __version: version,
      results: {[testURL]: {x: 2}, [testURL2]: {y: 3}},
      userAgent: userAgent
    });
  });

  it('submit invalid results', async () => {
    const res = await agent.post('/api/results')
        .query({for: testURL})
        .send('my bad results');
    assert.equal(res.status, 400);
  });

  it('GitHub export with results', async () => {
    const res = await agent.post('/api/results/export/github?mock=true').send();
    assert.equal(res.status, 200);
  });
});

describe('/api/get', () => {
  it('get all tests, no post vars', async () => {
    const res = await agent.post('/api/get')
        .send({});
    expect(res).to.redirectTo(/\/tests\/$/);
  });

  it('get all tests, with post vars', async () => {
    const res = await agent.post('/api/get')
        .send({testSelection: '', limitExposure: ''});
    expect(res).to.redirectTo(/\/tests\/$/);
  });

  it('get all tests, limit exposure', async () => {
    const res = await agent.post('/api/get')
        .send({testSelection: '', limitExposure: 'Window'});
    expect(res).to.redirectTo(/\/tests\/\?exposure=Window$/);
  });

  it('get "api"', async () => {
    const res = await agent.post('/api/get')
        .send({testSelection: 'api', limitExposure: ''});
    expect(res).to.redirectTo(/\/tests\/api$/);
  });

  it('get "api", limit exposure', async () => {
    const res = await agent.post('/api/get')
        .send({testSelection: 'api', limitExposure: 'Window'});
    expect(res).to.redirectTo(/\/tests\/api\?exposure=Window$/);
  });

  it('get specific test', async () => {
    const res = await agent.post('/api/get')
        .send({testSelection: 'api.AbortController.signal', limitExposure: ''});
    expect(res).to.redirectTo(/\/tests\/api\/AbortController\/signal$/);
  });

  it('get specific test, limit exposure', async () => {
    const res = await agent.post('/api/get')
        .send({testSelection: 'api.AbortController.signal', limitExposure: 'Window'});
    expect(res).to.redirectTo(/\/tests\/api\/AbortController\/signal\?exposure=Window$/);
  });

  it('get specific test, hide results', async () => {
    const res = await agent.post('/api/get')
        .send({testSelection: 'api.AbortController.signal', limitExposure: '', selenium: true});
    expect(res).to.redirectTo(/\/tests\/api\/AbortController\/signal\?selenium=true$/);
  });

  it('get specific test, limit exposure and hide results', async () => {
    const res = await agent.post('/api/get')
        .send({testSelection: 'api.AbortController.signal', limitExposure: 'Window', selenium: true});
    expect(res).to.redirectTo(/\/tests\/api\/AbortController\/signal\?selenium=true&exposure=Window$/);
  });
});

describe('test assets', () => {
  it('/eventstream', async () => {
    const res = await agent.get(`/eventstream`);
    assert.equal(res.status, 200);
    assert.equal(res.headers['content-type'], 'text/event-stream; charset=utf-8');
  });
});

describe('rendered pages', () => {
  it('/', async () => {
    const res = await agent.get(`/`);
    assert.equal(res.status, 200);
    assert.include(res.text, 'mdn-bcd-collector');
  });

  it('/export', async () => {
    const res = await agent.get(`/export`);
    assert.equal(res.status, 200);
    assert.include(res.text, 'Download results JSON');
  });

  it('404', async () => {
    const res = await agent.get('/fakepage');
    assert.equal(res.status, 404);
  });
});

describe('/tests/', () => {
  it('get a test', async () => {
    const res = await agent.get(`/tests/${tests[1][0].replace(/\./g, '/')}`);
    assert.equal(res.status, 200);
  });

  it('get all tests', async () => {
    const res = await agent.get('/tests/');
    assert.equal(res.status, 200);
  });

  it('get a non-existent test', async () => {
    const res = await agent.get(`/tests/dummy/test`);
    assert.equal(res.status, 404);
  });
});

after(() => agent.close());
