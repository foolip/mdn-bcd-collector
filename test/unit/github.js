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
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const {Octokit} = require('@octokit/rest');

const REPORT = {
  results: {},
  // eslint-disable-next-line max-len
  userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Safari/605.1.15'
};

const RESULT = {
  'html_url': 'https://github.com/foolip/mdn-bcd-results/pull/42'
};

describe('GitHub export', () => {
  afterEach(() => sinon.restore());

  it('happy path', async () => {
    let octokit;
    const github = proxyquire('../../github', {
      '@octokit/rest': {
        Octokit: function(options) {
          assert(octokit === undefined);
          octokit = new Octokit(options);
          return octokit;
        }
      }
    })();

    const mock = {
      octokit: sinon.mock(octokit),
      git: sinon.mock(octokit.git),
      repos: sinon.mock(octokit.repos),
      pulls: sinon.mock(octokit.pulls)
    };

    mock.octokit.expects('auth').once().resolves({type: 'mocked'});

    mock.git.expects('createRef').once().withArgs({
      owner: 'foolip',
      ref: 'refs/heads/collector/safari-12.0-mac-os-10.14-afd516a15d',
      repo: 'mdn-bcd-results',
      sha: '753c6ed8e991e9729353a63d650ff0f5bd902b69'
    });

    mock.repos.expects('createOrUpdateFileContents')
        .once().withArgs(sinon.match({
          owner: 'foolip',
          repo: 'mdn-bcd-results',
          path: 'safari-12.0-mac-os-10.14-afd516a15d.json',
          message: 'Results from Safari 12.0 / Mac OS 10.14',
          content: sinon.match.string,
          branch: 'collector/safari-12.0-mac-os-10.14-afd516a15d'
        }));

    mock.pulls.expects('create').once().withArgs({
      owner: 'foolip',
      repo: 'mdn-bcd-results',
      title: 'Results from Safari 12.0 / Mac OS 10.14',
      head: 'collector/safari-12.0-mac-os-10.14-afd516a15d',
      base: 'main'
    }).resolves({data: RESULT});

    const result = await github.exportAsPR(REPORT);
    assert.equal(result, RESULT);
  });

  it('no auth token', async () => {
    const github = proxyquire('../../github', {
      '@octokit/rest': {
        Octokit: function(options) {
          return new Octokit(options);
        }
      }
    })();

    const result = await github.exportAsPR(REPORT);
    assert.equal(result, false);
  });
});
