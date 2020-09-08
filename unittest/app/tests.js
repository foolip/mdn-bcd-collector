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

const {app} = require('../../app');
const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
const agent = chai.request.agent(app);
const assert = chai.assert;

describe('/api/tests', () => {
  it('list one test', async () => {
    const res = await agent.get('/api/tests?limit=1');
    assert.equal(res.status, 200);
    assert.isArray(res.body);
    assert.equal(res.body[0].length, 1);
  });
});

after(() => agent.close());
