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

const {
  getMajorMinorVersion,
  getBrowserAndVersion,
} = require('../../ua-parser');

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

describe('getBrowserAndVersion', () => {
  it('Chrome', () => {
    assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36', bcd.browsers), ['chrome', '85']);
  });

  it('Chrome 100 (not in BCD)', () => {
    assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4183.121 Safari/537.36', bcd.browsers), ['chrome', null]);
  });

  it('Chrome Android', () => {
    assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (Linux; Android 11; Pixel 2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36', bcd.browsers), ['chrome_android', '85']);
  });

  it('Edge (EdgeHTML)', () => {
    assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36 Edge/16.16299', bcd.browsers), ['edge', '16']);
  });

  it('Edge (Chromium)', () => {
    assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.125 Safari/537.36 Edg/84.0.522.59', bcd.browsers), ['edge', '84']);
  });

  it('Safari 14', () => {
    assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Safari/605.1.15', bcd.browsers), ['safari', '14']);
  });

  it('Safari 14.1 (not in BCD)', () => {
    assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Safari/605.1.15', bcd.browsers), ['safari', null]);
  });

  it('Safari iOS', () => {
    assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1', bcd.browsers), ['safari_ios', '13.4']);
  });

  it('Samsung Internet (10.1)', () => {
    assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (Linux; Android 9; SAMSUNG SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/10.1 Chrome/71.0.3578.99 Mobile Safari/537.36', bcd.browsers), ['samsunginternet_android', '10.0']);
  });

  it('Samsung Internet (12.0)', () => {
    assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (Linux; Android 11; Pixel 2) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/12.0 Chrome/79.0.3945.136 Mobile Safari/537.36', bcd.browsers), ['samsunginternet_android', '12.0']);
  });

  it('Samsung Internet (12.1)', () => {
    assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (Linux; Android 11; Pixel 2) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/12.1 Chrome/79.0.3945.136 Mobile Safari/537.36', bcd.browsers), ['samsunginternet_android', '12.1']);
  });

  it('Yandex Browser (not in BCD)', () => {
    assert.deepEqual(getBrowserAndVersion('Mozilla/5.0 (Windows NT 6.3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 YaBrowser/17.6.1.749 Yowser/2.5 Safari/537.36', bcd.browsers), [null, null]);
  });
});
