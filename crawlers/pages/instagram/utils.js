const allSettled = require('promise.allsettled');
const axios = require('axios');
const humanizeDuration = require('humanize-duration');

async function getInstagramPostData(url) {
  const { data : jsonData } = await axios.get(`https://www.instagram.com${url}?__a=1`);
  const returnObject = {};
  returnObject['likeCount'] = jsonData['graphql']['shortcode_media']['edge_media_preview_like']['count'];
  returnObject['commentCount'] = jsonData['graphql']['shortcode_media']['edge_media_preview_comment']['count'];
  returnObject['caption'] = jsonData['graphql']['shortcode_media']['edge_media_to_caption']['edges'][0]['node']['text'];
  const imageSources = jsonData['graphql']['shortcode_media']['display_resources'];
  returnObject['medias'] = imageSources[imageSources.length - 1]['src'];
  returnObject['fullname'] = jsonData['graphql']['shortcode_media']['owner']['full_name'];
  returnObject['username'] = jsonData['graphql']['shortcode_media']['owner']['username'];
  returnObject['avatar'] = jsonData['graphql']['shortcode_media']['owner']['profile_pic_url'];
  const takenTimestamp = jsonData['graphql']['shortcode_media']['taken_at_timestamp'];
  returnObject['date'] = humanizeDuration(Date.now() - takenTimestamp * 1000, { largest: 1, maxDecimalPoints: 0 }) + ' ago';

  return returnObject;
}

async function getInstagramPosts(urls) {
  const settledPosts = await allSettled(urls.map(getInstagramPostData));

  let resolvedPostsData = [];
  let resolvedUrls = [];
  settledPosts.forEach((p, idx) => {
    if (p.status === 'fulfilled') {
      resolvedPostsData.push(p.value);
      resolvedUrls.push(urls[idx]);
    }
  });

  return { resolvedUrls, resolvedPostsData };
}

module.exports = { getInstagramPosts }