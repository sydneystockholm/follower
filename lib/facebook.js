var debug = require('debug')('follower:network:facebook')
  , request = require('./request');

/**
 * Create a new Facebook instance.
 *
 * @param {Object} options
 */

function Facebook(options) {
    options = options || (options = {});
    this.request = options.request || request;
    if (options.cache) {
        options.cache.memoise(this);
    }
}

exports.Facebook = Facebook;

/**
 * Get the number of likes associated with a URL.
 *
 * Example:
 *   facebook.urlLikes('http://facebook.com', function (err, likes) {
 *       console.log(likes); // => 6526642
 *   });
 *
 * @param {String} url
 * @param {Function} callback
 */

Facebook.prototype.urlLikes = function (url, callback) {
    var url_ = this.request.build('https://graph.facebook.com/fql', {
        q: 'SELECT url, normalized_url, share_count, like_count, ' +
           'comment_count, total_count, click_count FROM link_stat ' +
           'WHERE url = "' + url.replace(/"/g, '\\"') + '"'
    });
    this.request.json(url_, function (err, likes) {
        if (err) return callback(err);
        if (!likes.data || !likes.data.length) {
            debug('Failed to get likes for ' + url);
            return callback(new Error('No data for ' + url));
        }
        likes = likes.data[0].total_count;
        debug(likes + ' likes for ' + url);
        callback(null, likes);
    });
};

/**
 * Get the number of likes associated with a Facebook page.
 *
 * Example:
 *   facebook.pageLikes('https://www.facebook.com/baconaddicts', function (err, likes) {
 *       console.log(likes); => 721712
 *   });
 *
 * @param {String} url
 * @param {Function} callback
 */

Facebook.prototype.pageLikes = function (url, callback) {
    var id = url;
    //Extract an ID for use with the Facebook graph API
    if (url.indexOf('/') !== -1) {
        if (/^(?:https?:\/\/)?(?:www\.)?facebook\.com(?:\/pages\/[^\/]+?)?\/([^\/\?]+)/i.test(url)) {
            id = RegExp.$1;
            debug(id + ' is the ID for page ' + url);
        } else {
            debug('Failed to parse page ID from ' + url);
            return callback(new Error('Invalid page'));
        }
    }
    this.request.json('https://graph.facebook.com/' + id, function (err, entity) {
        if (err) return callback(err);
        debug(entity.likes + ' likes for page ' + url);
        callback(null, entity.likes);
    });
};

