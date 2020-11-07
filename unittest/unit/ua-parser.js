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

const {assert} = require('chai');

const {getMajorMinorVersion, parseUA} = require('../../ua-parser');

const browsers = {
  chrome: {name: 'Chrome', releases: {82: {}, 83: {}, 84: {}, 85: {}}},
  chrome_android: {name: 'Chrome Android', releases: {85: {}}},
  edge: {name: 'Edge', releases: {16: {}, 84: {}}},
  safari: {name: 'Safari', releases: {13: {}, 13.1: {}, 14: {}}},
  safari_ios: {name: 'iOS Safari', releases: {13: {}, 13.3: {}, 13.4: {}, 14: {}}},
  samsunginternet_android: {name: 'Samsung Internet', releases: {'10.0': {}, 10.2: {}, '11.0': {}, 11.2: {}, '12.0': {}, 12.1: {}}}
};

describe('getMajorMinorVersion', () => {
  it('1.2.3', () => {
    assert.strictEqual(getMajorMinorVersion('1.2.3'), '1.2');
  });

  it('10', () => {
    assert.strictEqual(getMajorMinorVersion('10'), '10.0');
  });

  it('10.0', () => {
    assert.strictEqual(getMajorMinorVersion('10.0'), '10.0');
  });

  it('10.01', () => {
    assert.strictEqual(getMajorMinorVersion('10.01'), '10.01');
  });

  it('10.1', () => {
    assert.strictEqual(getMajorMinorVersion('10.1'), '10.1');
  });

  it('58.0.3029.110', () => {
    assert.strictEqual(getMajorMinorVersion('58.0.3029.110'), '58.0');
  });
});

describe('parseUA', () => {
  it('Chrome', () => {
    assert.deepEqual(parseUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36', browsers), {browser: {id: 'chrome', name: 'Chrome'}, version: '85', inBcd: true});
  });

  it('Chrome 1000.1 (not in BCD)', () => {
    assert.deepEqual(parseUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/1000.1.4183.121 Safari/537.36', browsers), {browser: {id: 'chrome', name: 'Chrome'}, version: '1000.1', inBcd: false});
  });

  it('Chrome Android', () => {
    assert.deepEqual(parseUA('Mozilla/5.0 (Linux; Android 11; Pixel 2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36', browsers), {browser: {id: 'chrome_android', name: 'Chrome Android'}, version: '85', inBcd: true});
  });

  it('Edge (EdgeHTML)', () => {
    assert.deepEqual(parseUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299', browsers), {browser: {id: 'edge', name: 'Edge'}, version: '16', inBcd: true});
  });

  it('Edge (Chromium)', () => {
    assert.deepEqual(parseUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36 Edg/84.0.522.59', browsers), {browser: {id: 'edge', name: 'Edge'}, version: '84', inBcd: true});
  });

  it('Safari 14', () => {
    assert.deepEqual(parseUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15', browsers), {browser: {id: 'safari', name: 'Safari'}, version: '14', inBcd: true});
  });

  it('Safari 14.1 (not in BCD)', () => {
    assert.deepEqual(parseUA('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Safari/605.1.15', browsers), {browser: {id: 'safari', name: 'Safari'}, version: '14.1', inBcd: false});
  });

  it('Safari iOS', () => {
    assert.deepEqual(parseUA('Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1', browsers), {browser: {id: 'safari_ios', name: 'iOS Safari'}, version: '13.4', inBcd: true});
  });

  it('Samsung Internet (10.1)', () => {
    assert.deepEqual(parseUA('Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/10.1 Chrome/71.0.3578.99 Mobile Safari/537.36', browsers), {browser: {id: 'samsunginternet_android', name: 'Samsung Internet'}, version: '10.0', inBcd: true});
  });

  it('Samsung Internet (12.0)', () => {
    assert.deepEqual(parseUA('Mozilla/5.0 (Linux; Android 11; Pixel 2) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/12.0 Chrome/79.0.3945.136 Mobile Safari/537.36', browsers), {browser: {id: 'samsunginternet_android', name: 'Samsung Internet'}, version: '12.0', inBcd: true});
  });

  it('Samsung Internet (12.1)', () => {
    assert.deepEqual(parseUA('Mozilla/5.0 (Linux; Android 11; Pixel 2) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/12.1 Chrome/79.0.3945.136 Mobile Safari/537.36', browsers), {browser: {id: 'samsunginternet_android', name: 'Samsung Internet'}, version: '12.1', inBcd: true});
  });

  it('Yandex Browser (not in BCD)', () => {
    assert.deepEqual(parseUA('Mozilla/5.0 (Windows NT 6.3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 YaBrowser/17.6.1.749 Yowser/2.5 Safari/537.36', browsers), {browser: {id: 'yandex', name: 'Yandex'}, version: '17.6', inBcd: undefined});
  });
});
