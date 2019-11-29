const InstagramPage = require('./instagram/InstagramPage');
const TwitterPage = require('./twitter/TwitterPage');

function createCrawlerPage(pageType, phantomPage) {
  pageType = pageType.toLowerCase();
  switch (pageType) {
    case "instagram":
      return new InstagramPage(phantomPage);
    case "twitter":
      return new TwitterPage(phantomPage);
  }
}

module.exports = { createCrawlerPage };