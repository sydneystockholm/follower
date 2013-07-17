var request = require('./request')
  , Instagram = exports;

/**
 * Get the number of followers a user has.
 *
 * Example:
 *   Instagram.followerCount('chris6F', function (err, followers) {
 *       console.log(followers); // => 150
 *   });
 *
 * @param {String} username
 * @param {Function} callback
 */

Instagram.followerCount = function (username, callback) {
    request('http://instagram.com/' + encodeURIComponent(username), function (err, response) {
        if (err) return callback(err);
        if (!/"followed_by":([0-9]+?),/.test(response.body)) {
            return callback(new Error('Invalid response'));
        }
        callback(null, Number(RegExp.$1));
    });
};

