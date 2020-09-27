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

/* global self */
/* global bcd */

self.importScripts('harness.js');

self.onconnect = function(connectEvent) {
  var port = connectEvent.ports[0];
  port.onmessage = function(event) {
    var pending = event.data;
    var results = [];

    if (pending) {
      for (var i = 0; i < pending.length; i++) {
        results.push(bcd.test(pending[i]));
      }
    }

    port.postMessage(results);
  };
};
