const puppeteer = require('puppeteer');

const main = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://tc39.es/ecma262/');
  const sections = await page.evaluate(() => {
    function getSections(toc) {
      const items = Array.from(toc.children).filter(e => e.localName == 'li');
      return items.map(item => {
        const title = item.querySelector('a').title;
        const subtoc = item.querySelector('.toc');
        const subsections = subtoc ? getSections(subtoc) : [];
        return {title, sections: subsections};
      });
    }
    return getSections(document.querySelector('#menu-toc .toc'));
  });

  // Walk sections in tree order

  function walkSections(sections, callback, ancestors = []) {
    for (const section of sections) {
      callback(ancestors, section);
      ancestors.push(section);
      walkSections(section.sections, callback, ancestors);
      ancestors.pop();
    }
  }

  walkSections(sections, (ancestors, {title}) => {
    if (title === 'Properties of Valid Executions') {
      // This section has nothing to do with builtins.
      return;
    }
    // https://github.com/tc39/ecma262/issues/2385
    title = title.replace('.prototype Object', ' Prototype Object');
    const m = /^(.* )?Properties of (the )?(\S+)(.*)$/g.exec(title);
    if (m) {
      //const qualifier = m[1];
      let target = m[3].trim();
      let suffix = m[4].trim();
      switch (suffix) {
        case 'Constructor':
        case 'Instances':
        case 'Object':
        case 'Prototype Object':
          break;
        case 'Intrinsic Object':
        case 'Iterator Instances':
          return;
        default:
          console.warn(`Unhandled suffix ${suffix} in title ${title}`);
          return;
      }
      console.log(target, suffix);
      return;
    }
  });
  //const indent = '    '.repeat(ancestors.length);
  //console.log(`${indent}${title}`);
  await browser.close();
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
