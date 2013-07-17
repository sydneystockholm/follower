var http = require('http')
  , https = require('https')
  , url = require('url')
  , qs = require('querystring');

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
      , complete;
    var request = protocol.request({
        method: options.method || 'GET'
      , hostname: url_parts.hostname
      , port: url_parts.port
      , path: url_parts.path
      , headers: options.headers || null
    }, function handleResponse(response) {
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
            finish(null, response);
        });
    });
    request.on('error', finish);
    if (options.data) {
        request.write(options.data);
    }
    request.end();
    function finish() {
        if (!complete) {
            callback.apply(null, arguments);
        }
        complete = true;
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
 * @param {Object} options
 * @param {Function} callback
 */

Request.json = function (options, callback) {
    this(options, function (err, response) {
        if (err) {
            return callback(err);
        }
        var json;
        try {
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

