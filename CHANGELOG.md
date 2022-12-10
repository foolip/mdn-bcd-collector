# mdn-bcd-collector Changelog

## v7.1.0

### Test Changes

#### Added

- api.CSSKeyframesRule.length
- api.Performance.interactionCount
- api.VisualViewport.scrollend_event

#### Removed

- api.CanvasRenderingContext2D.clearShadow
- api.CanvasRenderingContext2D.drawImageFromRect
- api.CanvasRenderingContext2D.mozImageSmoothingEnabled
- api.CanvasRenderingContext2D.mozTextStyle
- api.CanvasRenderingContext2D.setAlpha
- api.CanvasRenderingContext2D.setCompositeOperation
- api.CanvasRenderingContext2D.setFillColor
- api.CanvasRenderingContext2D.setLineCap
- api.CanvasRenderingContext2D.setLineJoin
- api.CanvasRenderingContext2D.setLineWidth
- api.CanvasRenderingContext2D.setMiterLimit
- api.CanvasRenderingContext2D.setShadow
- api.CanvasRenderingContext2D.setStrokeColor
- api.CanvasRenderingContext2D.webkitBackingStorePixelRatio
- api.CanvasRenderingContext2D.webkitImageSmoothingEnabled
- api.CanvasRenderingContext2D.webkitLineDash
- api.CanvasRenderingContext2D.webkitLineDashOffset
- api.CSSFontFeatureValuesRule.valueText
- api.CSSKeyframesRule.insertRule
- api.DeviceMotionEvent.initDeviceMotionEvent
- api.DeviceOrientationEvent.initDeviceOrientationEvent
- api.Document.mozFullScreenElement
- api.DragEvent.initDragEvent
- api.Element.mozRequestFullScreen
- api.Element.webkitcurrentplaybacktargetiswirelesschanged_event
- api.Element.webkitneedkey_event
- api.Element.webkitplaybacktargetavailabilitychanged_event
- api.Element.webkitpresentationmodechanged_event
- api.Element.releaseCapture
- api.Element.webkitRequestFullscreen
- api.Element.webkitRequestFullScreen
- api.Event.path
- api.EventSource.URL
- api.HashChangeEvent.initHashChangeEvent
- api.HTMLAnchorElement.hrefTranslate
- api.HTMLFormElement.autocapitalize
- api.HTMLFrameElement.getSVGDocument
- api.HTMLFrameElement.height
- api.HTMLFrameElement.location
- api.HTMLFrameElement.width
- api.HTMLHtmlElement.manifest
- api.HTMLInputElement.autocapitalize
- api.HTMLInputElement.mozIsTextField
- api.HTMLInputElement.textLength
- api.HTMLLinkElement.nonce
- api.HTMLMediaElement.getVideoPlaybackQuality
- api.HTMLMediaElement.mozCaptureStream
- api.HTMLMediaElement.mozPreservesPitch
- api.HTMLMediaElement.webkitAudioDecodedByteCount
- api.HTMLMediaElement.webkitClosedCaptionsVisible
- api.HTMLMediaElement.webkitCurrentPlaybackTargetIsWireless
- api.HTMLMediaElement.webkitHasClosedCaptions
- api.HTMLMediaElement.webkitPreservesPitch
- api.HTMLMediaElement.webkitShowPlaybackTargetPicker
- api.HTMLMediaElement.webkitVideoDecodedByteCount
- api.HTMLPreElement.wrap
- api.HTMLScriptElement.nonce
- api.HTMLSelectElement.blur
- api.HTMLSelectElement.focus
- api.HTMLStyleElement.nonce
- api.HTMLVideoElement.autoPictureInPicture
- api.HTMLVideoElement.webkitDecodedFrameCount
- api.HTMLVideoElement.webkitDisplayingFullscreen
- api.HTMLVideoElement.webkitDroppedFrameCount
- api.HTMLVideoElement.webkitEnterFullscreen
- api.HTMLVideoElement.webkitEnterFullScreen
- api.HTMLVideoElement.webkitExitFullscreen
- api.HTMLVideoElement.webkitExitFullScreen
- api.HTMLVideoElement.webkitPresentationMode
- api.HTMLVideoElement.webkitSetPresentationMode
- api.HTMLVideoElement.webkitSupportsFullscreen
- api.HTMLVideoElement.webkitSupportsPresentationMode
- api.HTMLVideoElement.webkitWirelessVideoPlaybackDisabled
- api.IDBVersionChangeEvent.dataLoss
- api.IDBVersionChangeEvent.dataLossMessage
- api.ImageBitmapRenderingContext.transferImageBitmap
- api.InteractionCounts
- api.IntersectionObserver.delay
- api.IntersectionObserver.trackVisibility
- api.IntersectionObserverEntry.isVisible
- api.KeyboardEvent.altGraphKey
- api.KeyboardEvent.keyLocation
- api.KeyboardEvent.which
- api.MessageEvent.userActivation
- api.MouseEvent.fromElement
- api.MouseEvent.mozInputSource
- api.MouseEvent.toElement
- api.MouseEvent.webkitForce
- api.MouseEvent.which
- api.Navigator.getStorageUpdates
- api.Navigator.mozGetUserMedia
- api.Navigator.webkitGetUserMedia
- api.OverconstrainedErrorEvent.OverconstrainedErrorEvent
- api.OverflowEvent
- api.PaymentRequest.hasEnrolledInstrument
- api.PaymentRequestEvent.changeShippingAddress
- api.PaymentRequestEvent.changeShippingOption
- api.PaymentRequestEvent.paymentOptions
- api.PaymentRequestEvent.shippingOptions
- api.Performance.interactionCounts
- api.ProcessingInstruction.data
- api.Range.expand
- api.RTCPeerConnection.addtrack_event
- api.RTCRtpReceiver.playoutDelayHint
- api.Selection.baseNode
- api.Selection.baseOffset
- api.Selection.extentNode
- api.Selection.extentOffset
- api.ServiceWorkerGlobalScope.caches
- api.ShadowRoot.mozFullScreenElement
- api.SourceBufferList.item
- api.SQLTransaction
- api.SVGCursorElement
- api.SVGMatrix
- api.TextEvent
- api.TextTrack.addRegion
- api.TextTrack.regions
- api.TextTrack.removeRegion
- api.TextTrackCue.getCueAsHTML
- api.TextTrackCueList.item
- api.TextTrackList.item
- api.UIEvent.cancelBubble
- api.UIEvent.layerX
- api.UIEvent.layerY
- api.UIEvent.pageX
- api.UIEvent.pageY
- api.UserMessageHandler
- api.UserMessageHandlersNamespace
- api.VideoTrackList.item
- api.VTTRegion.track
- api.webkitMediaStream
- api.WebKitMutationObserver
- api.WebKitNamespace
- api.WebKitPlaybackTargetAvailabilityEvent
- api.webkitSpeechGrammar
- api.webkitSpeechGrammarList
- api.webkitSpeechRecognition
- api.webkitSpeechRecognitionError
- api.webkitSpeechRecognitionEvent
- api.WebSocket.URL
- api.WheelEvent.initWebKitWheelEvent
- api.WheelEvent.webkitDirectionInvertedFromDevice
- api.Window.absolutedeviceorientation_event
- api.Window.openDatabase
- api.Window.webkitIndexedDB
- api.XMLHttpRequest.mozAnon
- api.XMLHttpRequest.mozSystem
- api.XMLHttpRequestProgressEvent
- api.XRSystem.supportsSession

#### Changed

- api.AnalyserNode
- api.AudioBufferSourceNode
- api.AudioNode
- api.AudioParam
- api.AudioScheduledSourceNode
- api.BiquadFilterNode
- api.ChannelMergerNode
- api.ChannelSplitterNode
- api.ConstantSourceNode
- api.ConvolverNode
- api.DelayNode
- api.DynamicsCompressorNode
- api.GainNode
- api.GeolocationCoordinates
- api.GeolocationPosition
- api.MediaStreamAudioSourceNode
- api.MediaStreamEvent
- api.MediaStreamTrack
- api.MediaStreamTrackAudioSourceNode
- api.MediaStreamTrackEvent
- api.OscillatorNode
- api.PannerNode
- api.ScriptProcessorNode
- api.StereoPannerNode
- api.WaveShaperNode

### Commits

- Use GAE cloud storage on Heroku + HDrive
- Fix audio node tests
- Fix media interface tests
- Update to latest highlight.js
- Handle additional constructor error message
- Show unsecure warning on test page as well
- Ignore all user media tests in Chrome 25-26
- Fix test timeout handler
- Fix sample custom-tests filepath
- Remove custom IDL for features not already in BCD
- Add test timeout
- Improve debugging
- Add timeout to GeolocationPosition test
- Allow debugmode to be turned on easier
- Increase test timeout duration in Selenium script
- Remove IE from Selenium script
- Fix copyright comments
- Update Selenium script to add "since" argument

## v7.0.0

Brand new collector! The mdn-bcd-collector project has been forked and is now operated and maintained by Gooborg Studios, with a new URL to follow (https://mdn-bcd-collector.gooborg.com). We have performed a few main changes in this major revision:

- There are now splashes of purple in the website, both to add a bit of Gooborg's branding and to differentiate the new version from the old
- The codebase has been completely migrated to TypeScript following BCD's TS migration, which should aid some in development consistency
- The app is hosted through Heroku, which greatly improves loading times
- A massive cleanup of old features has been performed to remove features no longer supported in any browser
- Many more under-the-hood changes have been made to optimize development and user experience

### Test Changes

#### Added

- api.CSSColorProfileRule
- api.Document.scrollend_event
- api.Document.startViewTransition
- api.HTMLElement.scrollend_event
- api.MathMLElement.scrollend_event
- api.ML.createContextSync
- api.MLContext.computeSync
- api.MLGraphBuilder.buildSync
- api.PerformanceResourceTiming.responseStatus
- api.RTCIceCandidate.url
- api.SVGElement.scrollend_event
- api.VideoFrame.metadata
- api.Window.scrollend_event
- css.properties.anchor-scroll
- css.properties.view-transition-name
- javascript.builtins.Array.toReversed
- javascript.builtins.Array.toSorted
- javascript.builtins.Array.toSpliced
- javascript.builtins.Array.with
- javascript.builtins.TypedArray.toReversed
- javascript.builtins.TypedArray.toSorted
- javascript.builtins.TypedArray.with

#### Removed

- api.AccessibleNode
- api.Attr.isId
- api.Attr.schemaTypeInfo
- api.AudioBuffer.gain
- api.AudioBufferSourceNode.gain
- api.AudioBufferSourceNode.looping
- api.AudioBufferSourceNode.noteGrainOn
- api.AudioBufferSourceNode.noteOff
- api.AudioBufferSourceNode.noteOn
- api.AudioBufferSourceNode.playbackState
- api.AudioListener.setVelocity
- api.AudioParam.cancelValuesAndHoldAtTime
- api.AudioParam.name
- api.AudioParam.setTargetValueAtTime
- api.AudioParam.units
- api.AudioTrackList.item
- api.Blob.webkitSlice
- api.BlobBuilder
- api.BluetoothAdvertisingData
- api.BluetoothDevice.adData
- api.BluetoothDevice.connectGATT
- api.BluetoothDevice.deviceClass
- api.BluetoothDevice.gattServer
- api.BluetoothDevice.paired
- api.BluetoothDevice.productID
- api.BluetoothDevice.productVersion
- api.BluetoothDevice.unwatchAdvertisements
- api.BluetoothDevice.uuids
- api.BluetoothDevice.vendorID
- api.BluetoothDevice.vendorIDSource
- api.BudgetService
- api.BudgetState
- api.CanvasCaptureMediaStream
- api.CanvasRenderingContext2D.addHitRegion
- api.CanvasRenderingContext2D.clearHitRegions
- api.CanvasRenderingContext2D.currentTransform
- api.CanvasRenderingContext2D.drawWidgetAsOnScreen
- api.CanvasRenderingContext2D.drawWindow
- api.CanvasRenderingContext2D.mozCurrentTransform
- api.CanvasRenderingContext2D.mozCurrentTransformInverse
- api.CanvasRenderingContext2D.msImageSmoothingEnabled
- api.CanvasRenderingContext2D.removeHitRegion
- api.CanvasRenderingContext2D.webkitGetImageDataHD
- api.CanvasRenderingContext2D.webkitPutImageDataHD
- api.CloseEvent.initCloseEvent
- api.Crypto.webkitSubtle
- api.CSS2Properties
- api.CSSMozDocumentRule
- api.CSSNestingRule
- api.CSSStyleDeclaration.getPropertyShorthand
- api.CSSStyleDeclaration.isPropertyImplicit
- api.DataCue.data
- api.DataTransfer.getFiles
- api.DataTransfer.getFilesAndDirectories
- api.DataTransfer.mozClearDataAt
- api.DataTransfer.mozGetDataAt
- api.DataTransfer.mozItemCount
- api.DataTransfer.mozSetDataAt
- api.DataTransfer.mozTypesAt
- api.DataTransferItemList.item
- api.DeviceLightEvent.DeviceLightEvent
- api.DeviceProximityEvent.DeviceProximityEvent
- api.Directory
- api.DirectoryEntry
- api.DirectoryEntrySync.createReader
- api.DirectoryEntrySync.getDirectory
- api.DirectoryEntrySync.getFile
- api.DirectoryEntrySync.removeRecursively
- api.DirectoryReader
- api.Document.createEntityReference
- api.Document.createTransition
- api.Document.documentURIObject
- api.Document.domConfig
- api.Document.execCommandShowHelp
- api.Document.fileSize
- api.Document.getBoxObjectFor
- api.Document.getItems
- api.Document.hasTrustToken
- api.Document.height
- api.Document.loadOverlay
- api.Document.mozMatchesSelector
- api.Document.mozSyntheticDocument
- api.Document.msElementsFromPoint
- api.Document.msExitFullscreen
- api.Document.msFullscreenElement
- api.Document.msFullscreenEnabled
- api.Document.msMatchesSelector
- api.Document.normalizeDocument
- api.Document.mozfullscreenchange_event
- api.Document.mozfullscreenerror_event
- api.Document.msfullscreenchange_event
- api.Document.msfullscreenerror_event
- api.Document.rejectionhandled_event
- api.Document.show_event
- api.Document.unhandledrejection_event
- api.Document.webkitfullscreenchange_event
- api.Document.webkitfullscreenerror_event
- api.Document.webkitpointerlockchange_event
- api.Document.webkitpointerlockerror_event
- api.Document.origin
- api.Document.popupNode
- api.Document.queryCommandText
- api.Document.renameNode
- api.Document.routeEvent
- api.Document.strictErrorChecking
- api.Document.tooltipNode
- api.Document.undoManager
- api.Document.webkitExitPointerLock
- api.Document.webkitPointerLockElement
- api.Document.width
- api.DocumentType.entities
- api.DocumentType.internalSubset
- api.DocumentType.notations
- api.DOMConfiguration
- api.DOMError.location
- api.DOMError.relatedData
- api.DOMError.relatedException
- api.DOMError.severity
- api.DOMException.data
- api.DOMException.filename
- api.DOMException.result
- api.DOMImplementation.getFeature
- api.DOMImplementationList
- api.DOMImplementationSource
- api.DOMLocator
- api.DOMMatrixReadOnly.scaleNonUniformSelf
- api.DOMSettableTokenList
- api.Element.accessibleNode
- api.Element.computedName
- api.Element.computedRole
- api.Element.createShadowRoot
- api.Element.currentStyle
- api.Element.getDestinationInsertionPoints
- api.Element.msGetPointerCapture
- api.Element.msMatchesSelector
- api.Element.msReleasePointerCapture
- api.Element.msRequestFullscreen
- api.Element.msSetPointerCapture
- api.Element.mozfullscreenchange_event
- api.Element.mozfullscreenerror_event
- api.Element.msfullscreenchange_event
- api.Element.msfullscreenerror_event
- api.Element.selectstart_event
- api.Element.webkitanimationend_event
- api.Element.webkitanimationiteration_event
- api.Element.webkitanimationstart_event
- api.Element.webkitfullscreenchange_event
- api.Element.webkitfullscreenerror_event
- api.Element.webkittransitionend_event
- api.Element.openOrClosedShadowRoot
- api.Element.runtimeStyle
- api.Element.schemaTypeInfo
- api.Element.setIdAttribute
- api.Element.setIdAttributeNode
- api.Element.setIdAttributeNS
- api.Element.tabStop
- api.Element.undoManager
- api.Element.undoScope
- api.Element.webkitCreateShadowRoot
- api.Element.webkitRequestPointerLock
- api.EnterPictureInPictureEvent
- api.Entity
- api.EntityReference
- api.Entry
- api.Event.getPreventDefault
- api.Event.preventBubble
- api.Event.preventCapture
- api.FetchEvent.client
- api.FetchEvent.navigationPreload
- api.FetchEvent.targetClientId
- api.FileEntry
- api.FileError
- api.FileException
- api.FileSaver
- api.FileSaverSync
- api.FileWriter
- api.FileWriterSync
- api.GamepadAxisEvent
- api.GamepadButtonEvent
- api.GestureEvent.GestureEvent
- api.Headers.getAll
- api.HTMLAnchorElement.media
- api.HTMLAppletElement
- api.HTMLAreaElement.hreflang
- api.HTMLAreaElement.media
- api.HTMLAreaElement.type
- api.HTMLAudioElement.mozCurrentSampleOffset
- api.HTMLAudioElement.mozSetup
- api.HTMLAudioElement.mozWriteAudio
- api.HTMLBaseFontElement
- api.HTMLButtonElement.menu
- api.HTMLCanvasElement.mozFetchAsStream
- api.HTMLCanvasElement.mozGetAsFile
- api.HTMLCanvasElement.mozPrintCallback
- api.HTMLCanvasElement.msToBlob
- api.HTMLElement.dropzone
- api.HTMLElement.forceSpellCheck
- api.HTMLElement.itemId
- api.HTMLElement.itemProp
- api.HTMLElement.itemRef
- api.HTMLElement.itemScope
- api.HTMLElement.itemType
- api.HTMLElement.itemValue
- api.HTMLElement.noModule
- api.HTMLElement.Module_event
- api.HTMLElement.mozfullscreenchange_event
- api.HTMLElement.mozfullscreenerror_event
- api.HTMLElement.msfullscreenchange_event
- api.HTMLElement.msfullscreenerror_event
- api.HTMLElement.rejectionhandled_event
- api.HTMLElement.show_event
- api.HTMLElement.unhandledrejection_event
- api.HTMLElement.webkitfullscreenchange_event
- api.HTMLElement.webkitfullscreenerror_event
- api.HTMLElement.properties
- api.HTMLFormElement.requestAutocomplete
- api.HTMLFrameSetElement.language_event
- api.HTMLIFrameElement.fetchpriority
- api.HTMLIFrameElement.setNfcFocus
- api.HTMLImageElement.fetchpriority
- api.HTMLInputElement.allowdirs
- api.HTMLInputElement.chooseDirectory
- api.HTMLInputElement.getFiles
- api.HTMLInputElement.getFilesAndDirectories
- api.HTMLInputElement.isFilesAndDirectoriesSupported
- api.HTMLInputElement.mozGetFileNameArray
- api.HTMLInputElement.mozSetFileArray
- api.HTMLInputElement.mozSetFileNameArray
- api.HTMLInputElement.weight
- api.HTMLIsIndexElement
- api.HTMLKeygenElement
- api.HTMLLinkElement.fetchpriority
- api.HTMLMediaElement.initialTime
- api.HTMLMediaElement.mozChannels
- api.HTMLMediaElement.mozFrameBufferLength
- api.HTMLMediaElement.mozLoadFrom
- api.HTMLMediaElement.mozSampleRate
- api.HTMLMediaElement.mozinterruptbegin_event
- api.HTMLMediaElement.mozinterruptend_event
- api.HTMLMediaElement.webkitKeys
- api.HTMLMediaElement.webkitSetMediaKeys
- api.HTMLMenuItemElement.command
- api.HTMLMenuItemElement.defaultChecked
- api.HTMLObjectElement.typeMustMatch
- api.HTMLPropertiesCollection
- api.HTMLScriptElement.fetchpriority
- api.HTMLSourceElement.keySystem
- api.HTMLStyleElement.scoped
- api.HTMLTableElement.sortable
- api.HTMLTableElement.stopSorting
- api.HTMLVideoElement.msIsStereo3D
- api.IDBDatabase.createMutableFile
- api.IDBDatabaseException
- api.IDBEnvironment
- api.IDBVersionChangeEvent.version
- api.IDBVersionChangeRequest
- api.KeyboardEvent.initKeyEvent
- api.KeyEvent
- api.LocalMediaStream
- api.Location.password
- api.Location.username
- api.MathMLElement.mozfullscreenchange_event
- api.MathMLElement.mozfullscreenerror_event
- api.MathMLElement.msfullscreenchange_event
- api.MathMLElement.msfullscreenerror_event
- api.MathMLElement.rejectionhandled_event
- api.MathMLElement.show_event
- api.MathMLElement.unhandledrejection_event
- api.MathMLElement.webkitfullscreenchange_event
- api.MathMLElement.webkitfullscreenerror_event
- api.MediaController.canplay_event
- api.MediaController.canplaythrough_event
- api.MediaController.durationchange_event
- api.MediaController.emptied_event
- api.MediaController.ended_event
- api.MediaController.loadeddata_event
- api.MediaController.loadedmetadata_event
- api.MediaController.pause_event
- api.MediaController.play_event
- api.MediaController.playing_event
- api.MediaController.ratechange_event
- api.MediaController.timeupdate_event
- api.MediaController.volumechange_event
- api.MediaController.waiting_event
- api.MediaController.readyState
- api.MediaRecorder.ignoreMutedMedia
- api.MediaSource.sourceclosed_event
- api.MediaStream.ended
- api.MediaStream.label
- api.MediaStream.stop
- api.MediaStreamTrack.getSources
- api.MediaStreamTrack.readonly
- api.MediaStreamTrack.remote
- api.MemoryInfo
- api.MLContext.computeAsync
- api.MLGraphBuilder.buildAsync
- api.MouseEvent.initNSMouseEvent
- api.MouseEvent.mozPressure
- api.MouseWheelEvent
- api.mozRTCIceCandidate
- api.mozRTCPeerConnection
- api.mozRTCSessionDescription
- api.MSCSSMatrix
- api.MSCurrentStyleCSSProperties
- api.MSGestureEvent
- api.MSStyleCSSProperties
- api.NameList
- api.Navigator.battery
- api.Navigator.getDisplayMedia
- api.Navigator.mozBattery
- api.Navigator.mozIsLocallyAvailable
- api.Navigator.persistentStorage
- api.Navigator.registerContentHandler
- api.Navigator.temporaryStorage
- api.Navigator.webkitBattery
- api.Navigator.webkitPersistentStorage
- api.Navigator.webkitTemporaryStorage
- api.NDEFReader.read_event
- api.Node.baseURIObject
- api.Node.getFeature
- api.Node.getUserData
- api.Node.hasAttributes
- api.Node.isSupported
- api.Node.localName
- api.Node.namespaceURI
- api.Node.nodePrincipal
- api.Node.prefix
- api.Node.rootNode
- api.Node.setUserData
- api.NodeIterator.expandEntityReferences
- api.Notation
- api.Notification.get
- api.Notification.display_event
- api.Notification.show
- api.OscillatorNode.noteOff
- api.OscillatorNode.noteOn
- api.PaymentAddress.languageCode
- api.PaymentAddress.regionCode
- api.PaymentRequest.paymentAddress
- api.PaymentRequest.requestId
- api.PaymentRequestEvent.requestBillingAddress
- api.Point
- api.PresentationRequest.startWithDevice
- api.ProgressEvent.initProgressEvent
- api.PropertyNodeList
- api.PushRegistration
- api.PushRegistrationManager
- api.Request.context
- api.RTCCertificate.getSupportedAlgorithms
- api.RTCDataChannel.stream
- api.RTCIdentityErrorEvent
- api.RTCIdentityEvent
- api.RTCPeerConnection.defaultIceServers
- api.RTCPeerConnection.getDefaultIceServers
- api.RTCPeerConnection.getStreamById
- api.RTCPeerConnection.identityresult_event
- api.RTCPeerConnection.idpassertionerror_event
- api.RTCPeerConnection.idpvalidationerror_event
- api.RTCPeerConnection.peeridentity_event
- api.Screen.mozLockOrientation
- api.Screen.mozOrientation
- api.Screen.mozUnlockOrientation
- api.Screen.msLockOrientation
- api.Screen.msOrientation
- api.Screen.msUnlockOrientation
- api.Screen.mozorientationchange_event
- api.Screen.msorientationchange_event
- api.Selection.caretBidiLevel
- api.ServiceWorkerMessageEvent
- api.ShadowRoot.caretPositionFromPoint
- api.SharedWorkerGlobalScope.applicationCache
- api.SourceBuffer.appendStream
- api.SourceBuffer.trackDefaults
- api.SpeechGrammarList.addFromUri
- api.SpeechRecognition.serviceURI
- api.StaticRange.toRange
- api.SVGColorProfileElement
- api.SVGElement.offsetHeight
- api.SVGElement.offsetLeft
- api.SVGElement.offsetParent
- api.SVGElement.offsetTop
- api.SVGElement.offsetWidth
- api.SVGElement.mozfullscreenchange_event
- api.SVGElement.mozfullscreenerror_event
- api.SVGElement.msfullscreenchange_event
- api.SVGElement.msfullscreenerror_event
- api.SVGElement.rejectionhandled_event
- api.SVGElement.show_event
- api.SVGElement.unhandledrejection_event
- api.SVGElement.webkitfullscreenchange_event
- api.SVGElement.webkitfullscreenerror_event
- api.SVGExternalResourcesRequired
- api.SVGMeshElement
- api.SVGSolidcolorElement
- api.SVGStylable
- api.SVGSVGElement.contentScriptType
- api.SVGSVGElement.contentStyleType
- api.SVGSVGElement.currentView
- api.SVGSVGElement.pixelUnitToMillimeterX
- api.SVGSVGElement.pixelUnitToMillimeterY
- api.SVGSVGElement.screenPixelToMillimeterX
- api.SVGSVGElement.screenPixelToMillimeterY
- api.SVGSVGElement.useCurrentView
- api.SVGSVGElement.viewport
- api.SVGSVGElement.zoomAndPan
- api.SVGTests
- api.SVGTransformable
- api.SVGUnknownElement
- api.SVGURIReference
- api.SVGViewElement.viewTarget
- api.SVGViewElement.zoomAndPan
- api.SVGViewSpec
- api.SVGZoomAndPan
- api.Text.getDestinationInsertionPoints
- api.Text.isElementContentWhitespace
- api.Text.replaceWholeText
- api.Touch.webkitForce
- api.Touch.webkitRadiusX
- api.Touch.webkitRadiusY
- api.Touch.webkitRotationAngle
- api.TouchList.identifiedTouch
- api.TrackDefault
- api.TrackDefaultList
- api.Transferable
- api.TransitionEvent.animationName
- api.TransitionEvent.initTransitionEvent
- api.TreeWalker.expandEntityReferences
- api.TypeInfo
- api.UIEvent.isChar
- api.UIEvent.rangeOffset
- api.UIEvent.rangeParent
- api.UndoItem
- api.UndoManager
- api.URLUtilsReadOnly
- api.UserDataHandler
- api.UserProximityEvent.UserProximityEvent
- api.VRDisplay.hardwareUnitId
- api.VRDisplayCapabilities.hasOrientation
- api.VRDisplayCapabilities.hasPosition
- api.VREyeParameters.recommendedFieldOfView
- api.VREyeParameters.renderRect
- api.VRFieldOfView.VRFieldOfView
- api.VRPose.timestamp
- api.VRStageParameters.sizeZ
- api.VTTCue.regionId
- api.VTTRegionList
- api.WEBGL_compressed_texture_atc
- api.WebGL2ComputeRenderingContext
- api.WebGL2ComputeRenderingContextBase
- api.WebKitAnimationEvent
- api.webkitAudioContext
- api.webkitAudioPannerNode
- api.WebKitMediaKeyError
- api.WebKitMediaKeyMessageEvent
- api.WebKitMediaKeyNeededEvent
- api.WebKitMediaKeys
- api.WebKitMediaKeySession
- api.webkitOfflineAudioContext
- api.webkitRTCPeerConnection
- api.WebKitTransitionEvent
- api.WheelEvent.initWheelEvent
- api.Window.convertPointFromNodeToPage
- api.Window.convertPointFromPageToNode
- api.Window.dialogArguments
- api.Window.getAttention
- api.Window.getAttentionWithCycleCount
- api.Window.globalStorage
- api.Window.home
- api.Window.maximize
- api.Window.minimize
- api.Window.mozAnimationStartTime
- api.Window.mozPaintCount
- api.Window.mozfullscreenchange_event
- api.Window.mozfullscreenerror_event
- api.Window.msfullscreenchange_event
- api.Window.msfullscreenerror_event
- api.Window.paint_event
- api.Window.show_event
- api.Window.webkitfullscreenchange_event
- api.Window.webkitfullscreenerror_event
- api.Window.openDialog
- api.Window.pkcs11
- api.Window.returnValue
- api.Window.routeEvent
- api.Window.setCursor
- api.Window.sidebar
- api.Window.webkitConvertPointFromNodeToPage
- api.Window.webkitConvertPointFromPageToNode
- api.Window.webkitRequestFileSystem
- api.Window.webkitResolveLocalFileSystemURL
- api.WorkerGlobalScope.close_event
- api.WorkerGlobalScope.requestFileSystem
- api.WorkerGlobalScope.requestFileSystemSync
- api.WorkerGlobalScope.resolveLocalFileSystemSyncURL
- api.WorkerGlobalScope.resolveLocalFileSystemURL
- api.WorkerGlobalScope.webkitRequestFileSystem
- api.WorkerGlobalScope.webkitRequestFileSystemSync
- api.WorkerGlobalScope.webkitResolveLocalFileSystemSyncURL
- api.WorkerGlobalScope.webkitResolveLocalFileSystemURL
- api.XDomain
- api.XDomainRequest
- api.XMLDocument.async
- api.XMLDocument.load
- api.XMLSerializer.serializeToStream
- css.properties.page-transition-tag

#### Changed

- api.FileSystem
- api.FileSystemDirectoryEntry
- api.FileSystemDirectoryReader
- api.FileSystemEntry
- api.FileSystemFileEntry
- api.Geolocation
- api.GeolocationCoordinates
- api.GeolocationPosition
- api.HTMLAnchorElement.toString
- api.HTMLAreaElement.toString
- api.MediaStream
- api.MediaStreamAudioSourceNode
- api.MediaStreamEvent
- api.MediaStreamTrack
- api.MediaStreamTrackAudioSourceNode
- api.MediaStreamTrackEvent
- api.MutationRecord

### Commits

- Remove custom IDL for obsolete/unsupported features
- Add splash of purple to elements
- Remove useless GAE deploy script
- Add custom test for MutationRecord API
- Add custom tests for additional MediaStream instances
- Migrate all scripts to TypeScript
- Show insecure context warning when not using HTTPS
- Fallback to legacy getUserMedia for MediaStream instance
- Add custom tests for file system APIs
- Add custom tests for Geolocation APIs
- Connect test action to Codecov
- Improve GitHub export error catching
- Replace appspot.com-&gt;gooborg.com following new deployments
- Fix copyright at bottom
- Replace start-dev with dev to match Yari
- Rebrand to Gooborg Studios
- Add tests for JS feature Change Array by copy ([#2494](https://github.com/foolip/mdn-bcd-collector/pull/2494))
- Improve release filter argument in update-bcd script ([#2475](https://github.com/foolip/mdn-bcd-collector/pull/2475))
- Remove IDL for proprietary features not in BCD or removed from BCD ([#2474](https://github.com/foolip/mdn-bcd-collector/pull/2474))
- Remove IDL for DOM features removed from BCD ([#2468](https://github.com/foolip/mdn-bcd-collector/pull/2468))
- Remove IDL for BlobBuilder ([#2469](https://github.com/foolip/mdn-bcd-collector/pull/2469))
- Remove IDL for HTML features removed from BCD ([#2470](https://github.com/foolip/mdn-bcd-collector/pull/2470))
- Remove IDL for CanvasCaptureMediaStream API ([#2471](https://github.com/foolip/mdn-bcd-collector/pull/2471))
- Remove IDL for LocalMediaStream API ([#2472](https://github.com/foolip/mdn-bcd-collector/pull/2472))
- Remove custom IDL for Notification API ([#2473](https://github.com/foolip/mdn-bcd-collector/pull/2473))
- Remove IDL for CSS features removed from BCD ([#2465](https://github.com/foolip/mdn-bcd-collector/pull/2465))
- Remove custom IDL for proprietary DataCue.data ([#2466](https://github.com/foolip/mdn-bcd-collector/pull/2466))
- Remove IDL for directory upload spec ([#2467](https://github.com/foolip/mdn-bcd-collector/pull/2467))
- Remove IDL for proprietary IDBDatabase.createMutableFile ([#2461](https://github.com/foolip/mdn-bcd-collector/pull/2461))
- Remove IDL for SVG features removed from BCD ([#2462](https://github.com/foolip/mdn-bcd-collector/pull/2462))
- Remove IDL for DOMException extensions ([#2463](https://github.com/foolip/mdn-bcd-collector/pull/2463))
- Remove IDL for budget APIs ([#2464](https://github.com/foolip/mdn-bcd-collector/pull/2464))

## v6.2.7

### Test Changes

#### Added

- api.AudioContext.sinkchange_event
- api.AudioContext.setSinkId
- api.AudioContext.sinkId
- api.AudioSinkInfo
- api.CaptureController.setFocusBehavior

## v6.2.6

### Test Changes

#### Added

- api.AuthenticatorAssertionResponse.attestationObject
- api.PressureRecord
- api.ViewTransition

#### Removed

- api.DOMTransition

#### Changed

- api.SpeechSynthesisErrorEvent
- api.SpeechSynthesisEvent

### Commits

- Fix speech synthesis event custom tests ([#2421](https://github.com/foolip/mdn-bcd-collector/pull/2421))

## v6.2.5

### Test Changes

#### Added

- api.CaptureController
- api.FileSystemFileHandle.createSyncAccessHandle
- api.FileSystemSyncAccessHandle
- api.GPUSupportedLimits.maxColorAttachmentBytesPerSample

#### Removed

- api.GPUSupportedLimits.maxColorAttachmentBytesPerPixel

### Commits

- Add RTCInsertableStreams as custom IDL

## v6.2.4

### Test Changes

#### Changed

- api.AudioProcessingEvent

### Commits

- update-bcd: discard irrelevant notes ([#2378](https://github.com/foolip/mdn-bcd-collector/pull/2378))
- Correct custom test for AudioProcessingEvent ([#2400](https://github.com/foolip/mdn-bcd-collector/pull/2400))

## v6.2.3

### Test Changes

#### Added

- api.IdentityProvider
- api.Request.duplex
- api.RTCIceCandidate.relayProtocol
- css.properties.anchor-name
- css.properties.position-fallback

#### Removed

- api.AudioContext.createConstantSource
- api.AudioContext.createDelayNode
- api.AudioContext.createGainNode
- api.AudioContext.createJavaScriptNode
- api.CSSViewportRule

### Commits

- Log warnings for when we do nothing in update-bcd ([#2365](https://github.com/foolip/mdn-bcd-collector/pull/2365))
- Remove some Web Audio API custom IDL ([#2370](https://github.com/foolip/mdn-bcd-collector/pull/2370))
- Enable default (more verbose) mocha logger ([#2371](https://github.com/foolip/mdn-bcd-collector/pull/2371))

## v6.2.2

### Test Changes

#### Added

- api.XRCompositionLayer.forceMonoPresentation

#### Changed

- api.CSSStyleDeclaration.@@iterator
- api.DOMTokenList.@@iterator
- api.FontFaceSet.@@iterator
- api.NodeList.@@iterator

### Commits

- Fix custom tests for symbols ([#2367](https://github.com/foolip/mdn-bcd-collector/pull/2367))

## v6.2.1

### Test Changes

#### Added

- api.AnimationTimeline.getCurrentTime
- api.AudioWorklet.port
- api.AudioWorkletGlobalScope.port
- api.XRAnchor.requestPersistentHandle
- api.XRProjectionLayer.deltaPose
- api.XRSession.deletePersistentAnchor
- api.XRSession.restorePersistentAnchor
- api.XRWebGLSubImage.colorTextureHeight
- api.XRWebGLSubImage.colorTextureWidth
- api.XRWebGLSubImage.depthStencilTextureHeight
- api.XRWebGLSubImage.depthStencilTextureWidth
- api.XRWebGLSubImage.motionVectorTexture
- api.XRWebGLSubImage.motionVectorTextureHeight
- api.XRWebGLSubImage.motionVectorTextureWidth
- css.properties.animation-delay-end
- css.properties.animation-delay-start
- css.properties.animation-range

#### Removed

- api.XRWebGLSubImage.textureHeight
- api.XRWebGLSubImage.textureWidth

### Commits

- Formalize version range handling ([#2353](https://github.com/foolip/mdn-bcd-collector/pull/2353))
- Correct support for mirroring ([#2280](https://github.com/foolip/mdn-bcd-collector/pull/2280))

## v6.2.0

### Test Changes

#### Added

- api.FileSystemDirectoryHandle.@@asyncIterator
- api.ReadableStream.@@asyncIterator

#### Removed

- api.FileSystemDirectoryHandle.@@iterator
- api.FileSystemDirectoryHandle.forEach
- api.ReadableStream.@@iterator
- api.ReadableStream.entries
- api.ReadableStream.forEach
- api.ReadableStream.keys

### Commits

- Support async iterators in test generation ([#2349](https://github.com/foolip/mdn-bcd-collector/pull/2349))
- Complete test coverage for `update-bcd` script ([#2317](https://github.com/foolip/mdn-bcd-collector/pull/2317))

## v6.1.5

### Test Changes

#### Added

- api.CSSContainerRule.containerName
- api.CSSContainerRule.containerQuery
- api.Document.createTransition
- api.DOMTransition
- css.properties.page-transition-tag

#### Changed

- api.CanvasGradient
- api.CanvasPattern
- api.HTMLAllCollection
- api.TextMetrics

### Commits

- Add back MessageEvent.userActivation custom IDL ([#2344](https://github.com/foolip/mdn-bcd-collector/pull/2344))
- Remove custom IDL for UserActivation
- Support testing document.all ([#2340](https://github.com/foolip/mdn-bcd-collector/pull/2340))
- Add custom test for CanvasGradient ([#2334](https://github.com/foolip/mdn-bcd-collector/pull/2334))
- bcd-update: do not spuriously report modifications ([#2326](https://github.com/foolip/mdn-bcd-collector/pull/2326))
- Remove flag data for default-enabled features ([#2297](https://github.com/foolip/mdn-bcd-collector/pull/2297))
- Support adding css.properties._ and javascript.builtins._ in add-new-bcd ([#2284](https://github.com/foolip/mdn-bcd-collector/pull/2284))

## v6.1.4

### Test Changes

#### Added

- api.GPUInternalError
- api.HTMLModelElement
- api.PerformanceResourceTiming.renderBlockingStatus
- api.WebTransport.congestionControl
- api.XRCamera
- api.XRView.camera
- api.XRWebGLBinding.getCameraImage

#### Removed

- api.HTMLAnchorElement.HTMLAnchorElement
- api.HTMLAreaElement.HTMLAreaElement
- api.HTMLAudioElement.HTMLAudioElement
- api.HTMLBaseElement.HTMLBaseElement
- api.HTMLBodyElement.HTMLBodyElement
- api.HTMLBRElement.HTMLBRElement
- api.HTMLButtonElement.HTMLButtonElement
- api.HTMLCanvasElement.HTMLCanvasElement
- api.HTMLDataElement.HTMLDataElement
- api.HTMLDataListElement.HTMLDataListElement
- api.HTMLDetailsElement.HTMLDetailsElement
- api.HTMLDialogElement.HTMLDialogElement
- api.HTMLDirectoryElement.HTMLDirectoryElement
- api.HTMLDivElement.HTMLDivElement
- api.HTMLDListElement.HTMLDListElement
- api.HTMLElement.HTMLElement
- api.HTMLEmbedElement.HTMLEmbedElement
- api.HTMLFieldSetElement.HTMLFieldSetElement
- api.HTMLFontElement.HTMLFontElement
- api.HTMLFormElement.HTMLFormElement
- api.HTMLFrameElement.HTMLFrameElement
- api.HTMLFrameSetElement.HTMLFrameSetElement
- api.HTMLHeadElement.HTMLHeadElement
- api.HTMLHeadingElement.HTMLHeadingElement
- api.HTMLHRElement.HTMLHRElement
- api.HTMLHtmlElement.HTMLHtmlElement
- api.HTMLIFrameElement.HTMLIFrameElement
- api.HTMLImageElement.HTMLImageElement
- api.HTMLInputElement.HTMLInputElement
- api.HTMLLabelElement.HTMLLabelElement
- api.HTMLLegendElement.HTMLLegendElement
- api.HTMLLIElement.HTMLLIElement
- api.HTMLLinkElement.HTMLLinkElement
- api.HTMLMapElement.HTMLMapElement
- api.HTMLMarqueeElement.HTMLMarqueeElement
- api.HTMLMenuElement.HTMLMenuElement
- api.HTMLMetaElement.HTMLMetaElement
- api.HTMLMeterElement.HTMLMeterElement
- api.HTMLModElement.HTMLModElement
- api.HTMLObjectElement.HTMLObjectElement
- api.HTMLOListElement.HTMLOListElement
- api.HTMLOptGroupElement.HTMLOptGroupElement
- api.HTMLOptionElement.HTMLOptionElement
- api.HTMLOutputElement.HTMLOutputElement
- api.HTMLParagraphElement.HTMLParagraphElement
- api.HTMLParamElement.HTMLParamElement
- api.HTMLPictureElement.HTMLPictureElement
- api.HTMLPortalElement.HTMLPortalElement
- api.HTMLPreElement.HTMLPreElement
- api.HTMLProgressElement.HTMLProgressElement
- api.HTMLQuoteElement.HTMLQuoteElement
- api.HTMLScriptElement.HTMLScriptElement
- api.HTMLSelectElement.HTMLSelectElement
- api.HTMLSlotElement.HTMLSlotElement
- api.HTMLSourceElement.HTMLSourceElement
- api.HTMLSpanElement.HTMLSpanElement
- api.HTMLStyleElement.HTMLStyleElement
- api.HTMLTableCaptionElement.HTMLTableCaptionElement
- api.HTMLTableCellElement.HTMLTableCellElement
- api.HTMLTableColElement.HTMLTableColElement
- api.HTMLTableElement.HTMLTableElement
- api.HTMLTableRowElement.HTMLTableRowElement
- api.HTMLTableSectionElement.HTMLTableSectionElement
- api.HTMLTemplateElement.HTMLTemplateElement
- api.HTMLTextAreaElement.HTMLTextAreaElement
- api.HTMLTimeElement.HTMLTimeElement
- api.HTMLTitleElement.HTMLTitleElement
- api.HTMLTrackElement.HTMLTrackElement
- api.HTMLUListElement.HTMLUListElement
- api.HTMLVideoElement.HTMLVideoElement

#### Changed

- api.Worklet

### Commits

- Avoid generating tests for [HTMLConstructor] constructors ([#2328](https://github.com/foolip/mdn-bcd-collector/pull/2328))
- Add custom test for Worklet API ([#2320](https://github.com/foolip/mdn-bcd-collector/pull/2320))
- Ignore IE by default in find-missing-results script ([#2308](https://github.com/foolip/mdn-bcd-collector/pull/2308))
- Set experimental to "true" for new features by default ([#2305](https://github.com/foolip/mdn-bcd-collector/pull/2305))
- Simplify loop ([#2300](https://github.com/foolip/mdn-bcd-collector/pull/2300))
- Mention what the actual constructor name is if it doesn't match expected ([#2301](https://github.com/foolip/mdn-bcd-collector/pull/2301))

## v6.1.3

### Test Changes

#### Added

- api.GPUSupportedLimits.maxBindingsPerBindGroup
- api.GPUSupportedLimits.maxBufferSize
- api.GPUSupportedLimits.maxColorAttachmentBytesPerPixel
- api.XRSession.enabledFeatures
- css.properties.math-depth
- css.properties.math-shift
- css.properties.text-decoration-trim

#### Removed

- api.Element.attributeStyleMap
- api.Element.name
- api.HTMLButtonElement.autofocus
- api.HTMLInputElement.autofocus
- api.HTMLSelectElement.autofocus
- api.HTMLTextAreaElement.autofocus
- api.SVGGraphicsElement.autofocus
- css.properties.text-decoration-skip-inset

#### Changed

- api.ServiceWorkerContainer
- api.SVGAnimatedRect

### Commits

- Add custom IDL for CanvasFilter ([#2294](https://github.com/foolip/mdn-bcd-collector/pull/2294))
- Add instance (navigator.serviceWorker) for ServiceWorkerContainer ([#2283](https://github.com/foolip/mdn-bcd-collector/pull/2283))
- Adapt custom navigator.getDisplayMedia() IDL
- Remove custom math-style CSS property
- Add overrides for api.FontFaceSetLoadEvent ([#2239](https://github.com/foolip/mdn-bcd-collector/pull/2239))
- Correct reference to project license ([#2277](https://github.com/foolip/mdn-bcd-collector/pull/2277))
- Fix custom test for SVGAnimatedRect ([#2281](https://github.com/foolip/mdn-bcd-collector/pull/2281))
- Correct required version of Node.js ([#2276](https://github.com/foolip/mdn-bcd-collector/pull/2276))
- Reformat examples in design document ([#2266](https://github.com/foolip/mdn-bcd-collector/pull/2266))
- Extend script to update BCD w/results from Oculus ([#2260](https://github.com/foolip/mdn-bcd-collector/pull/2260))
- Fix updating BCD regarding mirrored statements ([#2265](https://github.com/foolip/mdn-bcd-collector/pull/2265))
- Disable the unsecure warning for now ([#2264](https://github.com/foolip/mdn-bcd-collector/pull/2264))
- Improve callback detection ([#2253](https://github.com/foolip/mdn-bcd-collector/pull/2253))
- Allow for version ranges for overrides ([#2252](https://github.com/foolip/mdn-bcd-collector/pull/2252))
- Remove custom IDL related to resolved BCD issues ([#2255](https://github.com/foolip/mdn-bcd-collector/pull/2255))

## v6.1.2

### Test Changes

#### Added

- api.ContentVisibilityAutoStateChangedEvent
- api.GPUBuffer.mapState
- api.Response.clone
- css.properties.scroll-timeline
- css.properties.scroll-timeline-axis
- css.properties.scroll-timeline-name
- css.properties.view-timeline
- css.properties.view-timeline-axis
- css.properties.view-timeline-inset
- css.properties.view-timeline-name

#### Removed

- api.ImageTrack.change_event

#### Changed

- api.EventSource.EventSource
- api.Response.json

### Commits

- Don't add new BCD for features that have already been removed ([#2251](https://github.com/foolip/mdn-bcd-collector/pull/2251))
- Stop creating release PRs automatically ([#2246](https://github.com/foolip/mdn-bcd-collector/pull/2246))
- Update template compat statement for add-new-bcd ([#2248](https://github.com/foolip/mdn-bcd-collector/pull/2248))
- Add color-scheme property ([#2247](https://github.com/foolip/mdn-bcd-collector/pull/2247))
- Include message in result stats output ([#2237](https://github.com/foolip/mdn-bcd-collector/pull/2237))
- Fix EventSource constructor test ([#2238](https://github.com/foolip/mdn-bcd-collector/pull/2238))
- Fix insecure context warning ([#2230](https://github.com/foolip/mdn-bcd-collector/pull/2230))
- Hook Prettier into ESLint; use Prettier's styling rules ([#2219](https://github.com/foolip/mdn-bcd-collector/pull/2219))
- Fix removal of static members when non-static member is present ([#2218](https://github.com/foolip/mdn-bcd-collector/pull/2218))

## v6.1.1

### Test Changes

#### Added

- api.AudioDecoder.dequeue_event
- api.AudioEncoder.dequeue_event
- api.MediaSource.handle
- api.ScrollTimeline.axis
- api.VideoDecoder.dequeue_event
- api.VideoEncoder.dequeue_event
- api.ViewTimeline

#### Removed

- api.CSSScrollTimelineRule
- api.MediaSource.getHandle
- api.ScrollTimeline.orientation
- api.ScrollTimeline.scrollOffsets

#### Changed

- api.AnalyserNode
- api.ANGLE_instanced_arrays
- api.AnimationEvent
- api.AudioBuffer
- api.AudioBufferSourceNode
- api.AudioDestinationNode
- api.AudioListener
- api.AudioNode
- api.AudioParam
- api.AudioProcessingEvent
- api.AudioScheduledSourceNode
- api.AudioTrack
- api.AudioWorkletNode
- api.BaseAudioContext.decodeAudioData.returns_promise
- api.BeforeInstallPromptEvent
- api.BeforeUnloadEvent
- api.BiquadFilterNode
- api.ByteLengthQueuingStrategy
- api.CacheStorage
- api.CanvasPattern
- api.CanvasRenderingContext2D
- api.ChannelMergerNode
- api.ChannelSplitterNode
- api.CloseEvent
- api.CompositionEvent
- api.ConstantSourceNode
- api.ConvolverNode
- api.CountQueuingStrategy
- api.Crypto
- api.CryptoKey
- api.CSSKeyframeRule
- api.CSSRule
- api.CSSRuleList
- api.CSSStyleRule
- api.CustomEvent
- api.DelayNode
- api.DeviceMotionEvent
- api.DeviceOrientationEvent
- api.DocumentFragment
- api.DocumentType
- api.DOMError
- api.DOMRectList
- api.DOMTokenList.trim_whitespace
- api.DOMTokenList.remove_duplicates
- api.DOMTokenList.toggle.force_parameter
- api.DragEvent
- api.DynamicsCompressorNode
- api.ErrorEvent
- api.Event
- api.EventSource
- api.EXT_blend_minmax
- api.EXT_clip_cull_distance
- api.EXT_color_buffer_float
- api.EXT_color_buffer_half_float
- api.EXT_disjoint_timer_query
- api.EXT_disjoint_timer_query_webgl2
- api.EXT_float_blend
- api.EXT_frag_depth
- api.EXT_shader_texture_lod
- api.EXT_sRGB
- api.EXT_texture_compression_bptc
- api.EXT_texture_compression_rgtc
- api.EXT_texture_filter_anisotropic
- api.EXT_texture_norm16
- api.ExtendableEvent
- api.FetchEvent
- api.FocusEvent
- api.FontFace
- api.FontFaceSetLoadEvent
- api.GainNode
- api.GamepadEvent
- api.HashChangeEvent
- api.HTMLFormControlsCollection
- api.IDBDatabase
- api.IDBOpenDBRequest
- api.IDBRequest
- api.IDBVersionChangeEvent
- api.IIRFilterNode
- api.ImageCapture
- api.ImageData
- api.InstallEvent
- api.KeyboardEvent
- api.KHR_parallel_shader_compile
- api.Location.toString
- api.MediaDeviceInfo
- api.MediaElementAudioSourceNode
- api.MediaEncryptedEvent
- api.MediaKeyMessageEvent
- api.MediaQueryListEvent
- api.MediaSource
- api.MediaStream
- api.MediaStreamAudioDestinationNode
- api.MediaStreamAudioSourceNode
- api.MediaStreamTrack
- api.MediaStreamTrackAudioSourceNode
- api.MerchantValidationEvent
- api.MessageChannel
- api.MessageEvent
- api.MessagePort
- api.MouseEvent
- api.MutationEvent
- api.MutationObserver
- api.Notification
- api.NotificationEvent
- api.OES_draw_buffers_indexed
- api.OES_element_index_uint
- api.OES_fbo_render_mipmap
- api.OES_standard_derivatives
- api.OES_texture_float
- api.OES_texture_float_linear
- api.OES_texture_half_float
- api.OES_texture_half_float_linear
- api.OES_vertex_array_object
- api.OfflineAudioCompletionEvent
- api.OscillatorNode
- api.OVR_multiview2
- api.PageTransitionEvent
- api.PannerNode
- api.Performance
- api.PerformanceEntry
- api.PerformanceMark
- api.PerformanceNavigation
- api.PerformanceTiming
- api.PeriodicWave
- api.PopStateEvent
- api.ProgressEvent
- api.PushEvent
- api.RadioNodeList
- api.RTCDataChannel
- api.RTCDataChannelEvent
- api.RTCDTMFToneChangeEvent
- api.RTCPeerConnection
- api.ScriptProcessorNode
- api.SecurityPolicyViolationEvent
- api.ShadowRoot
- api.SpeechRecognitionErrorEvent
- api.SpeechRecognitionEvent
- api.SpeechSynthesisErrorEvent
- api.SpeechSynthesisEvent
- api.SpeechSynthesisVoice
- api.StereoPannerNode
- api.StorageEvent
- api.SubtleCrypto
- api.SVGAngle
- api.SVGAnimatedAngle
- api.SVGAnimatedBoolean
- api.SVGAnimatedEnumeration
- api.SVGAnimatedInteger
- api.SVGAnimatedLength
- api.SVGAnimatedLengthList
- api.SVGAnimatedNumber
- api.SVGAnimatedNumberList
- api.SVGAnimatedPreserveAspectRatio
- api.SVGAnimatedRect
- api.SVGAnimatedString
- api.SVGAnimatedTransformList
- api.SVGLength
- api.SVGLengthList
- api.SVGNumber
- api.SVGNumberList
- api.SVGPoint
- api.SVGPointList
- api.SVGPreserveAspectRatio
- api.SVGRect
- api.SVGStringList
- api.SVGTransform
- api.SVGTransformList
- api.TextDecoder
- api.TextEncoder
- api.TextMetrics
- api.TextTrack
- api.TextTrackCue
- api.TextTrackCueList
- api.TouchEvent
- api.TrackEvent
- api.TransitionEvent
- api.UIEvent
- api.ValidityState
- api.VideoTrack
- api.VTTCue
- api.WaveShaperNode
- api.WEBGL_blend_equation_advanced_coherent
- api.WEBGL_color_buffer_float
- api.WEBGL_compressed_texture_astc
- api.WEBGL_compressed_texture_atc
- api.WEBGL_compressed_texture_etc
- api.WEBGL_compressed_texture_etc1
- api.WEBGL_compressed_texture_pvrtc
- api.WEBGL_compressed_texture_s3tc
- api.WEBGL_compressed_texture_s3tc_srgb
- api.WEBGL_debug_renderer_info
- api.WEBGL_debug_shaders
- api.WEBGL_depth_texture
- api.WEBGL_draw_buffers
- api.WEBGL_draw_instanced_base_vertex_base_instance
- api.WEBGL_lose_context
- api.WEBGL_multi_draw
- api.WEBGL_multi_draw_instanced_base_vertex_base_instance
- api.WebGLContextEvent
- api.WebGLTimerQueryEXT
- api.WebGLVertexArrayObjectOES
- api.WebKitAnimationEvent
- api.WebKitTransitionEvent
- api.WebSocket
- api.WheelEvent
- api.WorkerLocation.toString
- api.WritableStreamDefaultController
- api.WritableStreamDefaultWriter
- api.XMLHttpRequest
- api.XMLHttpRequestEventTarget
- api.XMLHttpRequestUpload
- api.XPathResult
- javascript.builtins.AggregateError.AggregateError
- javascript.builtins.Array.Array
- javascript.builtins.ArrayBuffer.ArrayBuffer
- javascript.builtins.BigInt.BigInt
- javascript.builtins.BigInt64Array.BigInt64Array
- javascript.builtins.BigUint64Array.BigUint64Array
- javascript.builtins.Boolean.Boolean
- javascript.builtins.DataView.DataView
- javascript.builtins.Date.Date
- javascript.builtins.Error.Error
- javascript.builtins.EvalError.EvalError
- javascript.builtins.FinalizationRegistry.FinalizationRegistry
- javascript.builtins.Float32Array.Float32Array
- javascript.builtins.Float64Array.Float64Array
- javascript.builtins.Function.Function
- javascript.builtins.Int16Array.Int16Array
- javascript.builtins.Int32Array.Int32Array
- javascript.builtins.Int8Array.Int8Array
- javascript.builtins.InternalError.InternalError
- javascript.builtins.Map.Map
- javascript.builtins.Number.Number
- javascript.builtins.Object.Object
- javascript.builtins.Promise.Promise
- javascript.builtins.Proxy.Proxy
- javascript.builtins.RangeError.RangeError
- javascript.builtins.ReferenceError.ReferenceError
- javascript.builtins.RegExp.RegExp
- javascript.builtins.Set.Set
- javascript.builtins.SharedArrayBuffer.SharedArrayBuffer
- javascript.builtins.String.String
- javascript.builtins.Symbol.Symbol
- javascript.builtins.SyntaxError.SyntaxError
- javascript.builtins.TypeError.TypeError
- javascript.builtins.URIError.URIError
- javascript.builtins.Uint16Array.Uint16Array
- javascript.builtins.Uint32Array.Uint32Array
- javascript.builtins.Uint8Array.Uint8Array
- javascript.builtins.Uint8ClampedArray.Uint8ClampedArray
- javascript.builtins.WeakMap.WeakMap
- javascript.builtins.WeakRef.WeakRef
- javascript.builtins.WeakSet.WeakSet
- javascript.builtins.Intl.Collator.Collator
- javascript.builtins.Intl.DateTimeFormat.DateTimeFormat
- javascript.builtins.Intl.DisplayNames.DisplayNames
- javascript.builtins.Intl.ListFormat.ListFormat
- javascript.builtins.Intl.Locale.Locale
- javascript.builtins.Intl.NumberFormat.NumberFormat
- javascript.builtins.Intl.PluralRules.PluralRules
- javascript.builtins.Intl.RelativeTimeFormat.RelativeTimeFormat
- javascript.builtins.Intl.Segmenter.Segmenter
- javascript.builtins.WebAssembly.CompileError.CompileError
- javascript.builtins.WebAssembly.Exception.Exception
- javascript.builtins.WebAssembly.Global.Global
- javascript.builtins.WebAssembly.LinkError.LinkError
- javascript.builtins.WebAssembly.Memory.Memory
- javascript.builtins.WebAssembly.RuntimeError.RuntimeError
- javascript.builtins.WebAssembly.Table.Table
- javascript.builtins.WebAssembly.Tag.Tag

### Commits

- Add overrides for streaming webassembly features in Chrome 60 ([#2205](https://github.com/foolip/mdn-bcd-collector/pull/2205))
- Improve formatting of if statements ([#2209](https://github.com/foolip/mdn-bcd-collector/pull/2209))
- Improve handling of future (not in BCD) releases ([#2208](https://github.com/foolip/mdn-bcd-collector/pull/2208))
- Track all individual minor versions of Safari 15+ ([#2202](https://github.com/foolip/mdn-bcd-collector/pull/2202))
- Add "fix" command ([#2204](https://github.com/foolip/mdn-bcd-collector/pull/2204))
- Add custom test for Location.toString() ([#2200](https://github.com/foolip/mdn-bcd-collector/pull/2200))
- Fix command for add-new-bcd ([#2199](https://github.com/foolip/mdn-bcd-collector/pull/2199))
- Add custom test for ProgressEvent instance ([#2190](https://github.com/foolip/mdn-bcd-collector/pull/2190))
- Add Firefox override for ContactAddress ([#2189](https://github.com/foolip/mdn-bcd-collector/pull/2189))
- Update custom tests ([#2178](https://github.com/foolip/mdn-bcd-collector/pull/2178))
- Clearly state support vs. true/false/null ([#2179](https://github.com/foolip/mdn-bcd-collector/pull/2179))
- Alert user if not accessing collector on a secure context ([#2177](https://github.com/foolip/mdn-bcd-collector/pull/2177))

## v6.1.0

### Test Changes

#### Added

- api.Document.prerenderingchange_event
- api.Document.prerendering
- api.Element.ariaActiveDescendantElement
- api.Element.ariaControlsElements
- api.Element.ariaDescribedByElements
- api.Element.ariaDetailsElements
- api.Element.ariaErrorMessageElement
- api.Element.ariaFlowToElements
- api.Element.ariaLabelledByElements
- api.Element.ariaOwnsElements
- api.ElementInternals.ariaActiveDescendantElement
- api.ElementInternals.ariaControlsElements
- api.ElementInternals.ariaDescribedByElements
- api.ElementInternals.ariaDetailsElements
- api.ElementInternals.ariaErrorMessageElement
- api.ElementInternals.ariaFlowToElements
- api.ElementInternals.ariaLabelledByElements
- api.ElementInternals.ariaOwnsElements
- api.NavigateEvent.scroll
- api.PerformanceNavigationTiming.activationStart
- api.XRCompositionLayer.opacity

#### Removed

- api.NavigateEvent.restoreScroll
- api.VisualViewport.segments

#### Changed

All tests have been updated so that if the parent feature returns `false`, the child feature will also return `false`.

### Commits

- Drop api.Selection.modify custom IDL
- Update custom tests ([#2158](https://github.com/foolip/mdn-bcd-collector/pull/2158))
- Remove more nulls from custom tests ([#2157](https://github.com/foolip/mdn-bcd-collector/pull/2157))
- Check if interface exists before attempting to construct ([#2156](https://github.com/foolip/mdn-bcd-collector/pull/2156))
- Print null values in stats reports via CLI arg ([#2155](https://github.com/foolip/mdn-bcd-collector/pull/2155))
- Revert "Don't test for "instance in self" for members ([#492](https://github.com/foolip/mdn-bcd-collector/pull/492))" ([#2154](https://github.com/foolip/mdn-bcd-collector/pull/2154))
- Allow for querying features in a report ([#2153](https://github.com/foolip/mdn-bcd-collector/pull/2153))
- Update privacy notice ([#2146](https://github.com/foolip/mdn-bcd-collector/pull/2146))

## v6.0.9

### Test Changes

#### Removed

- api.AnimationTimeline.phase

#### Changed

- api.CryptoKey
- api.SVGAnimatedNumber

### Commits

- Fix the custom CryptoKey tests ([#2143](https://github.com/foolip/mdn-bcd-collector/pull/2143))
- Replace all &lt; and &gt; in release script ([#2142](https://github.com/foolip/mdn-bcd-collector/pull/2142))
- Use &lt;stop&gt; instead of &lt;path&gt; for SVGAnimatedNumber custom test ([#2140](https://github.com/foolip/mdn-bcd-collector/pull/2140))
- Convert find-missing-features to TypeScript ([#2137](https://github.com/foolip/mdn-bcd-collector/pull/2137))

## v6.0.8

### Test Changes

#### Added

- api.CSPViolationReportBody.toJSON
- api.Element.checkVisibility
- api.IdentityCredential
- api.PublicKeyCredential.isConditionalMediationAvailable
- api.PublicKeyCredential.parseCreationOptionsFromJSON
- api.PublicKeyCredential.parseRequestOptionsFromJSON
- api.PublicKeyCredential.toJSON
- api.WorkerNavigator.hid

#### Removed

- api.Element.isVisible
- api.FederatedCredential.login
- api.FederatedCredential.logout
- api.FederatedCredential.logoutRPs
- api.FederatedCredential.revoke
- api.MediaRecorderErrorEvent
- css.properties.object-overflow

### Commits

- Add "results-stats" script to get data about results files ([#2102](https://github.com/foolip/mdn-bcd-collector/pull/2102))
- Various Selenium script tweaks ([#2091](https://github.com/foolip/mdn-bcd-collector/pull/2091))
- Display browser info at top of homepage ([#2090](https://github.com/foolip/mdn-bcd-collector/pull/2090))
- Sort results ([#2089](https://github.com/foolip/mdn-bcd-collector/pull/2089))

## v6.0.7

### Test Changes

#### Added

- api.CanvasRenderingContext2D.setTransform.matrix_parameter
- api.CropTarget.fromElement
- api.GPUBuffer.size
- api.GPUBuffer.usage
- api.GPUQuerySet.count
- api.GPUQuerySet.type
- api.GPUSupportedLimits.maxColorAttachments
- api.GPUTexture.depthOrArrayLayers
- api.GPUTexture.dimension
- api.GPUTexture.format
- api.GPUTexture.height
- api.GPUTexture.mipLevelCount
- api.GPUTexture.sampleCount
- api.GPUTexture.usage
- api.GPUTexture.width
- api.HTMLScriptElement.attributionSrc
- api.NavigateEvent.canIntercept
- api.NavigateEvent.intercept
- api.Window.beforeinput_event
- css.properties.break-after.auto
- css.properties.break-after.avoid
- css.properties.break-after.avoid-region
- css.properties.break-after.left
- css.properties.break-after.page
- css.properties.break-after.region
- css.properties.break-after.right
- css.properties.break-before.auto
- css.properties.break-before.avoid
- css.properties.break-before.avoid-region
- css.properties.break-before.left
- css.properties.break-before.page
- css.properties.break-before.region
- css.properties.break-before.right
- css.properties.break-inside.auto
- css.properties.break-inside.avoid
- css.properties.break-inside.avoid-column
- css.properties.break-inside.avoid-page
- css.properties.break-inside.avoid-region

#### Removed

- api.MediaDevices.produceCropTarget
- api.NavigateEvent.canTransition
- api.NavigateEvent.transitionWhile
- api.Response.clone

#### Changed

- api.CanvasRenderingContext2D.drawImage.SVGImageElement_source_image
- api.CSSNamespaceRule

### Commits

- Test all CSS break-\* property values
- Various tweaks ([#2085](https://github.com/foolip/mdn-bcd-collector/pull/2085))
- Retry failed Selenium runs ([#2084](https://github.com/foolip/mdn-bcd-collector/pull/2084))
- Convert find-missing-results to TypeScript ([#2083](https://github.com/foolip/mdn-bcd-collector/pull/2083))
- Show BCD version when browser version isn't in BCD ([#2082](https://github.com/foolip/mdn-bcd-collector/pull/2082))
- Return null (not false) for unavailable reusable instances ([#1983](https://github.com/foolip/mdn-bcd-collector/pull/1983))
- Add test for api.CanvasRenderingContext2D.setTransform.matrix_parameter ([#2081](https://github.com/foolip/mdn-bcd-collector/pull/2081))
- Add custom test for CSSNamespaceRule ([#2080](https://github.com/foolip/mdn-bcd-collector/pull/2080))
- Don't include static members with the same name as non-static members ([#2076](https://github.com/foolip/mdn-bcd-collector/pull/2076))
- Convert update-bcd + add-new-bcd to TypeScript ([#2075](https://github.com/foolip/mdn-bcd-collector/pull/2075))
- Fix production smoke test to not install dev dependencies ([#2058](https://github.com/foolip/mdn-bcd-collector/pull/2058))

## v6.0.6

### Test Changes

#### Added

- api.GPU.getPreferredCanvasFormat
- api.GPUAdapter.requestAdapterInfo
- api.GPUAdapterInfo
- api.GPUError
- api.GPUSupportedLimits.maxInterStageShaderVariables
- api.HTMLAnchorElement.attributionSrc
- api.HTMLImageElement.attributionSrc
- api.MediaSource.getHandle
- api.MediaSourceHandle
- api.MLGraphBuilder.buildAsync
- api.TouchEvent.getModifierState
- api.WebGL2RenderingContext.drawingBufferColorSpace
- api.WebGL2RenderingContext.unpackColorSpace
- api.WebGLRenderingContext.drawingBufferColorSpace
- api.WebGLRenderingContext.unpackColorSpace
- javascript.builtins.TypedArray

#### Removed

- api.AttributionReporting
- api.CaptureHandleChangeEvent
- api.GPUAdapter.name
- api.GPUCanvasContext.getPreferredFormat
- api.GPUValidationError.message
- api.HTMLAnchorElement.attributionDestination
- api.HTMLAnchorElement.attributionExpiry
- api.HTMLAnchorElement.attributionReportTo
- api.HTMLAnchorElement.attributionSourceEventId
- api.HTMLAnchorElement.attributionSourcePriority
- api.HTMLAnchorElement.registerAttributionSource
- api.Window.attributionReporting

#### Changed

- api.Response.json

### Commits

- Allow for static members of the same name as non-static members ([#2054](https://github.com/foolip/mdn-bcd-collector/pull/2054))
- update-bcd: account for mirroring ([#2039](https://github.com/foolip/mdn-bcd-collector/pull/2039))
- Add custom tests for TypedArray and TypedArray.BYTES_PER_ELEMENT ([#1999](https://github.com/foolip/mdn-bcd-collector/pull/1999))

## v6.0.5

### Test Changes

#### Added

- javascript.builtins.TypedArray.at
- javascript.builtins.TypedArray.buffer
- javascript.builtins.TypedArray.byteLength
- javascript.builtins.TypedArray.byteOffset
- javascript.builtins.TypedArray.copyWithin
- javascript.builtins.TypedArray.entries
- javascript.builtins.TypedArray.every
- javascript.builtins.TypedArray.fill
- javascript.builtins.TypedArray.filter
- javascript.builtins.TypedArray.find
- javascript.builtins.TypedArray.findIndex
- javascript.builtins.TypedArray.findLast
- javascript.builtins.TypedArray.findLastIndex
- javascript.builtins.TypedArray.forEach
- javascript.builtins.TypedArray.from
- javascript.builtins.TypedArray.includes
- javascript.builtins.TypedArray.indexOf
- javascript.builtins.TypedArray.join
- javascript.builtins.TypedArray.keys
- javascript.builtins.TypedArray.lastIndexOf
- javascript.builtins.TypedArray.length
- javascript.builtins.TypedArray.map
- javascript.builtins.TypedArray.name
- javascript.builtins.TypedArray.of
- javascript.builtins.TypedArray.reduce
- javascript.builtins.TypedArray.reduceRight
- javascript.builtins.TypedArray.reverse
- javascript.builtins.TypedArray.set
- javascript.builtins.TypedArray.slice
- javascript.builtins.TypedArray.some
- javascript.builtins.TypedArray.sort
- javascript.builtins.TypedArray.subarray
- javascript.builtins.TypedArray.toLocaleString
- javascript.builtins.TypedArray.toString
- javascript.builtins.TypedArray.values
- javascript.builtins.TypedArray.@@iterator
- javascript.builtins.TypedArray.@@species

#### Changed

- api.FontFace

### Commits

- Add custom tests for TypedArray using Int8Array ([#1997](https://github.com/foolip/mdn-bcd-collector/pull/1997))
- Add 3rd argument to FontFace constructor ([#1990](https://github.com/foolip/mdn-bcd-collector/pull/1990))
- Link to pull requests in changelog ([#1985](https://github.com/foolip/mdn-bcd-collector/pull/1985))

## v6.0.4

### Test Changes

#### Added

- api.FederatedCredential.login
- api.FederatedCredential.logout
- api.FederatedCredential.logoutRPs
- api.FederatedCredential.revoke
- api.MediaDevices.getViewportMedia
- api.MLCommandEncoder
- api.MLContext.compute
- api.MLContext.computeAsync
- api.MLContext.createCommandEncoder

#### Removed

- api.MLGraph.compute

## v6.0.3

### Test Changes

#### Added

- api.AudioContext.renderCapacity
- api.AudioRenderCapacity
- api.AudioRenderCapacityEvent
- api.WebTransportReceiveStream
- api.WebTransportSendStream

#### Removed

- api.originPolicyIds

#### Changed

- api.CSSKeyframeRule
- api.CSSKeyframesRule

### Commits

- Fix changelog ([#1978](https://github.com/foolip/mdn-bcd-collector/pull/1978))
- Only show "Changes" section when needed ([#1963](https://github.com/foolip/mdn-bcd-collector/pull/1963))
- Fix api.CSSKeyframesRule, which is currently invalid JS ([#1960](https://github.com/foolip/mdn-bcd-collector/pull/1960))
- Prefix NodeJS built-in imports with `node:` ([#1961](https://github.com/foolip/mdn-bcd-collector/pull/1961))
- Only include test change sections as needed ([#1954](https://github.com/foolip/mdn-bcd-collector/pull/1954))
- Allow stringIncludes() search to be an array ([#1953](https://github.com/foolip/mdn-bcd-collector/pull/1953))
- Update testConstructor() to catch Safari error message ([#1952](https://github.com/foolip/mdn-bcd-collector/pull/1952))

## v6.0.2

### Test Changes

#### Added

- api.Screen.isExtended
- api.Screen.change_event
- api.ScreenDetailed
- api.ScreenDetails
- api.Window.getScreenDetails
- css.properties.custom-property

### Commits

- Don't run tests on Windows ([#1949](https://github.com/foolip/mdn-bcd-collector/pull/1949))
- Replace "preview" in BCD if collector has version number ([#1948](https://github.com/foolip/mdn-bcd-collector/pull/1948))
- Update Selenium script ([#1947](https://github.com/foolip/mdn-bcd-collector/pull/1947))
- Simplify v6 changelog ([#1946](https://github.com/foolip/mdn-bcd-collector/pull/1946))
- Restore the css.properties.custom-property custom test ([#1945](https://github.com/foolip/mdn-bcd-collector/pull/1945))
- Add a scheduled+manual workflow for releases ([#1943](https://github.com/foolip/mdn-bcd-collector/pull/1943))

## v6.0.1

### Test Changes

#### Added

- api.HTMLIFrameElement.fetchPriority
- api.HTMLImageElement.fetchPriority
- api.HTMLLinkElement.fetchPriority
- api.HTMLScriptElement.fetchPriority

#### Removed

- api.CSSColorValue.colorSpace
- api.CSSColorValue.to

### Commits

- Add all-lowercase fetchpriority attributes custom IDL ([#1940](https://github.com/foolip/mdn-bcd-collector/pull/1940))

## v6.0.0

### Test Changes

#### Added

- 1000+ \*\_event entries ([#1825](https://github.com/foolip/mdn-bcd-collector/pull/1825))
- 600+ css.properties._._ entries ([#1805](https://github.com/foolip/mdn-bcd-collector/pull/1805))
- api.BeforeInstallPromptEvent.platforms
- api.BluetoothDevice.forget
- api.CaptureActionEvent
- api.CaptureHandleChangeEvent
- api.CloseWatcher.close
- api.CSS.cqb
- api.CSS.cqh
- api.CSS.cqi
- api.CSS.cqmax
- api.CSS.cqmin
- api.CSS.cqw
- api.CSS.dvb
- api.CSS.dvh
- api.CSS.dvi
- api.CSS.dvmax
- api.CSS.dvmin
- api.CSS.dvw
- api.CSS.lvb
- api.CSS.lvh
- api.CSS.lvi
- api.CSS.lvmax
- api.CSS.lvmin
- api.CSS.lvw
- api.CSS.svb
- api.CSS.svh
- api.CSS.svi
- api.CSS.svmax
- api.CSS.svmin
- api.CSS.svw
- api.CSSContainerRule
- api.DigitalGoodsService
- api.DOMTokenList.toString
- api.Element.isVisible
- api.Element.scroll.options_behavior_parameter
- api.Element.scroll.options_left_parameter
- api.Element.scroll.options_top_parameter
- api.Element.scrollBy.options_behavior_parameter
- api.Element.scrollBy.options_left_parameter
- api.Element.scrollBy.options_top_parameter
- api.Element.scrollTo.options_behavior_parameter
- api.Element.scrollTo.options_left_parameter
- api.Element.scrollTo.options_top_parameter
- api.FontData
- api.GPUComputePassEncoder.dispatchWorkgroups
- api.GPUComputePassEncoder.dispatchWorkgroupsIndirect
- api.GPUExternalTexture.expired
- api.HTMLAnchorElement.toString
- api.HTMLAreaElement.toString
- api.HTMLIFrameElement.fetchpriority
- api.HTMLImageElement.fetchpriority
- api.HTMLLinkElement.blocking
- api.HTMLLinkElement.fetchpriority
- api.HTMLScriptElement.blocking
- api.HTMLScriptElement.fetchpriority
- api.HTMLStyleElement.blocking
- api.LaunchParams
- api.LaunchQueue
- api.MediaDevices.setCaptureHandleConfig
- api.MediaDevices.setSupportedCaptureActions
- api.MediaList.toString
- api.MediaStreamTrack.getCaptureHandle
- api.MediaStreamTrack.getSupportedCaptureActions
- api.MediaStreamTrack.sendCaptureAction
- api.NavigateEvent
- api.Navigation
- api.NavigationCurrentEntryChangeEvent
- api.NavigationDestination
- api.NavigationHistoryEntry
- api.NavigationTransition
- api.PressureObserver
- api.Request.priority
- api.SerialPort.forget
- api.USBDevice.forget
- api.WebTransport.reliability
- api.Window.getDigitalGoodsService
- api.Window.launchQueue
- api.Window.navigation
- api.Window.queryLocalFonts
- api.WorkerLocation.toString
- css.properties.object-overflow
- css.properties.object-view-box
- css.properties.scroll-start
- css.properties.scroll-start-block
- css.properties.scroll-start-inline
- css.properties.scroll-start-target
- css.properties.scroll-start-x
- css.properties.scroll-start-y
- javascript.builtins.Array.findLast
- javascript.builtins.Array.findLastIndex
- javascript.builtins.Array.groupBy
- javascript.builtins.Array.groupByToMap
- javascript.builtins.Date.UTC
- javascript.builtins.Math
- javascript.builtins.Intl.Locale.calendars
- javascript.builtins.Intl.Locale.collations
- javascript.builtins.Intl.Locale.hourCycles
- javascript.builtins.Intl.Locale.numberingSystems
- javascript.builtins.Intl.Locale.textInfo
- javascript.builtins.Intl.Locale.timeZones
- javascript.builtins.Intl.Locale.weekInfo
- javascript.builtins.Intl.NumberFormat.formatRange
- javascript.builtins.Intl.NumberFormat.formatRangeToParts
- javascript.builtins.Intl.PluralRules.selectRange
- javascript.builtins.Intl.Segmenter
- javascript.builtins.Intl.supportedValuesOf
- javascript.builtins.WebAssembly.Exception
- javascript.builtins.WebAssembly.Tag

#### Removed

- 1000+ on\* event handler entries ([#1825](https://github.com/foolip/mdn-bcd-collector/pull/1825))
- api.AppHistory
- api.AppHistoryCurrentChangeEvent
- api.AppHistoryDestination
- api.AppHistoryEntry
- api.AppHistoryNavigateEvent
- api.AppHistoryTransition
- api.BeforeInstallPromptEvent.platform
- api.ClipboardItem.createDelayed
- api.ClipboardItem.delayed
- api.ClipboardItem.lastModified
- api.CloseWatcher.signalClose
- api.ComputePressureObserver
- api.Document.interestCohort
- api.FontManager
- api.FontMetadata
- api.GPUComputePassEncoder.dispatch
- api.GPUComputePassEncoder.dispatchIndirect
- api.HTMLIFrameElement.importance
- api.HTMLImageElement.importance
- api.HTMLLinkElement.importance
- api.HTMLScriptElement.importance
- api.Navigator.fonts
- api.Request.importance
- api.Window.appHistory
- css.properties.custom-property

#### Changed

- All css.properties.\* entries ([#1805](https://github.com/foolip/mdn-bcd-collector/pull/1805))
- api.RTCIceCandidate
- api.SpeechSynthesis
- api.SpeechSynthesisUtterance
- api.SpeechSynthesisVoice

### Commits

- Use a single storage bucket with app version as path prefix ([#1934](https://github.com/foolip/mdn-bcd-collector/pull/1934))
- Use 'git describe' to generate version number for dev version ([#1912](https://github.com/foolip/mdn-bcd-collector/pull/1912))
- Add missing JS builtins ([#1930](https://github.com/foolip/mdn-bcd-collector/pull/1930))
- Fix the release script (multiple bugs) ([#1933](https://github.com/foolip/mdn-bcd-collector/pull/1933))
- Fix custom IDL for BeforeInstallPromptEvent ([#1931](https://github.com/foolip/mdn-bcd-collector/pull/1931))
- Simplify LegacyFactoryFunction code ([#1929](https://github.com/foolip/mdn-bcd-collector/pull/1929))
- Log which Selenium host is chosen on what OS and OS version ([#1921](https://github.com/foolip/mdn-bcd-collector/pull/1921))
- Provide better integration with LambdaTest ([#1922](https://github.com/foolip/mdn-bcd-collector/pull/1922))
- Fix concurrent argument passed into Selenium ([#1920](https://github.com/foolip/mdn-bcd-collector/pull/1920))
- Randomize selection of Selenium host ([#1919](https://github.com/foolip/mdn-bcd-collector/pull/1919))
- Allow for defining custom number for concurrent Selenium jobs ([#1914](https://github.com/foolip/mdn-bcd-collector/pull/1914))
- Use npm version to bump version in release script ([#1918](https://github.com/foolip/mdn-bcd-collector/pull/1918))
- Allow LambdaTest as a Selenium host ([#1913](https://github.com/foolip/mdn-bcd-collector/pull/1913))
- Set to production by default if NODE_ENV = production ([#1903](https://github.com/foolip/mdn-bcd-collector/pull/1903))
- Update README about deployment ([#1911](https://github.com/foolip/mdn-bcd-collector/pull/1911))
- Fix regex to catch reusableInstances in tests ([#1909](https://github.com/foolip/mdn-bcd-collector/pull/1909))
- Handle "preview" in update-bcd ([#1905](https://github.com/foolip/mdn-bcd-collector/pull/1905))
- Don't set BCD to false if BCD has version number greater than our data ([#1904](https://github.com/foolip/mdn-bcd-collector/pull/1904))
- Fix NPM audit ([#1899](https://github.com/foolip/mdn-bcd-collector/pull/1899))
- Remove mitigation of Firefox 3.6.17 UA parsing bug ([#1893](https://github.com/foolip/mdn-bcd-collector/pull/1893))
- Ensure site doesn't crash if OS can't be parsed from UA ([#1892](https://github.com/foolip/mdn-bcd-collector/pull/1892))
- Add custom test for api.Element.scroll.options_behavior_parameter ([#1509](https://github.com/foolip/mdn-bcd-collector/pull/1509))
- Fix tests ([#1888](https://github.com/foolip/mdn-bcd-collector/pull/1888))
- Add custom test for RTCIceCandidate API ([#1660](https://github.com/foolip/mdn-bcd-collector/pull/1660))
- Add custom tests for speech synthesis ([#1696](https://github.com/foolip/mdn-bcd-collector/pull/1696))
- Generate toString tests for named stringifiers in IDL ([#1716](https://github.com/foolip/mdn-bcd-collector/pull/1716))
- Add custom tests for HTML[Anchor/Area]Element/WorkerLocation toString ([#1717](https://github.com/foolip/mdn-bcd-collector/pull/1717))
- Log the URLs used for tests in report PR descriptions ([#1813](https://github.com/foolip/mdn-bcd-collector/pull/1813))
- Remap event handlers ([#1825](https://github.com/foolip/mdn-bcd-collector/pull/1825))
- Update unittests ([#1784](https://github.com/foolip/mdn-bcd-collector/pull/1784))
- Add the ability to test CSS property values to custom-css.json ([#1805](https://github.com/foolip/mdn-bcd-collector/pull/1805))
- Fix find-missing-results ([#1826](https://github.com/foolip/mdn-bcd-collector/pull/1826))
- Upgrade to Node.js v16 ([#1817](https://github.com/foolip/mdn-bcd-collector/pull/1817))
- Don't render results automatically when there are more than 250 ([#1810](https://github.com/foolip/mdn-bcd-collector/pull/1810))
- Add custom JS tests found via find-missing-features.js ([#1804](https://github.com/foolip/mdn-bcd-collector/pull/1804))

## v5.0.0

### Test Changes

#### Added

- api.AbortPaymentEvent
- api.AbortSignal.reason
- api.AbortSignal.throwIfAborted
- api.AbortSignal.timeout
- api.AccessibleNode
- api.AnimationEvent.initAnimationEvent
- api.ApplicationCache
- api.Attr.isId
- api.Attr.schemaTypeInfo
- api.AudioBuffer.gain
- api.AudioBufferSourceNode.gain
- api.AudioBufferSourceNode.looping
- api.AudioBufferSourceNode.noteGrainOn
- api.AudioBufferSourceNode.noteOff
- api.AudioBufferSourceNode.noteOn
- api.AudioBufferSourceNode.playbackState
- api.AudioContext.createConstantSource
- api.AudioContext.createDelayNode
- api.AudioContext.createGainNode
- api.AudioContext.createJavaScriptNode
- api.AudioListener.dopplerFactor
- api.AudioListener.setVelocity
- api.AudioListener.speedOfSound
- api.AudioParam.cancelValuesAndHoldAtTime
- api.AudioParam.name
- api.AudioParam.setTargetValueAtTime
- api.AudioParam.units
- api.AudioParamMap.@@iterator
- api.AudioTrackList.item
- api.BaseAudioContext.decodeAudioData.returns_promise
- api.BeforeInstallPromptEvent
- api.Blob.webkitSlice
- api.BlobBuilder
- api.BluetoothAdvertisingData
- api.BluetoothDevice.adData
- api.BluetoothDevice.connectGATT
- api.BluetoothDevice.deviceClass
- api.BluetoothDevice.gattServer
- api.BluetoothDevice.paired
- api.BluetoothDevice.productID
- api.BluetoothDevice.productVersion
- api.BluetoothDevice.unwatchAdvertisements
- api.BluetoothDevice.uuids
- api.BluetoothDevice.vendorID
- api.BluetoothDevice.vendorIDSource
- api.BluetoothManufacturerDataMap.@@iterator
- api.BluetoothServiceDataMap.@@iterator
- api.BrowserCaptureMediaStreamTrack
- api.BudgetService
- api.BudgetState
- api.CanMakePaymentEvent.modifiers
- api.CanvasCaptureMediaStream
- api.CanvasFilter
- api.CanvasRenderingContext2D.addHitRegion
- api.CanvasRenderingContext2D.clearHitRegions
- api.CanvasRenderingContext2D.clearShadow
- api.CanvasRenderingContext2D.currentTransform
- api.CanvasRenderingContext2D.drawImageFromRect
- api.CanvasRenderingContext2D.drawWidgetAsOnScreen
- api.CanvasRenderingContext2D.drawWindow
- api.CanvasRenderingContext2D.letterSpacing
- api.CanvasRenderingContext2D.mozCurrentTransform
- api.CanvasRenderingContext2D.mozCurrentTransformInverse
- api.CanvasRenderingContext2D.mozImageSmoothingEnabled
- api.CanvasRenderingContext2D.mozTextStyle
- api.CanvasRenderingContext2D.msImageSmoothingEnabled
- api.CanvasRenderingContext2D.removeHitRegion
- api.CanvasRenderingContext2D.setAlpha
- api.CanvasRenderingContext2D.setCompositeOperation
- api.CanvasRenderingContext2D.setFillColor
- api.CanvasRenderingContext2D.setLineCap
- api.CanvasRenderingContext2D.setLineJoin
- api.CanvasRenderingContext2D.setLineWidth
- api.CanvasRenderingContext2D.setMiterLimit
- api.CanvasRenderingContext2D.setShadow
- api.CanvasRenderingContext2D.setStrokeColor
- api.CanvasRenderingContext2D.webkitBackingStorePixelRatio
- api.CanvasRenderingContext2D.webkitGetImageDataHD
- api.CanvasRenderingContext2D.webkitImageSmoothingEnabled
- api.CanvasRenderingContext2D.webkitLineDash
- api.CanvasRenderingContext2D.webkitLineDashOffset
- api.CanvasRenderingContext2D.webkitPutImageDataHD
- api.CanvasRenderingContext2D.wordSpacing
- api.CanvasRenderingContext2D.drawFocusIfNeeded.path_parameter
- api.CharacterBoundsUpdateEvent
- api.CloseEvent.initCloseEvent
- api.CompositionEvent.locale
- api.ComputePressureObserver.disconnect
- api.ComputePressureObserver.supportedTargetTypes
- api.ComputePressureObserver.takeRecords
- api.console.context
- api.console.exception
- api.console.memory
- api.console.profile
- api.console.profileEnd
- api.console.record
- api.console.recordEnd
- api.console.screenshot
- api.console.takeHeapSnapshot
- api.console.timeStamp
- api.Counter
- api.Credential.isConditionalMediationAvailable
- api.CropTarget
- api.Crypto.webkitSubtle
- api.CSS2Properties
- api.CSSColor.alpha
- api.CSSColor.channels
- api.CSSColor.colorSpace
- api.CSSFontFeatureValuesMap.@@iterator
- api.CSSFontFeatureValuesRule.valueText
- api.CSSImportRule.layerName
- api.CSSKeyframesRule.insertRule
- api.CSSLayerBlockRule
- api.CSSLayerStatementRule
- api.CSSMozDocumentRule
- api.CSSOKLab
- api.CSSOKLCH
- api.CSSPositionValue
- api.CSSPrimitiveValue
- api.CSSPseudoElement.parent
- api.CSSPseudoElement.pseudo
- api.CSSStyleDeclaration.@@iterator
- api.CSSStyleDeclaration.entries
- api.CSSStyleDeclaration.forEach
- api.CSSStyleDeclaration.getPropertyCSSValue
- api.CSSStyleDeclaration.getPropertyShorthand
- api.CSSStyleDeclaration.isPropertyImplicit
- api.CSSStyleDeclaration.keys
- api.CSSStyleDeclaration.values
- api.CSSValue
- api.CSSValueList
- api.CustomStateSet.@@iterator
- api.DataCue.data
- api.DataTransfer.addElement
- api.DataTransfer.getFiles
- api.DataTransfer.getFilesAndDirectories
- api.DataTransfer.mozClearDataAt
- api.DataTransfer.mozCursor
- api.DataTransfer.mozGetDataAt
- api.DataTransfer.mozItemCount
- api.DataTransfer.mozSetDataAt
- api.DataTransfer.mozSourceNode
- api.DataTransfer.mozTypesAt
- api.DataTransfer.mozUserCancelled
- api.DataTransferItemList.item
- api.DeviceLightEvent
- api.DeviceMotionEvent.initDeviceMotionEvent
- api.DeviceOrientationEvent.initDeviceOrientationEvent
- api.DeviceProximityEvent
- api.Directory
- api.DirectoryEntry
- api.DirectoryEntrySync
- api.DirectoryReader
- api.DirectoryReaderSync
- api.Document.caretRangeFromPoint
- api.Document.contains
- api.Document.createEntityReference
- api.Document.createTouch
- api.Document.createTouchList
- api.Document.documentURIObject
- api.Document.domConfig
- api.Document.enableStyleSheetsForSet
- api.Document.execCommandShowHelp
- api.Document.featurePolicy
- api.Document.fileSize
- api.Document.getBoxObjectFor
- api.Document.getCSSCanvasContext
- api.Document.getItems
- api.Document.getOverrideStyle
- api.Document.hasTrustToken
- api.Document.height
- api.Document.lastStyleSheetSet
- api.Document.loadOverlay
- api.Document.mozCancelFullScreen
- api.Document.mozFullScreen
- api.Document.mozFullScreenElement
- api.Document.mozFullScreenEnabled
- api.Document.mozMatchesSelector
- api.Document.mozSetImageElement
- api.Document.mozSyntheticDocument
- api.Document.msElementsFromPoint
- api.Document.msExitFullscreen
- api.Document.msFullscreenElement
- api.Document.msFullscreenEnabled
- api.Document.msMatchesSelector
- api.Document.normalizeDocument
- api.Document.onafterscriptexecute
- api.Document.onbeforecopy
- api.Document.onbeforecut
- api.Document.onbeforeinput
- api.Document.onbeforepaste
- api.Document.onbeforescriptexecute
- api.Document.ondragexit
- api.Document.onloadend
- api.Document.onmousewheel
- api.Document.onmozfullscreenchange
- api.Document.onmozfullscreenerror
- api.Document.onmsfullscreenchange
- api.Document.onmsfullscreenerror
- api.Document.onrejectionhandled
- api.Document.onsearch
- api.Document.onshow
- api.Document.ontouchforcechange
- api.Document.onunhandledrejection
- api.Document.onwebkitfullscreenchange
- api.Document.onwebkitfullscreenerror
- api.Document.onwebkitmouseforcechanged
- api.Document.onwebkitmouseforcedown
- api.Document.onwebkitmouseforceup
- api.Document.onwebkitmouseforcewillbegin
- api.Document.onwebkitpointerlockchange
- api.Document.onwebkitpointerlockerror
- api.Document.origin
- api.Document.popupNode
- api.Document.preferredStyleSheetSet
- api.Document.queryCommandText
- api.Document.registerElement
- api.Document.releaseCapture
- api.Document.renameNode
- api.Document.routeEvent
- api.Document.selectedStyleSheetSet
- api.Document.strictErrorChecking
- api.Document.styleSheetSets
- api.Document.tooltipNode
- api.Document.undoManager
- api.Document.webkitCancelFullScreen
- api.Document.webkitCurrentFullScreenElement
- api.Document.webkitExitFullscreen
- api.Document.webkitExitPointerLock
- api.Document.webkitFullscreenElement
- api.Document.webkitFullscreenEnabled
- api.Document.webkitFullScreenKeyboardInputAllowed
- api.Document.webkitHidden
- api.Document.webkitIsFullScreen
- api.Document.webkitPointerLockElement
- api.Document.webkitVisibilityState
- api.Document.width
- api.Document.xmlEncoding
- api.Document.xmlStandalone
- api.Document.xmlVersion
- api.DocumentType.entities
- api.DocumentType.internalSubset
- api.DocumentType.notations
- api.DOMConfiguration
- api.DOMError
- api.DOMException.data
- api.DOMException.filename
- api.DOMException.result
- api.DOMImplementation.getFeature
- api.DOMImplementationList
- api.DOMImplementationSource
- api.DOMLocator
- api.DOMMatrixReadOnly.scaleNonUniformSelf
- api.DOMMatrixReadOnly.transform
- api.DOMSettableTokenList
- api.DragEvent.initDragEvent
- api.EditContext
- api.Element.accessibleNode
- api.Element.ariaRelevant
- api.Element.attributeStyleMap
- api.Element.computedName
- api.Element.computedRole
- api.Element.createShadowRoot
- api.Element.currentStyle
- api.Element.editContext
- api.Element.getDestinationInsertionPoints
- api.Element.mozRequestFullScreen
- api.Element.msGetPointerCapture
- api.Element.msMatchesSelector
- api.Element.msReleasePointerCapture
- api.Element.msRequestFullscreen
- api.Element.msSetPointerCapture
- api.Element.name
- api.Element.onbeforeload
- api.Element.onbeforematch
- api.Element.onbeforexrselect
- api.Element.oncopy
- api.Element.oncut
- api.Element.onfocusin
- api.Element.onfocusout
- api.Element.ongesturechange
- api.Element.ongestureend
- api.Element.ongesturestart
- api.Element.onmozfullscreenchange
- api.Element.onmozfullscreenerror
- api.Element.onmsfullscreenchange
- api.Element.onmsfullscreenerror
- api.Element.onpaste
- api.Element.onsearch
- api.Element.onselectstart
- api.Element.onwebkitanimationend
- api.Element.onwebkitanimationiteration
- api.Element.onwebkitanimationstart
- api.Element.onwebkitcurrentplaybacktargetiswirelesschanged
- api.Element.onwebkitfullscreenchange
- api.Element.onwebkitfullscreenerror
- api.Element.onwebkitneedkey
- api.Element.onwebkitplaybacktargetavailabilitychanged
- api.Element.onwebkitpresentationmodechanged
- api.Element.onwebkittransitionend
- api.Element.openOrClosedShadowRoot
- api.Element.releaseCapture
- api.Element.runtimeStyle
- api.Element.schemaTypeInfo
- api.Element.scrollIntoViewIfNeeded
- api.Element.scrollLeftMax
- api.Element.scrollTopMax
- api.Element.setCapture
- api.Element.setIdAttribute
- api.Element.setIdAttributeNode
- api.Element.setIdAttributeNS
- api.Element.tabStop
- api.Element.undoManager
- api.Element.undoScope
- api.Element.webkitCreateShadowRoot
- api.Element.webkitRequestFullscreen
- api.Element.webkitRequestFullScreen
- api.Element.webkitRequestPointerLock
- api.ElementInternals.ariaRelevant
- api.EnterPictureInPictureEvent
- api.Entity
- api.EntityReference
- api.Entry
- api.EntrySync
- api.Event.explicitOriginalTarget
- api.Event.getPreventDefault
- api.Event.originalTarget
- api.Event.path
- api.Event.preventBubble
- api.Event.preventCapture
- api.EventCounts.@@iterator
- api.EventSource.URL
- api.FeaturePolicy
- api.FetchEvent.client
- api.FetchEvent.isReload
- api.FetchEvent.navigationPreload
- api.FetchEvent.targetClientId
- api.File.lastModifiedDate
- api.File.type
- api.FileEntry
- api.FileEntrySync
- api.FileError
- api.FileException
- api.FileSaver
- api.FileSaverSync
- api.FileSystemDirectoryEntry.removeRecursively
- api.FileSystemEntry.copyTo
- api.FileSystemEntry.getMetadata
- api.FileSystemEntry.moveTo
- api.FileSystemEntry.remove
- api.FileSystemEntry.toURL
- api.FileSystemFileEntry.createWriter
- api.FileSystemSync
- api.FileWriter
- api.FileWriterSync
- api.FontFaceSet.@@iterator
- api.FontFaceVariations.@@iterator
- api.Gamepad.displayId
- api.Gamepad.vibrationActuator
- api.GamepadAxisEvent
- api.GamepadButtonEvent
- api.GamepadHapticActuator.playEffect
- api.GamepadHapticActuator.reset
- api.GeolocationCoordinates.floorLevel
- api.GestureEvent
- api.GPUCommandEncoder.clearBuffer
- api.GPUComputePassEncoder.end
- api.GPURenderPassEncoder.end
- api.GPUSupportedFeatures.@@iterator
- api.HashChangeEvent.initHashChangeEvent
- api.Headers.getAll
- api.HIDDevice.forget
- api.Highlight.@@iterator
- api.Highlight.type
- api.HighlightRegistry.@@iterator
- api.HMDVRDevice
- api.HTMLAnchorElement.hrefTranslate
- api.HTMLAnchorElement.media
- api.HTMLAppletElement
- api.HTMLAreaElement.hreflang
- api.HTMLAreaElement.media
- api.HTMLAreaElement.type
- api.HTMLAudioElement.mozCurrentSampleOffset
- api.HTMLAudioElement.mozSetup
- api.HTMLAudioElement.mozWriteAudio
- api.HTMLBaseFontElement
- api.HTMLBodyElement.onblur
- api.HTMLBodyElement.onerror
- api.HTMLBodyElement.onfocus
- api.HTMLBodyElement.onfocusin
- api.HTMLBodyElement.onfocusout
- api.HTMLBodyElement.onload
- api.HTMLBodyElement.onresize
- api.HTMLBodyElement.onscroll
- api.HTMLBodyElement.onselectionchange
- api.HTMLBodyElement.onwebkitmouseforcechanged
- api.HTMLBodyElement.onwebkitmouseforcedown
- api.HTMLBodyElement.onwebkitmouseforceup
- api.HTMLBodyElement.onwebkitmouseforcewillbegin
- api.HTMLButtonElement.autofocus
- api.HTMLButtonElement.menu
- api.HTMLCanvasElement.mozFetchAsStream
- api.HTMLCanvasElement.mozGetAsFile
- api.HTMLCanvasElement.mozOpaque
- api.HTMLCanvasElement.mozPrintCallback
- api.HTMLCanvasElement.msToBlob
- api.HTMLContentElement
- api.HTMLDocument
- api.HTMLElement.contextMenu
- api.HTMLElement.dropzone
- api.HTMLElement.forceSpellCheck
- api.HTMLElement.inert
- api.HTMLElement.itemId
- api.HTMLElement.itemProp
- api.HTMLElement.itemRef
- api.HTMLElement.itemScope
- api.HTMLElement.itemType
- api.HTMLElement.itemValue
- api.HTMLElement.noModule
- api.HTMLElement.onbeforecopy
- api.HTMLElement.onbeforecut
- api.HTMLElement.onbeforeinput
- api.HTMLElement.onbeforepaste
- api.HTMLElement.ondragexit
- api.HTMLElement.onloadend
- api.HTMLElement.onModule
- api.HTMLElement.onmousewheel
- api.HTMLElement.onmozfullscreenchange
- api.HTMLElement.onmozfullscreenerror
- api.HTMLElement.onmsfullscreenchange
- api.HTMLElement.onmsfullscreenerror
- api.HTMLElement.onrejectionhandled
- api.HTMLElement.onsearch
- api.HTMLElement.onshow
- api.HTMLElement.ontouchforcechange
- api.HTMLElement.onunhandledrejection
- api.HTMLElement.onwebkitfullscreenchange
- api.HTMLElement.onwebkitfullscreenerror
- api.HTMLElement.onwebkitmouseforcechanged
- api.HTMLElement.onwebkitmouseforcedown
- api.HTMLElement.onwebkitmouseforceup
- api.HTMLElement.onwebkitmouseforcewillbegin
- api.HTMLElement.properties
- api.HTMLElement.webkitdropzone
- api.HTMLFormElement.autocapitalize
- api.HTMLFormElement.requestAutocomplete
- api.HTMLFrameElement.getSVGDocument
- api.HTMLFrameElement.height
- api.HTMLFrameElement.location
- api.HTMLFrameElement.width
- api.HTMLFrameSetElement.onlanguage
- api.HTMLFrameSetElement.onorientationchange
- api.HTMLHeadElement.profile
- api.HTMLHtmlElement.manifest
- api.HTMLIFrameElement.allowPaymentRequest
- api.HTMLIFrameElement.featurePolicy
- api.HTMLIFrameElement.importance
- api.HTMLIFrameElement.setNfcFocus
- api.HTMLImageElement.importance
- api.HTMLImageElement.onerror
- api.HTMLInputElement.allowdirs
- api.HTMLInputElement.autocapitalize
- api.HTMLInputElement.autofocus
- api.HTMLInputElement.chooseDirectory
- api.HTMLInputElement.getFiles
- api.HTMLInputElement.getFilesAndDirectories
- api.HTMLInputElement.incremental
- api.HTMLInputElement.isFilesAndDirectoriesSupported
- api.HTMLInputElement.mozGetFileNameArray
- api.HTMLInputElement.mozIsTextField
- api.HTMLInputElement.mozSetFileArray
- api.HTMLInputElement.mozSetFileNameArray
- api.HTMLInputElement.onsearch
- api.HTMLInputElement.showPicker
- api.HTMLInputElement.textLength
- api.HTMLInputElement.weight
- api.HTMLIsIndexElement
- api.HTMLKeygenElement
- api.HTMLLinkElement.importance
- api.HTMLLinkElement.nonce
- api.HTMLMarqueeElement.onbounce
- api.HTMLMarqueeElement.onfinish
- api.HTMLMarqueeElement.onstart
- api.HTMLMediaElement.controller
- api.HTMLMediaElement.controlsList
- api.HTMLMediaElement.getVideoPlaybackQuality
- api.HTMLMediaElement.initialTime
- api.HTMLMediaElement.mediaGroup
- api.HTMLMediaElement.mozAudioCaptured
- api.HTMLMediaElement.mozCaptureStream
- api.HTMLMediaElement.mozCaptureStreamUntilEnded
- api.HTMLMediaElement.mozChannels
- api.HTMLMediaElement.mozFragmentEnd
- api.HTMLMediaElement.mozFrameBufferLength
- api.HTMLMediaElement.mozGetMetadata
- api.HTMLMediaElement.mozLoadFrom
- api.HTMLMediaElement.mozPreservesPitch
- api.HTMLMediaElement.mozSampleRate
- api.HTMLMediaElement.onerror
- api.HTMLMediaElement.onmozinterruptbegin
- api.HTMLMediaElement.onmozinterruptend
- api.HTMLMediaElement.seekToNextFrame
- api.HTMLMediaElement.webkitAudioDecodedByteCount
- api.HTMLMediaElement.webkitClosedCaptionsVisible
- api.HTMLMediaElement.webkitCurrentPlaybackTargetIsWireless
- api.HTMLMediaElement.webkitHasClosedCaptions
- api.HTMLMediaElement.webkitKeys
- api.HTMLMediaElement.webkitPreservesPitch
- api.HTMLMediaElement.webkitSetMediaKeys
- api.HTMLMediaElement.webkitShowPlaybackTargetPicker
- api.HTMLMediaElement.webkitVideoDecodedByteCount
- api.HTMLMenuElement.label
- api.HTMLMenuElement.type
- api.HTMLMenuItemElement
- api.HTMLObjectElement.typeMustMatch
- api.HTMLPreElement.wrap
- api.HTMLPropertiesCollection
- api.HTMLScriptElement.importance
- api.HTMLScriptElement.nonce
- api.HTMLSelectElement.autofocus
- api.HTMLSelectElement.blur
- api.HTMLSelectElement.focus
- api.HTMLShadowElement
- api.HTMLSourceElement.keySystem
- api.HTMLStyleElement.disabled
- api.HTMLStyleElement.nonce
- api.HTMLStyleElement.scoped
- api.HTMLTableElement.sortable
- api.HTMLTableElement.stopSorting
- api.HTMLTextAreaElement.autocapitalize
- api.HTMLTextAreaElement.autofocus
- api.HTMLVideoElement.mozDecodedFrames
- api.HTMLVideoElement.mozFrameDelay
- api.HTMLVideoElement.mozHasAudio
- api.HTMLVideoElement.mozPaintedFrames
- api.HTMLVideoElement.mozParsedFrames
- api.HTMLVideoElement.mozPresentedFrames
- api.HTMLVideoElement.msIsStereo3D
- api.HTMLVideoElement.webkitDecodedFrameCount
- api.HTMLVideoElement.webkitDisplayingFullscreen
- api.HTMLVideoElement.webkitDroppedFrameCount
- api.HTMLVideoElement.webkitEnterFullscreen
- api.HTMLVideoElement.webkitEnterFullScreen
- api.HTMLVideoElement.webkitExitFullscreen
- api.HTMLVideoElement.webkitExitFullScreen
- api.HTMLVideoElement.webkitPresentationMode
- api.HTMLVideoElement.webkitSetPresentationMode
- api.HTMLVideoElement.webkitSupportsFullscreen
- api.HTMLVideoElement.webkitSupportsPresentationMode
- api.HTMLVideoElement.webkitWirelessVideoPlaybackDisabled
- api.IDBDatabase.createMutableFile
- api.IDBDatabaseException
- api.IDBEnvironment
- api.IDBIndex.isAutoLocale
- api.IDBIndex.locale
- api.IDBLocaleAwareKeyRange
- api.IDBVersionChangeEvent.dataLoss
- api.IDBVersionChangeEvent.dataLossMessage
- api.IDBVersionChangeEvent.version
- api.IDBVersionChangeRequest
- api.ImageBitmapRenderingContext.transferImageBitmap
- api.ImageDecoder.type
- api.InstallEvent
- api.InteractionCounts
- api.IntersectionObserver.delay
- api.IntersectionObserver.trackVisibility
- api.IntersectionObserverEntry.isVisible
- api.KeyboardEvent.altGraphKey
- api.KeyboardEvent.initKeyEvent
- api.KeyboardEvent.keyIdentifier
- api.KeyboardEvent.keyLocation
- api.KeyboardEvent.which
- api.KeyboardLayoutMap.@@iterator
- api.KeyEvent
- api.LayoutShiftAttribution.toJSON
- api.LocalMediaStream
- api.Location.password
- api.Location.toString
- api.Location.username
- api.MathMLElement.onbeforecopy
- api.MathMLElement.onbeforecut
- api.MathMLElement.onbeforeinput
- api.MathMLElement.onbeforepaste
- api.MathMLElement.ondragexit
- api.MathMLElement.onloadend
- api.MathMLElement.onmousewheel
- api.MathMLElement.onmozfullscreenchange
- api.MathMLElement.onmozfullscreenerror
- api.MathMLElement.onmsfullscreenchange
- api.MathMLElement.onmsfullscreenerror
- api.MathMLElement.onrejectionhandled
- api.MathMLElement.onsearch
- api.MathMLElement.onshow
- api.MathMLElement.ontouchforcechange
- api.MathMLElement.onunhandledrejection
- api.MathMLElement.onwebkitfullscreenchange
- api.MathMLElement.onwebkitfullscreenerror
- api.MathMLElement.onwebkitmouseforcechanged
- api.MathMLElement.onwebkitmouseforcedown
- api.MathMLElement.onwebkitmouseforceup
- api.MathMLElement.onwebkitmouseforcewillbegin
- api.MediaController
- api.MediaDevices.produceCropTarget
- api.MediaRecorder.ignoreMutedMedia
- api.MediaRecorder.onwarning
- api.MediaSource.onsourceclosed
- api.MediaStream.ended
- api.MediaStream.label
- api.MediaStream.onactive
- api.MediaStream.oninactive
- api.MediaStream.stop
- api.MediaStreamEvent
- api.MediaStreamTrack.getSources
- api.MediaStreamTrack.onoverconstrained
- api.MediaStreamTrack.readonly
- api.MediaStreamTrack.remote
- api.MediaStreamTrackAudioSourceNode.mediaStreamTrack
- api.MediaStreamTrackGenerator
- api.MediaStreamTrackProcessor
- api.MemoryInfo
- api.MerchantValidationEvent
- api.MessageEvent.userActivation
- api.Metadata
- api.MIDIInputMap.@@iterator
- api.MIDIOutputMap.@@iterator
- api.MLGraphBuilder.convTranspose2d
- api.MouseEvent.fromElement
- api.MouseEvent.initNSMouseEvent
- api.MouseEvent.layerX
- api.MouseEvent.layerY
- api.MouseEvent.mozInputSource
- api.MouseEvent.mozPressure
- api.MouseEvent.region
- api.MouseEvent.toElement
- api.MouseEvent.webkitForce
- api.MouseEvent.which
- api.MouseScrollEvent
- api.MouseWheelEvent
- api.mozRTCIceCandidate
- api.mozRTCPeerConnection
- api.mozRTCSessionDescription
- api.MSCSSMatrix
- api.MSCurrentStyleCSSProperties
- api.MSGestureEvent
- api.MSStyleCSSProperties
- api.NamedFlowMap.@@iterator
- api.NameList
- api.Navigator.activeVRDisplays
- api.Navigator.authentication
- api.Navigator.battery
- api.Navigator.buildID
- api.Navigator.doNotTrack
- api.Navigator.getAutoplayPolicy
- api.Navigator.getDisplayMedia
- api.Navigator.getStorageUpdates
- api.Navigator.getVRDisplays
- api.Navigator.mozBattery
- api.Navigator.mozGetUserMedia
- api.Navigator.mozIsLocallyAvailable
- api.Navigator.persistentStorage
- api.Navigator.registerContentHandler
- api.Navigator.temporaryStorage
- api.Navigator.userActivation
- api.Navigator.webkitBattery
- api.Navigator.webkitGetUserMedia
- api.Navigator.webkitPersistentStorage
- api.Navigator.webkitTemporaryStorage
- api.Navigator.windowControlsOverlay
- api.NDEFReader.makeReadOnly
- api.NDEFReader.onread
- api.NetworkInformation.ontypechange
- api.Node.baseURIObject
- api.Node.getFeature
- api.Node.getUserData
- api.Node.hasAttributes
- api.Node.isSupported
- api.Node.localName
- api.Node.namespaceURI
- api.Node.nodePrincipal
- api.Node.prefix
- api.Node.rootNode
- api.Node.setUserData
- api.NodeIterator.expandEntityReferences
- api.Notation
- api.Notification.get
- api.Notification.ondisplay
- api.Notification.show
- api.OffscreenCanvasRenderingContext2D.letterSpacing
- api.OffscreenCanvasRenderingContext2D.wordSpacing
- api.OscillatorNode.noteOff
- api.OscillatorNode.noteOn
- api.OverconstrainedErrorEvent
- api.OverflowEvent
- api.PaintRenderingContext2D.filter
- api.PannerNode.setVelocity
- api.PaymentAddress
- api.PaymentManager.enableDelegations
- api.PaymentRequest.hasEnrolledInstrument
- api.PaymentRequest.onmerchantvalidation
- api.PaymentRequest.onshippingaddresschange
- api.PaymentRequest.onshippingoptionchange
- api.PaymentRequest.paymentAddress
- api.PaymentRequest.requestId
- api.PaymentRequest.shippingAddress
- api.PaymentRequest.shippingOption
- api.PaymentRequest.shippingType
- api.PaymentRequestEvent.changeShippingAddress
- api.PaymentRequestEvent.changeShippingOption
- api.PaymentRequestEvent.instrumentKey
- api.PaymentRequestEvent.paymentOptions
- api.PaymentRequestEvent.requestBillingAddress
- api.PaymentRequestEvent.shippingOptions
- api.PaymentResponse.onpayerdetailchange
- api.PaymentResponse.payerEmail
- api.PaymentResponse.payerName
- api.PaymentResponse.payerPhone
- api.PaymentResponse.shippingAddress
- api.PaymentResponse.shippingOption
- api.Performance.interactionCounts
- api.Performance.memory
- api.Permissions.requestAll
- api.Plugin.version
- api.Point
- api.PositionSensorVRDevice
- api.PresentationRequest.startWithDevice
- api.ProcessingInstruction.data
- api.ProgressEvent.initProgressEvent
- api.PropertyNodeList
- api.PushManager.hasPermission
- api.PushManager.register
- api.PushManager.registrations
- api.PushManager.unregister
- api.PushRegistration
- api.PushRegistrationManager
- api.PushSubscription.subscriptionId
- api.Range.collapsed
- api.Range.compareNode
- api.Range.endContainer
- api.Range.endOffset
- api.Range.expand
- api.Range.startContainer
- api.Range.startOffset
- api.Rect
- api.Request.context
- api.Request.importance
- api.RGBColor
- api.RTCCertificate.getSupportedAlgorithms
- api.RTCDataChannel.reliable
- api.RTCDataChannel.stream
- api.RTCIdentityErrorEvent
- api.RTCIdentityEvent
- api.RTCPeerConnection.addStream
- api.RTCPeerConnection.createDTMFSender
- api.RTCPeerConnection.defaultIceServers
- api.RTCPeerConnection.getDefaultIceServers
- api.RTCPeerConnection.getLocalStreams
- api.RTCPeerConnection.getRemoteStreams
- api.RTCPeerConnection.getStreamById
- api.RTCPeerConnection.onaddstream
- api.RTCPeerConnection.onaddtrack
- api.RTCPeerConnection.onidentityresult
- api.RTCPeerConnection.onidpassertionerror
- api.RTCPeerConnection.onidpvalidationerror
- api.RTCPeerConnection.onpeeridentity
- api.RTCPeerConnection.onremovestream
- api.RTCPeerConnection.removeStream
- api.RTCPeerConnectionIceErrorEvent.hostCandidate
- api.RTCRtpReceiver.createEncodedStreams
- api.RTCRtpReceiver.playoutDelayHint
- api.RTCRtpReceiver.rtcpTransport
- api.RTCRtpScriptTransformer.generateKeyFrame
- api.RTCRtpScriptTransformer.sendKeyFrameRequest
- api.RTCRtpSender.createEncodedStreams
- api.RTCRtpSender.generateKeyFrame
- api.RTCRtpSender.rtcpTransport
- api.RTCRtpTransceiver.stopped
- api.RTCStatsReport.@@iterator
- api.Screen.availLeft
- api.Screen.availTop
- api.Screen.left
- api.Screen.lockOrientation
- api.Screen.mozBrightness
- api.Screen.mozEnabled
- api.Screen.mozLockOrientation
- api.Screen.mozOrientation
- api.Screen.mozUnlockOrientation
- api.Screen.msLockOrientation
- api.Screen.msOrientation
- api.Screen.msUnlockOrientation
- api.Screen.onmozorientationchange
- api.Screen.onmsorientationchange
- api.Screen.onorientationchange
- api.Screen.top
- api.Screen.unlockOrientation
- api.Selection.baseNode
- api.Selection.baseOffset
- api.Selection.caretBidiLevel
- api.Selection.extentNode
- api.Selection.extentOffset
- api.Selection.modify
- api.ServiceWorkerContainer.onerror
- api.ServiceWorkerGlobalScope.caches
- api.ServiceWorkerGlobalScope.onabortpayment
- api.ServiceWorkerMessageEvent
- api.ShadowRoot.caretPositionFromPoint
- api.ShadowRoot.elementFromPoint
- api.ShadowRoot.elementsFromPoint
- api.ShadowRoot.getSelection
- api.ShadowRoot.mozFullScreenElement
- api.SharedWorkerGlobalScope.applicationCache
- api.SourceBuffer.appendBufferAsync
- api.SourceBuffer.appendStream
- api.SourceBuffer.removeAsync
- api.SourceBuffer.trackDefaults
- api.SourceBufferList.item
- api.SpeechGrammar.SpeechGrammar
- api.SpeechGrammarList.addFromUri
- api.SpeechRecognition.serviceURI
- api.SpeechRecognitionEvent.emma
- api.SpeechRecognitionEvent.interpretation
- api.SQLTransaction
- api.StaticRange.collapsed
- api.StaticRange.endContainer
- api.StaticRange.endOffset
- api.StaticRange.startContainer
- api.StaticRange.startOffset
- api.StaticRange.toRange
- api.StorageQuota
- api.StyleMedia
- api.SVGAltGlyphDefElement
- api.SVGAltGlyphElement
- api.SVGAltGlyphItemElement
- api.SVGAnimateColorElement
- api.SVGColorProfileElement
- api.SVGCursorElement
- api.SVGElement.offsetHeight
- api.SVGElement.offsetLeft
- api.SVGElement.offsetParent
- api.SVGElement.offsetTop
- api.SVGElement.offsetWidth
- api.SVGElement.onbeforecopy
- api.SVGElement.onbeforecut
- api.SVGElement.onbeforeinput
- api.SVGElement.onbeforepaste
- api.SVGElement.ondragexit
- api.SVGElement.onloadend
- api.SVGElement.onmousewheel
- api.SVGElement.onmozfullscreenchange
- api.SVGElement.onmozfullscreenerror
- api.SVGElement.onmsfullscreenchange
- api.SVGElement.onmsfullscreenerror
- api.SVGElement.onrejectionhandled
- api.SVGElement.onsearch
- api.SVGElement.onshow
- api.SVGElement.ontouchforcechange
- api.SVGElement.onunhandledrejection
- api.SVGElement.onwebkitfullscreenchange
- api.SVGElement.onwebkitfullscreenerror
- api.SVGElement.onwebkitmouseforcechanged
- api.SVGElement.onwebkitmouseforcedown
- api.SVGElement.onwebkitmouseforceup
- api.SVGElement.onwebkitmouseforcewillbegin
- api.SVGExternalResourcesRequired
- api.SVGFontElement
- api.SVGFontFaceElement
- api.SVGFontFaceFormatElement
- api.SVGFontFaceNameElement
- api.SVGFontFaceSrcElement
- api.SVGFontFaceUriElement
- api.SVGGlyphElement
- api.SVGGlyphRefElement
- api.SVGGraphicsElement.autofocus
- api.SVGHKernElement
- api.SVGImageElement.decode
- api.SVGImageElement.decoding
- api.SVGMatrix
- api.SVGMeshElement
- api.SVGMissingGlyphElement
- api.SVGPathElement.createSVGPathSegArcAbs
- api.SVGPathElement.createSVGPathSegArcRel
- api.SVGPathElement.createSVGPathSegClosePath
- api.SVGPathElement.createSVGPathSegCurvetoCubicAbs
- api.SVGPathElement.createSVGPathSegCurvetoCubicRel
- api.SVGPathElement.createSVGPathSegCurvetoCubicSmoothAbs
- api.SVGPathElement.createSVGPathSegCurvetoCubicSmoothRel
- api.SVGPathElement.createSVGPathSegCurvetoQuadraticAbs
- api.SVGPathElement.createSVGPathSegCurvetoQuadraticRel
- api.SVGPathElement.createSVGPathSegCurvetoQuadraticSmoothAbs
- api.SVGPathElement.createSVGPathSegCurvetoQuadraticSmoothRel
- api.SVGPathElement.createSVGPathSegLinetoAbs
- api.SVGPathElement.createSVGPathSegLinetoHorizontalAbs
- api.SVGPathElement.createSVGPathSegLinetoHorizontalRel
- api.SVGPathElement.createSVGPathSegLinetoRel
- api.SVGPathElement.createSVGPathSegLinetoVerticalAbs
- api.SVGPathElement.createSVGPathSegLinetoVerticalRel
- api.SVGPathElement.createSVGPathSegMovetoAbs
- api.SVGPathElement.createSVGPathSegMovetoRel
- api.SVGPathElement.getPathSegAtLength
- api.SVGPoint
- api.SVGRect
- api.SVGRenderingIntent
- api.SVGSolidcolorElement
- api.SVGStylable
- api.SVGSVGElement.contentScriptType
- api.SVGSVGElement.contentStyleType
- api.SVGSVGElement.currentView
- api.SVGSVGElement.pixelUnitToMillimeterX
- api.SVGSVGElement.pixelUnitToMillimeterY
- api.SVGSVGElement.screenPixelToMillimeterX
- api.SVGSVGElement.screenPixelToMillimeterY
- api.SVGSVGElement.useCurrentView
- api.SVGSVGElement.viewport
- api.SVGSVGElement.zoomAndPan
- api.SVGTests
- api.SVGTransformable
- api.SVGTRefElement
- api.SVGUnknownElement
- api.SVGURIReference
- api.SVGViewElement.viewTarget
- api.SVGViewElement.zoomAndPan
- api.SVGViewSpec
- api.SVGVKernElement
- api.SVGZoomAndPan
- api.TestUtils
- api.Text.getDestinationInsertionPoints
- api.Text.isElementContentWhitespace
- api.Text.replaceWholeText
- api.TextEvent
- api.TextFormat
- api.TextFormatUpdateEvent
- api.TextTrack.addRegion
- api.TextTrack.regions
- api.TextTrack.removeRegion
- api.TextTrackCue.getCueAsHTML
- api.TextTrackCueList.item
- api.TextTrackList.item
- api.TextUpdateEvent
- api.Touch.webkitForce
- api.Touch.webkitRadiusX
- api.Touch.webkitRadiusY
- api.Touch.webkitRotationAngle
- api.TouchList.identifiedTouch
- api.TrackDefault
- api.TrackDefaultList
- api.Transferable
- api.TransitionEvent.animationName
- api.TransitionEvent.initTransitionEvent
- api.TreeWalker.expandEntityReferences
- api.TrustedHTML.fromLiteral
- api.TrustedScript.fromLiteral
- api.TrustedScriptURL.fromLiteral
- api.TypeInfo
- api.UIEvent.cancelBubble
- api.UIEvent.isChar
- api.UIEvent.layerX
- api.UIEvent.layerY
- api.UIEvent.pageX
- api.UIEvent.pageY
- api.UIEvent.rangeOffset
- api.UIEvent.rangeParent
- api.UndoItem
- api.UndoManager
- api.URL.toString
- api.URLUtilsReadOnly
- api.UserActivation
- api.UserDataHandler
- api.UserMessageHandler
- api.UserMessageHandlersNamespace
- api.UserProximityEvent
- api.VideoPlaybackQuality.totalFrameDelay
- api.VideoTrackGenerator
- api.VideoTrackList.item
- api.VRDisplay
- api.VRDisplayCapabilities
- api.VRDisplayEvent
- api.VREyeParameters
- api.VRFieldOfView
- api.VRFrameData
- api.VRPose
- api.VRStageParameters
- api.VTTCue.regionId
- api.VTTRegion.track
- api.VTTRegionList
- api.WEBGL_compressed_texture_atc
- api.WebGL2ComputeRenderingContext
- api.WebGL2ComputeRenderingContextBase
- api.WebGLRenderingContext.commit
- api.WebKitAnimationEvent
- api.webkitAudioContext
- api.webkitAudioPannerNode
- api.WebKitCSSMatrix
- api.WebKitMediaKeyError
- api.WebKitMediaKeyMessageEvent
- api.WebKitMediaKeyNeededEvent
- api.WebKitMediaKeys
- api.WebKitMediaKeySession
- api.webkitMediaStream
- api.WebKitMutationObserver
- api.WebKitNamespace
- api.webkitOfflineAudioContext
- api.WebKitPlaybackTargetAvailabilityEvent
- api.WebKitPoint
- api.webkitRTCPeerConnection
- api.webkitSpeechGrammar
- api.webkitSpeechGrammarList
- api.webkitSpeechRecognition
- api.webkitSpeechRecognitionError
- api.webkitSpeechRecognitionEvent
- api.WebKitTransitionEvent
- api.WebSocket.URL
- api.WheelEvent.initWebKitWheelEvent
- api.WheelEvent.initWheelEvent
- api.WheelEvent.webkitDirectionInvertedFromDevice
- api.WheelEvent.wheelDelta
- api.WheelEvent.wheelDeltaX
- api.WheelEvent.wheelDeltaY
- api.Window.applicationCache
- api.Window.clearImmediate
- api.Window.convertPointFromNodeToPage
- api.Window.convertPointFromPageToNode
- api.Window.defaultstatus
- api.Window.defaultStatus
- api.Window.dialogArguments
- api.Window.find
- api.Window.fullScreen
- api.Window.getAttention
- api.Window.getAttentionWithCycleCount
- api.Window.getDefaultComputedStyle
- api.Window.getMatchedCSSRules
- api.Window.globalStorage
- api.Window.home
- api.Window.maximize
- api.Window.minimize
- api.Window.mozAnimationStartTime
- api.Window.mozInnerScreenX
- api.Window.mozInnerScreenY
- api.Window.mozPaintCount
- api.Window.offscreenBuffering
- api.Window.onabsolutedeviceorientation
- api.Window.onappinstalled
- api.Window.onbeforeinstallprompt
- api.Window.ondevicelight
- api.Window.ondeviceproximity
- api.Window.ondragexit
- api.Window.onloadend
- api.Window.onmousewheel
- api.Window.onmozfullscreenchange
- api.Window.onmozfullscreenerror
- api.Window.onmsfullscreenchange
- api.Window.onmsfullscreenerror
- api.Window.onpaint
- api.Window.onsearch
- api.Window.onshow
- api.Window.ontouchforcechange
- api.Window.onuserproximity
- api.Window.onvrdisplayactivate
- api.Window.onvrdisplayblur
- api.Window.onvrdisplayconnect
- api.Window.onvrdisplaydeactivate
- api.Window.onvrdisplaydisconnect
- api.Window.onvrdisplayfocus
- api.Window.onvrdisplaypointerrestricted
- api.Window.onvrdisplaypointerunrestricted
- api.Window.onvrdisplaypresentchange
- api.Window.onwebkitfullscreenchange
- api.Window.onwebkitfullscreenerror
- api.Window.onwebkitmouseforcechanged
- api.Window.onwebkitmouseforcedown
- api.Window.onwebkitmouseforceup
- api.Window.onwebkitmouseforcewillbegin
- api.Window.openDatabase
- api.Window.openDialog
- api.Window.pkcs11
- api.Window.requestFileSystem
- api.Window.resolveLocalFileSystemURL
- api.Window.returnValue
- api.Window.routeEvent
- api.Window.scrollByLines
- api.Window.scrollByPages
- api.Window.scrollMaxX
- api.Window.scrollMaxY
- api.Window.setCursor
- api.Window.setImmediate
- api.Window.setResizable
- api.Window.showModalDialog
- api.Window.sidebar
- api.Window.sizeToContent
- api.Window.styleMedia
- api.Window.updateCommands
- api.Window.webkitCancelAnimationFrame
- api.Window.webkitCancelRequestAnimationFrame
- api.Window.webkitConvertPointFromNodeToPage
- api.Window.webkitConvertPointFromPageToNode
- api.Window.webkitIndexedDB
- api.Window.webkitRequestAnimationFrame
- api.Window.webkitRequestFileSystem
- api.Window.webkitResolveLocalFileSystemURL
- api.Window.webkitStorageInfo
- api.WindowControlsOverlay
- api.WindowControlsOverlayGeometryChangeEvent
- api.WorkerGlobalScope.dump
- api.WorkerGlobalScope.onclose
- api.WorkerGlobalScope.requestFileSystem
- api.WorkerGlobalScope.requestFileSystemSync
- api.WorkerGlobalScope.resolveLocalFileSystemSyncURL
- api.WorkerGlobalScope.resolveLocalFileSystemURL
- api.WorkerGlobalScope.webkitRequestFileSystem
- api.WorkerGlobalScope.webkitRequestFileSystemSync
- api.WorkerGlobalScope.webkitResolveLocalFileSystemSyncURL
- api.WorkerGlobalScope.webkitResolveLocalFileSystemURL
- api.XDomain
- api.XDomainRequest
- api.XMLDocument.async
- api.XMLDocument.load
- api.XMLHttpRequest.mozAnon
- api.XMLHttpRequest.mozSystem
- api.XMLHttpRequestProgressEvent
- api.XMLSerializer.serializeToStream
- api.XRAnchorSet.@@iterator
- api.XRSystem.supportsSession
- api.XRWebGLBinding.usesDepthValues
- css.properties.container
- css.properties.container-name
- css.properties.container-type

#### Removed

- api.BaseAudioContext.decodeAudioData.promise_syntax
- api.CanvasRenderingContext2D.textLetterSpacing
- api.CanvasRenderingContext2D.textWordSpacing
- api.CSSDeviceCMYK
- api.FontMetadata.italic
- api.FontMetadata.stretch
- api.FontMetadata.weight
- api.GPUCommandBuffer.executionTime
- api.GPUComputePassEncoder.beginPipelineStatisticsQuery
- api.GPUComputePassEncoder.endPass
- api.GPUComputePassEncoder.endPipelineStatisticsQuery
- api.GPUComputePassEncoder.writeTimestamp
- api.GPURenderPassEncoder.beginPipelineStatisticsQuery
- api.GPURenderPassEncoder.endPass
- api.GPURenderPassEncoder.endPipelineStatisticsQuery
- api.GPURenderPassEncoder.writeTimestamp
- api.OffscreenCanvasRenderingContext2D.textLetterSpacing
- api.OffscreenCanvasRenderingContext2D.textWordSpacing
- api.WorkerNavigator.fonts
- api.WritableStreamDefaultController.abortReason

#### Changed

- api.AnalyserNode
- api.ANGLE_instanced_arrays
- api.AnimationEvent
- api.Attr
- api.AudioBuffer
- api.AudioBufferSourceNode
- api.AudioContext
- api.AudioDestinationNode
- api.AudioListener
- api.AudioNode
- api.AudioParam
- api.AudioProcessingEvent
- api.AudioScheduledSourceNode
- api.AudioTrack
- api.AudioTrackList
- api.AudioWorkletNode
- api.BarProp
- api.BaseAudioContext
- api.BeforeUnloadEvent
- api.BiquadFilterNode
- api.Blob
- api.CacheStorage
- api.CanvasPattern
- api.CanvasRenderingContext2D
- api.ChannelMergerNode
- api.ChannelSplitterNode
- api.CharacterData
- api.Clients
- api.CloseEvent
- api.CompositionEvent
- api.ConstantSourceNode
- api.ConvolverNode
- api.Crypto
- api.CryptoKey
- api.CSSConditionRule
- api.CSSCounterStyleRule
- api.CSSFontFaceRule
- api.CSSFontFeatureValuesRule
- api.CSSGroupingRule
- api.CSSImportRule
- api.CSSKeyframeRule
- api.CSSKeyframesRule
- api.CSSMediaRule
- api.CSSPageRule
- api.CSSRule
- api.CSSRuleList
- api.CSSStyleDeclaration
- api.CSSStyleRule
- api.CSSStyleSheet
- api.CSSSupportsRule
- api.CSSViewportRule
- api.CustomEvent
- api.DelayNode
- api.DeviceMotionEvent
- api.DeviceOrientationEvent
- api.Document
- api.DocumentFragment
- api.DocumentType
- api.DOMException
- api.DOMImplementation
- api.DOMRectList
- api.DOMTokenList
- api.DragEvent
- api.DynamicsCompressorNode
- api.Element
- api.ErrorEvent
- api.Event
- api.EventSource
- api.EXT_blend_minmax
- api.EXT_clip_cull_distance
- api.EXT_color_buffer_float
- api.EXT_color_buffer_half_float
- api.EXT_disjoint_timer_query
- api.EXT_disjoint_timer_query_webgl2
- api.EXT_float_blend
- api.EXT_frag_depth
- api.EXT_shader_texture_lod
- api.EXT_sRGB
- api.EXT_texture_compression_bptc
- api.EXT_texture_compression_rgtc
- api.EXT_texture_filter_anisotropic
- api.EXT_texture_norm16
- api.ExtendableEvent
- api.External
- api.FetchEvent
- api.FileReader
- api.FocusEvent
- api.FontFace
- api.FontFaceSet
- api.FontFaceSetLoadEvent
- api.GainNode
- api.GamepadEvent
- api.HashChangeEvent
- api.History
- api.HTMLAllCollection
- api.HTMLAnchorElement
- api.HTMLAreaElement
- api.HTMLAudioElement
- api.HTMLBaseElement
- api.HTMLBodyElement
- api.HTMLBRElement
- api.HTMLButtonElement
- api.HTMLCanvasElement
- api.HTMLCollection
- api.HTMLDataElement
- api.HTMLDataListElement
- api.HTMLDetailsElement
- api.HTMLDialogElement
- api.HTMLDirectoryElement
- api.HTMLDivElement
- api.HTMLDListElement
- api.HTMLElement
- api.HTMLEmbedElement
- api.HTMLFieldSetElement
- api.HTMLFontElement
- api.HTMLFormControlsCollection
- api.HTMLFormElement
- api.HTMLFrameElement
- api.HTMLFrameSetElement
- api.HTMLHeadElement
- api.HTMLHeadingElement
- api.HTMLHRElement
- api.HTMLHtmlElement
- api.HTMLIFrameElement
- api.HTMLImageElement
- api.HTMLInputElement
- api.HTMLLabelElement
- api.HTMLLegendElement
- api.HTMLLIElement
- api.HTMLLinkElement
- api.HTMLMapElement
- api.HTMLMarqueeElement
- api.HTMLMediaElement
- api.HTMLMenuElement
- api.HTMLMetaElement
- api.HTMLMeterElement
- api.HTMLModElement
- api.HTMLObjectElement
- api.HTMLOListElement
- api.HTMLOptGroupElement
- api.HTMLOptionElement
- api.HTMLOptionsCollection
- api.HTMLOutputElement
- api.HTMLParagraphElement
- api.HTMLParamElement
- api.HTMLPictureElement
- api.HTMLPortalElement
- api.HTMLPreElement
- api.HTMLProgressElement
- api.HTMLQuoteElement
- api.HTMLScriptElement
- api.HTMLSelectElement
- api.HTMLSlotElement
- api.HTMLSourceElement
- api.HTMLSpanElement
- api.HTMLStyleElement
- api.HTMLTableCaptionElement
- api.HTMLTableCellElement
- api.HTMLTableColElement
- api.HTMLTableElement
- api.HTMLTableRowElement
- api.HTMLTableSectionElement
- api.HTMLTemplateElement
- api.HTMLTextAreaElement
- api.HTMLTimeElement
- api.HTMLTitleElement
- api.HTMLTrackElement
- api.HTMLUListElement
- api.HTMLUnknownElement
- api.HTMLVideoElement
- api.IDBDatabase
- api.IDBFactory
- api.IDBOpenDBRequest
- api.IDBRequest
- api.IDBVersionChangeEvent
- api.IIRFilterNode
- api.ImageBitmap
- api.ImageCapture
- api.ImageData
- api.KeyboardEvent
- api.KHR_parallel_shader_compile
- api.Location
- api.MediaCapabilities
- api.MediaDeviceInfo
- api.MediaDevices
- api.MediaElementAudioSourceNode
- api.MediaEncryptedEvent
- api.MediaKeyMessageEvent
- api.MediaList
- api.MediaQueryListEvent
- api.MediaSession
- api.MediaSource
- api.MediaStream
- api.MediaStreamAudioDestinationNode
- api.MediaStreamAudioSourceNode
- api.MediaStreamTrack
- api.MediaStreamTrackAudioSourceNode
- api.MessageChannel
- api.MessageEvent
- api.MessagePort
- api.MimeType
- api.MimeTypeArray
- api.MouseEvent
- api.MutationEvent
- api.MutationObserver
- api.NamedNodeMap
- api.Navigator
- api.Node
- api.NodeIterator
- api.NodeList
- api.Notification
- api.NotificationEvent
- api.OES_draw_buffers_indexed
- api.OES_element_index_uint
- api.OES_fbo_render_mipmap
- api.OES_standard_derivatives
- api.OES_texture_float
- api.OES_texture_float_linear
- api.OES_texture_half_float
- api.OES_texture_half_float_linear
- api.OES_vertex_array_object
- api.OfflineAudioCompletionEvent
- api.OfflineAudioContext
- api.OscillatorNode
- api.OVR_multiview2
- api.PageTransitionEvent
- api.PannerNode
- api.Performance
- api.PerformanceEntry
- api.PerformanceMark
- api.PerformanceNavigation
- api.PerformanceResourceTiming
- api.PerformanceTiming
- api.PeriodicWave
- api.Plugin
- api.PluginArray
- api.PopStateEvent
- api.ProcessingInstruction
- api.PushEvent
- api.RadioNodeList
- api.Range
- api.Request
- api.Response
- api.RTCDataChannel
- api.RTCDataChannelEvent
- api.RTCDTMFToneChangeEvent
- api.RTCPeerConnection
- api.RTCSessionDescription
- api.Screen
- api.ScriptProcessorNode
- api.SecurityPolicyViolationEvent
- api.Selection
- api.ShadowRoot
- api.SpeechRecognition
- api.SpeechRecognitionErrorEvent
- api.SpeechRecognitionEvent
- api.SpeechSynthesisErrorEvent
- api.SpeechSynthesisEvent
- api.StereoPannerNode
- api.StorageEvent
- api.StyleSheet
- api.StyleSheetList
- api.SubtleCrypto
- api.SVGAElement
- api.SVGAngle
- api.SVGAnimatedAngle
- api.SVGAnimatedBoolean
- api.SVGAnimatedEnumeration
- api.SVGAnimatedInteger
- api.SVGAnimatedLength
- api.SVGAnimatedLengthList
- api.SVGAnimatedNumber
- api.SVGAnimatedNumberList
- api.SVGAnimatedPreserveAspectRatio
- api.SVGAnimatedRect
- api.SVGAnimatedString
- api.SVGAnimatedTransformList
- api.SVGAnimateElement
- api.SVGAnimateMotionElement
- api.SVGAnimateTransformElement
- api.SVGAnimationElement
- api.SVGCircleElement
- api.SVGClipPathElement
- api.SVGComponentTransferFunctionElement
- api.SVGDefsElement
- api.SVGDescElement
- api.SVGDiscardElement
- api.SVGElement
- api.SVGEllipseElement
- api.SVGFEBlendElement
- api.SVGFEColorMatrixElement
- api.SVGFEComponentTransferElement
- api.SVGFECompositeElement
- api.SVGFEConvolveMatrixElement
- api.SVGFEDiffuseLightingElement
- api.SVGFEDisplacementMapElement
- api.SVGFEDistantLightElement
- api.SVGFEDropShadowElement
- api.SVGFEFloodElement
- api.SVGFEFuncAElement
- api.SVGFEFuncBElement
- api.SVGFEFuncGElement
- api.SVGFEFuncRElement
- api.SVGFEGaussianBlurElement
- api.SVGFEImageElement
- api.SVGFEMergeElement
- api.SVGFEMergeNodeElement
- api.SVGFEMorphologyElement
- api.SVGFEOffsetElement
- api.SVGFEPointLightElement
- api.SVGFESpecularLightingElement
- api.SVGFESpotLightElement
- api.SVGFETileElement
- api.SVGFETurbulenceElement
- api.SVGFilterElement
- api.SVGForeignObjectElement
- api.SVGGElement
- api.SVGGeometryElement
- api.SVGGradientElement
- api.SVGGraphicsElement
- api.SVGImageElement
- api.SVGLength
- api.SVGLengthList
- api.SVGLinearGradientElement
- api.SVGLineElement
- api.SVGMarkerElement
- api.SVGMaskElement
- api.SVGMetadataElement
- api.SVGMPathElement
- api.SVGNumber
- api.SVGNumberList
- api.SVGPathElement
- api.SVGPatternElement
- api.SVGPointList
- api.SVGPolygonElement
- api.SVGPolylineElement
- api.SVGPreserveAspectRatio
- api.SVGRadialGradientElement
- api.SVGRectElement
- api.SVGScriptElement
- api.SVGSetElement
- api.SVGStopElement
- api.SVGStringList
- api.SVGStyleElement
- api.SVGSVGElement
- api.SVGSwitchElement
- api.SVGSymbolElement
- api.SVGTextContentElement
- api.SVGTextElement
- api.SVGTextPathElement
- api.SVGTextPositioningElement
- api.SVGTitleElement
- api.SVGTransform
- api.SVGTransformList
- api.SVGTSpanElement
- api.SVGUseElement
- api.SVGViewElement
- api.Text
- api.TextDecoder
- api.TextEncoder
- api.TextMetrics
- api.TextTrack
- api.TextTrackCue
- api.TextTrackCueList
- api.TextTrackList
- api.TimeRanges
- api.TouchEvent
- api.TrackEvent
- api.TransitionEvent
- api.TreeWalker
- api.UIEvent
- api.URL
- api.ValidityState
- api.VideoTrack
- api.VideoTrackList
- api.VTTCue
- api.WaveShaperNode
- api.WEBGL_blend_equation_advanced_coherent
- api.WEBGL_color_buffer_float
- api.WEBGL_compressed_texture_astc
- api.WEBGL_compressed_texture_etc
- api.WEBGL_compressed_texture_etc1
- api.WEBGL_compressed_texture_pvrtc
- api.WEBGL_compressed_texture_s3tc
- api.WEBGL_compressed_texture_s3tc_srgb
- api.WEBGL_debug_renderer_info
- api.WEBGL_debug_shaders
- api.WEBGL_depth_texture
- api.WEBGL_draw_buffers
- api.WEBGL_draw_instanced_base_vertex_base_instance
- api.WEBGL_lose_context
- api.WEBGL_multi_draw
- api.WEBGL_multi_draw_instanced_base_vertex_base_instance
- api.WebGL2RenderingContext
- api.WebGLContextEvent
- api.WebGLRenderingContext
- api.WebGLTimerQueryEXT
- api.WebGLVertexArrayObjectOES
- api.WebSocket
- api.WheelEvent
- api.Window
- api.WorkerGlobalScope
- api.WorkerLocation
- api.WorkerNavigator
- api.WritableStreamDefaultController
- api.WritableStreamDefaultWriter
- api.XMLHttpRequest
- api.XMLHttpRequestEventTarget
- api.XMLHttpRequestUpload
- api.XPathExpression
- api.XPathResult
- api.crypto
- css.properties.custom-property
- javascript.builtins.AggregateError.AggregateError
- javascript.builtins.Array.Array
- javascript.builtins.ArrayBuffer.ArrayBuffer
- javascript.builtins.BigInt.BigInt
- javascript.builtins.BigInt64Array.BigInt64Array
- javascript.builtins.BigUint64Array.BigUint64Array
- javascript.builtins.Boolean.Boolean
- javascript.builtins.DataView.DataView
- javascript.builtins.Date.Date
- javascript.builtins.Error.Error
- javascript.builtins.EvalError.EvalError
- javascript.builtins.FinalizationRegistry.FinalizationRegistry
- javascript.builtins.Float32Array.Float32Array
- javascript.builtins.Float64Array.Float64Array
- javascript.builtins.Function.Function
- javascript.builtins.Int16Array.Int16Array
- javascript.builtins.Int32Array.Int32Array
- javascript.builtins.Int8Array.Int8Array
- javascript.builtins.InternalError.InternalError
- javascript.builtins.Map.Map
- javascript.builtins.Number.Number
- javascript.builtins.Object.Object
- javascript.builtins.Promise.Promise
- javascript.builtins.Proxy.Proxy
- javascript.builtins.RangeError.RangeError
- javascript.builtins.ReferenceError.ReferenceError
- javascript.builtins.RegExp.RegExp
- javascript.builtins.Set.Set
- javascript.builtins.SharedArrayBuffer.SharedArrayBuffer
- javascript.builtins.String.String
- javascript.builtins.Symbol.Symbol
- javascript.builtins.SyntaxError.SyntaxError
- javascript.builtins.TypeError.TypeError
- javascript.builtins.URIError.URIError
- javascript.builtins.Uint16Array.Uint16Array
- javascript.builtins.Uint32Array.Uint32Array
- javascript.builtins.Uint8Array.Uint8Array
- javascript.builtins.Uint8ClampedArray.Uint8ClampedArray
- javascript.builtins.WeakMap.WeakMap
- javascript.builtins.WeakRef.WeakRef
- javascript.builtins.WeakSet.WeakSet
- javascript.builtins.Intl.Collator.Collator
- javascript.builtins.Intl.DateTimeFormat.DateTimeFormat
- javascript.builtins.Intl.DisplayNames.DisplayNames
- javascript.builtins.Intl.ListFormat.ListFormat
- javascript.builtins.Intl.Locale.Locale
- javascript.builtins.Intl.NumberFormat.NumberFormat
- javascript.builtins.Intl.PluralRules.PluralRules
- javascript.builtins.Intl.RelativeTimeFormat.RelativeTimeFormat
- javascript.builtins.WebAssembly.CompileError.CompileError
- javascript.builtins.WebAssembly.Global.Global
- javascript.builtins.WebAssembly.LinkError.LinkError
- javascript.builtins.WebAssembly.Memory.Memory
- javascript.builtins.WebAssembly.RuntimeError.RuntimeError
- javascript.builtins.WebAssembly.Table.Table

### Commits

- Remove unreachable code in build.js ([#1787](https://github.com/foolip/mdn-bcd-collector/pull/1787))
- Remove no-longer-needed dict-arg-default rule ignore ([#1788](https://github.com/foolip/mdn-bcd-collector/pull/1788))
- Add support for wildcard exposures ([#1756](https://github.com/foolip/mdn-bcd-collector/pull/1756))
- Make sure to include collector version in exporter.getReportMeta ([#1783](https://github.com/foolip/mdn-bcd-collector/pull/1783))
- Remove MediaStreamTrackProcessor custom IDL ([#1776](https://github.com/foolip/mdn-bcd-collector/pull/1776))
- Update wording for find-missing-features' direction argument ([#1701](https://github.com/foolip/mdn-bcd-collector/pull/1701))
- Update Attr API custom test ([#1714](https://github.com/foolip/mdn-bcd-collector/pull/1714))
- Add IDL for missing features in BCD ([#1715](https://github.com/foolip/mdn-bcd-collector/pull/1715))
- Add @@iterator symbol on maplike and setlike interfaces ([#1718](https://github.com/foolip/mdn-bcd-collector/pull/1718))
- Simplify code to check for double-run of test exposures ([#1703](https://github.com/foolip/mdn-bcd-collector/pull/1703))
- Format code on page using highlight.js ([#1676](https://github.com/foolip/mdn-bcd-collector/pull/1676))
- Handle Android WebView 4.4.3 in ua-parser ([#1681](https://github.com/foolip/mdn-bcd-collector/pull/1681))
- Load JSON3 polyfill only when needed ([#1690](https://github.com/foolip/mdn-bcd-collector/pull/1690))
- Prevent tests from starting twice ([#1695](https://github.com/foolip/mdn-bcd-collector/pull/1695))
- Use original formatting from custom tests; don't run Prettier in build.js ([#1584](https://github.com/foolip/mdn-bcd-collector/pull/1584))
- bcd.testConstructor(): account for Opera's error message ([#1671](https://github.com/foolip/mdn-bcd-collector/pull/1671))
- Add test for CanvasRenderingContext2D.drawFocusIfNeeded.path_parameter ([#1656](https://github.com/foolip/mdn-bcd-collector/pull/1656))
- Simplify test for CanvasRenderingContext2D.drawImage.SVGImageElement_source_image ([#1655](https://github.com/foolip/mdn-bcd-collector/pull/1655))
- Update IIRFilter + MediaStreamAudioDestinationNode custom tests ([#1643](https://github.com/foolip/mdn-bcd-collector/pull/1643))
- Update tests for TextDecoder/TextEncoder ([#1636](https://github.com/foolip/mdn-bcd-collector/pull/1636))
- Add custom test for PerformanceResourceTiming API ([#1635](https://github.com/foolip/mdn-bcd-collector/pull/1635))
- Rename api.BaseAudioContext.decodeAudioData.promise_syntax -&gt; returns_promise ([#1634](https://github.com/foolip/mdn-bcd-collector/pull/1634))
- Fix test for ImageCapture interface ([#1615](https://github.com/foolip/mdn-bcd-collector/pull/1615))
- Add custom IDL for webkit-prefixed Touch attributes ([#1587](https://github.com/foolip/mdn-bcd-collector/pull/1587))
- Fix add-new-bcd ([#1600](https://github.com/foolip/mdn-bcd-collector/pull/1600))
- Fix reusable instances code display ([#1583](https://github.com/foolip/mdn-bcd-collector/pull/1583))
- Fix custom IDL export ([#1594](https://github.com/foolip/mdn-bcd-collector/pull/1594))
- Ignore Safari backported releases ([#1572](https://github.com/foolip/mdn-bcd-collector/pull/1572))
- Keep UA parse results specific to the request, not the app ([#1578](https://github.com/foolip/mdn-bcd-collector/pull/1578))
- Catch errors when passing return value within a callback ([#1580](https://github.com/foolip/mdn-bcd-collector/pull/1580))
- Fix ignore on Edge 15 ([#1581](https://github.com/foolip/mdn-bcd-collector/pull/1581))

## v4.0.0

- Fix styling for inputs and light background ([#1571](https://github.com/foolip/mdn-bcd-collector/pull/1571))
- Limit deploy action to only run one at a time ([#1570](https://github.com/foolip/mdn-bcd-collector/pull/1570))
- Map WindowOrWorkerGlobalScope members to \_globals folder ([#1558](https://github.com/foolip/mdn-bcd-collector/pull/1558))
- Update URLs to Web IDL ([#1549](https://github.com/foolip/mdn-bcd-collector/pull/1549))
- Use NodeGit's Revwalk to generate the changelog ([#1539](https://github.com/foolip/mdn-bcd-collector/pull/1539))
- Create release preparation script ([#1513](https://github.com/foolip/mdn-bcd-collector/pull/1513))
- Add custom tests for HTMLFormControlsCollection and RadioNodeList ([#1528](https://github.com/foolip/mdn-bcd-collector/pull/1528))
- Create a changelog ([#1514](https://github.com/foolip/mdn-bcd-collector/pull/1514))
- Ignore Deno by default in find-missing-results script ([#1535](https://github.com/foolip/mdn-bcd-collector/pull/1535))
- Add custom test for TextMetrics API ([#1534](https://github.com/foolip/mdn-bcd-collector/pull/1534))
- Remove insufficient tests for document.createElement() options ([#1508](https://github.com/foolip/mdn-bcd-collector/pull/1508))
- Use WebKitMutationObserver to create a MutationObserver instance ([#1511](https://github.com/foolip/mdn-bcd-collector/pull/1511))
- Fix test for XPathResult in old Firefox versions ([#1507](https://github.com/foolip/mdn-bcd-collector/pull/1507))
- Sass it up! Convert styling to SCSS ([#1502](https://github.com/foolip/mdn-bcd-collector/pull/1502))
- Add a type string for more event constructors ([#1489](https://github.com/foolip/mdn-bcd-collector/pull/1489))
- Add documentation for how to review changes from the collector ([#1436](https://github.com/foolip/mdn-bcd-collector/pull/1436))
- Add a privacy notice to homepage ([#1499](https://github.com/foolip/mdn-bcd-collector/pull/1499))
- Add custom test for HTMLOptionsCollection ([#1497](https://github.com/foolip/mdn-bcd-collector/pull/1497))
- Convert from CJS to ESM ([#1475](https://github.com/foolip/mdn-bcd-collector/pull/1475))

## v3.3.1

- Automatically tag new releases ([#1484](https://github.com/foolip/mdn-bcd-collector/pull/1484))
- Add RTCSessionDescription test; fix RTCDTMFToneChangeEvent ([#1488](https://github.com/foolip/mdn-bcd-collector/pull/1488))

## v3.3.0

- Add required request parameter to FetchEvent constructor ([#1481](https://github.com/foolip/mdn-bcd-collector/pull/1481))
- Send the right tests to SharedWorker and ServiceWorker ([#1479](https://github.com/foolip/mdn-bcd-collector/pull/1479))
- Use document.fonts or self.fonts as FontFaceSet instance ([#1474](https://github.com/foolip/mdn-bcd-collector/pull/1474))
- Remove custom test for api.Document.documentURI.readonly ([#1471](https://github.com/foolip/mdn-bcd-collector/pull/1471))
- Add comment explaining RTCPeerConnection constructor order ([#1470](https://github.com/foolip/mdn-bcd-collector/pull/1470))
- Fix custom test for RTCPeerConnection ([#1469](https://github.com/foolip/mdn-bcd-collector/pull/1469))
- Add .nvmrc ([#1468](https://github.com/foolip/mdn-bcd-collector/pull/1468))
- Revert "Create custom test for RTCRtpReceiver" ([#1464](https://github.com/foolip/mdn-bcd-collector/pull/1464))
- Simplify window.crypto custom test ([#1465](https://github.com/foolip/mdn-bcd-collector/pull/1465))
- Update custom test for ImageData ([#1461](https://github.com/foolip/mdn-bcd-collector/pull/1461))
- Change Vinyl's username on footer to match rebranding ([#1460](https://github.com/foolip/mdn-bcd-collector/pull/1460))
- Create custom test for RTCRtpReceiver ([#1459](https://github.com/foolip/mdn-bcd-collector/pull/1459))
- Create custom tests for DOMTokenList ([#1458](https://github.com/foolip/mdn-bcd-collector/pull/1458))
- Fix Safari bug for window.crypto ([#1457](https://github.com/foolip/mdn-bcd-collector/pull/1457))
- Remove stray semicolon ([#1456](https://github.com/foolip/mdn-bcd-collector/pull/1456))

## v3.2.12

- Add back PaymentAddress as custom IDL

## v3.2.11

- Reorganize custom IDL by spec affinity ([#1441](https://github.com/foolip/mdn-bcd-collector/pull/1441))
- Remove navigator.canShare() custom IDL
- testConstructor: add catch for Safari's "Can't find variable" error ([#1434](https://github.com/foolip/mdn-bcd-collector/pull/1434))
- Add custom test for DOMTokenList.toggle.force_parameter ([#1433](https://github.com/foolip/mdn-bcd-collector/pull/1433))
- Add custom test for SVGAnimatedString ([#1432](https://github.com/foolip/mdn-bcd-collector/pull/1432))
- Ignore .DS_Store ([#1431](https://github.com/foolip/mdn-bcd-collector/pull/1431))
- Format comments in custom tests to ensure they remain on their own line ([#1430](https://github.com/foolip/mdn-bcd-collector/pull/1430))
- Fix the comment for RTCPeerConnection ([#1429](https://github.com/foolip/mdn-bcd-collector/pull/1429))
- Fix import in add-new-bcd ([#1427](https://github.com/foolip/mdn-bcd-collector/pull/1427))
- Add comment explaining the RTCPeerConnection constructor test ([#1426](https://github.com/foolip/mdn-bcd-collector/pull/1426))

## v3.2.10

- Use performance.getEntries() to get PerformanceEntry instance ([#1417](https://github.com/foolip/mdn-bcd-collector/pull/1417))
- Addressing Lighthouse audit report ([#1411](https://github.com/foolip/mdn-bcd-collector/pull/1411))
- Add initWebKitAnimationEvent and initWebKitTransitionEvent tests ([#1415](https://github.com/foolip/mdn-bcd-collector/pull/1415))
- Fix test for RTCPeerConnection ([#1409](https://github.com/foolip/mdn-bcd-collector/pull/1409))
- Make testConstructor able to test constructor objects ([#1408](https://github.com/foolip/mdn-bcd-collector/pull/1408))
- Updates for event custom tests ([#1405](https://github.com/foolip/mdn-bcd-collector/pull/1405))
- Account for Opera Presto error ([#1404](https://github.com/foolip/mdn-bcd-collector/pull/1404))

## v3.2.9

- Fix results URL generation ([#1402](https://github.com/foolip/mdn-bcd-collector/pull/1402))

## v3.2.8

- Bug fixes ([#1400](https://github.com/foolip/mdn-bcd-collector/pull/1400))

## v3.2.7

- Revert documentURI after testing api.Document.documentURI.readonly ([#1398](https://github.com/foolip/mdn-bcd-collector/pull/1398))

## v3.2.6

- Use console.log vs. updateStatus for completion logs ([#1396](https://github.com/foolip/mdn-bcd-collector/pull/1396))
- Fix cryptoKey instance ([#1395](https://github.com/foolip/mdn-bcd-collector/pull/1395))
- Fix new debugmode logging ([#1394](https://github.com/foolip/mdn-bcd-collector/pull/1394))
- Add further debug logging in debug mode ([#1393](https://github.com/foolip/mdn-bcd-collector/pull/1393))
- Fix odd bug with older browsers trying to post results to example.org ([#1392](https://github.com/foolip/mdn-bcd-collector/pull/1392))

## v3.2.5

- Custom test updates ([#1390](https://github.com/foolip/mdn-bcd-collector/pull/1390))
- Further synchronize ESLint and Prettier (and format remaining files) ([#1389](https://github.com/foolip/mdn-bcd-collector/pull/1389))
- Synchronize ESLint and Prettier rules ([#1388](https://github.com/foolip/mdn-bcd-collector/pull/1388))
- Fix find-missing-releases ([#1387](https://github.com/foolip/mdn-bcd-collector/pull/1387))
- Add .prettierrc file ([#1386](https://github.com/foolip/mdn-bcd-collector/pull/1386))
- Add find-missing-results ([#1385](https://github.com/foolip/mdn-bcd-collector/pull/1385))
- Add debug mode console logs ([#1384](https://github.com/foolip/mdn-bcd-collector/pull/1384))
- Make Plugin test inconclusive if navigator.plugins is empty ([#1377](https://github.com/foolip/mdn-bcd-collector/pull/1377))
- Add instances for XMLHttpRequestEventTarget and XMLHttpRequestUpload ([#1376](https://github.com/foolip/mdn-bcd-collector/pull/1376))

## v3.2.4

- Add a type string for most event constructors ([#1375](https://github.com/foolip/mdn-bcd-collector/pull/1375))
- Remove ^ from package.json ([#1379](https://github.com/foolip/mdn-bcd-collector/pull/1379))
- Add more custom tests ([#1367](https://github.com/foolip/mdn-bcd-collector/pull/1367))
- Add/update custom tests ([#1364](https://github.com/foolip/mdn-bcd-collector/pull/1364))
- Convert custom-tests.json to YAML (for multiline formatting) ([#1358](https://github.com/foolip/mdn-bcd-collector/pull/1358))
- Fix custom test for Notification API ([#1357](https://github.com/foolip/mdn-bcd-collector/pull/1357))
- Fix test for XPathResult ([#1355](https://github.com/foolip/mdn-bcd-collector/pull/1355))
- Add additional additional for several APIs ([#1347](https://github.com/foolip/mdn-bcd-collector/pull/1347))
- Improve test for WebSocket API ([#1346](https://github.com/foolip/mdn-bcd-collector/pull/1346))

## v3.2.3

- Add a test for Object.hasOwn() ([#1342](https://github.com/foolip/mdn-bcd-collector/pull/1342))
- Combine results from different reports for the same browser version ([#1340](https://github.com/foolip/mdn-bcd-collector/pull/1340))
- Simplify getSupportMap by ignoring URL ([#1339](https://github.com/foolip/mdn-bcd-collector/pull/1339))
- Correct preference for fake Firefox media stream ([#1333](https://github.com/foolip/mdn-bcd-collector/pull/1333))
- Simplify getSupportMap to use bare values, not {result: ...} ([#1332](https://github.com/foolip/mdn-bcd-collector/pull/1332))
- Fix tests for WritableStreamDefaultController/Writer ([#1324](https://github.com/foolip/mdn-bcd-collector/pull/1324))
- Remove mapping of console-&gt;Console ([#1326](https://github.com/foolip/mdn-bcd-collector/pull/1326))
- Fix variable names in custom tests to avoid "interface" ([#1323](https://github.com/foolip/mdn-bcd-collector/pull/1323))

## v3.2.2

- Revert "Update lockfile version to 2" ([#1321](https://github.com/foolip/mdn-bcd-collector/pull/1321))
- Ignore user media tests on Firefox 34-52 ([#1319](https://github.com/foolip/mdn-bcd-collector/pull/1319))
- Update lockfile version to 2 ([#1317](https://github.com/foolip/mdn-bcd-collector/pull/1317))
- Cover inherited attributes ([#1318](https://github.com/foolip/mdn-bcd-collector/pull/1318))
- Add instrumentKey custom IDL ([#1314](https://github.com/foolip/mdn-bcd-collector/pull/1314))

## v3.2.1

- Add tests for some JavaScript alt. names. in BCD ([#1313](https://github.com/foolip/mdn-bcd-collector/pull/1313))
- Remove Function.prototype.displayName test ([#1311](https://github.com/foolip/mdn-bcd-collector/pull/1311))

## v3.2.0

- Remove tests for columnNumber/fileName/lineNumber ([#1310](https://github.com/foolip/mdn-bcd-collector/pull/1310))
- Generate test for JavaScript constructors ([#1307](https://github.com/foolip/mdn-bcd-collector/pull/1307))
- Generate tests for property symbols (@@ features) ([#1306](https://github.com/foolip/mdn-bcd-collector/pull/1306))
- Generate tests for JavaScript builtins ([#1302](https://github.com/foolip/mdn-bcd-collector/pull/1302))

## v3.1.11

- Add back custom IDL now gone from @webref/idl ([#1300](https://github.com/foolip/mdn-bcd-collector/pull/1300))
- Add MutationEvent instance (document.createEvent('MutationEvent')) ([#1297](https://github.com/foolip/mdn-bcd-collector/pull/1297))
- Add custom tests for WritableStreamDefaultController/Writer ([#1295](https://github.com/foolip/mdn-bcd-collector/pull/1295))
- Update UA parser to better handle iOS browsers ([#1290](https://github.com/foolip/mdn-bcd-collector/pull/1290))
- Enable fake media stream for Firefox in Selenium script ([#1289](https://github.com/foolip/mdn-bcd-collector/pull/1289))
- Custom tests: replace variable assignments as well ([#1288](https://github.com/foolip/mdn-bcd-collector/pull/1288))

## v3.1.10

- Add IDs for export buttons ([#1282](https://github.com/foolip/mdn-bcd-collector/pull/1282))
- Fix Firefox collection regarding new WebKitAnimationEvent test ([#1280](https://github.com/foolip/mdn-bcd-collector/pull/1280))
- Add custom test for WebGLRenderingContext ([#1279](https://github.com/foolip/mdn-bcd-collector/pull/1279))
- Increase the verbosity of errors in results parsing ([#1278](https://github.com/foolip/mdn-bcd-collector/pull/1278))
- More Selenium script updates ([#1277](https://github.com/foolip/mdn-bcd-collector/pull/1277))
- Selenium script updates ([#1276](https://github.com/foolip/mdn-bcd-collector/pull/1276))

## v3.1.9

- Remove custom IDL now in @webref/idl

## v3.1.8

- Add a --path argument to filter BCD paths by wildcards ([#1245](https://github.com/foolip/mdn-bcd-collector/pull/1245))
- Use &lt;b&gt; as a HTMLElement instance (not HTMLUnknownElement) ([#1253](https://github.com/foolip/mdn-bcd-collector/pull/1253))
- Use window.toolbar as a BarProp instance ([#1252](https://github.com/foolip/mdn-bcd-collector/pull/1252))
- Add more tests for (WebKit- or unprefixed) AnimationEvent/TransitionEvent ([#1251](https://github.com/foolip/mdn-bcd-collector/pull/1251))
- Tweak some custom tests for consistency ([#1250](https://github.com/foolip/mdn-bcd-collector/pull/1250))
- Add custom IDL for webkit-prefixed Pointer Lock API ([#1249](https://github.com/foolip/mdn-bcd-collector/pull/1249))
- Add custom code for MouseEvent instance ([#1248](https://github.com/foolip/mdn-bcd-collector/pull/1248))
- Add custom code for WheelEvent instance ([#1247](https://github.com/foolip/mdn-bcd-collector/pull/1247))
- Add RTCPeerConnection instance with prefixed variants ([#1246](https://github.com/foolip/mdn-bcd-collector/pull/1246))

## v3.1.7

- Remove custom SourceBuffer.changeType now in @webref/idl
- Fix Performance\* custom tests ([#1238](https://github.com/foolip/mdn-bcd-collector/pull/1238))
- Create an instance for XMLHttpRequest tests ([#1237](https://github.com/foolip/mdn-bcd-collector/pull/1237))
- Fix the fallback for creating an Event instance ([#1236](https://github.com/foolip/mdn-bcd-collector/pull/1236))
- Always show form buttons, but disable by default ([#1231](https://github.com/foolip/mdn-bcd-collector/pull/1231))

## v3.1.6

- Test for crypto.webkitSubtle and use it as a SubtleCrypto instance ([#1219](https://github.com/foolip/mdn-bcd-collector/pull/1219))
- Simplify subtle.crypto custom test instance ([#1216](https://github.com/foolip/mdn-bcd-collector/pull/1216))
- Add custom test instance for WorkerLocation ([#1211](https://github.com/foolip/mdn-bcd-collector/pull/1211))
- Update custom test for ProcessingInstruction ([#1210](https://github.com/foolip/mdn-bcd-collector/pull/1210))
- Get a DOMException instance from a thrown exception ([#1192](https://github.com/foolip/mdn-bcd-collector/pull/1192))

## v3.1.5

- Fix http-&gt;https ([#1205](https://github.com/foolip/mdn-bcd-collector/pull/1205))
- Improve MediaStream tests for camera-less devices ([#1203](https://github.com/foolip/mdn-bcd-collector/pull/1203))
- Document how to diff tests in the release process ([#1201](https://github.com/foolip/mdn-bcd-collector/pull/1201))
- Revert "Add reusable instances of Worker and SharedWorker" ([#1202](https://github.com/foolip/mdn-bcd-collector/pull/1202))
- Add reusable instances of Worker and SharedWorker ([#1200](https://github.com/foolip/mdn-bcd-collector/pull/1200))
- Fix custom test for ProcessingInstruction API ([#1198](https://github.com/foolip/mdn-bcd-collector/pull/1198))
- Selenium: don't try to test Safari 14.0 in BrowserStack ([#1197](https://github.com/foolip/mdn-bcd-collector/pull/1197))
- Add custom test for WebGLVertexArrayObjectOES API ([#1195](https://github.com/foolip/mdn-bcd-collector/pull/1195))
- Use navigator as the WorkerNavigator instance ([#1194](https://github.com/foolip/mdn-bcd-collector/pull/1194))

## v3.1.4

- Test SVGElement using a &lt;title&gt; element instance ([#1189](https://github.com/foolip/mdn-bcd-collector/pull/1189))

## v3.1.3

- Document the manual release process
- Fix SVGFEFuncAlement typo in SVGComponentTransferFunctionElement test ([#1179](https://github.com/foolip/mdn-bcd-collector/pull/1179))
- Avoid external URL in FontFace source ([#1172](https://github.com/foolip/mdn-bcd-collector/pull/1172))
- Avoid hardcoded appspot.com URLs in custom tests ([#1170](https://github.com/foolip/mdn-bcd-collector/pull/1170))
- Update UA parser to handle old Android WebView versions ([#1162](https://github.com/foolip/mdn-bcd-collector/pull/1162))

## v3.1.2

- Add custom IDL for webkitSlice ([#1169](https://github.com/foolip/mdn-bcd-collector/pull/1169))
- Add custom IDL for zoomAndPan attributes ([#1166](https://github.com/foolip/mdn-bcd-collector/pull/1166))

## v3.1.1

- Update a few URLs to master branches already renamed to main ([#1159](https://github.com/foolip/mdn-bcd-collector/pull/1159))
- Add custom IDL for payment APIs still shipping in Chrome
- Remove outerText custom IDL now in webref

## v3.1.0

- Add custom IDL for createEncodedStreams() methods ([#1147](https://github.com/foolip/mdn-bcd-collector/pull/1147))
- Remove Sanitizer API custom IDL now in webref
- Remove web-animations-2 custom IDL now in webref
- Stop using CSS.supports for CSS property tests ([#1132](https://github.com/foolip/mdn-bcd-collector/pull/1132))
- Remove '&&' combinator in compileTest calls where not needed ([#1131](https://github.com/foolip/mdn-bcd-collector/pull/1131))
- Use webkitSpeechRecognition to test SpeechRecognition members ([#1130](https://github.com/foolip/mdn-bcd-collector/pull/1130))

## v3.0.2

- Drop support for [Constructor] extended attribute ([#1124](https://github.com/foolip/mdn-bcd-collector/pull/1124))
- Once again validate custom IDL ([#1122](https://github.com/foolip/mdn-bcd-collector/pull/1122))
- Fix BluetoothGATTRemoteServer unknown type (renamed) ([#1118](https://github.com/foolip/mdn-bcd-collector/pull/1118))
- Check for all duplicates (not just operations) in mergeMembers ([#1117](https://github.com/foolip/mdn-bcd-collector/pull/1117))
- Remove some types from the ignore list, fixing remaining issues ([#1116](https://github.com/foolip/mdn-bcd-collector/pull/1116))

## v3.0.1

- Add back initWheelEvent as custom IDL ([#1100](https://github.com/foolip/mdn-bcd-collector/pull/1100))
- Update button/select/submit styling ([#1092](https://github.com/foolip/mdn-bcd-collector/pull/1092))

## v3.0.0

- Make update-bcd more conservative about updating existing data ([#1088](https://github.com/foolip/mdn-bcd-collector/pull/1088))
- Remove unused support for update-bcd to updated prefixed entries ([#1087](https://github.com/foolip/mdn-bcd-collector/pull/1087))
- Remove custom tests around AudioScheduledSourceNode ([#1076](https://github.com/foolip/mdn-bcd-collector/pull/1076))
- Adapt to @webref/idl 1.0.11
- Add custom IDL for webkitCreateShadowRoot() ([#1080](https://github.com/foolip/mdn-bcd-collector/pull/1080))
- Add required arguments to createPeriodicWave custom test ([#1077](https://github.com/foolip/mdn-bcd-collector/pull/1077))
- Use a AudioBufferSourceNode instance to test AudioScheduledSourceNode ([#1074](https://github.com/foolip/mdn-bcd-collector/pull/1074))
- Add ms-prefixed APIs based on find-missing output ([#1072](https://github.com/foolip/mdn-bcd-collector/pull/1072))
- Add a --include-aliases option to the find-missing script ([#1071](https://github.com/foolip/mdn-bcd-collector/pull/1071))
- Add custom IDL for navigator.mozBattery/webkitBattery ([#1069](https://github.com/foolip/mdn-bcd-collector/pull/1069))
- Support running a HTTPS server locally with a custom certificate ([#1046](https://github.com/foolip/mdn-bcd-collector/pull/1046))
- Simplify code and resources in tests.json ([#1063](https://github.com/foolip/mdn-bcd-collector/pull/1063))
- Simplify compileTest internally ([#1062](https://github.com/foolip/mdn-bcd-collector/pull/1062))
- Remove the test category from tests.json ([#1061](https://github.com/foolip/mdn-bcd-collector/pull/1061))
- Fix typo in SVGHKernElement custom IDL ([#1055](https://github.com/foolip/mdn-bcd-collector/pull/1055))
- Add --release argument (filter) for update-bcd.js ([#1019](https://github.com/foolip/mdn-bcd-collector/pull/1019))
- Simplify how custom IDL is loaded/parsed ([#1048](https://github.com/foolip/mdn-bcd-collector/pull/1048))
- Use @webref/css package for CSS property list ([#1047](https://github.com/foolip/mdn-bcd-collector/pull/1047))
- Add more custom IDL ([#1044](https://github.com/foolip/mdn-bcd-collector/pull/1044))
- Clarify where to get the collector results from ([#1043](https://github.com/foolip/mdn-bcd-collector/pull/1043))
- Add more custom IDL ([#1039](https://github.com/foolip/mdn-bcd-collector/pull/1039))
- Let update-bcd script use ../mdn-bcd-results/ by default ([#1024](https://github.com/foolip/mdn-bcd-collector/pull/1024))
- Document how to use the update-bcd script ([#1020](https://github.com/foolip/mdn-bcd-collector/pull/1020))
- Document the design of update-bcd.js (not how to use it) ([#1021](https://github.com/foolip/mdn-bcd-collector/pull/1021))
- Undo some unsightly Prettier formatting ([#1018](https://github.com/foolip/mdn-bcd-collector/pull/1018))
- Restore getUserMedia() for custom tests and skip them in Edge 12-18 ([#1017](https://github.com/foolip/mdn-bcd-collector/pull/1017))
- Move ignore (test filtering) logic in getTests ([#1016](https://github.com/foolip/mdn-bcd-collector/pull/1016))
- Add custom IDL for XMLSerializer.serializeToStream method ([#1012](https://github.com/foolip/mdn-bcd-collector/pull/1012))

## v2.0.1

- Use compare-versions in selenium.js ([#1009](https://github.com/foolip/mdn-bcd-collector/pull/1009))
- Avoid calling getUserMedia() in custom tests ([#1008](https://github.com/foolip/mdn-bcd-collector/pull/1008))
- Update the Sauce Labs sample config to one that works ([#1006](https://github.com/foolip/mdn-bcd-collector/pull/1006))
- Increase Selenium timeouts to 30s ([#1005](https://github.com/foolip/mdn-bcd-collector/pull/1005))
- Expand on secrets.sample.json to make it easier to search/guess ([#1004](https://github.com/foolip/mdn-bcd-collector/pull/1004))

## v2.0.0

- Let selenium.js download the report instead of recreating it ([#999](https://github.com/foolip/mdn-bcd-collector/pull/999))
- Support both GET and POST for /export ([#1002](https://github.com/foolip/mdn-bcd-collector/pull/1002))
- Simply results export into a form submission and server-side logic ([#1001](https://github.com/foolip/mdn-bcd-collector/pull/1001))
- Export results to a downloadable URL by default ([#979](https://github.com/foolip/mdn-bcd-collector/pull/979))
- Document /api/get
- Remove XML-style &lt;br /&gt; self-closing tags
- Remove copyright statements from HTML files ([#993](https://github.com/foolip/mdn-bcd-collector/pull/993))
- Rename github.js to exporter.js to expand its responsibilities ([#992](https://github.com/foolip/mdn-bcd-collector/pull/992))
- Validate the payloads sent to /api/results ([#991](https://github.com/foolip/mdn-bcd-collector/pull/991))
- Send no response for /api/results ([#990](https://github.com/foolip/mdn-bcd-collector/pull/990))
- Drop the empty string prefixes from tests.json ([#985](https://github.com/foolip/mdn-bcd-collector/pull/985))
- Drop support for building prefixed variants of tests ([#984](https://github.com/foolip/mdn-bcd-collector/pull/984))
- Simplify error handling in express request handlers ([#983](https://github.com/foolip/mdn-bcd-collector/pull/983))
- Capitalize appVersion ([#982](https://github.com/foolip/mdn-bcd-collector/pull/982))
- Bring DESIGN.md more into sync with how things currently work ([#981](https://github.com/foolip/mdn-bcd-collector/pull/981))

## v1.3.3

- Remove MediaSettingsRange (dictionary) custom test ([#974](https://github.com/foolip/mdn-bcd-collector/pull/974))
- Fix some custom Web Audio API tests ([#973](https://github.com/foolip/mdn-bcd-collector/pull/973))
- Test BaseAudioContext members using an AudioContext instance ([#971](https://github.com/foolip/mdn-bcd-collector/pull/971))

## v1.3.2

- Add custom IDL for marquee event handlers still in Gecko ([#964](https://github.com/foolip/mdn-bcd-collector/pull/964))
- Switch to google-github-actions to avoid warning ([#963](https://github.com/foolip/mdn-bcd-collector/pull/963))
- Use innerHTML instead of innerText to create a Text instance ([#962](https://github.com/foolip/mdn-bcd-collector/pull/962))
- Get spec IDL from the new @webref/idl package ([#959](https://github.com/foolip/mdn-bcd-collector/pull/959))

## v1.3.1

- IE 5.5 no longer supported ([#947](https://github.com/foolip/mdn-bcd-collector/pull/947))
- Add another bucket of custom IDL ([#940](https://github.com/foolip/mdn-bcd-collector/pull/940))

## v1.3.0

- Add ever more custom IDL from Confluence ([#938](https://github.com/foolip/mdn-bcd-collector/pull/938))
- Add more custom IDL found via Confluence ([#926](https://github.com/foolip/mdn-bcd-collector/pull/926))
- Update webref IDL ([#935](https://github.com/foolip/mdn-bcd-collector/pull/935))
- Expand on custom prefixed interface tests ([#931](https://github.com/foolip/mdn-bcd-collector/pull/931))
- Use prefixed webkitOfflineAudioContext if possible
- Fix AudioContext custom tests (use prefixed for members)
- Avoid generating extra tests for readonly setlike/maplike ([#928](https://github.com/foolip/mdn-bcd-collector/pull/928))
- Add missing forEach member test for IDL setlike declarations ([#927](https://github.com/foolip/mdn-bcd-collector/pull/927))
- Add custom IDL for more things found via Confluence ([#923](https://github.com/foolip/mdn-bcd-collector/pull/923))
- Generate tests for event interfaces
- Add custom CSS/IDL for things found via Confluence ([#919](https://github.com/foolip/mdn-bcd-collector/pull/919))
- Update webref ([#918](https://github.com/foolip/mdn-bcd-collector/pull/918))

## v1.2.0

- Update README about how deployment work (no `prod` branch) ([#915](https://github.com/foolip/mdn-bcd-collector/pull/915))
- Simplify some custom tests ([#914](https://github.com/foolip/mdn-bcd-collector/pull/914))
- Fix typo in the DOMRectList custom test ([#913](https://github.com/foolip/mdn-bcd-collector/pull/913))
- Add additional custom CSS properties from Confluence ([#912](https://github.com/foolip/mdn-bcd-collector/pull/912))
- Break the dependency on BCD for building tests ([#911](https://github.com/foolip/mdn-bcd-collector/pull/911))
- Trim the selenium.js BCD dependency to just browsers ([#909](https://github.com/foolip/mdn-bcd-collector/pull/909))
- Fix the custom test for SVGPointList ([#908](https://github.com/foolip/mdn-bcd-collector/pull/908))
- Add and update custom tests ([#894](https://github.com/foolip/mdn-bcd-collector/pull/894))

## v1.1.8

- Update custom tests ([#889](https://github.com/foolip/mdn-bcd-collector/pull/889))
- Improve DOMRectList and ShadowRoot custom tests ([#888](https://github.com/foolip/mdn-bcd-collector/pull/888))
- Add and improve custom tests ([#885](https://github.com/foolip/mdn-bcd-collector/pull/885))
- Use macOS Big Sur when testing with Selenium ([#882](https://github.com/foolip/mdn-bcd-collector/pull/882))

## v1.1.7

- Improve custom test for MessageChannel API ([#880](https://github.com/foolip/mdn-bcd-collector/pull/880))
- Add custom test for ImageCapture API ([#879](https://github.com/foolip/mdn-bcd-collector/pull/879))
- Fix constructor test function ([#877](https://github.com/foolip/mdn-bcd-collector/pull/877))
- Add custom test for External API ([#878](https://github.com/foolip/mdn-bcd-collector/pull/878))
- Add custom test for XPathExpression API ([#876](https://github.com/foolip/mdn-bcd-collector/pull/876))
- Update Webref ([#874](https://github.com/foolip/mdn-bcd-collector/pull/874))
- Fix typo in custom test for DOMRectList ([#873](https://github.com/foolip/mdn-bcd-collector/pull/873))
- Add custom tests for HTMLCollection and HTMLAllCollection APIs ([#872](https://github.com/foolip/mdn-bcd-collector/pull/872))
- Improve custom test for FontFace API ([#870](https://github.com/foolip/mdn-bcd-collector/pull/870))
- Add custom test for HTMLDocument API ([#869](https://github.com/foolip/mdn-bcd-collector/pull/869))
- Add custom test for URL API ([#868](https://github.com/foolip/mdn-bcd-collector/pull/868))
- Add custom tests for TextTrack and VTT APIs ([#866](https://github.com/foolip/mdn-bcd-collector/pull/866))
- Add custom test for StyleMedia API ([#865](https://github.com/foolip/mdn-bcd-collector/pull/865))
- Add custom test for MediaList API ([#864](https://github.com/foolip/mdn-bcd-collector/pull/864))
- Add custom test for NamedNodeMap API ([#863](https://github.com/foolip/mdn-bcd-collector/pull/863))
- Add custom test for DOMRectList API ([#862](https://github.com/foolip/mdn-bcd-collector/pull/862))
- Fix const attribute check ([#858](https://github.com/foolip/mdn-bcd-collector/pull/858))
- Don't generate tests for const attributes ([#856](https://github.com/foolip/mdn-bcd-collector/pull/856))
- Use local BCD repo for find-missing script ([#851](https://github.com/foolip/mdn-bcd-collector/pull/851))

## v1.1.6

- Add additional custom tests ([#849](https://github.com/foolip/mdn-bcd-collector/pull/849))
- Update custom tests ([#845](https://github.com/foolip/mdn-bcd-collector/pull/845))
- Update styling for results display ([#839](https://github.com/foolip/mdn-bcd-collector/pull/839))
- Add custom IDL for webkit-prefixed canvas APIs ([#843](https://github.com/foolip/mdn-bcd-collector/pull/843))
- Create add-new-bcd script ([#838](https://github.com/foolip/mdn-bcd-collector/pull/838))
- Add custom IDL for WebKitPoint and webkitConvertPointFrom\* methods ([#842](https://github.com/foolip/mdn-bcd-collector/pull/842))
- Remove miscapitalized entries ([#837](https://github.com/foolip/mdn-bcd-collector/pull/837))
- Rename a variable to prevent conflict ([#836](https://github.com/foolip/mdn-bcd-collector/pull/836))
- Use simplified dots for Mocha output ([#835](https://github.com/foolip/mdn-bcd-collector/pull/835))

## v1.1.5

- Fix UA parsing for Firefox 3.6 on BrowserStack ([#834](https://github.com/foolip/mdn-bcd-collector/pull/834))
- Update tests for PerformanceMark and PerformanceEntry APIs ([#833](https://github.com/foolip/mdn-bcd-collector/pull/833))
- Add additional autocapitalize custom IDL ([#832](https://github.com/foolip/mdn-bcd-collector/pull/832))
- Add prefixed variants of preservesPitch ([#831](https://github.com/foolip/mdn-bcd-collector/pull/831))
- Fix test for MediaSession API ([#829](https://github.com/foolip/mdn-bcd-collector/pull/829))
- Fix test for HTMLModElement for older Firefox versions ([#828](https://github.com/foolip/mdn-bcd-collector/pull/828))
- Fix ANGLE_instanced_arrays ([#827](https://github.com/foolip/mdn-bcd-collector/pull/827))
- Don't auto-generate custom tests for static attributes/methods ([#826](https://github.com/foolip/mdn-bcd-collector/pull/826))
- Update arguments to find-missing script ([#823](https://github.com/foolip/mdn-bcd-collector/pull/823))
- Fix Safari minimum version for Selenium ([#822](https://github.com/foolip/mdn-bcd-collector/pull/822))
- Fix PR descriptions ([#821](https://github.com/foolip/mdn-bcd-collector/pull/821))
- Add home link to footer ([#820](https://github.com/foolip/mdn-bcd-collector/pull/820))

## v1.1.4

- Update unittests ([#818](https://github.com/foolip/mdn-bcd-collector/pull/818))
- Replace Listr with Listr2 ([#817](https://github.com/foolip/mdn-bcd-collector/pull/817))
- Update custom test for MediaStream API ([#816](https://github.com/foolip/mdn-bcd-collector/pull/816))
- Add custom test for NodeList API ([#813](https://github.com/foolip/mdn-bcd-collector/pull/813))
- Map 'DedicatedWorker' as 'Worker' ([#811](https://github.com/foolip/mdn-bcd-collector/pull/811))
- Fix test for MediaSource.isTypeSupported ([#809](https://github.com/foolip/mdn-bcd-collector/pull/809))
- Include "promise.then" replacement when importing custom tests ([#810](https://github.com/foolip/mdn-bcd-collector/pull/810))
- Remove formEncType and lowSrc custom IDL ([#807](https://github.com/foolip/mdn-bcd-collector/pull/807))
- Include percentage of missing entries in find-missing output ([#805](https://github.com/foolip/mdn-bcd-collector/pull/805))
- Fix default value of browser argument in update-bcd ([#804](https://github.com/foolip/mdn-bcd-collector/pull/804))
- Allow for filtering browsers in update-bcd ([#803](https://github.com/foolip/mdn-bcd-collector/pull/803))
- Update UA parser ([#802](https://github.com/foolip/mdn-bcd-collector/pull/802))
- Fix custom tests for HTML and SVG element APIs ([#800](https://github.com/foolip/mdn-bcd-collector/pull/800))
- Update BCD: improve ranges ([#798](https://github.com/foolip/mdn-bcd-collector/pull/798))
- Add "max-parallel: 1" to deploy step in push ([#797](https://github.com/foolip/mdn-bcd-collector/pull/797))
- Compact report JSON ([#794](https://github.com/foolip/mdn-bcd-collector/pull/794))
- Revert "Compress results JSON with GZip compression ([#791](https://github.com/foolip/mdn-bcd-collector/pull/791))" ([#793](https://github.com/foolip/mdn-bcd-collector/pull/793))
- Compress results JSON with GZip compression ([#791](https://github.com/foolip/mdn-bcd-collector/pull/791))

## v1.1.3

- Remove duplicate question mark in did-you-mean ([#788](https://github.com/foolip/mdn-bcd-collector/pull/788))
- Fix custom test for HTMLQuoteElement API ([#787](https://github.com/foolip/mdn-bcd-collector/pull/787))
- Fix test for CanvasRenderingContext2D ([#786](https://github.com/foolip/mdn-bcd-collector/pull/786))
- Update webref ([#785](https://github.com/foolip/mdn-bcd-collector/pull/785))
- Fix tests for LegacyFactoryFunction-based constructors ([#784](https://github.com/foolip/mdn-bcd-collector/pull/784))

## v1.1.2

- Improve performance for harness.js ([#782](https://github.com/foolip/mdn-bcd-collector/pull/782))
- UA parser: more lenient version matching on last version ([#781](https://github.com/foolip/mdn-bcd-collector/pull/781))

## v1.1.1

- Accommodate for old-style Firefox NS_ERROR exception ([#778](https://github.com/foolip/mdn-bcd-collector/pull/778))
- Improve error when a report has no results ([#777](https://github.com/foolip/mdn-bcd-collector/pull/777))
- Update update-bcd arguments ([#776](https://github.com/foolip/mdn-bcd-collector/pull/776))
- Fix misuse of word for "non-concurrent" Selenium argument ([#773](https://github.com/foolip/mdn-bcd-collector/pull/773))
- Fix exitOnError placement ([#772](https://github.com/foolip/mdn-bcd-collector/pull/772))

## v1.1.0

- Allow for non-consecutive Selenium runtime ([#769](https://github.com/foolip/mdn-bcd-collector/pull/769))
- Simplify order of browsers to test in Selenium script ([#768](https://github.com/foolip/mdn-bcd-collector/pull/768))
- Remove redundant timestamp in Selenium script's log() function ([#767](https://github.com/foolip/mdn-bcd-collector/pull/767))
- Add a little color to some Selenium output ([#766](https://github.com/foolip/mdn-bcd-collector/pull/766))
- Make Selenium run 5 consecutive browsers ([#765](https://github.com/foolip/mdn-bcd-collector/pull/765))
- Add TODO comment on BatteryManager custom test ([#764](https://github.com/foolip/mdn-bcd-collector/pull/764))
- Update ignore list param ([#763](https://github.com/foolip/mdn-bcd-collector/pull/763))
- Use "Dev" as version on local/staging versions ([#762](https://github.com/foolip/mdn-bcd-collector/pull/762))
- Temporarily disable using git commit as appversion ([#761](https://github.com/foolip/mdn-bcd-collector/pull/761))
- Update unittests ([#760](https://github.com/foolip/mdn-bcd-collector/pull/760))
- Upgrade Selenium to auto-hide results ([#759](https://github.com/foolip/mdn-bcd-collector/pull/759))
- Use git commit hash as version in dev/staging ([#758](https://github.com/foolip/mdn-bcd-collector/pull/758))
- Update GitHub exporting page ([#757](https://github.com/foolip/mdn-bcd-collector/pull/757))
- Disable test for BatteryManager ([#756](https://github.com/foolip/mdn-bcd-collector/pull/756))
- Include "Dev" in version if devbuild ([#754](https://github.com/foolip/mdn-bcd-collector/pull/754))
- Escape &lt;br&gt; tags when console logging status updates ([#755](https://github.com/foolip/mdn-bcd-collector/pull/755))
- Fix test for api.EventSource ([#753](https://github.com/foolip/mdn-bcd-collector/pull/753))
- Don't double-load style.css ([#752](https://github.com/foolip/mdn-bcd-collector/pull/752))

## v1.0.3

- Fix GitHub description generation ([#751](https://github.com/foolip/mdn-bcd-collector/pull/751))
- Various fixes ([#749](https://github.com/foolip/mdn-bcd-collector/pull/749))
- Increase timeout for test running ([#748](https://github.com/foolip/mdn-bcd-collector/pull/748))

## v1.0.2

- Compatibility updates ([#746](https://github.com/foolip/mdn-bcd-collector/pull/746))

## v1.0.1

- Styling updates ([#744](https://github.com/foolip/mdn-bcd-collector/pull/744))
- Fix issues with testing with promises ([#743](https://github.com/foolip/mdn-bcd-collector/pull/743))
- Selenium fixes ([#742](https://github.com/foolip/mdn-bcd-collector/pull/742))
- Revert "Use process.env.npm_package_version vs. require('./package.json').version ([#723](https://github.com/foolip/mdn-bcd-collector/pull/723))" ([#740](https://github.com/foolip/mdn-bcd-collector/pull/740))

## v1.0.0

Initial release!
