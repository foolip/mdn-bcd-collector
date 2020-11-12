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

/* global self, caches, Request, Response */
/* global bcd */

self.importScripts('harness.js');

self.addEventListener('install', function(event) {
  var promiseChain = caches.open('test-cache')
      .then(function(openCache) {
        return openCache.put(
            new Request(''),
            new Response('')
        );
      });
  event.waitUntil(promiseChain);
});

self.addEventListener('message', function(event) {
  var pending = event.data;
  var results = [];

  if (pending) {
    var completedTests = 0;

    var oncomplete = function(result) {
      results.push(result);
      completedTests += 1;
      if (completedTests >= pending.length) {
        event.ports[0].postMessage(results);
      }
    }

    for (var i = 0; i < pending.length; i++) {
      bcd.test(pending[i], oncomplete);
    }
  } else {
    event.ports[0].postMessage(results);
  }
});
