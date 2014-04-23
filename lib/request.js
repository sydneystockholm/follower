var http = require('http')
  , https = require('https')
  , url = require('url')
  , qs = require('querystring')
  , debug = require('debug')('follower:request');

module.exports = Request;

/**
 * Set the default user-agent.
 */

var user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_2) ' +
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.1916.47 Safari/537.36';

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
      , complete
      , timeout;
    debug('%s %s', method, options.url);
    timeout = setTimeout(function () {
        finish(new Error('Timed out after 60 seconds'));
    }, 60 * 1000);
    var request = protocol.request({
        method: method
      , hostname: url_parts.hostname
      , port: url_parts.port
      , path: url_parts.path
      , auth: options.auth
      , agent: false
      , headers: options.headers || {
            'Accept': '*/*'
          , 'User-Agent': options.user_agent || user_agent
        }
    }, function handleResponse(response) {
        debug('%s %s', response.statusCode, options.url);
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
            debug('Response for %s %s (%s):\n%s', method, options.url,
                response.statusCode, response.body);
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
            if (timeout) {
                clearTimeout(timeout);
            }
            if (err) {
                debug('Error for %s: %s', options.url, err);
            }
            complete = true;
            request.abort();
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
                debug('Detected a JSONP response');
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

