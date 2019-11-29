const { getInstagramPosts } = require('./utils');
const { pullAll } = require('lodash');

module.exports = class InstagramPage {
  constructor(page) {
    this.page = page;
    page.on('onUrlChanged', function(targetUrl) {
      if (targetUrl.includes('login')) {
        // todo handle login exception
      }
    });
    this.page.setting('loadImages', false);
    this.total = 0;
    this.finishedUrls = [];
  }

  async initLoad(option) {
    const { url, total } = this.constructUrl(option);
    this.total = total;

    await this.page.open(url);
    let urls = await this.scrollAndGetUrls(5 * 1000);
    urls = urls.slice(0, 5 < total ? 5: total); // fetch at most 5 posts for the first time

    const { resolvedUrls, resolvedPostsData } = await getInstagramPosts(urls);
    this.finishedUrls = this.finishedUrls.concat(resolvedUrls);
    this.total -= resolvedPostsData.length;

    return resolvedPostsData;
  }

  async continueLoad() {
    if (this.total <= 0) return [];

    let urls = await this.scrollAndGetUrls(1000);
    urls = pullAll(urls, this.finishedUrls);
    urls = urls.slice(0, this.total);

    const { resolvedUrls, resolvedPostsData } = await getInstagramPosts(urls);
    this.finishedUrls = this.finishedUrls.concat(resolvedUrls);
    this.total -= resolvedPostsData.length;

    return resolvedPostsData;
  }

  async scrollAndGetUrls(delay) {
    let sleeper = function() {
      return new Promise(resolve => setTimeout(() => resolve(), delay));
    };
    const hrefs = await sleeper().then(() => this.page.evaluate(getInstagramPostsUrlScript));
    return hrefs.split(',');
  }

  async destroy() {
    await this.page.close();
  }

  constructUrl(option) {
    const accountUrl = 'https://www.instagram.com/';
    const hashtagUrl = 'https://www.instagram.com/explore/tags/';
    const type = option.type || 'account';
    const total = option.total || 5;
    if (!option.queryName) return { url: '', total: total };

    let url;
    switch (type) {
      case 'account':
        url = accountUrl + option.queryName;
        break;
      case 'hashtag':
        url = hashtagUrl + option.queryName;
        break;
    }
    return { url, total };
  }
}

function getInstagramPostsUrlScript() {
  window.scrollTo(0,document.body.scrollHeight);
  var posts = Array.from(document.getElementsByTagName('body')[0].querySelectorAll('article a'));
  var result = [];
  for (var i = 0; i < posts.length; i++) {
    result.push(posts[i].getAttribute('href'));
  }
  return result.toString();
}