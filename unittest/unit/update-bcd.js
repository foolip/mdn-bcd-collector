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

const {assert} = require('chai');

const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

const logger = require('../../logger');

const bcd = {
  api: {
    AbortController: {
      __compat: {
        support: {
          chrome: {version_added: '80'},
          safari: {version_added: null}
        }
      },
      AbortController: {
        __compat: {support: {chrome: {version_added: null}}}
      },
      abort: {
        __compat: {support: {chrome: {version_added: '85'}}}
      },
      dummy: {
        __compat: {support: {chrome: {version_added: null}}}
      },
      signal: {
        __compat: {support: {chrome: {version_added: null}}}
      }
    },
    AudioContext: {
      __compat: {support: {chrome: {version_added: null}}},
      close: {
        __compat: {support: {}}
      }
    },
    DeprecatedInterface: {
      __compat: {support: {chrome: {version_added: null}}}
    },
    DummyAPI: {
      __compat: {support: {chrome: {version_added: null}}},
      dummy: {
        __compat: {support: {chrome: {version_added: null}}}
      }
    },
    ExperimentalInterface: {
      __compat: {
        support: {
          chrome: [
            {
              version_added: '70',
              notes: 'Not supported on Windows XP.'
            },
            {
              version_added: '64',
              version_removed: '70',
              flags: {},
              notes: 'Not supported on Windows XP.'
            }
          ]
        }
      }
    },
    NullAPI: {
      __compat: {support: {chrome: {version_added: '80'}}}
    },
    RemovedInterface: {
      __compat: {support: {chrome: {version_added: null}}}
    }
  },
  browsers: {
    chrome: {name: 'Chrome', releases: {82: {}, 83: {}, 84: {}, 85: {}}},
    chrome_android: {name: 'Chrome Android', releases: {85: {}}},
    edge: {name: 'Edge', releases: {16: {}, 84: {}}},
    safari: {name: 'Safari', releases: {13: {}, 13.1: {}, 14: {}}},
    safari_ios: {
      name: 'iOS Safari',
      releases: {13: {}, 13.3: {}, 13.4: {}, 14: {}}
    },
    samsunginternet_android: {
      name: 'Samsung Internet',
      releases: {
        '10.0': {},
        10.2: {},
        '11.0': {},
        11.2: {},
        '12.0': {},
        12.1: {}
      }
    }
  },
  css: {
    properties: {
      'font-family': {
        __compat: {support: {chrome: {version_added: null}}}
      },
      'font-face': {
        __compat: {support: {chrome: {version_added: null}}}
      }
    }
  }
};

const {
  findEntry,
  getSupportMap,
  getSupportMatrix,
  inferSupportStatements,
  update
} = proxyquire('../../update-bcd', {
  './overrides': [
    'Test overrides',
    ['css.properties.font-family', 'safari', '5.1', false, ''],
    ['css.properties.font-family', 'chrome', '83', false, ''],
    ['css.properties.font-face', 'chrome', '*', null, '']
  ],
  '../browser-compat-data': bcd
});

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
          name: 'api.NullAPI',
          info: {exposure: 'Window'},
          result: null
        },
        {
          name: 'api.RemovedInterface',
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
    userAgent:
      'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'
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
          result: true
        },
        {
          name: 'api.NewInterfaceNotInBCD',
          info: {exposure: 'Window'},
          result: false
        },
        {
          name: 'api.NullAPI',
          info: {exposure: 'Window'},
          result: null
        },
        {
          name: 'api.RemovedInterface',
          info: {exposure: 'Window'},
          result: false
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
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36'
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
          name: 'api.NewInterfaceNotInBCD',
          info: {exposure: 'Window'},
          result: true
        },
        {
          name: 'api.NullAPI',
          info: {exposure: 'Window'},
          result: null
        },
        {
          name: 'api.RemovedInterface',
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
    userAgent:
      'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36'
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
    userAgent:
      'Mozilla/5.0 (Windows NT 6.3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 YaBrowser/17.6.1.749 Yowser/2.5 Safari/537.36'
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
    userAgent:
      'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/1000.1.4183.83 Safari/537.36'
  },
  {
    __version: '0.3.1',
    results: {
      'https://mdn-bcd-collector.appspot.com/tests/': [
        {
          name: 'api.AbortController',
          info: {exposure: 'Window'},
          result: true
        }
      ]
    },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.2 Safari/605.1.15'
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
    userAgent: 'node-superagent/1.2.3'
  }
];

describe('BCD updater', () => {
  describe('findEntry', () => {
    it('equal', () => {
      assert.strictEqual(
        findEntry(bcd, 'api.AbortController'),
        bcd.api.AbortController
      );
    });

    it('no path', () => {
      assert.strictEqual(findEntry(bcd, ''), null);
    });

    it('invalid path', () => {
      assert.strictEqual(findEntry(bcd, 'api.MissingAPI'), undefined);
    });
  });

  describe('getSupportMap', () => {
    it('normal', () => {
      assert.deepEqual(
        getSupportMap(reports[0]),
        new Map([
          ['api.AbortController', true],
          ['api.AbortController.abort', null],
          ['api.AbortController.AbortController', false],
          ['api.AudioContext', false],
          ['api.AudioContext.close', false],
          ['api.DeprecatedInterface', true],
          ['api.ExperimentalInterface', true],
          ['api.NullAPI', null],
          ['api.RemovedInterface', true],
          ['css.properties.font-family', true],
          ['css.properties.font-face', true]
        ])
      );
    });

    it('support in only one exposure', () => {
      assert.deepEqual(
        getSupportMap(reports[1]),
        new Map([
          ['api.AbortController', true],
          ['api.AbortController.abort', true],
          ['api.AbortController.AbortController', false],
          ['api.AudioContext', false],
          ['api.AudioContext.close', false],
          ['api.DeprecatedInterface', true],
          ['api.ExperimentalInterface', true],
          ['api.NewInterfaceNotInBCD', false],
          ['api.NullAPI', null],
          ['api.RemovedInterface', false],
          ['css.properties.font-family', true],
          ['css.properties.font-face', true]
        ])
      );
    });

    it('no results', () => {
      assert.throws(
        () => {
          getSupportMap({results: {}, userAgent: 'abc/1.2.3-beta'});
        },
        Error,
        'Report for "abc/1.2.3-beta" has no results!'
      );
    });
  });

  describe('getSupportMatrix', () => {
    beforeEach(() => {
      sinon.stub(logger, 'warn');
    });

    it('normal', () => {
      assert.deepEqual(
        getSupportMatrix(reports),
        new Map([
          [
            'api.AbortController',
            new Map([
              [
                'chrome',
                new Map([
                  ['82', null],
                  ['83', true],
                  ['84', true],
                  ['85', true]
                ])
              ],
              [
                'safari',
                new Map([
                  ['13', null],
                  ['13.1', true],
                  ['14', null]
                ])
              ]
            ])
          ],
          [
            'api.AbortController.abort',
            new Map([
              [
                'chrome',
                new Map([
                  ['82', null],
                  ['83', null],
                  ['84', true],
                  ['85', true]
                ])
              ]
            ])
          ],
          [
            'api.AbortController.AbortController',
            new Map([
              [
                'chrome',
                new Map([
                  ['82', null],
                  ['83', false],
                  ['84', false],
                  ['85', true]
                ])
              ]
            ])
          ],
          [
            'api.AudioContext',
            new Map([
              [
                'chrome',
                new Map([
                  ['82', null],
                  ['83', false],
                  ['84', false],
                  ['85', true]
                ])
              ]
            ])
          ],
          [
            'api.AudioContext.close',
            new Map([
              [
                'chrome',
                new Map([
                  ['82', null],
                  ['83', false],
                  ['84', false],
                  ['85', true]
                ])
              ]
            ])
          ],
          [
            'api.DeprecatedInterface',
            new Map([
              [
                'chrome',
                new Map([
                  ['82', null],
                  ['83', true],
                  ['84', true],
                  ['85', false]
                ])
              ]
            ])
          ],
          [
            'api.ExperimentalInterface',
            new Map([
              [
                'chrome',
                new Map([
                  ['82', null],
                  ['83', true],
                  ['84', true],
                  ['85', true]
                ])
              ]
            ])
          ],
          [
            'api.NewInterfaceNotInBCD',
            new Map([
              [
                'chrome',
                new Map([
                  ['82', null],
                  ['83', null],
                  ['84', false],
                  ['85', true]
                ])
              ]
            ])
          ],
          [
            'api.NullAPI',
            new Map([
              [
                'chrome',
                new Map([
                  ['82', null],
                  ['83', null],
                  ['84', null],
                  ['85', null]
                ])
              ]
            ])
          ],
          [
            'api.RemovedInterface',
            new Map([
              [
                'chrome',
                new Map([
                  ['82', null],
                  ['83', true],
                  ['84', false],
                  ['85', true]
                ])
              ]
            ])
          ],
          [
            'css.properties.font-family',
            new Map([
              [
                'chrome',
                new Map([
                  ['82', null],
                  ['83', false],
                  ['84', true],
                  ['85', true]
                ])
              ]
            ])
          ],
          [
            'css.properties.font-face',
            new Map([
              [
                'chrome',
                new Map([
                  ['82', null],
                  ['83', null],
                  ['84', null],
                  ['85', null]
                ])
              ]
            ])
          ]
        ])
      );

      assert.isTrue(
        logger.warn.calledWith(
          'Ignoring unknown browser Yandex 17.6 (Mozilla/5.0 (Windows NT 6.3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 YaBrowser/17.6.1.749 Yowser/2.5 Safari/537.36)'
        )
      );
      assert.isTrue(
        logger.warn.calledWith(
          'Ignoring unknown Chrome version 1000.1 (Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/1000.1.4183.83 Safari/537.36)'
        )
      );
      assert.isTrue(
        logger.warn.calledWith(
          'Unable to parse browser from UA node-superagent/1.2.3'
        )
      );
    });

    afterEach(() => {
      logger.warn.restore();
    });
  });

  describe('inferSupportStatements', () => {
    const expectedResults = {
      'api.AbortController': {
        chrome: [{version_added: '0> ≤83'}],
        safari: [{version_added: '0> ≤13.1'}]
      },
      'api.AbortController.abort': {chrome: [{version_added: '0> ≤84'}]},
      'api.AbortController.AbortController': {chrome: [{version_added: '85'}]},
      'api.AudioContext': {chrome: [{version_added: '85'}]},
      'api.AudioContext.close': {chrome: [{version_added: '85'}]},
      'api.DeprecatedInterface': {
        chrome: [{version_added: '0> ≤83', version_removed: '85'}]
      },
      'api.ExperimentalInterface': {chrome: [{version_added: '0> ≤83'}]},
      'api.NewInterfaceNotInBCD': {chrome: [{version_added: '85'}]},
      'api.NullAPI': {chrome: []},
      'api.RemovedInterface': {
        chrome: [
          {version_added: '0> ≤83', version_removed: '84'},
          {version_added: '85'}
        ]
      },
      'css.properties.font-family': {chrome: [{version_added: '84'}]},
      'css.properties.font-face': {chrome: []}
    };

    const supportMatrix = getSupportMatrix(reports);
    for (const [path, browserMap] of supportMatrix.entries()) {
      for (const [browser, versionMap] of browserMap.entries()) {
        it(`${path}: ${browser}`, () => {
          assert.deepEqual(
            inferSupportStatements(versionMap),
            expectedResults[path][browser]
          );
        });
      }
    }

    it('Invalid results', () => {
      assert.throws(
        () => {
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
            userAgent:
              'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'
          };
          const versionMap = getSupportMatrix([report])
            .entries()
            .next()
            .value[1].entries()
            .next().value[1];

          inferSupportStatements(versionMap);
        },
        Error,
        'result not true/false/null; got 87'
      );
    });
  });

  describe('update', () => {
    const supportMatrix = getSupportMatrix(reports);
    let bcdCopy;

    beforeEach(() => {
      bcdCopy = JSON.parse(JSON.stringify(bcd));
    });

    it('normal', () => {
      update(bcdCopy, supportMatrix, {});
      assert.deepEqual(bcdCopy, {
        api: {
          AbortController: {
            __compat: {
              support: {
                chrome: {version_added: '80'},
                safari: {version_added: '≤13.1'}
              }
            },
            AbortController: {
              __compat: {support: {chrome: {version_added: '85'}}}
            },
            abort: {
              __compat: {support: {chrome: {version_added: '≤84'}}}
            },
            dummy: {
              __compat: {support: {chrome: {version_added: null}}}
            },
            signal: {
              __compat: {support: {chrome: {version_added: null}}}
            }
          },
          AudioContext: {
            __compat: {support: {chrome: {version_added: '85'}}},
            close: {
              __compat: {support: {chrome: {version_added: '85'}}}
            }
          },
          DeprecatedInterface: {
            __compat: {
              support: {
                chrome: {
                  version_added: '≤83',
                  version_removed: '85'
                }
              }
            }
          },
          DummyAPI: {
            __compat: {support: {chrome: {version_added: null}}},
            dummy: {
              __compat: {support: {chrome: {version_added: null}}}
            }
          },
          ExperimentalInterface: {
            __compat: {
              support: {
                chrome: [
                  {
                    version_added: '70',
                    notes: 'Not supported on Windows XP.'
                  },
                  {
                    version_added: '64',
                    version_removed: '70',
                    flags: {},
                    notes: 'Not supported on Windows XP.'
                  }
                ]
              }
            }
          },
          NullAPI: {
            __compat: {support: {chrome: {version_added: '80'}}}
          },
          RemovedInterface: {
            // TODO: handle more complicated scenarios
            // __compat: {support: {chrome: [
            //   {version_added: '85'},
            //   {version_added: '≤83', version_removed: '84'}
            // ]}}
            __compat: {support: {chrome: {version_added: null}}}
          }
        },
        browsers: {
          chrome: {name: 'Chrome', releases: {82: {}, 83: {}, 84: {}, 85: {}}},
          chrome_android: {name: 'Chrome Android', releases: {85: {}}},
          edge: {name: 'Edge', releases: {16: {}, 84: {}}},
          safari: {name: 'Safari', releases: {13: {}, 13.1: {}, 14: {}}},
          safari_ios: {
            name: 'iOS Safari',
            releases: {13: {}, 13.3: {}, 13.4: {}, 14: {}}
          },
          samsunginternet_android: {
            name: 'Samsung Internet',
            releases: {
              '10.0': {},
              10.2: {},
              '11.0': {},
              11.2: {},
              '12.0': {},
              12.1: {}
            }
          }
        },
        css: {
          properties: {
            'font-family': {
              __compat: {support: {chrome: {version_added: '84'}}}
            },
            'font-face': {
              __compat: {support: {chrome: {version_added: null}}}
            }
          }
        }
      });
    });

    it('limit browsers', () => {
      update(bcdCopy, supportMatrix, {browser: ['chrome']});
      assert.deepEqual(bcdCopy.api.AbortController.__compat.support.safari, {
        version_added: null
      });
    });
  });
});
