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
const WebIDL2 = require('webidl2');

const generatedDir = path.join(__dirname, 'generated');

const copyright = ["<!--Copyright 2020 Google LLC", "", "Licensed under the Apache License, Version 2.0 (the \"License\"); you may not use this file except in compliance with the License. You may obtain a copy of the License at", "", "     https://www.apache.org/licenses/LICENSE-2.0", "", "Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an \"AS IS\" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.-->"];

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
    // eslint-disable-next-line no-inner-declarations
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

// Add prefixed forms from unprefixed and vice versa. Items are added to
// `propertySet` during iteration of the same and this is safe, see
// https://stackoverflow.com/a/28306768
function expandCSSProperties(propertySet) {
  for (const prop of propertySet) {
    const unprefixedProp = prop.replace(/^-[^-]+-/, '');
    if (unprefixedProp !== prop) {
      propertySet.add(unprefixedProp);
      // fall through to add other prefixed forms
    }
    for (const prefix of ['moz', 'ms', 'webkit']) {
      propertySet.add(`-${prefix}-${unprefixedProp}`);
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
    '<html>',
    '<head>'
  ].concat(copyright).concat([
    '<meta charset="utf-8">',
    '<script src="/resources/json3.min.js"></script>',
    '<script src="/resources/harness.js"></script>',
    '</head>',
    '<body>',
    '<script>'
  ]);

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
  lines.push('bcd.run();', '</script>', '</body>', '</html>');
  const pathname = path.join('css', 'properties', basename);
  const filename = path.join(generatedDir, pathname);
  writeText(filename, lines);
  return pathname;
}

function buildCSS(bcd, reffy) {
  const propertySet = new Set;
  collectCSSPropertiesFromBCD(bcd, propertySet);
  collectCSSPropertiesFromReffy(reffy, propertySet);
  expandCSSProperties(propertySet);

  const propertyNames = Array.from(propertySet);
  propertyNames.sort();

  return [
    ['http', buildCSSPropertyTest(propertyNames,
        'CSSStyleDeclaration', 'in-style.html')],
    ['http', buildCSSPropertyTest(propertyNames,
        'CSS.supports', 'dot-supports.html')]
  ];
}

function collectExtraIDL() {
  const idl = fs.readFileSync('./non-standard.idl', 'utf8');
  return WebIDL2.parse(idl);
}

function mergeMembers(target, source) {
  // Check for operation overloads across partials/mixins.
  const targetOperations = new Set();
  for (const {type, name} of target.members) {
    if (type === 'operation' && name) {
      targetOperations.add(name);
    }
  }
  for (const {type, name} of source.members) {
    if (type === 'operation' && targetOperations.has(name)) {
      // eslint-disable-next-line max-len
      throw new Error(`Operation overloading across partials/mixins for ${target.name}.${name}`);
    }
  }
  // Now merge members.
  target.members.push(...source.members);
}

function flattenIDL(specIDLs, collectExtraIDL) {
  let ast = [];

  for (const idl of Object.values(specIDLs)) {
    ast.push(...idl);
  }

  ast.push(...collectExtraIDL);

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

    // merge members to target interface/dictionary/etc. and drop partial
    mergeMembers(target, dfn);

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

      // merge members to target interface
      mergeMembers(target, mixin);
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
  return node.extAttrs.find((i) => i.name === name);
}

// https://heycam.github.io/webidl/#dfn-exposure-set
function getExposureSet(node) {
  // step 6-8
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
      throw new Error(`Unexpected RHS for Exposed extended attribute`);
  }
  return globals;
}

function buildIDLTests(ast, scope = "Window") {
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
    if (scope == "Window" && !exposureSet.has('Window')) {
      continue;
    }
    if (scope == "Worker" && (exposureSet.has('Window') || !exposureSet.has('Worker'))) {
      // Interfaces exposed on the window don't need to be re-tested
      continue;
    }
    // TODO: any other exposure scopes we need to worry about?

    const isGlobal = !!getExtAttr(iface, 'Global');

    // interface object
    tests.push([iface.name, `'${iface.name}' in self`]);

    // members
    // TODO: iterable<>, maplike<>, setlike<> declarations are excluded
    // by filtering to things with names.
    const members = iface.members.filter((member) => member.name);
    members.sort((a, b) => a.name.localeCompare(b.name));

    // Avoid generating duplicate tests for operations.
    const handledMemberNames = new Set();

    for (const member of members) {
      if (handledMemberNames.has(member.name)) {
        continue;
      }

      const isStatic = member.special === 'static';
      let expr;
      switch (member.type) {
        case 'attribute':
        case 'operation':
          if (isGlobal) {
            expr = `'${member.name}' in self`;
          } else if (isStatic) {
            expr = `'${iface.name}' in self && '${member.name}' in ${iface.name}`;
          } else {
            expr = `'${iface.name}' in self && '${member.name}' in ${iface.name}.prototype`;
          }
          break;
        case 'const':
          if (isGlobal) {
            expr = `'${member.name}' in self`;
          } else {
            expr = `'${iface.name}' in self && '${member.name}' in ${iface.name}`;
          }
          break;
      }

      if (expr) {
        tests.push([`${iface.name}.${member.name}`, expr]);
        handledMemberNames.add(member.name);
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
    if (scope == "Window" && !exposureSet.has('Window')) {
      continue;
    }
    if (scope == "Worker" && (exposureSet.has('Window') || !exposureSet.has('Worker'))) {
      // Interfaces exposed on the window don't need to be re-tested
      continue;
    }
    // TODO: any other exposure scopes we need to worry about?

    // namespace object
    tests.push([namespace.name, `'${namespace.name}' in self`]);

    // members
    const members = namespace.members.filter((member) => member.name);
    members.sort((a, b) => a.name.localeCompare(b.name));

    for (const member of members) {
      tests.push([`${namespace.name}.${member.name}`,
        `'${namespace.name}' in self && '${member.name}' in ${namespace.name}`]);
    }
  }

  return tests;
}

function allowDuplicates(dfn, member) {
  switch (dfn.name) {
    // TODO: sort this out spec-side
    case 'SVGAElement':
      return member.name === 'href';
    // TODO: handle non-conflicting [Exposed] and drop this
    case 'WebGLRenderingContext':
    case 'WebGL2RenderingContext':
      return member.name === 'canvas';
  }
  return false;
}

function validateIDL(ast) {
  const ignoreRules = new Set([
    'constructor-member',
    'dict-arg-default',
    'require-exposed'
  ]);

  const validations = WebIDL2.validate(ast);

  // Monkey-patching support for https://github.com/w3c/webidl2.js/issues/484
  for (const dfn of ast) {
    if (!dfn.members) {
      continue;
    }
    const names = new Set();
    for (const member of dfn.members) {
      if (!member.name) {
        continue;
      }
      if (member.type === 'operation') {
        // Overloading across partials/mixins are checked in mergeMembers.
        continue;
      }
      if (allowDuplicates(dfn, member)) {
        continue;
      }
      if (!names.has(member.name)) {
        names.add(member.name);
      } else {
        validations.push({
          ruleName: 'no-duplicate-member',
          // eslint-disable-next-line max-len
          message: `Validation error: Duplicate member ${member.name} in ${dfn.type} ${dfn.name}`
        });
      }
    }
  }

  let validationError = false;
  for (const {ruleName, message} of validations) {
    if (ignoreRules.has(ruleName)) {
      continue;
    }
    console.error(`${message}\n`);
    validationError = true;
  }

  if (validationError) {
    process.exit(1);
  }
}

function buildIDLWindow(ast) {
  const tests = buildIDLTests(ast);

  const lines = [
    '<!DOCTYPE html>',
    '<html>',
    '<head>'
  ].concat(copyright).concat([
    '<meta charset="utf-8">',
    '<script src="/resources/json3.min.js"></script>',
    '<script src="/resources/harness.js"></script>',
    '</head>',
    '<body>',
    '<script>'
  ]);

  for (const [name, expr] of tests) {
    lines.push(`bcd.test('api.${name}', "${expr}", 'Window');`);
  }

  lines.push('bcd.run();', '</script>', '</body>', '</html>');
  const pathname = path.join('api', 'interfaces.html');
  const filename = path.join(generatedDir, pathname);
  writeText(filename, lines);
  return [['http', pathname], ['https', pathname]];
}

function buildIDLWorker(ast) {
  const tests = buildIDLTests(ast, "Worker");

  const lines = [
    '<!DOCTYPE html>',
    '<html>',
    '<head>'
  ].concat(copyright).concat([
    '<meta charset="utf-8">',
    '<script src="/resources/json3.min.js"></script>',
    '<script src="/resources/harness.js"></script>',
    '<script src="/resources/broadcastchannel.js"></script>',
    '<script>',
    '</head>',
    '<body>'
  ]);

  for (const [name, expr] of tests) {
    lines.push(`bcd.test('api.${name}', "${expr}", 'Worker');`);
  }

  lines.push('bcd.runWorker();', '</script>', '</body>', '</html>');
  const pathname = path.join('api', 'workerinterfaces.html');
  const filename = path.join(generatedDir, pathname);
  writeText(filename, lines);
  return [['http', pathname], ['https', pathname]];
}

function buildIDL(_, reffy) {
  const ast = flattenIDL(reffy.idl, collectExtraIDL());
  validateIDL(ast);
  return buildIDLWindow(ast).concat(buildIDLWorker(ast));
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
    ['broadcast-channel/dist/lib/browser.min.js', 'resources', 'broadcastchannel.js'],
    ['chai/chai.js', 'test'],
    ['mocha/mocha.css', 'test'],
    ['mocha/mocha.js', 'test']
  ];
  for (const [srcInModules, destInGenerated, newFilename] of resources) {
    const src = require.resolve(srcInModules);
    const destDir = path.join(generatedDir, destInGenerated);
    const dest = path.join(destDir, path.basename(src));
    fs.ensureDirSync(path.dirname(dest));
    fs.copyFileSync(src, dest);
    if (newFilename) {
      fs.renameSync(dest, path.join(destDir, newFilename));
    }
  }
}

async function build(bcd, reffy) {
  const manifest = {
    items: []
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
    collectCSSPropertiesFromBCD,
    collectCSSPropertiesFromReffy,
    expandCSSProperties,
    flattenIDL
  };
} else {
  const bcd = require('mdn-browser-compat-data');
  const reffy = require('./reffy-reports');
  build(bcd, reffy).catch((reason) => {
    console.error(reason);
    process.exit(1);
  });
}
