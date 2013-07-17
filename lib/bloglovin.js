/**
 * Create a new Bloglovin instance.
 *
 * @param {Request} request
 */

function Bloglovin(request) {
    this.request = request;
}

exports.Bloglovin = Bloglovin;

/**
 * Get the number of bloglovin followers a blog has.
 *
 * @param {String} url
 * @param {String} callback
 */

Bloglovin.prototype.followerCount = function (url, callback) {
    url += '';
    if (url.indexOf('/') === -1) {
        url = 'http://www.bloglovin.com/blog/' + url;
    } else if (!/^http:\/\//.test(url)) {
        url = 'http://' + url;
    }
    this.request(url, function (err, response) {
        if (err) return callback(err);
        if (/<strong>([0-9 \r\t\n]+?)<\/strong>/.test(response.body)) {
            return callback(null, Number(RegExp.$1.replace(/ /g, '')));
        }
        callback(new Error('Invalid response'));
    });
};

