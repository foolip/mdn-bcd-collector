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

/* global window, location, XMLHttpRequest */

'use strict';

// This harness should work on as old browsers as possible and shouldn't depend
// on any modern JavaScript features.

(function(global) {
  var pending = [];

  function stringify(value) {
    try {
      return String(value);
    } catch (err) {
      return 'unserializable value';
    }
  }

  function addTest(name, fn, scope, info) {
    pending.push([name, fn, scope, info]);
  }

  // Each test is mapped to an object like this:
  // {
  //   "name": "api.Attr.localName",
  //   "result": true,
  //   "info": {
  //     "code": "'localName' in Attr.prototype",
  //     "scope": "Window"
  //   }
  // }
  //
  // If the test doesn't return true or false, or if it throws, `result` will
  // be null and a `message` property is set to an explanation.
  function test(data) {
    var name = data[0];
    var func = data[1];
    var scope = data[2];
    var info = data[3];

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

    return result;
  }

  function run(done) {
    var results = [];

    var length = pending.length;
    for (var i = 0; i < length; i++) {
      results.push(test(pending[i]));
    }

    pending = [];

    if (done) {
      done(results);
    } else {
      report(results);
    }
  }

  function runWorker(done) {
    var results = [];

    if ('serviceWorker' in navigator) {
      window.__workerCleanup();

      navigator.serviceWorker.register('/resources/worker.js')
      .then(function (reg) {
        return window.__waitForSWState(reg, 'activated');
      })
      .then(function (reg) {
        var promises = [];

        var length = pending.length;
        for (var i = 0; i < length; i++) {
          promises.push(new Promise(function (resolve, reject) {
            var broadcast = new window.BroadcastChannel2(pending[i][0], {type: 'idb', webWorkerSupport: true});

            reg.active.postMessage(pending[i]);

            broadcast.onmessage = function(event) {
              results.push(event.data);
              resolve();
            }
          }));
        }

        Promise.allSettled(promises).then(function() {
          pending = [];

          window.__workerCleanup().then(function() {
            if (done) {
              done(results);
            } else {
              report(results);
            }
          });
        });
      });
    } else {
      console.log('No worker support');

      var length = pending.length;
      for (var i = 0; i < length; i++) {
        var name = pending[i][0];
        var info = pending[i][2];

        var result = { name: name, result: false };

        if (info !== undefined) {
          result.info = info;
        }

        results.push(result);
      }

      pending = [];

      if (done) {
        done(results);
      } else {
        report(results);
      }
    }
  }

  function report(results) {
    var body = JSON.stringify(results);
    var client = new XMLHttpRequest();
    client.open('POST', '/api/results?for='+encodeURIComponent(location.href));
    client.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    client.send(body);
    client.onreadystatechange = function() {
      if (client.readyState == 4) {
        var response = JSON.parse(client.responseText);
        // Navigate to the next page, or /results/ if none.
        var nextURL = response.next || '/results/';
        window.location = nextURL;
      }
    };
  }

  // Service Worker helpers
  if ('serviceWorker' in navigator) {
    window.__waitForSWState = function (registration, desiredState) {
      return new Promise(function (resolve, reject) {
        let serviceWorker = registration.installing;

        if (!serviceWorker) {
          return reject(new Error('The service worker is not installing. ' +
            'Is the test environment clean?'));
        }

        const stateListener = function (evt) {
          if (evt.target.state === desiredState) {
            serviceWorker.removeEventListener('statechange', stateListener);
            return resolve(registration);
          }

          if (evt.target.state === 'redundant') {
            serviceWorker.removeEventListener('statechange', stateListener);

            return reject(new Error('Installing service worker became redundant'));
          }
        };

        serviceWorker.addEventListener('statechange', stateListener);
      });
    }


    window.__workerCleanup = function () {
      function unregisterSW() {
        return navigator.serviceWorker.getRegistrations()
        .then(function (registrations) {
          const unregisterPromise = registrations.map(function (registration) {
            return registration.unregister();
          });
          return Promise.all(unregisterPromise);
        });
      };

      function clearCaches() {
        return window.caches.keys()
        .then(function (cacheNames) {
          return Promise.all(cacheNames.map(function (cacheName) {
            return window.caches.delete(cacheName);
          }));
        });
      };

      return Promise.all([
        unregisterSW(),
        clearCaches(),
      ]);
    };
  }

  global.stringify = stringify;

  global.bcd = {
    addTest: addTest,
    test: test,
    run: run,
    runWorker: runWorker
  };
})(this);
