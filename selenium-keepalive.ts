//
// mdn-bcd-collector: selenium-keepalive.js
// Sets HTTP keep-alive for faster Selenium tests
//
// © BrowserStack, Gooborg Studios
// See the LICENSE file for copyright details
//

import http from 'http';
import https from 'https';

// set the time (in seconds) for connection to be alive
const keepAliveTimeout = 30 * 1000;

if (http.globalAgent && 'keepAlive' in http.globalAgent) {
  (http.globalAgent as any).keepAlive = true;
  (https.globalAgent as any).keepAlive = true;
  (http.globalAgent as any).keepAliveMsecs = keepAliveTimeout;
  (https.globalAgent as any).keepAliveMsecs = keepAliveTimeout;
} else {
  const agent = new http.Agent({
    keepAlive: true,
    keepAliveMsecs: keepAliveTimeout
  });

  const secureAgent = new https.Agent({
    keepAlive: true,
    keepAliveMsecs: keepAliveTimeout
  });

  const httpRequest = http.request;
  const httpsRequest = https.request;

  http.request = (options, callback) => {
    if (options.protocol == 'https:') {
      options['agent'] = secureAgent;
      return httpsRequest(options, callback);
    }
    options['agent'] = agent;
    return httpRequest(options, callback);
  };
}
