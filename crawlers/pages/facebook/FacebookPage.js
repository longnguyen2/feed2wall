const config = require('../config');
const normalizeData = require('./utils').normalizeData;

module.exports = class InstagramPage {
  constructor(page) {
    this.page = page;
    this.page.setting('userAgent', config.user_agent);
    this.page.setting('loadImages', false);
    this.total = 0;
    this.finishedUrls = [];
    this.postsContainer = [];
  }

  async initLoad(option) {
    const url = `https://www.facebook.com/pg/${option.query}/posts`;
    option.total = option.total || 100;
    this.total = option.total;

    await this.page.open(url);
    const tempData = await this.scrollAndCrawlData(5000);
    const { resolvedUrls, resolvedPostsData } = await normalizeData(tempData);
    this.finishedUrls = resolvedUrls;
    this.postsContainer = resolvedPostsData;
    const returnPosts = this.postsContainer.splice(0, option.total < 5 ? option.total : 5); // at most 5 posts for first time
    this.total -= returnPosts.length;
    return returnPosts;
  }

  async continueLoad() {
    if (this.total <= 0) return [];

    const tempData = await this.scrollAndCrawlData(1000);
    const { resolvedUrls, resolvedPostsData } = await normalizeData(tempData.filter(p => !this.finishedUrls.includes(p.url)));
    this.finishedUrls = this.finishedUrls.concat(resolvedUrls);
    this.postsContainer = this.postsContainer.concat(resolvedPostsData);
    const returnPosts = this.postsContainer.splice(0, this.total < resolvedPostsData.length ? this.total : resolvedPostsData.length);
    this.total -= returnPosts.length;
    return returnPosts;
  }

  async scrollAndCrawlData(delay) {
    let sleeper = function() {
      return new Promise(resolve => setTimeout(() => resolve(), delay));
    };
    const resultString = await sleeper().then(() => this.page.evaluate(getFacebookDataScript));
    return JSON.parse(resultString);
  }

  async destroy() {
    await this.page.close();
  }
};

function getFacebookDataScript() {
  window.scrollTo(0,document.body.scrollHeight);
  document.querySelector('#www_pages_reaction_see_more_unitwww_pages_posts').click();

  var nodeLists = document.querySelectorAll('.userContentWrapper');
  var numPosts = nodeLists.length;
  if (numPosts > 0) {
    var avatar = nodeLists[0].querySelector('[role="img"]').getAttribute('src');
    var fullname = nodeLists[0].querySelector('[data-ft="{\\"tn\\":\\"k\\"}"]').innerText;
    var username = location.pathname.replace('pg', '').replace('posts', '').replace(new RegExp(/\//g), '');
  }
  var posts = [];
  for (var i = 0; i < numPosts; i++) {
    var nodeItem = nodeLists[i];
    var p = {};
    p.avatar = avatar;
    p.fullname = fullname;
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