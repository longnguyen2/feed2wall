var args = require('system').args;
var page = require('webpage').create();
if (args.length < 4) {
  console.log('Error: Missing required arguments');
} else {
  var queryName = args[1];
  var type = args[2];
  var maxPostCount = args[3];

  switch (type) {
    case 'profile':
      fetchData('https://www.instagram.com/' + queryName, maxPostCount);
      break;
    case 'hashtag':
      fetchData('https://www.instagram.com/explore/tags/' + queryName, maxPostCount);
      break;
  }
}

function fetchData(url, maxPostCount) {
  page.settings.loadImages = false;

  page.open(url, 'get', function (status) {
    if (status === 'success') {
      _fetchData(maxPostCount);
    } else {
      console.log('Error: Cannot fetch data');
    }
  });
}

function _fetchData(numberOfPostToFetch, lastUrl) {
  var script = function() {
      window.scrollTo(0,document.body.scrollHeight);
      var posts = Array.from(document.getElementsByTagName('body')[0].querySelectorAll('article a'));
      var result = [];
      for (var i = 0; i < posts.length; i++) {
         result.push(posts[i].getAttribute('href'));
      }
      return result.toString();
  }

  setTimeout(function(){
    var hrefs = page.evaluate(script);
    var urls = hrefs.split(',');
    if (lastUrl) urls = urls.slice(urls.indexOf(lastUrl), urls.length);
    console.log(urls);

    var urlsLen = urls.length;
    if (urlsLen < numberOfPostToFetch)
      _fetchData(numberOfPostToFetch - urlsLen, urls[urlsLen - 1]);
    else
      phantom.exit();
  }, 5000);
}