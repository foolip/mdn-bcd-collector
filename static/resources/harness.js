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

/* global CSS, console, document, window, location, navigator, XMLHttpRequest,
          self, Worker, Promise, setTimeout */

'use strict';

// This harness should work on as old browsers as possible and shouldn't depend
// on any modern JavaScript features.

(function(global) {
  var pending = [];
  var statusElement = 'document' in self && document.getElementById('status');

  var prefixes = {
    api: ['', 'moz', 'Moz', 'webkit', 'WebKit', 'webKit', 'ms', 'MS'],
    css: ['', 'khtml', 'webkit', 'moz', 'ms']
  };
  // TODO Detect browser and select prefixes accordingly (along with
  // allowing testing with alternative name)

  function stringify(value) {
    try {
      return String(value);
    } catch (err) {
      return 'unserializable value';
    }
  }

  function addTest(name, code, scope, info) {
    pending.push({name: name, code: code, scope: scope, info: info});
  }

  // Each test is mapped to an object like this:
  // {
  //   "name": "api.Attr.localName",
  //   "result": true,
  //   "prefix": "",
  //   "info": {
  //     "code": "'localName' in Attr.prototype",
  //     "scope": "Window"
  //   }
  // }
  //
  // If the test doesn't return true or false, or if it throws, `result` will
  // be null and a `message` property is set to an explanation.
  function test(data) {
    var result = {name: data.name, info: {}};
    var category = data.name.split('.')[0];

    var prefixesToTest = [''];
    if (category in prefixes) {
      prefixesToTest = prefixes[category];
    }

    try {
      var parentPrefix = '';
      var code = data.code;
      if (!Array.isArray(code)) {
        code = [code];
      }

      for (var i in code) {
        var subtest = code[i];

        if (typeof(subtest) === 'string') {
          value = eval(subtest);
          // TODO: allow callback and promise-vending funcs
          if (typeof value === 'boolean') {
            result.result = value;
          } else {
            result.result = null;
            result.message = 'returned ' + stringify(value);
          }
        } else if (subtest.property == 'constructor') {
          var iface = parentPrefix+subtest.scope;
          var args = '';
          for (var a = 0; a < eval(iface+'.constructor.length'); a++) {
            if (a == 0) {
              args = args + '\'' + a + '\'';
            } else {
              args = args + ',' + '\'' + a + '\'';
            }
          }

          try {
            result.code = 'new '+iface+'('+args+')';
            eval('new '+iface+'('+args+')');
            result.result = true;
          } catch (err) {
            if (
              err.name == 'TypeError' &&
              err.message == 'Illegal constructor'
            ) {
              result.result = false;
            } else if (err.message.includes('Failed to construct')) {
              // If it failed to construct, and not illegal, there's a
              // constructor
              result.result = true;
            } else {
              result.result = null;
            }

            result.message = 'threw ' + stringify(err);
          }
        } else {
          for (var j in prefixesToTest) {
            var prefix = prefixesToTest[j];
            var property = subtest.property;
            var value;

            if (subtest.scope === 'CSS.supports') {
              if ('CSS' in self) {
                if (prefix) {
                  var prefixToAdd = '-' + prefix;
                  if (!property.startsWith('-')) {
                    prefixToAdd += '-';
                  }
                  property = prefixToAdd + property;
                }

                value = CSS.supports(property, 'inherit');
              } else {
                value = null;
                result.message = 'Browser doesn\'t support CSS API';
                break;
              }
            } else {
              if (prefix) {
                property = prefix + property.charAt(0).toUpperCase() +
                           property.slice(1);
              }

              value = eval('"'+property+'" in '+parentPrefix+subtest.scope);
            }

            result.result = value;
            if (value === true) {
              if (subtest.scope.startsWith('CSS')) {
                if (prefix) {
                  parentPrefix = '-' + prefix + '-';
                } else {
                  parentPrefix = '';
                }
              } else {
                parentPrefix = prefix;
              }
              break;
            }
          }
        }

        if (result.result === false) {
          break;
          // Tests are written in hierarchy order, so if the parent (first
          // test) is unsupported, so is the child (next test)
        }

        result.prefix = parentPrefix;
      }
    } catch (err) {
      result.result = null;
      result.message = 'threw ' + stringify(err);
    }

    if (data.info !== undefined) {
      result.info = Object.assign({}, result.info, data.info);
    }

    result.info.code = data.code;
    result.info.scope = data.scope;

    return result;
  }

  function runCSS(done) {
    var results = [];

    var length = pending.length;
    for (var i = 0; i < length; i++) {
      if (statusElement) {
        statusElement.innerHTML = 'Testing ' + pending[i].name;
      }
      results.push(test(pending[i]));
    }

    pending = [];

    done(results);
  }

  function runWindow(done) {
    var results = [];

    var length = pending.length;
    for (var i = 0; i < length; i++) {
      if (statusElement) {
        statusElement.innerHTML = 'Testing ' + pending[i].name;
      }
      results.push(test(pending[i]));
    }

    pending = [];

    done(results);
  }

  function runWorker(done) {
    var results = [];
    var length = pending.length;
    var i;

    if ('Worker' in self) {
      var myWorker = new Worker('/resources/worker.js');

      var promises = [];
      var testhandlers = {};

      myWorker.onmessage = function(event) {
        testhandlers[event.data.name](event.data);
      };

      for (i = 0; i < length; i++) {
        promises.push(new Promise(function(resolve) {
          if (statusElement) {
            statusElement.innerHTML = 'Testing ' + pending[i].name;
          }
          myWorker.postMessage(pending[i]);

          testhandlers[pending[i].name] = function(message) {
            results.push(message);
            resolve();
          };
        }));
      }

      Promise.allSettled(promises).then(function() {
        pending = [];

        done(results);
      });
    } else {
      console.log('No worker support');
      if (statusElement) {
        statusElement.innerHTML = 'No worker support, skipping';
      }

      for (i = 0; i < length; i++) {
        var result = {
          name: pending[i].name,
          result: false,
          message: 'No worker support'
        };

        if (pending[i].info !== undefined) {
          result.info = pending[i].info;
        }

        results.push(result);
      }

      pending = [];

      done(results);
    }
  }

  function runServiceWorker(done) {
    var results = [];

    if ('serviceWorker' in navigator) {
      window.__workerCleanup().then(function() {
        console.log('Starting registration');
        navigator.serviceWorker.register('/resources/serviceworker.js')
            .then(function(reg) {
              console.log('Registered, waiting for activation');
              return window.__waitForSWState(reg, 'activated');
            })
            .then(function(reg) {
              console.log('Activated');
              var promises = [];

              var length = pending.length;
              for (var i = 0; i < length; i++) {
                promises.push(new Promise(function(resolve) {
                  if (statusElement) {
                    statusElement.innerHTML = 'Testing ' + pending[i].name;
                  }

                  var broadcast = new window.BroadcastChannel2(
                      pending[i].name, {
                        type: 'BroadcastChannel' in self ? 'native' : 'idb',
                        webWorkerSupport: true
                      }
                  );

                  reg.active.postMessage(pending[i]);

                  broadcast.onmessage = function(message) {
                    results.push(message);
                    resolve();
                  };
                }));
              }

              Promise.allSettled(promises).then(function() {
                console.log('All tests done');
                pending = [];

                window.__workerCleanup().then(function() {
                  console.log('Cleaning up');
                  done(results);
                });
              });
            })
            .catch(function(error) {
              console.error(error);
            });
      });
    } else {
      console.log('No service worker support');
      if (statusElement) {
        statusElement.innerHTML = 'No service worker support, skipping';
      }

      var length = pending.length;
      for (var i = 0; i < length; i++) {
        var result = {
          name: pending[i].name,
          result: false,
          message: 'No service worker support'
        };

        if (pending[i].info !== undefined) {
          result.info = pending[i].info;
        }

        results.push(result);
      }

      pending = [];

      done(results);
    }
  }

  function run(scope, done) {
    setTimeout(function() {
      if (statusElement) {
        statusElement.innerHTML = statusElement.innerHTML +
          '<br />This test seems to be taking a long time; it may have ' +
          'crashed. Check the console for errors.';
      }
    }, 10000);

    if (scope === 'CSS') {
      runCSS(done || report);
    } else if (scope === 'Window') {
      runWindow(done || report);
    } else if (scope === 'Worker') {
      runWorker(done || report);
    } else if (scope === 'ServiceWorker') {
      runServiceWorker(done || report);
    } else {
      console.error('Unknown scope specified: ' + scope);
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
    window.__waitForSWState = function(registration, desiredState) {
      return new Promise(function(resolve, reject) {
        var serviceWorker = registration.installing;

        if (!serviceWorker) {
          // If the service worker isn't installing, it was probably
          // interrupted during a test.
          window.location.reload();

          return reject(new Error('The service worker is not installing. ' +
            'Is the test environment clean?'));
        }

        function stateListener(evt) {
          if (evt.target.state === desiredState) {
            serviceWorker.removeEventListener('statechange', stateListener);
            return resolve(registration);
          }

          if (evt.target.state === 'redundant') {
            serviceWorker.removeEventListener('statechange', stateListener);

            return reject(
                new Error('Installing service worker became redundant')
            );
          }
        }

        serviceWorker.addEventListener('statechange', stateListener);
      });
    };

    window.__workerCleanup = function() {
      if ('getRegistrations' in navigator.serviceWorker) {
        return navigator.serviceWorker.getRegistrations()
            .then(function(registrations) {
              var unregisterPromise = registrations.map(function(registration) {
                return registration.unregister();
              });
              return Promise.all(unregisterPromise);
            });
      } else {
        return navigator.serviceWorker.getRegistration()
            .then(function(registration) {
              if (registration) {
                return registration.unregister();
              }
            });
      }
    };
  }

  global.stringify = stringify;

  global.bcd = {
    addTest: addTest,
    test: test,
    run: run
  };
})(this);
