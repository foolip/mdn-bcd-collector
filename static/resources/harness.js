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

/* global console, document, window, location, navigator, XMLHttpRequest,
          self, Worker, Promise, setTimeout, clearTimeout, MessageChannel,
          SharedWorker, ActiveXObject */

'use strict';

// This harness should work on as old browsers as possible and shouldn't depend
// on any modern JavaScript features.

(function(global) {
  var pending = {};
  var resources = {
    required: 0,
    loaded: 0,
    testsStarted: false
  };
  var reusableInstances = {};

  /* istanbul ignore next */
  function consoleLog(message) {
    if ('console' in self) {
      console.log(message);
    }
  }

  /* istanbul ignore next */
  function consoleError(message) {
    if ('console' in self) {
      console.error(message);
    }
  }

  /* istanbul ignore next */
  function stringify(value) {
    try {
      return String(value);
    } catch (err) {
      return 'unserializable value';
    }
  }

  /* istanbul ignore next */
  function stringIncludes(string, search) {
    if (string.includes) {
      return string.includes(search);
    }
    return string.indexOf(search) !== -1;
  }

  function updateStatus(newStatus, append) {
    var statusElement = document.getElementById('status');
    if (!statusElement) {
      return;
    }

    if (append) {
      statusElement.innerHTML = statusElement.innerHTML + newStatus;
    } else {
      statusElement.innerHTML = newStatus;
    }

    consoleLog(statusElement.innerHTML);
  }

  function addInstance(name, code) {
    try {
      reusableInstances[name] = eval('(function () {' + code + '})()');
    } catch (e) {
      reusableInstances[name] = false;
      consoleError(e);
    }
  }

  function addTest(name, tests, exposure, info) {
    if (!(exposure in pending)) {
      pending[exposure] = [];
    }

    pending[exposure].push({
      name: name,
      tests: tests,
      exposure: exposure,
      info: info
    });
  }

  function testConstructor(iface) {
    var result = {};

    try {
      eval('new '+iface+'()');
      result.result = true;
    } catch (err) {
      if (
        stringIncludes(err.message, 'Illegal constructor') ||
        stringIncludes(err.message, 'function is not a constructor') ||
        stringIncludes(err.message, 'Function expected')
      ) {
        result.result = false;
      } else if (
        stringIncludes(err.message, 'Not enough arguments') ||
        stringIncludes(err.message, 'argument required') ||
        stringIncludes(err.message, 'arguments required') ||
        stringIncludes(err.message, 'Argument not optional') ||
        stringIncludes(err.message, 'Arguments can\'t be empty')
      ) {
        // If it failed to construct and it's not illegal or just needs
        // more arguments, the constructor's good
        result.result = true;
      } else {
        result.result = null;
      }

      result.message = 'threw ' + stringify(err);
    }

    return result;
  }

  // Once a test is evaluated and run, it calls this function with the result.
  // This function then compiles a result object from the given result value,
  // and then passes the result to `callback()` (or if the result is not true
  // and there are more test variants, run the next test variant).
  //
  // If the test result is an error or non-boolean, the result value is set to
  // `null` and the original value is mentioned in the result message.
  //
  // Test results are mapped into objects like this:
  // {
  //   "name": "api.Attr.localName",
  //   "result": true,
  //   "prefix": "",
  //   "info": {
  //     "code": "'localName' in Attr.prototype",
  //     "exposure": "Window"
  //   }
  // }
  function processTestResult(value, data, i, callback) {
    var result = {name: data.name, info: {}};

    if (value && typeof value === 'object' && 'result' in value) {
      result.result = value.result;
      if (value.message) {
        result.message = value.message;
      }
    } else if (typeof value === 'boolean') {
      result.result = value;
    } else if (value instanceof Error) {
      result.result = null;
      result.message = 'threw ' + stringify(value);
    } else {
      result.result = null;
      result.message = 'returned ' + stringify(value);
    }

    if (result.result !== false) {
      result.info.code = data.tests[i].code;
      if (data.tests[i].prefix) {
        result.info.prefix = data.tests[i].prefix;
      }
    } else {
      result.info.code = data.tests[0].code;
    }

    if (data.info !== undefined) {
      result.info = Object.assign({}, result.info, data.info);
    }
    result.info.exposure = data.exposure;

    if (result.result === true) {
      callback(result);
      return;
    } else {
      if (i + 1 >= data.tests.length) {
        callback(result);
      } else {
        runTest(data, i + 1, callback);
      }
    }
  }

  function runTest(data, i, callback) {
    var test = data.tests[i];

    try {
      var value = eval(test.code);

      if (typeof value === 'object' && value !== null && typeof value.then === 'function') {
        value.then(
            function(value) {
              processTestResult(value, data, i, callback);
            },
            function(fail) {
              processTestResult(new Error(fail), data, i, callback);
            }
        ).catch(
            function(err) {
              processTestResult(err, data, i, callback);
            }
        );
      } else {
        processTestResult(value, data, i, callback);
      }
    } catch (err) {
      processTestResult(err, data, i, callback);
    }
  }

  function runTests(tests, callback) {
    var results = [];
    var completedTests = 0;

    var oncomplete = function(result) {
      results.push(result);
      completedTests += 1;

      if (completedTests >= tests.length) {
        callback(results);
      } else {
        runTest(tests[completedTests], 0, oncomplete);
      }
    };

    runTest(tests[0], 0, oncomplete);
  }

  function runWindow(callback, results) {
    if (pending.Window) {
      runTests(pending.Window, callback);
    } else {
      callback(results);
    }
  }

  function runWorker(callback, results) {
    if (pending.Worker) {
      var myWorker = null;

      if ('Worker' in self) {
        try {
          myWorker = new Worker('/resources/worker.js');
        } catch (e) {
          // eslint-disable-next-rule no-empty
        }
      }

      if (myWorker) {
        myWorker.onmessage = function(event) {
          callback(results.concat(JSON.parse(event.data)));
        };

        myWorker.postMessage(JSON.stringify(pending.Worker));
      } else {
        updateStatus('No worker support, skipping Worker/DedicatedWorker tests');

        for (var i = 0; i < pending.Worker.length; i++) {
          var result = {
            name: pending.Worker[i].name,
            result: false,
            message: 'No worker support',
            info: {
              exposure: 'Worker'
            }
          };

          if (pending.Worker[i].info !== undefined) {
            result.info = Object.assign(
                {},
                result.info,
                pending.Worker[i].info
            );
          }

          results.push(result);
        }

        callback(results);
      }
    } else {
      callback(results);
    }
  }

  function runSharedWorker(callback, results) {
    if (pending.SharedWorker) {
      var myWorker = null;

      if ('SharedWorker' in self) {
        try {
          myWorker = new SharedWorker('/resources/sharedworker.js');
        } catch (e) {
          // eslint-disable-next-rule no-empty
        }
      }

      if (myWorker) {
        myWorker.port.onmessage = function(event) {
          callback(results.concat(JSON.parse(event.data)));
        };

        myWorker.port.postMessage(JSON.stringify(pending.SharedWorker));
      } else {
        updateStatus('No shared worker support, skipping SharedWorker tests');

        for (var i = 0; i < pending.SharedWorker.length; i++) {
          var result = {
            name: pending.SharedWorker[i].name,
            result: false,
            message: 'No shared worker support',
            info: {
              exposure: 'SharedWorker'
            }
          };

          if (pending.SharedWorker[i].info !== undefined) {
            result.info = Object.assign(
                {},
                result.info,
                pending.SharedWorker[i].info
            );
          }

          results.push(result);
        }

        callback(results);
      }
    } else {
      callback(results);
    }
  }

  function runServiceWorker(callback, results) {
    if (pending.ServiceWorker) {
      if ('serviceWorker' in navigator) {
        window.__workerCleanup().then(function() {
          navigator.serviceWorker.register('/resources/serviceworker.js', {
            scope: '/resources/'
          }).then(function(reg) {
            return window.__waitForSWState(reg, 'activated');
          }).then(navigator.serviceWorker.ready).then(function(reg) {
            var messageChannel = new MessageChannel();

            messageChannel.port1.onmessage = function(event) {
              callback(results.concat(JSON.parse(event.data)));
            };

            reg.active.postMessage(
                JSON.stringify(pending.ServiceWorker),
                [messageChannel.port2]
            );
          });
        });
      } else {
        updateStatus('No service worker support, skipping ServiceWorker tests');

        for (var i = 0; i < pending.ServiceWorker.length; i++) {
          var result = {
            name: pending.ServiceWorker[i].name,
            result: false,
            message: 'No service worker support',
            info: {
              exposure: 'ServiceWorker'
            }
          };

          if (pending.ServiceWorker[i].info !== undefined) {
            result.info = Object.assign(
                {}, result.info, pending.ServiceWorker[i].info
            );
          }

          results.push(result);
        }

        callback(results);
      }
    } else {
      callback(results);
    }
  }

  function go(callback, resourceCount, hideResults) {
    var startTests = function() {
      resources.testsStarted = true;

      var timeout = setTimeout(function() {
        updateStatus('<br />This test seems to be taking a long time; ' +
            'it may have crashed. Check the console for errors.', true);
      }, 20000);

      runWindow(function(results) {
        runWorker(function(results) {
          runSharedWorker(function(results) {
            runServiceWorker(function(results) {
              pending = {};

              clearTimeout(timeout);
              if (typeof callback == 'function') {
                callback(results);
              } else {
                report(results, hideResults);
              }
            }, results);
          }, results);
        }, results);
      }, []);
    };

    if (resourceCount) {
      resources.required = resourceCount;

      var resourceTimeout = setTimeout(function() {
        // If the resources don't load, just start the tests anyways
        consoleLog('Timed out waiting for resources to load, starting tests anyways');
        startTests();
      }, 5000);

      var resourceLoaded = function() {
        if (resources.testsStarted) {
          // No need to restart the tests
          return;
        }
        resources.loaded += 1;

        if (resources.loaded >= resources.required) {
          clearTimeout(resourceTimeout);
          startTests();
        }
      };

      // Load resources
      try {
        var i;
        var resourceMedia = document.querySelectorAll('#resources audio, #resources video');
        for (i = 0; i < resourceMedia.length; i++) {
          resourceMedia[i].load();
          resourceMedia[i].onloadeddata = resourceLoaded;
        }
        var resourceImages = document.querySelectorAll('#resources img');
        for (i = 0; i < resourceImages.length; i++) {
          resourceImages[i].onload = resourceLoaded;
        }
      } catch (e) {
        // Couldn't use resource loading code, start anyways
        consoleError(e);
        startTests();
      }
    } else {
      startTests();
    }
  }

  function report(results, hideResults) {
    consoleLog('Tests complete');
    updateStatus('Posting results to server...');

    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.type = 'text/css';
    css.href = '/resources/style.css';
    try {
      document.head.appendChild(css);
    } catch (e) {
      // If we fail to import the CSS, it's not a big deal
    }

    try {
      var body = JSON.stringify(results);

      var client;
      if ('XMLHttpRequest' in self) {
        client = new XMLHttpRequest();
      } else if ('ActiveXObject' in self) {
        client = new ActiveXObject('Microsoft.XMLHTTP');
      }

      if (!client) {
        updateStatus('Cannot upload results: XMLHttpRequest is not supported.');
        return;
      }

      client.open('POST', '/api/results?for='+encodeURIComponent(location.href));
      client.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      client.send(body);
      client.onreadystatechange = function() {
        if (client.readyState == 4) {
          if (client.status >= 200 && client.status <= 299) {
            updateStatus('Results uploaded. <a href="/results" id="submit">Submit to GitHub</a>');
          } else {
            updateStatus('Failed to upload results: server error.');
          }
        }
      };
    } catch (e) {
      updateStatus('Failed to upload results: client error.');
      consoleError(e);
    }

    var resultsEl = document.getElementById('results');

    if (resultsEl && !hideResults) {
      resultsEl.appendChild(document.createElement('hr'));

      for (var i=0; i<results.length; i++) {
        var result = results[i];

        var thisResultEl = document.createElement('div');
        thisResultEl.className = 'result';

        var resultNameEl = document.createElement('p');

        resultNameEl.innerHTML = result.name;
        if (result.name.indexOf('css.') != 0) {
          resultNameEl.innerHTML += ' (' + result.info.exposure + ' exposure)';
        }
        resultNameEl.innerHTML += ':&nbsp;';

        var resultValueEl = document.createElement('strong');
        resultValueEl.innerHTML = stringify(result.result);
        if (result.prefix) {
          resultValueEl.innerHTML += ' (' + result.prefix + ' prefix)';
        }
        if (result.message) {
          resultValueEl.innerHTML += ' (' + result.message + ')';
        }
        resultNameEl.appendChild(resultValueEl);
        thisResultEl.appendChild(resultNameEl);

        if (result.info.code) {
          var codeEl = document.createElement('code');
          codeEl.innerHTML = result.info.code.replace(/ /g, '&nbsp;').replace(/\n/g, '<br />');
          thisResultEl.appendChild(codeEl);
          thisResultEl.appendChild(document.createElement('br'));
          thisResultEl.appendChild(document.createElement('br'));
        }

        resultsEl.appendChild(thisResultEl);
      }
    }
  }

  // Service Worker helpers
  if ('serviceWorker' in navigator) {
    if ('window' in self) {
      window.__waitForSWState = function(registration, desiredState) {
        return new Promise(function(resolve, reject) {
          var serviceWorker = registration.installing;

          if (!serviceWorker) {
            // If the service worker isn't installing, it was probably
            // interrupted during a test.
            window.__workerCleanup().then(function() {
              window.location.reload();
            });

            return reject(new Error('Service worker not installing, cleaning and retrying...'));
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
                var unregisterPromise = registrations.map(
                    function(registration) {
                      return registration.unregister();
                    }
                );
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
  }

  global.stringify = stringify;
  global.reusableInstances = reusableInstances;
  global.bcd = {
    testConstructor: testConstructor,
    addInstance: addInstance,
    addTest: addTest,
    runTests: runTests,
    go: go
  };
})(this);
