const config = require('../config');

module.exports = class InstagramPage {
  constructor(page) {
    this.page = page;
    this.page.setting('userAgent', config.chrome_win_ua);
    this.page.setting('loadImages', false);
    this.total = 0;
    this.postsContainer = [];
  }

  async initLoad(option) {
    const filter = option.filter || 'tweets';
    const url = `https://www.twitter.com/search?l=&vertical=default&q=${option.query}&f=${filter}`;
    option.total = option.total || 5;
    this.total = option.total;

    await this.page.open(url);
    this.postsContainer = await this.scrollAndCrawlData(10 * 1000);
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
    const resultString = await sleeper().then(() => this.page.evaluate(getTwitterDataScript));
    return JSON.parse(resultString);
  }

  async destroy() {
    await this.page.close();
  }
};

function getTwitterDataScript() {
  window.scrollTo(0,document.body.scrollHeight);
  var nodeLists = document.querySelectorAll('li.js-stream-item.stream-item');
  var numPosts = nodeLists.length;
  var posts = [];
  for (var i = 0; i < numPosts; i++) {
    var nodeItem = nodeLists[i];
    var p = {};
    p.avatar = nodeItem.querySelector('.avatar').getAttribute('src');
    p.fullname = nodeItem.querySelector('.fullname').innerText;
    p.verified = nodeItem.querySelector('.Icon--verified') !== null;
    p.username = nodeItem.querySelector('.username').innerText;
    p.date = nodeItem.querySelector('.js-short-timestamp').innerText;
    p.replyTo = [];
    var replyNode = nodeItem.querySelector('.ReplyingToContextBelowAuthor');
    if (replyNode) {
      var replyNodeLists = replyNode.querySelectorAll('a');
      for (var j = 0; j < replyNodeLists.length; j++) {
        p.replyTo.push(replyNodeLists[j].innerText);
      }
    }
    p.caption = nodeItem.querySelector('.tweet-text').innerText;
    var mediaNode = nodeItem.querySelector('.AdaptiveMedia');
    p.medias = [];
    if (mediaNode) {
      var medias = mediaNode.querySelectorAll('[src]');
      for (var k = 0; k < medias.length; k++) {
        p.medias.push(medias[k].tagName.toLowerCase() === 'img' ? medias[k].getAttribute(('src')) : medias[k].getAttribute(('poster')));
      }
    }
    p.comment = nodeItem.querySelectorAll('.ProfileTweet-action--reply')[1].querySelector('.ProfileTweet-actionCount').innerText;
    p.retweet = nodeItem.querySelectorAll('.ProfileTweet-action--retweet')[1].querySelector('.ProfileTweet-actionCount').innerText;
    p.like = nodeItem.querySelectorAll('.ProfileTweet-action--favorite')[1].querySelector('.ProfileTweet-actionCount').innerText;
    posts.push(p);
  }
  return JSON.stringify(posts);
}