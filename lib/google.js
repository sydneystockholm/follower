var debug = require('debug')('follower:network:google')
  , request = require('./request');

/**
 * Create a new Google instance.
 *
 * @param {Object} options
 */

function Google(options) {
    options = options || (options = {});
    this.request = options.request || request;
    if (options.cache) {
        options.cache.memoise(this);
    }
}

exports.Google = Google;

/**
 * Get the number of +1's associated with a URL.
 *
 * Example:
 *   google.urlPlusOnes('http://google.com', function (err, plus_ones) {
 *       console.log(plus_ones); // => 123897
 *   });
 *
 * @param {String} url
 * @param {Function} callback
 */

Google.prototype.urlPlusOnes = function (url, callback) {
    if (!/\/$/.test(url)) {
        url += '/';
    }
    if (!/https?:\/\//.test(url)) {
        url = 'http://' + url;
    }
    this.request.json({
        method: 'POST'
      , url: 'https://clients6.google.com/rpc?key=AIzaSyCKSbrvQasunBoV16zDH9R33D88CeLr9gQ'
      , data: JSON.stringify([{
            method: 'pos.plusones.get'
          , id: 'p'
          , params: {
                nolog: true
              , id: url
              , source: 'widget'
              , userId: '@viewer'
              , groupId: '@self'
            }
          , jsonrpc: '2.0'
          , key: 'p'
          , apiVersion: 'v1'
        }])
    }, function (err, body) {
        if (err) return callback(err);
        try {
            var plus_ones = Math.floor(body[0].result.metadata.globalCounts.count);
            debug(plus_ones + ' plus ones for ' + url);
            callback(null, plus_ones);
        } catch (e) {
            debug('Failed to fetch plus ones for ' + url);
            callback(new Error('Invalid response'));
        }
    });
};

