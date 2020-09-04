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
const proxyquire = require('proxyquire');

const fs = require('fs');

const {
  writeFile,
  flattenIDL,
  getExposureSet,
  validateIDL,
  buildIDLTests,
  collectCSSPropertiesFromBCD,
  collectCSSPropertiesFromReffy,
  cssPropertyToIDLAttribute,
  buildCSS
} = proxyquire('../../build', {
  './custom-tests.json': {'api': {}, 'css': {}}
});

describe('build', () => {
  describe('writeFile', () => {
    const filepath = '.testtmp';

    it('simple supported', async () => {
      await writeFile(filepath, 'foo\nbar');
      assert.fileContent(filepath, 'foo\nbar\n');
    });

    it('array', async () => {
      await writeFile(filepath, ['foo', 'bar', 'baz']);
      assert.fileContent(filepath, 'foo\nbar\nbaz\n');
    });

    afterEach(() => {
      fs.unlinkSync(filepath);
    });
  });

  describe('getCustomTestAPI', () => {
    describe('no custom tests', () => {
      const {getCustomTestAPI} = proxyquire('../../build', {
        './custom-tests.json': {api: {}, css: {}}
      });

      it('interface', () => {
        assert.equal(getCustomTestAPI('foo'), false);
      });

      it('member', () => {
        assert.equal(getCustomTestAPI('foo', 'bar'), false);
      });
    });

    describe('custom test for interface only', () => {
      const {getCustomTestAPI} = proxyquire('../../build', {
        './custom-tests.json': {
          api: {
            'foo': {
              '__base': 'var a = 1;',
              '__test': 'return a;'
            }
          }
        }
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
            '(function() {var a = 1;return instance && \'bar\' in instance;})()'
        );
      });
    });

    describe('custom test for interface only, no base', () => {
      const {getCustomTestAPI} = proxyquire('../../build', {
        './custom-tests.json': {
          api: {
            'foo': {
              '__test': 'return 1;'
            }
          }
        }
      });

      it('interface', () => {
        assert.equal(getCustomTestAPI('foo'), '(function() {return 1;})()');
      });

      it('member', () => {
        assert.equal(getCustomTestAPI('foo', 'bar'), false);
      });
    });

    describe('custom test for member only', () => {
      const {getCustomTestAPI} = proxyquire('../../build', {
        './custom-tests.json': {
          api: {
            'foo': {
              '__base': 'var a = 1;',
              'bar': 'return a + 1;'
            }
          }
        }
      });

      it('interface', () => {
        assert.equal(
            getCustomTestAPI('foo'),
            '(function() {var a = 1;return !!instance;})()'
        );
      });

      it('member', () => {
        assert.equal(
            getCustomTestAPI('foo', 'bar'),
            '(function() {var a = 1;return a + 1;})()'
        );
      });
    });

    describe('custom test for member only, no __base', () => {
      const {getCustomTestAPI} = proxyquire('../../build', {
        './custom-tests.json': {
          api: {
            'foo': {
              'bar': 'return 1 + 1;'
            }
          }
        }
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
      const {getCustomTestAPI} = proxyquire('../../build', {
        './custom-tests.json': {
          api: {
            'foo': {
              '__base': 'var a = 1;',
              '__test': 'return a;',
              'bar': 'return a + 1;'
            }
          }
        }
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
      const {getCustomTestCSS} = proxyquire('../../build', {
        './custom-tests.json': {api: {}, css: {}}
      });

      assert.equal(getCustomTestCSS('foo'), false);
    });

    it('custom test for property', () => {
      const {getCustomTestCSS} = proxyquire('../../build', {
        './custom-tests.json': {
          css: {
            properties: {
              foo: 'return 1;'
            }
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
    const webref = {
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
    collectCSSPropertiesFromReffy(webref, propertySet);
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
      assert.deepEqual(buildIDLTests(ast), {
        'api.Attr': {
          'test': {property: 'Attr', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.Attr.name': {
          'test': [
            {property: 'Attr', scope: 'self'},
            {property: 'name', scope: 'Attr.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        }
      });
    });

    it('interface with method', () => {
      const ast = WebIDL2.parse(
          `interface Node {
             boolean contains(Node? other);
           };`);
      assert.deepEqual(buildIDLTests(ast), {
        'api.Node': {
          'test': {property: 'Node', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.Node.contains': {
          'test': [
            {property: 'Node', scope: 'self'},
            {property: 'contains', scope: 'Node.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        }
      });
    });

    it('interface with static method', () => {
      const ast = WebIDL2.parse(
          `interface MediaSource {
             static boolean isTypeSupported(DOMString type);
           };`);

      assert.deepEqual(buildIDLTests(ast), {
        'api.MediaSource': {
          'test': {property: 'MediaSource', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.MediaSource.isTypeSupported': {
          'test': [
            {property: 'MediaSource', scope: 'self'},
            {property: 'isTypeSupported', scope: 'MediaSource'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        }
      });
    });

    it('interface with const', () => {
      const ast = WebIDL2.parse(
          `interface Window {
             const boolean isWindow = true;
           };`);

      assert.deepEqual(buildIDLTests(ast), {
        'api.Window': {
          'test': {property: 'Window', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.Window.isWindow': {
          'test': [
            {property: 'Window', scope: 'self'},
            {property: 'isWindow', scope: 'Window'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        }
      });
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
            void drawElementsInstancedANGLE(
              GLenum mode,
              GLsizei count,
              GLenum type,
              GLintptr offset,
              GLsizei primcoun
            );
          };`);
      const {buildIDLTests} = proxyquire('../../build', {
        './custom-tests.json': {
          'api': {
            'ANGLE_instanced_arrays': {
              '__base': 'var canvas = document.createElement(\'canvas\'); var gl = canvas.getContext(\'webgl\'); var instance = gl.getExtension(\'ANGLE_instanced_arrays\');',
              '__test': 'return !!instance;',
              'drawArraysInstancedANGLE': 'return true && instance && \'drawArraysInstancedANGLE\' in instance;'
            }
          }
        }
      });
      
      assert.deepEqual(buildIDLTests(ast), {
        'api.ANGLE_instanced_arrays': {
          'test': '(function() {var canvas = document.createElement(\'canvas\'); var gl = canvas.getContext(\'webgl\'); var instance = gl.getExtension(\'ANGLE_instanced_arrays\');return !!instance;})()',
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.ANGLE_instanced_arrays.drawArraysInstancedANGLE': {
          'test': '(function() {var canvas = document.createElement(\'canvas\'); var gl = canvas.getContext(\'webgl\'); var instance = gl.getExtension(\'ANGLE_instanced_arrays\');return true && instance && \'drawArraysInstancedANGLE\' in instance;})()',
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.ANGLE_instanced_arrays.drawElementsInstancedANGLE': {
          'test': '(function() {var canvas = document.createElement(\'canvas\'); var gl = canvas.getContext(\'webgl\'); var instance = gl.getExtension(\'ANGLE_instanced_arrays\');return instance && \'drawElementsInstancedANGLE\' in instance;})()',
          'combinator': 'and',
          'scope': ['Window']
        }
      });
    });

    it('interface with legacy namespace', () => {
      const ast = WebIDL2.parse(`[LegacyNamespace] interface Legacy {};`);
      assert.deepEqual(buildIDLTests(ast), {});
    });

    it('global interface', () => {
      const ast = WebIDL2.parse(`[Global=(Window,Worker)]
      interface WindowOrWorkerGlobalScope {
        attribute boolean isLoaded;
        const boolean active = true;
      };`);

      assert.deepEqual(buildIDLTests(ast), {
        'api.WindowOrWorkerGlobalScope': {
          'test': {property: 'WindowOrWorkerGlobalScope', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.WindowOrWorkerGlobalScope.active': {
          'test': {property: 'active', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.WindowOrWorkerGlobalScope.isLoaded': {
          'test': {property: 'isLoaded', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window']
        }
      });
    });

    it('interface with constructor operation', () => {
      const ast = WebIDL2.parse(`interface Number {
        constructor(optional any value);
      };`);

      assert.deepEqual(buildIDLTests(ast), {
        'api.Number': {
          'test': {property: 'Number', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.Number.Number': {
          'test': [
            {property: 'Number', scope: 'self'},
            {property: 'constructor', scope: 'Number'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        }
      });
    });

    it('interface with constructor in ExtAttr', () => {
      const ast = WebIDL2.parse(`[Constructor(optional any value)]
        interface Number {};`);
      assert.deepEqual(buildIDLTests(ast), {
        'api.Number': {
          'test': {property: 'Number', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.Number.Number': {
          'test': [
            {property: 'Number', scope: 'self'},
            {property: 'constructor', scope: 'Number'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        }
      });
    });

    it('iterable interface', () => {
      const ast = WebIDL2.parse(`interface DoubleList {
        iterable<double>;
      };`);
      assert.deepEqual(buildIDLTests(ast), {
        'api.DoubleList': {
          'test': {property: 'DoubleList', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleList.@@iterator': {
          'test': [
            {'property': 'DoubleList', 'scope': 'self'},
            {'property': 'Symbol', 'scope': 'self'},
            {'property': 'iterator', 'scope': 'Symbol'},
            {'property': 'Symbol.iterator', 'scope': 'DoubleList.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleList.entries': {
          'test': [
            {'property': 'DoubleList', 'scope': 'self'},
            {'property': 'entries', 'scope': 'DoubleList.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleList.forEach': {
          'test': [
            {'property': 'DoubleList', 'scope': 'self'},
            {'property': 'forEach', 'scope': 'DoubleList.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleList.keys': {
          'test': [
            {'property': 'DoubleList', 'scope': 'self'},
            {'property': 'keys', 'scope': 'DoubleList.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleList.values': {
          'test': [
            {'property': 'DoubleList', 'scope': 'self'},
            {'property': 'values', 'scope': 'DoubleList.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        }
      });
    });

    it('maplike interface', () => {
      const ast = WebIDL2.parse(`interface DoubleMap {
        maplike<DOMString, double>;
      };`);
      assert.deepEqual(buildIDLTests(ast), {
        'api.DoubleMap': {
          'test': {property: 'DoubleMap', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleMap.clear': {
          'test': [
            {'property': 'DoubleMap', 'scope': 'self'},
            {'property': 'clear', 'scope': 'DoubleMap.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleMap.delete': {
          'test': [
            {'property': 'DoubleMap', 'scope': 'self'},
            {'property': 'delete', 'scope': 'DoubleMap.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleMap.entries': {
          'test': [
            {'property': 'DoubleMap', 'scope': 'self'},
            {'property': 'entries', 'scope': 'DoubleMap.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleMap.forEach': {
          'test': [
            {'property': 'DoubleMap', 'scope': 'self'},
            {'property': 'forEach', 'scope': 'DoubleMap.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleMap.get': {
          'test': [
            {'property': 'DoubleMap', 'scope': 'self'},
            {'property': 'get', 'scope': 'DoubleMap.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleMap.has': {
          'test': [
            {'property': 'DoubleMap', 'scope': 'self'},
            {'property': 'has', 'scope': 'DoubleMap.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleMap.keys': {
          'test': [
            {'property': 'DoubleMap', 'scope': 'self'},
            {'property': 'keys', 'scope': 'DoubleMap.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleMap.set': {
          'test': [
            {'property': 'DoubleMap', 'scope': 'self'},
            {'property': 'set', 'scope': 'DoubleMap.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleMap.size': {
          'test': [
            {'property': 'DoubleMap', 'scope': 'self'},
            {'property': 'size', 'scope': 'DoubleMap.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleMap.values': {
          'test': [
            {'property': 'DoubleMap', 'scope': 'self'},
            {'property': 'values', 'scope': 'DoubleMap.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        }
      });
    });

    it('setlike interface', () => {
      const ast = WebIDL2.parse(`interface DoubleSet {
        setlike<double>;
      };`);
      assert.deepEqual(buildIDLTests(ast), {
        'api.DoubleSet': {
          'test': {property: 'DoubleSet', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleSet.add': {
          'test': [
            {'property': 'DoubleSet', 'scope': 'self'},
            {'property': 'add', 'scope': 'DoubleSet.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleSet.clear': {
          'test': [
            {'property': 'DoubleSet', 'scope': 'self'},
            {'property': 'clear', 'scope': 'DoubleSet.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleSet.delete': {
          'test': [
            {'property': 'DoubleSet', 'scope': 'self'},
            {'property': 'delete', 'scope': 'DoubleSet.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleSet.entries': {
          'test': [
            {'property': 'DoubleSet', 'scope': 'self'},
            {'property': 'entries', 'scope': 'DoubleSet.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleSet.has': {
          'test': [
            {'property': 'DoubleSet', 'scope': 'self'},
            {'property': 'has', 'scope': 'DoubleSet.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleSet.keys': {
          'test': [
            {'property': 'DoubleSet', 'scope': 'self'},
            {'property': 'keys', 'scope': 'DoubleSet.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleSet.size': {
          'test': [
            {'property': 'DoubleSet', 'scope': 'self'},
            {'property': 'size', 'scope': 'DoubleSet.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.DoubleSet.values': {
          'test': [
            {'property': 'DoubleSet', 'scope': 'self'},
            {'property': 'values', 'scope': 'DoubleSet.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        }
      });
    });

    it('interface with getter/setter', () => {
      const ast = WebIDL2.parse(`interface GetMe {
        getter GetMe (unsigned long index);
        setter void (GetMe data, optional unsigned long index);
      };`);
      assert.deepEqual(buildIDLTests(ast), {
        'api.GetMe': {
          'test': {property: 'GetMe', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window']
        }
      });
    });

    it('varied scopes', () => {
      const ast = WebIDL2.parse(`
        [Exposed=Window] interface Worker {};
        [Exposed=Worker] interface WorkerSync {};
        [Exposed=(Window,Worker)] interface MessageChannel {};
        namespace CSS {};
      `);
      assert.deepEqual(buildIDLTests(ast), {
        'api.CSS': {
          'test': {property: 'CSS', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.MessageChannel': {
          'test': {property: 'MessageChannel', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window', 'Worker']
        },
        'api.Worker': {
          'test': {property: 'Worker', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.WorkerSync': {
          'test': {property: 'WorkerSync', scope: 'self'},
          'combinator': 'and',
          'scope': ['Worker']
        }
      });
    });

    it('operator variations', () => {
      const ast = WebIDL2.parse(`
        interface AudioNode : EventTarget {
          void disconnect ();
          void disconnect (unsigned long output);
          void disconnect (AudioNode destinationNode);
        };
      `);
      assert.deepEqual(buildIDLTests(ast), {
        'api.AudioNode': {
          'test': {property: 'AudioNode', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.AudioNode.disconnect': {
          'test': [
            {property: 'AudioNode', scope: 'self'},
            {property: 'disconnect', scope: 'AudioNode.prototype'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        }
      });
    });

    it('namespace with attribute', () => {
      const ast = WebIDL2.parse(
          `namespace CSS {
             readonly attribute any paintWorklet;
           };`);
      assert.deepEqual(buildIDLTests(ast), {
        'api.CSS': {
          'test': {property: 'CSS', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.CSS.paintWorklet': {
          'test': [
            {property: 'CSS', scope: 'self'},
            {property: 'paintWorklet', scope: 'CSS'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        }
      });
    });

    it('namespace with method', () => {
      const ast = WebIDL2.parse(
          `namespace CSS {
             boolean supports(CSSOMString property, CSSOMString value);
           };`);
      assert.deepEqual(buildIDLTests(ast), {
        'api.CSS': {
          'test': {property: 'CSS', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.CSS.supports': {
          'test': [
            {property: 'CSS', scope: 'self'},
            {property: 'supports', scope: 'CSS'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        }
      });
    });

    it('namespace with custom test', () => {
      const ast = WebIDL2.parse(
          `namespace CSS {
             readonly attribute any paintWorklet;
           };`);

      const {buildIDLTests} = proxyquire('../../build', {
        './custom-tests.json': {
          'api': {
            'CSS': {
              '__base': 'var css = CSS;',
              '__test': 'return !!css;',
              'paintWorklet': 'return css && \'paintWorklet\' in css;'
            }
          }
        }
      });

      assert.deepEqual(buildIDLTests(ast), {
        'api.CSS': {
          'test': '(function() {var css = CSS;return !!css;})()',
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.CSS.paintWorklet': {
          'test': '(function() {var css = CSS;return css && \'paintWorklet\' in css;})()',
          'combinator': 'and',
          'scope': ['Window']
        }
      });
    });

    it('dictionary', () => {
      const ast = WebIDL2.parse(
          `dictionary ElementRegistrationOptions {
              object? prototype = null;
              DOMString? extends = null;
           };`);
      assert.deepEqual(buildIDLTests(ast), {
        'api.ElementRegistrationOptions': {
          'test': {property: 'ElementRegistrationOptions', scope: 'self'},
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.ElementRegistrationOptions.extends': {
          'test': [
            {property: 'ElementRegistrationOptions', scope: 'self'},
            {property: 'extends', scope: 'ElementRegistrationOptions'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.ElementRegistrationOptions.prototype': {
          'test': [
            {property: 'ElementRegistrationOptions', scope: 'self'},
            {property: 'prototype', scope: 'ElementRegistrationOptions'}
          ],
          'combinator': 'and',
          'scope': ['Window']
        }
      });
    });

    it('dictionary with custom test', () => {
      const ast = WebIDL2.parse(
          `dictionary ElementRegistrationOptions {
              object? prototype = null;
              DOMString? extends = null;
           };`);
      const {buildIDLTests} = proxyquire('../../build', {
        './custom-tests.json': {
          'api': {
            'ElementRegistrationOptions': {
              '__base': 'var instance = ElementRegistrationOptions;'
            }
          }
        }
      });

      assert.deepEqual(buildIDLTests(ast), {
        'api.ElementRegistrationOptions': {
          'test': '(function() {var instance = ElementRegistrationOptions;return !!instance;})()',
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.ElementRegistrationOptions.extends': {
          'test': '(function() {var instance = ElementRegistrationOptions;return instance && \'extends\' in instance;})()',
          'combinator': 'and',
          'scope': ['Window']
        },
        'api.ElementRegistrationOptions.prototype': {
          'test': '(function() {var instance = ElementRegistrationOptions;return instance && \'prototype\' in instance;})()',
          'combinator': 'and',
          'scope': ['Window']
        }
      });
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
