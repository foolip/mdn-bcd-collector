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
  validateIDL,
  buildIDLTests,
  buildIDL,
  collectCSSPropertiesFromBCD,
  collectCSSPropertiesFromWebref,
  cssPropertyToIDLAttribute,
  buildCSS
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
      assert.fileContent(filepath, '{"foo":["bar","baz"]}\n');
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
            '(function () {\n  var a = 1;\n  return a;\n})();'
        );
      });

      it('member', () => {
        assert.equal(
            getCustomTestAPI('foo', 'bar'),
            '(function () {\n  var a = 1;\n  return \'bar\' in instance;\n})();'
        );
      });

      it('constructor', () => {
        assert.equal(getCustomTestAPI('foo', 'foo'), false);
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
            '(function () {\n  var a = 1;\n  return !!instance;\n})();'
        );
      });

      it('member', () => {
        assert.equal(
            getCustomTestAPI('foo', 'bar'),
            '(function () {\n  var a = 1;\n  return a + 1;\n})();'
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
            '(function () {\n  return 1 + 1;\n})();'
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
            '(function () {\n  return 1 + 1;\n})();'
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
            '(function () {\n  var a = 1;\n  return a;\n})();'
        );
      });

      it('member', () => {
        assert.equal(
            getCustomTestAPI('foo', 'bar'),
            '(function () {\n  var a = 1;\n  return a + 1;\n})();'
        );
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
            bad: {
              __base: '<%api.foobar:apple%>'
            }
          }
        }
      });

      it('valid import', () => {
        assert.equal(
            getCustomTestAPI('bar'),
            '(function () {\n  var a = 1;\n  var instance = a;\n  return !!instance;\n})();'
        );

        assert.equal(
            getCustomTestAPI('baz'),
            '(function () {\n  var a = 1;\n  var b = a;\n  var instance = b;\n  return !!instance;\n})();'
        );
      });

      it('invalid import', () => {
        assert.equal(
            getCustomTestAPI('bad'),
            '(function () {\n  throw \'Test is malformed: <%api.foobar:apple%> is an invalid reference\';\n  return !!instance;\n})();'
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
            multiple: '(function () {\n  return 1 + 1 + 1;\n})();',
            'one.only': '(function () {\n  return 1;\n})();'
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
      const test = {property: 'constructor', owner: 'AudioContext'};

      it('normal', () => {
        assert.equal(compileTestCode(test), 'bcd.testConstructor("AudioContext")');
      });

      it('prefix', () => {
        assert.equal(compileTestCode(test, 'moz'), 'bcd.testConstructor("mozAudioContext")');
      });
    });

    describe('CSS.supports', () => {
      const test = {property: 'font-weight', owner: 'CSS.supports'};

      it('normal', () => {
        assert.equal(compileTestCode(test), 'CSS.supports("font-weight", "inherit")');
      });

      it('prefix', () => {
        assert.equal(compileTestCode(test, 'webkit'), 'CSS.supports("-webkit-font-weight", "inherit")');
      });
    });

    describe('Symbol', () => {
      const test = {property: 'Symbol.iterator', owner: 'DOMMatrixReadOnly'};

      it('normal', () => {
        assert.equal(compileTestCode(test), '"Symbol" in self && "iterator" in Symbol && Symbol.iterator in DOMMatrixReadOnly.prototype');
      });

      it('prefix', () => {
        assert.equal(compileTestCode(test, 'moz'), '"Symbol" in self && "iterator" in Symbol && Symbol.iterator in mozDOMMatrixReadOnly.prototype');
      });
    });

    describe('other', () => {
      const test = {property: 'log', owner: 'console'};

      it('normal', () => {
        assert.equal(compileTestCode(test), '"log" in console');
      });

      it('prefix', () => {
        assert.equal(compileTestCode(test, 'webkit'), '"webkitLog" in console');
      });

      it('owner prefix', () => {
        assert.equal(compileTestCode(test, '', 'moz'), '"log" in mozConsole');
      });

      it('prefix + owner prefix', () => {
        assert.equal(compileTestCode(test, 'webkit', 'moz'), '"webkitLog" in mozConsole');
      });
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
        category: 'api',
        exposure: ['Window']
      };

      assert.deepEqual(compileTest(rawTest), {
        tests: [
          {
            code: '"Document" in self && "body" in Document.prototype',
            prefix: ''
          }
        ],
        category: 'api',
        exposure: ['Window']
      });
    });

    it('with prefixes, single piece', () => {
      const rawTest = {
        raw: {
          code: {property: 'Document', owner: 'self'},
          combinator: '&&'
        },
        category: 'api',
        exposure: ['Window']
      };

      assert.deepEqual(compileTest(rawTest, ['', 'WebKit']), {
        tests: [
          {
            code: '"Document" in self',
            prefix: ''
          },
          {
            code: '"WebKitDocument" in self',
            prefix: 'WebKit'
          }
        ],
        category: 'api',
        exposure: ['Window']
      });
    });

    describe('with prefixes, double piece', () => {
      it('first', () => {
        const rawTest = {
          raw: {
            code: [
              {property: 'Document', owner: 'self'},
              {property: 'body', owner: `Document.prototype`}
            ],
            combinator: '&&'
          },
          category: 'api',
          exposure: ['Window']
        };

        assert.deepEqual(compileTest(rawTest, ['', 'WebKit']), {
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
          category: 'api',
          exposure: ['Window']
        });
      });
    });

    it('prefixes for custom tests with no prefix support', () => {
      describe('one item', () => {
        const rawTest = {
          raw: {
            code: 'foo',
            combinator: '&&'
          },
          category: 'api',
          exposure: ['Window']
        };

        assert.deepEqual(compileTest(rawTest, ['', 'WebKit']), {
          tests: [
            {
              code: 'foo',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        });
      });

      describe('two items', () => {
        const rawTest = {
          raw: {
            code: ['foo', 'foo'],
            combinator: '&&'
          },
          category: 'api',
          exposure: ['Window']
        };

        assert.deepEqual(compileTest(rawTest, ['', 'WebKit']), {
          tests: [
            {
              code: 'foo && foo',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        });
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
        category: 'api',
        exposure: ['Window']
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
          category: 'api',
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
          category: 'api',
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
          category: 'api',
          exposure: ['Worker']
        }
      ];

      assert.deepEqual(compileTest(rawTests[0]), {
        tests: [
          {
            code: 'true',
            prefix: ''
          }
        ],
        category: 'api',
        exposure: ['Window']
      });
      assert.deepEqual(compileTest(rawTests[1]), {
        tests: [
          {
            code: 'true || true',
            prefix: ''
          }
        ],
        category: 'api',
        exposure: ['Window']
      });
      assert.deepEqual(compileTest(rawTests[2]), {
        tests: [
          {
            code: 'true && true',
            prefix: ''
          }
        ],
        category: 'api',
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
        category: 'css',
        exposure: ['Window']
      };

      assert.deepEqual(compileTest(rawTest), {
        tests: [
          {
            code: '"fontFamily" in document.body.style || CSS.supports("font-family", "inherit")',
            prefix: ''
          }
        ],
        category: 'css',
        exposure: ['Window']
      });
    });

    it('CSS with prefix', () => {
      const rawTest = {
        raw: {
          code: [
            {property: 'fontFamily', owner: 'document.body.style'},
            {property: 'font-family', owner: 'CSS.supports'}
          ],
          combinator: '||'
        },
        category: 'css',
        exposure: ['Window']
      };

      assert.deepEqual(compileTest(rawTest, ['', 'webkit']), {
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
        category: 'css',
        exposure: ['Window']
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
    const propertySet = new Set();
    collectCSSPropertiesFromWebref(webrefCSS, propertySet);
    const properties = Array.from(propertySet);
    assert.deepEqual(properties, ['font-family', 'font-weight', 'grid']);
  });

  it('cssPropertyToIDLAttribute', () => {
    assert.equal(cssPropertyToIDLAttribute('line-height'), 'lineHeight');
    assert.equal(cssPropertyToIDLAttribute('-webkit-line-clamp', true),
        'webkitLineClamp');
  });

  it('buildIDL', () => {
    const specData = require('../../spec-data');
    assert.typeOf(buildIDL(specData.webref.idl, specData.custom.idl), 'object');
  }).timeout(5000);

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
          tests: [
            {
              code: '"Attr" in self',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.Attr.name': {
          tests: [
            {
              code: '"name" in Attr.prototype',
              prefix: ''
            }
          ],
          category: 'api',
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
          tests: [
            {
              code: '"Node" in self',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.Node.contains': {
          tests: [
            {
              code: '"contains" in Node.prototype',
              prefix: ''
            }
          ],
          category: 'api',
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
          tests: [
            {
              code: '"MediaSource" in self',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.MediaSource.isTypeSupported': {
          tests: [
            {
              code: '"isTypeSupported" in MediaSource',
              prefix: ''
            }
          ],
          category: 'api',
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
          tests: [
            {
              code: '"Window" in self',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.Window.isWindow': {
          tests: [
            {
              code: '"isWindow" in Window',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
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
          tests: [
            {
              code: '(function () {\n  var canvas = document.createElement(\'canvas\');\n  var gl = canvas.getContext(\'webgl\');\n  var instance = gl.getExtension(\'ANGLE_instanced_arrays\');\n  return !!instance;\n})();',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.ANGLE_instanced_arrays.drawArraysInstancedANGLE': {
          tests: [
            {
              code: '(function () {\n  var canvas = document.createElement(\'canvas\');\n  var gl = canvas.getContext(\'webgl\');\n  var instance = gl.getExtension(\'ANGLE_instanced_arrays\');\n  return true && instance && \'drawArraysInstancedANGLE\' in instance;\n})();',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.ANGLE_instanced_arrays.drawElementsInstancedANGLE': {
          tests: [
            {
              code: '(function () {\n  var canvas = document.createElement(\'canvas\');\n  var gl = canvas.getContext(\'webgl\');\n  var instance = gl.getExtension(\'ANGLE_instanced_arrays\');\n  return \'drawElementsInstancedANGLE\' in instance;\n})();',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.Document': {
          tests: [
            {
              code: '"Document" in self',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.Document.charset': {
          tests: [
            {
              code: '(function () {\n  return document.charset == \'UTF-8\';\n})();',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.Document.loaded': {
          tests: [
            {
              code: '"loaded" in Document.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.Document.loaded.loaded_is_boolean': {
          tests: [
            {
              code: '(function () {\n  return typeof document.loaded === \'boolean\';\n})();',
              prefix: ''
            }
          ],
          category: 'api',
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
          tests: [
            {
              code: '"WindowOrWorkerGlobalScope" in self',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.WindowOrWorkerGlobalScope.active': {
          tests: [
            {
              code: '"active" in self',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.WindowOrWorkerGlobalScope.isLoaded': {
          tests: [
            {
              code: '"isLoaded" in self',
              prefix: ''
            }
          ],
          category: 'api',
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
          tests: [
            {
              code: '"Number" in self',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.Number.Number': {
          tests: [
            {
              code: 'bcd.testConstructor("Number")',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
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
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.Number.Number': {
          tests: [
            {
              code: 'bcd.testConstructor("Number")',
              prefix: ''
            }
          ],
          category: 'api',
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
          tests: [
            {
              code: '"DoubleList" in self',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleList.@@iterator': {
          tests: [
            {
              code: '"Symbol" in self && "iterator" in Symbol && Symbol.iterator in DoubleList.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleList.entries': {
          tests: [
            {
              code: '"entries" in DoubleList.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleList.forEach': {
          tests: [
            {
              code: '"forEach" in DoubleList.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleList.keys': {
          tests: [
            {
              code: '"keys" in DoubleList.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleList.values': {
          tests: [
            {
              code: '"values" in DoubleList.prototype',
              prefix: ''
            }
          ],
          category: 'api',
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
          tests: [
            {
              code: '"DoubleMap" in self',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleMap.clear': {
          tests: [
            {
              code: '"clear" in DoubleMap.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleMap.delete': {
          tests: [
            {
              code: '"delete" in DoubleMap.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleMap.entries': {
          tests: [
            {
              code: '"entries" in DoubleMap.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleMap.forEach': {
          tests: [
            {
              code: '"forEach" in DoubleMap.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleMap.get': {
          tests: [
            {
              code: '"get" in DoubleMap.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleMap.has': {
          tests: [
            {
              code: '"has" in DoubleMap.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleMap.keys': {
          tests: [
            {
              code: '"keys" in DoubleMap.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleMap.set': {
          tests: [
            {
              code: '"set" in DoubleMap.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleMap.size': {
          tests: [
            {
              code: '"size" in DoubleMap.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleMap.values': {
          tests: [
            {
              code: '"values" in DoubleMap.prototype',
              prefix: ''
            }
          ],
          category: 'api',
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
          tests: [
            {
              code: '"DoubleSet" in self',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleSet.add': {
          tests: [
            {
              code: '"add" in DoubleSet.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleSet.clear': {
          tests: [
            {
              code: '"clear" in DoubleSet.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleSet.delete': {
          tests: [
            {
              code: '"delete" in DoubleSet.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleSet.entries': {
          tests: [
            {
              code: '"entries" in DoubleSet.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleSet.has': {
          tests: [
            {
              code: '"has" in DoubleSet.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleSet.keys': {
          tests: [
            {
              code: '"keys" in DoubleSet.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleSet.size': {
          tests: [
            {
              code: '"size" in DoubleSet.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.DoubleSet.values': {
          tests: [
            {
              code: '"values" in DoubleSet.prototype',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
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
            }
          ],
          category: 'api',
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
          tests: [
            {
              code: '"CSS" in self',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.MessageChannel': {
          tests: [
            {
              code: '"MessageChannel" in self',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window', 'Worker']
        },
        'api.Worker': {
          tests: [
            {
              code: '"Worker" in self',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.WorkerSync': {
          tests: [
            {
              code: '"WorkerSync" in self',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Worker']
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
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.AudioNode.disconnect': {
          tests: [
            {
              code: '"disconnect" in AudioNode.prototype',
              prefix: ''
            }
          ],
          category: 'api',
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
          tests: [
            {
              code: '"CSS" in self',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.CSS.paintWorklet': {
          tests: [
            {
              code: '"paintWorklet" in CSS',
              prefix: ''
            }
          ],
          category: 'api',
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
          tests: [
            {
              code: '"CSS" in self',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.CSS.supports': {
          tests: [
            {
              code: '"supports" in CSS',
              prefix: ''
            }
          ],
          category: 'api',
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
          tests: [
            {
              code: '(function () {\n  var css = CSS;\n  return !!css;\n})();',
              prefix: ''
            }
          ],
          category: 'api',
          exposure: ['Window']
        },
        'api.CSS.paintWorklet': {
          tests: [
            {
              code: '(function () {\n  var css = CSS;\n  return css && \'paintWorklet\' in css;\n})();',
              prefix: ''
            }
          ],
          category: 'api',
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
        attribute object canvas;
        attribute object canvas;
      };

      interface WebGL2RenderingContext {
        attribute object canvas;
        attribute object canvas;
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

    assert.deepEqual(buildCSS(webrefCSS, bcd), {
      'css.properties.appearance': {
        tests: [
          {
            code: '"appearance" in document.body.style || CSS.supports("appearance", "inherit")',
            prefix: ''
          }
        ],
        category: 'css',
        exposure: ['Window']
      },
      'css.properties.font-family': {
        tests: [
          {
            code: '"fontFamily" in document.body.style || CSS.supports("font-family", "inherit")',
            prefix: ''
          }
        ],
        category: 'css',
        exposure: ['Window']
      },
      'css.properties.font-weight': {
        tests: [
          {
            code: '"fontWeight" in document.body.style || CSS.supports("font-weight", "inherit")',
            prefix: ''
          }
        ],
        category: 'css',
        exposure: ['Window']
      },
      'css.properties.grid': {
        tests: [
          {
            code: '"grid" in document.body.style || CSS.supports("grid", "inherit")',
            prefix: ''
          }
        ],
        category: 'css',
        exposure: ['Window']
      }
    });
  });
});
