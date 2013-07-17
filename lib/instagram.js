/**
 * Create a new Instagram instance.
 *
 * @param {Request} request
 */

function Instagram(request) {
    this.request = request;
}

exports.Instagram = Instagram;

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

Instagram.prototype.followerCount = function (username, callback) {
    var url = 'http://instagram.com/' + encodeURIComponent(username);
    this.request(url, function (err, response) {
        if (err) return callback(err);
        if (!/"followed_by":([0-9]+?),/.test(response.body)) {
            return callback(new Error('Invalid response'));
        }
        callback(null, Number(RegExp.$1));
    });
};

