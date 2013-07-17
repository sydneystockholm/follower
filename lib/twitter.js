/**
 * Create a new Twitter instance.
 *
 * @param {Request} request
 */

function Twitter(request) {
    this.request = request;
}

exports.Twitter = Twitter;

/**
 * Get the number of followers a user has.
 *
 * Example:
 *   Twitter.followerCount('chris6F', function (err, followers) {
 *       console.log(followers); // => 252
 *   });
 *
 * @param {String} username
 * @param {Function} callback
 */

Twitter.prototype.followerCount = function (username, callback) {
    var url = this.request.build('https://cdn.api.twitter.com/1/users/show.json', {
        screen_name: username
    });
    this.request.json(url, function (err, user) {
        if (err) return callback(err);
        if (!('followers_count' in user)) {
            return callback(new Error('Invalid response'));
        }
        callback(null, user.followers_count);
    });
};

/**
 * Get the number of tweets associated with a URL.
 *
 * Example:
 *   Twitter.urlTweets('http://example.com', function (err, tweets) {
 *       console.log(tweets); // => 102938
 *   });
 *
 * @param {String} url
 * @param {String} callback
 */

Twitter.prototype.urlTweets = function (url, callback) {
    url = this.request.build('https://cdn.api.twitter.com/1/urls/count.json', {
        url: url
    });
    this.request.json(url, function (err, url) {
        if (err) return callback(err);
        if (!('count' in url)) {
            return callback(new Error('Invalid response'));
        }
        callback(null, url.count);
    });
};

