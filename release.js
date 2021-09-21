import esMain from 'es-main';
import fs from 'fs-extra';
import inquirer from 'inquirer';

const currentVersion = (
  await fs.readJson(new URL('./package.json', import.meta.url))
).version;

const getNewVersion = async () => {
  const versionParts = currentVersion.split('.').map(x =>  new Number(x));
  const newVersions = [`${versionParts[0] + 1}.0.0`, `${versionParts[0]}.${versionParts[1] + 1}.0`, `${versionParts[0]}.${versionParts[1]}.${versionParts[2] + 1}`];

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'newVersion',
      message: 'How should we bump the version?',
      choices: [
        {
          name: `Major (${newVersions[0]})`,
          value: newVersions[0]
        },
        {
          name: `Minor (${newVersions[1]})`,
          value: newVersions[1]
        },
        {
          name: `Patch (${newVersions[2]})`,
          value: newVersions[2]
        }
      ],
      default: 2
    }
  ]);
  
  return answers.newVersion;
};

const getNewChangelog = async (newVersion) => {
  const answers = await inquirer.prompt([
    {
      type: 'editor',
      name: 'changelog',
      message: 'Write updates to the changelog',
      default: `## ${newVersion}\n\n### Tests\n\n#### New\n\n\n\n#### Updated\n\n\n\n### Additions\n\n\n\n### Changes\n\n\n\n### Removal\n\n`,
      postfix: '.md'
    }
  ]);

  return answers.changelog;
}

const main = async () => {
  const newVersion = await getNewVersion();
  const newChangelog = await getNewChangelog(newVersion);

  const answers = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: `Ready to release ${newVersion}?`
    }
  ]);
};

/* istanbul ignore if */
if (esMain(import.meta)) {
  await main();
}
