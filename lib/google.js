var request = require('./request')
  , Google = exports;

/**
 * Get the number of +1's associated with a URL.
 *
 * Example:
 *   Google.urlPlusOnes('http://google.com', function (err, plus_ones) {
 *       console.log(plus_ones); // => 123897
 *   });
 *
 * @param {String} url
 * @param {Function} callback
 */

Google.urlPlusOnes = function (url, callback) {
    if (!/\/$/.test(url)) {
        url += '/';
    }
    if (!/https?:\/\//.test(url)) {
        url = 'http://' + url;
    }
    request.json({
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
            callback(null, Math.floor(body[0].result.metadata.globalCounts.count));
        } catch (e) {
            callback(new Error('Invalid response'));
        }
    });
};

