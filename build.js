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

const fs = require('fs-extra');
const path = require('path');
const WebIDL2 = require('webidl2');
const bcd = require('mdn-browser-compat-data');

const customTests = require('./custom-tests.json');
const webref = require('./webref');

const generatedDir = path.join(__dirname, 'generated');

function writeText(filename, content) {
  if (Array.isArray(content)) {
    content = content.join('\n');
  }
  content = content.trimEnd() + '\n';
  fs.ensureDirSync(path.dirname(filename));
  fs.writeFileSync(filename, content, 'utf8');
}

function getCustomTestAPI(name, member) {
  let test = false;

  if (name in customTests.api) {
    const testbase = customTests.api[name].__base || '';
    if (member === undefined) {
      if ('__test' in customTests.api[name]) {
        test = testbase + customTests.api[name].__test;
      } else {
        test = testbase ? testbase + 'return !!instance;' : false;
      }
    } else {
      if (member in customTests.api[name]) {
        test = testbase + customTests.api[name][member];
      } else {
        test = testbase ?
          testbase + `return instance && '${member}' in instance;` :
          false;
      }
    }
  } else {
    if (name in customTests.api && member in customTests.api[name]) {
      test = customTests.api[name][member];
    }
  }

  if (test) {
    test = `(function() {${test}})()`;
  }

  return test;
}

function getCustomTestCSS(name) {
  return 'properties' in customTests.css &&
      name in customTests.css.properties &&
      `(function() {${customTests.css.properties[name]}})()`;
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
    }
    for (const statement of Object.values(support)) {
      process(statement);
    }
  }
}

function collectCSSPropertiesFromReffy(webref, propertySet) {
  for (const data of Object.values(webref.css)) {
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

function buildCSS(webref, bcd) {
  const propertySet = new Set;
  collectCSSPropertiesFromBCD(bcd, propertySet);
  collectCSSPropertiesFromReffy(webref, propertySet);

  const tests = {};

  for (const name of Array.from(propertySet).sort()) {
    const attrName = cssPropertyToIDLAttribute(name, name.startsWith('-'));
    tests[`css.properties.${name}`] = {
      'test': getCustomTestCSS(name) || [
        {property: attrName, scope: 'document.body.style'},
        {property: name, scope: 'CSS.supports'}
      ],
      'combinator': 'or',
      'scope': 'CSS'
    };
  }

  return tests;
}

/* istanbul ignore next */
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

function flattenMembers(iface) {
  const members = iface.members.filter((member) => member.name);
  for (const member of iface.members.filter((member) => !member.name)) {
    switch (member.type) {
      case 'constructor':
        members.push({name: iface.name, type: 'constructor'});
        break;
      case 'iterable':
        members.push(
            {name: 'entries', type: 'operation'},
            {name: 'keys', type: 'operation'},
            {name: 'values', type: 'operation'},
            {name: 'forEach', type: 'operation'},
            {name: '@@iterator', type: 'symbol'}
        );
        break;
      case 'maplike':
        members.push(
            {name: 'size', type: 'operation'},
            {name: 'entries', type: 'operation'},
            {name: 'keys', type: 'operation'},
            {name: 'values', type: 'operation'},
            {name: 'get', type: 'operation'},
            {name: 'has', type: 'operation'},
            {name: 'clear', type: 'operation'},
            {name: 'delete', type: 'operation'},
            {name: 'set', type: 'operation'},
            {name: 'forEach', type: 'operation'}
        );
        break;
      case 'setlike':
        members.push(
            {name: 'size', type: 'operation'},
            {name: 'entries', type: 'operation'},
            {name: 'values', type: 'operation'},
            {name: 'keys', type: 'operation'},
            {name: 'has', type: 'operation'},
            {name: 'add', type: 'operation'},
            {name: 'delete', type: 'operation'},
            {name: 'clear', type: 'operation'}
        );
        break;
      case 'operation':
        // We don't care about setter/getter functions
        break;
    }
  }
  if (getExtAttr(iface, 'Constructor')) {
    members.push({name: iface.name, type: 'constructor'});
  }

  return members.sort((a, b) => a.name.localeCompare(b.name));
}

function getExtAttr(node, name) {
  return node.extAttrs && node.extAttrs.find((i) => i.name === name);
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
      /* istanbul ignore next */
      throw new Error(`Unexpected RHS for Exposed extended attribute`);
  }
  return globals;
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
    'replace-void',
    'require-exposed'
  ]);

  const validations = WebIDL2.validate(ast);

  // Monkey-patching support for https://github.com/w3c/webidl2.js/issues/484
  for (const dfn of ast) {
    if (!dfn.members || dfn.members.length == 0) {
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

  const validationErrors = [];
  for (const {ruleName, message} of validations) {
    if (ignoreRules.has(ruleName)) {
      continue;
    }
    validationErrors.push(`${message} [${ruleName}]`);
  }

  if (validationErrors.length) {
    throw new Error(`Validation errors:\n\n${validationErrors.join('\n')}`);
  }

  return true;
}

function buildIDL(webref) {
  const ast = flattenIDL(webref.idl, collectExtraIDL());
  validateIDL(ast);

  const tests = {};

  const interfaces = ast.filter((dfn) =>
    dfn.type === 'interface' ||
    dfn.type === 'namespace' ||
    dfn.type === 'dictionary'
  );
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

    tests[`api.${iface.name}`] = {
      'test': customIfaceTest || {property: iface.name, scope: 'self'},
      'combinator': 'and',
      'scope': Array.from(exposureSet)
    };

    const members = flattenMembers(iface);

    // Avoid generating duplicate tests for operations.
    const handledMemberNames = new Set();

    for (const member of members) {
      if (handledMemberNames.has(member.name)) {
        continue;
      }

      let expr;
      const customTestMember = getCustomTestAPI(iface.name, member.name);

      if (customTestMember) {
        expr = customIfaceTest ?
               customTestMember :
               [{property: iface.name, scope: 'self'}, customTestMember];
      } else {
        const isStatic = (
          member.special === 'static' ||
          iface.type === 'namespace' ||
          iface.type === 'dictionary'
        );
        switch (member.type) {
          case 'attribute':
          case 'operation':
          case 'field':
            if (isGlobal) {
              expr = {property: member.name, scope: 'self'};
            } else if (isStatic) {
              expr = [
                {property: iface.name, scope: 'self'},
                {property: member.name, scope: iface.name}
              ];
            } else {
              expr = [
                {property: iface.name, scope: 'self'},
                {property: member.name, scope: `${iface.name}.prototype`}
              ];
            }
            break;
          case 'const':
            if (isGlobal) {
              expr = {property: member.name, scope: 'self'};
            } else {
              expr = [
                {property: iface.name, scope: 'self'},
                {property: member.name, scope: iface.name}
              ];
            }
            break;
          case 'constructor':
            expr = [
              {property: iface.name, scope: 'self'},
              {property: 'constructor', scope: iface.name}
            ];
            break;
          case 'symbol':
            // eslint-disable-next-line no-case-declarations
            const symbol = member.name.replace('@@', '');
            expr = [
              {property: iface.name, scope: 'self'},
              {property: 'Symbol', scope: 'self'},
              {property: symbol, scope: 'Symbol'},
              {property: `Symbol.${symbol}`, scope: `${iface.name}.prototype`}
            ];
            break;
        }
      }

      tests[`api.${iface.name}.${member.name}`] = {
        'test': expr,
        'combinator': 'and',
        'scope': Array.from(exposureSet)
      };
      handledMemberNames.add(member.name);
    }
  }

  return tests;
}

async function writeManifest(manifest) {
  writeText('MANIFEST.json', JSON.stringify(manifest, null, '  '));
}

function copyResources() {
  const resources = [
    ['json3/lib/json3.min.js', 'resources'],
    ['core-js-bundle/minified.js', 'resources', 'core.js'],
    ['core-js-bundle/minified.js.map', 'resources', 'core.js.map'],
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

  // Fix source mapping in core-js
  const corejsPath = path.join(generatedDir, 'resources', 'core.js');
  fs.readFile(corejsPath, 'utf8', function(err, data) {
    if (err) {
      return console.log(err);
    }
    const result = data.replace(
        /sourceMappingURL=minified\.js\.map/g,
        'sourceMappingURL=core.js.map'
    );

    fs.writeFile(corejsPath, result, 'utf8', function(err) {
      if (err) return console.log(err);
    });
  });
}

async function build(webref, bcd) {
  const manifest = {
    tests: {},
    endpoints: {
      main: {},
      individual: {}
    }
  };

  for (const buildFunc of [buildIDL, buildCSS]) {
    const tests = buildFunc(webref, bcd);
    manifest.tests = Object.assign(manifest.tests, tests);
    for (const [ident, test] of Object.entries(tests)) {
      const scopes = Array.isArray(test.scope) ? test.scope : [test.scope];
      for (const scope of scopes) {
        let endpoint = '';
        switch (scope) {
          case 'Window':
            endpoint = '/api/interfaces';
            break;
          case 'Worker':
            endpoint = '/api/workerinterfaces';
            break;
          case 'ServiceWorker':
            endpoint = '/api/serviceworkerinterfaces';
            break;
          case 'CSS':
            endpoint = '/css/properties';
            break;
        }

        if (!(endpoint in manifest.endpoints.main)) {
          manifest.endpoints.main[endpoint] = [];
        }
        manifest.endpoints.main[endpoint].push(ident);
      }

      let url = '';
      for (const part of ident.split('.')) {
        url += '/' + part;

        if (!(url in manifest.endpoints.individual)) {
          manifest.endpoints.individual[url] = [];
        }
        manifest.endpoints.individual[url].push(ident);
      }
    }
  }

  await writeManifest(manifest);
  copyResources();
}

/* istanbul ignore if */
if (require.main === module) {
  build(webref, bcd).catch((reason) => {
    console.error(reason);
    process.exit(1);
  });
} else {
  module.exports = {
    writeText,
    getCustomTestAPI,
    getCustomTestCSS,
    collectCSSPropertiesFromBCD,
    collectCSSPropertiesFromReffy,
    cssPropertyToIDLAttribute,
    flattenIDL,
    getExposureSet,
    buildIDL,
    validateIDL
  };
}
