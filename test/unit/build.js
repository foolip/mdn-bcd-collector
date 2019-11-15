// Copyright 2019 Google LLC
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
const assert = require('chai').assert;
const WebIDL2 = require('webidl2');

const {
  buildIDLTests,
  cssPropertyToIDLAttribute,
  collectCSSPropertiesFromBCD,
  collectCSSPropertiesFromReffy,
  expandCSSProperties,
  flattenIDL
} = require('../../build');

describe('build', () => {
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

    it('prefixed support', () => {
      const bcd = {
        css: {
          properties: {
            appearance: {
              __compat: {
                support: {
                  safari: {
                    prefix: '-webkit-'
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
      assert.deepEqual(properties, ['appearance', '-webkit-appearance']);
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

  describe('expandCSSProperties', () => {
    it('unprefixed input', () => {
      const propertySet = new Set(['foo']);
      expandCSSProperties(propertySet);
      const properties = Array.from(propertySet);
      assert.deepEqual(properties,
          ['foo', '-moz-foo', '-ms-foo', '-webkit-foo']);
    });

    it('unprefixed + prefixed input', () => {
      const propertySet = new Set(['foo', '-webkit-foo']);
      expandCSSProperties(propertySet);
      const properties = Array.from(propertySet);
      assert.deepEqual(properties,
          ['foo', '-webkit-foo', '-moz-foo', '-ms-foo']);
    });

    it('prefixed input', () => {
      const propertySet = new Set(['-moz-foo']);
      expandCSSProperties(propertySet);
      const properties = Array.from(propertySet);
      assert.deepEqual(properties,
          ['-moz-foo', 'foo', '-ms-foo', '-webkit-foo']);
    });
  });

  it('cssPropertyToIDLAttribute', () => {
    assert.equal(cssPropertyToIDLAttribute('line-height'), 'lineHeight');
    assert.equal(cssPropertyToIDLAttribute('-webkit-line-clamp', true),
        'webkitLineClamp');
  });

  describe('flattenIDL', () => {
    it('namespace + partial namespace', () => {
      const specIDL = {
        cssom: WebIDL2.parse(`namespace CSS { boolean supports(); };`),
        paint: WebIDL2.parse(
            `partial namespace CSS {
               readonly attribute any paintWorklet;
             };`)
      };
      const ast = flattenIDL(specIDL);
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
    });
  });

  describe('buildIDLTests', () => {
    it('interface with attribute', () => {
      const ast = WebIDL2.parse(`interface Attr { attribute any name; };`);
      assert.deepEqual(buildIDLTests(ast), [
        ['Attr', '\'Attr\' in self'],
        ['Attr.name', '\'name\' in Attr.prototype']
      ]);
    });

    it('interface with method', () => {
      const ast = WebIDL2.parse(
          `interface Node {
             boolean contains(Node? other);
           };`);
      assert.deepEqual(buildIDLTests(ast), [
        ['Node', '\'Node\' in self'],
        ['Node.contains', '\'contains\' in Node.prototype']
      ]);
    });

    it('interface with static method', () => {
      const ast = WebIDL2.parse(
          `interface MediaSource {
             static boolean isTypeSupported(DOMString type);
           };`);
      assert.deepEqual(buildIDLTests(ast), [
        ['MediaSource', '\'MediaSource\' in self'],
        ['MediaSource.isTypeSupported', '\'isTypeSupported\' in MediaSource']
      ]);
    });

    it('namespace with attribute', () => {
      const ast = WebIDL2.parse(
          `namespace CSS {
             readonly attribute any paintWorklet;
           };`);
      assert.deepEqual(buildIDLTests(ast), [
        ['CSS', '\'CSS\' in self'],
        ['CSS.paintWorklet', '\'paintWorklet\' in CSS']
      ]);
    });

    it('namespace with method', () => {
      const ast = WebIDL2.parse(
          `namespace CSS {
             boolean supports(CSSOMString property, CSSOMString value);
           };`);
      assert.deepEqual(buildIDLTests(ast), [
        ['CSS', '\'CSS\' in self'],
        ['CSS.supports', '\'supports\' in CSS']
      ]);
    });
  });
});
