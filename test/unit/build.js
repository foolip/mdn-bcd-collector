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
  flattenIDL,
} = require('../../build');

describe('build', () => {
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
             };`),
      };
      const ast = flattenIDL(specIDL);
      const namespaces = ast.filter((dfn) => dfn.type === 'namespace');
      assert.lengthOf(namespaces, 1);
      const [namespace] = namespaces;
      assert.equal(namespace.name, 'CSS');
      assert.lengthOf(namespace.members, 2);
      assert.containSubset(namespace.members[0], {
        type: 'operation',
        name: 'supports',
      });
      assert.containSubset(namespace.members[1], {
        type: 'attribute',
        name: 'paintWorklet',
      });
    });
  });

  describe('buildIDLTests', () => {
    it('interface with attribute', () => {
      const ast = WebIDL2.parse(`interface Attr { attribute any name; };`);
      assert.deepEqual(buildIDLTests(ast), [
        ['Attr', '\'Attr\' in self'],
        ['Attr.name', '\'name\' in Attr.prototype'],
      ]);
    });

    it('interface with method', () => {
      const ast = WebIDL2.parse(
          `interface Node {
             boolean contains(Node? other);
           };`);
      assert.deepEqual(buildIDLTests(ast), [
        ['Node', '\'Node\' in self'],
        ['Node.contains', '\'contains\' in Node.prototype'],
      ]);
    });

    it('interface with static method', () => {
      const ast = WebIDL2.parse(
          `interface MediaSource {
             static boolean isTypeSupported(DOMString type);
           };`);
      assert.deepEqual(buildIDLTests(ast), [
        ['MediaSource', '\'MediaSource\' in self'],
        ['MediaSource.isTypeSupported', '\'isTypeSupported\' in MediaSource'],
      ]);
    });

    it('namespace with attribute', () => {
      const ast = WebIDL2.parse(
          `namespace CSS {
             readonly attribute any paintWorklet;
           };`);
      assert.deepEqual(buildIDLTests(ast), [
        ['CSS', '\'CSS\' in self'],
        ['CSS.paintWorklet', '\'paintWorklet\' in CSS'],
      ]);
    });

    it('namespace with method', () => {
      const ast = WebIDL2.parse(
          `namespace CSS {
             boolean supports(CSSOMString property, CSSOMString value);
           };`);
      assert.deepEqual(buildIDLTests(ast), [
        ['CSS', '\'CSS\' in self'],
        ['CSS.supports', '\'supports\' in CSS'],
      ]);
    });
  });
});
