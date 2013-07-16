var request = require('./request')
  , Facebook = exports;

/**
 * Get the number of likes associated with a URL.
 *
 * Example:
 *   Facebook.urlLikes('http://facebook.com', function (err, likes) {
 *       console.log(likes); // => 6526642
 *   });
 *
 * @param {String} url
 * @param {Function} callback
 */

Facebook.urlLikes = function (url, callback) {
    url = request.build('https://graph.facebook.com/fql', {
        q: 'SELECT url, normalized_url, share_count, like_count, ' +
           'comment_count, total_count, click_count FROM link_stat ' +
           'WHERE url = "' + url.replace(/"/g, '\\"') + '"'
    });
    request.json(url, function (err, likes) {
        if (err) return callback(err);
        if (!likes.data || !likes.data.length) {
            return callback(new Error('No data for ' + url));
        }
        callback(null, likes.data[0].total_count);
    });
};

/**
 * Get the number of likes associated with a Facebook page.
 *
 * Example:
 *   Facebook.pageLikes('https://www.facebook.com/baconaddicts', function (err, likes) {
 *       console.log(likes); => 721712
 *   });
 *
 * @param {String} url
 * @param {Function} callback
 */

Facebook.pageLikes = function (url, callback) {
    var id = url;
    //Extract an ID for use with the Facebook graph API
    if (url.indexOf('/') !== -1) {
        var a = /(?:https?:\/\/)?(?:www\.)?facebook\.com\/pages\/[^\/]+\/([^\/\?]+)/i
          , b = /(?:https?:\/\/)?(?:www\.)?facebook\.com\/([^\/\?]+)/i
          , match;
        if ((match = url.match(a)) || (match = url.match(b))) {
            id = match[1];
        } else {
            return callback(new Error('Invalid page'));
        }
    }
    request.json('https://graph.facebook.com/' + id, function (err, entity) {
        if (err) return callback(err);
        callback(null, entity.likes);
    });
};

