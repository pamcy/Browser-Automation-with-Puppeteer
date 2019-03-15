const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1440,
      height: 900,
    });

    const links = {
      niceday: 'https://play.niceday.tw',
      github: 'https://github.com/',
      reddit: 'https://reddit.com',
    };
    const links_entries = Object.entries(links);

    for (const [website, url] of links_entries) {
      await page.goto(url, {
        waitUntil: 'networkidle0',
      });

      console.log(`Current processing: ${website}`);

      await page.screenshot({
        path: `../snapshots/snapshot_${website}.png`,
        fullPage: true,
      });

      console.log('snapshot is done');
    }

    await browser.close();
  } catch (err) {
    console.error(err);
    await browser.close();
  }
})();
