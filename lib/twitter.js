/**
 * Create a new Twitter instance.
 *
 * @param {Request} request
 * @param {String} key (optional)
 * @param {String} secret (optional)
 */

function Twitter(request, key, secret) {
    this.request = request;
    this.key = key;
    this.secret = secret;
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
            return callback(new Error('Invalid response'));
        }
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
    url = this.request.build('https://cdn.api.twitter.com/1/urls/count.json', {
        url: url
    });
    this.request.json(url, function (err, url) {
        if (err) return callback(err);
        if (!('count' in url)) {
            return callback(new Error('Invalid response'));
        }
        callback(null, url.count);
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
        return callback(new Error('This function requires a Twitter key/secret'));
    }
    if (this.key in bearer_tokens) {
        return callback(null, bearer_tokens[this.key]);
    }
    this.request.json({
        method: 'POST'
      , auth: this.key + ':' + this.secret
      , url: 'https://api.twitter.com/oauth2/token'
      , data: 'grant_type=client_credentials'
    }, function (err, response) {
        if (err) return callback(err);
        try {
            callback(null, response.access_token);
        } catch (e) {
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
    var url = this.request.build('https://api.twitter.com/1.1/statuses/user_timeline.json', {
        screen_name: encodeURIComponent(username)
      , exclude_replies: 1
    });
    var self = this;
    this.bearerToken(function (err, token) {
        if (err) return callback(err);
        self.request.json({
            url: url
          , headers: { 'Authorization': 'Bearer ' + token }
        }, function (err, tweets) {
            if (err) return callback(err);
            try {
                callback(null, tweets.map(function (tweet) {
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
                }));
            } catch (e) {
                callback(new Error('Invalid response'));
            }
        });
    });
};

