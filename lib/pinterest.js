var request = require('./request')
  , Pinterest = exports;

/**
 * Get the number of pins associated with a URL.
 *
 * Example:
 *   Pinterest.urlPins('http://example.com', function (err, pins) {
 *       console.log(pins); // => 102938
 *   });
 *
 * @param {String} url
 * @param {String} callback
 */

Pinterest.urlPins = function (url, callback) {
    url = request.build('http://partners-api.pinterest.com/v1/urls/count.json', {
        url: url
    });
    request.json(url, function (err, pins) {
        if (err) return callback(err);
        if (!('count' in pins)) {
            return callback(new Error('Invalid response'));
        }
        callback(null, pins.count);
    });
};

/**
 * Get the latest Pinterest media from a user.
 *
 * Example:
 *   TODO
 *
 * Result:
 *   TODO
 *
 * @param {String} username
 * @param {String} board (optional)
 * @param {Function} callback
 */

Pinterest.latestMedia = function (username, board, callback) {
    var url = 'http://api.pinterest.com/v3/pidgets';
    username = encodeURIComponent(username);
    if (typeof board === 'function') {
        callback = board;
        board = null;
        url += '/users/' + username;
    } else {
        url += '/boards/' + username + '/' + encodeURIComponent(board);
    }
    request.json(url + '/pins/', function (err, body) {
        if (err) return callback(err);
        try {
            callback(null, body.data.pins.map(function (pin) {
                return {
                    id: pin.id
                  , description: pin.description
                  , board: board || pin.board.name
                  , link: pin.link
                  , thumbnail: pin.images['237x'].url.replace('237x', '400x')
                };
            }));
        } catch (e) {
            return callback(new Error('Invalid response'));
        }
    });
};

