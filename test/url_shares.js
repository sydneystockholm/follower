var URLShares = require('../lib/url_shares').URLShares
  , test = require('tape').test;

var urlshares = new URLShares();

test('should get the # of shares a URL has, by network', function (t) {
    urlshares.count('http://facebook.com', function (err, shares) {
        t.error(err);
        t.equal(typeof shares, 'object');
        var properties = ['facebook_likes', 'twitter_tweets',
                          'pinterest_pins', 'google_plus_ones'];
        t.looseEqual(properties, Object.keys(shares));
        properties.forEach(function(p) {
            t.equal(typeof shares[p], 'number');
        });
        t.end();
    });
});

test('should fail on an invalid url', function (t) {
    urlshares.count('!@(*#&!(@*#&!', function (err) {
        t.assert(err);
        t.end();
    });
});
