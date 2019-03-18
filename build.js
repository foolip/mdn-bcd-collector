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

const fs = require('fs-extra');
const path = require('path');

const reports = require('./reffy-reports');

const generatedDir = path.join(__dirname, 'generated');

function writeText(filename, content) {
  if (Array.isArray(content)) {
    content = content.join('\n');
  }
  content = content.trimEnd() + '\n';
  fs.ensureDirSync(path.dirname(filename));
  fs.writeFileSync(filename, content, 'utf8');
}

function buildCSS() {
  const propertySet = new Set;

  for (const data of Object.values(reports.css)) {
    for (const prop of Object.keys(data.properties)) {
      propertySet.add(prop);
    }
  }

  const propertyNames = Array.from(propertySet);
  propertyNames.sort();

  const lines = [
    '<!DOCTYPE html>',
    '<meta charset="utf-8">',
    '<script src="/resources/json3.min.js"></script>',
    '<script src="/resources/harness.js"></script>',
    '<script>',
  ];
  for (const name of propertyNames) {
    lines.push(`bcd.test("css.properties.${name}", function() {`);
    lines.push(`  return CSS.supports("${name}", "inherit");`);
    lines.push(`});`);
  }
  lines.push('bcd.run();', '</script>');
  const pathname = path.join('css', 'properties', 'dot-supports.html');
  const filename = path.join(generatedDir, pathname);
  writeText(filename, lines);
  return [['http', pathname]];
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

function buildIDL() {
  const ast = flattenIDL(reports.idl);

  const interfaces = ast.filter((dfn) => dfn.type === 'interface');
  interfaces.sort((a, b) => a.name.localeCompare(b.name));

  const lines = [
    '<!DOCTYPE html>',
    '<meta charset="utf-8">',
    '<script src="/resources/json3.min.js"></script>',
    '<script src="/resources/harness.js"></script>',
    '<script>',
  ];
  for (const iface of interfaces) {
    const legacyNamespace = getExtAttr(iface, 'LegacyNamespace');
    if (legacyNamespace) {
      // TODO: handle WebAssembly, which is partly defined using Web IDL but is
      // under javascript.builtins.WebAssembly in BCD, not api.WebAssembly.
      continue;
    }

    const isGlobal = !!getExtAttr(iface, 'Global');

    // interface object
    lines.push(`bcd.test('api.${iface.name}', function() {`);
    lines.push(`  return '${iface.name}' in self;`);
    lines.push(`});`);

    // members
    function nameOf(member) {
      if (member.name) {
        return member.name;
      }
      if (member.body && member.body.name) {
        return member.body.name.value;
      }
      return undefined;
    }
    // TODO: iterable<>, maplike<>, setlike<> declarations are excluded
    // by filtering to things with names.
    const members = iface.members.filter(nameOf);
    members.sort((a, b) => nameOf(a).localeCompare(nameOf(b)));

    for (const member of members) {
      const isStatic = member.special && member.special.value === 'static';
      const name = nameOf(member);
      let expr;
      switch (member.type) {
        case 'attribute':
        case 'operation':
          if (isGlobal) {
            expr = `'${name}' in self`;
          } else if (isStatic) {
            expr = `'${name}' in ${iface.name}`;
          } else {
            expr = `'${name}' in ${iface.name}.prototype`;
          }
          break;
        case 'const':
          if (isGlobal) {
            expr = `'${name}' in self`;
          } else {
            expr = `'${name}' in ${iface.name}`;
          }
          break;
        default:
          // eslint-disable-next-line max-len
          console.warn(`Interface ${iface.name} member type ${member.type} not handled`);
      }

      lines.push(`bcd.test('api.${iface.name}.${name}', function() {`);
      lines.push(`  return ${expr};`);
      lines.push(`});`);
    }
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

async function build() {
  const manifest = {
    items: [],
  };
  for (const buildFunc of [buildCSS, buildIDL]) {
    const items = buildFunc();
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

build();
