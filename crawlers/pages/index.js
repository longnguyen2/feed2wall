const PagePool = require('./PagePool');

async function getInstagramPosts(id, option) {
  if (id) {
    return continueGettingPosts(id);
  } else {
    return initGettingPosts(id, option, 'instagram');
  }
}

async function getTwitterPosts(id, option) {
  if (id) {
    return continueGettingPosts(id);
  } else {
    return initGettingPosts(id, option, 'twitter');
  }
}

async function getFacebookPosts(id, option) {
  if (id) {
    return continueGettingPosts(id);
  } else {
    return initGettingPosts(id, option, 'facebook');
  }
}

async function initGettingPosts(id, option, pageType) {
  const newId = await PagePool.createNewPage(pageType);
  const page = PagePool.getPage(newId);
  const posts = await page.initLoad(option);
  return { id: newId, posts: posts };
}

async function continueGettingPosts(id) {
  const page = PagePool.getPage(id);
  const posts = await page.continueLoad();
  return { id, posts };
}

module.exports = { getInstagramPosts, getTwitterPosts, getFacebookPosts };