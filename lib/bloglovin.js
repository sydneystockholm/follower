var debug = require('debug')('follower:network:bloglovin')
  , request = require('./request');

/**
 * Create a new Bloglovin instance.
 *
 * @param {Object} options (optional)
 */

function Bloglovin(options) {
    options = options || (options = {});
    this.request = options.request || request;
    if (options.cache) {
        options.cache.memoise(this);
    }
}

exports.Bloglovin = Bloglovin;

/**
 * Get the number of bloglovin followers a blog has.
 *
 * Example:
 *   bloglovin.followerCount('3668940', function (err, followers) {
 *       console.log(followers); // => 20580
 *   });
 *
 * @param {String} url
 * @param {String} callback
 */

Bloglovin.prototype.followerCount = function (url, callback) {
    url += '';
    if (url.indexOf('/') === -1) {
        url = 'http://www.bloglovin.com/blog/' + url;
    } else if (!/^http:\/\//.test(url)) {
        url = 'http://' + url;
    }
    this.request(url, function (err, response) {
        if (err) return callback(err);
        if (/<strong>([0-9 \r\t\n]+?)<\/strong>/.test(response.body)) {
            var followers = Number(RegExp.$1.replace(/ /g, ''));
            debug(followers + ' following ' + url);
            return callback(null, followers);
        }
        debug('Failed to get bloglovin follower count for ' + url);
        callback(new Error('Invalid response'));
    });
};

