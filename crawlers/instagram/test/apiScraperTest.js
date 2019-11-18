const { scrape } = require('../apiScraper');

(async function () {
  const username = 'duonglam_hang';
  const result = await scrape(username);
  console.log(result);
})();