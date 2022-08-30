//
// mdn-bcd-collector: static/resources/worker.js
// JavaScript to run tests within workers
//
// © Gooborg Studios
// See the LICENSE file for copyright details
//

/* global self, bcd */

self.importScripts('harness.js');

self.onmessage = function (event) {
  var data = JSON.parse(event.data);

  for (var i in data.instances) {
    bcd.addInstance(i, data.instances[i]);
  }

  bcd.runTests(data.tests, function (results) {
    self.postMessage(JSON.stringify(results));
  });
};
