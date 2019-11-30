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
    const url = `https://www.facebook.com/${option.query}`;
    option.total = option.total || 5;
    this.total = option.total;

    await this.page.open(url);
    this.postsContainer = await this.crawlData();
    const returnPosts = this.postsContainer.splice(0, option.total < 5 ? option.total : 5);
    this.total -= returnPosts.length;
    return returnPosts; // at most 5 posts for first time
  }

  async continueLoad() {
    if (this.total <= 0) return [];

    let posts = await this.crawlData();
    this.postsContainer = this.postsContainer.concat(posts);
    const returnPosts = this.postsContainer.splice(0, this.total < posts.length ? this.total : posts.length);
    this.total -= returnPosts.length;
    return returnPosts;
  }

  async crawlData() {
    const resultString = await this.page.evaluate(getFacebookDataScript);
    return JSON.parse(resultString);
  }

  async destroy() {
    await this.page.close();
  }
};

function getFacebookDataScript() {
  var userInfo = {};
  userInfo.avatar = document.querySelector('[alt~="Profile"]').getAttribute('src');
  userInfo.verified = !!document.querySelector('[aria-label="Verified Page"]');
  var names = document.querySelector('#m-timeline-cover-section').querySelector('div').innerText.split('\n');
  userInfo.name = names[0];
  userInfo.address = names[1];

  var nodeLists = document.querySelectorAll('[role="article"]');
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
    p.text = nodeItem.querySelector('.tweet-text').innerText;
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