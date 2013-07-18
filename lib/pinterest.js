var debug = require('debug')('follower:network:pinterest')
  , request = require('./request');

/**
 * Create a new Pinterest instance.
 *
 * @param {Object} options
 */

function Pinterest(options) {
    options = options || (options = {});
    this.request = options.request || request;
    if (options.cache) {
        options.cache.memoise(this);
    }
}

exports.Pinterest = Pinterest;

/**
 * Get the number of pins associated with a URL.
 *
 * Example:
 *   pinterest.urlPins('http://example.com', function (err, pins) {
 *       console.log(pins); // => 102938
 *   });
 *
 * @param {String} url
 * @param {String} callback
 */

Pinterest.prototype.urlPins = function (url, callback) {
    var url_ = this.request.build('http://partners-api.pinterest.com/v1/urls/count.json', {
        url: url
    });
    this.request.json(url_, function (err, pins) {
        if (err) return callback(err);
        if (!('count' in pins)) {
            debug('Failed to get number of pins for ' + url);
            return callback(new Error('Invalid response'));
        }
        debug(pins.count + ' pins for ' + url);
        callback(null, pins.count);
    });
};

/**
 * Get the latest Pinterest media from a user.
 *
 * Example:
 *   pinterest.latestMedia('cohara87', 'snowboarding', function (err, media) {
 *       console.log(media);
 *   });
 *
 * Result:
 *  [ { id: '481955597593074528',
 *      description: 'Snowboarding',
 *      board: 'snowboarding',
 *      link: 'http://pinterestfreeguccibag.com/?961466',
 *      image: 'http://media-cache-ec2.pinimg.com/400x/50/c1/09/50c109d2575095fe68581c5847d11486.jpg' }
 *  , { id: '481955597593074526',
 *      description: '#snowboarding',
 *      board: 'snowboarding',
 *      link: '',
 *      image: 'http://media-cache-ak1.pinimg.com/400x/2d/4f/3b/2d4f3b0f8cceccb956a180ca4358a4c9.jpg' }
 *  , ... ]
 *
 * @param {String} username
 * @param {String} board (optional)
 * @param {Function} callback
 */

Pinterest.prototype.latestMedia = function (username, board, callback) {
    var url = 'http://api.pinterest.com/v3/pidgets';
    if (typeof board === 'function') {
        callback = board;
        board = null;
        url += '/users/' + encodeURIComponent(username);
    } else {
        url += '/boards/' + encodeURIComponent(username) + '/' + encodeURIComponent(board);
    }
    this.request.json(url + '/pins/', function (err, body) {
        if (err) return callback(err);
        try {
            var media = body.data.pins.map(function (pin) {
                return {
                    id: pin.id
                  , description: pin.description
                  , board: board || pin.board.name
                  , user: username
                  , link: pin.link
                  , image: pin.images['237x'].url.replace('237x', '400x')
                };
            });
            debug('Got ' + media.length + ' items for user ' + username +
                (board ? ' and board ' + board : ''));
            callback(null, media);
        } catch (e) {
            debug('Failed to fetch media for user ' + username +
                (board ? ' and board ' + board : ''));
            return callback(new Error('Invalid response'));
        }
    });
};

