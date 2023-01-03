//
// mdn-bcd-collector: unittest/app/app.ts
// Unittest for the main app backend
//
// © Gooborg Studios, Google LLC
// See the LICENSE file for copyright details
//

import chai, {assert, expect} from 'chai';
import chaiHttp from 'chai-http';
chai.use(chaiHttp);

import fs from 'fs-extra';

import {app, version} from '../../app.js';
const agent = chai.request.agent(app);

const tests = Object.entries(
  await fs.readJson(new URL('../../tests.json', import.meta.url))
);
const packageLock = await fs.readJson(
  new URL('../../package-lock.json', import.meta.url)
);

const userAgent = `node-superagent/${packageLock.dependencies.superagent.version}`;

describe('/api/results', () => {
  it('missing `Content-Type` header', async () => {
    const res = await agent
      .post('/api/results')
      .set('Content-Type', 'text/plain')
      .send('string');
    assert.equal(res.status, 400);
  });

  it('missing `for` param', async () => {
    const res = await agent.post('/api/results').send({});
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

  const testResults = [
    {
      exposure: 'Worker',
      name: 'api.Blob',
      result: false
    }
  ];

  const modifiedResults = [
    {
      exposure: 'Worker',
      name: 'api.Blob',
      result: true
    }
  ];

  it('submit valid results', async () => {
    const res = await agent
      .post('/api/results')
      .query({for: testURL})
      .send(testResults);
    assert.equal(res.status, 201);
    assert.equal(res.text, '');
  });

  it('list results after valid', async () => {
    const res = await agent.get('/api/results');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      __version: version,
      results: {[testURL]: testResults},
      userAgent: userAgent
    });
  });

  it('submit modified results', async () => {
    const res = await agent
      .post('/api/results')
      .query({for: testURL})
      .send(modifiedResults);
    assert.equal(res.status, 201);
  });

  it('list results after duplicate', async () => {
    const res = await agent.get('/api/results');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      __version: version,
      results: {[testURL]: modifiedResults},
      userAgent: userAgent
    });
  });

  it('submit valid results for new URL', async () => {
    const res = await agent
      .post('/api/results')
      .query({for: testURL2})
      .send(testResults);
    assert.equal(res.status, 201);
    assert.deepEqual(res.text, '');
  });

  it('list results after new valid', async () => {
    const res = await agent.get('/api/results');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, {
      __version: version,
      results: {[testURL]: modifiedResults, [testURL2]: testResults},
      userAgent: userAgent
    });
  });

  it('submit invalid results', async () => {
    const res = await agent
      .post('/api/results')
      .query({for: testURL})
      .send('my bad results');
    assert.equal(res.status, 400);
  });
});

describe('/api/get', () => {
  it('get all tests, no post vars', async () => {
    const res = await agent.post('/api/get').send({});
    expect(res).to.redirectTo(/\/tests\/$/);
  });

  it('get all tests, with post vars', async () => {
    const res = await agent
      .post('/api/get')
      .send({testSelection: '', limitExposure: ''});
    expect(res).to.redirectTo(/\/tests\/$/);
  });

  it('get all tests, limit exposure', async () => {
    const res = await agent
      .post('/api/get')
      .send({testSelection: '', limitExposure: 'Window'});
    expect(res).to.redirectTo(/\/tests\/\?exposure=Window$/);
  });

  it('get "api"', async () => {
    const res = await agent
      .post('/api/get')
      .send({testSelection: 'api', limitExposure: ''});
    expect(res).to.redirectTo(/\/tests\/api$/);
  });

  it('get "api", limit exposure', async () => {
    const res = await agent
      .post('/api/get')
      .send({testSelection: 'api', limitExposure: 'Window'});
    expect(res).to.redirectTo(/\/tests\/api\?exposure=Window$/);
  });

  it('get specific test', async () => {
    const res = await agent
      .post('/api/get')
      .send({testSelection: 'api.AbortController.signal', limitExposure: ''});
    expect(res).to.redirectTo(/\/tests\/api\/AbortController\/signal$/);
  });

  it('get specific test, limit exposure', async () => {
    const res = await agent.post('/api/get').send({
      testSelection: 'api.AbortController.signal',
      limitExposure: 'Window'
    });
    expect(res).to.redirectTo(
      /\/tests\/api\/AbortController\/signal\?exposure=Window$/
    );
  });

  it('get specific test, hide results', async () => {
    const res = await agent.post('/api/get').send({
      testSelection: 'api.AbortController.signal',
      limitExposure: '',
      selenium: true
    });
    expect(res).to.redirectTo(
      /\/tests\/api\/AbortController\/signal\?selenium=true$/
    );
  });

  it('get specific test, limit exposure and hide results', async () => {
    const res = await agent.post('/api/get').send({
      testSelection: 'api.AbortController.signal',
      limitExposure: 'Window',
      selenium: true
    });
    expect(res).to.redirectTo(
      /\/tests\/api\/AbortController\/signal\?selenium=true&exposure=Window$/
    );
  });
});

describe('test assets', () => {
  it('/eventstream', async () => {
    const res = await agent.get(`/eventstream`);
    assert.equal(res.status, 200);
    assert.equal(
      // XXX TypeScript incorrectly states the interface doesn't have "headers"
      (res as any).headers['content-type'],
      'text/event-stream; charset=utf-8'
    );
  });
});

describe('rendered pages', () => {
  it('/', async () => {
    const res = await agent.get(`/`);
    assert.equal(res.status, 200);
    assert.include(res.text, 'mdn-bcd-collector');
  });

  it('404', async () => {
    const res = await agent.get('/fakepage');
    assert.equal(res.status, 404);
  });
});

describe('/tests/', () => {
  it('get a test', async () => {
    // XXX Test page content and ensure we're loading the right tests
    const res = await agent.get(`/tests/${tests[1][0].replace(/\./g, '/')}`);
    assert.equal(res.status, 200);
  });

  it('get all tests', async () => {
    // XXX Test page content and ensure we're loading the right tests
    const res = await agent.get('/tests/');
    assert.equal(res.status, 200);
  });

  it('get all tests, ignore CSS', async () => {
    // XXX Test page content and ensure we're loading the right tests
    const res = await agent.get('/tests/?ignore=css');
    assert.equal(res.status, 200);
  });

  it('get a non-existent test', async () => {
    const res = await agent.get(`/tests/dummy/test`);
    assert.equal(res.status, 404);
  });
});

after(() => agent.close());
