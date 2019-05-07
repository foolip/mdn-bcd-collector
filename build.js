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

const assert = require('assert');
const fs = require('fs-extra');
const path = require('path');

const generatedDir = path.join(__dirname, 'generated');

function writeText(filename, content) {
  if (Array.isArray(content)) {
    content = content.join('\n');
  }
  content = content.trimEnd() + '\n';
  fs.ensureDirSync(path.dirname(filename));
  fs.writeFileSync(filename, content, 'utf8');
}

function collectCSSPropertiesFromBCD(bcd, propertySet) {
  for (const [prop, data] of Object.entries(bcd.css.properties)) {
    propertySet.add(prop);
    if (!data.__compat) {
      // TODO: this misses stuff like css.properties['row-gap'].flex_content
      continue;
    }
    const support = data.__compat.support;
    if (!support) {
      continue;
    }
    function process(statement) {
      if (Array.isArray(statement)) {
        statement.forEach(process);
        return;
      }
      if (statement.alternative_name) {
        propertySet.add(statement.alternative_name);
      }
      if (statement.prefix) {
        propertySet.add(`${statement.prefix}${prop}`);
      }
    }
    for (const statement of Object.values(support)) {
      process(statement);
    }
  }
}

function collectCSSPropertiesFromReffy(reffy, propertySet) {
  for (const data of Object.values(reffy.css)) {
    for (const prop of Object.keys(data.properties)) {
      propertySet.add(prop);
    }
  }
}

// https://drafts.csswg.org/cssom/#css-property-to-idl-attribute
function cssPropertyToIDLAttribute(property, lowercaseFirst) {
  let output = '';
  let uppercaseNext = false;
  if (lowercaseFirst) {
    property = property.substr(1);
  }
  for (const c of property) {
    if (c === '-') {
      uppercaseNext = true;
    } else if (uppercaseNext) {
      uppercaseNext = false;
      output += c.toUpperCase();
    } else {
      output += c;
    }
  }
  return output;
}

function buildCSSPropertyTest(propertyNames, method, basename) {
  const lines = [
    '<!DOCTYPE html>',
    '<meta charset="utf-8">',
    '<script src="/resources/json3.min.js"></script>',
    '<script src="/resources/harness.js"></script>',
    '<body>',
    '<script>',
  ];
  for (const name of propertyNames) {
    lines.push(`bcd.test("css.properties.${name}", function() {`);
    if (method === 'CSSStyleDeclaration') {
      const attrName = cssPropertyToIDLAttribute(name, name.startsWith('-'));
      lines.push(`  return '${attrName}' in document.body.style;`);
    } else if (method === 'CSS.supports') {
      lines.push(`  return CSS.supports("${name}", "inherit");`);
    }
    lines.push(`});`);
  }
  lines.push('bcd.run();', '</script>');
  const pathname = path.join('css', 'properties', basename);
  const filename = path.join(generatedDir, pathname);
  writeText(filename, lines);
  return pathname;
}

function buildCSS(bcd, reffy) {
  const propertySet = new Set;
  collectCSSPropertiesFromBCD(bcd, propertySet);
  collectCSSPropertiesFromReffy(reffy, propertySet);

  const propertyNames = Array.from(propertySet);
  propertyNames.sort();

  return [
    ['http', buildCSSPropertyTest(propertyNames,
        'CSSStyleDeclaration', 'in-style.html')],
    ['http', buildCSSPropertyTest(propertyNames,
        'CSS.supports', 'dot-supports.html')],
  ];
}

function flattenIDL(specIDL) {
  let ast = [];

  for (const idl of Object.values(specIDL)) {
    ast.push(...idl);
  }

  // merge partials (O^2 but still fast)
  ast = ast.filter((dfn) => {
    if (!dfn.partial) {
      return true;
    }

    const target = ast.find((it) => !it.partial &&
                                    it.type === dfn.type &&
                                    it.name === dfn.name);
    if (!target) {
      // eslint-disable-next-line max-len
      throw new Error(`Original definition not found for partial ${dfn.type} ${dfn.name}`);
    }

    // move members to target interface/dictionary/etc. and drop partial
    target.members.push(...dfn.members);
    return false;
  });

  // mix in the mixins
  for (const dfn of ast) {
    if (dfn.type === 'includes') {
      const mixin = ast.find((it) => !it.partial &&
                                     it.type === 'interface mixin' &&
                                     it.name === dfn.includes);
      if (!mixin) {
        // eslint-disable-next-line max-len
        throw new Error(`Interface mixin ${dfn.includes} not found for target ${dfn.target}`);
      }
      const target = ast.find((it) => !it.partial &&
                                      it.type === 'interface' &&
                                      it.name === dfn.target);
      if (!target) {
        // eslint-disable-next-line max-len
        throw new Error(`Target ${dfn.target} not found for interface mixin ${dfn.includes}`);
      }

      // move members to target interface
      target.members.push(...mixin.members);
    }
  }

  // drop includes and mixins
  ast = ast.filter((dfn) => dfn.type !== 'includes' &&
                            dfn.type !== 'interface mixin');

  return ast;
}

function getExtAttr(node, name) {
  if (!node.extAttrs) {
    return null;
  }
  return node.extAttrs.items.find((i) => i.name === name);
}

// https://heycam.github.io/webidl/#dfn-exposure-set
function getExposureSet(node) {
  // step 6-8
  assert(['interface', 'namespace'].includes(node.type));
  const attr = getExtAttr(node, 'Exposed');
  if (!attr) {
    // TODO: remove this once all interfaces have [Exposed].
    return new Set(['Window']);
  }
  const globals = new Set;
  switch (attr.rhs.type) {
    case 'identifier':
      globals.add(attr.rhs.value);
      break;
    case 'identifier-list':
      for (const {value} of attr.rhs.value) {
        globals.add(value);
      }
      break;
    default:
      assert.fail(`Unexpected RHS for Exposed extended attribute`);
  }
  return globals;
}

function buildIDLTests(ast) {
  const tests = [];

  const interfaces = ast.filter((dfn) => dfn.type === 'interface');
  interfaces.sort((a, b) => a.name.localeCompare(b.name));

  for (const iface of interfaces) {
    const legacyNamespace = getExtAttr(iface, 'LegacyNamespace');
    if (legacyNamespace) {
      // TODO: handle WebAssembly, which is partly defined using Web IDL but is
      // under javascript.builtins.WebAssembly in BCD, not api.WebAssembly.
      continue;
    }

    const exposureSet = getExposureSet(iface);
    if (!exposureSet.has('Window')) {
      // TODO: run test in other global scopes as well
      continue;
    }

    const isGlobal = !!getExtAttr(iface, 'Global');

    // interface object
    tests.push([iface.name, `'${iface.name}' in self`]);

    // members
    // TODO: iterable<>, maplike<>, setlike<> declarations are excluded
    // by filtering to things with names.
    const members = iface.members.filter((member) => member.name);
    members.sort((a, b) => a.name.localeCompare(b.name));

    for (const member of members) {
      const isStatic = member.special === 'static';
      let expr;
      switch (member.type) {
        case 'attribute':
        case 'operation':
          if (isGlobal) {
            expr = `'${member.name}' in self`;
          } else if (isStatic) {
            expr = `'${member.name}' in ${iface.name}`;
          } else {
            expr = `'${member.name}' in ${iface.name}.prototype`;
          }
          break;
        case 'const':
          if (isGlobal) {
            expr = `'${member.name}' in self`;
          } else {
            expr = `'${member.name}' in ${iface.name}`;
          }
          break;
      }

      if (expr) {
        tests.push([`${iface.name}.${member.name}`, expr]);
      } else {
        // eslint-disable-next-line max-len
        console.warn(`Interface ${iface.name} member type ${member.type} not handled`);
      }
    }
  }

  const namespaces = ast.filter((dfn) => dfn.type === 'namespace');
  namespaces.sort((a, b) => a.name.localeCompare(b.name));

  for (const namespace of namespaces) {
    const exposureSet = getExposureSet(namespace);
    if (!exposureSet.has('Window')) {
      // TODO: run test in other global scopes as well
      continue;
    }

    // namespace object
    tests.push([namespace.name, `'${namespace.name}' in self`]);

    // members
    const members = namespace.members.filter((member) => member.name);
    members.sort((a, b) => a.name.localeCompare(b.name));

    for (const member of members) {
      tests.push([`${namespace.name}.${member.name}`,
        `'${member.name}' in ${namespace.name}`]);
    }
  }

  return tests;
}

function buildIDL(_, reffy) {
  const ast = flattenIDL(reffy.idl);
  const tests = buildIDLTests(ast);

  const lines = [
    '<!DOCTYPE html>',
    '<meta charset="utf-8">',
    '<script src="/resources/json3.min.js"></script>',
    '<script src="/resources/harness.js"></script>',
    '<script>',
  ];

  for (const [name, expr] of tests) {
    lines.push(`bcd.test('api.${name}', function() {`);
    lines.push(`  return ${expr};`);
    lines.push(`});`);
  }

  lines.push('bcd.run();', '</script>');
  const pathname = path.join('api', 'interfaces.html');
  const filename = path.join(generatedDir, pathname);
  writeText(filename, lines);
  return [['http', pathname], ['https', pathname]];
}

async function writeManifest(manifest) {
  manifest.items.sort((a, b) => {
    return a.pathname.localeCompare(b.pathname) ||
           a.protocol.localeCompare(b.protocol);
  });
  writeText('MANIFEST.json', JSON.stringify(manifest, null, '  '));
}

function copyResources() {
  const resources = [
    ['json3/lib/json3.min.js', 'resources'],
    ['chai/chai.js', 'test'],
    ['mocha/mocha.css', 'test'],
    ['mocha/mocha.js', 'test'],
  ];
  for (const [srcInModules, destInGenerated] of resources) {
    const src = require.resolve(srcInModules);
    const destDir = path.join(generatedDir, destInGenerated);
    const dest = path.join(destDir, path.basename(src));
    fs.ensureDirSync(path.dirname(dest));
    fs.copyFileSync(src, dest);
  }
}

async function build(bcd, reffy) {
  const manifest = {
    items: [],
  };
  for (const buildFunc of [buildCSS, buildIDL]) {
    const items = buildFunc(bcd, reffy);
    for (let [protocol, pathname] of items) {
      if (!pathname.startsWith('/')) {
        pathname = `/${pathname}`;
      }
      manifest.items.push({pathname, protocol});
    }
  }
  await writeManifest(manifest);
  copyResources();
}

/* istanbul ignore else */
if (process.env.NODE_ENV === 'test') {
  module.exports = {
    buildIDLTests,
    cssPropertyToIDLAttribute,
    flattenIDL,
  };
} else {
  const bcd = require('mdn-browser-compat-data');
  const reffy = require('./reffy-reports');
  build(bcd, reffy);
}
