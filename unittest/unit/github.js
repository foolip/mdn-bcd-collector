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

const assert = require('chai').assert;

const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const {Octokit} = require('@octokit/rest');

const REPORTS = [
  {
    report: {
      __version: '1.2.3',
      results: {},
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Safari/605.1.15'
    },
    expected: {
      slug: '1.2.3-safari-12.0-mac-os-10.14-0aed9f1f74',
      title: 'Results from Safari 12.0 / Mac OS 10.14 / Collector v1.2.3'
    }
  },
  {
    report: {
      __version: 'Dev',
      results: {},
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'
    },
    expected: {
      slug: 'dev-chrome-86.0.4240.198-mac-os-11.0.0-4c53c96588',
      title: 'Results from Chrome 86.0.4240.198 / Mac OS 11.0.0 / Collector vDev'
    }
  }
];

const RESULT = {
  html_url: 'https://github.com/foolip/mdn-bcd-results/pull/42'
};

describe('GitHub export', () => {
  afterEach(() => sinon.restore());

  describe('happy path', async () => {
    let octokit;
    const github = proxyquire('../../github', {
      '@octokit/rest': {
        /* eslint-disable-next-line prefer-arrow/prefer-arrow-functions */
        Octokit: function(options) {
          assert(octokit === undefined);
          octokit = new Octokit(options);
          return octokit;
        }
      }
    })();
    let mock;

    beforeEach(() => {
      mock = {
        octokit: sinon.mock(octokit),
        git: sinon.mock(octokit.git),
        repos: sinon.mock(octokit.repos),
        pulls: sinon.mock(octokit.pulls)
      };
    });

    // eslint-disable-next-line guard-for-in
    for (const i in REPORTS) {
      it(`Report #${Number(i) + 1}`, async () => {
        const {report, expected} = REPORTS[i];

        mock.octokit.expects('auth').once().resolves({type: 'mocked'});

        mock.git.expects('createRef').once().withArgs({
          owner: 'foolip',
          ref: `refs/heads/collector/${expected.slug}`,
          repo: 'mdn-bcd-results',
          sha: '753c6ed8e991e9729353a63d650ff0f5bd902b69'
        });

        mock.repos.expects('createOrUpdateFileContents')
            .once().withArgs(sinon.match({
              owner: 'foolip',
              repo: 'mdn-bcd-results',
              path: `${expected.slug}.json.gz`,
              message: expected.title,
              content: sinon.match.string,
              branch: `collector/${expected.slug}`
            }));

        mock.pulls.expects('create').once().withArgs({
          owner: 'foolip',
          repo: 'mdn-bcd-results',
          title: expected.title,
          head: `collector/${expected.slug}`,
          body: github.createBody(github.getReportMeta(report)),
          base: 'main'
        }).resolves({data: RESULT});

        const result = await github.exportAsPR(report);
        assert.equal(result, RESULT);
      });
    }

    afterEach(() => {
      mock.octokit.restore();
      mock.git.restore();
      mock.repos.restore();
      mock.pulls.restore();
    });
  });

  it('no auth token', async () => {
    const github = proxyquire('../../github', {
      '@octokit/rest': {
        /* eslint-disable-next-line prefer-arrow/prefer-arrow-functions */
        Octokit: function(options) {
          return new Octokit(options);
        }
      }
    })();

    const result = await github.exportAsPR(REPORTS[0].report);
    assert.equal(result, false);
  });
});
