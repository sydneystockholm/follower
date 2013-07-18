var debug = require('debug')('follower:network:youtube')
  , request = require('./request');

/**
 * Create a new Youtube instance.
 *
 * @param {Object} options
 */

function Youtube(options) {
    options = options || (options = {});
    this.request = options.request || request;
}

exports.Youtube = Youtube;

/**
 * Get the latest Youtube media from a user.
 *
 * Example:
 *   youtube.latestMedia('TMZ', function (err, media) {
 *       console.log(media);
 *   });
 *
 * Result:
 *   [ { id: 'GGZkYplVBOs',
 *       date: Wed Jul 17 2013 11:00:12 GMT+1000 (EST),
 *       title: 'Foobar',
 *       link: 'http://www.youtube.com/watch?v=GGZkYplVBOs',
 *       image: 'http://img.youtube.com/vi/GGZkYplVBOs/maxresdefault.jpg' }
 *   , { id: 'fu8wNDa067g',
 *       date: Wed Jul 17 2013 09:29:35 GMT+1000 (EST),
 *       title: 'Foobaz',
 *       link: 'http://www.youtube.com/watch?v=fu8wNDa067g',
 *       image: 'http://img.youtube.com/vi/fu8wNDa067g/maxresdefault.jpg' }
 *   , ... ]
 *
 * @param {String} username
 * @param {Function} callback
 */

Youtube.prototype.latestMedia = function (username, callback) {
    var url = 'http://gdata.youtube.com/feeds/api/users/' +
        encodeURIComponent(username) + '/uploads?v=2&alt=jsonc';
    this.request.json(url, function (err, body) {
        try {
            var media = body.data.items.map(function (item) {
                return {
                    id: item.id
                  , date: new Date(item.uploaded)
                  , title: item.title
                  , link: 'http://www.youtube.com/watch?v=' + item.id
                  , image: 'http://img.youtube.com/vi/' + item.id + '/maxresdefault.jpg'
                  , user: username
                };
            });
            debug('Got ' + media.items + ' for user ' + username);
            callback(null, media);
        } catch (e) {
            debug('Failed to get media for user ' + username);
            callback(new Error('Invalid response'));
        }
    });
};

