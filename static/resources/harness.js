//
// mdn-bcd-collector: static/resources/harness.js
// Helpers and functions for running the tests in the browser
//
// © Google LLC, Gooborg Studios, Mozilla Corporation, Apple Inc
// See the LICENSE file for copyright details
//

/* global console, document, window, location, navigator, XMLHttpRequest,
          self, Worker, Promise, setTimeout, clearTimeout, MessageChannel,
          SharedWorker, hljs */

// This harness should work on as old browsers as possible and shouldn't depend
// on any modern JavaScript features.

(function (global) {
  var pending = {};
  var resources = {
    required: 0,
    loaded: 0
  };
  var state = {
    started: false,
    timedout: false,
    completed: false
  };
  var reusableInstances = {
    __sources: {}
  };

  // Set to true for debugging output, and 'full' to include completion logging
  var debugmode = stringIncludes(location.search, 'debug=true');

  /* c8 ignore start */
  function consoleLog(message) {
    if ('console' in self) {
      console.log(message);
    }
  }

  function consoleWarn(message) {
    if ('console' in self) {
      console.warn(message);
    }
  }

  function consoleError(message) {
    if ('console' in self) {
      console.error(message);
    }
  }

  function stringify(value) {
    try {
      return String(value);
    } catch (err) {
      return 'unserializable value';
    }
  }

  function stringIncludes(string, search) {
    if (Array.isArray(search)) {
      for (var i = 0; i < search.length; i++) {
        if (stringIncludes(string, search[i])) {
          return true;
        }
      }
      return false;
    }
    if (string.includes) {
      return string.includes(search);
    }
    return string.indexOf(search) !== -1;
  }
  /* c8 ignore stop */

  function updateStatus(newStatus, className) {
    var statusElement = document.getElementById('status');
    if (!statusElement) {
      return;
    }

    if (state.timedout) {
      statusElement.innerHTML =
        newStatus +
        '<br>The tests seem to be taking a long time; ' +
        'they may have crashed. Check the console for errors.';
    } else {
      statusElement.innerHTML = newStatus;
    }

    if (className) {
      statusElement.className = className;
    }

    consoleLog(statusElement.innerHTML.replace(/<br>/g, '\n'));
  }

  function addInstance(name, code) {
    var newCode = '(function () {\n  ' + code.replace(/\n/g, '\n  ') + '\n})()';
    reusableInstances.__sources[name] = newCode;

    try {
      reusableInstances[name] = eval(newCode);
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
      if (typeof iface == 'string') {
        eval('new ' + iface + '()');
      } else {
        // eslint-disable-next-line new-cap
        new iface();
      }
      result.result = true;
    } catch (err) {
      if (
        stringIncludes(err.message, [
          'Illegal constructor',
          'is not a constructor',
          'Function expected',
          'is not defined',
          "Can't find variable",
          'NOT_SUPPORTED_ERR'
        ])
      ) {
        result.result = false;
      } else if (
        stringIncludes(err.message, [
          'Not enough arguments',
          'argument required',
          'arguments required',
          'Argument not optional',
          "Arguments can't be empty",
          'undefined is not an object',
          'must be an object',
          'WRONG_ARGUMENTS_ERR',
          'are both null',
          'must be specified',
          'is not a valid custom element constructor',
          'constructor takes a',
          'is not a valid argument count',
          'Missing required',
          'Cannot read property',
          'event name must be provided',
          'requires a single argument'
        ])
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

  function testObjectName(instance, names) {
    // Do not reject "falsey" values generally in order to support
    // `document.all`
    if (instance === null || instance === undefined) {
      return false;
    }

    if (
      !instance.constructor.name &&
      Object.prototype.toString.call(instance) === '[object Object]'
    ) {
      return {
        result: null,
        message:
          'Browser does not support object prototype confirmation methods'
      };
    }

    if (typeof names === 'string') {
      names = [names];
    }

    var actualName = instance.constructor.name;

    if (!actualName || actualName == 'Function.prototype') {
      actualName = Object.prototype.toString
        .call(instance)
        .replace(/\[object (.*)\]/g, '$1');
    }

    for (var i = 0; i < names.length; i++) {
      if (actualName === names[i]) {
        return true;
      }
    }

    return {
      result: false,
      message:
        'Instance prototype does not match accepted names (expected ' +
        names.join(', ') +
        '; got ' +
        actualName +
        ')'
    };
  }

  function testOptionParam(instance, methodName, paramName, paramValue) {
    if (!('Object' in self && 'defineProperty' in Object)) {
      return {
        result: null,
        message: 'Browser does not support detection methods'
      };
    }

    if (!instance) {
      return {
        result: false,
        message: 'testOptionParam: instance is falsy'
      };
    }

    if (
      methodName &&
      methodName !== 'constructor' &&
      !(methodName in instance)
    ) {
      return {
        result: false,
        message: 'testOptionParam: instance.' + methodName + ' is undefined'
      };
    }

    var accessed = false;
    var options = Object.defineProperty({}, paramName, {
      get: function () {
        accessed = true;
        return paramValue;
      }
    });

    if (methodName === 'constructor') {
      // If methodName is 'constructor', we're testing a constructor
      new instance(options);
    } else if (methodName) {
      instance[methodName](options);
    } else {
      // If there's no method name specified, we're testing a function
      instance(options);
    }

    return accessed;
  }

  function cssPropertyToIDLAttribute(property, lowercaseFirst) {
    var output = '';
    var uppercaseNext = false;

    if (lowercaseFirst) {
      property = property.substr(1);
    }

    for (var i = 0; i < property.length; i++) {
      var c = property[i];

      if (c === '-') {
        uppercaseNext = true;
      } else if (uppercaseNext) {
        uppercaseNext = false;
        output += c.toUpperCase();
      } else {
        output += c;
      }
    }

    return output;
  }

  function testCSSProperty(name) {
    if ('CSS' in window && window.CSS.supports) {
      return window.CSS.supports(name, 'inherit');
    }

    var attrs = [name];
    attrs.push(cssPropertyToIDLAttribute(name, name.startsWith('-')));
    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];
      if (attr in document.body.style) {
        return true;
      }
    }

    return false;
  }

  function testCSSPropertyValue(name, value) {
    if ('CSS' in window && window.CSS.supports) {
      return window.CSS.supports(name, value);
    }

    var div = document.createElement('div');
    div.style[name] = '';
    div.style[name] = value;
    return div.style.getPropertyValue(name) !== '';
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
  //   "info": {
  //     "code": "'localName' in Attr.prototype",
  //     "exposure": "Window"
  //   }
  // }
  function processTestResult(value, data, i, callback) {
    var result = {name: data.name, info: {}};

    if (typeof value === 'boolean') {
      result.result = value;
    } else if (value instanceof Error) {
      result.result = null;
      result.message = 'threw ' + stringify(value);
    } else if (value && typeof value === 'object') {
      if (
        'name' in value &&
        stringIncludes(value.name, ['NS_ERROR', 'NotSupported'])
      ) {
        result.result = null;
        result.message = 'threw ' + stringify(value.message);
      } else if ('result' in value) {
        result.result = value.result;
        if (value.message) {
          result.message = value.message;
        }
      } else {
        result.result = null;
        result.message = 'returned ' + stringify(value);
      }
    } else {
      result.result = null;
      result.message = 'returned ' + stringify(value);
    }

    if (result.result !== false) {
      result.info.code = data.tests[i].code;
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

    if (debugmode) {
      if (typeof result.result !== 'boolean' && result.result !== null) {
        consoleLog(
          data.name + ' returned ' + result.result + ', not true/false/null!.'
        );
      }
    }
  }

  function runTest(data, i, oncomplete) {
    var test = data.tests[i];

    var timeout = setTimeout(function () {
      fail('Timed out');
    }, 10000);

    function success(v) {
      clearTimeout(timeout);
      processTestResult(v, data, i, oncomplete);
    }

    function fail(e) {
      clearTimeout(timeout);

      var v;
      if (e instanceof Error) {
        v = e;
      } else {
        v = new Error(e);
      }
      processTestResult(v, data, i, oncomplete);
    }

    try {
      var value = eval(test.code);

      if (
        typeof value === 'object' &&
        value !== null &&
        typeof value.then === 'function'
      ) {
        value.then(success, fail);
        value['catch'](fail);
      } else if (value !== 'callback') {
        success(value);
      }
    } catch (err) {
      fail(err);
    }
  }

  function runTests(tests, callback) {
    var results = [];
    var completedTests = 0;

    if (debugmode) {
      var remaining = [];
      for (var t = 0; t < tests.length; t++) {
        remaining.push(tests[t].name);
      }
    }

    var oncomplete = function (result) {
      results.push(result);
      completedTests += 1;

      if (debugmode) {
        if (debugmode === 'full') {
          consoleLog(
            'Completed ' +
              result.name +
              ' (' +
              result.info.exposure +
              ' exposure)'
          );
        }
        var index = remaining.indexOf(result.name);
        if (index !== -1) {
          remaining.splice(index, 1);
        } else {
          consoleWarn('Warning! ' + result.name + ' ran twice!');
        }
        if (remaining.length > 0 && remaining.length <= 50) {
          consoleLog('Remaining (' + result.info.exposure + '): ' + remaining);
          updateStatus(
            'Remaining (' + result.info.exposure + '): ' + remaining
          );
        } else if (
          (remaining.length > 50 &&
            remaining.length < 200 &&
            remaining.length % 50 == 0) ||
          (remaining.length >= 200 && remaining.length % 500 == 0)
        ) {
          consoleLog(
            'Remaining (' +
              result.info.exposure +
              '): ' +
              (tests.length - completedTests) +
              ' tests'
          );
        }
      }

      if (completedTests == tests.length) {
        callback(results);
      } else if (completedTests > tests.length) {
        consoleWarn(
          'Warning! More tests were completed than there should have been; did a test run twice?'
        );
      }
    };

    for (var i = 0; i < tests.length; i++) {
      runTest(tests[i], 0, oncomplete);
    }
  }

  function runWindow(callback) {
    if (pending.Window) {
      updateStatus('Running tests for Window...');
      runTests(pending.Window, callback);
    } else {
      callback([]);
    }
  }

  function runWorker(callback) {
    if (pending.Worker) {
      updateStatus('Running tests for Worker...');
      var myWorker = null;

      if ('Worker' in self) {
        try {
          myWorker = new Worker('/resources/worker.js');
        } catch (e) {
          // eslint-disable-next-rule no-empty
        }
      }

      if (myWorker) {
        myWorker.onmessage = function (event) {
          callback(JSON.parse(event.data));
        };

        myWorker.postMessage(
          JSON.stringify({
            instances: reusableInstances.__sources,
            tests: pending.Worker
          })
        );
      } else {
        updateStatus(
          'No worker support, skipping Worker/DedicatedWorker tests'
        );

        var results = [];
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
      callback([]);
    }
  }

  function runSharedWorker(callback) {
    if (pending.SharedWorker) {
      updateStatus('Running tests for Shared Worker...');
      var myWorker = null;

      if ('SharedWorker' in self) {
        try {
          myWorker = new SharedWorker('/resources/sharedworker.js');
        } catch (e) {
          // eslint-disable-next-rule no-empty
        }
      }

      if (myWorker) {
        myWorker.port.onmessage = function (event) {
          callback(JSON.parse(event.data));
        };

        myWorker.port.postMessage(
          JSON.stringify({
            instances: reusableInstances.__sources,
            tests: pending.SharedWorker
          })
        );
      } else {
        updateStatus('No shared worker support, skipping SharedWorker tests');

        var results = [];
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
      callback([]);
    }
  }

  function runServiceWorker(callback) {
    if (pending.ServiceWorker) {
      updateStatus('Running tests for Service Worker...');
      if ('serviceWorker' in navigator) {
        window.__workerCleanup().then(function () {
          navigator.serviceWorker
            .register('/resources/serviceworker.js', {
              scope: '/resources/'
            })
            .then(function (reg) {
              return window.__waitForSWState(reg, 'activated');
            })
            .then(navigator.serviceWorker.ready)
            .then(function (reg) {
              var messageChannel = new MessageChannel();

              messageChannel.port1.onmessage = function (event) {
                callback(JSON.parse(event.data));
              };

              reg.active.postMessage(
                JSON.stringify({
                  instances: reusableInstances.__sources,
                  tests: pending.ServiceWorker
                }),
                [messageChannel.port2]
              );
            });
        });
      } else {
        updateStatus('No service worker support, skipping ServiceWorker tests');

        var results = [];
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
              {},
              result.info,
              pending.ServiceWorker[i].info
            );
          }

          results.push(result);
        }

        callback(results);
      }
    } else {
      callback([]);
    }
  }

  function go(callback, resourceCount, hideResults) {
    var allresults = [];
    state = {
      started: false,
      timedout: false,
      completed: false
    };

    var startTests = function () {
      if (state.started) {
        consoleError('Warning: Tests started twice!');
        return;
      }

      state.started = true;

      var timeout = setTimeout(function () {
        state.timedout = true;
      }, 20000);

      runWindow(function (results) {
        allresults = allresults.concat(results);

        runWorker(function (results) {
          allresults = allresults.concat(results);

          runSharedWorker(function (results) {
            allresults = allresults.concat(results);

            runServiceWorker(function (results) {
              allresults = allresults.concat(results);

              pending = {};
              state.completed = true;
              state.timedout = false;
              clearTimeout(timeout);

              if ('serviceWorker' in navigator) {
                window.__workerCleanup();
              }

              if (typeof callback == 'function') {
                callback(allresults);
              } else {
                report(allresults, hideResults);
              }
            });
          });
        });
      });
    };

    if (resourceCount) {
      resources.required = resourceCount;

      var resourceTimeout = setTimeout(function () {
        // If the resources don't load, just start the tests anyways
        consoleLog(
          'Timed out waiting for resources to load, starting tests anyways'
        );
        startTests();
      }, 5000);

      var resourceLoaded = function () {
        if (state.started) {
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
        var resourceMedia = document.querySelectorAll(
          '#resources audio, #resources video'
        );
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
        clearTimeout(resourceTimeout);
        consoleError(e);
        startTests();
      }
    } else {
      startTests();
    }
  }

  function loadHighlightJs(callback) {
    try {
      // Load dark (main) style
      var darkStyle = document.createElement('link');
      darkStyle.rel = 'stylesheet';
      darkStyle.href =
        '//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/stackoverflow-dark.min.css';
      document.body.appendChild(darkStyle);

      // Load light style
      var lightStyle = document.createElement('link');
      lightStyle.rel = 'stylesheet';
      lightStyle.href =
        '//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/stackoverflow-light.min.css';
      lightStyle.media = '(prefers-color-scheme: light)';
      document.body.appendChild(lightStyle);

      // Load script
      var script = document.createElement('script');
      script.src =
        '//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js';

      if ('onload' in script) {
        script.onload = callback;
        script.onerror = callback;
      } else {
        // If we can't determine when harness.js loads, use a delay
        setTimeout(callback, 500);
      }

      document.body.appendChild(script);
    } catch (e) {
      // If anything fails with loading, continue
      callback();
    }
  }

  function renderReportEl(result, resultsEl) {
    var resultEl = document.createElement('details');
    resultEl.className = 'result';

    var resultSummaryEl = document.createElement('summary');
    resultSummaryEl.innerHTML = result.name;
    if (result.name.indexOf('css.') != 0) {
      resultSummaryEl.innerHTML += ' (' + result.info.exposure + ' exposure)';
    }
    resultSummaryEl.innerHTML += ':&nbsp;';

    var resultValue = stringify(result.result);
    var resultValueEl = document.createElement('span');
    resultValueEl.className = 'result-value result-value-' + resultValue;
    resultValueEl.innerHTML =
      resultValue === 'true'
        ? 'Supported'
        : resultValue === 'false'
        ? 'No Support'
        : resultValue === 'null'
        ? 'Support Unknown'
        : resultValue;
    resultSummaryEl.appendChild(resultValueEl);
    resultEl.appendChild(resultSummaryEl);

    var resultInfoEl = document.createElement('div');
    resultInfoEl.className = 'result-info';

    if (result.message) {
      var resultMessageEl = document.createElement('p');
      resultMessageEl.className = 'result-message';
      resultMessageEl.innerHTML = result.message;
      resultInfoEl.appendChild(resultMessageEl);
    }

    if (result.info.code) {
      var resultCodeEl = document.createElement('code');
      var code = result.info.code;

      // Display the code that creates the reusable instance in results
      var reusedInstances = result.info.code.match(
        /reusableInstances\.([^.());]*)/g
      );
      var addedInstances = [];

      if (reusedInstances) {
        for (var i = 0; i < reusedInstances.length; i++) {
          var reusedInstance = reusedInstances[i].replace(
            'reusableInstances.',
            ''
          );

          // De-duplicate instances
          if (addedInstances.indexOf(reusedInstance) > -1) {
            continue;
          }
          addedInstances.push(reusedInstance);

          code =
            reusedInstances[i] +
            ' = ' +
            reusableInstances.__sources[reusedInstance] +
            '\n\n' +
            code;
        }
      }

      var formattedCode;
      if ('hljs' in self) {
        formattedCode = hljs.highlight(code, {
          language: 'js'
        }).value;
      }

      resultCodeEl.className = 'result-code';
      resultCodeEl.innerHTML = (formattedCode || code).replace(
        /\n([^\S\r\n]*)/g,
        function (match, p1) {
          return '<br>' + p1.replace(/ /g, '&nbsp;');
        }
      );
      resultInfoEl.appendChild(resultCodeEl);
    }

    resultEl.appendChild(resultInfoEl);
    resultsEl.appendChild(resultEl);
  }

  function sendReport(results) {
    var body = JSON.stringify(results);

    if (!('XMLHttpRequest' in self)) {
      updateStatus(
        'Cannot upload results: XMLHttpRequest is not supported.',
        'error-notice'
      );
      return;
    }

    var client = new XMLHttpRequest();

    var resultsURL =
      (location.origin || location.protocol + '//' + location.host) +
      '/api/results?for=' +
      encodeURIComponent(location.href);

    client.open('POST', resultsURL);
    client.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    client.send(body);
    client.onreadystatechange = function () {
      if (client.readyState == 4) {
        if (client.status >= 200 && client.status <= 299) {
          document.getElementById('export-download').disabled = false;
          document.getElementById('export-github').disabled = false;
          updateStatus('Results uploaded.', 'success-notice');
        } else {
          updateStatus(
            'Failed to upload results: server error.',
            'error-notice'
          );
          consoleLog('Server response: ' + client.response);
        }
      }
    };
  }

  function report(results, hideResults) {
    updateStatus('Tests complete. Posting results to server...');

    try {
      if ('JSON' in self && 'parse' in JSON) {
        sendReport(results);
      } else {
        // Load JSON polyfill if needed
        var polyfill = document.createElement('script');
        polyfill.src = '/resources/json3.min.js';

        if ('onload' in polyfill) {
          polyfill.onload = function () {
            sendReport(results);
          };
        } else {
          // If we can't determine when the polyfill loads, use a delay
          setTimeout(function () {
            sendReport(results);
          }, 500);
        }

        document.body.appendChild(polyfill);
      }
    } catch (e) {
      updateStatus('Failed to upload results: client error.', 'error-notice');
      consoleError(e);
    }

    var resultsEl = document.getElementById('results');

    function doRenderResults() {
      loadHighlightJs(function () {
        for (var i = 0; i < results.length; i++) {
          renderReportEl(results[i], resultsEl);
        }
      });
    }

    if (resultsEl && !hideResults) {
      if (results.length > 250) {
        var renderWarning = document.createElement('p');
        renderWarning.innerHTML =
          'There are ' +
          results.length +
          ' test results.<br>Displaying all results may cause your browser to freeze, especially on older browsers.<br>Display results anyways?';
        resultsEl.appendChild(renderWarning);

        var renderButton = document.createElement('button');
        renderButton.innerHTML = 'Show Results';
        resultsEl.appendChild(renderButton);

        renderButton.onclick = function () {
          resultsEl.removeChild(renderWarning);
          resultsEl.removeChild(renderButton);

          doRenderResults();
        };
      } else {
        doRenderResults();
      }
    }
  }

  // Service Worker helpers
  if ('serviceWorker' in navigator) {
    if ('window' in self) {
      window.__waitForSWState = function (registration, desiredState) {
        return new Promise(function (resolve, reject) {
          var serviceWorker = registration.installing;

          if (!serviceWorker) {
            // If the service worker isn't installing, it was probably
            // interrupted during a test.
            window.__workerCleanup().then(function () {
              window.location.reload();
            });

            return reject(
              new Error(
                'Service worker not installing, cleaning and retrying...'
              )
            );
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

      window.__workerCleanup = function () {
        if ('getRegistrations' in navigator.serviceWorker) {
          return navigator.serviceWorker
            .getRegistrations()
            .then(function (registrations) {
              var unregisterPromise = registrations.map(function (
                registration
              ) {
                return registration.unregister();
              });
              return Promise.all(unregisterPromise);
            });
        } else {
          return navigator.serviceWorker
            .getRegistration('/resources/')
            .then(function (registration) {
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
    testObjectName: testObjectName,
    testOptionParam: testOptionParam,
    testCSSProperty: testCSSProperty,
    testCSSPropertyValue: testCSSPropertyValue,
    addInstance: addInstance,
    addTest: addTest,
    runTests: runTests,
    go: go
  };
})(this);
