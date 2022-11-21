//
// mdn-bcd-collector: exporter.js
// This module is responsible for getting results/reports out of the collector
// web service into JSON files that can be used by update-bcd.ts.
//
// © Google LLC, Gooborg Studios
// See the LICENSE file for copyright details
//

import crypto from 'node:crypto';

import slugify from 'slugify';
import stringify from 'json-stable-stringify';
import bcd from '@mdn/browser-compat-data' assert {type: 'json'};
const bcdBrowsers = bcd.browsers;

import {parseUA} from './ua-parser.js';

import type {Report} from './types/types.js';

const getReportMeta = (report) => {
  const json = stringify(report);
  const buffer = Buffer.from(json);
  /* eslint-disable-next-line max-len */
  // like https://github.com/web-platform-tests/wpt.fyi/blob/26805a0122ea01076ac22c0a96313c1cf5cc30d6/results-processor/wptreport.py#L79
  const hash = crypto.createHash('sha1');
  const digest = hash.update(buffer).digest('hex').substr(0, 10);

  const version = report.__version;
  const uaString = report.userAgent;
  const ua = parseUA(uaString, bcdBrowsers);
  const browser = `${ua.browser.name} ${ua.version}`;
  const os = `${ua.os.name} ${ua.os.version}`;
  const desc = `${browser} / ${os}`;
  const title = `Results from ${desc} / Collector v${version}`;
  const urls = Object.keys(report.results);

  const slug = `${version.toLowerCase()}-${ua.browser.id.replace(/_/g, '-')}-${
    ua.fullVersion
  }-${slugify(os, {lower: true})}-${digest}`;
  const filename = `${slug}.json`;
  const branch = `collector/${slug}`;

  return {
    json,
    buffer,
    digest,
    uaString,
    ua,
    browser,
    os,
    desc,
    title,
    urls,
    slug,
    filename,
    branch,
    version
  };
};

const createBody = (meta) => {
  return (
    `User Agent: ${meta.uaString}\nBrowser: ${meta.browser} (on ${meta.os})${
      meta.ua.inBcd ? '' : ' - **Not in BCD**'
    }` +
    `\nHash Digest: ${meta.digest}` +
    `\nTest URLs: ${meta.urls.join(', ')}` +
    (meta.version.includes('-')
      ? '\n\n**WARNING:** this PR was created from a development/staging version!'
      : '')
  );
};

const exportAsPR = async (report: Report, octokit?) => {
  if (!octokit) {
    throw new Error('"octokit" must be defined');
  }

  if ((await octokit.auth()).type == 'unauthenticated') {
    throw new Error('Octokit authentication failure');
  }

  const meta = getReportMeta(report);
  await octokit.git.createRef({
    owner: 'GooborgStudios',
    repo: 'mdn-bcd-results',
    ref: `refs/heads/${meta.branch}`,
    // first commit in repo
    sha: '753c6ed8e991e9729353a63d650ff0f5bd902b69'
  });

  await octokit.repos.createOrUpdateFileContents({
    owner: 'GooborgStudios',
    repo: 'mdn-bcd-results',
    path: `${meta.filename}`,
    message: meta.title,
    content: meta.buffer.toString('base64'),
    branch: meta.branch
  });

  const {data} = await octokit.pulls.create({
    owner: 'GooborgStudios',
    repo: 'mdn-bcd-results',
    title: meta.title,
    head: meta.branch,
    body: createBody(meta),
    base: 'main'
  });

  return {
    filename: meta.filename,
    url: data.html_url
  };
};

export {getReportMeta, createBody, exportAsPR};
