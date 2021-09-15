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

import chai, {assert, expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import sinon from 'sinon';
import {Octokit} from '@octokit/rest';

import * as exporter from '../../exporter.js';

const REPORTS = [
  {
    report: {
      __version: '1.2.3',
      results: {},
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Safari/605.1.15'
    },
    expected: {
      slug: '1.2.3-safari-12.0-mac-os-10.14-cadc34e83f',
      title: 'Results from Safari 12 / Mac OS 10.14 / Collector v1.2.3'
    }
  },
  {
    report: {
      __version: 'Dev',
      results: {},
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'
    },
    expected: {
      slug: 'dev-chrome-86.0.4240.198-mac-os-11.0.0-31072b9b56',
      title: 'Results from Chrome 86 / Mac OS 11.0.0 / Collector vDev'
    }
  },
  {
    report: {
      __version: 'Dev',
      results: {},
      userAgent:
        'Mozilla/5.0 (Linux; Android 11; Pixel 2) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/12.1 Chrome/79.0.3945.136 Mobile Safari/537.36'
    },
    expected: {
      slug: 'dev-samsunginternet-android-12.1-android-11-d425ab14a8',
      title: 'Results from Samsung Internet 12.1 / Android 11 / Collector vDev'
    }
  }
];

describe('GitHub export', () => {
  const octokit = new Octokit();

  describe('happy path', async () => {
    // eslint-disable-next-line guard-for-in
    for (const i in REPORTS) {
      it(`Report #${Number(i) + 1}`, async () => {
        const {report, expected} = REPORTS[i];

        sinon.mock(octokit).expects('auth').once().resolves({type: 'mocked'});

        sinon
          .mock(octokit.git)
          .expects('createRef')
          .once()
          .withArgs({
            owner: 'foolip',
            ref: `refs/heads/collector/${expected.slug}`,
            repo: 'mdn-bcd-results',
            sha: '753c6ed8e991e9729353a63d650ff0f5bd902b69'
          });

        sinon
          .mock(octokit.repos)
          .expects('createOrUpdateFileContents')
          .once()
          .withArgs(
            sinon.match({
              owner: 'foolip',
              repo: 'mdn-bcd-results',
              path: `${expected.slug}.json`,
              message: expected.title,
              content: sinon.match.string,
              branch: `collector/${expected.slug}`
            })
          );

        sinon
          .mock(octokit.pulls)
          .expects('create')
          .once()
          .withArgs({
            owner: 'foolip',
            repo: 'mdn-bcd-results',
            title: expected.title,
            head: `collector/${expected.slug}`,
            body: exporter.createBody(exporter.getReportMeta(report)),
            base: 'main'
          })
          .resolves({
            data: {
              html_url: 'https://github.com/foolip/mdn-bcd-results/pull/42'
            }
          });

        const result = await exporter.exportAsPR(report, octokit);

        assert.deepEqual(result, {
          filename: `${expected.slug}.json`,
          url: 'https://github.com/foolip/mdn-bcd-results/pull/42'
        });
      });
    }

    afterEach(() => {
      sinon.restore();
    });
  });

  it('no auth token', async () => {
    expect(exporter.exportAsPR(REPORTS[0].report)).to.be.rejectedWith(Error);
  });
});
