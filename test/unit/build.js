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
  collectCSSPropertiesFromBCD,
  collectCSSPropertiesFromReffy,
  cssPropertyToIDLAttribute,
  flattenIDL,
  getExposureSet,
  isWithinScope,
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

  describe('getExposureSet', () => {
    it('basic tests', () => {
      const specIDLs = {
        window: WebIDL2.parse(`[Exposed=Window] interface DummyOne {};`),
        webworker: WebIDL2.parse(`[Exposed=Worker] interface DummyTwo {};`),
        serviceworker: WebIDL2.parse(
            `[Exposed=ServiceWorker] interface DummyThree {};`
        ),
        bothworkers: WebIDL2.parse(
            `[Exposed=(Worker,ServiceWorker)] interface DummyFour {};`
        ),
        windowandworker: WebIDL2.parse(
            `[Exposed=(Window,Worker)] interface DummyFive {};`
        )
      };
      const historicalIDL = WebIDL2.parse(`interface DOMError {};`);
      const ast = flattenIDL(specIDLs, historicalIDL);
      const interfaces = ast.filter((dfn) => dfn.type === 'interface');

      const interfaceScopes = {
        DummyOne: 'Window',
        DummyTwo: 'Worker',
        DummyThree: 'ServiceWorker',
        DummyFour: 'Worker',
        DummyFive: 'Window',
        DOMError: 'Window'
      };

      for (const iface of interfaces) {
        const exposureSet = getExposureSet(iface);
        assert.equal(
            isWithinScope('Window', exposureSet),
            interfaceScopes[iface.name] === 'Window'
        );
        assert.equal(
            isWithinScope('Worker', exposureSet),
            interfaceScopes[iface.name] === 'Worker'
        );
        assert.equal(
            isWithinScope('ServiceWorker', exposureSet),
            interfaceScopes[iface.name] === 'ServiceWorker'
        );
      }
    });

    it('bad exposure set', () => {
      const specIDLs = {
        badexposure: WebIDL2.parse(`[Exposed=0] interface DummyOne {};`)
      };
      const historicalIDL = WebIDL2.parse(`interface DOMError {};`);
      const ast = flattenIDL(specIDLs, historicalIDL);
      const interfaces = ast.filter((dfn) => dfn.type === 'interface');

      expect(() => {
        getExposureSet(interfaces[0]);
      })
          .to.throw('Unexpected RHS for Exposed extended attribute');
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

    it('interface with constructor', () => {
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
        ['MessageChannel', {property: 'MessageChannel', scope: 'self'}],
        ['Worker', {property: 'Worker', scope: 'self'}],
        ['CSS', {property: 'CSS', scope: 'self'}]
      ]);
      assert.deepEqual(buildIDLTests(ast, 'Worker'), [
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
  });

  describe('validateIDL', () => {
    it('valid idl', () => {
      const ast = WebIDL2.parse(`interface Node {
        boolean contains(Node otherNode);
      };`);
      assert.equal(validateIDL(ast), true);
    });

    it('no members', () => {
      const ast = WebIDL2.parse(`interface Node {};`);
      assert.equal(validateIDL(ast), true);
    });

    it('overloaded operator', () => {
      const ast = WebIDL2.parse(`interface Node {
        boolean contains(Node otherNode);
        boolean contains(Node otherNode, boolean deepEqual);
      };`);
      assert.equal(validateIDL(ast), true);
    });

    it('nameless member', () => {
      const ast = WebIDL2.parse(`interface Node {
        iterable<Node>;
      };`);
      assert.equal(validateIDL(ast), true);
    });

    /* Remove when issues are resolved spec-side */
    it('allow duplicates', () => {
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
      assert.equal(validateIDL(ast), true);
    });
  });
});
