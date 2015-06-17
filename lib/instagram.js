var debug = require('debug')('follower:network:instagram')
  , request = require('./request');

/**
 * Create a new Instagram instance.
 *
 * @param {Object} options (optional)
 */

function Instagram(options) {
    options = options || (options = {});
    this.request = options.request || request;
    this.client_id = options.client_id;
    this.secret = options.secret;
    if (options.cache) {
        options.cache.memoise(this);
    }
}

exports.Instagram = Instagram;

/**
 * Get the number of followers a user has.
 *
 * Example:
 *   instagram.followerCount('chris6F', function (err, followers) {
 *       console.log(followers); // => 150
 *   });
 *
 * @param {String} username
 * @param {Function} callback
 */

Instagram.prototype.followerCount = function (username, callback) {
    var url = 'https://instagram.com/' + encodeURIComponent(username);
    this.request(url, function (err, response) {
        if (err) return callback(err);
        if (!/\"followed_by\":\{\"count\":(\d+)\}/.test(response.body)) {
            debug('Failed to get follower count for %s', username);
            return callback(new Error('Invalid response'));
        }
        var followers = Number(RegExp.$1);
        debug('%s follow %s', followers, username);
        callback(null, followers);
    });
};

/**
 * Get the latest media from a user.
 *
 * Example:
 *   instagram.latestMedia('chris6F', function (err, media) {
 *       console.log(media);
 *   });
 *
 * Result:
 *   [ { id: '499700017606360403_43808006',
 *       type: 'image',
 *       link: 'http://instagram.com/p/bvSoS7rv1T/',
 *       caption: '#clowns',
 *       image: 'http://distilleryimage11.s3.amazonaws.com/a0c6b66aec5b11e2bb5722000a1fd013_7.jpg',
 *       user: 'chris6F',
 *       date: Sun Jul 14 2013 18:01:45 GMT+1000 (EST) }
 *   , { id: '485000692733247032_43808006',
 *       type: 'image',
 *       link: 'http://instagram.com/p/a7EY92Lv44/',
 *       caption: 'Unboxing',
 *       image: 'http://distilleryimage8.s3.amazonaws.com/beecd3e0dc6b11e28aa822000a1fd52c_7.jpg',
 *       user: 'chris6F',
 *       date: Mon Jun 24 2013 11:16:49 GMT+1000 (EST) }
 *   , ... ]
 *
 * @param {String} username
 * @param {Function} callback
 */

var instagramData = /<script type="text\/javascript">window._sharedData = (\{.+?\});<\/script>/;

Instagram.prototype.latestMedia = function (username, callback) {
    var url = 'https://instagram.com/' + encodeURIComponent(username);
    this.request(url, function (err, response) {
        if (err) return callback(err);
        if (!instagramData.test(response.body)) {
            debug('Failed to get media from user %s due to invalid response', username);
            return callback(new Error('Invalid response'));
        }
        try {
            var data = JSON.parse(RegExp.$1).entry_data.ProfilePage[0].user;
            var media = data.media.nodes.map(function (item) {
                return {
                    id: item.id
                  , is_video: item.is_video
                  , comments: item.comments.count
                  , likes: item.likes.count
                  , code: item.code
                  , image: item.display_src
                  , owner: item.owner.id
                  , date: new Date(item.date * 1000)
                };
            });
            debug('Got %s items for user %s', media.length, username);
            callback(null, media);
        } catch (e) {
            debug('Failed to get media from user %s', username);
            callback(new Error('Invalid response'));
        }
    });
};

/**
 * Get the latest media for a #hashtag.
 *
 * This function requires an OAuth client_id / secret from Instagram. See
 * http://instagram.com/developer/ for more information.
 *
 * Example:
 *   instagram.latestHashtagMedia('yolo', function (err, media) {
 *       console.log(media);
 *   });
 *
 * Result: same as `Instagram.latestMedia()`
 *
 * @param {String} hashtag
 * @param {Function} callback
 */

Instagram.prototype.latestHashtagMedia = function (hashtag, callback) {
    if (!this.client_id || !this.secret) {
        debug('Missing Instagram OAuth details');
        return callback(new Error('This function requires an Instagram client_id/secret'));
    }
    var hashtag_ = encodeURIComponent(hashtag.replace(/^#/, ''))
      , self = this
      , url = 'https://api.instagram.com/v1/tags/' + hashtag_ + '/media/recent/' +
        '?client_id=' + this.client_id;
    this.request.json(url, function (err, body) {
        if (err) return callback(err);
        try {
            var media = body.data.map(function (item) {
                return self._normaliseItem(item);
            });
            debug('Got %s items for hashtag %s', media.length, hashtag);
            callback(null, media);
        } catch (e) {
            debug('Failed to get media for hashtag %s', hashtag);
            callback(new Error('Invalid instagramHashtagMedia() response'));
        }
    });
};

/**
 * Normalise an Instagram item.
 *
 * @param {Object} item
 * @return {Object}
 */

Instagram.prototype._normaliseItem = function (item) {
    return {
        id: item.id
      , type: item.type
      , link: item.link
      , caption: item.caption && item.caption.text ? item.caption.text : null
      , image: item.images.standard_resolution.url
      , user: item.user.username
      , date: new Date(item.created_time * 1000)
    };
};
