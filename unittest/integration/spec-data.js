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
const assert = chai.assert;

describe('spec-data', () => {
  let specData;

  it('require module', () => {
    specData = require('../../spec-data');
  });

  it('has webref CSS data', () => {
    assert('white-space' in specData.webref.css['css-text'].properties);
  });

  it('has webref IDL data', () => {
    const iface = specData.webref.idl.dom.find((node) => node.name === 'Attr');
    assert(iface);
    const member = iface.members.find((m) => m.name === 'specified');
    assert(member);
  });
});
