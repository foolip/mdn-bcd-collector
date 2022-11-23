//
// mdn-bcd-collector: lib/exec.ts
// Execute a command
//
// Gooborg Studios
// See the LICENSE file for copyright details
//

import childProcess from 'child_process';

const exec = async (cmd, env?: any, pipe = true) => {
  env = {...process.env, ...env};
  if (!pipe) {
    console.log(`> ${cmd}`);
  }
  const output = await childProcess.execSync(cmd, {
    env,
    stdio: pipe ? 'pipe' : 'inherit'
  });
  return String(output);
};

export default exec;
