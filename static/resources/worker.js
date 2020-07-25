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
    console.log("Got a message!  " + event.data);
    event.source.postMessage("Got your message, hi there!");
})