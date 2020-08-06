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
const assert = require('chai').assert;
const WebIDL2 = require('webidl2');
const fs = require('fs');

const {
  writeText,
  loadCustomTests,
  getCustomTestAPI,
  buildIDLTests,
  cssPropertyToIDLAttribute,
  collectCSSPropertiesFromBCD,
  collectCSSPropertiesFromReffy,
  flattenIDL
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

    afterEach(() => {fs.unlinkSync(filepath)});
  });

  describe('getCustomTestAPI', () => {
    describe('no custom tests', () => {
      beforeEach(() => {loadCustomTests({api: {}, css: {}})});

      it('interface', () => {
        assert.equal(getCustomTestAPI('foo'), false);
      });

      it('member', () => {
        assert.equal(getCustomTestAPI('foo', 'bar'), false);
      });
    });

    describe('custom test for interface only', () => {
      beforeEach(() => {loadCustomTests({
        api: {
          'foo': {
            '__base': 'var a = 1;',
            '__test': 'return a;'
          }
        },
        css: {}
      })});

      it('interface', () => {
        assert.equal(getCustomTestAPI('foo'), '(function() {var a = 1;return a;})()');
      });

      it('member', () => {
        assert.equal(getCustomTestAPI('foo', 'bar'), false);
      });
    });

    describe('custom test for member only', () => {
      beforeEach(() => {loadCustomTests({
        api: {
          'foo': {
            '__base': 'var a = 1;',
            'bar': 'return a + 1;'
          }
        },
        css: {}
      })});

      it('interface', () => {
        assert.equal(getCustomTestAPI('foo'), false);
      });

      it('member', () => {
        assert.equal(getCustomTestAPI('foo', 'bar'), '(function() {var a = 1;return a + 1;})()');
      });
    });

    describe('custom test for member only, no __base', () => {
      beforeEach(() => {loadCustomTests({
        api: {
          'foo': {
            'bar': 'return 1 + 1;'
          }
        },
        css: {}
      })});

      it('interface', () => {
        assert.equal(getCustomTestAPI('foo'), false);
      });

      it('member', () => {
        assert.equal(getCustomTestAPI('foo', 'bar'), '(function() {return 1 + 1;})()');
      });
    });

    describe('custom test for interface and member', () => {
      beforeEach(() => {loadCustomTests({
        api: {
          'foo': {
            '__base': 'var a = 1;',
            '__test': 'return a;',
            'bar': 'return a + 1;'
          }
        },
        css: {}
      })});

      it('interface', () => {
        assert.equal(getCustomTestAPI('foo'), '(function() {var a = 1;return a;})()');
      });

      it('member', () => {
        assert.equal(getCustomTestAPI('foo', 'bar'), '(function() {var a = 1;return a + 1;})()');
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
    it('namespace + partial namespace', () => {
      const specIDLs = {
        cssom: WebIDL2.parse(`namespace CSS { boolean supports(); };`),
        paint: WebIDL2.parse(
            `partial namespace CSS {
               readonly attribute any paintWorklet;
             };`)
      };
      const historicalIDL = WebIDL2.parse(`interface DOMError {};`);
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

    it('interface with custom test', () => {
      const ast = WebIDL2.parse(
          `interface ANGLE_instanced_arrays {
            void drawArraysInstancedANGLE(GLenum mode, GLint first, GLsizei count, GLsizei primcount);
          };`);
      loadCustomTests({
        "api": {
          "ANGLE_instanced_arrays": {
            "__base": "var canvas = document.createElement('canvas'); var gl = canvas.getContext('webgl'); var a = gl.getExtension('ANGLE_instanced_arrays');",
            "__test": "return !!a;",
            "drawArraysInstancedANGLE": "return a && 'drawArraysInstancedANGLE' in a;"
          }
        },
        "css": {}
      });
      assert.deepEqual(buildIDLTests(ast), [
        ['ANGLE_instanced_arrays', "(function() {var canvas = document.createElement('canvas'); var gl = canvas.getContext('webgl'); var a = gl.getExtension('ANGLE_instanced_arrays');return !!a;})()"],
        ['ANGLE_instanced_arrays.drawArraysInstancedANGLE', "(function() {var canvas = document.createElement('canvas'); var gl = canvas.getContext('webgl'); var a = gl.getExtension('ANGLE_instanced_arrays');return a && 'drawArraysInstancedANGLE' in a;})()"]
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
  });
});
