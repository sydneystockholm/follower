var redis = require('redis')
  , debug = require('debug')('follower:cache');

/**
 * Create a new Cache instance.
 *
 * If no client is specified, a new Redis client is created with all arguments
 * passed to `redis.createClient([port [, host [, options]]])`. See
 * https://github.com/mranney/node_redis for more information.
 *
 * @param {Redis} client (optional)
 */

function Cache(client) {
    if (typeof client !== 'object') {
        client = redis.createClient.apply(redis, arguments);
    }
    this.client = client;
    this.ttl = 600;
}

exports.Cache = Cache;

/**
 * Save an item to the cache.
 *
 * @param {String} key
 * @param {String} value
 * @param {Number} ttl (optional) - in seconds
 * @param {Function} callback
 */

Cache.prototype.set = function (key, value, ttl, callback) {
    if (typeof ttl === 'function') {
        callback = ttl;
        return this.client.set(key, value, callback);
    }
    return this.client.setex(key, ttl, value, callback);
};

/**
 * Get an item from the cache.
 *
 * @param {String} key
 * @param {Function} callback
 */

Cache.prototype.get = function (key, callback) {
    this.client.get(key, callback);
};

/**
 * Memoise the results of all functions on the specified object's prototype.
 *
 * @param {Object} obj
 */

Cache.prototype.memoise = function (obj) {
    var proto = Object.getPrototypeOf(obj)
      , name = 'follower.' + (proto.constructor.name || '').toLowerCase();
    for (var key in obj) {
        if (proto.hasOwnProperty(key) && typeof obj[key] === 'function') {
            obj[key] = this.memoiseFunction(name + '.' + key, obj[key]);
        }
    }
};

/**
 * Set the TTL for memoised results.
 *
 * @param {Number} ttl - in seconds
 */

Cache.prototype.setTTL = function (ttl) {
    this.ttl = ttl;
};

/**
 * Memoise the result of a function.
 *
 * The function must be asynchronous and accept a callback as the last
 * argument. The callback must additionally be of the form (err, result).
 *
 * @param {String} name
 * @param {Function} fn
 */

Cache.prototype.memoiseFunction = function (name, fn) {
    var ttl = this.ttl
      , self = this;
    return function () {
        var args = Array.prototype.slice.call(arguments)
          , callback = args.pop()
          , hash = name + '(' + args.join(', ') + ')'
          , scope = this;

        //Check for a cached result
        debug('Looking up memoised result for %s', hash);
        self.get(hash, function (err, result) {
            if (err) {
                debug('Error on memoisation lookup: %s', err);
                return callback(err);
            }

            //Parse the JSON string
            if (typeof result !== 'undefined' && result !== null) {
                try {
                    debug('Got memoised result for %s: %s', hash, result);
                    return callback(null, JSON.parse(result));
                } catch (err) {
                    debug('Parse error on memoisation lookup: %s', err);
                    return callback(err);
                }
            }

            //If no memoised result is found, inject a replacement callback which
            //saves the result after calling the original function
            args.push(function (err, result) {
                if (err) {
                    return callback(err);
                }

                //Convert the result to JSON
                var result_str;
                try {
                    result_str = JSON.stringify(result);
                } catch (err) {
                    debug('Stringify error on memoisation: %s', err);
                    return callback(err);
                }

                //Save the result
                debug('Saving result for %s seconds %s: %s', ttl, hash, result_str);
                self.set(hash, result_str, ttl, function (err) {
                    if (err) {
                        debug('Error on memoisation save: %s', err);
                        return callback(err);
                    }
                    callback(null, result);
                });
            });

            //Call the original
            fn.apply(scope, args);
        });
    };
};

