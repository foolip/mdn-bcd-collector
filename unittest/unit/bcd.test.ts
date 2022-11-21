//
// mdn-bcd-collector: unittest/unit/bcd.test.js
// Unittest helper containing pseudo BCD
//
// © Gooborg Studios
// See the LICENSE file for copyright details
//

import type {CompatData} from '@mdn/browser-compat-data';

export default {
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
      __compat: {
        support: {
          chrome: [
            {
              version_added: null
            },
            {
              version_added: '1',
              prefix: 'webkit'
            }
          ]
        }
      },
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
    UnflaggedInterface: {
      __compat: {
        support: {
          chrome: [
            {
              version_added: '83',
              flags: {},
              notes: 'Not supported on Windows XP.'
            }
          ]
        }
      }
    },
    UnprefixedInterface: {
      __compat: {
        support: {
          chrome: [
            {
              version_added: '83',
              prefix: 'webkit',
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
        __compat: {support: {chrome: {version_added: null}}}
      },
      'font-face': {
        __compat: {support: {chrome: {version_added: null}}}
      },
      'font-style': {
        __compat: {support: {chrome: {version_added: null}}}
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
} as any as CompatData;
