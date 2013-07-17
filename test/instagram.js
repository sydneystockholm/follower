var lib_dir = process.env.JS_COV ? '../lib-cov/': '../lib/';

var instagram = require(lib_dir + 'instagram')
  , assert = require('assert');

describe('Instagram', function () {

    describe('#followerCount', function () {

        it('should get the # of followers a user has', function (done) {
            instagram.followerCount('chris6F', function (err, followers) {
                assert.ifError(err);
                assert(typeof followers === 'number');
                assert(followers > 0);
                done();
            });
        });

        it('should fail on an invalid username', function (done) {
            instagram.followerCount('19280qs98d0as98d', function (err) {
                assert(err);
                done();
            });
        });

    });

});

