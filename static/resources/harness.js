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
          self, Worker, Promise, setTimeout, clearTimeout */

'use strict';

// This harness should work on as old browsers as possible and shouldn't depend
// on any modern JavaScript features.

(function(global) {
  var pending = [];

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

  function stringStartsWith(string, search) {
    if (string.startsWith) {
      return string.startsWith(search);
    }
    return string.substring(0, 0 + search.length) === search;
  }

  function stringIncludes(string, search) {
    if (string.includes) {
      return string.includes(search);
    }
    return string.indexOf(search) !== -1;
  }

  function updateStatus(newStatus, append) {
    var statusElement = document.getElementById('status');
    if (!statusElement) return;

    if (append) {
      statusElement.innerHTML = statusElement.innerHTML + newStatus;
    } else {
      statusElement.innerHTML = newStatus;
    }
  }

  function addTest(name, code, scope, info) {
    pending.push({name: name, code: code, scope: scope, info: info});
  }

  // eslint-disable-next-line no-unused-vars
  function testWithPrefix(data) {
    // XXX Not actively used; kept for historical purposes. Code compilation
    // has been moved to the server-side, aside from prefixes. Once prefixes
    // are implemented, remove this code

    var result = {name: data.name, info: {}};
    var category = data.name.split('.')[0];

    var prefixesToTest = [''];
    if (category in prefixes) {
      prefixesToTest = prefixes[category];
    }

    try {
      var parentPrefix = '';
      var code = data.code;
      var compiledCode = [];
      if (!Array.isArray(code)) {
        code = [code];
      }

      for (var i in code) {
        var subtest = code[i];

        if (typeof(subtest) === 'string') {
          compiledCode.push(subtest);
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
          compiledCode.push('new '+iface+'()');

          try {
            eval('new '+iface+'()');
            result.result = true;
          } catch (err) {
            if (
              stringIncludes(err.message, 'Illegal constructor') ||
              stringIncludes(err.message, 'Function expected')
            ) {
              result.result = false;
            } else if (
              stringIncludes(err.message, 'Not enough arguments') ||
              stringIncludes(err.message, 'argument required') ||
              stringIncludes(err.message, 'arguments required') ||
              stringIncludes(err.message, 'Argument not optional')
            ) {
              // If it failed to construct and it's not illegal or just needs
              // more arguments, the constructor's good
              result.result = true;
            } else {
              result.result = null;
            }

            result.message = 'threw ' + stringify(err);
          }
        } else {
          var compiled = '';

          for (var j in prefixesToTest) {
            var prefix = prefixesToTest[j];
            var property = subtest.property;
            var value;
            var thisCompiled = '';

            if (subtest.scope === 'CSS.supports') {
              if ('CSS' in self) {
                if (prefix) {
                  var prefixToAdd = '-' + prefix;
                  if (!stringStartsWith(property, '-')) {
                    prefixToAdd += '-';
                  }
                  property = prefixToAdd + property;
                }

                thisCompiled = 'CSS.supports(\'' +
                    property + '\', \'inherit\');';
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

              if (stringStartsWith(property, 'Symbol.')) {
                thisCompiled = property+' in '+parentPrefix+subtest.scope;
                value = eval(thisCompiled);
              } else {
                thisCompiled = '"'+property+'" in '+parentPrefix+subtest.scope;
                value = eval(thisCompiled);
              }

              if (!compiled) {
                // Set to first compiled statement in case support is false
                compiled = thisCompiled;
              }
            }

            result.result = value;
            if (value === true) {
              compiled = thisCompiled;

              if (subtest.scope === 'CSS.supports') {
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

          compiledCode.push(compiled);
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

    result.info.code = compiledCode.join(' && ');
    result.info.scope = data.scope;

    return result;
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
      result.result = eval(data.code);
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

  function runCSS(callback) {
    var results = [];

    var length = pending.length;
    for (var i = 0; i < length; i++) {
      updateStatus('Testing ' + pending[i].name);
      results.push(test(pending[i]));
    }

    pending = [];

    callback(results);
  }

  function runWindow(callback) {
    var results = [];

    var length = pending.length;
    for (var i = 0; i < length; i++) {
      updateStatus('Testing ' + pending[i].name);
      results.push(test(pending[i]));
    }

    pending = [];

    callback(results);
  }

  function runWorker(callback) {
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
          updateStatus('Testing ' + pending[i].name);
          myWorker.postMessage(pending[i]);

          testhandlers[pending[i].name] = function(message) {
            results.push(message);
            resolve();
          };
        }));
      }

      Promise.allSettled(promises).then(function() {
        pending = [];

        callback(results);
      });
    } else {
      console.log('No worker support');
      updateStatus('No worker support, skipping');

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

      callback(results);
    }
  }

  function runServiceWorker(callback) {
    var results = [];

    if ('serviceWorker' in navigator) {
      window.__workerCleanup().then(function() {
        navigator.serviceWorker.register('/resources/serviceworker.js', {
          scope: '/resources/'
        }).then(function(reg) {
          return window.__waitForSWState(reg, 'activated');
        }).then(navigator.serviceWorker.ready).then(function(reg) {
          var promises = [];
          var testhandlers = {};

          navigator.serviceWorker.onmessage = function(event) {
            testhandlers[event.data.name](event.data);
          };

          var length = pending.length;
          for (var i = 0; i < length; i++) {
            promises.push(new Promise(function(resolve) {
              updateStatus('Testing ' + pending[i].name);

              reg.active.postMessage(pending[i]);

              testhandlers[pending[i].name] = function(message) {
                results.push(message);
                resolve();
              };
            }));
          }

          Promise.allSettled(promises).then(function() {
            pending = [];

            window.__workerCleanup().then(function() {
              callback(results);
            });
          });
        });
      });
    } else {
      console.log('No service worker support, skipping');
      updateStatus('No service worker support, skipping');

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

      callback(results);
    }
  }

  function run(scope, callback) {
    var timeout = setTimeout(function() {
      updateStatus('<br />This test seems to be taking a long time; ' +
          'it may have crashed. Check the console for errors.', true);
    }, 10000);

    var onfinish = function(results) {
      clearTimeout(timeout);

      if (callback) {
        callback(results);
      } else {
        report(results);
      }
    };

    if (scope === 'CSS') {
      runCSS(onfinish);
    } else if (scope === 'Window') {
      runWindow(onfinish);
    } else if (scope === 'Worker') {
      runWorker(onfinish);
    } else if (scope === 'ServiceWorker') {
      runServiceWorker(onfinish);
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

  function finishAndDisplay(results) {
    var response = '';
    for (var i=0; i<results.length; i++) {
      var result = results[i];
      response += result.name + ': <strong>' + result.result;
      if (result.prefix) response += ' (' + result.prefix + ' prefix)';
      response += '</strong>\n<code>' + result.info.code + ';</code>\n\n';
    }
    updateStatus(response.replace(/\n/g, '<br />'));
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
        return navigator.serviceWorker.getRegistration('/resources/')
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
    run: run,
    finishAndDisplay: finishAndDisplay
  };
})(this);
