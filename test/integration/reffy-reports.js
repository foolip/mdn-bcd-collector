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

describe('reffy-reports', () => {
  let reffy;

  it('require module', () => {
    reffy = require('../../reffy-reports');
  });

  it('has some CSS data', () => {
    assert('white-space' in reffy.css['css-text'].properties);
  });

  it('has some IDL data', () => {
    const iface = reffy.idl.dom.find((node) => node.name === 'Attr');
    assert(iface);
    const member = iface.members.find((m) => m.name === 'specified');
    assert(member);
  });
});
