const spawn = require('child_process').spawn;
const path = require('path');

/**
 * This method converts a Uint8Array to its string representation
 * @return {string}
 */
function Uint8ArrToString(myUint8Arr) {
  return String.fromCharCode.apply(null, myUint8Arr);
}

/**
 * Entry function
 * @param queryName: used as username or hashtag
 * @param option: option fetch option
 * @param option.type: fetch posts by user_profile or hashtag
 * @param option.total: total posts to fetch
 * @param callback
 */
module.exports.runInstagramScript = function runInstagramScript(queryName, option, callback) {
  const phantomExecutable = '/usr/local/Cellar/phantomjs-2.1.1-macosx/bin/phantomjs';
  const args = [path.join(__dirname, "phantomScript.js"), queryName, ...Object.values(option)];
  const child = spawn(phantomExecutable, args, {});

  child.stdout.on('data', function(data) {
    const textData = Uint8ArrToString(data);
    if (textData.includes('Error')) callback(textData);
    else callback(null, textData);
  });

  child.stderr.on('data', function(err) {
    const textErr = Uint8ArrToString(err);
    callback(textErr);
  });

  child.on('error', function(err) {
    callback(err);
  })

  child.on('close', function() {
    callback();
  });
}