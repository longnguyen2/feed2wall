const PagePool = require('./pagePool');
const profileUrl = 'https://www.instagram.com/';
const hashtagUrl = 'https://www.instagram.com/explore/tags/';

module.exports = async function getInstagramPosts(id, queryName, { type, total }) {
  if (id) {
    const posts = await PagePool.getPage(id).continueLoad();
    return { id, posts }
  } else if (queryName) {
    type = type || 'profile';
    total = total || 5;

    let url;
    switch (type) {
      case 'profile':
        url = profileUrl + queryName;
        break;
      case 'hashtag':
        url = hashtagUrl + queryName;
        break;
    }

    const id = await PagePool.createNewPage();
    const posts = await PagePool.getPage(id).initLoad(url, total);
    return { id, posts }
  } else {
    return { id: '', posts: [] }
  }
}