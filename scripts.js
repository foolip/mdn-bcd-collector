const childProcess = require('child_process');

const exec = (cmd, env) => {
  console.log(`> ${cmd}`);
  return childProcess.execSync(cmd, {env, stdio: 'inherit'});
};

const prepare = () => {
  try {
    process.chdir('node_modules/puppeteer');
  } catch {
    return;
  }
  exec('node install.js', {PUPPETEER_PRODUCT: 'firefox'});
};

const command = process.argv[2];
if (command === 'prepare') {
  prepare();
} else if (command === 'unittest') {
  exec('nyc mocha --recursive unittest', {NODE_ENV: 'test'});
}
