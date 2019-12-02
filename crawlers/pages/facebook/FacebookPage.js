const config = require('../config');

module.exports = class InstagramPage {
  constructor(page) {
    this.page = page;
    this.page.setting('userAgent', config.user_agent);
    this.page.setting('loadImages', false);
    this.total = 0;
    this.postsContainer = [];
  }

  async initLoad(option) {
    const url = `https://www.facebook.com/pg/${option.query}/posts`;
    option.total = option.total || 5;
    this.total = option.total;

    await this.page.open(url);
    this.postsContainer = await this.scrollAndCrawlData(5000);
    const returnPosts = this.postsContainer.splice(0, option.total < 5 ? option.total : 5);
    this.total -= returnPosts.length;
    return returnPosts; // at most 5 posts for first time
  }

  async continueLoad() {
    if (this.total <= 0) return [];

    let posts = await this.scrollAndCrawlData(1000);
    this.postsContainer = this.postsContainer.concat(posts);
    const returnPosts = this.postsContainer.splice(0, this.total < posts.length ? this.total : posts.length);
    this.total -= returnPosts.length;
    return returnPosts;
  }

  async scrollAndCrawlData(delay) {
    let sleeper = function() {
      return new Promise(resolve => setTimeout(() => resolve(), delay));
    };
    const resultString = await sleeper().then(() => this.page.evaluate(getFacebookDataScript));
    this.page.render('facebook.png');
    return JSON.parse(resultString);
  }

  async destroy() {
    await this.page.close();
  }
};

function getFacebookDataScript() {
  window.scrollTo(0,document.body.scrollHeight);
  // var userInfo = {};
  // userInfo.avatar = document.querySelector('#entity_sidebar').querySelector('img').getAttribute('src');
  // userInfo.verified = document.querySelectorAll('#entity_sidebar > div')[1].querySelectorAll('a').length === 3;
  // var names = document.querySelectorAll('#entity_sidebar > div')[1].innerText.split('\n');
  // userInfo.name = names[0];
  // userInfo.address = names[1];

  var nodeLists = document.querySelectorAll('.userContentWrapper');
  var numPosts = nodeLists.length;
  if (numPosts > 0) {
    var avatar = nodeLists[0].querySelector('[role="img"]').getAttribute('src');
    // var fullname = nodeLists[0].querySelectorAll('a[data-hovercard]')[1].innerText;
    var username = location.pathname.replace('pg', '').replace('posts', '').replace(new RegExp(/\//g), '');
  }
  var posts = [];
  for (var i = 0; i < numPosts; i++) {
    var nodeItem = nodeLists[i];
    var p = {};
    p.avatar = avatar;
    p.fullname = '';
    p.username = username;
    p.date = nodeItem.querySelector('.timestampContent').innerText;
    p.caption = nodeItem.querySelector('.userContent').innerText.split('...')[0];
    p.url = 'https://www.facebook.com' + nodeItem.querySelector('[data-testid="story-subtitle"]').querySelector('a').getAttribute('href').split('?')[0];
    // var feedbackSummary = document.querySelector('.userContentWrapper').querySelector('[data-testid="fbFeedStoryUFI/feedbackSummary"]').innerText.split('\n');
    // p.like = feedbackSummary[1];
    // p.comment = feedbackSummary[2];
    // p.share = feedbackSummary[3];
    posts.push(p);
  }
  return JSON.stringify(posts);
}