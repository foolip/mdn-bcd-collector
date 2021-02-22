# Design of the MDN browser-compat-data collector

This service is part of an effort to
[assist BCD updates with automation](https://github.com/mdn/browser-compat-data/issues/3308),
and exists to run lots of small tests in browsers to determine the support
status of a feature in a browser, and save those results. Updating BCD using
the results is not done as part of this service.

## Tests

BCD itself and webref are used to generate tests, and tests can also be
written manually. The output of a test is arbitrary JSON, which must be
interpreted with knowledge of what the test does.

### Writing custom tests

The `custom-tests.json` file is used to write custom tests for APIs and CSS properties that cannot be tested with a simple statement (for example, WebGL extensions). Custom tests are written in the following structure:

#### APIs

Each API interface is written in the following structure:

```json
"INTERFACE_NAME": {
  "__resources": ["RESOURCE_ID", ...],
  "__base": "CODE_TO_REPEAT_FOR_EVERY_TEST",
  "__test": "CODE_SPECIFIC_TO_TEST_THE_INTERFACE",
  "MEMBER": "CODE_TO_TEST_THE_MEMBER",
  "__additional": {
    "SUBFEATURE": "CODE_TO_TEST_SUBFEATURE"
  }
}
```

`__base` is the common code to access the interface, repeated across every test. This is where you create your elements and set up your environment. The instance of the interface being tested should be defined in a variable called `instance`. This will allow the build script to automatically generate tests for the instance and its members.

You can define a custom method to test the interface instance itself via `__test`. The `__test` should be a return statement that returns `true` or `false`. If no `__test` is defined, it will default to `return !!instance`.

Each member can have a custom test by defining a property as the member name. Like `__test`, it should be a return statement that returns `true` or `false`. If no custom test is defined, it will default to `return 'MEMBER' in instance`.

Note: If an interface with a `__base` has a constructor test, but a custom test isn't defined for the constructor, the code will default to normal generation.

Sometimes, tests require promises and callbacks. To define a custom test as a promise, simply create a `promise` variable in place of `instance`, and the system will automatically create a promise instead.

Certain tests may require resources, like audio or video. To allow the resources to load before running the tests, rather than create and add an element with JavaScript, we can define resources to be loaded through the `__resources` object.

Additional members and submembers can be defined using the `__additional` property. If there is a subfeature to an API or one of its members, such as "api.AudioContext.AudioContext.latencyHint", that simply cannot be defined within IDL, you can include this object and specify tests for such subfeatures.

Each test will compile into a function as follows: `function() {__base + __test/MEMBER/SUBFEATURE}`

Example:

The following JSON...

```json
{
  "api": {
    "ANGLE_instanced_arrays": {
      "__base": "var canvas = document.createElement('canvas'); var gl = canvas.getContext('webgl'); var instance = gl.getExtension('ANGLE_instanced_arrays');",
      "__test": "return canvas && instance;",
      "drawArraysInstancedANGLE": "return true && instance && 'drawArraysInstancedANGLE' in instance;"
    },
    "DOMTokenList": {
      "__additional": {
        "remove_duplicates": "var elm = document.createElement('b'); elm.className = ' foo bar foo '; elm.classList.remove('bar'); return elm.className === 'foo';"
      }
    }
  },
  "css": {}
}
```

...will compile into...

```javascript
bcd.addTest('api.ANGLE_instanced_arrays', "(function() {var canvas = document.createElement('canvas'); var gl = canvas.getContext('webgl'); var instance = gl.getExtension('ANGLE_instanced_arrays');return canvas && instance;})()", 'Window');
bcd.addTest('api.ANGLE_instanced_arrays.drawArraysInstancedANGLE', "(function() {var canvas = document.createElement('canvas'); var gl = canvas.getContext('webgl'); var instance = gl.getExtension('ANGLE_instanced_arrays');return true && instance && 'drawArraysInstancedANGLE' in instance;})()", 'Window');
bcd.addTest('api.ANGLE_instanced_arrays.drawElementsInstancedANGLE', "(function() {var canvas = document.createElement('canvas'); var gl = canvas.getContext('webgl'); var instance = gl.getExtension('ANGLE_instanced_arrays');return instance && 'drawElementsInstancedANGLE' in instance;})()", 'Window');
bcd.addTest('api.ANGLE_instanced_arrays.VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE', "(function() {var canvas = document.createElement('canvas'); var gl = canvas.getContext('webgl'); var instance = gl.getExtension('ANGLE_instanced_arrays');return instance && 'VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE' in instance;})()", 'Window');
bcd.addTest('api.ANGLE_instanced_arrays.vertexAttribDivisorANGLE', "(function() {var canvas = document.createElement('canvas'); var gl = canvas.getContext('webgl'); var instance = gl.getExtension('ANGLE_instanced_arrays');return instance && 'vertexAttribDivisorANGLE' in instance;})()", 'Window');
bcd.addTest('api.Animation', {"property":"Animation","owner":"self"}, 'Window');
...
bcd.addTest('api.DOMTokenList', {"property":"DOMTokenList","owner":"self"}, 'Window');
bcd.addTest('api.DOMTokenList.remove_duplicates', "(function() {var elm = document.createElement('b'); elm.className = ' foo bar foo '; elm.classList.remove('bar'); return elm.className === 'foo';})()", 'Window');
```

Tips: make sure to implement thorough feature checking as to not raise exceptions.

##### Resources

Certain tests may require resources, like audio or video. To allow the resources to load before running the tests, rather than create and add an element with JavaScript, we can define resources to be loaded through the `__resources` object.

```json
  "api": {
    "__resources": {
      "RESOURCE_ELEMENT_ID": {
        "type": "RESOURCE_TYPE",
        "src": [
          "PATH_TO_RESOURCE",
          "ALT_PATH_TO_RESOURCE"
        ]
      }
    }
  }
```

For each resource we wish to load, we simply define the element ID after `resource-` to assign as the object's key, specify the resource's `type` (audio, video, image, etc.), and define the `src` as an array of file paths after `/custom-tests` (or in the case of an `instance` type, code like a custom test to return the instance).

All resource files should be placed in `/static/resources/custom-tests`.

#### CSS

Each CSS property is written in the following structure:

```json
"PROPERTY_NAME": "CODE_TO_TEST_THE_PROPERTY"
```

Each test will compile into a function as follows: `function() {CODE}`

Example:

The following JSON...

```json
{
  "api": {},
  "css": {
    "properties": {
      "custom-property": "return CSS.supports('color', 'var(--foo)') || CSS.supports('color', 'env(--foo)');"
    }
  }
}
```

...will compile into...

```javascript
bcd.addTest(
  "css.properties.custom-property",
  "(function() {return CSS.supports('color', 'var(--foo)') || CSS.supports('color', 'env(--foo)');})()",
  "CSS"
);
```

Tips: make sure that all return statements will return a boolean, and implement thorough feature checking.

#### Importing code from other tests

Sometimes, some features will depend on the setup and configuration from other features, especially with APIs. To prevent repeating the same code over and over again, you can import code from other custom tests to build new ones quicker. The syntax to specify a test import is the following: `<%ident:varname%>`, where `ident` is the full identifier to import from, and `varname` is what to rename the `instance` variable from that test to.

Example:

The following JSON...

```
{
  "api": {
    "AudioContext": {
      "__base": "var instance = new (window.AudioContext || window.webkitAudioContext)();"
    },
    "AudioDestinationNode": {
      "__base": "<%api.AudioContext:audioCtx%> if (!audioCtx) {return false}; var instance = audioCtx.destination;"
    }
  }
}
```

...will compile into...

```javascript
bcd.addTest(
  "api.AudioContext",
  "(function() {var instance = new (window.AudioContext || window.webkitAudioContext)();})()",
  "Window"
);
bcd.addTest(
  "api.AudioDestinationNode",
  "(function() {var instance = new (window.AudioContext || window.webkitAudioContext)(); if (!audioCtx) {return false}; var instance = audioCtx.destination;})()",
  "Window"
);
```

Note: if the specified `ident` cannot be found, the code will be replaced with a error to throw indicating as such.

## API

HTTP endpoints under `/api/` are used to enumerate/iterate test URLs, report
results for individual tests, and finally create a report for a whole session.

### Get URL to run tests

```http
POST /api/get
```

#### Parameters

`testSelection`: BCD path for the tests to run, such as "api.Node". (optional, default to all tests)

`limitExposure`: The name of a global scope to run the tests on, such as "Window". (optional, defaults to all global scopes)

`ignore`: Comma-separated list of BCD paths to skip, such as "api.Node.baseURI". (optional)

`selenium`: Whether to hide the results when collecting results using Selenium. (optional)

#### Response

Redirects to a URL to run the tests, such as `/tests/api/Node`.

### List tests

```http
GET /api/tests
```

#### Parameters

`after`: Only list tests after the given test URL. (optional)

`limit`: The maximum number of tests to list. Defaults to all tests. (optional)

#### Response

```json
[
  "https://mdn-bcd-collector.appspot.com/bcd/api/Sensor.html",
  "http://mdn-bcd-collector.appspot.com/bcd/css/properties/dot-supports.html"
]
```

If there are no more tests an empty array is returned.

### Report results

```http
POST /api/results
```

The `Content-Type` should be `application/json` and the post body should be
an array of test results:

```json
[
  {
    "name": "api.Attr",
    "exposure": "Window",
    "result": true
  },
  {
    "name": "api.Blob",
    "exposure": "Worker",
    "result": null,
    "message": "[exception message]"
  }
]
```

Status `400 Bad Request` is returned if the results do not match the expected
format.

#### Parameters

`for`: The test URL the results are for. (required)

#### Response

Status `201 Created` if the results were saved. The results are put in
server-side session storage.

### List results

```http
GET /api/results
```

#### Response

```json
{
  "https://mdn-bcd-collector.appspot.com/bcd/api/Sensor.html": {
    "some-data": "some-value"
  }
}
```

If no results have been reported to `/api/results` in this session then an
empty object is returned.

### Export results for download

```http
POST /api/results/export
```

#### Parameters

None, the results are taken from session storage.

#### Response

```json
{
  "filename": "1.1.4-safari-ios-8.1-ios-8.1-dfc5c93048.json",
  "url": "https://mdn-bcd-collector.appspot.com/download/1.1.4-safari-ios-8.1-ios-8.1-dfc5c93048.json"
}
```

When running locally, the files will be created in the `download/` directory,
removing the need to actually download them via the browser.

### Export results to GitHub

Exporting to GitHub requires credentials typically only available in production.

```http
POST /api/results/export/github
```

#### Parameters

None, the results are taken from session storage.

#### Response

```json
{
  "filename": "1.1.4-safari-ios-8.1-ios-8.1-dfc5c93048.json",
  "url": "https://github.com/foolip/mdn-bcd-results/pull/1337"
}
```

## Running tests

### Manually

When pointing a browser at https://mdn-bcd-collector.appspot.com/ to run tests,
the server keeps track of which tests to run, accepts results from each test as
it run, and combines all of the results at the end. A random session id, stored
in a cookie, is used to get results back.

When the tests have finished running, a link to `/export` will be presented, allowing the results to be exported.

### WebDriver

Running the tests using WebDriver works in much the same way as when running manually, except the results are downloaded via `/api/results` and saved locally.

## Reports

A JSON report file is automatically generated and submitted to https://github.com/foolip/mdn-bcd-results as a pull request. A user can also download the JSON report by visiting `/api/results` (of which is linked at the end of the tests).
