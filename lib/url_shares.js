var Facebook = require('./facebook').Facebook
  , Google = require('./google').Google
  , Pinterest = require('./pinterest').Pinterest
  , Twitter = require('./twitter').Twitter;

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
 * Get share counts for a URL.
 *
 * Example:
 *   urlshares.count('http://google.com', function (err, shares) {
 *       console.log(shares);
 *   });
 *
 * Result:
 *   { facebook_likes
 *
 * @param {String} url
 * @param {Function} callback
 */

URLShares.prototype.count = function (url, callback) {
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
            return;
        }
        if (err) {
            complete = true;
            return callback(err, counts);
        }
        if (!--remaining) {
            complete = true;
            callback(null, counts);
        }
    }
};

