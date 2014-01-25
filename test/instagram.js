var Instagram = require('../lib/instagram').Instagram
  , config = require('./config')
  , assert = require('assert');

var instagram = new Instagram({
    client_id: config.instagram_client_id
  , secret: config.instagram_secret
});

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
            instagram.latestMedia('eatingfoodbrb', function (err, media) {
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

