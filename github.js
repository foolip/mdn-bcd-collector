// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const crypto = require('crypto');
const {Octokit} = require('@octokit/rest');
const slugify = require('slugify');
const uaParser = require('ua-parser-js');
const stringify = require('json-stable-stringify');

const github = (options) => {
  const octokit = new Octokit(options);

  const getReportMeta = (report) => {
    const json = stringify(report, {space: 2}) + '\n';
    const buffer = Buffer.from(json);
    /* eslint-disable-next-line max-len */
    // like https://github.com/web-platform-tests/wpt.fyi/blob/26805a0122ea01076ac22c0a96313c1cf5cc30d6/results-processor/wptreport.py#L79
    const hash = crypto.createHash('sha1');
    const digest = hash.update(buffer).digest('hex').substr(0, 10);

    const version = report.__version;
    const dev = report.__dev;
    const ua = uaParser(report.userAgent);
    const browser = `${ua.browser.name} ${ua.browser.version}`;
    const os = `${ua.os.name} ${ua.os.version}`;
    const desc = `${browser} / ${os}`;
    const title = `Results from ${desc} / Collector v${version}`;

    const slug = `${version}-${slugify(desc, {lower: true})}-${digest}`;
    const filename = `${slug}.json`;
    const branch = `collector/${slug}`;

    return {
      json, buffer, digest, dev, ua, browser,
      os, desc, title, slug, filename, branch
    };
  };

  const createBody = (meta) => {
    return `User Agent: ${meta.ua.ua}\nBrowser: ${meta.browser} (on ${meta.os})` +
            `\nHash Digest: ${meta.digest}\n` +
            (meta.dev ? '\n**WARNING:** this PR was created from a development/staging version!' : '');
  };

  const exportAsPR = async (report) => {
    const meta = getReportMeta(report);

    if ((await octokit.auth()).type == 'unauthenticated') {
      return false;
    }

    await octokit.git.createRef({
      owner: 'foolip',
      repo: 'mdn-bcd-results',
      ref: `refs/heads/${meta.branch}`,
      // first commit in repo
      sha: '753c6ed8e991e9729353a63d650ff0f5bd902b69'
    });

    await octokit.repos.createOrUpdateFileContents({
      owner: 'foolip',
      repo: 'mdn-bcd-results',
      path: `${meta.filename}`,
      message: meta.title,
      content: meta.buffer.toString('base64'),
      branch: meta.branch
    });

    const {data} = await octokit.pulls.create({
      owner: 'foolip',
      repo: 'mdn-bcd-results',
      title: meta.title,
      head: meta.branch,
      body: createBody(meta),
      base: 'main'
    });

    return data;
  };

  return {getReportMeta, createBody, exportAsPR};
};

module.exports = github;
