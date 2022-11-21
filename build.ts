//
// mdn-bcd-collector: build.js
// Script to build all of the tests from the IDL and custom CSS/JS files
//
// © Google LLC, Gooborg Studios, Mozilla Corporation, Apple Inc
// See the LICENSE file for copyright details
//

import path from 'node:path';
import {fileURLToPath} from 'node:url';

import css from '@webref/css';
import esMain from 'es-main';
import fs from 'fs-extra';
import idl from '@webref/idl';
import sass from 'sass';
import * as WebIDL2 from 'webidl2';
import * as YAML from 'yaml';

import customIDL from './custom-idl/index.js';

import type {
  Test,
  RawTest,
  RawTestCodeExpr,
  Exposure,
  Resources,
  IDLFiles
} from './types/types.js';

/* c8 ignore start */
const customTests = YAML.parse(
  await fs.readFile(
    new URL(
      process.env.NODE_ENV === 'test'
        ? './unittest/unit/custom-tests.test.yaml'
        : './custom-tests.yaml',
      import.meta.url
    ),
    'utf8'
  )
);
/* c8 ignore stop */

const customCSS = await fs.readJson(
  new URL('./custom-css.json', import.meta.url)
);
const customJS = await fs.readJson(
  new URL('./custom-js.json', import.meta.url)
);

const generatedDir = fileURLToPath(new URL('./generated', import.meta.url));

const compileCustomTest = (code: string, format = true): string => {
  // Import code from other tests
  code = code.replace(
    /<%(\w+)\.(\w+)(?:\.(\w+))?:(\w+)%> ?/g,
    (match, category, name, member, instancevar) => {
      if (category === 'api') {
        if (!(name in customTests.api && '__base' in customTests.api[name])) {
          return `throw 'Test is malformed: ${match} is an invalid reference';`;
        }
        let importcode = compileCustomTest(customTests.api[name].__base, false);
        const callback =
          importcode.match(/callback([(),])/g) ||
          importcode.includes(':callback%>');

        importcode = importcode
          .replace(/var (instance|promise)/g, `var ${instancevar}`)
          .replace(/callback([(),])/g, `${instancevar}$1`)
          .replace(/promise\.then/g, `${instancevar}.then`)
          .replace(/(instance|promise) = /g, `${instancevar} = `);
        if (!(['instance', 'promise'].includes(instancevar) || callback)) {
          importcode += `\n  if (!${instancevar}) {\n    return {result: false, message: '${instancevar} is falsy'};\n  }`;
        }
        return importcode;
      }

      // TODO: add CSS category
      return `throw 'Test is malformed: import ${match}, category ${category} is not importable';`;
    }
  );

  if (format) {
    // Wrap in a function
    code = `(function() {\n  ${code}\n})();`;
  }

  return code;
};

const getCustomTestAPI = (
  name: string,
  member?: string,
  type?: string
): string | false => {
  let test: string | false = false;

  if (name in customTests.api) {
    const testbase =
      '__base' in customTests.api[name]
        ? customTests.api[name].__base.replace(/\n/g, '\n  ') + '\n  '
        : '';
    const promise = testbase.includes('var promise');
    const callback =
      testbase.match(/callback([(),])/g) || testbase.includes(':callback%>');

    if (member === undefined) {
      if ('__test' in customTests.api[name]) {
        test = testbase + customTests.api[name].__test;
      } else {
        const returnValue = '!!instance';
        test = testbase
          ? testbase +
            (promise
              ? `if (!promise) {
    return {result: false, message: 'Promise variable is falsy'};
  }
  return promise.then(function(instance) {
    return ${returnValue};
  });`
              : callback
              ? `function callback(instance) {
    try {
      success(${returnValue});
    } catch(e) {
      fail(e);
    }
  };
  return 'callback';`
              : `return ${returnValue};`)
          : false;
      }
    } else {
      if (
        member in customTests.api[name] &&
        typeof customTests.api[name][member] === 'string'
      ) {
        test = testbase + customTests.api[name][member];
      } else {
        if (
          ['constructor', 'static'].includes(type as string) ||
          ['toString', 'toJSON'].includes(member)
        ) {
          // Constructors, constants, and static attributes should not have
          // auto-generated custom tests
          test = false;
        } else {
          let returnValue;
          if (type === 'symbol') {
            const symbol = member.replace('@@', '');
            returnValue = `!!instance && 'Symbol' in self && '${symbol}' in Symbol && Symbol.${symbol} in instance`;
          } else {
            returnValue = `!!instance && '${member}' in instance`;
          }
          test = testbase
            ? testbase +
              (promise
                ? `if (!promise) {
    return {result: false, message: 'Promise variable is falsy'};
  }
  return promise.then(function(instance) {
    return ${returnValue};
  });`
                : callback
                ? `function callback(instance) {
    try {
      success(${returnValue});
    } catch(e) {
      fail(e);
    }
  };
  return 'callback';`
                : `return ${returnValue};`)
            : false;
        }
      }
    }
  }

  if (!test) {
    return false;
  }

  test = compileCustomTest(test);

  if (test.includes('Test is malformed')) {
    console.error(
      `api.${name}${member ? `.${member}` : ''}: ${test.replace('throw ', '')}`
    );
  }

  return test;
};

const getCustomSubtestsAPI = (name: string): {[subtest: string]: string} => {
  const subtests = {};

  if (name in customTests.api) {
    const testbase =
      '__base' in customTests.api[name]
        ? customTests.api[name].__base.replace(/\n/g, '\n  ') + '\n  '
        : '';
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

const getCustomResourcesAPI = (name: string): Resources => {
  const resources: Resources = {};

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

const getCustomTestCSS = (name: string): string | false => {
  return (
    'properties' in customTests.css &&
    name in customTests.css.properties &&
    compileCustomTest(customTests.css.properties[name])
  );
};

const compileTestCode = (test: any): string => {
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
    )}" in Symbol && "${test.owner}" in self && ${test.property} in ${
      test.owner
    }.prototype`;
  }
  if (test.inherit) {
    return `Object.prototype.hasOwnProperty.call(${test.owner}, "${property}")`;
  }
  if (test.owner === 'self' || test.owner === 'document.body.style') {
    return `"${property}" in ${test.owner}`;
  }
  return `"${test.owner.replace(
    '.prototype',
    ''
  )}" in self && "${property}" in ${test.owner}`;
};

const compileTest = (test: RawTest): Test => {
  let code;
  if (Array.isArray(test.raw.code)) {
    const parts = test.raw.code.map(compileTestCode);
    code = parts.join(` ${test.raw.combinator} `);
  } else {
    code = compileTestCode(test.raw.code);
  }

  const {exposure, resources} = test;
  const newTest: Test = {code, exposure};

  if (resources && Object.keys(resources).length) {
    newTest.resources = resources;
  }

  return newTest;
};

const mergeMembers = (target, source) => {
  // Check for duplicate members across partials/mixins.
  const targetMembers = new Set(target.members.map((m) => m.name));
  const sourceMembers = new Set();
  for (const member of source.members) {
    if (targetMembers.has(member.name)) {
      const targetMember = target.members.find((m) => m.name);
      // Static members may have the same name as a non-static member.
      // If target has static member with same name, remove from target.
      // If source has static member with same name, don't merge into target.
      if (targetMember.special === 'static') {
        target.members = target.members.filter((m) => m.name !== member.name);
        sourceMembers.add(member);
      } else if (member.special !== 'static') {
        throw new Error(
          `Duplicate definition of ${target.name}.${member.name}`
        );
      }
    } else {
      sourceMembers.add(member);
    }
  }
  // Now merge members.
  target.members.push(...sourceMembers);
};

const flattenIDL = (specIDLs: IDLFiles, customIDLs: IDLFiles) => {
  let ast: WebIDL2.IDLRootType[] = [];

  for (const idl of Object.values(specIDLs)) {
    ast.push(...idl);
  }

  for (const idl of Object.values(customIDLs)) {
    ast.push(...idl);
  }

  // merge partials (O^2 but still fast)
  ast = ast.filter((dfn) => {
    if (!('partial' in dfn && dfn.partial)) {
      return true;
    }

    const target = ast.find(
      (it) =>
        !('partial' in it && it.partial) &&
        it.type === dfn.type &&
        it.name === dfn.name
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
          !('partial' in it && it.partial) &&
          it.type === 'interface mixin' &&
          it.name === dfn.includes
      );
      if (!mixin) {
        throw new Error(
          `Interface mixin ${dfn.includes} not found for target ${dfn.target}`
        );
      }
      const target = ast.find(
        (it) =>
          !('partial' in it && it.partial) &&
          it.type === 'interface' &&
          it.name === dfn.target
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

  const globals = ast.filter(
    (dfn) => 'name' in dfn && dfn.name === 'WindowOrWorkerGlobalScope'
  );

  // drop includes and mixins
  ast = ast.filter(
    (dfn) => dfn.type !== 'includes' && dfn.type !== 'interface mixin'
  );

  // Get all possible scopes
  const scopes = new Set();
  for (const dfn of ast) {
    // Special case RTCIdentityProviderGlobalScope since it doesn't use the
    // Global extended attribute correctly:
    // https://github.com/w3c/webrtc-identity/pull/36
    if ('name' in dfn && dfn.name === 'RTCIdentityProviderGlobalScope') {
      scopes.add('RTCIdentityProvider');
      continue;
    }

    const attr = getExtAttrSet(dfn, 'Global');
    if (attr) {
      for (const s of attr) {
        scopes.add(s);
      }
    }
  }

  return {ast, globals, scopes};
};

const flattenMembers = (iface) => {
  const members = iface.members.filter(
    (member) => member.name && member.type !== 'const'
  );
  for (const member of iface.members.filter((member) => !member.name)) {
    switch (member.type) {
      case 'constructor':
        // Don't generate tests for [HTMLConstructor]. These are for custom
        // elements, not for constructor the elements themselves:
        // https://html.spec.whatwg.org/multipage/dom.html#html-element-constructors
        if (!getExtAttr(member, 'HTMLConstructor')) {
          // Test generation doesn't use constructor arguments, so they aren't
          // copied
          members.push({name: iface.name, type: 'constructor'});
        }
        break;
      case 'iterable':
        if (member.async) {
          // https://webidl.spec.whatwg.org/#idl-async-iterable
          members.push(
            {name: '@@asyncIterator', type: 'symbol'},
            {name: 'values', type: 'operation'}
          );
          if (member.idlType.length === 2) {
            // https://webidl.spec.whatwg.org/#pair-asynchronously-iterable-declaration
            members.push(
              {name: 'entries', type: 'operation'},
              {name: 'keys', type: 'operation'}
            );
          }
        } else {
          members.push(
            {name: '@@iterator', type: 'symbol'},
            {name: 'entries', type: 'operation'},
            {name: 'forEach', type: 'operation'},
            {name: 'keys', type: 'operation'},
            {name: 'values', type: 'operation'}
          );
        }
        break;
      case 'maplike':
        members.push(
          {name: '@@iterator', type: 'symbol'},
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
          {name: '@@iterator', type: 'symbol'},
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

  // Catch named stringifiers
  if (members.some((member) => member.special === 'stringifier')) {
    members.push({name: 'toString', type: 'operation'});
  }

  // Add members from ExtAttrs
  const legacyFactoryFunction = getExtAttr(iface, 'LegacyFactoryFunction');
  if (legacyFactoryFunction) {
    members.push({
      name: legacyFactoryFunction.rhs.value,
      type: 'constructor'
    });
  }

  return members.sort((a, b) => a.name.localeCompare(b.name));
};

const getExtAttr = (node, name: string) => {
  return node.extAttrs && node.extAttrs.find((i) => i.name === name);
};

const getExtAttrSet = (node, name: string) => {
  const attr = getExtAttr(node, name);
  if (!attr) {
    return null;
  }

  const set: Set<string> = new Set();
  switch (attr.rhs.type) {
    case 'identifier':
      set.add(attr.rhs.value);
      break;
    case 'identifier-list':
      for (const {value} of attr.rhs.value) {
        set.add(value);
      }
      break;
    case '*':
      set.add('*');
      break;
    default:
      throw new Error(
        `Unexpected RHS "${attr.rhs.type}" for ${name} extended attribute`
      );
  }

  return set;
};

// https://webidl.spec.whatwg.org/#Exposed
const getExposureSet = (node, scopes): Set<Exposure> => {
  // step 6-8 of https://webidl.spec.whatwg.org/#dfn-exposure-set
  const exposure = getExtAttrSet(node, 'Exposed');
  if (!exposure) {
    throw new Error(
      `Exposed extended attribute not found on ${node.type} ${node.name}`
    );
  }

  // Handle wildcard exposures
  if (exposure.has('*')) {
    exposure.delete('*');
    for (const value of scopes) {
      exposure.add(value);
    }
  }

  // Special case RTCIdentityProviderGlobalScope since it doesn't use the
  // Exposed extended attribute correctly:
  // https://github.com/w3c/webrtc-identity/pull/36
  if (exposure.has('RTCIdentityProviderGlobalScope')) {
    exposure.delete('RTCIdentityProviderGlobalScope');
    exposure.add('RTCIdentityProvider');
  }

  // Some specs use "DedicatedWorker" for the exposure while others use
  // "Worker". We spawn a dedicated worker for the "Worker" exposure.
  // This code ensures we generate tests for either exposure.
  // https://github.com/foolip/mdn-bcd-collector/pull/811
  if (exposure.has('DedicatedWorker')) {
    exposure.delete('DedicatedWorker');
    exposure.add('Worker');
  }

  for (const e of exposure) {
    if (!scopes.has(e)) {
      throw new Error(
        `${node.type} ${node.name} is exposed on ${e} but ${e} is not a valid scope`
      );
    }
  }

  return exposure as Set<Exposure>;
};

const validateIDL = (ast) => {
  // XXX Typedefs for WebIDL2 are missing validate function
  // XXX https://github.com/DefinitelyTyped/DefinitelyTyped/discussions/63342
  const validations = (WebIDL2 as any).validate(ast).filter((v) => {
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
  const usedTypes: Set<string> = new Set();
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

    // TODO: too many events tests are being generated, see
    // https://github.com/foolip/mdn-bcd-collector/pull/1825#issuecomment-1048009920

    const isStatic = member.special === 'static' || iface.type === 'namespace';
    const isEventHandler =
      member.idlType?.type === 'attribute-type' &&
      typeof member.idlType?.idlType === 'string' &&
      member.idlType?.idlType.endsWith('EventHandler');

    let expr: string | RawTestCodeExpr = '';
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
        case 'constructor':
          expr = {property: `constructor.${member.name}`, owner: iface.name};
          break;
        case 'symbol':
          // eslint-disable-next-line no-case-declarations
          const symbol = member.name.replace('@@', '');
          expr = {property: `Symbol.${symbol}`, owner: iface.name};
          break;
      }
    }

    const name = isEventHandler
      ? `${member.name.replace(/^on/, '')}_event`
      : member.name;

    tests[name] = compileTest({
      raw: {
        code: expr
      },
      exposure: Array.from(exposureSet),
      resources
    });
    handledMemberNames.add(member.name);
  }

  return tests;
};

const buildIDLTests = (ast, globals, scopes) => {
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

    const exposureSet = getExposureSet(iface, scopes);
    const isGlobal = !!getExtAttr(iface, 'Global');
    const customIfaceTest = getCustomTestAPI(iface.name);
    const resources = getCustomResourcesAPI(iface.name);

    tests[`api.${iface.name}`] = compileTest({
      raw: {
        code: customIfaceTest || {property: iface.name, owner: 'self'}
      },
      exposure: Array.from(exposureSet),
      resources
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
        resources
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

const buildIDL = (specIDLs: IDLFiles, customIDLs: IDLFiles) => {
  const {ast, globals, scopes} = flattenIDL(specIDLs, customIDLs);
  validateIDL(ast);
  return buildIDLTests(ast, globals, scopes);
};

// https://drafts.csswg.org/cssom/#css-property-to-idl-attribute
const cssPropertyToIDLAttribute = (
  property: string,
  lowercaseFirst?: boolean
) => {
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

const buildCSS = (specCSS, customCSS) => {
  const properties = new Map();

  for (const data of Object.values(specCSS) as any[]) {
    for (const prop of Object.keys(data.properties)) {
      properties.set(prop, new Map());
    }
  }

  for (const [name, data] of Object.entries(customCSS.properties) as any[]) {
    const values = '__values' in data ? data['__values'] : [];
    const additionalValues =
      '__additional_values' in data ? data['__additional_values'] : {};

    const mergedValues = new Map(Object.entries(additionalValues));
    for (const value of values) {
      if (mergedValues.has(value)) {
        throw new Error(`CSS property value already known: ${value}`);
      }
      mergedValues.set(value, value);
    }

    if (properties.has(name) && mergedValues.size === 0) {
      throw new Error(`Custom CSS property already known: ${name}`);
    }

    properties.set(name, mergedValues);
  }

  const tests = {};

  for (const name of Array.from(properties.keys()).sort()) {
    const customTest = getCustomTestCSS(name);
    if (customTest) {
      tests[`css.properties.${name}`] = compileTest({
        raw: {code: customTest},
        exposure: ['Window']
      });
      continue;
    }

    // Test for the property itself
    tests[`css.properties.${name}`] = compileTest({
      raw: {code: `bcd.testCSSProperty("${name}")`},
      exposure: ['Window']
    });

    // Tests for values
    for (const [key, value] of Array.from(
      properties.get(name).entries()
    ).sort() as any[]) {
      const values = Array.isArray(value) ? value : [value];
      const code = values
        .map((value) => `bcd.testCSSPropertyValue("${name}", "${value}")`)
        .join(' || ');
      tests[`css.properties.${name}.${key}`] = compileTest({
        raw: {code: code},
        exposure: ['Window']
      });
    }
  }

  return tests;
};

const buildJS = (customJS) => {
  const tests = {};

  for (const [path, extras] of Object.entries(customJS.builtins) as any[]) {
    const parts = path.split('.');

    const bcdPath = [
      'javascript',
      'builtins',
      // The "prototype" part is not part of the BCD paths.
      ...parts.filter((p) => p != 'prototype')
    ].join('.');

    if ('code' in extras) {
      // Custom test code, nothing is generated.
      tests[bcdPath] = compileTest({
        raw: {code: extras.code},
        exposure: ['Window']
      });
    } else {
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

      let code = `${owner}.hasOwnProperty(${property})`;

      if (owner !== 'self') {
        if (owner.startsWith('Intl')) {
          if (`"${parts[1]}"` === property) {
            code = `"Intl" in self && ` + code;
          } else {
            code = `"Intl" in self && "${parts[1]}" in Intl && ` + code;
          }
        } else if (owner.startsWith('WebAssembly')) {
          if (`"${parts[1]}"` === property) {
            code = `"WebAssembly" in self && ` + code;
          } else {
            code =
              `"WebAssembly" in self && "${parts[1]}" in WebAssembly && ` +
              code;
          }
        } else {
          code = `"${owner.replace('.prototype', '')}" in self && ` + code;
        }
      }

      tests[bcdPath] = compileTest({
        raw: {code},
        exposure: ['Window']
      });
    }

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

      let rawCode = `var instance = ${maybeNew} ${expr};
  return !!instance;`;

      if (path.startsWith('Intl')) {
        rawCode =
          `if (!("${parts[1]}" in Intl)) {
    return {result: false, message: 'Intl.${parts[1]} is not defined'};
  }
  ` + rawCode;
      } else if (path.startsWith('WebAssembly')) {
        rawCode =
          `if (!("${parts[1]}" in WebAssembly)) {
    return {result: false, message: 'WebAssembly.${parts[1]} is not defined'};
  }
  ` + rawCode;
      }

      rawCode =
        `if (!("${parts[0]}" in self)) {
    return {result: false, message: '${parts[0]} is not defined'};
  }
  ` + rawCode;

      const code = compileCustomTest(rawCode);
      tests[ctorPath] = compileTest({
        raw: {code},
        exposure: ['Window']
      });
    }
  }

  return tests;
};

/* c8 ignore start */
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

const generateCSS = async () => {
  const scssPath = fileURLToPath(new URL('./style.scss', import.meta.url));
  const outPath = path.join(generatedDir, 'resources', 'style.css');
  const result = sass.renderSync({file: scssPath});
  await fs.writeFile(outPath, result.css.toString(), 'utf8');
};

const build = async (customIDL: IDLFiles, customCSS) => {
  const specCSS = await css.listAll();
  const specIDLs: IDLFiles = await idl.parseAll();
  const IDLTests = buildIDL(specIDLs, customIDL);
  const CSSTests = buildCSS(specCSS, customCSS);
  const JSTests = buildJS(customJS);
  const tests = Object.assign({}, IDLTests, CSSTests, JSTests);

  await fs.writeJson(new URL('./tests.json', import.meta.url), tests);
  await copyResources();
  await generateCSS();
};

if (esMain(import.meta)) {
  await build(customIDL, customCSS);
}
/* c8 ignore stop */

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
  buildCSS,
  buildJS
};
