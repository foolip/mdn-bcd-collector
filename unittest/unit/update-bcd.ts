//
// mdn-bcd-collector: unittest/unit/update-bcd.js
// Unittest for the BCD updater script
//
// © Google LLC, Gooborg Studios
// See LICENSE.txt for copyright details
//

import {Report} from '../../types/types.js';

import {assert} from 'chai';
import sinon from 'sinon';
import fs from 'fs-extra';

import logger from '../../logger.js';
import {
  findEntry,
  getSupportMap,
  getSupportMatrix,
  inferSupportStatements,
  update
} from '../../update-bcd.js';

import bcd from './bcd.test.js';
const overrides = await fs.readJson(
  new URL('./overrides.test.json', import.meta.url)
);

const reports: Report[] = [
  {
    __version: '0.3.1',
    results: {
      'https://mdn-bcd-collector.appspot.com/tests/': [
        {
          name: 'api.AbortController',
          exposure: 'Window',
          result: true
        },
        {
          name: 'api.AbortController.abort',
          exposure: 'Window',
          result: null
        },
        {
          name: 'api.AbortController.AbortController',
          exposure: 'Window',
          result: false
        },
        {
          name: 'api.AudioContext',
          exposure: 'Window',
          result: false
        },
        {
          name: 'api.AudioContext.close',
          exposure: 'Window',
          result: null,
          message: 'threw ReferenceError: AbortController is not defined'
        },
        {
          name: 'api.DeprecatedInterface',
          exposure: 'Window',
          result: true
        },
        {
          name: 'api.ExperimentalInterface',
          exposure: 'Window',
          result: true
        },
        {
          name: 'api.NullAPI',
          exposure: 'Window',
          result: null
        },
        {
          name: 'api.RemovedInterface',
          exposure: 'Window',
          result: true
        },
        {
          name: 'api.SuperNewInterface',
          exposure: 'Window',
          result: false
        },
        {
          name: 'css.properties.font-family',
          exposure: 'Window',
          result: true
        },
        {
          name: 'css.properties.font-face',
          exposure: 'Window',
          result: true
        },
        {
          name: 'css.properties.font-style',
          exposure: 'Window',
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
          exposure: 'Window',
          result: true
        },
        {
          name: 'api.AbortController.abort',
          exposure: 'Window',
          result: false
        },
        {
          name: 'api.AbortController.abort',
          exposure: 'Worker',
          result: true
        },
        {
          name: 'api.AbortController.AbortController',
          exposure: 'Window',
          result: false
        },
        {
          name: 'api.AudioContext',
          exposure: 'Window',
          result: false
        },
        {
          name: 'api.AudioContext.close',
          exposure: 'Window',
          result: null,
          message: 'threw ReferenceError: AbortController is not defined'
        },
        {
          name: 'api.DeprecatedInterface',
          exposure: 'Window',
          result: true
        },
        {
          name: 'api.ExperimentalInterface',
          exposure: 'Window',
          result: true
        },
        {
          name: 'api.NewInterfaceNotInBCD',
          exposure: 'Window',
          result: false
        },
        {
          name: 'api.NullAPI',
          exposure: 'Window',
          result: null
        },
        {
          name: 'api.RemovedInterface',
          exposure: 'Window',
          result: false
        },
        {
          name: 'api.SuperNewInterface',
          exposure: 'Window',
          result: false
        },
        {
          name: 'css.properties.font-family',
          exposure: 'Window',
          result: true
        },
        {
          name: 'css.properties.font-face',
          exposure: 'Window',
          result: true
        },
        {
          name: 'css.properties.font-style',
          exposure: 'Window',
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
          exposure: 'Window',
          result: true
        },
        {
          name: 'api.AbortController.abort',
          exposure: 'Window',
          result: true
        },
        {
          name: 'api.AbortController.AbortController',
          exposure: 'Window',
          result: true
        },
        {
          name: 'api.AudioContext',
          exposure: 'Window',
          result: true
        },
        {
          name: 'api.AudioContext.close',
          exposure: 'Window',
          result: true
        },
        {
          name: 'api.DeprecatedInterface',
          exposure: 'Window',
          result: false
        },
        {
          name: 'api.ExperimentalInterface',
          exposure: 'Window',
          result: true
        },
        {
          name: 'api.NewInterfaceNotInBCD',
          exposure: 'Window',
          result: true
        },
        {
          name: 'api.NullAPI',
          exposure: 'Window',
          result: null
        },
        {
          name: 'api.RemovedInterface',
          exposure: 'Window',
          result: true
        },
        {
          name: 'api.SuperNewInterface',
          exposure: 'Window',
          result: false
        },
        {
          name: 'css.properties.font-family',
          exposure: 'Window',
          result: true
        },
        {
          name: 'css.properties.font-face',
          exposure: 'Window',
          result: true
        },
        {
          name: 'css.properties.font-style',
          exposure: 'Window',
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
          exposure: 'Window',
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
          exposure: 'Window',
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
          exposure: 'Window',
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
          exposure: 'Window',
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
          ['api.SuperNewInterface', false],
          ['css.properties.font-family', true],
          ['css.properties.font-face', true],
          ['css.properties.font-style', true]
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
          ['api.SuperNewInterface', false],
          ['css.properties.font-family', true],
          ['css.properties.font-face', true],
          ['css.properties.font-style', true]
        ])
      );
    });

    it('no results', () => {
      assert.throws(() => {
        getSupportMap({
          __version: 'test',
          results: {},
          userAgent: 'abc/1.2.3-beta'
        });
      }, 'Report for "abc/1.2.3-beta" has no results!');
    });
  });

  describe('getSupportMatrix', () => {
    beforeEach(() => {
      sinon.stub(logger, 'warn');
    });

    it('normal', () => {
      assert.deepEqual(
        getSupportMatrix(reports, bcd.browsers, overrides),
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
            'api.SuperNewInterface',
            new Map([
              [
                'chrome',
                new Map([
                  ['82', null],
                  ['83', false],
                  ['84', false],
                  ['85', false]
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
          ],
          [
            'css.properties.font-style',
            new Map([
              [
                'chrome',
                new Map([
                  ['82', false],
                  ['83', false],
                  ['84', false],
                  ['85', true]
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
      'api.SuperNewInterface': {
        chrome: [{version_added: false}]
      },
      'css.properties.font-family': {chrome: [{version_added: '84'}]},
      'css.properties.font-face': {chrome: []},
      'css.properties.font-style': {chrome: [{version_added: '85'}]}
    };

    const supportMatrix = getSupportMatrix(reports, bcd.browsers, overrides);
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
      assert.throws(() => {
        const report: Report = {
          __version: '0.3.1',
          results: {
            'https://mdn-bcd-collector.appspot.com/tests/': [
              {
                name: 'api.AbortController',
                exposure: 'Window',
                result: 87 as any
              }
            ]
          },
          userAgent:
            'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36'
        };
        const versionMap = getSupportMatrix([report], bcd.browsers, overrides)
          .entries()
          .next()
          .value[1].entries()
          .next().value[1];

        inferSupportStatements(versionMap);
      }, 'result not true/false/null; got 87');
    });
  });

  describe('update', () => {
    const supportMatrix = getSupportMatrix(reports, bcd.browsers, overrides);
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
            __compat: {
              support: {
                chrome: [
                  {
                    version_added: '85'
                  },
                  {
                    version_added: '1',
                    prefix: 'webkit'
                  }
                ]
              }
            },
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
                  },
                  {
                    version_added: '50',
                    version_removed: '70',
                    alternative_name: 'TryingOutInterface',
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
          },
          SuperNewInterface: {
            __compat: {support: {chrome: {version_added: '100'}}}
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
            },
            'font-style': {
              __compat: {support: {chrome: {version_added: '85'}}}
            }
          }
        },
        javascript: {
          builtins: {
            Array: {
              __compat: {support: {chrome: {version_added: null}}}
            },
            Date: {
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

    describe('mirror', () => {
      const browsers: any = {
        chrome: {name: 'Chrome', releases: {85: {}, 86: {}}},
        chrome_android: {
          name: 'Chrome Android',
          upstream: 'chrome',
          releases: {86: {}}
        }
      };

      const bcdFromSupport = (support) => ({
        api: {FakeInterface: {__compat: {support}}}
      });

      const mirroringCase = ({support, downstreamResult}) => {
        const reports: Report[] = [
          {
            __version: '0.3.1',
            results: {
              'https://mdn-bcd-collector.appspot.com/tests/': [
                {
                  name: 'api.FakeInterface',
                  exposure: 'Window',
                  result: downstreamResult
                }
              ]
            },
            userAgent:
              'Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.5112.97 Mobile Safari/537.36'
          }
        ];
        const supportMatrix = getSupportMatrix(reports, browsers, []);
        const bcd = bcdFromSupport(support);
        update(bcd, supportMatrix, {});
        return bcd;
      };

      describe('supported upstream (without flags)', () => {
        it('supported in downstream test results', () => {
          const actual = mirroringCase({
            support: {
              chrome: {version_added: '85'},
              chrome_android: 'mirror'
            },
            downstreamResult: true
          });
          assert.deepEqual(
            actual,
            bcdFromSupport({
              chrome: {version_added: '85'},
              chrome_android: 'mirror'
            })
          );
        });

        it('unsupported in downstream test results', () => {
          const actual = mirroringCase({
            support: {
              chrome: {version_added: '85'},
              chrome_android: 'mirror'
            },
            downstreamResult: false
          });
          assert.deepEqual(
            actual,
            bcdFromSupport({
              chrome: {version_added: '85'},
              chrome_android: 'mirror'
            })
          );
        });

        it('omitted from downstream test results', () => {
          const actual = mirroringCase({
            support: {
              chrome: {version_added: '85'},
              chrome_android: 'mirror'
            },
            downstreamResult: null
          });
          assert.deepEqual(
            actual,
            bcdFromSupport({
              chrome: {version_added: '85'},
              chrome_android: 'mirror'
            })
          );
        });
      });

      describe('supported upstream (with flags)', () => {
        it('supported in downstream test results', () => {
          const actual = mirroringCase({
            support: {
              chrome: {version_added: '85', flags: [{}]},
              chrome_android: 'mirror'
            },
            downstreamResult: true
          });
          assert.deepEqual(
            actual,
            bcdFromSupport({
              chrome: {version_added: '85', flags: [{}]},
              chrome_android: [
                {version_added: '86'},
                {flags: [{}], version_added: '85'}
              ]
            })
          );
        });

        it('unsupported in downstream test results', () => {
          const actual = mirroringCase({
            support: {
              chrome: {version_added: '85', flags: [{}]},
              chrome_android: 'mirror'
            },
            downstreamResult: false
          });
          assert.deepEqual(
            actual,
            bcdFromSupport({
              chrome: {version_added: '85', flags: [{}]},
              chrome_android: 'mirror'
            })
          );
        });

        it('omitted from downstream test results', () => {
          const actual = mirroringCase({
            support: {
              chrome: {version_added: '85', flags: [{}]},
              chrome_android: 'mirror'
            },
            downstreamResult: null
          });
          assert.deepEqual(
            actual,
            bcdFromSupport({
              chrome: {version_added: '85', flags: [{}]},
              chrome_android: 'mirror'
            })
          );
        });
      });

      describe('unsupported upstream', () => {
        it('supported in downstream test results', () => {
          const actual = mirroringCase({
            support: {
              chrome: {version_added: false},
              chrome_android: 'mirror'
            },
            downstreamResult: true
          });
          assert.deepEqual(
            actual,
            bcdFromSupport({
              chrome: {version_added: false},
              chrome_android: 'mirror'
            })
          );
        });

        it('unsupported in downstream test results', () => {
          const actual = mirroringCase({
            support: {
              chrome: {version_added: false},
              chrome_android: 'mirror'
            },
            downstreamResult: false
          });
          assert.deepEqual(
            actual,
            bcdFromSupport({
              chrome: {version_added: false},
              chrome_android: 'mirror'
            })
          );
        });

        it('omitted from downstream test results', () => {
          const actual = mirroringCase({
            support: {
              chrome: {version_added: false},
              chrome_android: 'mirror'
            },
            downstreamResult: null
          });
          assert.deepEqual(
            actual,
            bcdFromSupport({
              chrome: {version_added: false},
              chrome_android: 'mirror'
            })
          );
        });
      });
    });
  });
});
