module.exports = {
  base_url: 'https://www.instagram.com/',
  login_url: '/accounts/login/ajax/',
  logout_url: '/accounts/logout/',
  chrome_win_ua: 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',

  stories_url: '/graphql/query/?query_hash=45246d3fe16ccc6577e0bd297a5db1ab&variables=%7B%22reel_ids%22%3A%5B%22{0}%22%5D%2C%22tag_names%22%3A%5B%5D%2C%22location_ids%22%3A%5B%5D%2C%22highlight_reel_ids%22%3A%5B%5D%2C%22precomposed_overlay%22%3Afalse%7D',
  stories_ua: 'Instagram 52.0.0.8.83 (iPhone; CPU iPhone OS 11_4 like Mac OS X; en_US; en-US; scale=2.00; 750x1334) AppleWebKit/605.1.15',

  query_followings: '/graphql/query/?query_hash=c56ee0ae1f89cdbd1c89e2bc6b8f3d18&variables=',
  query_comments: '/graphql/query/?query_hash=33ba35852cb50da46f5b5e889df7d159&variables=',
  query_hashtag: '/graphql/query/?query_hash=ded47faa9a1aaded10161a2ff32abb6b&variables=',
  query_location: '/graphql/query/?query_hash=ac38b90f0f3981c42092016a37c59bf7&variables=',
  query_media: '/graphql/query/?query_hash=42323d64886122307be10013ad2dcc44&variables=',

  connect_timeout: 90 * 1000,
  max_retries: 5,
  retry_delay: 5,
  max_retry_delay: 60 * 1000,

  latest_stamps_user_section: 'users',
}