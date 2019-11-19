const config  = require('./config');
const axios   = require('axios');
const { get } = require('lodash');
const crypto  = require('crypto');

async function initAxiosInstance() {
  const request = await axios.get(config.base_url, { headers: { 'Referer': config.base_url, 'user-agent': config.stories_ua }});
  const csrfToken = request.headers['set-cookie'].filter(cookie => cookie.includes('csrftoken'))[0]
                           .split(';').filter(cookie => cookie.includes('csrftoken'))[0]
                           .split('=')[0];
  return axios.create({
    baseURL: config.base_url,
    timeout: config.connect_timeout,
    headers: { 'Referer': config.base_url, 'X-CSRFToken': csrfToken, 'user-agent': config.chrome_win_ua }
  });
}

function genIgGisHeader(rhxGis, queryVariables) {
  return crypto.createHash('md5').update(`${rhxGis}:${queryVariables}`, 'utf8').digest('hex');
}

async function scrape_profile(username, option) {
  const instagramInstance = await initAxiosInstance();
  instagramInstance.defaults.headers.get['user-agent'] = config.stories_ua;

  // get user info
  const { data: response } = await instagramInstance.get(config.base_url + username);
  const shared_data = response.split('window._sharedData = ')[1].split(';</script>')[0];
  const user = get(JSON.parse(shared_data), 'entry_data.ProfilePage[0].graphql.user', null);

  if (user === null) {
    throw new Error(`Error getting user details for ${username}. Please verify that the user exists.`);
  } else if (user && user['is_private'] && user['edge_owner_to_timeline_media']['count'] > 0
      && !user['edge_owner_to_timeline_media']['edges']) {
    throw new Error(`User ${username} is private`);
  }

  // x-instagram-gis issue
  // https://stackoverflow.com/questions/49786980/how-to-perform-unauthenticated-instagram-web-scraping-in-response-to-recent-priv
  const userId = user['id'];
  const rhxGis = '';
  const queryVariables = `{"id":"${userId}","first":${option.batch},"after":"${option.endCursor}"}`;
  instagramInstance.defaults.headers.get['x-instagram-gis'] = genIgGisHeader(rhxGis, queryVariables);

  const { data: fetchedData } = await instagramInstance.get(config.query_media + queryVariables);
  const result = {};

  return fetchedData;
}

async function scrape_hashtag(hashtag, option) {

}

async function scrape_location(location, option) {

}

/**
 * Entry function
 * @param query: used as username or hashtag or location
 * @param option: option fetch option
 * @param option.type: fetch posts by user_profile or hashtag or location
 * @param option.batch: number of posts to fetch
 * @param option.endCursor: last fetched post (if last post is 25th, then fetch data after 25th post)
 * @param option.filterIn: including hashtags
 * @param option.filterOut: excluding hashtags
 */
module.exports.scrape = async function scrape(query, option) {
  option           = option           || {};
  option.type      = option.type      || 'profile';
  option.batch     = option.batch     || 12;
  option.endCursor = option.endCursor || '';

  switch (option.type) {
    case 'profile':
      return scrape_profile(query, option);
    case 'hashtag':
      return scrape_hashtag(query, option);
    case 'location':
      return scrape_location(query, option);
  }
}