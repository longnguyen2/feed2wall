const { runInstagramScript } = require('./phantomProcess');
const { last, get } = require('lodash');
const axios = require('axios');

async function getPostData(url) {
  const { data : jsonData } = await axios.get(`https://www.instagram.com${url}?__a=1`);
  const returnObject = {};
  returnObject['likeCount'] = get(jsonData, 'graphql.shortcode_media.edge_media_preview_like.count', 0);
  returnObject['commentCount'] = get(jsonData, 'graphql.shortcode_media.edge_media_preview_comment.count', 0);
  returnObject['caption'] = get(jsonData, 'graphql.shortcode_media.edge_media_to_caption.edges[0].node.text', '');
  const imageSources = get(jsonData, 'graphql.shortcode_media.display_resources', []);
  returnObject['image'] = get(last(imageSources), 'src', '');
  returnObject['username'] = get(jsonData, 'graphql.shortcode_media.owner.username', '');
  returnObject['userProfilePic'] = get(jsonData, 'graphql.shortcode_media.owner.profile_pic_url', '');

  return returnObject;
}

module.exports = function getInstagramPosts(queryName, option, callback) {
  runInstagramScript(queryName, option, (err, data) => {
    if (err) callback(err);
    if (data) {
      let urls = data.split(',');
      urls = urls.slice(0, option.total);
      callback(null, urls.map(getPostData));
    }
  });
}