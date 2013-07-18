var EventEmitter = require('events').EventEmitter
  , inherits = require('util').inherits
  , URLShares = require('./url_shares').URLShares
  , debug = require('debug')('follower:network:url_share_queue');

/**
 * Create a new URLShareQueue instance.
 *
 * @param {Object} options
 */

function URLShareQueue(options) {
    options = options || (options = {});
    if (!options.cache) {
        throw new Error('A cache is required');
    }
    this.url = new URLShares(options);
    this.cache = options.cache;
    this.ttl = (options.ttl || 600) * 1000;
    this.max_size = options.max_size || 180;
    this.fetch_delay = options.fetch_delay || 10;
    this.queue = [];
    debug('Queueing up to ' + this.max_size + ' urls');
    debug('Fetching every ' + this.fetch_delay + ' seconds');
    debug('Share counts are cached for ' + this.ttl + ' milliseconds');
    this.tick();
}

inherits(URLShareQueue, EventEmitter);

exports.URLShareQueue = URLShareQueue;

/**
 * Get share counts for the specified url.
 *
 * Note that this method will not fetch counts directly but rather
 * push the URL into a queue for processing.
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

URLShareQueue.prototype.count = function (url, callback) {
    var self = this;
    debug('Looking up counts for ' + url);
    this.getCachedShares(url, function (err, shares, timestamp) {
        if (err) return callback(err);
        if (!timestamp) {
            debug('Queueing ' + url + ' due to no data');
            self.add(url);
        } else if (timestamp + self.ttl < Date.now()) {
            debug('Queueing ' + url + ' due to stale data');
            self.add(url);
        }
        if (!shares) {
            debug('Returning zero shares temporarily for ' + url);
            callback(null, URLShares.zeroes);
        } else {
            debug(JSON.stringify(shares) + ' shares for ' + url);
            callback(null, shares);
        }
    });
};

/**
 * Save share counts for the specified url.
 *
 * @param {String} url
 * @param {Object} shares
 * @param {Function} callback
 */

URLShareQueue.prototype.saveShareCounts = function (url, shares, callback) {
    var key = this.getCacheKey(url);
    this.cache.set(key, JSON.stringify({
        shares: shares
      , timestamp: Date.now()
    }), function (err) {
        if (err) debug('Cache save error: %s', err);
        callback(err);
    });
};

/**
 * Get the cached share counts for a URL.
 *
 * @param {String} url
 * @param {Function} callback
 */

URLShareQueue.prototype.getCachedShares = function (url, callback) {
    var key = this.getCacheKey(url);
    this.cache.get(key, function (err, cached) {
        if (err) {
            debug('Cache lookup error: %s', err);
            return callback(err);
        }
        if (typeof cached !== 'undefined' && cached !== null) {
            try {
                cached = JSON.parse(cached);
                return callback(null, cached.shares, cached.timestamp);
            } catch (err) {
                debug('Cache lookup error when parsing JSON: %s', err);
                return callback(err);
            }
        }
        callback();
    });
};

/**
 * Get the cache key for a url.
 *
 * @param {String} url
 * @return {String} cache_key
 */

URLShareQueue.prototype.getCacheKey = function (url) {
    return 'follower.urlshares(' + url + ')';
};

/**
 * Add a URL to the fetch queue.
 *
 * @param {String} url
 */

URLShareQueue.prototype.add = function (url) {
    this.queue.push(url);
    if (this.queue.length > this.max_size) {
        debug('Queue is full, removing ' + this.queue.shift());
    }
};

/**
 * Poll the queue for new URLs and fetch periodically.
 */

URLShareQueue.prototype.tick = function () {
    if (!this.queue.length) {
        debug('Queue is empty. Going to sleep');
        return this.queueNextTick();
    }
    var url = this.queue.shift()
      , self = this;
    debug('Next item in the queue is ' + url);
    this.getCachedShares(url, function (err, shares, timestamp) {
        if (err) {
            self.emit('error', err);
            debug('Cache lookup error ' + url);
            return self.queueNextTick();
        }
        //If cached share counts are still fresh, skip this url
        if (timestamp && timestamp + self.ttl > Date.now()) {
            debug('Skipping due to fresh data ' + url);
            self.queueNextTick(true);
        } else {
            debug('Fetching new share counts for ' + url);
            //Otherwise fetch new share counts
            self.url.count(url, function (err, shares) {
                if (err) {
                    debug('Error on share count fetch: %s', err);
                    self.emit('error', err);
                    return self.queueNextTick();
                }
                self.emit('shares', url, shares);
                self.saveShareCounts(url, shares, function (err) {
                    if (err) self.emit('error', err);
                    debug('Saving ' + JSON.stringify(shares) + ' for ' + url);
                    self.queueNextTick();
                });
            });
        }
    });
};

/**
 * Queue the next tick.
 */

URLShareQueue.prototype.queueNextTick = function (immediate) {
    var tick = this.tick.bind(this);
    if (immediate) {
        return setImmediate(tick);
    }
    setTimeout(tick, this.fetch_delay * 1000);
};

