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

    describe('#latestMedia', function () {

        it('should get the latest media from a user', function (done) {
            instagram.latestMedia('chris6F', function (err, media) {
                assert.ifError(err);
                assert(Array.isArray(media) && media.length);
                media.forEach(function (item) {
                    assert(item.id);
                    assert(item.type);
                    assert(item.link);
                    assert(typeof item.caption !== 'undefined');
                    assert(item.image);
                    assert(item.user);
                    assert(item.date.getTime() > 0);
                });
                done();
            });
        });

        it('should fail on an invalid username', function (done) {
            instagram.latestMedia('asdlkfajsdf90*9808', function (err) {
                assert(err);
                done();
            });
        });

    });

});

