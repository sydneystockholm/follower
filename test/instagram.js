var lib_dir = process.env.JS_COV ? '../lib-cov/': '../lib/';

var Instagram = require(lib_dir + 'instagram').Instagram
  , request = require(lib_dir + 'request')
  , config = require('./config')
  , assert = require('assert');

var instagram = new Instagram(request, config.instagram_client_id, config.instagram_secret);

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
            instagram.followerCount('', function (err) {
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
            instagram.latestMedia('', function (err) {
                assert(err);
                done();
            });
        });

    });

    describe('#latestHashtagMedia', function () {

        it('should get the latest media for a hashtag', function (done) {
            instagram.latestHashtagMedia('yolo', function (err, media) {
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

    });

});

