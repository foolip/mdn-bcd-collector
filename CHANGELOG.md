# mdn-bcd-collector Changelog

## v4.0.0

- Fix styling for inputs and light background (#1571)
- Limit deploy action to only run one at a time (#1570)
- Map WindowOrWorkerGlobalScope members to \_globals folder (#1558)
- Update URLs to Web IDL (#1549)
- Use NodeGit's Revwalk to generate the changelog (#1539)
- Create release preparation script (#1513)
- Add custom tests for HTMLFormControlsCollection and RadioNodeList (#1528)
- Create a changelog (#1514)
- Ignore Deno by default in find-missing-results script (#1535)
- Add custom test for TextMetrics API (#1534)
- Remove insufficient tests for document.createElement() options (#1508)
- Use WebKitMutationObserver to create a MutationObserver instance (#1511)
- Fix test for XPathResult in old Firefox versions (#1507)
- Sass it up! Convert styling to SCSS (#1502)
- Add a type string for more event constructors (#1489)
- Add documentation for how to review changes from the collector (#1436)
- Add a privacy notice to homepage (#1499)
- Add custom test for HTMLOptionsCollection (#1497)
- Convert from CJS to ESM (#1475)

## v3.3.1

- Automatically tag new releases (#1484)
- Add RTCSessionDescription test; fix RTCDTMFToneChangeEvent (#1488)

## v3.3.0

- Add required request parameter to FetchEvent constructor (#1481)
- Send the right tests to SharedWorker and ServiceWorker (#1479)
- Use document.fonts or self.fonts as FontFaceSet instance (#1474)
- Remove custom test for api.Document.documentURI.readonly (#1471)
- Add comment explaining RTCPeerConnection constructor order (#1470)
- Fix custom test for RTCPeerConnection (#1469)
- Add .nvmrc (#1468)
- Revert "Create custom test for RTCRtpReceiver" (#1464)
- Simplify window.crypto custom test (#1465)
- Update custom test for ImageData (#1461)
- Change Vinyl's username on footer to match rebranding (#1460)
- Create custom test for RTCRtpReceiver (#1459)
- Create custom tests for DOMTokenList (#1458)
- Fix Safari bug for window.crypto (#1457)
- Remove stray semicolon (#1456)

## v3.2.12

- Add back PaymentAddress as custom IDL

## v3.2.11

- Reorganize custom IDL by spec affinity (#1441)
- Remove navigator.canShare() custom IDL
- testConstructor: add catch for Safari's "Can't find variable" error (#1434)
- Add custom test for DOMTokenList.toggle.force_parameter (#1433)
- Add custom test for SVGAnimatedString (#1432)
- Ignore .DS_Store (#1431)
- Format comments in custom tests to ensure they remain on their own line (#1430)
- Fix the comment for RTCPeerConnection (#1429)
- Fix import in add-new-bcd (#1427)
- Add comment explaining the RTCPeerConnection constructor test (#1426)

## v3.2.10

- Use performance.getEntries() to get PerformanceEntry instance (#1417)
- Addressing Lighthouse audit report (#1411)
- Add initWebKitAnimationEvent and initWebKitTransitionEvent tests (#1415)
- Fix test for RTCPeerConnection (#1409)
- Make testConstructor able to test constructor objects (#1408)
- Updates for event custom tests (#1405)
- Account for Opera Presto error (#1404)

## v3.2.9

- Fix results URL generation (#1402)

## v3.2.8

- Bug fixes (#1400)

## v3.2.7

- Revert documentURI after testing api.Document.documentURI.readonly (#1398)

## v3.2.6

- Use console.log vs. updateStatus for completion logs (#1396)
- Fix cryptoKey instance (#1395)
- Fix new debugmode logging (#1394)
- Add further debug logging in debug mode (#1393)
- Fix odd bug with older browsers trying to post results to example.org (#1392)

## v3.2.5

- Custom test updates (#1390)
- Further synchronize ESLint and Prettier (and format remaining files) (#1389)
- Synchronize ESLint and Prettier rules (#1388)
- Fix find-missing-releases (#1387)
- Add .prettierrc file (#1386)
- Add find-missing-results (#1385)
- Add debug mode console logs (#1384)
- Make Plugin test inconclusive if navigator.plugins is empty (#1377)
- Add instances for XMLHttpRequestEventTarget and XMLHttpRequestUpload (#1376)

## v3.2.4

- Add a type string for most event constructors (#1375)
- Remove ^ from package.json (#1379)
- Add more custom tests (#1367)
- Add/update custom tests (#1364)
- Convert custom-tests.json to YAML (for multiline formatting) (#1358)
- Fix custom test for Notification API (#1357)
- Fix test for XPathResult (#1355)
- Add additional additional for several APIs (#1347)
- Improve test for WebSocket API (#1346)

## v3.2.3

- Add a test for Object.hasOwn() (#1342)
- Combine results from different reports for the same browser version (#1340)
- Simplify getSupportMap by ignoring URL (#1339)
- Correct preference for fake Firefox media stream (#1333)
- Simplify getSupportMap to use bare values, not {result: ...} (#1332)
- Fix tests for WritableStreamDefaultController/Writer (#1324)
- Remove mapping of console-&gt;Console (#1326)
- Fix variable names in custom tests to avoid "interface" (#1323)

## v3.2.2

- Revert "Update lockfile version to 2" (#1321)
- Ignore user media tests on Firefox 34-52 (#1319)
- Update lockfile version to 2 (#1317)
- Cover inherited attributes (#1318)
- Add instrumentKey custom IDL (#1314)

## v3.2.1

- Add tests for some JavaScript alt. names. in BCD (#1313)
- Remove Function.prototype.displayName test (#1311)

## v3.2.0

- Remove tests for columnNumber/fileName/lineNumber (#1310)
- Generate test for JavaScript constructors (#1307)
- Generate tests for property symbols (@@ features) (#1306)
- Generate tests for JavaScript builtins (#1302)

## v3.1.11

- Add back custom IDL now gone from @webref/idl (#1300)
- Add MutationEvent instance (document.createEvent('MutationEvent')) (#1297)
- Add custom tests for WritableStreamDefaultController/Writer (#1295)
- Update UA parser to better handle iOS browsers (#1290)
- Enable fake media stream for Firefox in Selenium script (#1289)
- Custom tests: replace variable assignments as well (#1288)

## v3.1.10

- Add IDs for export buttons (#1282)
- Fix Firefox collection regarding new WebKitAnimationEvent test (#1280)
- Add custom test for WebGLRenderingContext (#1279)
- Increase the verbosity of errors in results parsing (#1278)
- More Selenium script updates (#1277)
- Selenium script updates (#1276)

## v3.1.9

- Remove custom IDL now in @webref/idl

## v3.1.8

- Add a --path argument to filter BCD paths by wildcards (#1245)
- Use &lt;b&gt; as a HTMLElement instance (not HTMLUnknownElement) (#1253)
- Use window.toolbar as a BarProp instance (#1252)
- Add more tests for (WebKit- or unprefixed) AnimationEvent/TransitionEvent (#1251)
- Tweak some custom tests for consistency (#1250)
- Add custom IDL for webkit-prefixed Pointer Lock API (#1249)
- Add custom code for MouseEvent instance (#1248)
- Add custom code for WheelEvent instance (#1247)
- Add RTCPeerConnection instance with prefixed variants (#1246)

## v3.1.7

- Remove custom SourceBuffer.changeType now in @webref/idl
- Fix Performance\* custom tests (#1238)
- Create an instance for XMLHttpRequest tests (#1237)
- Fix the fallback for creating an Event instance (#1236)
- Always show form buttons, but disable by default (#1231)

## v3.1.6

- Test for crypto.webkitSubtle and use it as a SubtleCrypto instance (#1219)
- Simplify subtle.crypto custom test instance (#1216)
- Add custom test instance for WorkerLocation (#1211)
- Update custom test for ProcessingInstruction (#1210)
- Get a DOMException instance from a thrown exception (#1192)

## v3.1.5

- Fix http-&gt;https (#1205)
- Improve MediaStream tests for camera-less devices (#1203)
- Document how to diff tests in the release process (#1201)
- Revert "Add reusable instances of Worker and SharedWorker" (#1202)
- Add reusable instances of Worker and SharedWorker (#1200)
- Fix custom test for ProcessingInstruction API (#1198)
- Selenium: don't try to test Safari 14.0 in BrowserStack (#1197)
- Add custom test for WebGLVertexArrayObjectOES API (#1195)
- Use navigator as the WorkerNavigator instance (#1194)

## v3.1.4

- Test SVGElement using a &lt;title&gt; element instance (#1189)

## v3.1.3

- Document the manual release process
- Fix SVGFEFuncAlement typo in SVGComponentTransferFunctionElement test (#1179)
- Avoid external URL in FontFace source (#1172)
- Avoid hardcoded appspot.com URLs in custom tests (#1170)
- Update UA parser to handle old Android WebView versions (#1162)

## v3.1.2

- Add custom IDL for webkitSlice (#1169)
- Add custom IDL for zoomAndPan attributes (#1166)

## v3.1.1

- Update a few URLs to master branches already renamed to main (#1159)
- Add custom IDL for payment APIs still shipping in Chrome
- Remove outerText custom IDL now in webref

## v3.1.0

- Add custom IDL for createEncodedStreams() methods (#1147)
- Remove Sanitizer API custom IDL now in webref
- Remove web-animations-2 custom IDL now in webref
- Stop using CSS.supports for CSS property tests (#1132)
- Remove '&&' combinator in compileTest calls where not needed (#1131)
- Use webkitSpeechRecognition to test SpeechRecognition members (#1130)

## v3.0.2

- Drop support for [Constructor] extended attribute (#1124)
- Once again validate custom IDL (#1122)
- Fix BluetoothGATTRemoteServer unknown type (renamed) (#1118)
- Check for all duplicates (not just operations) in mergeMembers (#1117)
- Remove some types from the ignore list, fixing remaining issues (#1116)

## v3.0.1

- Add back initWheelEvent as custom IDL (#1100)
- Update button/select/submit styling (#1092)

## v3.0.0

- Make update-bcd more conservative about updating existing data (#1088)
- Remove unused support for update-bcd to updated prefixed entries (#1087)
- Remove custom tests around AudioScheduledSourceNode (#1076)
- Adapt to @webref/idl 1.0.11
- Add custom IDL for webkitCreateShadowRoot() (#1080)
- Add required arguments to createPeriodicWave custom test (#1077)
- Use a AudioBufferSourceNode instance to test AudioScheduledSourceNode (#1074)
- Add ms-prefixed APIs based on find-missing output (#1072)
- Add a --include-aliases option to the find-missing script (#1071)
- Add custom IDL for navigator.mozBattery/webkitBattery (#1069)
- Support running a HTTPS server locally with a custom certificate (#1046)
- Simplify code and resources in tests.json (#1063)
- Simplify compileTest internally (#1062)
- Remove the test category from tests.json (#1061)
- Fix typo in SVGHKernElement custom IDL (#1055)
- Add --release argument (filter) for update-bcd.js (#1019)
- Simplify how custom IDL is loaded/parsed (#1048)
- Use @webref/css package for CSS property list (#1047)
- Add more custom IDL (#1044)
- Clarify where to get the collector results from (#1043)
- Add more custom IDL (#1039)
- Let update-bcd script use ../mdn-bcd-results/ by default (#1024)
- Document how to use the update-bcd script (#1020)
- Document the design of update-bcd.js (not how to use it) (#1021)
- Undo some unsightly Prettier formatting (#1018)
- Restore getUserMedia() for custom tests and skip them in Edge 12-18 (#1017)
- Move ignore (test filtering) logic in getTests (#1016)
- Add custom IDL for XMLSerializer.serializeToStream method (#1012)

## v2.0.1

- Use compare-versions in selenium.js (#1009)
- Avoid calling getUserMedia() in custom tests (#1008)
- Update the Sauce Labs sample config to one that works (#1006)
- Increase Selenium timeouts to 30s (#1005)
- Expand on secrets.sample.json to make it easier to search/guess (#1004)

## v2.0.0

- Let selenium.js download the report instead of recreating it (#999)
- Support both GET and POST for /export (#1002)
- Simply results export into a form submission and server-side logic (#1001)
- Export results to a downloadable URL by default (#979)
- Document /api/get
- Remove XML-style &lt;br /&gt; self-closing tags
- Remove copyright statements from HTML files (#993)
- Rename github.js to exporter.js to expand its responsibilities (#992)
- Validate the payloads sent to /api/results (#991)
- Send no response for /api/results (#990)
- Drop the empty string prefixes from tests.json (#985)
- Drop support for building prefixed variants of tests (#984)
- Simplify error handling in express request handlers (#983)
- Capitalize appVersion (#982)
- Bring DESIGN.md more into sync with how things currently work (#981)

## v1.3.3

- Remove MediaSettingsRange (dictionary) custom test (#974)
- Fix some custom Web Audio API tests (#973)
- Test BaseAudioContext members using an AudioContext instance (#971)

## v1.3.2

- Add custom IDL for marquee event handlers still in Gecko (#964)
- Switch to google-github-actions to avoid warning (#963)
- Use innerHTML instead of innerText to create a Text instance (#962)
- Get spec IDL from the new @webref/idl package (#959)

## v1.3.1

- IE 5.5 no longer supported (#947)
- Add another bucket of custom IDL (#940)

## v1.3.0

- Add ever more custom IDL from Confluence (#938)
- Add more custom IDL found via Confluence (#926)
- Update webref IDL (#935)
- Expand on custom prefixed interface tests (#931)
- Use prefixed webkitOfflineAudioContext if possible
- Fix AudioContext custom tests (use prefixed for members)
- Avoid generating extra tests for readonly setlike/maplike (#928)
- Add missing forEach member test for IDL setlike declarations (#927)
- Add custom IDL for more things found via Confluence (#923)
- Generate tests for event interfaces
- Add custom CSS/IDL for things found via Confluence (#919)
- Update webref (#918)

## v1.2.0

- Update README about how deployment work (no `prod` branch) (#915)
- Simplify some custom tests (#914)
- Fix typo in the DOMRectList custom test (#913)
- Add additional custom CSS properties from Confluence (#912)
- Break the dependency on BCD for building tests (#911)
- Trim the selenium.js BCD dependency to just browsers (#909)
- Fix the custom test for SVGPointList (#908)
- Add and update custom tests (#894)

## v1.1.8

- Update custom tests (#889)
- Improve DOMRectList and ShadowRoot custom tests (#888)
- Add and improve custom tests (#885)
- Use macOS Big Sur when testing with Selenium (#882)

## v1.1.7

- Improve custom test for MessageChannel API (#880)
- Add custom test for ImageCapture API (#879)
- Fix constructor test function (#877)
- Add custom test for External API (#878)
- Add custom test for XPathExpression API (#876)
- Update Webref (#874)
- Fix typo in custom test for DOMRectList (#873)
- Add custom tests for HTMLCollection and HTMLAllCollection APIs (#872)
- Improve custom test for FontFace API (#870)
- Add custom test for HTMLDocument API (#869)
- Add custom test for URL API (#868)
- Add custom tests for TextTrack and VTT APIs (#866)
- Add custom test for StyleMedia API (#865)
- Add custom test for MediaList API (#864)
- Add custom test for NamedNodeMap API (#863)
- Add custom test for DOMRectList API (#862)
- Fix const attribute check (#858)
- Don't generate tests for const attributes (#856)
- Use local BCD repo for find-missing script (#851)

## v1.1.6

- Add additional custom tests (#849)
- Update custom tests (#845)
- Update styling for results display (#839)
- Add custom IDL for webkit-prefixed canvas APIs (#843)
- Create add-new-bcd script (#838)
- Add custom IDL for WebKitPoint and webkitConvertPointFrom\* methods (#842)
- Remove miscapitalized entries (#837)
- Rename a variable to prevent conflict (#836)
- Use simplified dots for Mocha output (#835)

## v1.1.5

- Fix UA parsing for Firefox 3.6 on BrowserStack (#834)
- Update tests for PerformanceMark and PerformanceEntry APIs (#833)
- Add additional autocapitalize custom IDL (#832)
- Add prefixed variants of preservesPitch (#831)
- Fix test for MediaSession API (#829)
- Fix test for HTMLModElement for older Firefox versions (#828)
- Fix ANGLE_instanced_arrays (#827)
- Don't auto-generate custom tests for static attributes/methods (#826)
- Update arguments to find-missing script (#823)
- Fix Safari minimum version for Selenium (#822)
- Fix PR descriptions (#821)
- Add home link to footer (#820)

## v1.1.4

- Update unittests (#818)
- Replace Listr with Listr2 (#817)
- Update custom test for MediaStream API (#816)
- Add custom test for NodeList API (#813)
- Map 'DedicatedWorker' as 'Worker' (#811)
- Fix test for MediaSource.isTypeSupported (#809)
- Include "promise.then" replacement when importing custom tests (#810)
- Remove formEncType and lowSrc custom IDL (#807)
- Include percentage of missing entries in find-missing output (#805)
- Fix default value of browser argument in update-bcd (#804)
- Allow for filtering browsers in update-bcd (#803)
- Update UA parser (#802)
- Fix custom tests for HTML and SVG element APIs (#800)
- Update BCD: improve ranges (#798)
- Add "max-parallel: 1" to deploy step in push (#797)
- Compact report JSON (#794)
- Revert "Compress results JSON with GZip compression (#791)" (#793)
- Compress results JSON with GZip compression (#791)

## v1.1.3

- Remove duplicate question mark in did-you-mean (#788)
- Fix custom test for HTMLQuoteElement API (#787)
- Fix test for CanvasRenderingContext2D (#786)
- Update webref (#785)
- Fix tests for LegacyFactoryFunction-based constructors (#784)

## v1.1.2

- Improve performance for harness.js (#782)
- UA parser: more lenient version matching on last version (#781)

## v1.1.1

- Accommodate for old-style Firefox NS_ERROR exception (#778)
- Improve error when a report has no results (#777)
- Update update-bcd arguments (#776)
- Fix misuse of word for "non-concurrent" Selenium argument (#773)
- Fix exitOnError placement (#772)

## v1.1.0

- Allow for non-consecutive Selenium runtime (#769)
- Simplify order of browsers to test in Selenium script (#768)
- Remove redundant timestamp in Selenium script's log() function (#767)
- Add a little color to some Selenium output (#766)
- Make Selenium run 5 consecutive browsers (#765)
- Add TODO comment on BatteryManager custom test (#764)
- Update ignore list param (#763)
- Use "Dev" as version on local/staging versions (#762)
- Temporarily disable using git commit as appversion (#761)
- Update unittests (#760)
- Upgrade Selenium to auto-hide results (#759)
- Use git commit hash as version in dev/staging (#758)
- Update GitHub exporting page (#757)
- Disable test for BatteryManager (#756)
- Include "Dev" in version if devbuild (#754)
- Escape &lt;br&gt; tags when console logging status updates (#755)
- Fix test for api.EventSource (#753)
- Don't double-load style.css (#752)

## v1.0.3

- Fix GitHub description generation (#751)
- Various fixes (#749)
- Increase timeout for test running (#748)

## v1.0.2

- Compatibility updates (#746)

## v1.0.1

- Styling updates (#744)
- Fix issues with testing with promises (#743)
- Selenium fixes (#742)
- Revert "Use process.env.npm_package_version vs. require('./package.json').version (#723)" (#740)

## v1.0.0

Initial release!
