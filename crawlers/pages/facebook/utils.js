const axios = require('axios');
const allSettled = require('promise.allsettled');

async function normalizeData(posts) {
  const resolvedPostsData = [];
  const resolvedUrls = [];
  const postsMedias = await allSettled(posts.map(p => retrieveImageData(p.url)));

  for (let i = 0; i < posts.length; i++) {
    if (postsMedias[i].status === 'fulfilled') {
      const p = posts[i];
      p.medias = postsMedias[i].value;
      delete p.timestamp;
      resolvedUrls.push(p.url);
      delete p.url;
      resolvedPostsData.push(p);
    }
  }
  return { resolvedUrls, resolvedPostsData };
}

async function retrieveImageData(postUrl) {
  const { data: rawSource } = await axios.get(postUrl);
  let images = [];
  const imageRegExp = new RegExp(/data-ploi="\w+:\/?\/?[^\s]+"/g);
  const uriRegExp = new RegExp(/\w+:\/?\/?[^\s"]+/g);
  try {
    images = images.concat(rawSource.match(imageRegExp).map(s => s.match(uriRegExp)[0].replace(/amp;/g, '')));
  } catch (e) {}

  const videoThumbnailRegExp = new RegExp(/<video[\s\S]*?<\/div>/g);
  try {
    images = images.concat(rawSource.match(videoThumbnailRegExp).map(s => s.match(uriRegExp)[0].replace(/amp;/g, '')));
  } catch (e) {}

  return images;
}

module.exports = { normalizeData };