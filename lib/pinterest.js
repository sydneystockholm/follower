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

