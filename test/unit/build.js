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

const chai = require('chai');
const chaiSubset = require('chai-subset');
const chaiFs = require('chai-fs');
chai.use(chaiSubset).use(chaiFs);
const assert = chai.assert;
const expect = chai.expect;

const WebIDL2 = require('webidl2');
const fs = require('fs');

const {
  writeText,
  loadCustomTests,
  getCustomTestAPI,
  getCustomTestCSS,
  collectCSSPropertiesFromBCD,
  collectCSSPropertiesFromReffy,
  cssPropertyToIDLAttribute,
  flattenIDL,
  getExposureSet,
  buildIDLTests,
  validateIDL
} = require('../../build');

describe('build', () => {
  describe('writeText', () => {
    const filepath = '.testtmp';

    it('simple supported', () => {
      writeText(filepath, 'foo\nbar');
      assert.fileContent(filepath, 'foo\nbar\n');
    });

    it('array', () => {
      writeText(filepath, ['foo', 'bar', 'baz']);
      assert.fileContent(filepath, 'foo\nbar\nbaz\n');
    });

    afterEach(() => {
      fs.unlinkSync(filepath);
    });
  });

  describe('getCustomTestAPI', () => {
    describe('no custom tests', () => {
      beforeEach(() => {
        loadCustomTests({api: {}, css: {}});
      });

      it('interface', () => {
        assert.equal(getCustomTestAPI('foo'), false);
      });

      it('member', () => {
        assert.equal(getCustomTestAPI('foo', 'bar'), false);
      });
    });

    describe('custom test for interface only', () => {
      beforeEach(() => {
        loadCustomTests({
          api: {
            'foo': {
              '__base': 'var a = 1;',
              '__test': 'return a;'
            }
          },
          css: {}
        });
      });

      it('interface', () => {
        assert.equal(
            getCustomTestAPI('foo'),
            '(function() {var a = 1;return a;})()'
        );
      });

      it('member', () => {
        assert.equal(getCustomTestAPI('foo', 'bar'), false);
      });
    });

    describe('custom test for member only', () => {
      beforeEach(() => {
        loadCustomTests({
          api: {
            'foo': {
              '__base': 'var a = 1;',
              'bar': 'return a + 1;'
            }
          },
          css: {}
        });
      });

      it('interface', () => {
        assert.equal(getCustomTestAPI('foo'), false);
      });

      it('member', () => {
        assert.equal(
            getCustomTestAPI('foo', 'bar'),
            '(function() {var a = 1;return a + 1;})()'
        );
      });
    });

    describe('custom test for member only, no __base', () => {
      beforeEach(() => {
        loadCustomTests({
          api: {
            'foo': {
              'bar': 'return 1 + 1;'
            }
          },
          css: {}
        });
      });

      it('interface', () => {
        assert.equal(getCustomTestAPI('foo'), false);
      });

      it('member', () => {
        assert.equal(
            getCustomTestAPI('foo', 'bar'),
            '(function() {return 1 + 1;})()'
        );
      });
    });

    describe('custom test for interface and member', () => {
      beforeEach(() => {
        loadCustomTests({
          api: {
            'foo': {
              '__base': 'var a = 1;',
              '__test': 'return a;',
              'bar': 'return a + 1;'
            }
          },
          css: {}
        });
      });

      it('interface', () => {
        assert.equal(
            getCustomTestAPI('foo'),
            '(function() {var a = 1;return a;})()'
        );
      });

      it('member', () => {
        assert.equal(
            getCustomTestAPI('foo', 'bar'),
            '(function() {var a = 1;return a + 1;})()'
        );
      });
    });
  });

  describe('getCustomTestCSS', () => {
    it('no custom tests', () => {
      loadCustomTests({api: {}, css: {}});
      assert.equal(getCustomTestCSS('foo'), false);
    });

    it('custom test for property', () => {
      loadCustomTests({
        api: {},
        css: {
          properties: {
            foo: 'return 1;'
          }
        }
      });

      assert.equal(getCustomTestCSS('foo'), '(function() {return 1;})()');
    });
  });

  describe('collectCSSPropertiesFromBCD', () => {
    it('simple supported', () => {
      const bcd = {
        css: {
          properties: {
            appearance: {
              __compat: {
                support: {}
              }
            }
          }
        }
      };
      const propertySet = new Set();
      collectCSSPropertiesFromBCD(bcd, propertySet);
      const properties = Array.from(propertySet);
      assert.deepEqual(properties, ['appearance']);
    });

    it('aliased support', () => {
      const bcd = {
        css: {
          properties: {
            'font-smooth': {
              __compat: {
                support: {
                  safari: {
                    alternative_name: '-webkit-font-smoothing'
                  }
                }
              }
            }
          }
        }
      };
      const propertySet = new Set();
      collectCSSPropertiesFromBCD(bcd, propertySet);
      const properties = Array.from(propertySet);
      assert.deepEqual(properties, ['font-smooth', '-webkit-font-smoothing']);
    });

    it('support array', () => {
      const bcd = {
        css: {
          properties: {
            'font-smooth': {
              __compat: {
                support: {
                  safari: [
                    {
                      prefix: '-webkit-'
                    },
                    {
                      alternative_name: '-webkit-font-smoothing'
                    }
                  ]
                }
              }
            }
          }
        }
      };
      const propertySet = new Set();
      collectCSSPropertiesFromBCD(bcd, propertySet);
      const properties = Array.from(propertySet);
      assert.deepEqual(properties, ['font-smooth', '-webkit-font-smoothing']);
    });

    it('no __compat statement', () => {
      const bcd = {
        css: {
          properties: {
            appearance: {}
          }
        }
      };
      const propertySet = new Set();
      collectCSSPropertiesFromBCD(bcd, propertySet);
      const properties = Array.from(propertySet);
      assert.deepEqual(properties, ['appearance']);
    });

    it('no __compat.support statement', () => {
      const bcd = {
        css: {
          properties: {
            appearance: {
              __compat: {}
            }
          }
        }
      };
      const propertySet = new Set();
      collectCSSPropertiesFromBCD(bcd, propertySet);
      const properties = Array.from(propertySet);
      assert.deepEqual(properties, ['appearance']);
    });
  });

  it('collectCSSPropertiesFromReffy', () => {
    const reffy = {
      css: {
        'css-fonts': {
          properties: {
            'font-family': {},
            'font-weight': {}
          }
        },
        'css-grid': {
          properties: {
            'grid': {}
          }
        }
      }
    };
    const propertySet = new Set();
    collectCSSPropertiesFromReffy(reffy, propertySet);
    const properties = Array.from(propertySet);
    assert.deepEqual(properties, ['font-family', 'font-weight', 'grid']);
  });

  it('cssPropertyToIDLAttribute', () => {
    assert.equal(cssPropertyToIDLAttribute('line-height'), 'lineHeight');
    assert.equal(cssPropertyToIDLAttribute('-webkit-line-clamp', true),
        'webkitLineClamp');
  });

  describe('flattenIDL', () => {
    const historicalIDL = WebIDL2.parse(`interface DOMError {};`);

    it('interface + mixin', () => {
      const specIDLs = {
        first: WebIDL2.parse(`interface DummyError : Error {
               readonly attribute boolean imadumdum;
             };`),
        secnd: WebIDL2.parse(
            `interface mixin DummyErrorHelper {
               DummyError geterror();
             };

             DummyError includes DummyErrorHelper;`)
      };
      const ast = flattenIDL(specIDLs, historicalIDL);

      const interfaces = ast.filter((dfn) => dfn.type === 'interface');
      assert.lengthOf(interfaces, 2);

      assert.equal(interfaces[0].name, 'DummyError');
      assert.lengthOf(interfaces[0].members, 2);
      assert.containSubset(interfaces[0].members[0], {
        type: 'attribute',
        name: 'imadumdum'
      });
      assert.containSubset(interfaces[0].members[1], {
        type: 'operation',
        name: 'geterror'
      });

      assert.equal(interfaces[1].name, 'DOMError');
    });

    it('namespace + partial namespace', () => {
      const specIDLs = {
        cssom: WebIDL2.parse(`namespace CSS { boolean supports(); };`),
        paint: WebIDL2.parse(
            `partial namespace CSS {
               readonly attribute any paintWorklet;
             };`)
      };
      const ast = flattenIDL(specIDLs, historicalIDL);

      const namespaces = ast.filter((dfn) => dfn.type === 'namespace');
      assert.lengthOf(namespaces, 1);
      const [namespace] = namespaces;
      assert.equal(namespace.name, 'CSS');
      assert.lengthOf(namespace.members, 2);
      assert.containSubset(namespace.members[0], {
        type: 'operation',
        name: 'supports'
      });
      assert.containSubset(namespace.members[1], {
        type: 'attribute',
        name: 'paintWorklet'
      });

      const interfaces = ast.filter((dfn) => dfn.type === 'interface');
      assert.lengthOf(interfaces, 1);
      assert.equal(interfaces[0].name, 'DOMError');
    });

    it('mixin missing', () => {
      const specIDLs = {
        first: WebIDL2.parse(`interface mixin DummyErrorHelper {
               DummyError geterror();
             };`),
        secnd: WebIDL2.parse(`DummyError includes DummyErrorHelper;`)
      };

      expect(() => {
        flattenIDL(specIDLs, historicalIDL);
      // eslint-disable-next-line max-len
      }).to.throw('Target DummyError not found for interface mixin DummyErrorHelper');
    });

    it('interface missing', () => {
      const specIDLs = {
        first: WebIDL2.parse(`interface DummyError : Error {
               readonly attribute boolean imadumdum;
             };`),
        secnd: WebIDL2.parse(`DummyError includes DummyErrorHelper;`)
      };

      expect(() => {
        flattenIDL(specIDLs, historicalIDL);
      // eslint-disable-next-line max-len
      }).to.throw('Interface mixin DummyErrorHelper not found for target DummyError');
    });

    it('Operation overloading', () => {
      const specIDLs = {
        cssom: WebIDL2.parse(`namespace CSS { boolean supports(); };`),
        paint: WebIDL2.parse(
            `partial namespace CSS {
               readonly attribute any paintWorklet;
             };`),
        paint2: WebIDL2.parse(
            `partial namespace CSS {
               boolean supports();
             };`)
      };
      expect(() => {
        flattenIDL(specIDLs, historicalIDL);
      // eslint-disable-next-line max-len
      }).to.throw('Operation overloading across partials/mixins for CSS.supports');
    });

    it('Partial missing main', () => {
      const specIDLs = {
        paint: WebIDL2.parse(
            `partial namespace CSS {
               readonly attribute any paintWorklet;
             };`)
      };
      expect(() => {
        flattenIDL(specIDLs, historicalIDL);
      }).to.throw('Original definition not found for partial namespace CSS');
    });
  });

  describe('getExposureSet', () => {
    const historicalIDL = WebIDL2.parse(`interface DOMError {};`);

    it('no defined exposure set', () => {
      const specIDLs = {
        first: WebIDL2.parse(`interface Dummy {
               readonly attribute boolean imadumdum;
             };`)
      };
      const ast = flattenIDL(specIDLs, historicalIDL);
      const interfaces = ast.filter((dfn) => dfn.type === 'interface');
      const exposureSet = getExposureSet(interfaces[0]);
      assert.hasAllKeys(exposureSet, ['Window']);
    });

    it('single exposure', () => {
      const specIDLs = {
        first: WebIDL2.parse(`[Exposed=Worker] interface Dummy {
               readonly attribute boolean imadumdum;
             };`)
      };
      const ast = flattenIDL(specIDLs, historicalIDL);
      const interfaces = ast.filter((dfn) => dfn.type === 'interface');
      const exposureSet = getExposureSet(interfaces[0]);
      assert.hasAllKeys(exposureSet, ['Worker']);
    });

    it('multiple exposure', () => {
      const specIDLs = {
        first: WebIDL2.parse(`[Exposed=(Window,Worker)] interface Dummy {
               readonly attribute boolean imadumdum;
             };`)
      };
      const ast = flattenIDL(specIDLs, historicalIDL);
      const interfaces = ast.filter((dfn) => dfn.type === 'interface');
      const exposureSet = getExposureSet(interfaces[0]);
      assert.hasAllKeys(exposureSet, ['Window', 'Worker']);
    });
  });

  describe('buildIDLTests', () => {
    it('interface with attribute', () => {
      const ast = WebIDL2.parse(`interface Attr { attribute any name; };`);
      assert.deepEqual(buildIDLTests(ast), [
        ['Attr', {property: 'Attr', scope: 'self'}],
        ['Attr.name', [
          {property: 'Attr', scope: 'self'},
          {property: 'name', scope: 'Attr.prototype'}
        ]]
      ]);
    });

    it('interface with method', () => {
      const ast = WebIDL2.parse(
          `interface Node {
             boolean contains(Node? other);
           };`);
      assert.deepEqual(buildIDLTests(ast), [
        ['Node', {property: 'Node', scope: 'self'}],
        ['Node.contains', [
          {property: 'Node', scope: 'self'},
          {property: 'contains', scope: 'Node.prototype'}
        ]]
      ]);
    });

    it('interface with static method', () => {
      const ast = WebIDL2.parse(
          `interface MediaSource {
             static boolean isTypeSupported(DOMString type);
           };`);
      assert.deepEqual(buildIDLTests(ast), [
        ['MediaSource', {property: 'MediaSource', scope: 'self'}],
        ['MediaSource.isTypeSupported', [
          {property: 'MediaSource', scope: 'self'},
          {property: 'isTypeSupported', scope: 'MediaSource'}
        ]]
      ]);
    });

    it('interface with const', () => {
      const ast = WebIDL2.parse(
          `interface Window {
             const boolean isWindow = true;
           };`);
      assert.deepEqual(buildIDLTests(ast), [
        ['Window', {property: 'Window', scope: 'self'}],
        ['Window.isWindow', [
          {property: 'Window', scope: 'self'},
          {property: 'isWindow', scope: 'Window'}
        ]]
      ]);
    });

    it('interface with custom test', () => {
      const ast = WebIDL2.parse(
          `interface ANGLE_instanced_arrays {
            void drawArraysInstancedANGLE(
              GLenum mode,
              GLint first,
              GLsizei count,
              GLsizei primcount
            );
          };`);
      loadCustomTests({
        'api': {
          'ANGLE_instanced_arrays': {
            // eslint-disable-next-line max-len
            '__base': 'var canvas = document.createElement(\'canvas\'); var gl = canvas.getContext(\'webgl\'); var a = gl.getExtension(\'ANGLE_instanced_arrays\');',
            '__test': 'return !!a;',
            // eslint-disable-next-line max-len
            'drawArraysInstancedANGLE': 'return a && \'drawArraysInstancedANGLE\' in a;'
          }
        },
        'css': {}
      });
      assert.deepEqual(buildIDLTests(ast), [
        // eslint-disable-next-line max-len
        ['ANGLE_instanced_arrays', '(function() {var canvas = document.createElement(\'canvas\'); var gl = canvas.getContext(\'webgl\'); var a = gl.getExtension(\'ANGLE_instanced_arrays\');return !!a;})()'],
        // eslint-disable-next-line max-len
        ['ANGLE_instanced_arrays.drawArraysInstancedANGLE', '(function() {var canvas = document.createElement(\'canvas\'); var gl = canvas.getContext(\'webgl\'); var a = gl.getExtension(\'ANGLE_instanced_arrays\');return a && \'drawArraysInstancedANGLE\' in a;})()']
      ]);
    });

    it('interface with legacy namespace', () => {
      const ast = WebIDL2.parse(`[LegacyNamespace] interface Legacy {};`);
      assert.deepEqual(buildIDLTests(ast), []);
    });

    it('global interface', () => {
      const ast = WebIDL2.parse(`[Global=(Window,Worker)]
      interface WindowOrWorkerGlobalScope {
        attribute boolean isLoaded;
        const boolean active = true;
      };`);
      assert.deepEqual(buildIDLTests(ast), [
        [
          'WindowOrWorkerGlobalScope',
          {
            'property': 'WindowOrWorkerGlobalScope',
            'scope': 'self'
          }
        ],
        [
          'WindowOrWorkerGlobalScope.active',
          {
            'property': 'active',
            'scope': 'self'
          }
        ],
        [
          'WindowOrWorkerGlobalScope.isLoaded',
          {
            'property': 'isLoaded',
            'scope': 'self'
          }
        ]
      ]);
    });

    it('interface with constructor operation', () => {
      const ast = WebIDL2.parse(`interface Number {
        constructor(optional any value);
      };`);
      assert.deepEqual(buildIDLTests(ast), [
        [
          'Number',
          {
            'property': 'Number',
            'scope': 'self'
          }
        ],
        [
          'Number.Number',
          [
            {
              'property': 'Number',
              'scope': 'self'
            },
            {
              'property': 'constructor',
              'scope': 'Number'
            }
          ]
        ]
      ]);
    });

    it('interface with constructor in ExtAttr', () => {
      const ast = WebIDL2.parse(`[Constructor(optional any value)]
        interface Number {};`);
      assert.deepEqual(buildIDLTests(ast), [
        [
          'Number',
          {
            'property': 'Number',
            'scope': 'self'
          }
        ],
        [
          'Number.Number',
          [
            {
              'property': 'Number',
              'scope': 'self'
            },
            {
              'property': 'constructor',
              'scope': 'Number'
            }
          ]
        ]
      ]);
    });

    it('iterable interface', () => {
      const ast = WebIDL2.parse(`interface DoubleList {
        iterable<double>;
      };`);
      assert.deepEqual(buildIDLTests(ast), [
        [
          'DoubleList',
          {
            'property': 'DoubleList',
            'scope': 'self'
          }
        ],
        [
          'DoubleList.entries',
          [
            {
              'property': 'DoubleList',
              'scope': 'self'
            },
            {
              'property': 'entries',
              'scope': 'DoubleList.prototype'
            }
          ]
        ],
        [
          'DoubleList.forEach',
          [
            {
              'property': 'DoubleList',
              'scope': 'self'
            },
            {
              'property': 'forEach',
              'scope': 'DoubleList.prototype'
            }
          ]
        ],
        [
          'DoubleList.keys',
          [
            {
              'property': 'DoubleList',
              'scope': 'self'
            },
            {
              'property': 'keys',
              'scope': 'DoubleList.prototype'
            }
          ]
        ],
        [
          'DoubleList.values',
          [
            {
              'property': 'DoubleList',
              'scope': 'self'
            },
            {
              'property': 'values',
              'scope': 'DoubleList.prototype'
            }
          ]
        ]
      ]);
    });

    it('maplike interface', () => {
      const ast = WebIDL2.parse(`interface DoubleMap {
        maplike<DOMString, double>;
      };`);
      assert.deepEqual(buildIDLTests(ast), [
        [
          'DoubleMap',
          {
            'property': 'DoubleMap',
            'scope': 'self'
          }
        ],
        [
          'DoubleMap.clear',
          [
            {
              'property': 'DoubleMap',
              'scope': 'self'
            },
            {
              'property': 'clear',
              'scope': 'DoubleMap.prototype'
            }
          ]
        ],
        [
          'DoubleMap.delete',
          [
            {
              'property': 'DoubleMap',
              'scope': 'self'
            },
            {
              'property': 'delete',
              'scope': 'DoubleMap.prototype'
            }
          ]
        ],
        [
          'DoubleMap.entries',
          [
            {
              'property': 'DoubleMap',
              'scope': 'self'
            },
            {
              'property': 'entries',
              'scope': 'DoubleMap.prototype'
            }
          ]
        ],
        [
          'DoubleMap.get',
          [
            {
              'property': 'DoubleMap',
              'scope': 'self'
            },
            {
              'property': 'get',
              'scope': 'DoubleMap.prototype'
            }
          ]
        ],
        [
          'DoubleMap.has',
          [
            {
              'property': 'DoubleMap',
              'scope': 'self'
            },
            {
              'property': 'has',
              'scope': 'DoubleMap.prototype'
            }
          ]
        ],
        [
          'DoubleMap.keys',
          [
            {
              'property': 'DoubleMap',
              'scope': 'self'
            },
            {
              'property': 'keys',
              'scope': 'DoubleMap.prototype'
            }
          ]
        ],
        [
          'DoubleMap.set',
          [
            {
              'property': 'DoubleMap',
              'scope': 'self'
            },
            {
              'property': 'set',
              'scope': 'DoubleMap.prototype'
            }
          ]
        ],
        [
          'DoubleMap.size',
          [
            {
              'property': 'DoubleMap',
              'scope': 'self'
            },
            {
              'property': 'size',
              'scope': 'DoubleMap.prototype'
            }
          ]
        ],
        [
          'DoubleMap.values',
          [
            {
              'property': 'DoubleMap',
              'scope': 'self'
            },
            {
              'property': 'values',
              'scope': 'DoubleMap.prototype'
            }
          ]
        ]
      ]);
    });

    it('setlike interface', () => {
      const ast = WebIDL2.parse(`interface DoubleSet {
        setlike<double>;
      };`);
      assert.deepEqual(buildIDLTests(ast), [
        [
          'DoubleSet',
          {
            'property': 'DoubleSet',
            'scope': 'self'
          }
        ],
        [
          'DoubleSet.add',
          [
            {
              'property': 'DoubleSet',
              'scope': 'self'
            },
            {
              'property': 'add',
              'scope': 'DoubleSet.prototype'
            }
          ]
        ],
        [
          'DoubleSet.clear',
          [
            {
              'property': 'DoubleSet',
              'scope': 'self'
            },
            {
              'property': 'clear',
              'scope': 'DoubleSet.prototype'
            }
          ]
        ],
        [
          'DoubleSet.delete',
          [
            {
              'property': 'DoubleSet',
              'scope': 'self'
            },
            {
              'property': 'delete',
              'scope': 'DoubleSet.prototype'
            }
          ]
        ],
        [
          'DoubleSet.entries',
          [
            {
              'property': 'DoubleSet',
              'scope': 'self'
            },
            {
              'property': 'entries',
              'scope': 'DoubleSet.prototype'
            }
          ]
        ],
        [
          'DoubleSet.has',
          [
            {
              'property': 'DoubleSet',
              'scope': 'self'
            },
            {
              'property': 'has',
              'scope': 'DoubleSet.prototype'
            }
          ]
        ],
        [
          'DoubleSet.keys',
          [
            {
              'property': 'DoubleSet',
              'scope': 'self'
            },
            {
              'property': 'keys',
              'scope': 'DoubleSet.prototype'
            }
          ]
        ],
        [
          'DoubleSet.size',
          [
            {
              'property': 'DoubleSet',
              'scope': 'self'
            },
            {
              'property': 'size',
              'scope': 'DoubleSet.prototype'
            }
          ]
        ],
        [
          'DoubleSet.values',
          [
            {
              'property': 'DoubleSet',
              'scope': 'self'
            },
            {
              'property': 'values',
              'scope': 'DoubleSet.prototype'
            }
          ]
        ]
      ]);
    });

    it('interface with getter/setter', () => {
      const ast = WebIDL2.parse(`interface GetMe {
        getter GetMe (unsigned long index);
        setter void (GetMe data, optional unsigned long index);
      };`);
      assert.deepEqual(buildIDLTests(ast), [
        [
          'GetMe',
          {
            'property': 'GetMe',
            'scope': 'self'
          }
        ]
      ]);
    });

    it('limit scopes', () => {
      const ast = WebIDL2.parse(`
        [Exposed=Window] interface Worker {};
        [Exposed=Worker] interface WorkerSync {};
        [Exposed=(Window,Worker)] interface MessageChannel {};
        namespace CSS {};
      `);
      assert.deepEqual(buildIDLTests(ast), [
        ['CSS', {property: 'CSS', scope: 'self'}],
        ['MessageChannel', {property: 'MessageChannel', scope: 'self'}],
        ['Worker', {property: 'Worker', scope: 'self'}]
      ]);
      assert.deepEqual(buildIDLTests(ast, 'Worker'), [
        ['MessageChannel', {property: 'MessageChannel', scope: 'self'}],
        ['WorkerSync', {property: 'WorkerSync', scope: 'self'}]
      ]);
      assert.deepEqual(buildIDLTests(ast, 'ServiceWorker'), []);
    });

    it('operator variations', () => {
      const ast = WebIDL2.parse(`
        interface AudioNode : EventTarget {
          void disconnect ();
          void disconnect (unsigned long output);
          void disconnect (AudioNode destinationNode);
        };
      `);
      assert.deepEqual(buildIDLTests(ast), [
        ['AudioNode', {property: 'AudioNode', scope: 'self'}],
        ['AudioNode.disconnect', [
          {property: 'AudioNode', scope: 'self'},
          {property: 'disconnect', scope: 'AudioNode.prototype'}
        ]]
      ]);
    });

    it('namespace with attribute', () => {
      const ast = WebIDL2.parse(
          `namespace CSS {
             readonly attribute any paintWorklet;
           };`);
      assert.deepEqual(buildIDLTests(ast), [
        ['CSS', {property: 'CSS', scope: 'self'}],
        ['CSS.paintWorklet', [
          {property: 'CSS', scope: 'self'},
          {property: 'paintWorklet', scope: 'CSS'}
        ]]
      ]);
    });

    it('namespace with method', () => {
      const ast = WebIDL2.parse(
          `namespace CSS {
             boolean supports(CSSOMString property, CSSOMString value);
           };`);
      assert.deepEqual(buildIDLTests(ast), [
        ['CSS', {property: 'CSS', scope: 'self'}],
        ['CSS.supports', [
          {property: 'CSS', scope: 'self'},
          {property: 'supports', scope: 'CSS'}
        ]]
      ]);
    });

    it('namespace with custom test', () => {
      const ast = WebIDL2.parse(
          `namespace CSS {
             readonly attribute any paintWorklet;
           };`);
      loadCustomTests({
        'api': {
          'CSS': {
            '__base': 'var css = CSS;',
            '__test': 'return !!css;',
            'paintWorklet': 'return css && \'paintWorklet\' in css;'
          }
        },
        'css': {}
      });
      assert.deepEqual(buildIDLTests(ast), [
        // eslint-disable-next-line max-len
        ['CSS', '(function() {var css = CSS;return !!css;})()'],
        // eslint-disable-next-line max-len
        ['CSS.paintWorklet', '(function() {var css = CSS;return css && \'paintWorklet\' in css;})()']
      ]);
    });

    it('dictionary', () => {
      const ast = WebIDL2.parse(
          `dictionary ElementRegistrationOptions {
              object? prototype = null;
              DOMString? extends = null;
           };`);
      assert.deepEqual(buildIDLTests(ast), [
        ['ElementRegistrationOptions',
          {property: 'ElementRegistrationOptions', scope: 'self'}
        ],
        ['ElementRegistrationOptions.extends', [
          {property: 'ElementRegistrationOptions', scope: 'self'},
          {property: 'extends', scope: 'ElementRegistrationOptions'}
        ]],
        ['ElementRegistrationOptions.prototype', [
          {property: 'ElementRegistrationOptions', scope: 'self'},
          {property: 'prototype', scope: 'ElementRegistrationOptions'}
        ]]
      ]);
    });

    it('dictionary with custom test', () => {
      const ast = WebIDL2.parse(
          `dictionary ElementRegistrationOptions {
              object? prototype = null;
              DOMString? extends = null;
           };`);
      loadCustomTests({
        'api': {
          'ElementRegistrationOptions': {
            '__base': 'var ers = ElementRegistrationOptions;',
            '__test': 'return !!ers;',
            'extends': 'return ers && \'extends\' in ers;',
            'prototype': 'return ers && \'prototype\' in ers;'
          }
        },
        'css': {}
      });
      assert.deepEqual(buildIDLTests(ast), [
        // eslint-disable-next-line max-len
        ['ElementRegistrationOptions', '(function() {var ers = ElementRegistrationOptions;return !!ers;})()'],
        // eslint-disable-next-line max-len
        ['ElementRegistrationOptions.extends', '(function() {var ers = ElementRegistrationOptions;return ers && \'extends\' in ers;})()'],
        // eslint-disable-next-line max-len
        ['ElementRegistrationOptions.prototype', '(function() {var ers = ElementRegistrationOptions;return ers && \'prototype\' in ers;})()']
      ]);
    });
  });

  describe('validateIDL', () => {
    it('valid idl', () => {
      const ast = WebIDL2.parse(`interface Node {
        boolean contains(Node otherNode);
      };`);
      expect(() => {
        validateIDL(ast);
      }).to.not.throw();
    });

    it('no members', () => {
      const ast = WebIDL2.parse(`interface Node {};`);
      expect(() => {
        validateIDL(ast);
      }).to.not.throw();
    });

    it('overloaded operator', () => {
      const ast = WebIDL2.parse(`interface Node {
        boolean contains(Node otherNode);
        boolean contains(Node otherNode, boolean deepEqual);
      };`);
      expect(() => {
        validateIDL(ast);
      }).to.not.throw();
    });

    it('nameless member', () => {
      const ast = WebIDL2.parse(`interface Node {
        iterable<Node>;
      };`);
      expect(() => {
        validateIDL(ast);
      }).to.not.throw();
    });

    /* Remove when issues are resolved spec-side */
    it('allowed duplicates', () => {
      const ast = WebIDL2.parse(`interface SVGAElement {
        attribute DOMString href;
        attribute DOMString href;
      };

      interface WebGLRenderingContext {
        attribute Canvas canvas;
        attribute Canvas canvas;
      };

      interface WebGL2RenderingContext {
        attribute Canvas canvas;
        attribute Canvas canvas;
      };`);
      expect(() => {
        validateIDL(ast);
      }).to.not.throw();
    });

    it('disallowed duplicates', () => {
      const ast = WebIDL2.parse(`interface Node {
        attribute DOMString type;
        attribute DOMString type;
      };`);
      expect(() => {
        validateIDL(ast);
      }).to.throw();
    });
  });
});
