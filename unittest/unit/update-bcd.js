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

const {assert, expect} = require('chai');

const proxyquire = require('proxyquire');
const sinon = require('sinon');

const {
  isEquivalent,
  findEntry,
  getBrowserAndVersion,
  getSupportMap,
  getSupportMatrix,
  inferSupportStatements
} = proxyquire('../../update-bcd', {
  './overrides': [
    'Test overrides',
    ['css.properties.font-family', 'safari', '5.1', false, ''],
    ['css.properties.font-family', 'chrome', '83', false, ''],
    ['css.properties.font-face', 'chrome', '*', null, '']
  ]
});

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
          info: {exposure: 'Window'},
          result: true
        },
        {
          name: 'api.AbortController.abort',
          info: {exposure: 'Window'},
          result: true
        },
        {
          name: 'api.AbortController.AbortController',
          info: {exposure: 'Window'},
          result: true
        },
        {
          name: 'api.AudioContext',
          info: {exposure: 'Window'},
          result: true
        },
        {
          name: 'api.AudioContext.close',
          info: {exposure: 'Window'},
          result: true
        },
        {
          name: 'api.DeprecatedInterface',
          info: {exposure: 'Window'},
          result: false
        },
        {
          name: 'api.ExperimentalInterface',
          info: {exposure: 'Window'},
          result: true
        },
        {
          name: 'api.PrefixedInterface',
          info: {exposure: 'Window'},
          result: true
        },
        {
          name: 'css.properties.font-family',
          info: {exposure: 'Window'},
          result: true
        },
        {
          name: 'css.properties.font-face',
          info: {exposure: 'Window'},
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
          info: {exposure: 'Window'},
          result: true
        },
        {
          name: 'api.AbortController.abort',
          info: {exposure: 'Window'},
          result: false
        },
        {
          name: 'api.AbortController.abort',
          info: {exposure: 'Worker'},
          result: true
        },
        {
          name: 'api.AbortController.AbortController',
          info: {exposure: 'Window'},
          result: false
        },
        {
          name: 'api.AudioContext',
          info: {exposure: 'Window'},
          result: false
        },
        {
          name: 'api.AudioContext.close',
          info: {exposure: 'Window'},
          result: null,
          message: 'threw ReferenceError: AbortController is not defined'
        },
        {
          name: 'api.DeprecatedInterface',
          info: {exposure: 'Window'},
          result: true
        },
        {
          name: 'api.ExperimentalInterface',
          info: {exposure: 'Window'},
          result: false
        },
        {
          name: 'api.PrefixedInterface',
          info: {exposure: 'Window'},
          result: true,
          prefix: 'WebKit'
        },
        {
          name: 'css.properties.font-family',
          info: {exposure: 'Window'},
          result: true
        },
        {
          name: 'css.properties.font-face',
          info: {exposure: 'Window'},
          result: true
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
          info: {exposure: 'Window'},
          result: true
        },
        {
          name: 'api.AbortController.abort',
          info: {exposure: 'Window'},
          result: null
        },
        {
          name: 'api.AbortController.AbortController',
          info: {exposure: 'Window'},
          result: false
        },
        {
          name: 'api.AudioContext',
          info: {exposure: 'Window'},
          result: false
        },
        {
          name: 'api.AudioContext.close',
          info: {exposure: 'Window'},
          result: null,
          message: 'threw ReferenceError: AbortController is not defined'
        },
        {
          name: 'api.DeprecatedInterface',
          info: {exposure: 'Window'},
          result: true
        },
        {
          name: 'api.ExperimentalInterface',
          info: {exposure: 'Window'},
          result: true
        },
        {
          name: 'api.PrefixedInterface',
          info: {exposure: 'Window'},
          result: true,
          prefix: 'WebKit'
        },
        {
          name: 'css.properties.font-family',
          info: {exposure: 'Window'},
          result: true
        },
        {
          name: 'css.properties.font-face',
          info: {exposure: 'Window'},
          result: true
        }
      ]
    },
    userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'
  },
  {
    __version: '0.3.1',
    results: {
      'https://mdn-bcd-collector.appspot.com/tests/': [
        {
          name: 'api.AbortController',
          info: {exposure: 'Window'},
          result: false
        }
      ]
    },
    userAgent: 'Mozilla/5.0 (Windows NT 6.3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 YaBrowser/17.6.1.749 Yowser/2.5 Safari/537.36'
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

  describe('getSupportMap', () => {
    it('normal', () => {
      assert.deepEqual(getSupportMap(reports[2]), new Map([
        ['api.AbortController', {result: true, prefix: ''}],
        ['api.AbortController.abort', {result: null, prefix: ''}],
        ['api.AbortController.AbortController', {result: false, prefix: ''}],
        ['api.AudioContext', {result: false, prefix: ''}],
        ['api.AudioContext.close', {result: false, prefix: ''}],
        ['api.DeprecatedInterface', {result: true, prefix: ''}],
        ['api.ExperimentalInterface', {result: true, prefix: ''}],
        ['api.PrefixedInterface', {result: true, prefix: 'WebKit'}],
        ['css.properties.font-family', {result: true, prefix: ''}],
        ['css.properties.font-face', {result: true, prefix: ''}]
      ]));
    });

    it('support in only one exposure', () => {
      assert.deepEqual(getSupportMap(reports[1]), new Map([
        ['api.AbortController', {result: true, prefix: ''}],
        ['api.AbortController.abort', {result: true, prefix: ''}],
        ['api.AbortController.AbortController', {result: false, prefix: ''}],
        ['api.AudioContext', {result: false, prefix: ''}],
        ['api.AudioContext.close', {result: false, prefix: ''}],
        ['api.DeprecatedInterface', {result: true, prefix: ''}],
        ['api.ExperimentalInterface', {result: false, prefix: ''}],
        ['api.PrefixedInterface', {result: true, prefix: 'WebKit'}],
        ['css.properties.font-family', {result: true, prefix: ''}],
        ['css.properties.font-face', {result: true, prefix: ''}]
      ]));
    });

    it('no results', () => {
      expect(() => {
        getSupportMap({results: {}});
      }).to.throw('No results!');
    });
  });

  describe('getSupportMatrix', () => {
    beforeEach(() => {
      sinon.stub(console, 'warn');
    });

    it('normal', () => {
      assert.deepEqual(getSupportMatrix(bcd.browsers, reports), new Map([
        ['api.AbortController', new Map([['chrome', new Map([
          ['82', {result: null, prefix: ''}],
          ['83', {result: true, prefix: ''}],
          ['84', {result: true, prefix: ''}],
          ['85', {result: true, prefix: ''}]
        ])]])],
        ['api.AbortController.abort', new Map([['chrome', new Map([
          ['82', {result: null, prefix: ''}],
          ['83', {result: null, prefix: ''}],
          ['84', {result: true, prefix: ''}],
          ['85', {result: true, prefix: ''}]
        ])]])],
        ['api.AbortController.AbortController', new Map([['chrome', new Map([
          ['82', {result: null, prefix: ''}],
          ['83', {result: false, prefix: ''}],
          ['84', {result: false, prefix: ''}],
          ['85', {result: true, prefix: ''}]
        ])]])],
        ['api.AudioContext', new Map([['chrome', new Map([
          ['82', {result: null, prefix: ''}],
          ['83', {result: false, prefix: ''}],
          ['84', {result: false, prefix: ''}],
          ['85', {result: true, prefix: ''}]
        ])]])],
        ['api.AudioContext.close', new Map([['chrome', new Map([
          ['82', {result: null, prefix: ''}],
          ['83', {result: false, prefix: ''}],
          ['84', {result: false, prefix: ''}],
          ['85', {result: true, prefix: ''}]
        ])]])],
        ['api.DeprecatedInterface', new Map([['chrome', new Map([
          ['82', {result: null, prefix: ''}],
          ['83', {result: true, prefix: ''}],
          ['84', {result: true, prefix: ''}],
          ['85', {result: false, prefix: ''}]
        ])]])],
        ['api.ExperimentalInterface', new Map([['chrome', new Map([
          ['82', {result: null, prefix: ''}],
          ['83', {result: true, prefix: ''}],
          ['84', {result: false, prefix: ''}],
          ['85', {result: true, prefix: ''}]
        ])]])],
        ['api.PrefixedInterface', new Map([['chrome', new Map([
          ['82', {result: null, prefix: ''}],
          ['83', {result: true, prefix: 'WebKit'}],
          ['84', {result: true, prefix: 'WebKit'}],
          ['85', {result: true, prefix: ''}]
        ])]])],
        ['css.properties.font-family', new Map([['chrome', new Map([
          ['82', {result: null, prefix: ''}],
          ['83', {result: false, prefix: ''}],
          ['84', {result: true, prefix: ''}],
          ['85', {result: true, prefix: ''}]
        ])]])],
        ['css.properties.font-face', new Map([['chrome', new Map([
          ['82', {result: null, prefix: ''}],
          ['83', {result: null, prefix: ''}],
          ['84', {result: null, prefix: ''}],
          ['85', {result: null, prefix: ''}]
        ])]])]
      ]));

      expect(console.warn.calledWith('Ignoring unknown browser/version: Mozilla/5.0 (Windows NT 6.3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 YaBrowser/17.6.1.749 Yowser/2.5 Safari/537.36')).to.be.true;
    });

    afterEach(() => {
      console.warn.restore();
    });
  });

  describe('inferSupportStatements', () => {
    const expectedResults = {
      'api.AbortController': [
        {version_added: '≤83'}
      ],
      'api.AbortController.abort': [
        {version_added: '≤84'}
      ],
      'api.AbortController.AbortController': [
        {version_added: '85'}
      ],
      'api.AudioContext': [
        {version_added: '85'}
      ],
      'api.AudioContext.close': [
        {version_added: '85'}
      ],
      'api.DeprecatedInterface': [
        {version_added: '≤83', version_removed: '85'}
      ],
      'api.ExperimentalInterface': [
        {version_added: '≤83', version_removed: '84'},
        {version_added: '85'}
      ],
      'api.PrefixedInterface': [
        {prefix: 'WebKit', version_added: '≤83'},
        {version_added: '85'}
      ],
      'css.properties.font-family': [
        {version_added: '84'}
      ],
      'css.properties.font-face': []
    };

    const supportMatrix = getSupportMatrix(bcd.browsers, reports);
    for (const [path, browserMap] of supportMatrix.entries()) {
      for (const [_, versionMap] of browserMap.entries()) {
        it(path, () => {
          assert.deepEqual(
              inferSupportStatements(versionMap), expectedResults[path]
          );
        });
      }
    }

    it('Invalid results', () => {
      expect(() => {
        const report = {
          __version: '0.3.1',
          results: {
            'https://mdn-bcd-collector.appspot.com/tests/': [
              {
                name: 'api.AbortController',
                info: {exposure: 'Window'},
                result: 87
              }
            ]
          },
          userAgent: 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'
        };
        const versionMap = getSupportMatrix(bcd.browsers, [report])
            .entries().next().value[1].entries().next().value[1];

        inferSupportStatements(versionMap);
      }).to.throw('result not true/false/null; got 87');
    });
  });
});
