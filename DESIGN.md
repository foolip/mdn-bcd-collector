# Design of the MDN browser-compat-data collector

This service is part of an effort to
[assist BCD updates with automation](https://github.com/mdn/browser-compat-data/issues/3308),
and exists to run lots of small tests in browsers to determine the support
status of a feature in a browser, and save those results. Updating BCD using
the results is not done as part of this service.

## Inputs

BCD itself and reffy-reports.

## Collection

Point a browser at https://mdn-bcd-collector.appspot.com/.

The browser will run each test and POST the results back to the service.

TODO: `window.open` and control execution using JS, or let the server redirect
the browser between each POST?

## Output

A `bcd_report.json` is written somewhere. TODO: where?
