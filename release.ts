//
// mdn-bcd-collector: release.js
// Script to perform a new mdn-bcd-collector release
//
// © Gooborg Studios, Google LLC
// See the LICENSE file for copyright details
//

import chalk from 'chalk-template';
import enquirer from 'enquirer';
import esMain from 'es-main';
import fs from 'fs-extra';
import {Listr, ListrTask} from 'listr2';
import prettier from 'prettier';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';

import {exec} from './scripts.js';

const currentVersion = (
  await fs.readJson(new URL('./package.json', import.meta.url))
).version;

const prepare = (): ListrTask[] => {
  return [
    {
      title: 'Checking for Git',
      task: () => {
        try {
          exec('git --version');
        } catch (e) {
          throw new Error(
            chalk`{red This script depends on {bold git}. Please {bold install} git using the following instructions:} {blue https://git-scm.com/book/en/v2/Getting-Started-Installing-Git}`
          );
        }
      }
    },
    {
      title: 'Checking for GitHub CLI',
      task: () => {
        try {
          exec('gh --version');
        } catch (e) {
          throw new Error(
            chalk`{red This script depends on the {bold GitHub CLI}. Please {bold install} the CLI using the following instructions:} {blue https://cli.github.com/}`
          );
        }
      },
      skip: (ctx) => ctx.skipPR
    },
    {
      title: 'Checking git status',
      task: () => {
        const changes = exec('git status -s');
        if (changes.length) {
          throw new Error(
            chalk`{red You currently have {bold uncommitted changes}. Please {bold commit} or {bold stash} your changes and try again.}`
          );
        }
      }
    },
    {
      title: 'Fetching from remote',
      task: () => exec('git fetch --all'),
      skip: (ctx) => ctx.skipFetch
    }
  ];
};

const getNewVersion = async (ctx, task) => {
  const versionParts = currentVersion.split('.').map((x) => Number(x));
  const newVersions = [
    `${versionParts[0] + 1}.0.0`,
    `${versionParts[0]}.${versionParts[1] + 1}.0`,
    `${versionParts[0]}.${versionParts[1]}.${versionParts[2] + 1}`
  ];

  if (ctx.skipPrompt) {
    ctx.newVersion = newVersions[2];
    return;
  }

  ctx.newVersion = await task.prompt([
    {
      type: 'select',
      name: 'newVersion',
      message: 'How should we bump the version?',
      choices: [
        {
          message: chalk`Major {blue (${newVersions[0]})}`,
          name: newVersions[0]
        },
        {
          message: chalk`Minor {blue (${newVersions[1]})}`,
          name: newVersions[1]
        },
        {
          message: chalk`Patch {blue (${newVersions[2]})}`,
          name: newVersions[2]
        },
        {
          message: chalk`{yellow Cancel}`,
          name: 'cancel'
        }
      ],
      initial: 2
    }
  ]);

  if (ctx.newVersion === 'cancel') {
    throw new Error(chalk`{yellow Release cancelled by user}`);
  }
};

const simplifyTestChangesList = (el, _, list) => {
  const parts = el.split('.');
  let p = '';

  for (let i = 0; i < parts.length - 1; i++) {
    p += (i > 0 ? '.' : '') + parts[i];
    if (list.includes(p)) {
      return false;
    }
  }

  return true;
};

const getTestChanges = (): ListrTask[] => {
  return [
    {
      title: 'Checkout last release',
      task: async () => {
        exec(`git checkout v${currentVersion}`);
        exec('npm install');
      }
    },
    {
      title: 'Build tests from last release',
      task: async () => {
        exec('npm run build');
        await fs.rename(
          new URL('./tests.json', import.meta.url),
          new URL('./tests.old.json', import.meta.url)
        );
      }
    },
    {
      title: 'Checkout current release',
      task: async () => {
        // npm install or build could have resulted in local changes, use
        // --force to throw those away.
        exec('git checkout --force origin/main');
        exec('npm install');
      }
    },
    {
      title: 'Build tests from current release',
      task: () => exec('npm run build').toString()
    },
    {
      title: 'Compare tests',
      task: async (ctx) => {
        const oldTests = await fs.readJson(
          new URL('./tests.old.json', import.meta.url)
        );
        const newTests = await fs.readJson(
          new URL('./tests.json', import.meta.url)
        );

        const oldTestKeys = Object.keys(oldTests);
        const newTestKeys = Object.keys(newTests);

        const added = newTestKeys
          .filter((k) => !oldTestKeys.includes(k))
          .filter(simplifyTestChangesList);
        const removed = oldTestKeys
          .filter((k) => !newTestKeys.includes(k))
          .filter(simplifyTestChangesList);
        let changed: string[] = [];
        for (const t of newTestKeys.filter((k) => oldTestKeys.includes(k))) {
          if (oldTests[t].code != newTests[t].code) {
            changed.push(t);
          }
        }
        changed = changed.filter(simplifyTestChangesList);

        ctx.testChanges = '\n';

        if (added.length) {
          ctx.testChanges +=
            '#### Added\n\n' + added.map((x) => '- ' + x).join('\n') + '\n';
        }
        if (removed.length) {
          ctx.testChanges +=
            '#### Removed\n\n' + removed.map((x) => '- ' + x).join('\n') + '\n';
        }
        if (changed.length) {
          ctx.testChanges +=
            '#### Changed\n\n' + changed.map((x) => '- ' + x).join('\n') + '\n';
        }
      }
    },
    {
      title: 'Cleanup',
      task: async () =>
        await fs.rm(new URL('./tests.old.json', import.meta.url))
    }
  ];
};

const getGitChanges = async (ctx) => {
  const commits = String(
    exec(`git log --pretty=format:%s v${currentVersion}..origin/main`)
  ).split('\n');
  ctx.commits = commits
    .filter((summary) => !summary.startsWith('Bump '))
    .map(
      (summary) =>
        `- ${summary.replaceAll('<', '&lt;').replaceAll('>', '&gt;')}`
    )
    .map((summary) =>
      // Link to pull requests
      summary.replace(
        /\(#(\d+)\)/g,
        '([#$1](https://github.com/GooborgStudios/mdn-bcd-collector/pull/$1))'
      )
    )
    .join('\n');
};

const doChangelogUpdate = async (ctx) => {
  const filepath = new URL('./CHANGELOG.md', import.meta.url);
  const changelog = await fs.readFile(filepath, 'utf8');
  const idx = changelog.indexOf('##');
  let newChangelog =
    changelog.substring(0, idx) +
    `## v${ctx.newVersion}\n\n` +
    (ctx.testChanges === '\n' ? '' : '### Test Changes\n' + ctx.testChanges) +
    '\n### Commits\n\n' +
    ctx.commits +
    '\n\n' +
    changelog.substring(idx, changelog.length);
  newChangelog = prettier.format(newChangelog, {parser: 'markdown'});
  await fs.writeFile(filepath, newChangelog, 'utf8');
};

const doVersionBump = async (newVersion) => {
  exec(`npm version --no-git-tag-version ${newVersion}`);
};

const prepareBranch = async (ctx) => {
  ctx.branchName = `release-${ctx.newVersion}`;

  // Create and checkout branch
  exec(`git branch ${ctx.branchName}`);
  exec(`git checkout ${ctx.branchName}`);

  // Commit
  exec('git add package.json package-lock.json CHANGELOG.md');
  exec(
    `git commit -m "Release ${ctx.newVersion}" -m "Generated by release.js."`
  );
};

const createPR = async (ctx) => {
  exec(`git push --set-upstream origin ${ctx.branchName}`);
  exec('gh pr create -f');
};

const main = async () => {
  const {argv} = yargs(hideBin(process.argv))
    .parserConfiguration({
      'boolean-negation': false
    })
    .option('no-fetch', {
      describe: "Don't fetch remote",
      type: 'boolean',
      default: false
    })
    .option('no-prompt', {
      describe: "Don't prompt about anything, assume defaults",
      type: 'boolean',
      default: false
    })
    .option('no-pr', {
      describe: "Don't create a pull request",
      type: 'boolean',
      default: false
    });

  const tasks = new Listr(
    [
      {
        title: 'Check prerequesites',
        task: (_, task) => task.newListr(prepare())
      },
      {
        title: 'Get new version number',
        task: getNewVersion
      },
      {
        title: 'Get test changes',
        task: (_, task) => task.newListr(getTestChanges())
      },
      {
        title: 'Get commits',
        task: getGitChanges
      },
      {
        title: 'Update changelog',
        task: doChangelogUpdate
      },
      {
        title: 'Bump version number',
        task: async (ctx) => await doVersionBump(ctx.newVersion)
      },
      {
        title: 'Get confirmation to continue',
        task: async (ctx, task) => {
          const confirm = await task.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Ready to release ${ctx.newVersion}?`,
              initial: true
            }
          ]);

          if (!confirm) {
            throw new Error(
              chalk`{yellow Release cancelled by user, reverting package[-lock.json] changes (changelog retained)}`
            );
          }
        },
        rollback: async () => await doVersionBump(currentVersion),
        skip: (ctx) => ctx.skipPrompt
      },
      {
        title: 'Prepare release branch',
        task: prepareBranch
      },
      {
        title: 'Create pull request',
        task: createPR,
        skip: (ctx) => ctx.skipPR
      }
    ],
    {
      showErrorMessage: true,
      // Mitigates https://github.com/cenk1cenk2/listr2/issues/631
      injectWrapper: {enquirer},
      ctx: {
        skipFetch: argv['no-fetch'],
        skipPrompt: argv['no-prompt'],
        skipPR: argv['no-pr'],
        newVersion: null
      }
    } as any
  );

  try {
    await tasks.run();
  } catch (e) {
    console.error(e);
  }

  // Restore original head when finished
  try {
    exec('git switch -');
  } catch (e) {
    // Don't worry if the command fails
  }
};

/* c8 ignore start */
if (esMain(import.meta)) {
  await main();
}
/* c8 ignore stop */
