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

var window = {}; // Needed for the BroadcastChannel polyfill

self.importScripts('broadcastchannel.js');

self.addEventListener('install', (event) => {
  const promiseChain = caches.open('test-cache')
  .then((openCache) => {
    return openCache.put(
      new Request('/__test/example'),
      new Response(PeriodicSyncEvent)
    );
  });
  event.waitUntil(promiseChain);
});

self.addEventListener('message', function(event) {
  function stringify(value) {
    try {
      return String(value);
    } catch (err) {
      return 'unserializable value';
    }
  }

  var name = event.data[0];
  var func = event.data[1];
  var scope = event.data[2];
  var info = event.data[3];

  var result = { name: name, info: {} };

  try {
    var value = eval(func);
    // TODO: allow callback and promise-vending funcs
    if (typeof value === 'boolean') {
      result.result = value;
    } else {
      result.result = null;
      result.message = 'returned ' + stringify(value);
    }
  } catch (err) {
    result.result = null;
    result.message = 'threw ' + stringify(err);
  }

  if (info !== undefined) {
    result.info = info;
  }

  result.info.code = func;
  result.info.scope = scope;

  var broadcast = new window.BroadcastChannel2(name, {type: 'idb', webWorkerSupport: true});
  broadcast.postMessage(result);
})