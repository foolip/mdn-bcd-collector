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
const mockFs = require('mock-fs');
const proxyquire = require('proxyquire');

const {
  writeFile,
  flattenIDL,
  getExposureSet,
  getName,
  compileTestCode,
  compileTest,
  collectExtraIDL,
  validateIDL,
  buildIDLTests,
  buildIDL,
  collectCSSPropertiesFromBCD,
  collectCSSPropertiesFromWebref,
  cssPropertyToIDLAttribute,
  buildCSS,
  buildEndpoints
} = proxyquire('../../build', {
  './custom-tests.json': {api: {}, css: {}}
});

describe('build', () => {
  describe('writeFile', () => {
    const filepath = '.testtmp';

    beforeEach(() => {
      mockFs({
        '.testtmp': '',
        './custom-tests.json': {api: {}, css: {}}
      });
    });

    it('simple supported', async () => {
      await writeFile(filepath, 'foo\nbar');
      assert.fileContent(filepath, 'foo\nbar\n');
    });

    it('array', async () => {
      await writeFile(filepath, ['foo', 'bar', 'baz']);
      assert.fileContent(filepath, 'foo\nbar\nbaz\n');
    });

    it('dictionary', async () => {
      await writeFile(filepath, {foo: ['bar', 'baz']});
      assert.fileContent(filepath, '{\n  "foo": [\n    "bar",\n    "baz"\n  ]\n}\n');
    });

    afterEach(() => {
      mockFs.restore();
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
            foo: {
              __test: 'return 1;'
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
            '(function() {return 1 + 1;})()'
        );
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
            '(function() {return 1 + 1;})()'
        );
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
          getCustomSubtestsAPI('foo', 'bar'),
          {
            multiple: '(function() {return 1 + 1 + 1;})()',
            'one.only': '(function() {return 1;})()'
          }
      );
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

  describe('compileTestCode', () => {
    describe('string', () => {
      const test = 'PREFIXfoo';

      it('normal', () => {
        assert.equal(compileTestCode(test), 'foo');
      });

      it('prefix', () => {
        assert.equal(compileTestCode(test, 'webkit'), 'webkitFoo');
      });
    });

    describe('constructor', () => {
      const test = {property: 'constructor', scope: 'AudioContext'};

      it('normal', () => {
        assert.equal(compileTestCode(test), '"AudioContext" in self && bcd.testConstructor("AudioContext")');
      });

      it('prefix', () => {
        assert.equal(compileTestCode(test, 'moz'), '"mozAudioContext" in self && bcd.testConstructor("mozAudioContext")');
      });
    });

    describe('CSS.supports', () => {
      const test = {property: 'font-weight', scope: 'CSS.supports'};

      it('normal', () => {
        assert.equal(compileTestCode(test), 'CSS.supports("font-weight", "inherit")');
      });

      it('prefix', () => {
        assert.equal(compileTestCode(test, 'webkit'), 'CSS.supports("-webkit-font-weight", "inherit")');
      });
    });

    describe('Symbol', () => {
      const test = {property: 'Symbol.iterator', scope: 'DOMMatrixReadOnly'};

      it('normal', () => {
        assert.equal(compileTestCode(test), '"DOMMatrixReadOnly" in self && "Symbol" in self && "iterator" in Symbol && Symbol.iterator in DOMMatrixReadOnly.prototype');
      });

      it('prefix', () => {
        assert.equal(compileTestCode(test, 'moz'), '"mozDOMMatrixReadOnly" in self && "Symbol" in self && "iterator" in Symbol && Symbol.iterator in mozDOMMatrixReadOnly.prototype');
      });
    });

    describe('other', () => {
      const test = {property: 'log', scope: 'console'};

      it('normal', () => {
        assert.equal(compileTestCode(test), '"log" in console');
      });

      it('prefix', () => {
        assert.equal(compileTestCode(test, 'webkit'), '"webkitLog" in console');
      });

      it('scope prefix', () => {
        assert.equal(compileTestCode(test, '', 'moz'), '"log" in mozConsole');
      });

      it('prefix + scope prefix', () => {
        assert.equal(compileTestCode(test, 'webkit', 'moz'), '"webkitLog" in mozConsole');
      });
    });
  });

  describe('compileTest', () => {
    it('main', () => {
      const rawTest = {
        raw: {
          code: [
            {property: 'Document', scope: 'self'},
            {property: 'body', scope: `Document.prototype`}
          ],
          combinator: '&&'
        },
        scope: ['Window']
      };

      assert.deepEqual(compileTest(rawTest), {
        tests: [
          {
            code: '"Document" in self && "body" in Document.prototype',
            prefix: ''
          },
          {
            code: '"Document" in self && "WebKitBody" in Document.prototype',
            prefix: 'WebKit'
          },
          {
            code: '"WebKitDocument" in self && "body" in WebKitDocument.prototype',
            prefix: ''
          },
          {
            code: '"WebKitDocument" in self && "WebKitBody" in WebKitDocument.prototype',
            prefix: 'WebKit'
          }
        ],
        scope: ['Window']
      });
    });

    it('ignore already compiled', () => {
      const test = {
        tests: [
          {
            code: 'true',
            prefix: ''
          }
        ],
        scope: ['Window']
      };

      assert.deepEqual(compileTest(test), test);
    });

    it('no-repeated test code', () => {
      const rawTests = [
        {
          raw: {
            code: 'true',
            combinator: '&&'
          },
          scope: ['Window']
        },
        {
          raw: {
            code: [
              'true',
              'true'
            ],
            combinator: '||'
          },
          scope: ['CSS']
        },
        {
          raw: {
            code: [
              'true',
              'true'
            ],
            combinator: '&&'
          },
          scope: ['Worker']
        }
      ];

      assert.deepEqual(compileTest(rawTests[0]), {
        tests: [
          {
            code: 'true',
            prefix: ''
          }
        ],
        scope: ['Window']
      });
      assert.deepEqual(compileTest(rawTests[1]), {
        tests: [
          {
            code: 'true || true',
            prefix: ''
          }
        ],
        scope: ['CSS']
      });
      assert.deepEqual(compileTest(rawTests[2]), {
        tests: [
          {
            code: 'true && true',
            prefix: ''
          }
        ],
        scope: ['Worker']
      });
    });

    it('CSS scope', () => {
      const rawTest = {
        raw: {
          code: [
            {property: 'fontFamily', scope: 'document.body.style'},
            {property: 'font-family', scope: 'CSS.supports'}
          ],
          combinator: '||'
        },
        scope: ['CSS']
      };

      assert.deepEqual(compileTest(rawTest), {
        tests: [
          {
            code: '"fontFamily" in document.body.style || CSS.supports("font-family", "inherit")',
            prefix: ''
          },
          {
            code: '"webkitFontFamily" in document.body.style || CSS.supports("-webkit-font-family", "inherit")',
            prefix: 'webkit'
          }
        ],
        scope: ['CSS']
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

  it('collectCSSPropertiesFromWebref', () => {
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
            grid: {}
          }
        }
      }
    };
    const propertySet = new Set();
    collectCSSPropertiesFromWebref(webref, propertySet);
    const properties = Array.from(propertySet);
    assert.deepEqual(properties, ['font-family', 'font-weight', 'grid']);
  });

  it('cssPropertyToIDLAttribute', () => {
    assert.equal(cssPropertyToIDLAttribute('line-height'), 'lineHeight');
    assert.equal(cssPropertyToIDLAttribute('-webkit-line-clamp', true),
        'webkitLineClamp');
  });

  it('collectExtraIDL', () => {
    const idl = 'interface Dummy {};';
    mockFs({
      'non-standard.idl': idl
    });

    assert.deepEqual(collectExtraIDL(), WebIDL2.parse(idl));

    mockFs.restore();
  });

  it('buildIDL', () => {
    const webref = require('../../webref');
    assert.typeOf(buildIDL(webref), 'object');
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

  describe('getName', () => {
    it('main', () => {
      const node = {name: 'foobar'};
      assert.equal(getName(node), 'foobar');
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
          tests: [
            {
              code: '"Attr" in self',
              prefix: ''
            },
            {
              code: '"WebKitAttr" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.Attr.name': {
          tests: [
            {
              code: '"Attr" in self && "name" in Attr.prototype',
              prefix: ''
            },
            {
              code: '"Attr" in self && "WebKitName" in Attr.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitAttr" in self && "name" in WebKitAttr.prototype',
              prefix: ''
            },
            {
              code: '"WebKitAttr" in self && "WebKitName" in WebKitAttr.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
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
          tests: [
            {
              code: '"Node" in self',
              prefix: ''
            },
            {
              code: '"WebKitNode" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.Node.contains': {
          tests: [
            {
              code: '"Node" in self && "contains" in Node.prototype',
              prefix: ''
            },
            {
              code: '"Node" in self && "WebKitContains" in Node.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitNode" in self && "contains" in WebKitNode.prototype',
              prefix: ''
            },
            {
              code: '"WebKitNode" in self && "WebKitContains" in WebKitNode.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
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
          tests: [
            {
              code: '"MediaSource" in self',
              prefix: ''
            },
            {
              code: '"WebKitMediaSource" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.MediaSource.isTypeSupported': {
          tests: [
            {
              code: '"MediaSource" in self && "isTypeSupported" in MediaSource',
              prefix: ''
            },
            {
              code: '"MediaSource" in self && "WebKitIsTypeSupported" in MediaSource',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitMediaSource" in self && "isTypeSupported" in WebKitMediaSource',
              prefix: ''
            },
            {
              code: '"WebKitMediaSource" in self && "WebKitIsTypeSupported" in WebKitMediaSource',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
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
          tests: [
            {
              code: '"Window" in self',
              prefix: ''
            },
            {
              code: '"WebKitWindow" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.Window.isWindow': {
          tests: [
            {
              code: '"Window" in self && "isWindow" in Window',
              prefix: ''
            },
            {
              code: '"Window" in self && "WebKitIsWindow" in Window',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitWindow" in self && "isWindow" in WebKitWindow',
              prefix: ''
            },
            {
              code: '"WebKitWindow" in self && "WebKitIsWindow" in WebKitWindow',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
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
          };

          interface Body {
            readonly attribute boolean loaded;
          };`);
      const {buildIDLTests} = proxyquire('../../build', {
        './custom-tests.json': {
          api: {
            ANGLE_instanced_arrays: {
              __base: 'var canvas = document.createElement(\'canvas\'); var gl = canvas.getContext(\'webgl\'); var instance = gl.getExtension(\'ANGLE_instanced_arrays\');',
              __test: 'return !!instance;',
              drawArraysInstancedANGLE: 'return true && instance && \'drawArraysInstancedANGLE\' in instance;'
            },
            Body: {
              __additional: {
                'loaded.loaded_is_boolean': 'return typeof body.loaded === "boolean";'
              }
            }
          }
        }
      });

      assert.deepEqual(buildIDLTests(ast), {
        'api.ANGLE_instanced_arrays': {
          tests: [
            {
              code: '(function() {var canvas = document.createElement(\'canvas\'); var gl = canvas.getContext(\'webgl\'); var instance = gl.getExtension(\'ANGLE_instanced_arrays\');return !!instance;})()',
              prefix: ''
            }
          ],
          scope: ['Window']
        },
        'api.ANGLE_instanced_arrays.drawArraysInstancedANGLE': {
          tests: [
            {
              code: '(function() {var canvas = document.createElement(\'canvas\'); var gl = canvas.getContext(\'webgl\'); var instance = gl.getExtension(\'ANGLE_instanced_arrays\');return true && instance && \'drawArraysInstancedANGLE\' in instance;})()',
              prefix: ''
            }
          ],
          scope: ['Window']
        },
        'api.ANGLE_instanced_arrays.drawElementsInstancedANGLE': {
          tests: [
            {
              code: '(function() {var canvas = document.createElement(\'canvas\'); var gl = canvas.getContext(\'webgl\'); var instance = gl.getExtension(\'ANGLE_instanced_arrays\');return instance && \'drawElementsInstancedANGLE\' in instance;})()',
              prefix: ''
            }
          ],
          scope: ['Window']
        },
        'api.Body': {
          tests: [
            {
              code: '"Body" in self',
              prefix: ''
            },
            {
              code: '"WebKitBody" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.Body.loaded': {
          tests: [
            {
              code: '"Body" in self && "loaded" in Body.prototype',
              prefix: ''
            },
            {
              code: '"Body" in self && "WebKitLoaded" in Body.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitBody" in self && "loaded" in WebKitBody.prototype',
              prefix: ''
            },
            {
              code: '"WebKitBody" in self && "WebKitLoaded" in WebKitBody.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.Body.loaded.loaded_is_boolean': {
          tests: [
            {
              code: '(function() {return typeof body.loaded === "boolean";})()',
              prefix: ''
            }
          ],
          scope: ['Window']
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
          tests: [
            {
              code: '"WindowOrWorkerGlobalScope" in self',
              prefix: ''
            },
            {
              code: '"WebKitWindowOrWorkerGlobalScope" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.WindowOrWorkerGlobalScope.active': {
          tests: [
            {
              code: '"active" in self',
              prefix: ''
            },
            {
              code: '"WebKitActive" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.WindowOrWorkerGlobalScope.isLoaded': {
          tests: [
            {
              code: '"isLoaded" in self',
              prefix: ''
            },
            {
              code: '"WebKitIsLoaded" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        }
      });
    });

    it('interface with constructor operation', () => {
      const ast = WebIDL2.parse(`interface Number {
        constructor(optional any value);
      };`);

      assert.deepEqual(buildIDLTests(ast), {
        'api.Number': {
          tests: [
            {
              code: '"Number" in self',
              prefix: ''
            },
            {
              code: '"WebKitNumber" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.Number.Number': {
          tests: [
            {
              code: '"Number" in self && bcd.testConstructor("Number")',
              prefix: ''
            },
            {
              code: '"WebKitNumber" in self && bcd.testConstructor("WebKitNumber")',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        }
      });
    });

    it('interface with constructor in ExtAttr', () => {
      const ast = WebIDL2.parse(`[Constructor(optional any value)]
        interface Number {};`);
      assert.deepEqual(buildIDLTests(ast), {
        'api.Number': {
          tests: [
            {
              code: '"Number" in self',
              prefix: ''
            },
            {
              code: '"WebKitNumber" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.Number.Number': {
          tests: [
            {
              code: '"Number" in self && bcd.testConstructor("Number")',
              prefix: ''
            },
            {
              code: '"WebKitNumber" in self && bcd.testConstructor("WebKitNumber")',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        }
      });
    });

    it('iterable interface', () => {
      const ast = WebIDL2.parse(`interface DoubleList {
        iterable<double>;
      };`);
      assert.deepEqual(buildIDLTests(ast), {
        'api.DoubleList': {
          tests: [
            {
              code: '"DoubleList" in self',
              prefix: ''
            },
            {
              code: '"WebKitDoubleList" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleList.@@iterator': {
          tests: [
            {
              code: '"DoubleList" in self && "Symbol" in self && "iterator" in Symbol && Symbol.iterator in DoubleList.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleList" in self && "Symbol" in self && "iterator" in Symbol && Symbol.iterator in WebKitDoubleList.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleList.entries': {
          tests: [
            {
              code: '"DoubleList" in self && "entries" in DoubleList.prototype',
              prefix: ''
            },
            {
              code: '"DoubleList" in self && "WebKitEntries" in DoubleList.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleList" in self && "entries" in WebKitDoubleList.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleList" in self && "WebKitEntries" in WebKitDoubleList.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleList.forEach': {
          tests: [
            {
              code: '"DoubleList" in self && "forEach" in DoubleList.prototype',
              prefix: ''
            },
            {
              code: '"DoubleList" in self && "WebKitForEach" in DoubleList.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleList" in self && "forEach" in WebKitDoubleList.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleList" in self && "WebKitForEach" in WebKitDoubleList.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleList.keys': {
          tests: [
            {
              code: '"DoubleList" in self && "keys" in DoubleList.prototype',
              prefix: ''
            },
            {
              code: '"DoubleList" in self && "WebKitKeys" in DoubleList.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleList" in self && "keys" in WebKitDoubleList.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleList" in self && "WebKitKeys" in WebKitDoubleList.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleList.values': {
          tests: [
            {
              code: '"DoubleList" in self && "values" in DoubleList.prototype',
              prefix: ''
            },
            {
              code: '"DoubleList" in self && "WebKitValues" in DoubleList.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleList" in self && "values" in WebKitDoubleList.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleList" in self && "WebKitValues" in WebKitDoubleList.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        }
      });
    });

    it('maplike interface', () => {
      const ast = WebIDL2.parse(`interface DoubleMap {
        maplike<DOMString, double>;
      };`);
      assert.deepEqual(buildIDLTests(ast), {
        'api.DoubleMap': {
          tests: [
            {
              code: '"DoubleMap" in self',
              prefix: ''
            },
            {
              code: '"WebKitDoubleMap" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleMap.clear': {
          tests: [
            {
              code: '"DoubleMap" in self && "clear" in DoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"DoubleMap" in self && "WebKitClear" in DoubleMap.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleMap" in self && "clear" in WebKitDoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleMap" in self && "WebKitClear" in WebKitDoubleMap.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleMap.delete': {
          tests: [
            {
              code: '"DoubleMap" in self && "delete" in DoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"DoubleMap" in self && "WebKitDelete" in DoubleMap.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleMap" in self && "delete" in WebKitDoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleMap" in self && "WebKitDelete" in WebKitDoubleMap.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleMap.entries': {
          tests: [
            {
              code: '"DoubleMap" in self && "entries" in DoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"DoubleMap" in self && "WebKitEntries" in DoubleMap.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleMap" in self && "entries" in WebKitDoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleMap" in self && "WebKitEntries" in WebKitDoubleMap.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleMap.forEach': {
          tests: [
            {
              code: '"DoubleMap" in self && "forEach" in DoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"DoubleMap" in self && "WebKitForEach" in DoubleMap.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleMap" in self && "forEach" in WebKitDoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleMap" in self && "WebKitForEach" in WebKitDoubleMap.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleMap.get': {
          tests: [
            {
              code: '"DoubleMap" in self && "get" in DoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"DoubleMap" in self && "WebKitGet" in DoubleMap.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleMap" in self && "get" in WebKitDoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleMap" in self && "WebKitGet" in WebKitDoubleMap.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleMap.has': {
          tests: [
            {
              code: '"DoubleMap" in self && "has" in DoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"DoubleMap" in self && "WebKitHas" in DoubleMap.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleMap" in self && "has" in WebKitDoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleMap" in self && "WebKitHas" in WebKitDoubleMap.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleMap.keys': {
          tests: [
            {
              code: '"DoubleMap" in self && "keys" in DoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"DoubleMap" in self && "WebKitKeys" in DoubleMap.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleMap" in self && "keys" in WebKitDoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleMap" in self && "WebKitKeys" in WebKitDoubleMap.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleMap.set': {
          tests: [
            {
              code: '"DoubleMap" in self && "set" in DoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"DoubleMap" in self && "WebKitSet" in DoubleMap.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleMap" in self && "set" in WebKitDoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleMap" in self && "WebKitSet" in WebKitDoubleMap.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleMap.size': {
          tests: [
            {
              code: '"DoubleMap" in self && "size" in DoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"DoubleMap" in self && "WebKitSize" in DoubleMap.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleMap" in self && "size" in WebKitDoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleMap" in self && "WebKitSize" in WebKitDoubleMap.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleMap.values': {
          tests: [
            {
              code: '"DoubleMap" in self && "values" in DoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"DoubleMap" in self && "WebKitValues" in DoubleMap.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleMap" in self && "values" in WebKitDoubleMap.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleMap" in self && "WebKitValues" in WebKitDoubleMap.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        }
      });
    });

    it('setlike interface', () => {
      const ast = WebIDL2.parse(`interface DoubleSet {
        setlike<double>;
      };`);
      assert.deepEqual(buildIDLTests(ast), {
        'api.DoubleSet': {
          tests: [
            {
              code: '"DoubleSet" in self',
              prefix: ''
            },
            {
              code: '"WebKitDoubleSet" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleSet.add': {
          tests: [
            {
              code: '"DoubleSet" in self && "add" in DoubleSet.prototype',
              prefix: ''
            },
            {
              code: '"DoubleSet" in self && "WebKitAdd" in DoubleSet.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleSet" in self && "add" in WebKitDoubleSet.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleSet" in self && "WebKitAdd" in WebKitDoubleSet.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleSet.clear': {
          tests: [
            {
              code: '"DoubleSet" in self && "clear" in DoubleSet.prototype',
              prefix: ''
            },
            {
              code: '"DoubleSet" in self && "WebKitClear" in DoubleSet.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleSet" in self && "clear" in WebKitDoubleSet.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleSet" in self && "WebKitClear" in WebKitDoubleSet.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleSet.delete': {
          tests: [
            {
              code: '"DoubleSet" in self && "delete" in DoubleSet.prototype',
              prefix: ''
            },
            {
              code: '"DoubleSet" in self && "WebKitDelete" in DoubleSet.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleSet" in self && "delete" in WebKitDoubleSet.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleSet" in self && "WebKitDelete" in WebKitDoubleSet.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleSet.entries': {
          tests: [
            {
              code: '"DoubleSet" in self && "entries" in DoubleSet.prototype',
              prefix: ''
            },
            {
              code: '"DoubleSet" in self && "WebKitEntries" in DoubleSet.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleSet" in self && "entries" in WebKitDoubleSet.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleSet" in self && "WebKitEntries" in WebKitDoubleSet.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleSet.has': {
          tests: [
            {
              code: '"DoubleSet" in self && "has" in DoubleSet.prototype',
              prefix: ''
            },
            {
              code: '"DoubleSet" in self && "WebKitHas" in DoubleSet.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleSet" in self && "has" in WebKitDoubleSet.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleSet" in self && "WebKitHas" in WebKitDoubleSet.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleSet.keys': {
          tests: [
            {
              code: '"DoubleSet" in self && "keys" in DoubleSet.prototype',
              prefix: ''
            },
            {
              code: '"DoubleSet" in self && "WebKitKeys" in DoubleSet.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleSet" in self && "keys" in WebKitDoubleSet.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleSet" in self && "WebKitKeys" in WebKitDoubleSet.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleSet.size': {
          tests: [
            {
              code: '"DoubleSet" in self && "size" in DoubleSet.prototype',
              prefix: ''
            },
            {
              code: '"DoubleSet" in self && "WebKitSize" in DoubleSet.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleSet" in self && "size" in WebKitDoubleSet.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleSet" in self && "WebKitSize" in WebKitDoubleSet.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.DoubleSet.values': {
          tests: [
            {
              code: '"DoubleSet" in self && "values" in DoubleSet.prototype',
              prefix: ''
            },
            {
              code: '"DoubleSet" in self && "WebKitValues" in DoubleSet.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitDoubleSet" in self && "values" in WebKitDoubleSet.prototype',
              prefix: ''
            },
            {
              code: '"WebKitDoubleSet" in self && "WebKitValues" in WebKitDoubleSet.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
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
          tests: [
            {
              code: '"GetMe" in self',
              prefix: ''
            },
            {
              code: '"WebKitGetMe" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
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
          tests: [
            {
              code: '"CSS" in self',
              prefix: ''
            },
            {
              code: '"WebKitCSS" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.MessageChannel': {
          tests: [
            {
              code: '"MessageChannel" in self',
              prefix: ''
            },
            {
              code: '"WebKitMessageChannel" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window', 'Worker']
        },
        'api.Worker': {
          tests: [
            {
              code: '"Worker" in self',
              prefix: ''
            },
            {
              code: '"WebKitWorker" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.WorkerSync': {
          tests: [
            {
              code: '"WorkerSync" in self',
              prefix: ''
            },
            {
              code: '"WebKitWorkerSync" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Worker']
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
          tests: [
            {
              code: '"AudioNode" in self',
              prefix: ''
            },
            {
              code: '"WebKitAudioNode" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.AudioNode.disconnect': {
          tests: [
            {
              code: '"AudioNode" in self && "disconnect" in AudioNode.prototype',
              prefix: ''
            },
            {
              code: '"AudioNode" in self && "WebKitDisconnect" in AudioNode.prototype',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitAudioNode" in self && "disconnect" in WebKitAudioNode.prototype',
              prefix: ''
            },
            {
              code: '"WebKitAudioNode" in self && "WebKitDisconnect" in WebKitAudioNode.prototype',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
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
          tests: [
            {
              code: '"CSS" in self',
              prefix: ''
            },
            {
              code: '"WebKitCSS" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.CSS.paintWorklet': {
          tests: [
            {
              code: '"CSS" in self && "paintWorklet" in CSS',
              prefix: ''
            },
            {
              code: '"CSS" in self && "WebKitPaintWorklet" in CSS',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitCSS" in self && "paintWorklet" in WebKitCSS',
              prefix: ''
            },
            {
              code: '"WebKitCSS" in self && "WebKitPaintWorklet" in WebKitCSS',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
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
          tests: [
            {
              code: '"CSS" in self',
              prefix: ''
            },
            {
              code: '"WebKitCSS" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.CSS.supports': {
          tests: [
            {
              code: '"CSS" in self && "supports" in CSS',
              prefix: ''
            },
            {
              code: '"CSS" in self && "WebKitSupports" in CSS',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitCSS" in self && "supports" in WebKitCSS',
              prefix: ''
            },
            {
              code: '"WebKitCSS" in self && "WebKitSupports" in WebKitCSS',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
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
          tests: [
            {
              code: '(function() {var css = CSS;return !!css;})()',
              prefix: ''
            }
          ],
          scope: ['Window']
        },
        'api.CSS.paintWorklet': {
          tests: [
            {
              code: '(function() {var css = CSS;return css && \'paintWorklet\' in css;})()',
              prefix: ''
            }
          ],
          scope: ['Window']
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
          tests: [
            {
              code: '"ElementRegistrationOptions" in self',
              prefix: ''
            },
            {
              code: '"WebKitElementRegistrationOptions" in self',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.ElementRegistrationOptions.extends': {
          tests: [
            {
              code: '"ElementRegistrationOptions" in self && "extends" in ElementRegistrationOptions',
              prefix: ''
            },
            {
              code: '"ElementRegistrationOptions" in self && "WebKitExtends" in ElementRegistrationOptions',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitElementRegistrationOptions" in self && "extends" in WebKitElementRegistrationOptions',
              prefix: ''
            },
            {
              code: '"WebKitElementRegistrationOptions" in self && "WebKitExtends" in WebKitElementRegistrationOptions',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
        },
        'api.ElementRegistrationOptions.prototype': {
          tests: [
            {
              code: '"ElementRegistrationOptions" in self && "prototype" in ElementRegistrationOptions',
              prefix: ''
            },
            {
              code: '"ElementRegistrationOptions" in self && "WebKitPrototype" in ElementRegistrationOptions',
              prefix: 'WebKit'
            },
            {
              code: '"WebKitElementRegistrationOptions" in self && "prototype" in WebKitElementRegistrationOptions',
              prefix: ''
            },
            {
              code: '"WebKitElementRegistrationOptions" in self && "WebKitPrototype" in WebKitElementRegistrationOptions',
              prefix: 'WebKit'
            }
          ],
          scope: ['Window']
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
          api: {
            ElementRegistrationOptions: {
              __base: 'var instance = ElementRegistrationOptions;'
            }
          }
        }
      });

      assert.deepEqual(buildIDLTests(ast), {
        'api.ElementRegistrationOptions': {
          tests: [
            {
              code: '(function() {var instance = ElementRegistrationOptions;return !!instance;})()',
              prefix: ''
            }
          ],
          scope: ['Window']
        },
        'api.ElementRegistrationOptions.extends': {
          tests: [
            {
              code: '(function() {var instance = ElementRegistrationOptions;return instance && \'extends\' in instance;})()',
              prefix: ''
            }
          ],
          scope: ['Window']
        },
        'api.ElementRegistrationOptions.prototype': {
          tests: [
            {
              code: '(function() {var instance = ElementRegistrationOptions;return instance && \'prototype\' in instance;})()',
              prefix: ''
            }
          ],
          scope: ['Window']
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

  it('buildCSS', () => {
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
            grid: {}
          }
        }
      }
    };

    assert.deepEqual(buildCSS(webref, bcd), {
      'css.properties.appearance': {
        tests: [
          {
            code: '"appearance" in document.body.style || CSS.supports("appearance", "inherit")',
            prefix: ''
          },
          {
            code: '"webkitAppearance" in document.body.style || CSS.supports("-webkit-appearance", "inherit")',
            prefix: 'webkit'
          }
        ],
        scope: ['CSS']
      },
      'css.properties.font-family': {
        tests: [
          {
            code: '"fontFamily" in document.body.style || CSS.supports("font-family", "inherit")',
            prefix: ''
          },
          {
            code: '"webkitFontFamily" in document.body.style || CSS.supports("-webkit-font-family", "inherit")',
            prefix: 'webkit'
          }
        ],
        scope: ['CSS']
      },
      'css.properties.font-weight': {
        tests: [
          {
            code: '"fontWeight" in document.body.style || CSS.supports("font-weight", "inherit")',
            prefix: ''
          },
          {
            code: '"webkitFontWeight" in document.body.style || CSS.supports("-webkit-font-weight", "inherit")',
            prefix: 'webkit'
          }
        ],
        scope: ['CSS']
      },
      'css.properties.grid': {
        tests: [
          {
            code: '"grid" in document.body.style || CSS.supports("grid", "inherit")',
            prefix: ''
          },
          {
            code: '"webkitGrid" in document.body.style || CSS.supports("-webkit-grid", "inherit")',
            prefix: 'webkit'
          }
        ],
        scope: ['CSS']
      }
    });
  });

  it('buildEndpoints', () => {
    const tests = {
      'api.Attr': {
        code: '"Attr" in self',
        scope: ['Window', 'Worker', 'ServiceWorker']
      },
      'api.Attr.name': {
        code: '"Attr" in self && "name" in Attr.prototype',
        scope: ['Window', 'Worker']
      },
      'css.properties.font-family': {
        code: '"fontFamily" in document.body.style || CSS.supports("font-family", "inherit")',
        scope: ['CSS']
      },
      'javascript.builtins.array': {
        code: '[1, 2, 3]',
        scope: ['JavaScript']
      }
    };
      main: {
        '/api/interfaces': {
          entries: ['api.Attr', 'api.Attr.name'],
          httpsOnly: false,
          scope: 'Window'
        },
        '/api/serviceworkerinterfaces': {
          entries: ['api.Attr'],
          httpsOnly: true,
          scope: 'ServiceWorker'
        },
        '/api/workerinterfaces': {
          entries: ['api.Attr', 'api.Attr.name'],
          httpsOnly: false,
          scope: 'Worker'
        },
        '/css/properties': {
          entries: ['css.properties.font-family'],
          httpsOnly: false,
          scope: 'CSS'
        }
    const expectedEndpoints = {
      },
      individual: {
        '/api/Attr': ['api.Attr', 'api.Attr.name'],
        '/api/Attr/name': ['api.Attr.name'],
        '/css/properties/font-family': [
          'css.properties.font-family'
        ],
        '/javascript': [
          'javascript.builtins.array'
        ],
        '/javascript/builtins': [
          'javascript.builtins.array'
        ],
        '/javascript/builtins/array': [
          'javascript.builtins.array'
        ]
      }
    };

    const endpoints = buildEndpoints(tests);

    assert.deepEqual(endpoints, expectedEndpoints);
  });
});
