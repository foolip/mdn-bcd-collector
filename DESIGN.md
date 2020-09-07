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

The `custom-tests.json` file is used to write custom tests for APIs and CSS properties that cannot be tested with a simple statement (for example, WebGL extensions).  Custom tests are written in the following structure:

#### APIs

Each API interface is written in the following structure:

```json
"INTERFACE_NAME": {
    "__base": "CODE_TO_REPEAT_FOR_EVERY_TEST",
    "__test": "CODE_SPECIFIC_TO_TEST_THE_INTERFACE",
    "MEMBER": "CODE_TO_TEST_THE_MEMBER",
    "__additional": {
      "SUBFEATURE": "CODE_TO_TEST_SUBFEATURE"
    }
}
```

`__base` is the common code to access the interface, repeated across every test.  This is where you create your elements and set up your environment.  The instance of the interface being tested should be defined in a variable called `instance`.  This will allow the build script to automatically generate tests for the instance and its members.

You can define a custom method to test the interface instance itself via `__test`.  The `__test` should be a return statement that returns `true` or `false`.  If no `__test` is defined, it will default to `return !!instance`.

Each member can have a custom test by defining a property as the member name.  Like `__test`, it should be a return statement that returns `true` or `false`.  If no custom test is defined, it will default to `return instance && 'MEMBER' in instance`.

Additional members and submembers can be defined using the `__additional` property.  If there is a subfeature to an API or one of its members, such as "api.AudioContext.AudioContext.latencyHint", that simply cannot be defined within IDL, you can include this object and specify tests for such subfeatures.

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
    "Console": {
      "__additional": {
        "log.substitution_strings": "console.log('Hello, %s.', 'Bob')"
      }
    }
  },
  "css": {

  }
}
```

...will compile into...

```javascript
bcd.addTest('api.ANGLE_instanced_arrays', "(function() {var canvas = document.createElement('canvas'); var gl = canvas.getContext('webgl'); var instance = gl.getExtension('ANGLE_instanced_arrays');return canvas && instance;})()", 'Window');
bcd.addTest('api.ANGLE_instanced_arrays.drawArraysInstancedANGLE', "(function() {var canvas = document.createElement('canvas'); var gl = canvas.getContext('webgl'); var instance = gl.getExtension('ANGLE_instanced_arrays');return true && instance && 'drawArraysInstancedANGLE' in instance;})()", 'Window');
bcd.addTest('api.ANGLE_instanced_arrays.drawElementsInstancedANGLE', "(function() {var canvas = document.createElement('canvas'); var gl = canvas.getContext('webgl'); var instance = gl.getExtension('ANGLE_instanced_arrays');return instance && 'drawElementsInstancedANGLE' in instance;})()", 'Window');
bcd.addTest('api.ANGLE_instanced_arrays.VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE', "(function() {var canvas = document.createElement('canvas'); var gl = canvas.getContext('webgl'); var instance = gl.getExtension('ANGLE_instanced_arrays');return instance && 'VERTEX_ATTRIB_ARRAY_DIVISOR_ANGLE' in instance;})()", 'Window');
bcd.addTest('api.ANGLE_instanced_arrays.vertexAttribDivisorANGLE', "(function() {var canvas = document.createElement('canvas'); var gl = canvas.getContext('webgl'); var instance = gl.getExtension('ANGLE_instanced_arrays');return instance && 'vertexAttribDivisorANGLE' in instance;})()", 'Window');
bcd.addTest('api.Animation', {"property":"Animation","scope":"self"}, 'Window');
...
bcd.addTest('api.Console', {"property":"console","scope":"self"}, 'Window');
bcd.addTest('api.Console.log', [{"property":"console","scope":"self"},{"property":"log","scope":"console"}], 'Window');
bcd.addTest('api.Console.log.substitution_strings', "(function() {console.log('Hello, %s.', 'Bob')})()", 'Window');
```

Tips: make sure to implement thorough feature checking as to not raise exceptions.

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
  "api": {

  },
  "css": {
    "properties": {
      "custom-property": "return CSS.supports('color', 'var(--foo)') || CSS.supports('color', 'env(--foo)');"
    }
  }
}
```

...will compile into...

```javascript
bcd.addTest('css.properties.custom-property', "(function() {return CSS.supports('color', 'var(--foo)') || CSS.supports('color', 'env(--foo)');})()", 'CSS');
```

Tips: make sure that all return statements will return a boolean, and implement thorough feature checking.

## API

HTTP endpoints under `/api/` are used to enumerate/iterate test URLs, report
results for individual tests, and finally create a report for a whole session.

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
the JSON results with a test-defined structure.

#### Parameters

`for`: The test URL the results are for. (required)

#### Response

Status `201 Created` if the results were saved. The results are put in
server-side session storage.

As a convenience, the next test is included in response:

```json
{
  "next": "http://mdn-bcd-collector.appspot.com/bcd/api/next/test.html"
}
```

This is same as the response of `/api/tests?after=...&limit=1`. If there are no
more tests or that request errored there is no `next` field.

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

### Export results to GitHub

```http
POST /api/results/export/github
```

#### Parameters

None, the results are taken from session storage.

#### Response

```json
{
  "url": "https://api.github.com/repos/foolip/mdn-bcd-results/pulls/1",
  "html_url": "https://github.com/foolip/mdn-bcd-results/pull/1"
}
```

The full response of the [underlying GitHub API](https://developer.github.com/v3/pulls/#create-a-pull-request)
is returned, but `url` and `html_url` are the most useful fields.

Status `400 Bad Request` is returned if no results have been reported to
`/api/results` in this session.

## Running tests

### Manually

When pointing a browser at https://mdn-bcd-collector.appspot.com/ to run tests,
the server keeps track of which tests to run, accepts results from each test as
it run, and combines all of the results at the end. A random session id, stored
in a cookie, is used to get results back.

To start a run, the browser fetches the full list of tests from `/api/tests`
and navigates to the first test.

On each page, the harness waits for results and posts them to `/api/results`.
The next test to run is included in the response from `/api/results`, and when
there is no next text the browser navigates to a page (`/results/`) where the
results can be submitted as a pull request to a GitHub repository.

### WebDriver

When running the tests using WebDriver, the WebDriver client keeps track of
which tests to run and stores the results. The server in this case can be
entirely static.

## Reports

A JSON report file is automatically generated and submitted to https://github.com/foolip/mdn-bcd-results as a pull request.  A user can also download the JSON report by visiting `/api/results` (of which is linked at the end of the tests).
