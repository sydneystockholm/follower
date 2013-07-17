/**
 * Create a new Instagram instance.
 *
 * @param {Request} request
 * @param {String} client_id (optional)
 * @param {String} secret (optional)
 */

function Instagram(request, client_id, secret) {
    this.request = request;
    this.client_id = client_id;
    this.secret = secret;
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
    var url = 'http://instagram.com/' + encodeURIComponent(username);
    this.request(url, function (err, response) {
        if (err) return callback(err);
        if (!/"followed_by":([0-9]+?),/.test(response.body)) {
            return callback(new Error('Invalid response'));
        }
        callback(null, Number(RegExp.$1));
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

Instagram.prototype.latestMedia = function (username, callback) {
    var url = 'http://instagram.com/' + encodeURIComponent(username);
    this.request(url, function (err, response) {
        if (err) return callback(err);
        if (!/\["lib\\\/fullpage\\\/transitions","bootstrap",\[(\{.+?\}\})\]\],/.test(response.body)) {
            return callback(new Error('Invalid response'));
        }
        try {
            var media = JSON.parse(RegExp.$1).props.userMedia.map(function (item) {
                return {
                    id: item.id
                  , type: item.type
                  , link: item.link
                  , caption: item.caption && item.caption.text ? item.caption.text : null
                  , image: item.images.standard_resolution.url
                  , user: username
                  , date: new Date(item.created_time * 1000)
                };
            });
            callback(null, media);
        } catch (e) {
            callback(new Error('Invalid response'));
        }
    });
};

