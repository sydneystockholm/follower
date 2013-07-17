var lib_dir = process.env.JS_COV ? '../lib-cov/': '../lib/';

var Instagram = require(lib_dir + 'instagram').Instagram
  , request = require(lib_dir + 'request')
  , assert = require('assert');

var instagram = new Instagram(request);

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

