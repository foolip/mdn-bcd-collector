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

import css from '@webref/css';
import esMain from 'es-main';
import fs from 'fs-extra';
import idl from '@webref/idl';
import path from 'path';
import {fileURLToPath} from 'url';
import sass from 'sass';
import * as WebIDL2 from 'webidl2';
import * as YAML from 'yaml';

import customIDL from './custom-idl/index.js';

/* istanbul ignore next */
const customTests = YAML.parse(
  await fs.readFile(
    new URL(
      process.env.NODE_ENV === 'test' ?
        './unittest/unit/custom-tests.test.yaml' :
        './custom-tests.yaml',
      import.meta.url
    ),
    'utf8'
  )
);

const customCSS = await fs.readJson(
  new URL('./custom-css.json', import.meta.url)
);
const customJS = await fs.readJson(
  new URL('./custom-js.json', import.meta.url)
);

const generatedDir = fileURLToPath(new URL('./generated', import.meta.url));

const compileCustomTest = (code, format = true) => {
  // Import code from other tests
  code = code.replace(
    /<%(\w+)\.(\w+)(?:\.(\w+))?:(\w+)%> ?/g,
    (match, category, name, member, instancevar) => {
      if (category === 'api') {
        if (!(name in customTests.api && '__base' in customTests.api[name])) {
          return `throw 'Test is malformed: ${match} is an invalid reference';`;
        }
        let importcode = compileCustomTest(customTests.api[name].__base, false);
        const callback = importcode.includes('callback');

        importcode = importcode
          .replace(/var (instance|promise)/g, `var ${instancevar}`)
          .replace(/callback\(/g, `${instancevar}(`)
          .replace(/promise\.then/g, `${instancevar}.then`)
          .replace(/(instance|promise) = /g, `${instancevar} = `);
        if (!(['instance', 'promise'].includes(instancevar) || callback)) {
          importcode += ` if (!${instancevar}) {return false;}`;
        }
        return importcode;
      }

      // TODO: add CSS category
      return `throw 'Test is malformed: import ${match}, category ${category} is not importable';`;
    }
  );

  if (format) {
    // Wrap in a function
    code = `(function () {\n${code}\n})()`;
  }

  return code;
};

const getCustomTestAPI = (name, member, type) => {
  let test = false;

  if (name in customTests.api) {
    const testbase =
      '__base' in customTests.api[name] ?
        '  ' + customTests.api[name].__base + '\n' :
        '';
    const promise = testbase.includes('var promise');
    const callback = testbase.includes('callback(');

    if (member === undefined) {
      if ('__test' in customTests.api[name]) {
        test = testbase + '  ' + customTests.api[name].__test;
      } else {
        const returnValue = '!!instance';
        test = testbase ?
          testbase +
            (promise ?
              `return promise.then(function(instance) {return ${returnValue}});` :
              callback ?
              `function callback(instance) {
                  try {
                    success(${returnValue});
                  } catch(e) {
                    fail(e);
                  }
                };
                return 'callback';` :
              `return ${returnValue};`) :
          false;
      }
    } else {
      if (
        member in customTests.api[name] &&
        typeof customTests.api[name][member] === 'string'
      ) {
        test = testbase + '  ' + customTests.api[name][member];
      } else {
        if (
          ['constructor', 'static'].includes(type) ||
          ['toString', 'toJSON'].includes(member)
        ) {
          // Constructors, constants, and static attributes should not have
          // auto-generated custom tests
          test = false;
        } else {
          const returnValue = `'${member}' in instance`;
          test = testbase ?
            testbase +
              (promise ?
                `return promise.then(function(instance) {return ${returnValue}});` :
                callback ?
                `function callback(instance) {
                   try {
                     success(${returnValue});
                   } catch(e) {
                     fail(e);
                   }
                 };
                 return 'callback';` :
                `return ${returnValue};`) :
            false;
        }
      }
    }
  }

  return test && compileCustomTest(test);
};

const getCustomSubtestsAPI = (name) => {
  const subtests = {};

  if (name in customTests.api) {
    const testbase = customTests.api[name].__base || '';
    if ('__additional' in customTests.api[name]) {
      for (const subtest of Object.entries(
        customTests.api[name].__additional
      )) {
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
        const r = customTests.api.__resources[key];
        resources[key] =
          r.type == 'instance' ? r : customTests.api.__resources[key];
      } else {
        throw new Error(
          `Resource ${key} is not defined but referenced in api.${name}`
        );
      }
    }
  }

  return resources;
};

const getCustomTestCSS = (name) => {
  return (
    'properties' in customTests.css &&
    name in customTests.css.properties &&
    compileCustomTest(customTests.css.properties[name])
  );
};

const compileTestCode = (test) => {
  if (typeof test === 'string') {
    return test;
  }

  const property = test.property.replace(/(Symbol|constructor)\./, '');

  if (test.property.startsWith('constructor')) {
    return `bcd.testConstructor("${property}");`;
  }
  if (test.property.startsWith('Symbol.')) {
    return `"Symbol" in self && "${test.property.replace(
      'Symbol.',
      ''
    )}" in Symbol && ${test.property} in ${test.owner}.prototype`;
  }
  if (test.inherit) {
    return `Object.prototype.hasOwnProperty.call(${test.owner}, "${property}")`;
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

    const target = ast.find(
      (it) => !it.partial && it.type === dfn.type && it.name === dfn.name
    );
    if (!target) {
      throw new Error(
        `Original definition not found for partial ${dfn.type} ${dfn.name}`
      );
    }

    // merge members to target interface/dictionary/etc. and drop partial
    mergeMembers(target, dfn);

    return false;
  });

  // mix in the mixins
  for (const dfn of ast) {
    if (dfn.type === 'includes') {
      if (dfn.includes === 'WindowOrWorkerGlobalScope') {
        // WindowOrWorkerGlobalScope is mapped differently in BCD
        continue;
      }
      const mixin = ast.find(
        (it) =>
          !it.partial &&
          it.type === 'interface mixin' &&
          it.name === dfn.includes
      );
      if (!mixin) {
        throw new Error(
          `Interface mixin ${dfn.includes} not found for target ${dfn.target}`
        );
      }
      const target = ast.find(
        (it) => !it.partial && it.type === 'interface' && it.name === dfn.target
      );
      if (!target) {
        throw new Error(
          `Target ${dfn.target} not found for interface mixin ${dfn.includes}`
        );
      }

      // merge members to target interface
      mergeMembers(target, mixin);
    }
  }

  const globals = ast.filter((dfn) => dfn.name === 'WindowOrWorkerGlobalScope');

  // drop includes and mixins
  ast = ast.filter(
    (dfn) => dfn.type !== 'includes' && dfn.type !== 'interface mixin'
  );

  return {ast, globals};
};

const flattenMembers = (iface) => {
  const members = iface.members.filter(
    (member) => member.name && member.type !== 'const'
  );
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
          {name: 'values', type: 'operation'}
        );
        break;
      case 'maplike':
        members.push(
          {name: 'entries', type: 'operation'},
          {name: 'forEach', type: 'operation'},
          {name: 'get', type: 'operation'},
          {name: 'has', type: 'operation'},
          {name: 'keys', type: 'operation'},
          {name: 'size', type: 'attribute'},
          {name: 'values', type: 'operation'}
        );
        if (!member.readonly) {
          members.push(
            {name: 'clear', type: 'operation'},
            {name: 'delete', type: 'operation'},
            {name: 'set', type: 'operation'}
          );
        }
        break;
      case 'setlike':
        members.push(
          {name: 'entries', type: 'operation'},
          {name: 'forEach', type: 'operation'},
          {name: 'has', type: 'operation'},
          {name: 'keys', type: 'operation'},
          {name: 'size', type: 'attribute'},
          {name: 'values', type: 'operation'}
        );
        if (!member.readonly) {
          members.push(
            {name: 'add', type: 'operation'},
            {name: 'clear', type: 'operation'},
            {name: 'delete', type: 'operation'}
          );
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

// https://webidl.spec.whatwg.org/#dfn-exposure-set
const getExposureSet = (node) => {
  // step 6-8
  const attr = getExtAttr(node, 'Exposed');
  if (!attr) {
    throw new Error(
      `Exposed extended attribute not found on ${node.type} ${node.name}`
    );
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
    const message = validations
      .map((v) => {
        return `${v.message} [${v.ruleName}]`;
      })
      .join('\n\n');
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
    'any', // https://webidl.spec.whatwg.org/#idl-any
    'ArrayBuffer', // https://webidl.spec.whatwg.org/#idl-ArrayBuffer
    'bigint', // https://webidl.spec.whatwg.org/#idl-bigint
    'BigInt64Array', // https://webidl.spec.whatwg.org/#idl-BigInt64Array
    'BigUint64Array', // https://webidl.spec.whatwg.org/#idl-BigUint64Array
    'boolean', // https://webidl.spec.whatwg.org/#idl-boolean
    'byte', // https://webidl.spec.whatwg.org/#idl-byte
    'ByteString', // https://webidl.spec.whatwg.org/#idl-ByteString
    'DataView', // https://webidl.spec.whatwg.org/#idl-DataView
    'DOMString', // https://webidl.spec.whatwg.org/#idl-DOMString
    'double', // https://webidl.spec.whatwg.org/#idl-double
    'float', // https://webidl.spec.whatwg.org/#idl-float
    'Float32Array', // https://webidl.spec.whatwg.org/#idl-Float32Array
    'Float64Array', // https://webidl.spec.whatwg.org/#idl-Float64Array
    'Int16Array', // https://webidl.spec.whatwg.org/#idl-Int16Array
    'Int32Array', // https://webidl.spec.whatwg.org/#idl-Int32Array
    'Int8Array', // https://webidl.spec.whatwg.org/#idl-Int8Array
    'long long', // https://webidl.spec.whatwg.org/#idl-long-long
    'long', // https://webidl.spec.whatwg.org/#idl-long
    'object', // https://webidl.spec.whatwg.org/#idl-object
    'octet', // https://webidl.spec.whatwg.org/#idl-octet
    'short', // https://webidl.spec.whatwg.org/#idl-short
    'symbol', // https://webidl.spec.whatwg.org/#idl-symbol
    'Uint16Array', // https://webidl.spec.whatwg.org/#idl-Uint16Array
    'Uint32Array', // https://webidl.spec.whatwg.org/#idl-Uint32Array
    'Uint8Array', // https://webidl.spec.whatwg.org/#idl-Uint8Array
    'Uint8ClampedArray', // https://webidl.spec.whatwg.org/#idl-Uint8ClampedArray
    'unrestricted double', // https://webidl.spec.whatwg.org/#idl-unrestricted-double
    'unrestricted float', // https://webidl.spec.whatwg.org/#idl-unrestricted-float
    'unsigned long long', // https://webidl.spec.whatwg.org/#idl-unsigned-long-long
    'unsigned long', // https://webidl.spec.whatwg.org/#idl-unsigned-long
    'unsigned short', // https://webidl.spec.whatwg.org/#idl-unsigned-short
    'USVString', // https://webidl.spec.whatwg.org/#idl-USVString
    'undefined' // https://webidl.spec.whatwg.org/#idl-undefined
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

const buildIDLMemberTests = (
  members,
  iface,
  exposureSet,
  isGlobal,
  resources
) => {
  const tests = {};
  // Avoid generating duplicate tests for operations.
  const handledMemberNames = new Set();

  for (const member of members) {
    if (handledMemberNames.has(member.name)) {
      continue;
    }

    const isStatic = member.special === 'static' || iface.type === 'namespace';

    let expr;
    const customTestMember = getCustomTestAPI(
      iface.name,
      member.name,
      isStatic ? 'static' : member.type
    );

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
            expr = {
              property: member.name,
              owner: `${iface.name}.prototype`,
              inherit: member.special === 'inherit'
            };
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

    tests[member.name] = compileTest({
      raw: {
        code: expr
      },
      exposure: Array.from(exposureSet),
      resources: resources
    });
    handledMemberNames.add(member.name);
  }

  return tests;
};

const buildIDLTests = (ast, globals) => {
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

    const exposureSet = getExposureSet(iface);
    const isGlobal = !!getExtAttr(iface, 'Global');
    const customIfaceTest = getCustomTestAPI(iface.name);
    const resources = getCustomResourcesAPI(iface.name);

    tests[`api.${iface.name}`] = compileTest({
      raw: {
        code: customIfaceTest || {property: iface.name, owner: 'self'}
      },
      exposure: Array.from(exposureSet),
      resources: resources
    });

    const members = flattenMembers(iface);
    const memberTests = buildIDLMemberTests(
      members,
      iface,
      exposureSet,
      isGlobal,
      resources
    );
    for (const [k, v] of Object.entries(memberTests)) {
      tests[`api.${iface.name}.${k}`] = v;
    }

    const subtests = getCustomSubtestsAPI(iface.name);
    for (const subtest of Object.entries(subtests)) {
      tests[`api.${iface.name}.${subtest[0]}`] = compileTest({
        raw: {
          code: subtest[1]
        },
        exposure: Array.from(exposureSet),
        resources: resources
      });
    }
  }

  for (const iface of globals) {
    // Remap globals tests and exposure
    const fakeIface = {name: '_globals'};
    const exposureSet = new Set(['Window', 'Worker']);

    const members = flattenMembers(iface);
    const memberTests = buildIDLMemberTests(
      members,
      fakeIface,
      exposureSet,
      true,
      {}
    );
    for (const [k, v] of Object.entries(memberTests)) {
      tests[`api.${k}`] = v;
    }
  }

  return tests;
};

const buildIDL = (specIDLs, customIDLs) => {
  const {ast, globals} = flattenIDL(specIDLs, customIDLs);
  validateIDL(ast);
  return buildIDLTests(ast, globals);
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
    const customTest = getCustomTestCSS(name);
    if (customTest) {
      tests[`css.properties.${name}`] = compileTest({
        raw: {code: customTest},
        exposure: ['Window']
      });
      continue;
    }

    const attrName = cssPropertyToIDLAttribute(name, name.startsWith('-'));
    const code = [{property: attrName, owner: 'document.body.style'}];
    if (name !== attrName) {
      code.push({property: name, owner: 'document.body.style'});
    }
    tests[`css.properties.${name}`] = compileTest({
      raw: {code, combinator: '||'},
      exposure: ['Window']
    });
  }

  return tests;
};

const buildJS = (customJS) => {
  const tests = {};

  for (const [path, extras] of Object.entries(customJS.builtins)) {
    const parts = path.split('.');

    const bcdPath = [
      'javascript',
      'builtins',
      // The "prototype" part is not part of the BCD paths.
      ...parts.filter((p) => p != 'prototype')
    ].join('.');

    // Get the last part as the property and everything else as the expression
    // we should test for existence in, or "self" if there's just one part.
    let property = parts[parts.length - 1];

    if (property.startsWith('@@')) {
      property = `Symbol.${property.substr(2)}`;
    } else {
      property = JSON.stringify(property);
    }

    const owner =
      parts.length > 1 ? parts.slice(0, parts.length - 1).join('.') : 'self';
    const code = `${owner}.hasOwnProperty(${property})`;

    tests[bcdPath] = compileTest({
      raw: {code},
      exposure: ['Window']
    });

    // Constructors
    if ('ctor_args' in extras) {
      const ctorPath = [
        'javascript',
        'builtins',
        ...parts,
        // Repeat the last part of the path
        parts[parts.length - 1]
      ].join('.');
      const expr = `${path}(${extras.ctor_args})`;
      const maybeNew = extras.ctor_new !== false ? 'new' : '';
      const code = compileCustomTest(`${maybeNew} ${expr}; return true;`);
      tests[ctorPath] = compileTest({
        raw: {code},
        exposure: ['Window']
      });
    }
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
    [
      '@browser-logos/firefox/firefox_64x64.png',
      'browser-logos',
      'firefox.png'
    ],
    [
      '@browser-logos/internet-explorer_9-11/internet-explorer_9-11_64x64.png',
      'browser-logos',
      'ie.png'
    ],
    ['@browser-logos/opera/opera_64x64.png', 'browser-logos', 'opera.png'],
    ['@browser-logos/safari/safari_64x64.png', 'browser-logos', 'safari.png'],
    ['@mdi/font/css/materialdesignicons.min.css', 'resources'],
    ['@mdi/font/fonts/materialdesignicons-webfont.eot', 'fonts'],
    ['@mdi/font/fonts/materialdesignicons-webfont.ttf', 'fonts'],
    ['@mdi/font/fonts/materialdesignicons-webfont.woff', 'fonts'],
    ['@mdi/font/fonts/materialdesignicons-webfont.woff2', 'fonts']
  ];
  for (const [srcInModules, destInGenerated, newFilename] of resources) {
    const src = fileURLToPath(
      new URL(`./node_modules/${srcInModules}`, import.meta.url)
    );
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
const generateCSS = async () => {
  const scssPath = fileURLToPath(new URL('./style.scss', import.meta.url));
  const outPath = path.join(generatedDir, 'resources', 'style.css');
  const result = sass.renderSync({file: scssPath});
  if (typeof result === Error) {
    throw result;
  }
  await fs.writeFile(outPath, result.css.toString(), 'utf8');
};

/* istanbul ignore next */
const build = async (customIDL, customCSS) => {
  const specCSS = await css.listAll();
  const specIDLs = await idl.parseAll();
  const IDLTests = buildIDL(specIDLs, customIDL);
  const CSSTests = buildCSS(specCSS, customCSS);
  const JSTests = buildJS(customJS);
  const tests = Object.assign({}, IDLTests, CSSTests, JSTests);

  await fs.writeJson(new URL('./tests.json', import.meta.url), tests);
  await copyResources();
  await generateCSS();
};

/* istanbul ignore if */
if (esMain(import.meta)) {
  await build(customIDL, customCSS);
}

export {
  getCustomTestAPI,
  getCustomSubtestsAPI,
  getCustomResourcesAPI,
  getCustomTestCSS,
  compileTestCode,
  compileTest,
  flattenIDL,
  getExposureSet,
  buildIDLTests,
  buildIDL,
  validateIDL,
  cssPropertyToIDLAttribute,
  buildCSS
};
