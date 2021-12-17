import chalk from 'chalk-template';
import esMain from 'es-main';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import NodeGit from 'nodegit';
import prettier from 'prettier';
import {fileURLToPath} from 'url';

import {exec} from './scripts.js';
import {build, customIDL, customCSS} from './build.js';

const gitRepo = await NodeGit.Repository.open(
  fileURLToPath(new URL('.', import.meta.url))
);

const authorSignature = await NodeGit.Signature.default(gitRepo);

const currentVersion = (
  await fs.readJson(new URL('./package.json', import.meta.url))
).version;

const logStatus = (status) => {
  console.log(chalk`{blue ${status}}`);
};

const prepare = async () => {
  logStatus('Checking status...');
  const status = await gitRepo.getStatus();
  if (status.length) {
    console.error(
      chalk`{red You currently have {bold uncommitted changes}. Please {bold commit} or {bold stash} your changes and try again.}`
    );
    return false;
  }

  logStatus('Checking for GitHub CLI...');
  try {
    exec('gh --version');
  } catch (e) {
    console.error(
      chalk`{red This script depends on the {bold GitHub CLI}. Please {bold install} the CLI using the following instructions:} {blue https://cli.github.com/}`
    );
    return false;
  }

  logStatus('Fetching from remote...');
  await gitRepo.fetchAll();

  return true;
};

const getNewVersion = async () => {
  const versionParts = currentVersion.split('.').map((x) => Number(x));
  const newVersions = [
    `${versionParts[0] + 1}.0.0`,
    `${versionParts[0]}.${versionParts[1] + 1}.0`,
    `${versionParts[0]}.${versionParts[1]}.${versionParts[2] + 1}`
  ];

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'newVersion',
      message: 'How should we bump the version?',
      choices: [
        {
          name: chalk`Major {blue (${newVersions[0]})}`,
          value: newVersions[0]
        },
        {
          name: chalk`Minor {blue (${newVersions[1]})}`,
          value: newVersions[1]
        },
        {
          name: chalk`Patch {blue (${newVersions[2]})}`,
          value: newVersions[2]
        },
        {
          name: chalk`{yellow Cancel}`,
          value: 'cancel'
        }
      ],
      default: 2
    }
  ]);

  return answers.newVersion;
};

const doVersionBump = async (newVersion) => {
  for (const f of ['./package.json', './package-lock.json']) {
    const filepath = new URL(f, import.meta.url);
    const data = await fs.readJson(filepath);
    data.version = newVersion;
    await fs.writeJson(filepath, data, {spaces: 2});
  }
};

const getGitChanges = async () => {
  logStatus('Getting commits...');

  const revwalk = gitRepo.createRevWalk();
  revwalk.pushRange(`v${currentVersion}..origin/main`);
  const commits = await revwalk.getCommits(Infinity);
  return commits
    .map((commit) => commit.summary())
    .filter((summary) => !summary.startsWith('Bump '))
    .map((summary) => `- ${summary.replace('<', '&lt;').replace('>', '&gt;')}`)
    .join('\n');
};

const getTestChanges = async () => {
  logStatus('Getting test changes...');

  const head = await NodeGit.Reference.nameToId(gitRepo, 'HEAD');

  // Build tests from the last release
  const prevRef = await NodeGit.Reference.nameToId(
    gitRepo,
    `refs/tags/v${currentVersion}`
  );
  await gitRepo.checkoutRef(prevRef);
  await build(customIDL, customCSS);
  await fs.rename(
    new URL('./tests.json', import.meta.url),
    new URL('./tests.old.json', import.meta.url)
  );

  // Build tests for current release
  await gitRepo.checkoutRef(head);
  await build(customIDL, customCSS);

  // Compare tests
  const oldTests = await fs.readJson(
    new URL('./tests.old.json', import.meta.url)
  );
  const newTests = await fs.readJson(new URL('./tests.json', import.meta.url));

  const oldTestKeys = Object.keys(oldTests);
  const newTestKeys = Object.keys(newTests);

  const added = newTestKeys.filter((k) => !oldTestKeys.includes(k));
  const removed = oldTestKeys.filter((k) => !newTestKeys.includes(k));
  const changed = [];
  for (const t in newTestKeys.filter((k) => oldTestKeys.includes(k))) {
    if (oldTests[t].code != newTests[t].code) {
      changed.push(t);
    }
  }

  // Remove tests.old.json for cleanup
  await fs.rm(new URL('./tests.old.json', import.meta.url));

  return (
    '\n#### Added\n' +
    '\n'.join(added) +
    '\n#### Removed\n' +
    '\n'.join(removed) +
    '\n#### Changed\n' +
    '\n'.join(changed)
  );
};

const doChangelogUpdate = async (newVersion) => {
  const testChanges = await getTestChanges();
  const commmits = await getGitChanges();

  const filepath = new URL('./CHANGELOG.md', import.meta.url);
  const changelog = await fs.readFile(filepath, 'utf8');
  const idx = changelog.indexOf('##');
  let newChangelog =
    changelog.substring(0, idx) +
    `## v${newVersion}\n\n` +
    '### Test Changes\n' +
    testChanges +
    '\n### Commits\n\n' +
    commits +
    '\n\n' +
    changelog.substring(idx, changelog.length);
  newChangelog = prettier.format(newChangelog, {parser: 'markdown'});
  await fs.writeFile(filepath, newChangelog, 'utf8');
  console.log('Please review the changelog and make changes as needed.');
};

const prepareBranch = async (newVersion) => {
  logStatus('Preparing release branch...');
  const branchName = `release-${newVersion}`;

  const commit = await gitRepo.getBranchCommit('refs/remotes/origin/main');
  const branch = await gitRepo.createBranch(branchName, commit, true);
  await gitRepo.checkoutBranch(branch);

  const index = await gitRepo.refreshIndex();
  for (const f of ['package.json', 'package-lock.json', 'CHANGELOG.md']) {
    await index.addByPath(f);
  }
  await index.write();
  const changes = await index.writeTree();

  const head = await NodeGit.Reference.nameToId(gitRepo, 'HEAD');
  const parent = await gitRepo.getCommit(head);

  await gitRepo.createCommit(
    'HEAD',
    authorSignature,
    authorSignature,
    `Release ${newVersion}\n\nRelease v${newVersion}, generated by \`release.js\`.`,
    changes,
    [parent]
  );

  return branch;
};

const createPR = async (branch) => {
  const branchName = await branch.name();
  exec(`git push --set-upstream origin ${branchName}`);
  exec('gh pr create -f');
};

const main = async () => {
  if (!(await prepare())) {
    process.exit(1);
  }

  const newVersion = await getNewVersion();
  if (newVersion == 'cancel') {
    console.log(chalk`{yellow Release cancelled by user}`);
    process.exit(0);
  }

  console.log('');

  await doVersionBump(newVersion);
  await doChangelogUpdate(newVersion);

  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Ready to release ${newVersion}?`
    }
  ]);

  if (answers.confirm) {
    const branch = await prepareBranch(newVersion);
    await createPR(branch);
  } else {
    console.log(
      chalk`{yellow Release cancelled by user, reverting package[-lock.json] changes (changelog retained)}`
    );
    await doVersionBump(currentVersion);
  }
};

/* istanbul ignore if */
if (esMain(import.meta)) {
  await main();
}
