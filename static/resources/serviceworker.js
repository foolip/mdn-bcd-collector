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

/* global self, caches, Request, Response, bcd */

self.importScripts('harness.js');

self.addEventListener('install', function (event) {
  var promiseChain = caches.open('test-cache').then(function (openCache) {
    return openCache.put(new Request(''), new Response(''));
  });
  event.waitUntil(promiseChain);
});

self.addEventListener('message', function (event) {
  var data = JSON.parse(event.data);

  for (var i in data.instances) {
    bcd.addInstance(i, data.instances[i]);
  }

  bcd.runTests(data.tests, function (results) {
    event.ports[0].postMessage(JSON.stringify(results));
  });
});
