# mdn-bcd-collector Changelog

## v3.3.1

- Automatically tag new releases (#1484), 2021-09-15
- Add RTCSessionDescription test; fix RTCDTMFToneChangeEvent (#1488), 2021-09-15

## v3.3.0

- Add required request parameter to FetchEvent constructor (#1481), 2021-09-10
- Send the right tests to SharedWorker and ServiceWorker (#1479), 2021-09-10
- Use document.fonts or self.fonts as FontFaceSet instance (#1474), 2021-09-10
- Remove custom test for api.Document.documentURI.readonly (#1471), 2021-09-08
- Add comment explaining RTCPeerConnection constructor order (#1470), 2021-09-08
- Fix custom test for RTCPeerConnection (#1469), 2021-09-08
- Add .nvmrc (#1468), 2021-09-08
- Revert "Create custom test for RTCRtpReceiver" (#1464), 2021-09-07
- Simplify window.crypto custom test (#1465), 2021-09-07
- Update custom test for ImageData (#1461), 2021-09-05
- Change Vinyl's username on footer to match rebranding (#1460), 2021-09-05
- Create custom test for RTCRtpReceiver (#1459), 2021-09-05
- Create custom tests for DOMTokenList (#1458), 2021-09-04
- Fix Safari bug for window.crypto (#1457), 2021-09-04
- Remove stray semicolon (#1456), 2021-09-03

## v3.2.12

- Add back PaymentAddress as custom IDL, 2021-09-02

## v3.2.11

- Reorganize custom IDL by spec affinity (#1441), 2021-08-27
- Remove navigator.canShare() custom IDL, 2021-08-27
- testConstructor: add catch for Safari's "Can't find variable" error (#1434), 2021-08-23
- Add custom test for DOMTokenList.toggle.force_parameter (#1433), 2021-08-23
- Add custom test for SVGAnimatedString (#1432), 2021-08-23
- Ignore .DS_Store (#1431), 2021-08-21
- Format comments in custom tests to ensure they remain on their own line (#1430), 2021-08-21
- Fix the comment for RTCPeerConnection (#1429), 2021-08-20
- Fix import in add-new-bcd (#1427), 2021-08-20
- Add comment explaining the RTCPeerConnection constructor test (#1426), 2021-08-20

## v3.2.10

- Use performance.getEntries() to get PerformanceEntry instance (#1417), 2021-08-20
- Addressing Lighthouse audit report (#1411), 2021-08-19
- Add initWebKitAnimationEvent and initWebKitTransitionEvent tests (#1415), 2021-08-19
- Fix test for RTCPeerConnection (#1409), 2021-08-17
- Make testConstructor able to test constructor objects (#1408), 2021-08-16
- Updates for event custom tests (#1405), 2021-08-16
- Account for Opera Presto error (#1404), 2021-08-16

## v3.2.9

- Fix results URL generation (#1402), 2021-08-15

## v3.2.8

- Bug fixes (#1400), 2021-08-15

## v3.2.7

- Revert documentURI after testing api.Document.documentURI.readonly (#1398), 2021-08-15

## v3.2.6

- Use console.log vs. updateStatus for completion logs (#1396), 2021-08-15
- Fix cryptoKey instance (#1395), 2021-08-15
- Fix new debugmode logging (#1394), 2021-08-15
- Add further debug logging in debug mode (#1393), 2021-08-15
- Fix odd bug with older browsers trying to post results to example.org (#1392), 2021-08-15

## v3.2.5

- Custom test updates (#1390), 2021-08-14
- Further synchronize ESLint and Prettier (and format remaining files) (#1389), 2021-08-14
- Synchronize ESLint and Prettier rules (#1388), 2021-08-14
- Fix find-missing-releases (#1387), 2021-08-14
- Add .prettierrc file (#1386), 2021-08-14
- Add find-missing-results (#1385), 2021-08-14
- Add debug mode console logs (#1384), 2021-08-13
- Make Plugin test inconclusive if navigator.plugins is empty (#1377), 2021-08-12
- Add instances for XMLHttpRequestEventTarget and XMLHttpRequestUpload (#1376), 2021-08-12

## v3.2.4

- Add a type string for most event constructors (#1375), 2021-08-11
- Remove ^ from package.json (#1379), 2021-08-11
- Add more custom tests (#1367), 2021-08-05
- Add/update custom tests (#1364), 2021-08-03
- Convert custom-tests.json to YAML (for multiline formatting) (#1358), 2021-08-02
- Fix custom test for Notification API (#1357), 2021-08-02
- Fix test for XPathResult (#1355), 2021-07-31
- Add additional additional for several APIs (#1347), 2021-07-30
- Improve test for WebSocket API (#1346), 2021-07-26

## v3.2.3

- Add a test for Object.hasOwn() (#1342), 2021-07-23
- Combine results from different reports for the same browser version (#1340), 2021-07-23
- Simplify getSupportMap by ignoring URL (#1339), 2021-07-23
- Correct preference for fake Firefox media stream (#1333), 2021-07-22
- Simplify getSupportMap to use bare values, not {result: ...} (#1332), 2021-07-22
- Fix tests for WritableStreamDefaultController/Writer (#1324), 2021-07-21
- Remove mapping of console-&gt;Console (#1326), 2021-07-21
- Fix variable names in custom tests to avoid "interface" (#1323), 2021-07-20

## v3.2.2

- Revert "Update lockfile version to 2" (#1321), 2021-07-20
- Ignore user media tests on Firefox 34-52 (#1319), 2021-07-19
- Update lockfile version to 2 (#1317), 2021-07-19
- Cover inherited attributes (#1318), 2021-07-19
- Add instrumentKey custom IDL (#1314), 2021-07-16

## v3.2.1

- Add tests for some JavaScript alt. names. in BCD (#1313), 2021-07-16
- Remove Function.prototype.displayName test (#1311), 2021-07-16

## v3.2.0

- Remove tests for columnNumber/fileName/lineNumber (#1310), 2021-07-16
- Generate test for JavaScript constructors (#1307), 2021-07-16
- Generate tests for property symbols (@@ features) (#1306), 2021-07-16
- Generate tests for JavaScript builtins (#1302), 2021-07-16

## v3.1.11

- Add back custom IDL now gone from @webref/idl (#1300), 2021-07-15
- Add MutationEvent instance (document.createEvent('MutationEvent')) (#1297), 2021-07-12
- Add custom tests for WritableStreamDefaultController/Writer (#1295), 2021-07-09
- Update UA parser to better handle iOS browsers (#1290), 2021-07-08
- Enable fake media stream for Firefox in Selenium script (#1289), 2021-07-08
- Custom tests: replace variable assignments as well (#1288), 2021-07-06

## v3.1.10

- Add IDs for export buttons (#1282), 2021-07-05
- Fix Firefox collection regarding new WebKitAnimationEvent test (#1280), 2021-07-04
- Add custom test for WebGLRenderingContext (#1279), 2021-07-04
- Increase the verbosity of errors in results parsing (#1278), 2021-07-04
- More Selenium script updates (#1277), 2021-07-04
- Selenium script updates (#1276), 2021-07-04

## v3.1.9

- Remove custom IDL now in @webref/idl, 2021-07-01

## v3.1.8

- Add a --path argument to filter BCD paths by wildcards (#1245), 2021-06-21
- Use &lt;b&gt; as a HTMLElement instance (not HTMLUnknownElement) (#1253), 2021-06-21
- Use window.toolbar as a BarProp instance (#1252), 2021-06-21
- Add more tests for (WebKit- or unprefixed) AnimationEvent/TransitionEvent (#1251), 2021-06-21
- Tweak some custom tests for consistency (#1250), 2021-06-21
- Add custom IDL for webkit-prefixed Pointer Lock API (#1249), 2021-06-21
- Add custom code for MouseEvent instance (#1248), 2021-06-21
- Add custom code for WheelEvent instance (#1247), 2021-06-21
- Add RTCPeerConnection instance with prefixed variants (#1246), 2021-06-20

## v3.1.7

- Remove custom SourceBuffer.changeType now in @webref/idl, 2021-06-18
- Fix Peformance\* custom tests (#1238), 2021-06-18
- Create an instance for XMLHttpRequest tests (#1237), 2021-06-16
- Fix the fallback for creating an Event instance (#1236), 2021-06-16
- Always show form buttons, but disable by default (#1231), 2021-06-12

## v3.1.6

- Test for crypto.webkitSubtle and use it as a SubtleCrypto instance (#1219), 2021-06-10
- Simplify subtle.crypto custom test instance (#1216), 2021-06-08
- Add custom test instance for WorkerLocation (#1211), 2021-06-07
- Update custom test for ProcessingInstruction (#1210), 2021-06-07
- Get a DOMException instance from a thrown exception (#1192), 2021-06-06

## v3.1.5

- Fix http-&gt;https (#1205), 2021-06-04
- Improve MediaStream tests for camera-less devices (#1203), 2021-06-03
- Document how to diff tests in the release process (#1201), 2021-06-03
- Revert "Add reusable instances of Worker and SharedWorker" (#1202), 2021-06-03
- Add reusable instances of Worker and SharedWorker (#1200), 2021-06-03
- Fix custom test for ProcessingInstruction API (#1198), 2021-06-03
- Selenium: don't try to test Safari 14.0 in BrowserStack (#1197), 2021-06-03
- Add custom test for WebGLVertexArrayObjectOES API (#1195), 2021-06-02
- Use navigator as the WorkerNavigator instance (#1194), 2021-06-02

## v3.1.4

- Test SVGElement using a &lt;title&gt; element instance (#1189), 2021-05-31

## v3.1.3

- Document the manual release process, 2021-05-28
- Fix SVGFEFuncAlement typo in SVGComponentTransferFunctionElement test (#1179), 2021-05-27
- Avoid external URL in FontFace source (#1172), 2021-05-21
- Avoid hardcoded appspot.com URLs in custom tests (#1170), 2021-05-20
- Update UA parser to handle old Android WebView versions (#1162), 2021-05-20

## v3.1.2

- Add custom IDL for webkitSlice (#1169), 2021-05-20
- Add custom IDL for zoomAndPan attributes (#1166), 2021-05-20

## v3.1.1

- Update a few URLs to master branches already renamed to main (#1159), 2021-05-19
- Add custom IDL for payment APIs still shipping in Chrome, 2021-05-18
- Remove outerText custom IDL now in webref, 2021-05-18

## v3.1.0

- Add custom IDL for createEncodedStreams() methods (#1147), 2021-05-08
- Remove Sanitizer API custom IDL now in webref, 2021-05-08
- Remove web-animations-2 custom IDL now in webref, 2021-05-08
- Stop using CSS.supports for CSS property tests (#1132), 2021-04-29
- Remove '&&' combinator in compileTest calls where not needed (#1131), 2021-04-29
- Use webkitSpeechRecognition to test SpeechRecognition members (#1130), 2021-04-28

## v3.0.2

- Drop support for [Constructor] extended attribute (#1124), 2021-04-22
- Once again validate custom IDL (#1122), 2021-04-22
- Fix BluetoothGATTRemoteServer unknown type (renamed) (#1118), 2021-04-20
- Check for all duplicates (not just operations) in mergeMembers (#1117), 2021-04-20
- Remove some types from the ignore list, fixing remaining issues (#1116), 2021-04-20

## v3.0.1

- Add back initWheelEvent as custom IDL (#1100), 2021-04-06
- Update button/select/submit styling (#1092), 2021-04-01

## v3.0.0

- Make update-bcd more conservative about updating existing data (#1088), 2021-03-29
- Remove unused support for update-bcd to updated prefixed entries (#1087), 2021-03-29
- Remove custom tests around AudioScheduledSourceNode (#1076), 2021-03-29
- Adapt to @webref/idl 1.0.11, 2021-03-26
- Add custom IDL for webkitCreateShadowRoot() (#1080), 2021-03-25
- Add required arguments to createPeriodicWave custom test (#1077), 2021-03-24
- Use a AudioBufferSourceNode instance to test AudioScheduledSourceNode (#1074), 2021-03-23
- Add ms-prefixed APIs based on find-missing output (#1072), 2021-03-22
- Add a --include-aliases option to the find-missing script (#1071), 2021-03-22
- Add custom IDL for navigator.mozBattery/webkitBattery (#1069), 2021-03-20
- Support running a HTTPS server locally with a custom certificate (#1046), 2021-03-19
- Simplify code and resources in tests.json (#1063), 2021-03-17
- Simplify compileTest internally (#1062), 2021-03-17
- Remove the test category from tests.json (#1061), 2021-03-17
- Fix typo in SVGHKernElement custom IDL (#1055), 2021-03-15
- Add --release argument (filter) for update-bcd.js (#1019), 2021-03-12
- Simplify how custom IDL is loaded/parsed (#1048), 2021-03-10
- Use @webref/css package for CSS property list (#1047), 2021-03-10
- Add more custom IDL (#1044), 2021-03-09
- Clarify where to get the collector results from (#1043), 2021-03-09
- Add more custom IDL (#1039), 2021-03-08
- Let update-bcd script use ../mdn-bcd-results/ by default (#1024), 2021-02-27
- Document how to use the update-bcd script (#1020), 2021-02-26
- Document the design of update-bcd.js (not how to use it) (#1021), 2021-02-26
- Undo some unsightly Prettier formatting (#1018), 2021-02-24
- Restore getUserMedia() for custom tests and skip them in Edge 12-18 (#1017), 2021-02-24
- Move ignore (test filtering) logic in getTests (#1016), 2021-02-24
- Add custom IDL for XMLSerializer.serializeToStream method (#1012), 2021-02-24

## v2.0.1

- Use compare-versions in selenium.js (#1009), 2021-02-24
- Avoid calling getUserMedia() in custom tests (#1008), 2021-02-23
- Update the Sauce Labs sample config to one that works (#1006), 2021-02-23
- Increase Selenium timeouts to 30s (#1005), 2021-02-23
- Expand on secrets.sample.json to make it easier to search/guess (#1004), 2021-02-23

## v2.0.0

- Let selenium.js download the report instead of recreating it (#999), 2021-02-23
- Support both GET and POST for /export (#1002), 2021-02-23
- Simply results export into a form submission and server-side logic (#1001), 2021-02-23
- Export results to a downloadable URL by default (#979), 2021-02-22
- Document /api/get, 2021-02-22
- Remove XML-style &lt;br /&gt; self-closing tags, 2021-02-22
- Remove copyright statements from HTML files (#993), 2021-02-21
- Rename github.js to exporter.js to expand its responsibilities (#992), 2021-02-19
- Validate the payloads sent to /api/results (#991), 2021-02-19
- Send no response for /api/results (#990), 2021-02-19
- Drop the empty string prefixes from tests.json (#985), 2021-02-18
- Drop support for building prefixed variants of tests (#984), 2021-02-18
- Simplify error handling in express request handlers (#983), 2021-02-18
- Capitalize appVersion (#982), 2021-02-18
- Bring DESIGN.md more into sync with how things currently work (#981), 2021-02-18

## v1.3.3

- Remove MediaSettingsRange (dictionary) custom test (#974), 2021-02-16
- Fix some custom Web Audio API tests (#973), 2021-02-16
- Test BaseAudioContext members using an AudioContext instance (#971), 2021-02-16

## v1.3.2

- Add custom IDL for marquee event handlers still in Gecko (#964), 2021-02-14
- Switch to google-github-actions to avoid warning (#963), 2021-02-13
- Use innerHTML instead of innerText to create a Text instance (#962), 2021-02-13
- Get spec IDL from the new @webref/idl package (#959), 2021-02-12

## v1.3.1

- IE 5.5 no longer supported (#947), 2021-02-04
- Add another bucket of custom IDL (#940), 2021-01-29

## v1.3.0

- Add ever more custom IDL from Confluence (#938), 2021-01-29
- Add more custom IDL found via Confluence (#926), 2021-01-28
- Update webref IDL (#935), 2021-01-27
- Expand on custom prefixed interface tests (#931), 2021-01-25
- Use prefixed webkitOfflineAudioContext if possible, 2021-01-25
- Fix AudioContext custom tests (use prefixed for members), 2021-01-25
- Avoid generating extra tests for readonly setlike/maplike (#928), 2021-01-24
- Add missing forEach member test for IDL setlike declarations (#927), 2021-01-24
- Add custom IDL for more things found via Confluence (#923), 2021-01-22
- Generate tests for event interfaces, 2021-01-22
- Add custom CSS/IDL for things found via Confluence (#919), 2021-01-22
- Update webref (#918), 2021-01-21

## v1.2.0

- Update README about how deployment work (no `prod` branch) (#915), 2021-01-21
- Simplify some custom tests (#914), 2021-01-21
- Fix typo in the DOMRectList custom test (#913), 2021-01-21
- Add additional custom CSS properties from Confluence (#912), 2021-01-21
- Break the dependency on BCD for building tests (#911), 2021-01-21
- Trim the selenium.js BCD dependency to just browsers (#909), 2021-01-21
- Fix the custom test for SVGPointList (#908), 2021-01-21
- Add and update custom tests (#894), 2020-12-31

## v1.1.8

- Update custom tests (#889), 2020-12-23
- Improve DOMRectList and ShadowRoot custom tests (#888), 2020-12-22
- Add and improve custom tests (#885), 2020-12-18
- Use macOS Big Sur when testing with Selenium (#882), 2020-12-15

## v1.1.7

- Improve custom test for MessageChannel API (#880), 2020-12-15
- Add custom test for ImageCapture API (#879), 2020-12-15
- Fix constructor test function (#877), 2020-12-15
- Add custom test for External API (#878), 2020-12-15
- Add custom test for XPathExpression API (#876), 2020-12-15
- Update Webref (#874), 2020-12-14
- Fix typo in custom test for DOMRectList (#873), 2020-12-14
- Add custom tests for HTMLCollection and HTMLAllCollection APIs (#872), 2020-12-14
- Improve custom test for FontFace API (#870), 2020-12-13
- Add custom test for HTMLDocument API (#869), 2020-12-13
- Add custom test for URL API (#868), 2020-12-13
- Add custom tests for TextTrack and VTT APIs (#866), 2020-12-12
- Add custom test for StyleMedia API (#865), 2020-12-12
- Add custom test for MediaList API (#864), 2020-12-11
- Add custom test for NamedNodeMap API (#863), 2020-12-11
- Add custom test for DOMRectList API (#862), 2020-12-11
- Fix const attribute check (#858), 2020-12-10
- Don't generate tests for const attributes (#856), 2020-12-09
- Use local BCD repo for find-missing script (#851), 2020-12-07

## v1.1.6

- Add additional custom tests (#849), 2020-12-04
- Update custom tests (#845), 2020-12-02
- Update styling for results display (#839), 2020-12-01
- Add custom IDL for webkit-prefixed canvas APIs (#843), 2020-12-01
- Create add-new-bcd script (#838), 2020-11-30
- Add custom IDL for WebKitPoint and webkitConvertPointFrom\* methods (#842), 2020-11-30
- Remove miscapitalized entries (#837), 2020-11-28
- Rename a variable to prevent conflict (#836), 2020-11-28
- Use simplified dots for Mocha output (#835), 2020-11-28

## v1.1.5

- Fix UA parsing for Firefox 3.6 on BrowserStack (#834), 2020-11-28
- Update tests for PerformanceMark and PerformanceEntry APIs (#833), 2020-11-27
- Add additional autocapitalize custom IDL (#832), 2020-11-27
- Add prefixed variants of preservesPitch (#831), 2020-11-27
- Fix test for MediaSession API (#829), 2020-11-26
- Fix test for HTMLModElement for older Firefox versions (#828), 2020-11-25
- Fix ANGLE_instanced_arrays (#827), 2020-11-25
- Don't auto-generate custom tests for static attributes/methods (#826), 2020-11-25
- Update arguments to find-missing script (#823), 2020-11-24
- Fix Safari minimum version for Selenium (#822), 2020-11-24
- Fix PR descriptions (#821), 2020-11-24
- Add home link to footer (#820), 2020-11-24

## v1.1.4

- Update unittests (#818), 2020-11-24
- Replace Listr with Listr2 (#817), 2020-11-24
- Update custom test for MediaStream API (#816), 2020-11-24
- Add custom test for NodeList API (#813), 2020-11-24
- Map 'DedicatedWorker' as 'Worker' (#811), 2020-11-23
- Fix test for MediaSource.isTypeSupported (#809), 2020-11-23
- Include "promise.then" replacement when importing custom tests (#810), 2020-11-23
- Remove formEncType and lowSrc custom IDL (#807), 2020-11-23
- Include percentage of missing entries in find-missing output (#805), 2020-11-22
- Fix default value of browser argument in update-bcd (#804), 2020-11-22
- Allow for filtering browsers in update-bcd (#803), 2020-11-22
- Update UA parser (#802), 2020-11-22
- Fix custom tests for HTML and SVG element APIs (#800), 2020-11-21
- Update BCD: improve ranges (#798), 2020-11-19
- Add "max-parallel: 1" to deploy step in push (#797), 2020-11-19
- Compact report JSON (#794), 2020-11-19
- Revert "Compress results JSON with GZip compression (#791)" (#793), 2020-11-19
- Compress results JSON with GZip compression (#791), 2020-11-19

## v1.1.3

- Remove duplicate question mark in did-you-mean (#788), 2020-11-18
- Fix custom test for HTMLQuoteElement API (#787), 2020-11-18
- Fix test for CanvasRenderingContext2D (#786), 2020-11-18
- Update webref (#785), 2020-11-17
- Fix tests for LegacyFactoryFunction-based constructors (#784), 2020-11-17

## v1.1.2

- Improve performance for harness.js (#782), 2020-11-17
- UA parser: more lenient version matching on last version (#781), 2020-11-17

## v1.1.1

- Accommodate for old-style Firefox NS_ERROR exception (#778), 2020-11-16
- Improve error when a report has no results (#777), 2020-11-16
- Update update-bcd arguments (#776), 2020-11-16
- Fix misuse of word for "non-concurrent" Selenium argument (#773), 2020-11-16
- Fix exitOnError placement (#772), 2020-11-15

## v1.1.0

- Allow for non-consecutive Selenium runtime (#769), 2020-11-15
- Simplify order of browsers to test in Selenium script (#768), 2020-11-15
- Remove redundant timestamp in Selenium script's log() function (#767), 2020-11-15
- Add a little color to some Selenium output (#766), 2020-11-15
- Make Selenium run 5 consecutive browsers (#765), 2020-11-15
- Add TODO comment on BatteryManager custom test (#764), 2020-11-15
- Update ignore list param (#763), 2020-11-15
- Use "Dev" as version on local/staging versions (#762), 2020-11-15
- Temporarily disable using git commit as appversion (#761), 2020-11-15
- Update unittests (#760), 2020-11-15
- Upgrade Selenium to auto-hide results (#759), 2020-11-15
- Use git commit hash as version in dev/staging (#758), 2020-11-15
- Update GitHub exporting page (#757), 2020-11-15
- Disable test for BatteryManager (#756), 2020-11-15
- Include "Dev" in version if devbuild (#754), 2020-11-15
- Escape &lt;br&gt; tags when console logging status updates (#755), 2020-11-15
- Fix test for api.EventSource (#753), 2020-11-15
- Don't double-load style.css (#752), 2020-11-15

## v1.0.3

- Fix GitHub description generation (#751), 2020-11-14
- Various fixes (#749), 2020-11-14
- Increase timeout for test running (#748), 2020-11-13

## v1.0.2

- Compatibility updates (#746), 2020-11-13

## v1.0.1

- Styling updates (#744), 2020-11-13
- Fix issues with testing with promises (#743), 2020-11-13
- Selenium fixes (#742), 2020-11-13
- Revert "Use process.env.npm_package_version vs. require('./package.json').version (#723)" (#740), 2020-11-13

## v1.0.0

Initial release!
