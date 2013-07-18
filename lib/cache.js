var redis = require('redis');

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
 * Set the TTL for memoised results.
 *
 * @param {Number} ttl - in seconds
 */

Cache.prototype.setTTL = function (ttl) {
    this.ttl = ttl;
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
 * Memoise the result of a function.
 *
 * The function must be asynchronous and accept a callback as the last
 * argument. The callback must additionally be of the form (err, result).
 *
 * @param {String} name
 * @param {Function} fn
 */

Cache.prototype.memoiseFunction = function (name, fn) {
    var cache = this.client
      , ttl = this.ttl;
    return function () {
        var args = Array.prototype.slice.call(arguments)
          , callback = args.pop()
          , hash = name + '(' + args.join(', ') + ')'
          , scope = this;

        //Check for a cached result
        cache.get(hash, function (err, result) {
            if (err) {
                return callback(err);
            }

            //Parse the JSON string
            if (typeof result !== 'undefined' && result !== null) {
                try {
                    return callback(null, JSON.parse(result));
                } catch (err) {
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
                    return callback(err);
                }

                //Save the result
                cache.setex(hash, ttl, result_str, function (err) {
                    if (err) {
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

