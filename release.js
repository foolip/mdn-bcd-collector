import chalk from 'chalk';
import esMain from 'es-main';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import NodeGit from 'nodegit';
import prettier from 'prettier';
import {fileURLToPath} from 'url';

import {exec} from './scripts.js';

const gitRepo = await NodeGit.Repository.open(
  fileURLToPath(new URL('.', import.meta.url))
);

const authorSignature = await NodeGit.Signature.default(gitRepo);

const currentVersion = (
  await fs.readJson(new URL('./package.json', import.meta.url))
).version;

const prepare = async () => {
  console.log(chalk`{blue Checking status...}`);
  const status = await gitRepo.getStatus();
  if (status.length) {
    console.error(
      chalk`{red You currently have {bold uncommitted changes}. Please {bold commit} or {bold stash} your changes and try again.}`
    );
    return false;
  }

  console.log(chalk`{blue Checking for GitHub CLI...}`);
  try {
    exec('gh --version');
  } catch (e) {
    console.error(
      chalk`{red This script depends on the {bold GitHub CLI}. Please {bold install} the CLI using the following instructions:} {blue https://cli.github.com/}`
    );
    return false;
  }

  console.log(chalk`{blue Fetching from remote...}`);
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

const getChanges = () => {
  const changes = exec(
    `git log --pretty=reference v${currentVersion}..origin/main`
  )
    .toString('utf8')
    .split('\n')
    .map(
      (c) =>
        '- ' +
        c
          .substring(9, c.length() - 1)
          .replace('<', '&lt;')
          .replace('>', '&gt;')
    )
    .filter((c) => !!c && !c.startsWith('- (Bump '));

  return changes.join('\n');
};

const doChangelogUpdate = async () => {
  const filepath = new URL('./CHANGELOG.md', import.meta.url);
  const changelog = await fs.readFile(filepath, 'utf8');
  const idx = changelog.indexOf('##');
  let newChangelog =
    changelog.substring(0, idx) +
    getChanges() +
    '\n\n' +
    changelog.substring(idx, changelog.length);
  newChangelog = prettier.format(newChangelog, {parser: 'markdown'});
  await fs.writeFile(filepath, newChangelog, 'utf8');
};

const prepareBranch = async (newVersion) => {
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
  await doChangelogUpdate();
  const branch = await prepareBranch(newVersion);

  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Ready to release ${newVersion}?`
    }
  ]);

  if (answers.confirm) {
    await createPR(branch);
  } else {
    console.log(chalk`{yellow Release cancelled by user}`);
  }
};

/* istanbul ignore if */
if (esMain(import.meta)) {
  await main();
}
