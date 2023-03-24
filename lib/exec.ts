//
// mdn-bcd-collector: lib/exec.ts
// Execute a command
//
// Gooborg Studios
// See the LICENSE file for copyright details
//

import childProcess from 'node:child_process';

const exec = async (cmd, env?: any, pipe = true) => {
  env = {...process.env, ...env};
  /* c8 ignore start */
  if (!pipe) {
    console.log(`> ${cmd}`);
  }
  /* c8 ignore stop */
  const output = childProcess.execSync(cmd, {
    env,
    stdio: pipe ? 'pipe' : 'inherit'
  });
  return String(output);
};

export default exec;
