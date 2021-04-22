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

const css = require('@webref/css');
const fs = require('fs-extra');
const idl = require('@webref/idl');
const path = require('path');
const prettier = require('prettier');
const WebIDL2 = require('webidl2');

const customCSS = require('./custom-css.json');
const customTests = require('./custom-tests.json');
const customIDL = require('./custom-idl');

const generatedDir = path.join(__dirname, 'generated');

const compileCustomTest = (code, format = true) => {
  // Import code from other tests
  code = code.replace(/<%(\w+)\.(\w+)(?:\.(\w+))?:(\w+)%> ?/g, (match, category, name, member, instancevar) => {
    if (category === 'api') {
      if (!(name in customTests.api && '__base' in customTests.api[name])) {
        return `throw 'Test is malformed: ${match} is an invalid reference';`;
      }
      let importcode = compileCustomTest(customTests.api[name].__base, false);

      importcode = importcode
          .replace(/var (instance|promise)/g, `var ${instancevar}`)
          .replace(/promise\.then/g, `${instancevar}.then`);
      if (instancevar !== 'instance' && instancevar !== 'promise') {
        importcode += ` if (!${instancevar}) {return false;}`;
      }
      return importcode;
    }

    // TODO: add CSS category
    return `throw 'Test is malformed: import ${match}, category ${category} is not importable';`;
  });

  if (format) {
    // Wrap in a function
    code = `(function () {${code}})()`;

    // Format
    try {
      code = prettier.format(code, {singleQuote: true, parser: 'babel'}).trim();
    } catch (e) {
      return `throw 'Test is malformed: ${e}'`;
    }
  }

  return code;
};

const getCustomTestAPI = (name, member, type) => {
  let test = false;

  if (name in customTests.api) {
    const testbase = customTests.api[name].__base || '';
    const promise = testbase.includes('var promise');
    if (member === undefined) {
      if ('__test' in customTests.api[name]) {
        test = testbase + customTests.api[name].__test;
      } else {
        test = testbase ? testbase + (
          promise ? 'return promise.then(function(instance) {return !!instance});' : 'return !!instance;'
        ) : false;
      }
    } else {
      if (member in customTests.api[name] &&
          typeof(customTests.api[name][member]) === 'string') {
        test = testbase + customTests.api[name][member];
      } else {
        if (['constructor', 'static'].includes(type) || ['toString', 'toJSON'].includes(member)) {
          // Constructors, constants, and static attributes should not have
          // auto-generated custom tests
          test = false;
        } else {
          test = testbase ? testbase + (
            promise ? `return promise.then(function(instance) {return '${member}' in instance});` : `return '${member}' in instance;`
          ) : false;
        }
      }
    }
  }

  if (!test) {
    return false;
  }

  test = compileCustomTest(test);

  if (test.includes('Test is malformed')) {
    console.error(`api.${name}${member ? `.${member}` : ''}: ${test.replace('throw ', '')}`);
  }

  return test;
};

const getCustomSubtestsAPI = (name) => {
  const subtests = {};

  if (name in customTests.api) {
    const testbase = customTests.api[name].__base || '';
    if ('__additional' in customTests.api[name]) {
      for (const subtest of
        Object.entries(customTests.api[name].__additional)) {
        subtests[subtest[0]] = compileCustomTest(`${testbase}${subtest[1]}`);
      }
    }
  }

  return subtests;
};

const getCustomResourcesAPI = (name) => {
  const resources = {};

  // TODO: Use tests imports to inherit resources
  if (name in customTests.api && '__resources' in customTests.api[name]) {
    for (const key of customTests.api[name].__resources) {
      if (Object.keys(customTests.api.__resources).includes(key)) {
        resources[key] = customTests.api.__resources[key];
      } else {
        throw new Error(`Resource ${key} is not defined but referenced in api.${name}`);
      }
    }
  }

  return resources;
};

const getCustomTestCSS = (name) => {
  return 'properties' in customTests.css &&
      name in customTests.css.properties &&
      compileCustomTest(customTests.css.properties[name]);
};

const compileTestCode = (test) => {
  if (typeof test === 'string') {
    return test;
  }

  const property = test.property.replace(/(Symbol|constructor)\./, '');

  if (test.property.startsWith('constructor')) {
    return `bcd.testConstructor("${property}");`;
  }
  if (test.owner === 'CSS.supports') {
    return `CSS.supports("${test.property}", "inherit")`;
  }
  if (test.property.startsWith('Symbol.')) {
    return `"Symbol" in self && "${test.property.replace('Symbol.', '')}" in Symbol && ${test.property} in ${test.owner}.prototype`;
  }
  return `"${property}" in ${test.owner}`;
};

const compileTest = (test) => {
  let code;
  if (!Array.isArray(test.raw.code)) {
    code = compileTestCode(test.raw.code);
  } else {
    const parts = test.raw.code.map(compileTestCode);
    code = parts.join(` ${test.raw.combinator} `);
  }

  const {exposure, resources} = test;
  const newTest = {code, exposure};

  if (resources && Object.keys(resources).length) {
    newTest.resources = resources;
  }

  return newTest;
};

const mergeMembers = (target, source) => {
  // Check for duplicate members across partials/mixins.
  const targetMembers = new Set(target.members.map((m) => m.name));
  for (const member of source.members) {
    if (targetMembers.has(member.name)) {
      throw new Error(`Duplicate definition of ${target.name}.${member.name}`);
    }
  }
  // Now merge members.
  target.members.push(...source.members);
};

const flattenIDL = (specIDLs, customIDLs) => {
  let ast = [];

  for (const idl of Object.values(specIDLs)) {
    ast.push(...idl);
  }

  for (const idl of Object.values(customIDLs)) {
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
        throw new Error(`Interface mixin ${dfn.includes} not found for target ${dfn.target}`);
      }
      const target = ast.find((it) => !it.partial &&
                                      it.type === 'interface' &&
                                      it.name === dfn.target);
      if (!target) {
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
};

const flattenMembers = (iface) => {
  const members = iface.members.filter((member) => member.name && member.type !== 'const' && member.special !== 'inherit');
  for (const member of iface.members.filter((member) => !member.name)) {
    switch (member.type) {
      case 'constructor':
        // Test generation doesn't use constructor arguments, so they aren't
        // copied
        members.push({name: iface.name, type: 'constructor'});
        break;
      case 'iterable':
        members.push(
            {name: '@@iterator', type: 'symbol'},
            {name: 'entries', type: 'operation'},
            {name: 'forEach', type: 'operation'},
            {name: 'keys', type: 'operation'},
            {name: 'values', type: 'operation'});
        break;
      case 'maplike':
        members.push(
            {name: 'entries', type: 'operation'},
            {name: 'forEach', type: 'operation'},
            {name: 'get', type: 'operation'},
            {name: 'has', type: 'operation'},
            {name: 'keys', type: 'operation'},
            {name: 'size', type: 'attribute'},
            {name: 'values', type: 'operation'});
        if (!member.readonly) {
          members.push(
              {name: 'clear', type: 'operation'},
              {name: 'delete', type: 'operation'},
              {name: 'set', type: 'operation'});
        }
        break;
      case 'setlike':
        members.push(
            {name: 'entries', type: 'operation'},
            {name: 'forEach', type: 'operation'},
            {name: 'has', type: 'operation'},
            {name: 'keys', type: 'operation'},
            {name: 'size', type: 'attribute'},
            {name: 'values', type: 'operation'});
        if (!member.readonly) {
          members.push(
              {name: 'add', type: 'operation'},
              {name: 'clear', type: 'operation'},
              {name: 'delete', type: 'operation'});
        }
        break;
      case 'operation':
        switch (member.special) {
          case 'stringifier':
            members.push({name: 'toString', type: 'operation'});
            break;
        }
        break;
    }
  }

  // Add members from ExtAttrs
  if (getExtAttr(iface, 'Constructor')) {
    // Test generation doesn't use constructor arguments, so they aren't copied
    members.push({name: iface.name, type: 'constructor'});
  }
  if (getExtAttr(iface, 'LegacyFactoryFunction')) {
    members.push({
      name: getExtAttr(iface, 'LegacyFactoryFunction').rhs.value,
      type: 'constructor'
    });
  }

  return members.sort((a, b) => a.name.localeCompare(b.name));
};

const getExtAttr = (node, name) => {
  return node.extAttrs && node.extAttrs.find((i) => i.name === name);
};

// https://heycam.github.io/webidl/#dfn-exposure-set
const getExposureSet = (node) => {
  // step 6-8
  const attr = getExtAttr(node, 'Exposed');
  if (!attr) {
    throw new Error(`Exposed extended attribute not found on ${node.type} ${node.name}`);
  }
  const globals = new Set();
  switch (attr.rhs.type) {
    case 'identifier':
      globals.add(attr.rhs.value);
      break;
    case 'identifier-list':
      for (const {value} of attr.rhs.value) {
        globals.add(value);
      }
      break;
    /* istanbul ignore next */
    default:
      throw new Error(`Unexpected RHS for Exposed extended attribute`);
  }

  if (globals.has('DedicatedWorker')) {
    globals.delete('DedicatedWorker');
    globals.add('Worker');
  }

  return globals;
};

const getName = (node) => {
  if (!('name' in node)) {
    return undefined;
  }

  switch (node.name) {
    case 'console':
      return 'Console';
    default:
      return node.name;
  }
};

const validateIDL = (ast) => {
  const validations = WebIDL2.validate(ast).filter((v) => {
    // TODO: https://github.com/w3c/webref/pull/196
    if (v.ruleName === 'dict-arg-default') {
      return false;
    }
    // Ignore the [LegacyNoInterfaceObject] rule.
    return v.ruleName !== 'no-nointerfaceobject';
  });
  if (validations.length) {
    const message = validations.map((v) => {
      return `${v.message} [${v.ruleName}]`;
    }).join('\n\n');
    throw new Error(`Web IDL validation failed:\n${message}`);
  }

  // Validate that there are no unknown types. There are types in lots of
  // places in the AST (interface members, arguments, return types) and rather
  // than trying to cover them all, walk the whole AST looking for "idlType".
  const usedTypes = new Set();
  // Serialize and reparse the ast to not have to worry about own properties
  // vs enumerable properties on the prototypes, etc.
  const pending = [JSON.parse(JSON.stringify(ast))];
  while (pending.length) {
    const node = pending.pop();
    for (const [key, value] of Object.entries(node)) {
      if (key === 'idlType' && typeof value === 'string') {
        usedTypes.add(value);
      } else if (typeof value === 'object' && value !== null) {
        pending.push(value);
      }
    }
  }
  // These are the types defined by Web IDL itself.
  const knownTypes = new Set([
    'any', // https://heycam.github.io/webidl/#idl-any
    'ArrayBuffer', // https://heycam.github.io/webidl/#idl-ArrayBuffer
    'bigint', // https://heycam.github.io/webidl/#idl-bigint
    'boolean', // https://heycam.github.io/webidl/#idl-boolean
    'byte', // https://heycam.github.io/webidl/#idl-byte
    'ByteString', // https://heycam.github.io/webidl/#idl-ByteString
    'DataView', // https://heycam.github.io/webidl/#idl-DataView
    'DOMString', // https://heycam.github.io/webidl/#idl-DOMString
    'double', // https://heycam.github.io/webidl/#idl-double
    'float', // https://heycam.github.io/webidl/#idl-float
    'Float32Array', // https://heycam.github.io/webidl/#idl-Float32Array
    'Float64Array', // https://heycam.github.io/webidl/#idl-Float64Array
    'Int16Array', // https://heycam.github.io/webidl/#idl-Int16Array
    'Int32Array', // https://heycam.github.io/webidl/#idl-Int32Array
    'Int8Array', // https://heycam.github.io/webidl/#idl-Int8Array
    'long long', // https://heycam.github.io/webidl/#idl-long-long
    'long', // https://heycam.github.io/webidl/#idl-long
    'object', // https://heycam.github.io/webidl/#idl-object
    'octet', // https://heycam.github.io/webidl/#idl-octet
    'short', // https://heycam.github.io/webidl/#idl-short
    'symbol', // https://heycam.github.io/webidl/#idl-symbol
    'Uint16Array', // https://heycam.github.io/webidl/#idl-Uint16Array
    'Uint32Array', // https://heycam.github.io/webidl/#idl-Uint32Array
    'Uint8Array', // https://heycam.github.io/webidl/#idl-Uint8Array
    'Uint8ClampedArray', // https://heycam.github.io/webidl/#idl-Uint8ClampedArray
    'unrestricted double', // https://heycam.github.io/webidl/#idl-unrestricted-double
    'unrestricted float', // https://heycam.github.io/webidl/#idl-unrestricted-float
    'unsigned long long', // https://heycam.github.io/webidl/#idl-unsigned-long-long
    'unsigned long', // https://heycam.github.io/webidl/#idl-unsigned-long
    'unsigned short', // https://heycam.github.io/webidl/#idl-unsigned-short
    'USVString', // https://heycam.github.io/webidl/#idl-USVString
    'undefined' // https://heycam.github.io/webidl/#idl-undefined
  ]);
  // Add any types defined by the (flattened) spec and custom IDL.
  for (const dfn of ast) {
    knownTypes.add(dfn.name);
  }
  // Ignore some types that aren't defined. Most of these should be fixed.
  const ignoreTypes = new Set([
    'Animatable', // TODO: this is a mixin used as a union type
    'CSSOMString', // https://drafts.csswg.org/cssom/#cssomstring-type
    'Region', // https://github.com/w3c/csswg-drafts/issues/5519
    'WindowProxy' // https://html.spec.whatwg.org/multipage/window-object.html#windowproxy
  ]);
  for (const usedType of usedTypes) {
    if (!knownTypes.has(usedType) && !ignoreTypes.has(usedType)) {
      throw new Error(`Unknown type ${usedType}`);
    }
  }
};

const buildIDLTests = (ast) => {
  const tests = {};

  const interfaces = ast.filter((dfn) => {
    return dfn.type === 'interface' || dfn.type === 'namespace';
  });
  interfaces.sort((a, b) => a.name.localeCompare(b.name));

  for (const iface of interfaces) {
    const legacyNamespace = getExtAttr(iface, 'LegacyNamespace');
    if (legacyNamespace) {
      // TODO: handle WebAssembly, which is partly defined using Web IDL but is
      // under javascript.builtins.WebAssembly in BCD, not api.WebAssembly.
      continue;
    }

    const adjustedIfaceName = getName(iface);

    const exposureSet = getExposureSet(iface);
    const isGlobal = !!getExtAttr(iface, 'Global');
    const customIfaceTest = getCustomTestAPI(adjustedIfaceName);
    const resources = getCustomResourcesAPI(adjustedIfaceName);

    tests[`api.${adjustedIfaceName}`] = compileTest({
      raw: {
        code: customIfaceTest || {property: iface.name, owner: 'self'},
        combinator: '&&'
      },
      exposure: Array.from(exposureSet),
      resources: resources
    });

    const members = flattenMembers(iface);

    // Avoid generating duplicate tests for operations.
    const handledMemberNames = new Set();

    for (const member of members) {
      if (handledMemberNames.has(member.name)) {
        continue;
      }

      const isStatic = member.special === 'static' || iface.type === 'namespace';

      let expr;
      const customTestMember = getCustomTestAPI(
          adjustedIfaceName, member.name, isStatic ? 'static' : member.type);

      if (customTestMember) {
        expr = customTestMember;
      } else {
        switch (member.type) {
          case 'attribute':
          case 'operation':
          case 'field':
            if (isGlobal) {
              expr = {property: member.name, owner: 'self'};
            } else if (isStatic) {
              expr = {property: member.name, owner: iface.name};
            } else {
              expr = {property: member.name, owner: `${iface.name}.prototype`};
            }
            break;
          case 'const':
            if (isGlobal) {
              expr = {property: member.name, owner: 'self'};
            } else {
              expr = {property: member.name, owner: iface.name};
            }
            break;
          case 'constructor':
            expr = {property: `constructor.${member.name}`, owner: iface.name};
            break;
          case 'symbol':
            // eslint-disable-next-line no-case-declarations
            const symbol = member.name.replace('@@', '');
            expr = {property: `Symbol.${symbol}`, owner: `${iface.name}`};
            break;
        }
      }

      tests[`api.${adjustedIfaceName}.${member.name}`] = compileTest({
        raw: {
          code: expr,
          combinator: '&&'
        },
        exposure: Array.from(exposureSet),
        resources: resources
      });
      handledMemberNames.add(member.name);
    }

    const subtests = getCustomSubtestsAPI(adjustedIfaceName);
    for (const subtest of Object.entries(subtests)) {
      tests[`api.${adjustedIfaceName}.${subtest[0]}`] = compileTest({
        raw: {
          code: subtest[1],
          combinator: '&&'
        },
        exposure: Array.from(exposureSet),
        resources: resources
      });
    }
  }

  return tests;
};

const buildIDL = (specIDLs, customIDLs) => {
  const ast = flattenIDL(specIDLs, customIDLs);
  validateIDL(ast);
  return buildIDLTests(ast);
};

// https://drafts.csswg.org/cssom/#css-property-to-idl-attribute
const cssPropertyToIDLAttribute = (property, lowercaseFirst) => {
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
};

const buildCSS = (webrefCSS, customCSS) => {
  const propertySet = new Set();

  for (const data of Object.values(webrefCSS)) {
    for (const prop of Object.keys(data.properties)) {
      propertySet.add(prop);
    }
  }

  for (const prop of Object.keys(customCSS.properties)) {
    if (propertySet.has(prop)) {
      throw new Error(`Custom CSS property already known: ${prop}`);
    }
    propertySet.add(prop);
  }

  const tests = {};

  for (const name of Array.from(propertySet).sort()) {
    const attrName = cssPropertyToIDLAttribute(name, name.startsWith('-'));
    tests[`css.properties.${name}`] = compileTest({
      raw: {
        code: getCustomTestCSS(name) || [
          {property: attrName, owner: 'document.body.style'},
          {property: name, owner: 'CSS.supports'}
        ],
        combinator: '||'
      },
      exposure: ['Window']
    });
  }

  return tests;
};

/* istanbul ignore next */
const copyResources = async () => {
  const resources = [
    ['json3/lib/json3.min.js', 'resources'],
    ['chai/chai.js', 'unittest'],
    ['mocha/mocha.css', 'unittest'],
    ['mocha/mocha.js', 'unittest'],
    ['mocha/mocha.js.map', 'unittest'],
    ['sinon/pkg/sinon.js', 'unittest'],
    ['@browser-logos/chrome/chrome_64x64.png', 'browser-logos', 'chrome.png'],
    ['@browser-logos/edge/edge_64x64.png', 'browser-logos', 'edge.png'],
    ['@browser-logos/firefox/firefox_64x64.png', 'browser-logos', 'firefox.png'],
    ['@browser-logos/internet-explorer_9-11/internet-explorer_9-11_64x64.png', 'browser-logos', 'ie.png'],
    ['@browser-logos/opera/opera_64x64.png', 'browser-logos', 'opera.png'],
    ['@browser-logos/safari/safari_64x64.png', 'browser-logos', 'safari.png'],
    ['@mdi/font/css/materialdesignicons.min.css', 'resources'],
    ['@mdi/font/fonts/materialdesignicons-webfont.eot', 'fonts'],
    ['@mdi/font/fonts/materialdesignicons-webfont.ttf', 'fonts'],
    ['@mdi/font/fonts/materialdesignicons-webfont.woff', 'fonts'],
    ['@mdi/font/fonts/materialdesignicons-webfont.woff2', 'fonts']
  ];
  for (const [srcInModules, destInGenerated, newFilename] of resources) {
    const src = require.resolve(srcInModules);
    const destDir = path.join(generatedDir, destInGenerated);
    const dest = path.join(destDir, path.basename(src));
    await fs.ensureDir(path.dirname(dest));
    await fs.copyFile(src, dest);
    if (newFilename) {
      await fs.rename(dest, path.join(destDir, newFilename));
    }
  }
};

/* istanbul ignore next */
const build = async (customIDL, customCSS) => {
  const specCSS = await css.listAll();
  const specIDLs = await idl.parseAll();
  const IDLTests = buildIDL(specIDLs, customIDL);
  const CSSTests = buildCSS(specCSS, customCSS);
  const tests = Object.assign({}, IDLTests, CSSTests);

  await fs.writeJson(path.join(__dirname, 'tests.json'), tests);
  await copyResources();
};

module.exports = {
  getCustomTestAPI,
  getCustomSubtestsAPI,
  getCustomResourcesAPI,
  getCustomTestCSS,
  compileTestCode,
  compileTest,
  flattenIDL,
  getExposureSet,
  getName,
  buildIDLTests,
  buildIDL,
  validateIDL,
  cssPropertyToIDLAttribute,
  buildCSS
};

/* istanbul ignore if */
if (require.main === module) {
  build(customIDL, customCSS).catch((reason) => {
    console.error(reason);
    process.exit(1);
  });
}
