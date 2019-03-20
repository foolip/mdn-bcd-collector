# Design of the MDN browser-compat-data collector

This service is part of an effort to
[assist BCD updates with automation](https://github.com/mdn/browser-compat-data/issues/3308),
and exists to run lots of small tests in browsers to determine the support
status of a feature in a browser, and save those results. Updating BCD using
the results is not done as part of this service.

## Tests

BCD itself and reffy-reports are used to generate tests, and tests can also be
written manually. The output of a test is arbitrary JSON, which must be
interpreted with knowledge of what the test does.

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
it run, and combines all of the results at the end.

To start a run, the browser posts to `/api/first` and gets a first page URL to
visit in the response. A random session id is used and carried along through
every step.

On each page, the harness waits for results and posts them to `/api/report`.
The next page to visit is retrieved from `/api/next`.

When all the tests have been run, `/api/next` will return a URL to a page where
the results can be submitted is a pull request to a GitHub repository.

### WebDriver

When running the tests using WebDriver, the WebDriver client keeps track of
which tests to run and stores the results. The server in this case can be
entirely static.

## Reports

A `bcd_report.json` is written somewhere. TODO: where?
