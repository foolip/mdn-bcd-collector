// Copyright 2019 Google LLC
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

  function test(name, fn, info) {
    pending.push([name, fn, info]);
  }

  function stringify(value) {
    try {
      return String(value);
    } catch (err) {
      return 'unserializable value';
    }
  }

  // Each test is mapped to an object like this:
  // {
  //   "name": "api.Attr.localName",
  //   "result": true,
  //   "info": {
  //     "code": "'localName' in Attr.prototype"
  //   }
  // }
  //
  // If the test doesn't return true or false, or if it throws, `result` will
  // be null and a `message` property is set to an explanation.
  function run(done) {
    var results = [];

    var length = pending.length;
    for (var i = 0; i < length; i++) {
      var name = pending[i][0];
      var func = pending[i][1];
      var info = pending[i][2];

      var result = { name: name };

      try {
        var value = func();
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

      results.push(result);
    }

    pending = [];

    if (done) {
      done(results);
    } else {
      report(results);
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

  global.bcd = {
    test: test,
    run: run
  };
})(this);
