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
const stringify = require('json-stable-stringify');
const uaParser = require('ua-parser-js');

const appversion = require('./package.json').version;

module.exports = (options) => {
  const octokit = new Octokit(options);

  const getReportMeta = (report) => {
    const json = stringify(report, {space: '  '}) + '\n';
    const buffer = Buffer.from(json);
    /* eslint-disable-next-line max-len */
    // like https://github.com/web-platform-tests/wpt.fyi/blob/26805a0122ea01076ac22c0a96313c1cf5cc30d6/results-processor/wptreport.py#L79
    const hash = crypto.createHash('sha1');
    const digest = hash.update(buffer).digest('hex').substr(0, 10);

    const ua = uaParser(report.userAgent);
    const browser = `${ua.browser.name} ${ua.browser.version}`;
    const os = `${ua.os.name} ${ua.os.version}`;
    const desc = `${browser} / ${os}`;
    const title = `Results from ${desc}`;
    const slug = slugify(desc, {lower: true});

    const filename = `${appversion}-${slug}-${digest}`;
    const branch = `collector/${filename}`;

    return {
      json, buffer, hash, digest, ua, browser, os,
      desc, title, slug, filename, branch
    };
  };

  const exportAsPR = async (report) => {
    const reportMeta = getReportMeta(report);

    if ((await octokit.auth()).type == 'unauthenticated') {
      return false;
    }

    await octokit.git.createRef({
      owner: 'foolip',
      repo: 'mdn-bcd-results',
      ref: `refs/heads/${reportMeta.branch}`,
      // first commit in repo
      sha: '753c6ed8e991e9729353a63d650ff0f5bd902b69'
    });

    await octokit.repos.createOrUpdateFileContents({
      owner: 'foolip',
      repo: 'mdn-bcd-results',
      path: `${reportMeta.filename}.json`,
      message: reportMeta.title,
      content: reportMeta.buffer.toString('base64'),
      branch: reportMeta.branch
    });

    const {data} = await octokit.pulls.create({
      owner: 'foolip',
      repo: 'mdn-bcd-results',
      title: reportMeta.title,
      head: reportMeta.branch,
      base: 'main'
    });

    return data;
  };

  return {getReportMeta, exportAsPR};
};
