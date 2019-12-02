const InstagramPage = require('./instagram/InstagramPage');
const TwitterPage = require('./twitter/TwitterPage');
const FacebookPage = require('./facebook/FacebookPage');

function createCrawlerPage(pageType, phantomPage) {
  pageType = pageType.toLowerCase();
  switch (pageType) {
    case "instagram":
      return new InstagramPage(phantomPage);
    case "twitter":
      return new TwitterPage(phantomPage);
    case "facebook":
      return new FacebookPage(phantomPage);
  }
}

module.exports = { createCrawlerPage };