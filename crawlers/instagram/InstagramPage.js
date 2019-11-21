const { getPosts } = require('./utils');
const { pullAll } = require('lodash');

module.exports = class InstagramPage {
  constructor(page) {
    this.page = page;
    this.page.setting('loadImages', false);
    this.total = 0;
    this.finishedUrls = [];
  }

  async initLoad(url, total) {
    this.total = total;

    await this.page.open(url);
    let urls = await this.scrollAndGetUrls(5 * 1000);
    urls = urls.slice(0, 5 < total ? 5: total); // fetch at most 5 posts for the first time

    const { resolvedUrls, resolvedPostsData } = await getPosts(urls);
    this.finishedUrls = this.finishedUrls.concat(resolvedUrls);
    this.total -= resolvedPostsData.length;

    return resolvedPostsData;
  }

  async continueLoad() {
    let urls = await this.scrollAndGetUrls(1000);
    urls = pullAll(urls, this.finishedUrls);
    urls = urls.slice(0, this.total);

    const { resolvedUrls, resolvedPostsData } = await getPosts(urls);
    this.finishedUrls = this.finishedUrls.concat(resolvedUrls);
    this.total -= resolvedPostsData.length;

    return resolvedPostsData;
  }

  async scrollAndGetUrls(delay) {
    let sleeper = function() {
      return new Promise(resolve => setTimeout(() => resolve(), delay));
    };
    const hrefs = await Promise.resolve().then(sleeper()).then(() => this.page.evaluate(getPostsUrlScript));
    return hrefs.split(',');
  }

  async destroy() {
    await this.page.close();
  }
}

function getPostsUrlScript() {
  window.scrollTo(0,document.body.scrollHeight);
  var posts = Array.from(document.getElementsByTagName('body')[0].querySelectorAll('article a'));
  var result = [];
  for (var i = 0; i < posts.length; i++) {
    result.push(posts[i].getAttribute('href'));
  }
  return result.toString();
}