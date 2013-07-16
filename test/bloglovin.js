var lib_dir = process.env.JS_COV ? '../lib-cov/': '../lib/';

var bloglovin = require(lib_dir + 'bloglovin')
  , assert = require('assert');

describe('Bloglovin', function () {

    describe('#followerCount', function () {

        it('should get the # of followers a blog has', function (done) {
            bloglovin.followerCount(3668940, function (err, followers) {
                assert.ifError(err);
                assert(typeof followers === 'number');
                assert(followers > 0);
                done();
            });
        });

        it('should fail on invalid blog url', function (done) {
            bloglovin.followerCount(0, function (err) {
                assert(err);
                done();
            });
        });

    });

});

