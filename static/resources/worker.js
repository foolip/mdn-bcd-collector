self.addEventListener('install', (event) => {
  const promiseChain = caches.open('test-cache')
  .then((openCache) => {
    return openCache.put(
      new Request('/__test/example'),
      new Response(PeriodicSyncEvent)
    );
  });
  event.waitUntil(promiseChain);
});

self.addEventListener('message', function(event) {
  function stringify(value) {
    try {
      return String(value);
    } catch (err) {
      return 'unserializable value';
    }
  }

  var name = event.data[0];
  var func = event.data[1];
  var info = event.data[3];

  var result = { name: name };

  try {
    var value = eval(func);
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

  var broadcast = new BroadcastChannel(name);
  broadcast.postMessage(result);
})