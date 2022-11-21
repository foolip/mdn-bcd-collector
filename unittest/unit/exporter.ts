//
// mdn-bcd-collector: unittest/unit/exporter.js
// Unittest for the results exporter script
//
// © Google LLC, Gooborg Studios
// See the LICENSE file for copyright details
//

import chai, {assert, expect} from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import sinon from 'sinon';
import {Octokit} from '@octokit/rest';

import {exportAsPR} from '../../exporter.js';

import type {Report} from '../../types/types.js';

const REPORTS: {
  report: Report;
  expected: {slug: string; title: string; body: string};
}[] = [
  {
    report: {
      __version: '1.2.3',
      results: {},
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Safari/605.1.15'
    },
    expected: {
      slug: '1.2.3-safari-12.0-mac-os-10.14-cadc34e83f',
      title: 'Results from Safari 12 / Mac OS 10.14 / Collector v1.2.3',
      body: 'User Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/12.0 Safari/605.1.15\nBrowser: Safari 12 (on Mac OS 10.14)\nHash Digest: cadc34e83f\nTest URLs: '
    }
  },
  {
    report: {
      __version: '1.2.3-dev',
      results: {},
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36'
    },
    expected: {
      slug: '1.2.3-dev-chrome-86.0.4240.198-mac-os-11.0.0-32f70f2e14',
      title: 'Results from Chrome 86 / Mac OS 11.0.0 / Collector v1.2.3-dev',
      body: 'User Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36\nBrowser: Chrome 86 (on Mac OS 11.0.0)\nHash Digest: 32f70f2e14\nTest URLs: \n\n**WARNING:** this PR was created from a development/staging version!'
    }
  },
  {
    report: {
      __version: '1.2.3',
      results: {
        'https://mdn-bcd-collector.gooborg.com/tests/': []
      },
      userAgent:
        'Mozilla/5.0 (Linux; Android 11; Pixel 2) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/12.1 Chrome/79.0.3945.136 Mobile Safari/537.36'
    },
    expected: {
      slug: '1.2.3-samsunginternet-android-12.1-android-11-804fe4cd9d',
      title:
        'Results from Samsung Internet 12.1 / Android 11 / Collector v1.2.3',
      body: 'User Agent: Mozilla/5.0 (Linux; Android 11; Pixel 2) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/12.1 Chrome/79.0.3945.136 Mobile Safari/537.36\nBrowser: Samsung Internet 12.1 (on Android 11)\nHash Digest: 804fe4cd9d\nTest URLs: https://mdn-bcd-collector.gooborg.com/tests/'
    }
  },
  {
    report: {
      __version: '1.2.3',
      results: {
        'https://mdn-bcd-collector.gooborg.com/tests/?exposure=Window': [],
        'https://mdn-bcd-collector.gooborg.com/tests/?exposure=Worker': []
      },
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/800.0.1.2 Safari/537.36'
    },
    expected: {
      slug: '1.2.3-chrome-800.0.1.2-mac-os-11.0.0-ee13f09a68',
      title: 'Results from Chrome 800.0 / Mac OS 11.0.0 / Collector v1.2.3',
      body: 'User Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 11_0_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/800.0.1.2 Safari/537.36\nBrowser: Chrome 800.0 (on Mac OS 11.0.0) - **Not in BCD**\nHash Digest: ee13f09a68\nTest URLs: https://mdn-bcd-collector.gooborg.com/tests/?exposure=Window, https://mdn-bcd-collector.gooborg.com/tests/?exposure=Worker'
    }
  }
];

describe('GitHub export', () => {
  const octokit = new Octokit();

  describe('happy path', () => {
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
            owner: 'GooborgStudios',
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
              owner: 'GooborgStudios',
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
            owner: 'GooborgStudios',
            repo: 'mdn-bcd-results',
            title: expected.title,
            head: `collector/${expected.slug}`,
            body: expected.body,
            base: 'main'
          })
          .resolves({
            data: {
              html_url:
                'https://github.com/GooborgStudios/mdn-bcd-results/pull/42'
            }
          });

        const result = await exportAsPR(report, octokit);

        assert.deepEqual(result, {
          filename: `${expected.slug}.json`,
          url: 'https://github.com/GooborgStudios/mdn-bcd-results/pull/42'
        });
      });
    }

    afterEach(() => {
      sinon.restore();
    });
  });

  it('no Octokit', async () => {
    (expect(exportAsPR(REPORTS[0].report)).to.be as any).rejectedWith(
      Error,
      '"octokit" must be defined'
    );
  });

  it('no auth token', async () => {
    (expect(exportAsPR(REPORTS[0].report, octokit)).to.be as any).rejectedWith(
      Error,
      'Octokit authentication failure'
    );
  });
});
