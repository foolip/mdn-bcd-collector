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

const {
  isEquivalent,
  findEntry,
  getBrowserAndVersion,
  getSupportMap
} = require('../../update-bcd');

const bcd = {
  api: {
    AbortController: {
      __compat: {},
      dummy: {
        __compat: {}
      },
      signal: {
        __compat: {}
      }
    },
    DummyAPI: {
      __compat: {},
      dummy: {
        __compat: {}
      }
    }
  },
  browsers: {
    chrome: {
      releases: {
        82: {},
        83: {},
        84: {},
        85: {}
      }
    },
    chrome_android: {
      releases: {
        85: {}
      }
    },
    edge: {
      releases: {
        16: {}
      }
    },
    safari: {
      releases: {
        14: {}
      }
    },
    safari_ios: {
      releases: {
        14: {}
      }
    },
    samsunginternet_android: {
      releases: {
        '12.0': {},
        12.1: {}
      }
    }
  },
  css: {
    properties: {
      'font-family': {
        __compat: {}
      },
      'font-face': {
        __compat: {}
      }
    }
  }
};

const reports = [
  {
    __version: '0.3.1',
    results: {
      'https://mdn-bcd-collector.appspot.com/tests/': [
        {
          name: 'api.AbortController',
          info: {
            code: '"AbortController" in self',
            exposure: 'Window'
          },
          result: true
        },
        {
          name: 'api.AbortController.abort',
          info: {
            code: '"abort" in AbortController.prototype',
            exposure: 'Window'
          },
          result: true
        },
        {
          name: 'api.AbortController.AbortController',
          info: {
            code: 'bcd.testConstructor("AbortController");',
            exposure: 'Window'
          },
          result: true
        }
      ]
    },
    userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36'
  },
  {
    __version: '0.3.1',
    results: {
      'https://mdn-bcd-collector.appspot.com/tests/': [
        {
          name: 'api.AbortController',
          info: {
            code: '"AbortController" in self',
            exposure: 'Window'
          },
          result: true
        },
        {
          name: 'api.AbortController.abort',
          info: {
            code: '"abort" in AbortController.prototype',
            exposure: 'Window'
          },
          result: true
        },
        {
          name: 'api.AbortController.AbortController',
          info: {
            code: 'bcd.testConstructor("AbortController");',
            exposure: 'Window'
          },
          result: false
        }
      ]
    },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36'
  },
  {
    __version: '0.3.1',
    results: {
      'https://mdn-bcd-collector.appspot.com/tests/': [
        {
          name: 'api.AbortController',
          info: {
            code: '"AbortController" in self',
            exposure: 'Window'
          },
          result: true
        },
        {
          name: 'api.AbortController.abort',
          info: {
            code: '"abort" in AbortController.prototype',
            exposure: 'Window'
          },
          result: null
        },
        {
          name: 'api.AbortController.AbortController',
          info: {
            code: 'bcd.testConstructor("AbortController");',
            exposure: 'Window'
          },
          result: false
        }
      ]
    },
    userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'
  }
];

describe('BCD updater', () => {
  describe('isEquivalent', () => {
    it('equal', () => {
      assert.equal(isEquivalent({a: 1, b: 2}, {a: 1, b: 2}), true);
    });

    it('not equal: different keys', () => {
      assert.equal(isEquivalent({a: 1, b: 2}, {a: 1, b: 2, c: 3}), false);
    });

    it('not equal: same keys, different values', () => {
      assert.equal(isEquivalent({a: 1, b: 2}, {a: 1, b: 3}), false);
    });
  });

  describe('findEntry', () => {
    it('equal', () => {
      assert.deepEqual(
          findEntry(bcd, 'api.AbortController'), bcd.api.AbortController
      );
    });

    it('no path', () => {
      assert.equal(findEntry(bcd, ''), null);
    });

    it('invalid path', () => {
      assert.equal(findEntry(bcd, 'api.MissingAPI'), undefined);
    });
  });

  describe('getBrowserAndVersion', () => {
    it('Chrome', () => {
      assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36', bcd.browsers), ['chrome', '85']);
    });

    it('Chrome Android', () => {
      assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (Linux; Android 11; Pixel 2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36', bcd.browsers), ['chrome_android', '85']);
    });

    it('Edge (EdgeHTML)', () => {
      assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299', bcd.browsers), ['edge', '16']);
    });

    it('Safari', () => {
      assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15', bcd.browsers), ['safari', '14']);
    });

    it('Safari iOS', () => {
      assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1', bcd.browsers), ['safari_ios', '14']);
    });

    it('Samsung Internet (12.0)', () => {
      assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (Linux; Android 11; Pixel 2) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/12.0 Chrome/79.0.3945.136 Mobile Safari/537.36', bcd.browsers), ['samsunginternet_android', '12.0']);
    });

    it('Samsung Internet (12.1)', () => {
      assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (Linux; Android 11; Pixel 2) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/12.1 Chrome/79.0.3945.136 Mobile Safari/537.36', bcd.browsers), ['samsunginternet_android', '12.1']);
    });

    it('Yandex Browser (not in BCD)', () => {
      assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (Windows NT 6.3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 YaBrowser/17.6.1.749 Yowser/2.5 Safari/537.36', bcd.browsers), [null, null]);
    });
  });

  it('getSupportMap', () => {
    assert.deepEqual(getSupportMap(reports[0]), new Map([
      ['api.AbortController', {result: true, prefix: undefined}],
      ['api.AbortController.abort', {result: null, prefix: ''}],
      ['api.AbortController.AbortController', {result: false, prefix: undefined}]
    ]));
  });
});
