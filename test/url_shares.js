var lib_dir = process.env.JS_COV ? '../lib-cov/': '../lib/';

var URLShares = require(lib_dir + 'url_shares').URLShares
  , assert = require('assert');

var urlshares = new URLShares();

describe('URLShares', function () {

    describe('#count', function () {

        it('should get the # of shares a URL has, by network', function (done) {
            urlshares.count('http://facebook.com', function (err, shares) {
                assert.ifError(err);
                assert.equal(typeof shares, 'object');
                [ 'facebook_likes', 'twitter_tweets',
                  'pinterest_pins', 'google_plus_ones'
                ].forEach(function (count) {
                    assert.equal(typeof shares[count], 'number');
                    assert(shares[count] > 0);
                });
                done();
            });
        });

        it('should fail on an invalid url', function (done) {
            urlshares.count('!@(*#&!(@*#&!', function (err) {
                assert(err);
                done();
            });
        });

    });

});

