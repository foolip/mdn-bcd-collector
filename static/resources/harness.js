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
          self, Worker, Promise, setTimeout, clearTimeout */

'use strict';

// This harness should work on as old browsers as possible and shouldn't depend
// on any modern JavaScript features.

(function(global) {
  var pending = {
    'Window': [],
    'Worker': [],
    'ServiceWorker': []
  };

  function stringify(value) {
    try {
      return String(value);
    } catch (err) {
      return 'unserializable value';
    }
  }

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
  }

  function addTest(name, tests, exposure, info) {
    if (exposure in pending) {
      pending[exposure].push({
        name: name,
        tests: tests,
        exposure: exposure,
        info: info
      });
    }
  }

  function testConstructor(iface) {
    var result = {};

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

  // Each test is mapped to an object like this:
  // {
  //   "name": "api.Attr.localName",
  //   "result": true,
  //   "prefix": "",
  //   "info": {
  //     "code": "'localName' in Attr.prototype",
  //     "exposure": "Window"
  //   }
  // }
  //
  // If the test doesn't return true or false, or if it throws, `result` will
  // be null and a `message` property is set to an explanation.
  function test(data) {
    var result = {name: data.name, info: {}};

    for (var i = 0; i < data.tests.length; i++) {
      var test = data.tests[i];

      try {
        var value = eval(test.code);
        if (value && typeof value === 'object' && 'result' in value) {
          result.result = value.result;
          if (value.message) {
            result.message = value.message;
          }
        } else if (typeof value === 'boolean') {
          result.result = value;
        } else {
          result.result = null;
          result.message = 'returned ' + stringify(value);
        }
      } catch (err) {
        result.result = null;
        result.message = 'threw ' + stringify(err);
      }

      if (result.result !== false) {
        result.info.code = test.code;
        if (test.prefix) {
          result.info.prefix = test.prefix;
        }
        break;
      }
    }

    if (data.info !== undefined) {
      result.info = Object.assign({}, result.info, data.info);
    }

    if (result.result === false) {
      result.info.code = data.tests[0].code;
    }
    result.info.exposure = data.exposure;

    return result;
  }

  function runWindow(callback, results) {
    for (var i = 0; i < pending.Window.length; i++) {
      results.push(test(pending.Window[i]));
    }

    callback(results);
  }

  function runWorker(callback, results) {
    if ('Worker' in self) {
      var myWorker = new Worker('/resources/worker.js');

      myWorker.onmessage = function(event) {
        callback(results.concat(event.data));
      };

      myWorker.postMessage(pending.Worker);
    } else {
      console.log('No worker support');
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
          result.info = Object.assign({}, result.info, pending.Worker[i].info);
        }

        results.push(result);
      }

      callback(results);
    }
  }

  function runServiceWorker(callback, results) {
    if ('serviceWorker' in navigator) {
      window.__workerCleanup().then(function() {
        navigator.serviceWorker.register('/resources/serviceworker.js', {
          scope: '/resources/'
        }).then(function(reg) {
          return window.__waitForSWState(reg, 'activated');
        }).then(navigator.serviceWorker.ready).then(function(reg) {
          navigator.serviceWorker.onmessage = function(event) {
            callback(results.concat(event.data));
          };

          reg.active.postMessage(pending.ServiceWorker);
        });
      });
    } else {
      console.log('No service worker support, skipping');
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
  }

  function run(callback) {
    var timeout = setTimeout(function() {
      updateStatus('<br />This test seems to be taking a long time; ' +
          'it may have crashed. Check the console for errors.', true);
    }, 10000);

    runWindow(function(results) {
      runWorker(function(results) {
        runServiceWorker(function(results) {
          pending = [];

          clearTimeout(timeout);
          if (typeof callback == 'function') {
            callback(results);
          } else {
            report(results);
          }
        }, results);
      }, results);
    }, []);
  }

  function report(results) {
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.type = 'text/css';
    css.href = '/resources/style.css';
    try {
      document.head.appendChild(css);
    } catch (e) {
      // If we fail to import the CSS, it's not a big deal
    }

    updateStatus('Posting results to server...');

    var response = '';
    for (var i=0; i<results.length; i++) {
      var result = results[i];
      response += result.name;
      if (result.name.indexOf('css.') != 0) {
        response += ' (' + result.info.exposure + ' exposure)';
      }
      response += ': <strong>' + result.result;
      if (result.prefix) {
        response += ' (' + result.prefix + ' prefix)';
      }
      if (result.message) {
        response += ' (' + result.message + ')';
      }
      response += '</strong>\n<code>' + result.info.code + ';</code>\n\n';
    }

    var resultsEl = document.getElementById('results');
    if (resultsEl) {
      resultsEl.innerHTML = '<hr />' + response
          .replace(/\n/g, '<br />');
    }

    var body = JSON.stringify(results);
    var client = new XMLHttpRequest();
    client.open('POST', '/api/results?for='+encodeURIComponent(location.href));
    client.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    client.send(body);
    client.onreadystatechange = function() {
      if (client.readyState == 4) {
        if (client.status >= 500) {
          updateStatus('Failed to upload results.');
        } else {
          updateStatus('Results uploaded. <a href="/results" id="submit">Submit to GitHub</a>');
        }
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
    testConstructor: testConstructor,
    addTest: addTest,
    test: test,
    run: run
  };
})(this);
