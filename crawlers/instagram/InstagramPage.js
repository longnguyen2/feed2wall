const { getPostData } = require('./utils');

module.exports = class InstagramPage {
  constructor(page) {
    this.page = page;
    this.page.setting('loadImages', false);
  }

  async initLoad(url, total) {
    let urls = await this.scrollAndGetUrls(url);
    urls = urls.slice(0, total);
    return Promise.all(urls.map(getPostData));
  }

  async continueLoad(url, total, endCursor) {
    let urls = await this.scrollAndGetUrls(url);
    urls = urls.slice(endCursor, urls.length);
    urls = urls.slice(0, total);
    return Promise.all(urls.map(getPostData));
  }

  async scrollAndGetUrls(url) {
    await this.page.open(url);
    const stringUrls = await this.page.evaluate(getPostsUrlScript);
    return stringUrls.split(',');
  }

  async destroy() {
    this.page.close();
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