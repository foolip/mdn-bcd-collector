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
chai.use(chaiSubset);
const assert = chai.assert;
const expect = chai.expect;

const WebIDL2 = require('webidl2');
const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');

const {
  flattenIDL,
  getExposureSet,
  getName,
  compileTestCode,
  compileTest,
  validateIDL,
  buildIDLTests,
  buildIDL,
  cssPropertyToIDLAttribute,
  buildCSS
} = proxyquire('../../build', {
  './custom-tests.json': {api: {__resources: {}}, css: {}}
});

describe('build', () => {
  describe('getCustomTestAPI', () => {
    beforeEach(() => {
      sinon.stub(console, 'error');
    });

    describe('no custom tests', () => {
      const {getCustomTestAPI} = proxyquire('../../build', {
        './custom-tests.json': {api: {__resources: {}}, css: {}}
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
            foo: {
              __base: 'var a = 1;',
              __test: 'return a;'
            }
          }
        }
      });

      it('interface', () => {
        assert.equal(
            getCustomTestAPI('foo'),
            '(function () {\n  var a = 1;\n  return a;\n})();');
      });

      it('member', () => {
        assert.equal(
            getCustomTestAPI('foo', 'bar'),
            '(function () {\n  var a = 1;\n  return \'bar\' in instance;\n})();');
      });

      it('constructor', () => {
        assert.equal(getCustomTestAPI('foo', 'foo', 'constructor'), false);
      });
    });

    describe('custom test for interface only, no base', () => {
      const {getCustomTestAPI} = proxyquire('../../build', {
        './custom-tests.json': {
          api: {
            foo: {
              __test: 'return 1;'
            }
          }
        }
      });

      it('interface', () => {
        assert.equal(getCustomTestAPI('foo'), '(function () {\n  return 1;\n})();');
      });

      it('member', () => {
        assert.equal(getCustomTestAPI('foo', 'bar'), false);
      });
    });

    describe('custom test for member only', () => {
      const {getCustomTestAPI} = proxyquire('../../build', {
        './custom-tests.json': {
          api: {
            foo: {
              __base: 'var a = 1;',
              bar: 'return a + 1;'
            }
          }
        }
      });

      it('interface', () => {
        assert.equal(
            getCustomTestAPI('foo'),
            '(function () {\n  var a = 1;\n  return !!instance;\n})();');
      });

      it('member', () => {
        assert.equal(
            getCustomTestAPI('foo', 'bar'),
            '(function () {\n  var a = 1;\n  return a + 1;\n})();');
      });
    });

    describe('custom test for member only, no __base', () => {
      const {getCustomTestAPI} = proxyquire('../../build', {
        './custom-tests.json': {
          api: {
            foo: {
              bar: 'return 1 + 1;'
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
            '(function () {\n  return 1 + 1;\n})();');
      });
    });

    describe('custom test for member with subtests', () => {
      const {getCustomTestAPI} = proxyquire('../../build', {
        './custom-tests.json': {
          api: {
            foo: {
              bar: 'return 1 + 1;',
              __additional: {
                multiple: 'return 1 + 1 + 1;',
                one: 'return 1;'
              }
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
            '(function () {\n  return 1 + 1;\n})();');
      });
    });

    describe('custom test for interface and member', () => {
      const {getCustomTestAPI} = proxyquire('../../build', {
        './custom-tests.json': {
          api: {
            foo: {
              __base: 'var a = 1;',
              __test: 'return a;',
              bar: 'return a + 1;'
            }
          }
        }
      });

      it('interface', () => {
        assert.equal(
            getCustomTestAPI('foo'),
            '(function () {\n  var a = 1;\n  return a;\n})();');
      });

      it('member', () => {
        assert.equal(
            getCustomTestAPI('foo', 'bar'),
            '(function () {\n  var a = 1;\n  return a + 1;\n})();');
      });
    });

    it('custom test with invalid syntax', () => {
      const {getCustomTestAPI} = proxyquire('../../build', {
        './custom-tests.json': {
          api: {
            foo: {
              __base: 'var a = await func);'
            }
          }
        }
      });

      assert.include(getCustomTestAPI('foo'), 'throw \'Test is malformed:');
      assert.isTrue(console.error.calledOnce);
    });

    describe('promise-based custom tests', () => {
      const {getCustomTestAPI} = proxyquire('../../build', {
        './custom-tests.json': {
          api: {
            foo: {
              __base: 'var promise = somePromise();'
            },
            foobar: {
              __base: '<%api.foo:foopromise%> var promise = foopromise.then(function() {});'
            }
          }
        }
      });

      it('interface', () => {
        assert.equal(
            getCustomTestAPI('foo'),
            '(function () {\n  var promise = somePromise();\n  return promise.then(function (instance) {\n    return !!instance;\n  });\n})();');
      });

      it('member', () => {
        assert.equal(
            getCustomTestAPI('foo', 'bar'),
            '(function () {\n  var promise = somePromise();\n  return promise.then(function (instance) {\n    return \'bar\' in instance;\n  });\n})();');
      });

      it('interface with import', () => {
        assert.equal(
            getCustomTestAPI('foobar'),
            '(function () {\n  var foopromise = somePromise();\n  if (!foopromise) {\n    return false;\n  }\n  var promise = foopromise.then(function () {});\n  return promise.then(function (instance) {\n    return !!instance;\n  });\n})();');
      });
    });

    describe('import other test', () => {
      const {getCustomTestAPI} = proxyquire('../../build', {
        './custom-tests.json': {
          api: {
            foo: {
              __base: 'var instance = 1;'
            },
            bar: {
              __base: '<%api.foo:a%> var instance = a;'
            },
            baz: {
              __base: '<%api.bar:b%> var instance = b;'
            },
            ban: {
              __base: '<%api.foo:instance%>'
            },
            bad: {
              __base: '<%api.foobar:apple%>'
            }
          }
        }
      });

      it('valid import', () => {
        assert.equal(
            getCustomTestAPI('bar'),
            '(function () {\n  var a = 1;\n  if (!a) {\n    return false;\n  }\n  var instance = a;\n  return !!instance;\n})();');

        assert.equal(
            getCustomTestAPI('baz'),
            '(function () {\n  var a = 1;\n  if (!a) {\n    return false;\n  }\n  var b = a;\n  if (!b) {\n    return false;\n  }\n  var instance = b;\n  return !!instance;\n})();');
      });

      it('valid import: import is instance', () => {
        assert.equal(
            getCustomTestAPI('ban'),
            '(function () {\n  var instance = 1;\n  return !!instance;\n})();');
      });

      it('invalid import', () => {
        assert.equal(
            getCustomTestAPI('bad'),
            '(function () {\n  throw \'Test is malformed: <%api.foobar:apple%> is an invalid reference\';\n  return !!instance;\n})();');
        assert.isTrue(console.error.calledOnce);
      });
    });

    afterEach(() => {
      console.error.restore();
    });
  });

  describe('getCustomSubtestsAPI', () => {
    it('get subtests', () => {
      const {getCustomSubtestsAPI} = proxyquire('../../build', {
        './custom-tests.json': {
          api: {
            foo: {
              __additional: {
                multiple: 'return 1 + 1 + 1;',
                'one.only': 'return 1;'
              }
            }
          }
        }
      });

      assert.deepEqual(
          getCustomSubtestsAPI('foo', 'bar'), {
            multiple: '(function () {\n  return 1 + 1 + 1;\n})();',
            'one.only': '(function () {\n  return 1;\n})();'
          });
    });
  });

  describe('getCustomResourcesAPI', () => {
    it('get resources', () => {
      const {getCustomResourcesAPI} = proxyquire('../../build', {
        './custom-tests.json': {
          api: {
            __resources: {
              'audio-blip': {
                type: 'audio',
                src: ['/media/blip.mp3', '/media/blip.ogg']
              }
            },
            foo: {
              __resources: ['audio-blip']
            }
          }
        }
      });

      assert.deepEqual(
          getCustomResourcesAPI('foo'), {
            'audio-blip': {
              type: 'audio',
              src: ['/media/blip.mp3', '/media/blip.ogg']
            }
          });
    });

    it('no resources', () => {
      const {getCustomResourcesAPI} = proxyquire('../../build', {
        './custom-tests.json': {
          api: {
            __resources: {},
            foo: {}
          }
        }
      });

      assert.deepEqual(getCustomResourcesAPI('foo'), {});
    });

    it('try to get invalid resource', () => {
      const {getCustomResourcesAPI} = proxyquire('../../build', {
        './custom-tests.json': {
          api: {
            __resources: {},
            foo: {
              __resources: ['audio-blip']
            }
          }
        }
      });

      assert.throws(() => {
        getCustomResourcesAPI('foo');
      }, Error,
      'Resource audio-blip is not defined but referenced in api.foo');
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

      assert.equal(getCustomTestCSS('foo'), '(function () {\n  return 1;\n})();');
    });

    it('import (not implemented)', () => {
      const {getCustomTestCSS} = proxyquire('../../build', {
        './custom-tests.json': {
          css: {
            properties: {
              foo: 'return 1;',
              bar: '<%css.properties.foo:a%>'
            }
          }
        }
      });

      assert.equal(getCustomTestCSS('bar'), '(function () {\n  throw \'Test is malformed: import <%css.properties.foo:a%>, category css is not importable\';\n})();');
    });
  });

  describe('compileTestCode', () => {
    it('string', () => {
      assert.equal(compileTestCode('a string'), 'a string');
    });

    it('constructor', () => {
      const test = {property: 'constructor.AudioContext', owner: 'AudioContext'};
      assert.equal(compileTestCode(test), 'bcd.testConstructor("AudioContext");');
    });

    it('CSS.supports', () => {
      const test = {property: 'font-weight', owner: 'CSS.supports'};
      assert.equal(compileTestCode(test), 'CSS.supports("font-weight", "inherit")');
    });

    it('Symbol', () => {
      const test = {property: 'Symbol.iterator', owner: 'DOMMatrixReadOnly'};
      assert.equal(compileTestCode(test), '"Symbol" in self && "iterator" in Symbol && Symbol.iterator in DOMMatrixReadOnly.prototype');
    });

    it('namespace', () => {
      const test = {property: 'log', owner: 'console'};
      assert.equal(compileTestCode(test), '"log" in console');
    });
  });

  describe('compileTest', () => {
    it('main', () => {
      const rawTest = {
        raw: {
          code: [
            {property: 'Document', owner: 'self'},
            {property: 'body', owner: `Document.prototype`}
          ],
          combinator: '&&'
        },
        resources: {},
        exposure: ['Window']
      };

      assert.deepEqual(compileTest(rawTest), {
        code: '"Document" in self && "body" in Document.prototype',
        exposure: ['Window']
      });
    });

    describe('custom tests', () => {
      it('one item', () => {
        const rawTest = {
          raw: {
            code: 'foo',
            combinator: '&&'
          },
          resources: {},
          exposure: ['Window']
        };

        assert.deepEqual(compileTest(rawTest), {
          code: 'foo',
          exposure: ['Window']
        });
      });

      it('two items', () => {
        const rawTest = {
          raw: {
            code: ['foo', 'foo'],
            combinator: '&&'
          },
          resources: {},
          exposure: ['Window']
        };

        assert.deepEqual(compileTest(rawTest), {
          code: 'foo && foo',
          exposure: ['Window']
        });
      });
    });

    it('no-repeated test code', () => {
      const rawTests = [
        {
          raw: {
            code: 'true',
            combinator: '&&'
          },
          resources: {},
          exposure: ['Window']
        },
        {
          raw: {
            code: [
              'true',
              'true'
            ],
            combinator: '||'
          },
          resources: {},
          exposure: ['Window']
        },
        {
          raw: {
            code: [
              'true',
              'true'
            ],
            combinator: '&&'
          },
          resources: {},
          exposure: ['Worker']
        }
      ];

      assert.deepEqual(compileTest(rawTests[0]), {
        code: 'true',
        exposure: ['Window']
      });
      assert.deepEqual(compileTest(rawTests[1]), {
        code: 'true || true',
        exposure: ['Window']
      });
      assert.deepEqual(compileTest(rawTests[2]), {
        code: 'true && true',
        exposure: ['Worker']
      });
    });

    it('CSS', () => {
      const rawTest = {
        raw: {
          code: [
            {property: 'fontFamily', owner: 'document.body.style'},
            {property: 'font-family', owner: 'CSS.supports'}
          ],
          combinator: '||'
        },
        resources: {},
        exposure: ['Window']
      };

      assert.deepEqual(compileTest(rawTest), {
        code: '"fontFamily" in document.body.style || CSS.supports("font-family", "inherit")',
        exposure: ['Window']
      });
    });
  });

  it('cssPropertyToIDLAttribute', () => {
    assert.equal(cssPropertyToIDLAttribute('line-height'), 'lineHeight');
    assert.equal(cssPropertyToIDLAttribute('-webkit-line-clamp', true),
        'webkitLineClamp');
  });

  it('buildIDL', () => {
    const specIDLs = {
      first: WebIDL2.parse(`interface DOMError {};`),
      second: WebIDL2.parse(`interface XSLTProcessor {};`)
    };

    const customIDLs = {
      second: WebIDL2.parse(`partial interface XSLTProcessor { undefined reset(); };`)
    };

    const tests = buildIDL(specIDLs, customIDLs);
    assert.containsAllKeys(tests, ['api.XSLTProcessor.reset']);
  });

  describe('flattenIDL', () => {
    const customIDLs = {
      first: WebIDL2.parse(`interface DOMError {};`),
      second: WebIDL2.parse(`interface XSLTProcessor {};`)
    };

    it('interface + mixin', () => {
      const specIDLs = {
        first: WebIDL2.parse(`interface DummyError : Error {
               readonly attribute boolean imadumdum;
             };`),
        second: WebIDL2.parse(
            `interface mixin DummyErrorHelper {
               DummyError geterror();
             };

             DummyError includes DummyErrorHelper;`)
      };
      const ast = flattenIDL(specIDLs, customIDLs);

      const interfaces = ast.filter((dfn) => dfn.type === 'interface');
      assert.lengthOf(interfaces, 3);

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
      assert.equal(interfaces[2].name, 'XSLTProcessor');
    });

    it('namespace + partial namespace', () => {
      const specIDLs = {
        cssom: WebIDL2.parse(`namespace CSS { boolean supports(); };`),
        paint: WebIDL2.parse(
            `partial namespace CSS {
               readonly attribute any paintWorklet;
             };`)
      };
      const ast = flattenIDL(specIDLs, customIDLs);

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
      assert.lengthOf(interfaces, 2);
      assert.equal(interfaces[0].name, 'DOMError');
      assert.equal(interfaces[1].name, 'XSLTProcessor');
    });

    it('mixin missing', () => {
      const specIDLs = {
        first: WebIDL2.parse(`interface mixin DummyErrorHelper {
               DummyError geterror();
             };`),
        secnd: WebIDL2.parse(`DummyError includes DummyErrorHelper;`)
      };

      expect(() => {
        flattenIDL(specIDLs, customIDLs);
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
        flattenIDL(specIDLs, customIDLs);
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
        flattenIDL(specIDLs, customIDLs);
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
        flattenIDL(specIDLs, customIDLs);
      }).to.throw('Original definition not found for partial namespace CSS');
    });
  });

  describe('getExposureSet', () => {
    // Combining spec and custom IDL is not important to these tests.
    const customIDLs = {};

    it('no defined exposure set', () => {
      const specIDLs = {
        first: WebIDL2.parse(`interface Dummy {
               readonly attribute boolean imadumdum;
             };`)
      };
      const ast = flattenIDL(specIDLs, customIDLs);
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
      const ast = flattenIDL(specIDLs, customIDLs);
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
      const ast = flattenIDL(specIDLs, customIDLs);
      const interfaces = ast.filter((dfn) => dfn.type === 'interface');
      const exposureSet = getExposureSet(interfaces[0]);
      assert.hasAllKeys(exposureSet, ['Window', 'Worker']);
    });
  });

  describe('getName', () => {
    it('main', () => {
      const node = {name: 'foobar'};
      assert.equal(getName(node), 'foobar');
    });

    it('no name', () => {
      const node = {};
      assert.equal(getName(node), undefined);
    });

    it('console', () => {
      const node = {name: 'console'};
      assert.equal(getName(node), 'Console');
    });
  });

  describe('buildIDLTests', () => {
    it('interface with attribute', () => {
      const ast = WebIDL2.parse(`interface Attr { attribute any name; };`);
      assert.deepEqual(buildIDLTests(ast), {
        'api.Attr': {
          code: '"Attr" in self',
          exposure: ['Window']
        },
        'api.Attr.name': {
          code: '"name" in Attr.prototype',
          exposure: ['Window']
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
          code: '"Node" in self',
          exposure: ['Window']
        },
        'api.Node.contains': {
          code: '"contains" in Node.prototype',
          exposure: ['Window']
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
          code: '"MediaSource" in self',
          exposure: ['Window']
        },
        'api.MediaSource.isTypeSupported': {
          code: '"isTypeSupported" in MediaSource',
          exposure: ['Window']
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
          code: '"Window" in self',
          exposure: ['Window']
        }
      });
    });

    it('interface with custom test', () => {
      const ast = WebIDL2.parse(
          `interface ANGLE_instanced_arrays {
            undefined drawArraysInstancedANGLE(
              GLenum mode,
              GLint first,
              GLsizei count,
              GLsizei primcount);

            undefined drawElementsInstancedANGLE(
              GLenum mode,
              GLsizei count,
              GLenum type,
              GLintptr offset,
              GLsizei primcount);
          };

          interface Document {
            readonly attribute boolean loaded;
            readonly attribute DOMString? charset;
          };`);
      const {buildIDLTests} = proxyquire('../../build', {
        './custom-tests.json': {
          api: {
            ANGLE_instanced_arrays: {
              __base: 'var canvas = document.createElement(\'canvas\'); var gl = canvas.getContext(\'webgl\'); var instance = gl.getExtension(\'ANGLE_instanced_arrays\');',
              __test: 'return !!instance;',
              drawArraysInstancedANGLE: 'return true && instance && \'drawArraysInstancedANGLE\' in instance;'
            },
            Document: {
              charset: 'return document.charset == "UTF-8";',
              __additional: {
                'loaded.loaded_is_boolean': 'return typeof document.loaded === "boolean";'
              }
            }
          }
        }
      });

      assert.deepEqual(buildIDLTests(ast), {
        'api.ANGLE_instanced_arrays': {
          code: '(function () {\n  var canvas = document.createElement(\'canvas\');\n  var gl = canvas.getContext(\'webgl\');\n  var instance = gl.getExtension(\'ANGLE_instanced_arrays\');\n  return !!instance;\n})();',
          exposure: ['Window']
        },
        'api.ANGLE_instanced_arrays.drawArraysInstancedANGLE': {
          code: '(function () {\n  var canvas = document.createElement(\'canvas\');\n  var gl = canvas.getContext(\'webgl\');\n  var instance = gl.getExtension(\'ANGLE_instanced_arrays\');\n  return true && instance && \'drawArraysInstancedANGLE\' in instance;\n})();',
          exposure: ['Window']
        },
        'api.ANGLE_instanced_arrays.drawElementsInstancedANGLE': {
          code: '(function () {\n  var canvas = document.createElement(\'canvas\');\n  var gl = canvas.getContext(\'webgl\');\n  var instance = gl.getExtension(\'ANGLE_instanced_arrays\');\n  return \'drawElementsInstancedANGLE\' in instance;\n})();',
          exposure: ['Window']
        },
        'api.Document': {
          code: '"Document" in self',
          exposure: ['Window']
        },
        'api.Document.charset': {
          code: '(function () {\n  return document.charset == \'UTF-8\';\n})();',
          exposure: ['Window']
        },
        'api.Document.loaded': {
          code: '"loaded" in Document.prototype',
          exposure: ['Window']
        },
        'api.Document.loaded.loaded_is_boolean': {
          code: '(function () {\n  return typeof document.loaded === \'boolean\';\n})();',
          exposure: ['Window']
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
          code: '"WindowOrWorkerGlobalScope" in self',
          exposure: ['Window']
        },
        'api.WindowOrWorkerGlobalScope.isLoaded': {
          code: '"isLoaded" in self',
          exposure: ['Window']
        }
      });
    });

    it('interface with constructor operation', () => {
      const ast = WebIDL2.parse(`interface Number {
        constructor(optional any value);
      };`);

      assert.deepEqual(buildIDLTests(ast), {
        'api.Number': {
          code: '"Number" in self',
          exposure: ['Window']
        },
        'api.Number.Number': {
          code: 'bcd.testConstructor("Number");',
          exposure: ['Window']
        }
      });
    });

    it('interface with constructor in ExtAttr', () => {
      const ast = WebIDL2.parse(`[Constructor(optional any value)]
        interface Number {};`);
      assert.deepEqual(buildIDLTests(ast), {
        'api.Number': {
          code: '"Number" in self',
          exposure: ['Window']
        },
        'api.Number.Number': {
          code: 'bcd.testConstructor("Number");',
          exposure: ['Window']
        }
      });
    });

    it('iterable interface', () => {
      const ast = WebIDL2.parse(`interface DoubleList {
        iterable<double>;
      };`);
      assert.deepEqual(buildIDLTests(ast), {
        'api.DoubleList': {
          code: '"DoubleList" in self',
          exposure: ['Window']
        },
        'api.DoubleList.@@iterator': {
          code: '"Symbol" in self && "iterator" in Symbol && Symbol.iterator in DoubleList.prototype',
          exposure: ['Window']
        },
        'api.DoubleList.entries': {
          code: '"entries" in DoubleList.prototype',
          exposure: ['Window']
        },
        'api.DoubleList.forEach': {
          code: '"forEach" in DoubleList.prototype',
          exposure: ['Window']
        },
        'api.DoubleList.keys': {
          code: '"keys" in DoubleList.prototype',
          exposure: ['Window']
        },
        'api.DoubleList.values': {
          code: '"values" in DoubleList.prototype',
          exposure: ['Window']
        }
      });
    });

    it('maplike interface', () => {
      const ast = WebIDL2.parse(`interface DoubleMap {
        maplike<DOMString, double>;
      };`);
      assert.deepEqual(buildIDLTests(ast), {
        'api.DoubleMap': {
          code: '"DoubleMap" in self',
          exposure: ['Window']
        },
        'api.DoubleMap.clear': {
          code: '"clear" in DoubleMap.prototype',
          exposure: ['Window']
        },
        'api.DoubleMap.delete': {
          code: '"delete" in DoubleMap.prototype',
          exposure: ['Window']
        },
        'api.DoubleMap.entries': {
          code: '"entries" in DoubleMap.prototype',
          exposure: ['Window']
        },
        'api.DoubleMap.forEach': {
          code: '"forEach" in DoubleMap.prototype',
          exposure: ['Window']
        },
        'api.DoubleMap.get': {
          code: '"get" in DoubleMap.prototype',
          exposure: ['Window']
        },
        'api.DoubleMap.has': {
          code: '"has" in DoubleMap.prototype',
          exposure: ['Window']
        },
        'api.DoubleMap.keys': {
          code: '"keys" in DoubleMap.prototype',
          exposure: ['Window']
        },
        'api.DoubleMap.set': {
          code: '"set" in DoubleMap.prototype',
          exposure: ['Window']
        },
        'api.DoubleMap.size': {
          code: '"size" in DoubleMap.prototype',
          exposure: ['Window']
        },
        'api.DoubleMap.values': {
          code: '"values" in DoubleMap.prototype',
          exposure: ['Window']
        }
      });
    });

    it('setlike interface', () => {
      const ast = WebIDL2.parse(`interface DoubleSet {
        setlike<double>;
      };`);
      assert.deepEqual(buildIDLTests(ast), {
        'api.DoubleSet': {
          code: '"DoubleSet" in self',
          exposure: ['Window']
        },
        'api.DoubleSet.add': {
          code: '"add" in DoubleSet.prototype',
          exposure: ['Window']
        },
        'api.DoubleSet.clear': {
          code: '"clear" in DoubleSet.prototype',
          exposure: ['Window']
        },
        'api.DoubleSet.delete': {
          code: '"delete" in DoubleSet.prototype',
          exposure: ['Window']
        },
        'api.DoubleSet.entries': {
          code: '"entries" in DoubleSet.prototype',
          exposure: ['Window']
        },
        'api.DoubleSet.forEach': {
          code: '"forEach" in DoubleSet.prototype',
          exposure: ['Window']
        },
        'api.DoubleSet.has': {
          code: '"has" in DoubleSet.prototype',
          exposure: ['Window']
        },
        'api.DoubleSet.keys': {
          code: '"keys" in DoubleSet.prototype',
          exposure: ['Window']
        },
        'api.DoubleSet.size': {
          code: '"size" in DoubleSet.prototype',
          exposure: ['Window']
        },
        'api.DoubleSet.values': {
          code: '"values" in DoubleSet.prototype',
          exposure: ['Window']
        }
      });
    });

    it('interface with getter/setter', () => {
      const ast = WebIDL2.parse(`interface GetMe {
        getter GetMe (unsigned long index);
        setter undefined (GetMe data, optional unsigned long index);
      };`);
      assert.deepEqual(buildIDLTests(ast), {
        'api.GetMe': {
          code: '"GetMe" in self',
          exposure: ['Window']
        }
      });
    });

    it('varied exposure', () => {
      const ast = WebIDL2.parse(`
        [Exposed=Window] interface Worker {};
        [Exposed=Worker] interface WorkerSync {};
        [Exposed=(Window,Worker)] interface MessageChannel {};
        namespace CSS {};
      `);
      assert.deepEqual(buildIDLTests(ast), {
        'api.CSS': {
          code: '"CSS" in self',
          exposure: ['Window']
        },
        'api.MessageChannel': {
          code: '"MessageChannel" in self',
          exposure: ['Window', 'Worker']
        },
        'api.Worker': {
          code: '"Worker" in self',
          exposure: ['Window']
        },
        'api.WorkerSync': {
          code: '"WorkerSync" in self',
          exposure: ['Worker']
        }
      });
    });

    it('operator variations', () => {
      const ast = WebIDL2.parse(`
        interface AudioNode : EventTarget {
          undefined disconnect ();
          undefined disconnect (unsigned long output);
          undefined disconnect (AudioNode destinationNode);
        };
      `);
      assert.deepEqual(buildIDLTests(ast), {
        'api.AudioNode': {
          code: '"AudioNode" in self',
          exposure: ['Window']
        },
        'api.AudioNode.disconnect': {
          code: '"disconnect" in AudioNode.prototype',
          exposure: ['Window']
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
          code: '"CSS" in self',
          exposure: ['Window']
        },
        'api.CSS.paintWorklet': {
          code: '"paintWorklet" in CSS',
          exposure: ['Window']
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
          code: '"CSS" in self',
          exposure: ['Window']
        },
        'api.CSS.supports': {
          code: '"supports" in CSS',
          exposure: ['Window']
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
          api: {
            CSS: {
              __base: 'var css = CSS;',
              __test: 'return !!css;',
              paintWorklet: 'return css && \'paintWorklet\' in css;'
            }
          }
        }
      });

      assert.deepEqual(buildIDLTests(ast), {
        'api.CSS': {
          code: '(function () {\n  var css = CSS;\n  return !!css;\n})();',
          exposure: ['Window']
        },
        'api.CSS.paintWorklet': {
          code: '(function () {\n  var css = CSS;\n  return css && \'paintWorklet\' in css;\n})();',
          exposure: ['Window']
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

    it('unknown types', () => {
      const ast = WebIDL2.parse(`interface Dummy {
        attribute Dumdum imadumdum;
      };`);
      expect(() => {
        validateIDL(ast);
      }).to.throw();
    });

    it('ignored unknown types', () => {
      const ast = WebIDL2.parse(`interface Dummy {
        attribute CSSOMString style;
      };`);
      expect(() => {
        validateIDL(ast);
      }).to.not.throw();
    });
  });

  it('buildCSS', () => {
    const webrefCSS = {
      'css-fonts': {
        properties: {
          'font-family': {},
          'font-weight': {}
        }
      },
      'css-grid': {
        properties: {
          grid: {}
        }
      }
    };

    const customCSS = {
      properties: {
        zoom: {}
      }
    };

    assert.deepEqual(buildCSS(webrefCSS, customCSS), {
      'css.properties.font-family': {
        code: '"fontFamily" in document.body.style || CSS.supports("font-family", "inherit")',
        exposure: ['Window']
      },
      'css.properties.font-weight': {
        code: '"fontWeight" in document.body.style || CSS.supports("font-weight", "inherit")',
        exposure: ['Window']
      },
      'css.properties.grid': {
        code: '"grid" in document.body.style || CSS.supports("grid", "inherit")',
        exposure: ['Window']
      },
      'css.properties.zoom': {
        code: '"zoom" in document.body.style || CSS.supports("zoom", "inherit")',
        exposure: ['Window']
      }
    });
  });
});
