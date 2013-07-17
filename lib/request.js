var http = require('http')
  , https = require('https')
  , url = require('url')
  , qs = require('querystring')
  , debug = require('debug')('follower:request');

module.exports = Request;

/**
 * Make a request.
 *
 * @param {String|Object} options
 * @param {Function} callback
 */

function Request(options, callback) {
    if (typeof options === 'string') {
        options = { url: options };
    }
    var url_parts = url.parse(options.url)
      , protocol = url_parts.protocol === 'https:' ? https : http
      , method = options.method || 'GET'
      , complete;
    debug(method + ' ' + options.url);
    var request = protocol.request({
        method: method
      , hostname: url_parts.hostname
      , port: url_parts.port
      , path: url_parts.path
      , auth: options.auth
      , headers: options.headers || null
    }, function handleResponse(response) {
        debug(response.statusCode + ' ' + options.url);
        if (Math.floor(response.statusCode / 100) !== 2) {
            return finish(new Error(response.statusCode));
        }
        response.setEncoding('utf8');
        response.on('error', finish);
        response.body = '';
        response.on('data', function (chunk) {
            response.body += chunk;
        });
        response.on('end', function () {
            debug('Response for %s is "%s"', options.url, response.body || '');
            finish(null, response);
        });
    });
    request.on('error', finish);
    if (options.data) {
        request.write(options.data);
    }
    request.end();
    function finish(err) {
        if (!complete) {
            if (err) {
                debug('Error for %s is "%s"', options.url, err);
            }
            complete = true;
            callback.apply(null, arguments);
        }
    }
}

/**
 * Build a request URL.
 *
 * @param {String} url
 * @param {Object} query
 * @return {String}
 */

Request.build = function (url, query) {
    return url + '?' + qs.stringify(query);
};

/**
 * Make a request and parse the JSON response.
 *
 * @param {String|Object} options
 * @param {Function} callback
 */

Request.json = function (options, callback) {
    this(options, function (err, response) {
        if (err) {
            return callback(err);
        }
        var json;
        try {
            //Check for a JSONP response
            if (/^[a-zA-Z0-9_]+?\(/.test(response.body)) {
                json = JSON.parse(response.body.replace(/^[a-zA-Z0-9]+?\(/, '').replace(/\);?$/, ''));
            } else {
                json = JSON.parse(response.body);
            }
        } catch (e) {
            return callback(new Error('Invalid json response'));
        }
        if (!json) {
            return callback(new Error('No json data'));
        }
        callback(null, json);
    });
};

