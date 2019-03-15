const puppeteer = require('puppeteer');
const fs = require('fs');
const CREDS = require('../creds');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.goto('https://github.com/login');
    await page.type('#login_field', CREDS.username);
    await page.type('#password', CREDS.password);

    const [response] = await Promise.all([
      page.waitForNavigation(),
      page.click('input[name="commit"]'),
    ]);

    const search_term = 'puppeteer';
    const search_url = `https://github.com/search?l=JavaScript&o=desc&q=${search_term}&s=forks&type=Repositories`;
    const total_pages = 2;
    const results = [];
    let list;

    for (let i = 1; i <= total_pages; i++) {
      let page_url = `${search_url}&p=${i}`;

      await page.goto(page_url);
      await page.waitFor(2000);

      list = await page.evaluate(() => {
        const items = [...document.querySelectorAll('.repo-list-item')];

        return items.map((item) => {
          const title = item.querySelector('h3').innerText;
          const description = item.querySelector('p.col-12.col-md-9.d-inline-block.text-gray.mb-2.pr-4').innerText;
          const date = item.querySelector('relative-time').innerText;
          const stargazers = item.querySelector('div.pl-2.pl-md-0.text-right.flex-auto.min-width-0').innerText;

          return {
            title, description, date, stargazers,
          };
        });
      });

      results.push(...list);
    }

    await browser.close();

    fs.writeFile('../github-results.json', JSON.stringify(results), (error) => {
      if (error) throw error;
      console.log('JSON file saved');
    });
  } catch (e) {
    console.error(`🚫 ERROR: ${e}`);
    await browser.close();
  }
})();
