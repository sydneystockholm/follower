var Facebook = require('./facebook').Facebook
  , Google = require('./google').Google
  , Pinterest = require('./pinterest').Pinterest
  , Twitter = require('./twitter').Twitter
  , debug = require('debug')('follower:network:url_shares');

/**
 * Create a new URLShares instance.
 *
 * @param {Object} options (optional)
 */

function URLShares(options) {
    this.facebook = new Facebook(options);
    this.google = new Google(options);
    this.pinterest = new Pinterest(options);
    this.twitter = new Twitter(options);
}

exports.URLShares = URLShares;

/**
 * Export the zero shares case.
 */

URLShares.zeroes = {
    facebook_likes: 0
  , pinterest_pins: 0
  , twitter_tweets: 0
  , google_plus_ones: 0
};

/**
 * Get share counts for a URL.
 *
 * Example:
 *   urlshares.count('http://google.com', function (err, shares) {
 *       console.log(shares);
 *   });
 *
 * Result:
 *   { facebook_likes: 789,
 *     pinterest_pins: 1169,
 *     twitter_tweets: 143,
 *     google_plus_ones: 1 }
 *
 * @param {String} url
 * @param {Function} callback
 */

URLShares.prototype.count = function (url, callback) {
    debug('Getting share counts for %s', url);
    var remaining = 4
      , complete = false
      , counts = {
            facebook_likes: null
          , twitter_tweets: null
          , pinterest_pins: null
          , google_plus_ones: null
        };
    this.facebook.urlLikes(url, function (err, likes) {
        if (err) return next(err);
        counts.facebook_likes = likes;
        next();
    });
    this.twitter.urlTweets(url, function (err, tweets) {
        if (err) return next(err);
        counts.twitter_tweets = tweets;
        next();
    });
    this.pinterest.urlPins(url, function (err, pins) {
        if (err) return next(err);
        counts.pinterest_pins = pins;
        next();
    });
    this.google.urlPlusOnes(url, function (err, plus_ones) {
        if (err) return next(err);
        counts.google_plus_ones = plus_ones;
        next();
    });
    function next(err) {
        if (complete) {
            if (err) {
                debug('Skipping error %s for url %s', err, url);
            }
            return;
        }
        if (err) {
            debug('Error %s for url %s. Partial counts were %j', err, url, counts);
            complete = true;
            return callback(err, counts);
        }
        if (!--remaining) {
            debug('%j shares for %s', counts, url);
            complete = true;
            callback(null, counts);
        }
    }
};

