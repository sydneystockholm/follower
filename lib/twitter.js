var debug = require('debug')('follower:network:twitter')
  , request = require('./request');

/**
 * Create a new Twitter instance.
 *
 * @param {Object} options (optional)
 */

function Twitter(options) {
    options = options || (options = {});
    this.request = options.request || request;
    this.key = options.key;
    this.secret = options.secret;
    if (options.cache) {
        options.cache.memoise(this);
    }
}

exports.Twitter = Twitter;

/**
 * Get the number of followers a user has.
 *
 * Example:
 *   twitter.followerCount('chris6F', function (err, followers) {
 *       console.log(followers); // => 252
 *   });
 *
 * @param {String} username
 * @param {Function} callback
 */

Twitter.prototype.followerCount = function (username, callback) {
    var url = this.request.build('https://cdn.api.twitter.com/1/users/show.json', {
        screen_name: username
    });
    this.request.json(url, function (err, user) {
        if (err) return callback(err);
        if (!('followers_count' in user)) {
            debug('Failed to get follower count for %s', username);
            return callback(new Error('Invalid response'));
        }
        debug('%s followers for user %s', user.followers_count, username);
        callback(null, user.followers_count);
    });
};

/**
 * Get the number of tweets associated with a URL.
 *
 * Example:
 *   twitter.urlTweets('http://example.com', function (err, tweets) {
 *       console.log(tweets); // => 102938
 *   });
 *
 * @param {String} url
 * @param {String} callback
 */

Twitter.prototype.urlTweets = function (url, callback) {
    var url_ = this.request.build('https://cdn.api.twitter.com/1/urls/count.json', {
        url: url
    });
    this.request.json(url_, function (err, tweets) {
        if (err) return callback(err);
        if (!('count' in tweets)) {
            debug('Failed to get number of tweets for %s', url);
            return callback(new Error('Invalid response'));
        }
        debug('%s tweets for %s', tweets.count, url);
        callback(null, tweets.count);
    });
};

/**
 * Get a Twitter bearer token for use in application-only auth.
 *
 * @param {Function} callback
 */

var bearer_tokens = {};

Twitter.prototype.bearerToken = function (callback) {
    if (!this.key || !this.secret) {
        debug('Missing Twitter OAuth details');
        return callback(new Error('This function requires a Twitter key/secret'));
    }
    if (this.key in bearer_tokens) {
        debug('Using cached bearer token for key %s', this.key);
        return callback(null, bearer_tokens[this.key]);
    }
    var self = this;
    this.request.json({
        method: 'POST'
      , auth: this.key + ':' + this.secret
      , url: 'https://api.twitter.com/oauth2/token'
      , data: 'grant_type=client_credentials'
    }, function (err, response) {
        if (err) return callback(err);
        try {
            debug('Fetched bearer token successfully');
            bearer_tokens[self.key] = response.access_token;
            callback(null, response.access_token);
        } catch (e) {
            debug('Failed to get bearer token');
            callback(new Error('Invalid response'));
        }
    });
};

/**
 * Get the latest tweets from a user.
 *
 * Example:
 *   twitter.latestTweets('chris6f', function (err, tweets) {
 *       console.log(tweets);
 *   });
 *
 * Result:
 *   [ { id: '265609940738117632',
 *       text: 'Working out the office Melbourne Cup sweepstake with JS https://t.co/fsGA7kA0',
 *       date: Tue Nov 06 2012 11:21:59 GMT+1100 (EST),
 *       entities: { hashtags: [], symbols: [], urls: [ ... ], user_mentions: [] }
 *       user: 'chris6F' }
 *   , { id: '249413340022054912',
 *       text: 'Drool <a href="http://t.co/aeBB0zSn" target="_blank">http://t.co/aeBB0zSn</a>',
 *       date: Sat Sep 22 2012 17:42:29 GMT+1000 (EST),
 *       entities:
 *         { hashtags: [],
 *           symbols: [],
 *           urls: [],
 *           user_mentions: [],
 *           media: [ ... ] },
 *       user: 'chris6F' }
 *   , ... ]
 *
 * @param {String} username
 * @param {Function} callback
 */

Twitter.prototype.latestTweets = function (username, callback) {
    var self = this;
    this.bearerToken(function (err, token) {
        if (err) return callback(err);
        var url = self.request.build('https://api.twitter.com/1.1/statuses/user_timeline.json', {
            screen_name: encodeURIComponent(username)
          , exclude_replies: 1
        });
        self.request.json({
            url: url
          , headers: { 'Authorization': 'Bearer ' + token }
        }, function (err, tweets) {
            if (err) return callback(err);
            try {
                tweets = tweets.map(function (tweet) {
                    return self.normaliseTweet(tweet);
                });
                debug('Got %s tweets for user %s', tweets.length, username);
                callback(null, tweets);
            } catch (e) {
                debug('Failed to get tweets for user %s', username);
                callback(new Error('Invalid response'));
            }
        });
    });
};

/**
 * Get the latest tweets by #hashtag.
 *
 * Example:
 *   twitter.latestHashtagTweets('yolo', function (err, tweets) {
 *       console.log(tweets);
 *   });
 *
 * Result: same as `Twitter.latestTweets()`
 *
 * @param {String} hashtag
 * @param {Function} callback
 */

Twitter.prototype.latestHashtagTweets = function (hashtag, callback) {
    var self = this;
    this.bearerToken(function (err, token) {
        if (err) return callback(err);
        var url = self.request.build('https://api.twitter.com/1.1/search/tweets.json', {
            q: hashtag
          , include_entities: true
          , result_type: 'recent'
        });
        self.request.json({
            url: url
          , headers: { 'Authorization': 'Bearer ' + token }
        }, function (err, tweets) {
            if (err) return callback(err);
            try {
                tweets = tweets.statuses.map(function (tweet) {
                    return self.normaliseTweet(tweet);
                });
                debug('Got %s tweets for hashtag %s', tweets.length, hashtag);
                callback(null, tweets);
            } catch (e) {
                debug('Failed to get tweets for hashtag %s', hashtag);
                callback(new Error('Invalid response'));
            }
        });
    });
};

/**
 * Normalise an Twitter item.
 *
 * @param {Object} item
 * @return {Object}
 */

Twitter.prototype.normaliseTweet = function (tweet) {
    var text = tweet.text.replace(/http:\/\/[^ \t\r\n]+/g, function (url) {
        return '<a href="' + url + '" target="_blank">' + url + '</a>';
    }).replace(/@([a-zA-Z0-9_\-]+)/g, function (match, username) {
        return '<a href="http://twitter.com/' + username + '" target="_blank">' + match + '</a>';
    });
    return {
        id: tweet.id_str
      , text: text
      , date: new Date(tweet.created_at)
      , entities: tweet.entities
      , user: tweet.user.screen_name
    };
};

