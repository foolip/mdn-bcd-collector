const puppeteer = require('puppeteer');

const main = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://tc39.es/ecma262/');
  const sections = await page.evaluate(() => {
    const toc = document.getElementById('menu-toc');
    return toc;
  });
  console.log(sections);
  await browser.close();
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
