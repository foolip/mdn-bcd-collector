//
// mdn-bcd-collector: static/resources/sharedworker.js
// JavaScript to run tests within shared workers
//
// © Mozilla Corporation, Gooborg Studios
// See LICENSE.txt for copyright details
//

/* global self, bcd */

self.importScripts('harness.js');

self.onconnect = function (connectEvent) {
  var port = connectEvent.ports[0];
  port.onmessage = function (event) {
    var data = JSON.parse(event.data);

    for (var i in data.instances) {
      bcd.addInstance(i, data.instances[i]);
    }

    bcd.runTests(data.tests, function (results) {
      port.postMessage(JSON.stringify(results));
    });
  };
};
