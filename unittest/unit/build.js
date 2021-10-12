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

import chai, {assert, expect} from 'chai';
import chaiSubset from 'chai-subset';
chai.use(chaiSubset);

import * as WebIDL2 from 'webidl2';
import sinon from 'sinon';

import {
  flattenIDL,
  getExposureSet,
  compileTestCode,
  compileTest,
  validateIDL,
  buildIDLTests,
  buildIDL,
  getCustomTestAPI,
  getCustomSubtestsAPI,
  getCustomResourcesAPI,
  cssPropertyToIDLAttribute,
  buildCSS,
  getCustomTestCSS
} from '../../build.js';

describe('build', () => {
  describe('getCustomTestAPI', () => {
    beforeEach(() => {
      sinon.stub(console, 'error');
    });

    describe('no custom tests', () => {
      it('interface', () => {
        assert.equal(getCustomTestAPI('nonexistent'), false);
      });

      it('member', () => {
        assert.equal(getCustomTestAPI('nonexistent', 'ghost'), false);
      });
    });

    describe('custom test for interface and member', () => {
      it('interface', () => {
        assert.equal(
          getCustomTestAPI('foo'),
          '(function () {\n  var instance = 1;\n  return instance + 4;\n})();'
        );
      });

      it('member (custom)', () => {
        assert.equal(
          getCustomTestAPI('foo', 'bar'),
          '(function () {\n  var instance = 1;\n  return 1 + 1;\n})();'
        );
      });

      it('member (default)', () => {
        assert.equal(
          getCustomTestAPI('foo', 'baz'),
          "(function () {\n  var instance = 1;\n  return 'baz' in instance;\n})();"
        );
      });

      it('constructor', () => {
        assert.equal(getCustomTestAPI('foo', 'foo', 'constructor'), false);
      });
    });

    describe('custom test for interface only, no base', () => {
      it('interface', () => {
        assert.equal(
          getCustomTestAPI('fig'),
          '(function () {\n  return 2;\n})();'
        );
      });

      it('member', () => {
        assert.equal(getCustomTestAPI('fig', 'ghost'), false);
      });
    });

    describe('custom test for member only', () => {
      it('interface', () => {
        assert.equal(
          getCustomTestAPI('apple'),
          '(function () {\n  var a = 1;\n  return !!instance;\n})();'
        );
      });

      it('member', () => {
        assert.equal(
          getCustomTestAPI('apple', 'bar'),
          '(function () {\n  var a = 1;\n  return a + 3;\n})();'
        );
      });
    });

    it('custom test with invalid syntax', () => {
      assert.include(getCustomTestAPI('invalid'), "throw 'Test is malformed:");
      assert.include(
        getCustomTestAPI('invalid', 'ghost'),
        "throw 'Test is malformed:"
      );
      assert.isTrue(console.error.calledTwice);
    });

    describe('promise-based custom tests', () => {
      it('interface', () => {
        assert.equal(
          getCustomTestAPI('promise'),
          '(function () {\n  var promise = somePromise();\n  return promise.then(function (instance) {\n    return !!instance;\n  });\n})();'
        );
      });

      it('member', () => {
        assert.equal(
          getCustomTestAPI('promise', 'bar'),
          "(function () {\n  var promise = somePromise();\n  return promise.then(function (instance) {\n    return 'bar' in instance;\n  });\n})();"
        );
      });

      it('interface with import', () => {
        assert.equal(
          getCustomTestAPI('newpromise'),
          '(function () {\n  var p = somePromise();\n  if (!p) {\n    return false;\n  }\n  var promise = p.then(function () {});\n  return promise.then(function (instance) {\n    return !!instance;\n  });\n})();'
        );
      });
    });

    describe('import other test', () => {
      it('valid import', () => {
        assert.equal(
          getCustomTestAPI('import1'),
          '(function () {\n  var a = 1;\n  if (!a) {\n    return false;\n  }\n  var instance = a;\n  return !!instance;\n})();'
        );

        assert.equal(
          getCustomTestAPI('import2'),
          '(function () {\n  var a = 1;\n  if (!a) {\n    return false;\n  }\n  var b = a;\n  if (!b) {\n    return false;\n  }\n  var instance = b;\n  return !!instance;\n})();'
        );
      });

      it('valid import: import is instance', () => {
        assert.equal(
          getCustomTestAPI('straightimport'),
          '(function () {\n  var instance = 1;\n  return !!instance;\n})();'
        );
      });

      it('invalid import', () => {
        assert.equal(
          getCustomTestAPI('badimport'),
          "(function () {\n  throw 'Test is malformed: <%api.foobar:apple%> is an invalid reference';\n  return !!instance;\n})();"
        );
        assert.isTrue(console.error.calledOnce);
      });
    });

    afterEach(() => {
      console.error.restore();
    });
  });

  describe('getCustomSubtestsAPI', () => {
    it('get subtests', () => {
      assert.deepEqual(getCustomSubtestsAPI('foo', 'bar'), {
        multiple:
          '(function () {\n  var instance = 1;\n  return 1 + 1 + 1;\n})();',
        'one.only': '(function () {\n  var instance = 1;\n  return 1;\n})();'
      });
    });
  });

  describe('getCustomResourcesAPI', () => {
    it('get resources', () => {
      assert.deepEqual(getCustomResourcesAPI('audiocontext'), {
        'audio-blip': {
          type: 'audio',
          src: ['/media/blip.mp3', '/media/blip.ogg']
        }
      });

      assert.deepEqual(getCustomResourcesAPI('WebGLRenderingContext'), {
        webGL: {
          type: 'instance',
          src: "var canvas = document.createElement('canvas');\nif (!canvas) {\n  return false;\n}\nreturn (\n  canvas.getContext('webgl2') ||\n  canvas.getContext('webgl') ||\n  canvas.getContext('experimental-webgl')\n);"
        }
      });
    });

    it('no resources', () => {
      assert.deepEqual(getCustomResourcesAPI('foo'), {});
    });

    it('try to get invalid resource', () => {
      assert.throws(
        () => {
          getCustomResourcesAPI('badresource');
        },
        Error,
        'Resource bad-resource is not defined but referenced in api.badresource'
      );
    });
  });

  describe('getCustomTestCSS', () => {
    it('no custom tests', () => {
      assert.equal(getCustomTestCSS('ghost'), false);
    });

    it('custom test for property', () => {
      assert.equal(
        getCustomTestCSS('foo'),
        '(function () {\n  return 1;\n})();'
      );
    });

    it('import (not implemented)', () => {
      assert.equal(
        getCustomTestCSS('bar'),
        "(function () {\n  throw 'Test is malformed: import <%css.properties.foo:a%>, category css is not importable';\n})();"
      );
    });
  });

  describe('compileTestCode', () => {
    it('string', () => {
      assert.equal(compileTestCode('a string'), 'a string');
    });

    it('constructor', () => {
      const test = {
        property: 'constructor.AudioContext',
        owner: 'AudioContext'
      };
      assert.equal(
        compileTestCode(test),
        'bcd.testConstructor("AudioContext");'
      );
    });

    it('Symbol', () => {
      const test = {property: 'Symbol.iterator', owner: 'DOMMatrixReadOnly'};
      assert.equal(
        compileTestCode(test),
        '"Symbol" in self && "iterator" in Symbol && Symbol.iterator in DOMMatrixReadOnly.prototype'
      );
    });

    it('namespace', () => {
      const test = {property: 'log', owner: 'console'};
      assert.equal(compileTestCode(test), '"log" in console');
    });

    it('constructor', () => {
      const test = {
        property: 'm11',
        owner: 'DOMMatrix.prototype',
        inherit: true
      };
      assert.equal(
        compileTestCode(test),
        'Object.prototype.hasOwnProperty.call(DOMMatrix.prototype, "m11")'
      );
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
        resources: {
          'audio-blip': {
            type: 'audio',
            src: ['/media/blip.mp3', '/media/blip.ogg']
          }
        },
        exposure: ['Window']
      };

      assert.deepEqual(compileTest(rawTest), {
        code: '"Document" in self && "body" in Document.prototype',
        exposure: ['Window'],
        resources: {
          'audio-blip': {
            type: 'audio',
            src: ['/media/blip.mp3', '/media/blip.ogg']
          }
        }
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
            code: ['true', 'true'],
            combinator: '||'
          },
          resources: {},
          exposure: ['Window']
        },
        {
          raw: {
            code: ['true', 'true'],
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
            {property: 'font-family', owner: 'document.body.style'}
          ],
          combinator: '||'
        },
        resources: {},
        exposure: ['Window']
      };

      assert.deepEqual(compileTest(rawTest), {
        code: '"fontFamily" in document.body.style || "font-family" in document.body.style',
        exposure: ['Window']
      });
    });
  });

  it('cssPropertyToIDLAttribute', () => {
    assert.equal(cssPropertyToIDLAttribute('line-height'), 'lineHeight');
    assert.equal(
      cssPropertyToIDLAttribute('-webkit-line-clamp', true),
      'webkitLineClamp'
    );
  });

  it('buildIDL', () => {
    const specIDLs = {
      first: WebIDL2.parse(`[Exposed=Window] interface DOMError {};`),
      second: WebIDL2.parse(`[Exposed=Window] interface XSLTProcessor {};`)
    };

    const customIDLs = {
      second: WebIDL2.parse(
        `partial interface XSLTProcessor { undefined reset(); };`
      )
    };

    const tests = buildIDL(specIDLs, customIDLs);
    assert.containsAllKeys(tests, ['api.XSLTProcessor.reset']);
  });

  describe('flattenIDL', () => {
    const customIDLs = {
      first: WebIDL2.parse(`[Exposed=Window] interface DOMError {};`),
      second: WebIDL2.parse(`[Exposed=Window] interface XSLTProcessor {};`)
    };

    it('interface + mixin', () => {
      const specIDLs = {
        first: WebIDL2.parse(
          `[Exposed=Window]
             interface DummyError : Error {
               readonly attribute boolean imadumdum;
             };`
        ),
        second: WebIDL2.parse(
          `[Exposed=Window]
             interface mixin DummyErrorHelper {
               DummyError geterror();
             };

             DummyError includes DummyErrorHelper;`
        )
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
        cssom: WebIDL2.parse(
          `[Exposed=Window]
             namespace CSS {
               boolean supports();
             };`
        ),
        paint: WebIDL2.parse(
          `partial namespace CSS {
               readonly attribute any paintWorklet;
             };`
        )
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

    it('WindowOrWorkerGlobalScope remains separate', () => {
      const specIDLs = {
        first: WebIDL2.parse(
          `[Exposed=Window]
             interface Window {
               readonly attribute boolean imadumdum;
             };`
        ),
        second: WebIDL2.parse(
          `[Exposed=Window]
             interface mixin WindowOrWorkerGlobalScope {
               undefined atob();
             };

             Window includes WindowOrWorkerGlobalScope;`
        )
      };
      const interfaces = flattenIDL(specIDLs, customIDLs);
      assert.lengthOf(interfaces, 4);

      assert.equal(interfaces[0].name, 'Window');
      assert.lengthOf(interfaces[0].members, 1);
      assert.containSubset(interfaces[0].members[0], {
        type: 'attribute',
        name: 'imadumdum'
      });

      assert.equal(interfaces[1].name, 'WindowOrWorkerGlobalScope');
      assert.lengthOf(interfaces[1].members, 1);
      assert.containSubset(interfaces[1].members[0], {
        type: 'operation',
        name: 'atob'
      });

      assert.equal(interfaces[2].name, 'DOMError');
      assert.equal(interfaces[3].name, 'XSLTProcessor');
    });

    it('mixin missing', () => {
      const specIDLs = {
        first: WebIDL2.parse(
          `interface mixin DummyErrorHelper {
               DummyError geterror();
             };`
        ),
        secnd: WebIDL2.parse(`DummyError includes DummyErrorHelper;`)
      };

      expect(() => {
        flattenIDL(specIDLs, customIDLs);
      }).to.throw(
        'Target DummyError not found for interface mixin DummyErrorHelper'
      );
    });

    it('interface missing', () => {
      const specIDLs = {
        first: WebIDL2.parse(
          `[Exposed=Window]
             interface DummyError : Error {
               readonly attribute boolean imadumdum;
             };`
        ),
        secnd: WebIDL2.parse(`DummyError includes DummyErrorHelper;`)
      };

      expect(() => {
        flattenIDL(specIDLs, customIDLs);
      }).to.throw(
        'Interface mixin DummyErrorHelper not found for target DummyError'
      );
    });

    it('Operation overloading', () => {
      const specIDLs = {
        cssom: WebIDL2.parse(
          `[Exposed=Window]
             namespace CSS {
               boolean supports();
             };`
        ),
        paint: WebIDL2.parse(
          `partial namespace CSS {
               readonly attribute any paintWorklet;
             };`
        ),
        paint2: WebIDL2.parse(
          `partial namespace CSS {
               boolean supports();
             };`
        )
      };
      expect(() => {
        flattenIDL(specIDLs, customIDLs);
      }).to.throw('Duplicate definition of CSS.supports');
    });

    it('Partial missing main', () => {
      const specIDLs = {
        paint: WebIDL2.parse(
          `partial namespace CSS {
               readonly attribute any paintWorklet;
             };`
        )
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
        first: WebIDL2.parse(
          `interface Dummy {
               readonly attribute boolean imadumdum;
             };`
        )
      };
      const ast = flattenIDL(specIDLs, customIDLs);
      const interfaces = ast.filter((dfn) => dfn.type === 'interface');
      assert.throws(
        () => {
          getExposureSet(interfaces[0]);
        },
        Error,
        'Exposed extended attribute not found on interface Dummy'
      );
    });

    it('single exposure', () => {
      const specIDLs = {
        first: WebIDL2.parse(
          `[Exposed=Worker]
             interface Dummy {
               readonly attribute boolean imadumdum;
             };`
        )
      };
      const ast = flattenIDL(specIDLs, customIDLs);
      const interfaces = ast.filter((dfn) => dfn.type === 'interface');
      const exposureSet = getExposureSet(interfaces[0]);
      assert.hasAllKeys(exposureSet, ['Worker']);
    });

    it('multiple exposure', () => {
      const specIDLs = {
        first: WebIDL2.parse(
          `[Exposed=(Window,Worker)]
             interface Dummy {
               readonly attribute boolean imadumdum;
             };`
        )
      };
      const ast = flattenIDL(specIDLs, customIDLs);
      const interfaces = ast.filter((dfn) => dfn.type === 'interface');
      const exposureSet = getExposureSet(interfaces[0]);
      assert.hasAllKeys(exposureSet, ['Window', 'Worker']);
    });

    it('exposed to DedicatedWorker', () => {
      const specIDLs = {
        first: WebIDL2.parse(
          `[Exposed=DedicatedWorker]
             interface Dummy {
               readonly attribute boolean imadumdum;
             };`
        )
      };
      const ast = flattenIDL(specIDLs, customIDLs);
      const interfaces = ast.filter((dfn) => dfn.type === 'interface');
      const exposureSet = getExposureSet(interfaces[0]);
      assert.hasAllKeys(exposureSet, ['Worker']);
    });
  });

  describe('buildIDLTests', () => {
    it('interface with attribute', () => {
      const ast = WebIDL2.parse(
        `[Exposed=Window]
           interface Attr {
             attribute any name;
           };`
      );
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
        `[Exposed=Window]
           interface Node {
             boolean contains(Node? other);
           };`
      );
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
        `[Exposed=Window]
           interface MediaSource {
             static boolean isTypeSupported(DOMString type);
           };`
      );

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
        `[Exposed=Window]
           interface Window {
             const boolean isWindow = true;
           };`
      );

      assert.deepEqual(buildIDLTests(ast), {
        'api.Window': {
          code: '"Window" in self',
          exposure: ['Window']
        }
      });
    });

    it('interface with custom test', () => {
      const ast = WebIDL2.parse(
        `[Exposed=Window]
           interface ANGLE_instanced_arrays {
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

          [Exposed=Window]
          interface Document {
            readonly attribute boolean loaded;
            readonly attribute DOMString? charset;
          };`
      );

      assert.deepEqual(buildIDLTests(ast), {
        'api.ANGLE_instanced_arrays': {
          code: "(function () {\n  var canvas = document.createElement('canvas');\n  var gl = canvas.getContext('webgl');\n  var instance = gl.getExtension('ANGLE_instanced_arrays');\n  return !!instance;\n})();",
          exposure: ['Window']
        },
        'api.ANGLE_instanced_arrays.drawArraysInstancedANGLE': {
          code: "(function () {\n  var canvas = document.createElement('canvas');\n  var gl = canvas.getContext('webgl');\n  var instance = gl.getExtension('ANGLE_instanced_arrays');\n  return true && instance && 'drawArraysInstancedANGLE' in instance;\n})();",
          exposure: ['Window']
        },
        'api.ANGLE_instanced_arrays.drawElementsInstancedANGLE': {
          code: "(function () {\n  var canvas = document.createElement('canvas');\n  var gl = canvas.getContext('webgl');\n  var instance = gl.getExtension('ANGLE_instanced_arrays');\n  return 'drawElementsInstancedANGLE' in instance;\n})();",
          exposure: ['Window']
        },
        'api.Document': {
          code: '"Document" in self',
          exposure: ['Window']
        },
        'api.Document.charset': {
          code: "(function () {\n  return document.charset == 'UTF-8';\n})();",
          exposure: ['Window']
        },
        'api.Document.loaded': {
          code: '"loaded" in Document.prototype',
          exposure: ['Window']
        },
        'api.Document.loaded.loaded_is_boolean': {
          code: "(function () {\n  return typeof document.loaded === 'boolean';\n})();",
          exposure: ['Window']
        }
      });
    });

    it('interface with legacy namespace', () => {
      const ast = WebIDL2.parse(
        `[Exposed=Window, LegacyNamespace]
           interface Legacy {};`
      );
      assert.deepEqual(buildIDLTests(ast), {});
    });

    it('global interface', () => {
      const ast = WebIDL2.parse(
        `[Exposed=Worker, Global=Worker]
           interface WorkerGlobalScope {
             attribute boolean isLoaded;
             const boolean active = true;
           };`
      );

      assert.deepEqual(buildIDLTests(ast), {
        'api.WorkerGlobalScope': {
          code: '"WorkerGlobalScope" in self',
          exposure: ['Worker']
        },
        'api.WorkerGlobalScope.isLoaded': {
          code: '"isLoaded" in self',
          exposure: ['Worker']
        }
      });
    });

    it('interface with constructor operation', () => {
      const ast = WebIDL2.parse(
        `[Exposed=Window]
           interface Number {
             constructor(optional any value);
           };`
      );

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
      const ast = WebIDL2.parse(
        `[Exposed=Window]
           interface DoubleList {
             iterable<double>;
           };`
      );
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
      const ast = WebIDL2.parse(
        `[Exposed=Window]
           interface DoubleMap {
             maplike<DOMString, double>;
           };`
      );
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
      const ast = WebIDL2.parse(
        `[Exposed=Window]
           interface DoubleSet {
             setlike<double>;
           };`
      );
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
      const ast = WebIDL2.parse(
        `[Exposed=Window]
           interface GetMe {
             getter GetMe (unsigned long index);
             setter undefined (GetMe data, optional unsigned long index);
           };`
      );
      assert.deepEqual(buildIDLTests(ast), {
        'api.GetMe': {
          code: '"GetMe" in self',
          exposure: ['Window']
        }
      });
    });

    it('varied exposure', () => {
      const ast = WebIDL2.parse(
        `[Exposed=Window] interface Worker {};
           [Exposed=Worker] interface WorkerSync {};
           [Exposed=(Window,Worker)] interface MessageChannel {};
           [Exposed=Window] namespace console {};`
      );
      assert.deepEqual(buildIDLTests(ast), {
        'api.console': {
          code: '"console" in self',
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

    it('interface with stringifier', () => {
      const ast = WebIDL2.parse(
        `[Exposed=Window]
           interface Number {
             stringifier DOMString();
           };`
      );

      assert.deepEqual(buildIDLTests(ast), {
        'api.Number': {
          code: '"Number" in self',
          exposure: ['Window']
        },
        'api.Number.toString': {
          code: '"toString" in Number.prototype',
          exposure: ['Window']
        }
      });
    });

    it('operator variations', () => {
      const ast = WebIDL2.parse(
        `[Exposed=Window]
           interface AudioNode : EventTarget {
             undefined disconnect ();
             undefined disconnect (unsigned long output);
             undefined disconnect (AudioNode destinationNode);
           };`
      );
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
        `[Exposed=Window]
           namespace CSS {
             readonly attribute any paintWorklet;
           };`
      );
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
        `[Exposed=Window]
           namespace CSS {
             boolean supports(CSSOMString property, CSSOMString value);
           };`
      );
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
        `[Exposed=Window]
           namespace Scope {
             readonly attribute any specialWorklet;
           };`
      );

      assert.deepEqual(buildIDLTests(ast), {
        'api.Scope': {
          code: '(function () {\n  var scope = Scope;\n  return !!scope;\n})();',
          exposure: ['Window']
        },
        'api.Scope.specialWorklet': {
          code: "(function () {\n  var scope = Scope;\n  return scope && 'specialWorklet' in scope;\n})();",
          exposure: ['Window']
        }
      });
    });

    it('interface with legacy factory function', () => {
      const ast = WebIDL2.parse(
        `[
             Exposed=Window,
             LegacyFactoryFunction=Image(DOMString src)
           ]
           interface HTMLImageElement {};`
      );

      assert.deepEqual(buildIDLTests(ast), {
        'api.HTMLImageElement': {
          code: '"HTMLImageElement" in self',
          exposure: ['Window']
        },
        'api.HTMLImageElement.Image': {
          code: 'bcd.testConstructor("Image");',
          exposure: ['Window']
        }
      });
    });

    it('WindowOrWorkerGlobalScope remains separate', () => {
      const ast = WebIDL2.parse(
        `[Exposed=Window]
           interface Window {
             readonly attribute boolean imadumdum;
           };

           [Exposed=Window]
           interface mixin WindowOrWorkerGlobalScope {
             undefined atob();
           };

           Window includes WindowOrWorkerGlobalScope;`
      );

      assert.deepEqual(buildIDLTests(ast), {
        'api.Window': {
          code: '"Window" in self',
          exposure: ['Window']
        },
        'api.Window.imadumdum': {
          code: '"imadumdum" in Window.prototype',
          exposure: ['Window']
        },
        'api.atob': {
          code: '"atob" in self',
          exposure: ['Window', 'Worker']
        }
      });
    });
  });

  describe('validateIDL', () => {
    it('valid idl', () => {
      const ast = WebIDL2.parse(
        `[Exposed=Window]
           interface Node {
             boolean contains(Node otherNode);
           };`
      );
      expect(() => {
        validateIDL(ast);
      }).to.not.throw();
    });

    it('unknown types', () => {
      const ast = WebIDL2.parse(
        `[Exposed=Window]
           interface Dummy {
             attribute Dumdum imadumdum;
           };`
      );
      expect(() => {
        validateIDL(ast);
      }).to.throw();
    });

    it('ignored unknown types', () => {
      const ast = WebIDL2.parse(
        `[Exposed=Window]
           interface Dummy {
             attribute CSSOMString style;
           };`
      );
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
        code: '"fontFamily" in document.body.style || "font-family" in document.body.style',
        exposure: ['Window']
      },
      'css.properties.font-weight': {
        code: '"fontWeight" in document.body.style || "font-weight" in document.body.style',
        exposure: ['Window']
      },
      'css.properties.grid': {
        code: '"grid" in document.body.style',
        exposure: ['Window']
      },
      'css.properties.zoom': {
        code: '"zoom" in document.body.style',
        exposure: ['Window']
      }
    });
  });
});
