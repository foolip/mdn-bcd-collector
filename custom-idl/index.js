//
// mdn-bcd-collector: custom-idl/index.js
// Loader script to load the custom IDL to supplement @webref/idl
//
// © Google LLC, Gooborg Studios
// See LICENSE.txt for copyright details
//

import fs from 'fs-extra';
import path from 'node:path';
import * as WebIDL2 from 'webidl2';

// Load text (UTF-8) files from a directory and return an object mapping each
// name (sans extension) to the parsed result of that text.
const parseIDL = async () => {
  const files = await fs.readdir(new URL('.', import.meta.url));
  files.sort();
  const results = {};
  for (const file of files) {
    /* c8 ignore next 3 */
    if (path.extname(file) !== '.idl') {
      continue;
    }

    const name = path.parse(file).name;
    const text = await fs.readFile(
      new URL(`./${file}`, import.meta.url),
      'utf8'
    );
    results[name] = WebIDL2.parse(text);
  }
  return results;
};

export default await parseIDL();
